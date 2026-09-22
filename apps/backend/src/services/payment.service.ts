import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { AppError } from "../utils/errors";

export type MidtransWebhookBody = {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  transaction_id?: string;
  payment_type?: string;
  fraud_status?: string;
};

function isSuccessfulPayment(
  transactionStatus: string | undefined,
  fraudStatus: string | undefined
): boolean {
  if (transactionStatus === "capture") {
    return fraudStatus === "accept" || fraudStatus === undefined;
  }
  return transactionStatus === "settlement";
}

/** Midtrans: SHA512(order_id + status_code + gross_amount + serverKey) */
export function verifyMidtransSignature(body: MidtransWebhookBody): boolean {
  if (!env.midtransServerKey) {
    throw new AppError(500, "MIDTRANS_SERVER_KEY is not configured");
  }
  const orderId = body.order_id ?? "";
  const statusCode = body.status_code ?? "";
  const grossAmount = body.gross_amount ?? "";
  const signatureKey = body.signature_key ?? "";
  if (!orderId || !statusCode || !grossAmount || !signatureKey) {
    return false;
  }
  const payload = `${orderId}${statusCode}${grossAmount}${env.midtransServerKey}`;
  const expected = crypto.createHash("sha512").update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signatureKey, "utf8")
    );
  } catch {
    return false;
  }
}

/**
 * POST /api/payments/webhook — no JWT; SHA-512 only (REQ-PAY-*).
 */
export async function handleMidtransWebhook(body: MidtransWebhookBody) {
  if (!verifyMidtransSignature(body)) {
    throw new AppError(401, "Invalid Midtrans signature");
  }

  const orderId = body.order_id as string;
  const transactionId = body.transaction_id?.trim() || null;
  const method = body.payment_type?.trim() || "midtrans";
  const grossAmount = body.gross_amount as string;

  if (!isSuccessfulPayment(body.transaction_status, body.fraud_status)) {
    return { ok: true, ignored: true, reason: body.transaction_status };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order) {
    throw new AppError(404, "Order not found");
  }

  // REQ-PAY-04: already paid for this transaction_id → idempotent
  if (
    order.payment &&
    order.payment.status === "paid" &&
    transactionId &&
    order.payment.transactionId === transactionId
  ) {
    return { ok: true, idempotent: true };
  }

  if (order.payment && order.payment.status === "paid") {
    return { ok: true, idempotent: true };
  }

  const amount = new Prisma.Decimal(grossAmount);
  const paidAt = new Date();

  await prisma.$transaction(async (tx) => {
    if (order.payment) {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: {
          status: "paid",
          paidAt,
          transactionId: transactionId ?? order.payment.transactionId,
          method,
          amount,
        },
      });
    } else {
      await tx.payment.create({
        data: {
          orderId: order.id,
          method,
          status: "paid",
          transactionId,
          amount,
          paidAt,
        },
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: "paid" },
    });

    await tx.notification.create({
      data: {
        userId: order.customerId,
        title: "Payment received",
        body: `Payment for order ${order.id} was successful.`,
        type: "payment_paid",
      },
    });
  });

  return { ok: true };
}
