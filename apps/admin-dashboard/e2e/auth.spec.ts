import { expect, test } from "@playwright/test";
import { e2eCreds, loginAsAdmin } from "./helpers";

test.describe("Admin auth (A1–A5)", () => {
  test("A1 login success lands on overview", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  });

  test("A2 bad password shows alert and stays on login", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email").fill(e2eCreds.adminEmail);
    await page.getByTestId("login-password").fill("wrong-password-!!!");
    await page.getByTestId("login-submit").click();

    await expect(page.getByTestId("login-error")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("nav-overview")).toHaveCount(0);
  });

  test("A3 non-admin credentials are rejected", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email").fill(e2eCreds.customerEmail);
    await page.getByTestId("login-password").fill(e2eCreds.customerPassword);
    await page.getByTestId("login-submit").click();

    await expect(page.getByTestId("login-error")).toContainText(/admin/i);
    await expect(page).toHaveURL(/\/login/);
  });

  test("A4 protected route redirects then returns via next", async ({
    page,
  }) => {
    await page.goto("/orders");
    await expect(page).toHaveURL(/\/login\?next=/);

    await page.getByTestId("login-email").fill(e2eCreds.adminEmail);
    await page.getByTestId("login-password").fill(e2eCreds.adminPassword);
    await page.getByTestId("login-submit").click();

    await expect(page).toHaveURL(/\/orders/);
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
  });

  test("A5 sign out clears session", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId("nav-sign-out").click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/orders");
    await expect(page).toHaveURL(/\/login/);
  });
});
