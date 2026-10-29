import { cert, getApps, initializeApp, App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { prisma } from "../config/prisma";
import { env } from "../config/env";

/**
 * FCM push (REQ-COURIER-02 / REQ-RT-03).
 * Uses Firebase Admin HTTP v1 via the messaging SDK.
 * No-ops (with a log) when the service account env vars are missing.
 */
let app: App | null = null;

function getFirebaseApp(): App | null {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApps()[0]!;
    return app;
  }

  const projectId = env.firebaseProjectId;
  const clientEmail = env.firebaseClientEmail;
  const privateKey = env.firebasePrivateKey;
  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    projectId,
  });
  return app;
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; data?: Record<string, string> }
): Promise<void> {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    console.log(
      `[fcm:skip] Firebase Admin not configured; user=${userId} title=${payload.title}`
    );
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true },
  });
  const token = user?.fcmToken?.trim();
  if (!token) {
    console.log(`[fcm:skip] no token for user=${userId}`);
    return;
  }

  try {
    await getMessaging(firebaseApp).send({
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
      android: {
        priority: "high",
      },
    });
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: unknown }).code)
        : "";
    // Stale / unregistered device tokens should not break order flows.
    if (
      code.includes("registration-token-not-registered") ||
      code.includes("invalid-registration-token") ||
      code.includes("messaging/registration-token-not-registered") ||
      code.includes("messaging/invalid-registration-token")
    ) {
      await prisma.user.update({
        where: { id: userId },
        data: { fcmToken: null },
      });
      console.log(`[fcm] cleared stale token for user=${userId}`);
      return;
    }
    console.error(`[fcm] send failed user=${userId}`, err);
  }
}
