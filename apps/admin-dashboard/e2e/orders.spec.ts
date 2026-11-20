import { expect, test } from "@playwright/test";
import { createPendingOrder, loginAsAdmin } from "./helpers";

test.describe("Orders list (A6–A9, A13)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("A13 overview scaffold is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  });

  test("A6 orders page loads table without backend error", async ({
    page,
    request,
  }) => {
    await createPendingOrder(request);
    await page.goto("/orders");

    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Actions" })).toBeVisible();
  });

  test("A7 status filter narrows rows", async ({ page, request }) => {
    const { order } = await createPendingOrder(request);
    await page.goto("/orders");

    await page.getByTestId("orders-status-filter").selectOption("pending");
    await expect(page.getByTestId(`order-row-${order.id}`)).toBeVisible();

    await page.getByTestId("orders-status-filter").selectOption("delivered");
    await expect(page.getByTestId(`order-row-${order.id}`)).toHaveCount(0);
  });

  test("A8 customerId filter matches substring", async ({ page, request }) => {
    const { order, customerId } = await createPendingOrder(request);
    await page.goto("/orders");

    await page.getByTestId("orders-customer-filter").fill(customerId.slice(0, 8));
    await expect(page.getByTestId(`order-row-${order.id}`)).toBeVisible();

    await page.getByTestId("orders-customer-filter").fill("not-a-real-customer-id");
    await expect(page.getByTestId(`order-row-${order.id}`)).toHaveCount(0);
  });

  test("A9 socket indicator reaches connected", async ({ page }) => {
    await page.goto("/orders");
    await expect(page.getByTestId("orders-socket-state")).toContainText(
      "connected",
      { timeout: 20_000 }
    );
  });
});
