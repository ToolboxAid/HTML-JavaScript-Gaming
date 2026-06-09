import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";

const TOOL_ROUTE_SMOKE_CASES = [
  { heading: "Project Journey", route: "/tools/project-journey/index.html" },
  { heading: "Colors", route: "/tools/colors/index.html" },
  { heading: "Assets", route: "/tools/assets/index.html" },
  { heading: "Achievements", route: "/tools/achievements/index.html" },
  { heading: "Build Game", route: "/tools/build-game/index.html" },
  { heading: "Saved Data", route: "/tools/saved-data/index.html" },
  { heading: "Languages", route: "/tools/languages/index.html" },
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

test("toolbox index shows wireframe and beta tools while Planned remains opt-in", async ({ page }) => {
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
    await expect(page.locator("[data-toolbox-tool-name-link='AI Assistant']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Colors']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Fonts']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Assets']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Build Game']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Game Configuration']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Game Design']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Project Journey']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Project Workspace']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Publish']")).toHaveCount(0);

    await setServerSession(server, MOCK_DB_KEYS.users.admin);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-tool-name-link='Colors']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Colors']")).toHaveAttribute("href", "/toolbox/colors/index.html");
    await expect(page.locator("[data-toolbox-tool-name-link='Fonts']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Publish']")).toHaveCount(0);
    await page.locator("[data-toolbox-status-filter='planned']").click();
    await expect(page.locator("[data-toolbox-tool-name-link='Publish']")).toBeVisible();
    const colorsCard = page.locator("[data-toolbox-tool-name-link='Colors']").locator("xpath=ancestor::article[1]");
    await expect(colorsCard.locator("[data-toolbox-readiness]")).toHaveText("Complete");

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await server.close();
  }
});

test("toolbox status kickers, filters, card order, and voting controls work from registry metadata", async ({ page }) => {
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
      /Planned \(\d+\)/,
      /Wireframe \(\d+\)/,
      /Beta \(\d+\)/,
      /Complete \(\d+\)/,
    ]);
    await expect(page.locator("[data-toolbox-status-filter='planned']")).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-toolbox-status-filter='wireframe']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-toolbox-status-filter='complete']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-toolbox-status-filter='beta']")).toHaveAttribute("aria-pressed", "true");
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

    const wireframeCard = page.locator("[data-toolbox-tool-card='Build Game']");
    await expect(wireframeCard).toBeVisible();
    await expect(wireframeCard.locator("[data-toolbox-kicker]")).toHaveText("Wireframe");
    await expect(wireframeCard.locator("[data-toolbox-kicker]")).toHaveClass(/swatch-label/);
    await expect(wireframeCard.locator("[data-toolbox-kicker]")).toHaveAttribute(
      "title",
      "Preview the planned workflow and layout.\nHelp shape the design before development begins.",
    );
    await expect(wireframeCard.locator("[data-toolbox-tile-action-row='Build Game'] a.btn")).toHaveText("Open Tool");
    await expect(wireframeCard.locator("[data-toolbox-plan-details='Build Game']")).toContainText("Wireframe details");

    const actionOrder = await wireframeCard.locator("[data-toolbox-tile-action-row='Build Game']").evaluate((row) => (
      Array.from(row.children).map((child) => {
        if (child.tagName.toLowerCase() === "img") return "badge";
        if (child.tagName.toLowerCase() === "a") return child.textContent.trim();
        if (child.hasAttribute("data-toolbox-group-badge")) return "group";
        if (child.hasAttribute("data-toolbox-state-badge")) return "state";
        return child.tagName.toLowerCase();
      })
    ));
    expect(actionOrder).toEqual(["badge", "Open Tool", "group", "state"]);
    const bodyOrder = await wireframeCard.locator(".card-body").evaluate((body) => (
      Array.from(body.children).map((child) => {
        if (child.hasAttribute("data-toolbox-tile-action-row")) return "action";
        if (child.hasAttribute("data-toolbox-vote-controls")) return "feedback";
        if (child.hasAttribute("data-toolbox-plan-details")) return "plan-details";
        return child.tagName.toLowerCase();
      })
    ));
    expect(bodyOrder.slice(2, 5)).toEqual(["action", "feedback", "plan-details"]);

    const buildVotes = wireframeCard.locator("[data-toolbox-vote-controls='Build Game']");
    await expect(buildVotes).toBeVisible();
    const buildUpVote = buildVotes.locator("[data-toolbox-vote='up']");
    const buildDownVote = buildVotes.locator("[data-toolbox-vote='down']");
    await expect(buildUpVote).toHaveText("Up 0");
    await expect(buildDownVote).toHaveText("Down 0");
    await buildUpVote.click();
    await expect(buildUpVote).toHaveText("Up 1");
    await expect(buildUpVote).toHaveAttribute("aria-pressed", "true");
    await expect(buildDownVote).toHaveAttribute("aria-pressed", "false");
    await buildDownVote.click();
    await expect(buildUpVote).toHaveText("Up 0");
    await expect(buildUpVote).toHaveAttribute("aria-pressed", "false");
    await expect(buildDownVote).toHaveText("Down 1");
    await expect(buildDownVote).toHaveAttribute("aria-pressed", "true");
    await buildDownVote.click();
    await expect(buildDownVote).toHaveText("Down 1");
    await expect(buildDownVote).toHaveAttribute("aria-pressed", "true");

    await setServerSession(server, MOCK_DB_KEYS.users.admin);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-tool-card='Publish']")).toHaveCount(0);
    await page.locator("[data-toolbox-status-filter='planned']").click();
    const plannedCard = page.locator("[data-toolbox-tool-card='Publish']");
    await expect(plannedCard).toBeVisible();
    await expect(plannedCard.locator("[data-toolbox-kicker]")).toHaveText("Planned");
    await expect(plannedCard.locator("[data-toolbox-kicker]")).toHaveClass(/swatch-label/);
    await expect(plannedCard.locator("[data-toolbox-kicker]")).toHaveAttribute("title", "Idea exists.\nNot yet available.");
    await expect(plannedCard.locator("[data-toolbox-vote-controls='Publish']")).toBeVisible();
    await plannedCard.locator("[data-toolbox-vote-controls='Publish'] [data-toolbox-vote='up']").click();
    await expect(page.locator("[data-toolbox-launch-status]")).toHaveText("Publish up vote noted as a non-persistent planned control.");
    await plannedCard.locator("[data-toolbox-tile-action-row='Publish'] a.btn").click();
    await expect(page).toHaveURL(/\/toolbox\/index\.html$/);
    await expect(page.locator("[data-toolbox-launch-status]")).toContainText("Publish is planned.");

    const fontWireframeCard = page.locator("[data-toolbox-tool-card='Fonts']");
    await expect(fontWireframeCard.locator("[data-toolbox-kicker]")).toHaveText("Wireframe");
    await expect(fontWireframeCard.locator("[data-toolbox-kicker]")).toHaveAttribute(
      "title",
      "Preview the planned workflow and layout.\nHelp shape the design before development begins.",
    );
    await expect(fontWireframeCard.locator("[data-toolbox-vote-controls='Fonts']")).toBeVisible();
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
    await expect(designActionRow.locator("[data-toolbox-group-label='Design']")).toHaveCount(1);
    await expect(designActionRow.locator("[data-toolbox-state-badge='complete']")).toHaveCount(1);

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

