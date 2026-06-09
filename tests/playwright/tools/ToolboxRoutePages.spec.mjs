import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";

const TOOL_ROUTE_SMOKE_CASES = [
  { heading: "Project Journey", route: "/tools/project-journey/index.html" },
  { heading: "Colors", route: "/tools/colors/index.html" },
  { heading: "Assets", route: "/tools/assets/index.html" },
];

async function setServerSession(server, userKey) {
  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: "local-mem" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

test("tools route aliases render toolbox tool pages", async ({ page }) => {
  const server = await startRepoServer();
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];

  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`FAILED ${request.url()}`);
  });
  page.on("pageerror", (error) => {
    const text = error.stack || error.message;
    if (!isBrowserExtensionNoise(text)) {
      pageErrors.push(error.message);
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error" && !isBrowserExtensionNoise(message.text())) {
      consoleErrors.push(message.text());
    }
  });

  try {
    for (const { heading, route } of TOOL_ROUTE_SMOKE_CASES) {
      await page.goto(`${server.baseUrl}${route}`, { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      await expect(page.locator("main")).toBeVisible();
    }

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await server.close();
  }
});

test("toolbox index shows beta tools for creators and lets Admin reveal planned tools", async ({ page }) => {
  const server = await startRepoServer();
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];

  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`FAILED ${request.url()}`);
  });
  page.on("pageerror", (error) => {
    const text = error.stack || error.message;
    if (!isBrowserExtensionNoise(text)) {
      pageErrors.push(error.message);
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error" && !isBrowserExtensionNoise(message.text())) {
      consoleErrors.push(message.text());
    }
  });

  try {
    await setServerSession(server, MOCK_DB_KEYS.users.user1);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-tool-name-link='AI Assistant']")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-tool-name-link='Colors']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Fonts']")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-tool-name-link='Assets']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Game Configuration']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Game Design']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Project Journey']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Project Workspace']")).toBeVisible();

    await setServerSession(server, MOCK_DB_KEYS.users.admin);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-tool-name-link='Colors']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Colors']")).toHaveAttribute("href", "/toolbox/colors/index.html");
    await expect(page.locator("[data-toolbox-tool-name-link='Fonts']")).toHaveCount(0);
    await page.locator("[data-toolbox-status-filter='planned']").click();
    await expect(page.locator("[data-toolbox-tool-name-link='Fonts']")).toBeVisible();
    const colorsCard = page.locator("[data-toolbox-tool-name-link='Colors']").locator("xpath=ancestor::article[1]");
    await expect(colorsCard.locator("[data-toolbox-readiness]")).toHaveText("Complete");

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await server.close();
  }
});

test("toolbox status kickers, filters, planned mapping, and voting controls work from registry metadata", async ({ page }) => {
  const server = await startRepoServer();
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];

  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`FAILED ${request.url()}`);
  });
  page.on("pageerror", (error) => {
    const text = error.stack || error.message;
    if (!isBrowserExtensionNoise(text)) {
      pageErrors.push(error.message);
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error" && !isBrowserExtensionNoise(message.text())) {
      consoleErrors.push(message.text());
    }
  });

  try {
    await setServerSession(server, MOCK_DB_KEYS.users.user1);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });

    await expect(page.locator("[data-toolbox-status-filter]")).toHaveText([
      /Complete \(\d+\)/,
      /Beta \(\d+\)/,
      /Planned \(\d+\)/,
    ]);
    await expect(page.locator("[data-toolbox-status-filter='complete']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-toolbox-status-filter='beta']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-toolbox-status-filter='planned']")).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-toolbox-status-filter='wireframe']")).toHaveCount(0);
    const statusFilterTopPositions = await page.locator("[data-toolbox-status-filter]").evaluateAll((buttons) => (
      buttons.map((button) => Math.round(button.getBoundingClientRect().top))
    ));
    expect(new Set(statusFilterTopPositions).size).toBe(1);

    for (const toolName of ["Assets", "Game Configuration", "Game Design", "Project Journey", "Project Workspace"]) {
      const betaCard = page.locator(`[data-toolbox-tool-card='${toolName}']`);
      await expect(betaCard).toBeVisible();
      await expect(betaCard.locator("[data-toolbox-kicker]")).toHaveText("Beta");
      await expect(betaCard.locator("[data-toolbox-kicker]")).toHaveAttribute(
        "title",
        "Ready to try.\nFeatures, layout, and workflows may change based on feedback.",
      );
    }

    await expect(page.locator("[data-toolbox-tool-card='AI Assistant']")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("Wireframe");

    await expect(page.locator("[data-toolbox-tool-card='Build Game']")).toHaveCount(0);
    await page.locator("[data-toolbox-status-filter='planned']").click();
    await expect(page.locator("[data-toolbox-tool-card='Build Game']")).toHaveCount(0);

    await setServerSession(server, MOCK_DB_KEYS.users.admin);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-tool-card='Build Game']")).toHaveCount(0);
    await page.locator("[data-toolbox-status-filter='planned']").click();
    const plannedCard = page.locator("[data-toolbox-tool-card='Build Game']");
    await expect(plannedCard).toBeVisible();
    await expect(plannedCard.locator("[data-toolbox-kicker]")).toHaveText("Planned");
    await expect(plannedCard.locator("[data-toolbox-kicker]")).toHaveAttribute("title", "Idea exists.\nNot yet available.");
    await expect(plannedCard.locator("[data-toolbox-vote-controls='Build Game']")).toBeVisible();
    await plannedCard.getByRole("button", { name: "Up vote Build Game" }).click();
    await expect(page.locator("[data-toolbox-launch-status]")).toHaveText("Build Game up vote noted as a non-persistent planned control.");
    await plannedCard.locator("[data-toolbox-tile-action-row='Build Game'] a.btn").click();
    await expect(page).toHaveURL(/\/toolbox\/index\.html$/);
    await expect(page.locator("[data-toolbox-launch-status]")).toContainText("Build Game is planned.");

    const plannedFormerWireframeCard = page.locator("[data-toolbox-tool-card='Fonts']");
    await expect(plannedFormerWireframeCard.locator("[data-toolbox-kicker]")).toHaveText("Planned");
    await expect(plannedFormerWireframeCard.locator("[data-toolbox-kicker]")).toHaveAttribute(
      "title",
      "Idea exists.\nNot yet available.",
    );
    await expect(plannedFormerWireframeCard.locator("[data-toolbox-vote-controls='Fonts']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-card='Colors'] [data-toolbox-kicker]")).toHaveAttribute(
      "title",
      "Production ready and fully supported.",
    );

    const designGroupLabel = page.locator("[data-toolbox-group-label='Design']").first();
    await expect(designGroupLabel).toBeVisible();
    await expect(designGroupLabel).toHaveCSS("background-color", "rgb(255, 79, 139)");
    await expect(designGroupLabel).toHaveCSS("color", "rgb(255, 255, 255)");
    const designActionRow = page.locator("[data-toolbox-tile-action-row='Colors']");
    await expect(designActionRow.locator("[data-toolbox-group-label='Design']")).toHaveCSS("background-color", "rgb(255, 79, 139)");

    const toolboxSource = await page.evaluate(async () => {
      const response = await fetch("/toolbox/index.html");
      return response.text();
    });
    expect(toolboxSource).not.toMatch(/<script(?![^>]+src=)[^>]*>/i);
    expect(toolboxSource).not.toMatch(/<style[\s>]/i);
    expect(toolboxSource).not.toContain("onclick=");

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await server.close();
  }
});
