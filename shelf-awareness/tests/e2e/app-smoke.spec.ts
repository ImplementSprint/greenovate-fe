import { expect, test } from "@playwright/test";

test("login landing page renders stable login UI", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Admin Portal Login" }),
  ).toBeVisible();
  await expect(page.getByLabel("Employee ID")).toBeVisible();
});
