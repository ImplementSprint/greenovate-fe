import { expect, test } from "@playwright/test";

test("login landing page renders shelf awareness text", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByText("Shelf Awareness").first()).toBeVisible();
  await expect(
    page.getByText("Authorized Personnel Only"),
  ).toBeVisible();
});
