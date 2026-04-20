import { expect, test } from "@playwright/test";

test("discover flow", async ({ page }) => {
  await page.goto("/discover");
  await expect(page.getByRole("heading", { name: /前端相关岗位/ })).toBeVisible();

  await page.getByPlaceholder("React、Next.js、Design System...").fill("React");
  await page.getByRole("button", { name: /React 开发工程师|资深 React 工程师|前端工程师/ }).first().click();
  await expect(page.getByText("职位描述")).toBeVisible();

  await page.getByRole("button", { name: "收藏" }).first().click();
  await page.goto("/my-jobs");
  await expect(page.getByText("个人职位面板")).toBeVisible();
});