test("wireframe-only pages expose left center right accordion controls without runtime wiring", async ({ page }) => {
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
    const cases = [
      { heading: "Achievements", route: "/toolbox/achievements/index.html", left: "Achievement Setup", center: "Achievement Board", right: "Validation" },
      { heading: "Build Game", route: "/toolbox/build-game/index.html", left: "Build Setup", center: "Publish Candidate Checklist", right: "Readiness" },
      { heading: "Saved Data", route: "/toolbox/saved-data/index.html", left: "Save Scope", center: "Save Slots", right: "Validation" },
      { heading: "Languages", route: "/toolbox/languages/index.html", left: "Localization Setup", center: "Translation Matrix", right: "Coverage" },
    ];

    for (const testCase of cases) {
      await page.goto(`${server.baseUrl}${testCase.route}`, { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { level: 1, name: testCase.heading })).toBeVisible();
      await expect(page.locator(".tool-workspace")).toBeVisible();
      await expect(page.locator("aside.tool-column").first().locator("summary", { hasText: testCase.left })).toBeVisible();
      await expect(page.locator(".tool-center-panel").locator("summary", { hasText: testCase.center })).toBeVisible();
      await expect(page.locator("aside.tool-column").last().locator("summary", { hasText: testCase.right })).toBeVisible();
      await expect(page.locator(".tool-center-panel details.vertical-accordion")).toHaveCount(3);
      await expect(page.locator("aside.tool-column").first().locator("select, input, textarea, button").first()).toBeVisible();
      await expect(page.getByText(/Static wireframe only|wireframe planning surface|wireframe controls|No runtime|not wired/i).first()).toBeVisible();
      const source = await page.evaluate(async () => {
        const response = await fetch(window.location.pathname);
        return response.text();
      });
      expect(source).not.toMatch(/<script(?![^>]+src=)[^>]*>/i);
      expect(source).not.toMatch(/<style[\s>]/i);
      expect(source).not.toMatch(/\son(?:click|change|input|submit|keydown|keyup|load)=/i);
    }

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await server.close();
  }
});

test("local dev port guard redirects human localhost pages to port 5501", async ({ page }) => {
  const server = await startRepoServer();
  try {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, "webdriver", {
        configurable: true,
        get: () => false,
      });
    });
    await page.route("http://127.0.0.1:5501/**", async (route) => {
      await route.fulfill({
        body: "<!doctype html><html><body><main>Port guard target</main></body></html>",
        contentType: "text/html",
        status: 200,
      });
    });
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/http:\/\/127\.0\.0\.1:5501\/toolbox\/index\.html$/);
  } finally {
    await server.close();
  }
});
