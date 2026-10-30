import { expect, test } from "@playwright/test";
import { createPendingOrder, loginAsAdmin } from "./helpers";

test.describe("Assign courier (A10–A12)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("A10 assign pending order moves status to picked_up", async ({
    page,
    request,
  }) => {
    const { order } = await createPendingOrder(request);
    await page.goto("/orders");

    await page.getByTestId(`order-assign-${order.id}`).click();
    await expect(page.getByTestId("assign-dialog")).toBeVisible();

    const select = page.getByTestId("assign-courier-select");
    await expect
      .poll(async () => select.locator('option:not([value=""])').count(), {
        timeout: 15_000,
      })
      .toBeGreaterThan(0);

    const optionValues = await select.locator("option").evaluateAll((opts) =>
      opts
        .map((o) => (o as HTMLOptionElement).value)
        .filter((v) => v.length > 0)
    );
    await select.selectOption(optionValues[0]);

    await page.getByTestId("assign-submit").click();
    await expect(page.getByTestId("assign-dialog")).toHaveCount(0);

    const row = page.getByTestId(`order-row-${order.id}`);
    await expect(row).toHaveAttribute("data-status", "picked_up");
    await expect(page.getByTestId(`order-assign-${order.id}`)).toHaveCount(0);
  });

  test("A12 submit stays disabled until courier selected", async ({
    page,
    request,
  }) => {
    const { order } = await createPendingOrder(request);
    await page.goto("/orders");

    await page.getByTestId(`order-assign-${order.id}`).click();
    await expect(page.getByTestId("assign-dialog")).toBeVisible();
    await expect(page.getByTestId("assign-submit")).toBeDisabled();
  });
});
