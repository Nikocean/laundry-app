import { expect, type APIRequestContext, type Page } from "@playwright/test";

/** Local-only fixture defaults. In CI every E2E_* value must be provided via env. */
function e2eEnv(name: string, localDefault: string): string {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (process.env.CI) {
    throw new Error(`Missing required env ${name} for Playwright E2E in CI`);
  }
  return localDefault;
}

export const e2eCreds = {
  adminEmail: e2eEnv("E2E_ADMIN_EMAIL", "e2e.admin@laundry.test"),
  adminPassword: e2eEnv("E2E_ADMIN_PASSWORD", "E2eAdminPass123!"),
  customerEmail: e2eEnv("E2E_CUSTOMER_EMAIL", "e2e.customer@laundry.test"),
  customerPassword: e2eEnv("E2E_CUSTOMER_PASSWORD", "E2eCustomerPass123!"),
  courierEmail: e2eEnv("E2E_COURIER_EMAIL", "e2e.courier@laundry.test"),
  courierPassword: e2eEnv("E2E_COURIER_PASSWORD", "E2eCourierPass123!"),
};

export const backendURL = (
  process.env.E2E_BACKEND_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await expect(page.getByTestId("login-form")).toBeVisible();
  await page.getByTestId("login-email").fill(e2eCreds.adminEmail);
  await page.getByTestId("login-password").fill(e2eCreds.adminPassword);
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("nav-overview")).toBeVisible({
    timeout: 30_000,
  });
}

export async function backendLogin(
  request: APIRequestContext,
  email: string,
  password: string
) {
  const res = await request.post(`${backendURL}/api/auth/login`, {
    data: { email, password },
  });
  const body = await res.json();
  if (!res.ok()) {
    throw new Error(
      `Backend login failed (${res.status()}): ${JSON.stringify(body)}`
    );
  }
  return body as {
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; role: string };
  };
}

export async function createPendingOrder(request: APIRequestContext) {
  const { accessToken, user } = await backendLogin(
    request,
    e2eCreds.customerEmail,
    e2eCreds.customerPassword
  );

  const res = await request.post(`${backendURL}/api/orders`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      pickupAddress: `[E2E] Pickup ${Date.now()}`,
      deliveryAddress: `[E2E] Delivery ${Date.now()}`,
      items: [{ name: "E2E Kiloan", weightKg: 1.5, pricePerKg: 12000 }],
    },
  });
  const body = await res.json();
  if (!res.ok()) {
    throw new Error(
      `Create order failed (${res.status()}): ${JSON.stringify(body)}`
    );
  }
  return {
    order: body as { id: string; status: string; customerId: string },
    customerId: user.id,
  };
}
