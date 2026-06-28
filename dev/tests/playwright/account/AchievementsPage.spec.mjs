import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { MOCK_DB_KEYS } from "../../../../api/persistence/mock-db-store.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

async function openAchievementsPage(page) {
  const server = await startRepoServer();
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`FAILED ${request.url()}`);
  });
  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: "local-db" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey: MOCK_DB_KEYS.users.user1 }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/account/achievements.html`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("account achievements page switches Build Play Share views", async ({ page }) => {
  const { consoleErrors, failedRequests, pageErrors, server } = await openAchievementsPage(page);

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
    await expect(page.locator("[data-account-side-nav-accordion='pages']")).toHaveAttribute("open", "");
    await expect(page.locator(".side-menu a")).toHaveText([
      "Account Home",
      "Achievements",
      "AI Credits",
      "Preferences",
      "Profile",
      "Security",
      "User Controls",
    ]);
    await expect(page.locator("header.site-header .nav-item").filter({ has: page.locator("> a[data-route='account']") }).locator(".sub-menu a")).toHaveText([
      "Account Home",
      "Achievements",
      "Logout",
      "Preferences",
      "Profile",
      "Security",
      "User Controls",
    ]);
    await expect(page.locator("footer.footer .footer__group").filter({ has: page.locator("#footer-account") }).locator(".footer__links a")).toHaveText([
      "Account Home",
      "Achievements",
      "Preferences",
      "Profile",
      "Security",
      "User Controls",
    ]);

    await expect(page.locator("[data-achievements-panel='build']")).toBeVisible();
    await expect(page.locator("[data-achievements-panel='build']")).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("[data-achievements-panel='play']")).toBeHidden();
    await expect(page.locator("[data-achievements-panel='play']")).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("[data-achievements-panel='share']")).toBeHidden();
    await expect(page.locator("[data-achievements-panel='share']")).toHaveAttribute("aria-hidden", "true");
    await expect(page.getByRole("heading", { name: "Created games" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Played games" })).toBeHidden();
    await expect(page.getByText("Games I shared")).toBeHidden();
    await expect(page.locator("[data-achievements-build-created-count]")).toHaveText("4");
    await expect(page.locator("[data-achievements-build-ready-count]")).toHaveText("0");
    await expect(page.locator("[data-achievements-build-status]")).toContainText("Game Hub game source");
    const buildRows = await page.locator("[data-achievements-build-rows] tr").evaluateAll((rows) => rows.map((row) => {
      const cells = Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent.trim());
      return {
        name: cells[0],
        rating: cells[3],
        stats: cells[2],
        status: cells[1],
      };
    }));
    expect(buildRows).toEqual([
      { name: "Demo Game", status: "Under Construction", stats: "Not tracked yet", rating: "Not tracked yet" },
      { name: "Gravity Demo", status: "Wireframe", stats: "Not tracked yet", rating: "Not tracked yet" },
      { name: "Collision Demo", status: "Wireframe", stats: "Not tracked yet", rating: "Not tracked yet" },
      { name: "Camera Follow Demo", status: "Wireframe", stats: "Not tracked yet", rating: "Not tracked yet" },
    ]);
    await expect(page.locator("[data-achievements-panel='build']")).not.toContainText("Sky Forge Sprint");
    await expect(page.locator("[data-achievements-panel='build']")).not.toContainText("Crystal Circuit");
    await expect(page.locator("[data-achievements-panel='build']")).not.toContainText("Moonlit Maze");
    await expect(page.locator("body")).not.toContainText("Sky Forge Sprint");
    await expect(page.locator("body")).not.toContainText("Crystal Circuit");
    await expect(page.locator("body")).not.toContainText("Moonlit Maze");
    await expect(page.getByRole("button", { name: "Open Demo Game" })).toBeVisible();

    await page.locator("[data-achievements-tab='play']").click();
    await expect(page.locator("[data-achievements-panel='build']")).toBeHidden();
    await expect(page.locator("[data-achievements-panel='play']")).toBeVisible();
    await expect(page.locator("[data-achievements-panel='share']")).toBeHidden();
    await expect(page.getByRole("heading", { name: "Created games" })).toBeHidden();
    await expect(page.getByRole("heading", { name: "Played games" })).toBeVisible();
    await expect(page.getByText("Games I shared")).toBeHidden();
    await expect(page.getByRole("button", { name: "Favorite" }).first()).toBeVisible();

    await page.locator("[data-achievements-tab='share']").click();
    await expect(page.locator("[data-achievements-panel='build']")).toBeHidden();
    await expect(page.locator("[data-achievements-panel='play']")).toBeHidden();
    await expect(page.locator("[data-achievements-panel='share']")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Created games" })).toBeHidden();
    await expect(page.getByRole("heading", { name: "Played games" })).toBeHidden();
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
    expect(consoleErrors).toEqual([]);
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
