import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

async function openAchievementsPage(page) {
  const server = await startRepoServer();
  const failedRequests = [];
  const pageErrors = [];
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`FAILED ${request.url()}`);
  });
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/account/achievements.html`, { waitUntil: "networkidle" });
  return { failedRequests, pageErrors, server };
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("account achievements page switches Build Play Share views", async ({ page }) => {
  const { failedRequests, pageErrors, server } = await openAchievementsPage(page);

  try {
    await expect(page.getByRole("heading", { name: "Achievements" })).toBeVisible();
    await expect(page.locator("[data-achievements-tab='build']")).toBeVisible();
    await expect(page.locator("[data-achievements-tab='play']")).toBeVisible();
    await expect(page.locator("[data-achievements-tab='share']")).toBeVisible();
    await expect(page.locator("header.site-header")).toBeVisible();
    await expect(page.locator("footer.footer")).toBeVisible();
    await expect(page.locator(".side-menu").getByRole("link", { name: "Achievements" })).toBeVisible();
    await expect(page.locator("header.site-header a[data-route='account-achievements']")).toHaveAttribute("href", "../account/achievements.html");
    await expect(page.locator("footer.footer").getByRole("link", { name: "Achievements" })).toBeVisible();

    await expect(page.locator("[data-achievements-panel='build']")).toBeVisible();
    await expect(page.locator("[data-achievements-panel='play']")).toBeHidden();
    await expect(page.locator("[data-achievements-panel='share']")).toBeHidden();
    await expect(page.getByRole("heading", { name: "Created games" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open build" })).toBeVisible();

    await page.locator("[data-achievements-tab='play']").click();
    await expect(page.locator("[data-achievements-panel='build']")).toBeHidden();
    await expect(page.locator("[data-achievements-panel='play']")).toBeVisible();
    await expect(page.locator("[data-achievements-panel='share']")).toBeHidden();
    await expect(page.getByRole("heading", { name: "Played games" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Favorite" }).first()).toBeVisible();

    await page.locator("[data-achievements-tab='share']").click();
    await expect(page.locator("[data-achievements-panel='build']")).toBeHidden();
    await expect(page.locator("[data-achievements-panel='play']")).toBeHidden();
    await expect(page.locator("[data-achievements-panel='share']")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Creator share analytics" })).toBeVisible();
    await expect(page.getByText("Games I shared")).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy share link" })).toBeVisible();

    await page.locator("[data-achievements-tab='build']").click();
    await expect(page.locator("[data-achievements-panel='build']")).toBeVisible();
    await expect(page.locator("[data-achievements-panel='play']")).toBeHidden();
    await expect(page.locator("[data-achievements-panel='share']")).toBeHidden();

    const inactiveControls = await page.locator("main button").evaluateAll((buttons) => buttons
      .filter((button) => button.disabled || button.getAttribute("aria-disabled") === "true" || window.getComputedStyle(button).opacity !== "1")
      .map((button) => button.textContent.trim()));
    expect(inactiveControls).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("account achievements page keeps scripts and styles external", async () => {
  const pageSource = await fs.readFile(path.resolve("account/achievements.html"), "utf8");
  expect(pageSource).not.toMatch(/<style\b/i);
  expect(pageSource).not.toMatch(/<script\b(?![^>]+src=)/i);
  expect(pageSource).not.toMatch(/\son[a-z]+\s*=/i);
  expect(pageSource).not.toMatch(/\sstyle\s*=/i);
  expect(pageSource).toContain("../assets/theme-v2/js/account-achievements.js");
});
