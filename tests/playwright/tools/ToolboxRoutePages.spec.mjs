import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { getActiveToolRegistry } from "../../../toolbox/toolRegistry.js";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const TOOL_ROUTE_SMOKE_CASES = [
  { heading: "Project Journey", route: "/tools/project-journey/index.html" },
  { heading: "Colors", route: "/tools/colors/index.html" },
  { heading: "Assets", route: "/tools/assets/index.html" },
  { heading: "Achievements", route: "/tools/achievements/index.html" },
  { heading: "Build Game", route: "/tools/build-game/index.html" },
  { heading: "Saved Data", route: "/tools/saved-data/index.html" },
  { heading: "Languages", route: "/tools/languages/index.html" },
];
const REGISTRY_BY_ID = new Map(getActiveToolRegistry().map((tool) => [tool.id, tool]));

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

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
    await workspaceV2CoverageReporter.start(page);
    for (const { heading, route } of TOOL_ROUTE_SMOKE_CASES) {
      await page.goto(`${server.baseUrl}${route}`, { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      await expect(page.locator("main")).toBeVisible();
    }

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
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
    await workspaceV2CoverageReporter.start(page);
    await setServerSession(server, MOCK_DB_KEYS.users.user1);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-tool-name-link='AI Assistant']")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-tool-name-link='Colors']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Fonts']")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-tool-name-link='Assets']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Build Game']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Saved Data']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Languages']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Achievements']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Game Configuration']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Game Design']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Project Journey']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Project Workspace']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Publish']")).toHaveCount(0);

    await setServerSession(server, MOCK_DB_KEYS.users.admin);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-tool-name-link='Colors']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Colors']")).toHaveAttribute("href", "/toolbox/colors/index.html");
    await expect(page.locator("[data-toolbox-tool-name-link='Fonts']")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-tool-name-link='Publish']")).toHaveCount(0);
    await page.locator("[data-toolbox-status-filter='planned']").click();
    await expect(page.locator("[data-toolbox-tool-name-link='Publish']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Fonts']")).toBeVisible();
    const colorsCard = page.locator("[data-toolbox-tool-name-link='Colors']").locator("xpath=ancestor::article[1]");
    await expect(colorsCard.locator("[data-toolbox-readiness]")).toHaveText("Complete");

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
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
    await workspaceV2CoverageReporter.start(page);
    await setServerSession(server, MOCK_DB_KEYS.users.user1);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });

    await expect(page.locator("[data-toolbox-status-filter]")).toHaveText([
      "Planned (28)",
      "Wireframe (4)",
      "Beta (5)",
      "Complete (1)",
    ]);
    await expect(page.locator("[data-toolbox-status-filter='planned']")).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-toolbox-status-filter='wireframe']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-toolbox-status-filter='complete']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-toolbox-status-filter='beta']")).toHaveAttribute("aria-pressed", "true");
    const statusFilterTopPositions = await page.locator("[data-toolbox-status-filter]").evaluateAll((buttons) => (
      buttons.map((button) => Math.round(button.getBoundingClientRect().top))
    ));
    expect(new Set(statusFilterTopPositions).size).toBe(1);

    await page.locator("[data-tools-view='build-path']").click();
    await expect(page.locator("[data-toolbox-status-filter]")).toHaveText([
      "Planned (28)",
      "Wireframe (4)",
      "Beta (5)",
      "Complete (1)",
    ]);
    await expect(page.locator("[data-toolbox-status-filter='planned']")).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-toolbox-status-filter='wireframe']")).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-toolbox-status-filter='beta']")).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-toolbox-status-filter='complete']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-build-path-table='workflow'] th")).toHaveText(["Order", "Tool", "Status"]);
    await expect(page.locator("[data-build-path-tool='Colors']")).toBeVisible();
    await expect(page.locator("[data-build-path-tool='Colors']")).toHaveAttribute("data-build-path-release-channel", "complete");
    await expect(page.locator("[data-build-path-tool='Build Game']")).toHaveCount(0);
    await page.locator("[data-toolbox-status-filter='wireframe']").click();
    await expect(page.locator("[data-build-path-tool='Build Game']")).toBeVisible();
    await page.locator("[data-tools-order]").click();
    await expect(page.locator("[data-toolbox-status-filter='planned']")).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-toolbox-status-filter='wireframe']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-toolbox-status-filter='beta']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-toolbox-status-filter='complete']")).toHaveAttribute("aria-pressed", "true");

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
        return child.tagName.toLowerCase();
      })
    ));
    expect(actionOrder).toEqual(["badge", "Open Tool", "group"]);
    const bodyOrder = await wireframeCard.locator(".card-body").evaluate((body) => (
      Array.from(body.children).map((child) => {
        if (child.hasAttribute("data-toolbox-tile-action-row")) return "action";
        if (child.hasAttribute("data-toolbox-vote-controls")) return "feedback";
        if (child.hasAttribute("data-toolbox-plan-details")) return "plan-details";
        if (child.hasAttribute("data-toolbox-state-badge")) return "state";
        return child.tagName.toLowerCase();
      })
    ));
    expect(bodyOrder.slice(2, 6)).toEqual(["action", "feedback", "plan-details", "state"]);
    expect(bodyOrder.at(-1)).toBe("state");

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
    await expect(page.locator("[data-toolbox-launch-status]")).toHaveText("Build Game down vote recorded for Admin review.");

    await page.goto(`${server.baseUrl}/toolbox/index.html?view=group`, { waitUntil: "networkidle" });
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    const restoredBuildVotes = page.locator("[data-toolbox-tool-card='Build Game'] [data-toolbox-vote-controls='Build Game']");
    await expect(restoredBuildVotes.locator("[data-toolbox-vote='up']")).toHaveText("Up 0");
    await expect(restoredBuildVotes.locator("[data-toolbox-vote='down']")).toHaveText("Down 1");
    await expect(restoredBuildVotes.locator("[data-toolbox-vote='down']")).toHaveAttribute("aria-pressed", "true");

    await setServerSession(server, MOCK_DB_KEYS.users.user2);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    const userTwoBuildVotes = page.locator("[data-toolbox-tool-card='Build Game'] [data-toolbox-vote-controls='Build Game']");
    await userTwoBuildVotes.locator("[data-toolbox-vote='up']").click();
    await expect(userTwoBuildVotes.locator("[data-toolbox-vote='up']")).toHaveText("Up 1");
    await expect(userTwoBuildVotes.locator("[data-toolbox-vote='down']")).toHaveText("Down 1");
    await expect(userTwoBuildVotes.locator("[data-toolbox-vote='up']")).toHaveAttribute("aria-pressed", "true");

    await setServerSession(server, MOCK_DB_KEYS.users.user1);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    const userOneReturnedBuildVotes = page.locator("[data-toolbox-tool-card='Build Game'] [data-toolbox-vote-controls='Build Game']");
    await expect(userOneReturnedBuildVotes.locator("[data-toolbox-vote='up']")).toHaveText("Up 1");
    await expect(userOneReturnedBuildVotes.locator("[data-toolbox-vote='down']")).toHaveText("Down 1");
    await expect(userOneReturnedBuildVotes.locator("[data-toolbox-vote='down']")).toHaveAttribute("aria-pressed", "true");
    await userOneReturnedBuildVotes.locator("[data-toolbox-vote='up']").click();
    await expect(userOneReturnedBuildVotes.locator("[data-toolbox-vote='up']")).toHaveText("Up 2");
    await expect(userOneReturnedBuildVotes.locator("[data-toolbox-vote='down']")).toHaveText("Down 0");
    await expect(userOneReturnedBuildVotes.locator("[data-toolbox-vote='up']")).toHaveAttribute("aria-pressed", "true");

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
    await expect(page.locator("[data-toolbox-launch-status]")).toHaveText("Publish up vote recorded for Admin review.");
    await plannedCard.locator("[data-toolbox-tile-action-row='Publish'] a.btn").click();
    await expect(page).toHaveURL(/\/toolbox\/index\.html$/);
    await expect(page.locator("[data-toolbox-launch-status]")).toContainText("Publish is planned.");

    const plannedFontCard = page.locator("[data-toolbox-tool-card='Fonts']");
    await expect(plannedFontCard.locator("[data-toolbox-kicker]")).toHaveText("Planned");
    await expect(plannedFontCard.locator("[data-toolbox-kicker]")).toHaveAttribute("title", "Idea exists.\nNot yet available.");
    await expect(plannedFontCard.locator("[data-toolbox-vote-controls='Fonts']")).toBeVisible();
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
    await expect(page.locator("[data-toolbox-tool-card='Colors'] .card-body > :last-child")).toHaveAttribute("data-toolbox-state-badge", "complete");

    await page.goto(`${server.baseUrl}/admin/tool-votes.html`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: "Tool Votes" })).toBeVisible();
    await expect(page.locator("[data-toolbox-votes-status]")).toContainText("DavidQ");
    const adminBuildVoteRow = page.locator("[data-toolbox-votes-tool-id='build-game']");
    await expect(adminBuildVoteRow.locator("td").nth(5)).toHaveText("2");
    await expect(adminBuildVoteRow.locator("td").nth(6)).toHaveText("0");
    await expect(adminBuildVoteRow.locator("td").nth(7)).toHaveText("None");
    await adminBuildVoteRow.click();
    await expect(page.locator("[data-toolbox-votes-selected-order]")).not.toHaveText("None");
    await expect(page.locator("[data-toolbox-votes-selected-group]")).not.toHaveText("None");
    await expect(page.locator("[data-toolbox-votes-selected-path]")).toContainText("toolbox/build-game/index.html");
    await adminBuildVoteRow.locator("[data-toolbox-votes-order-input='build-game']").fill("7");
    await adminBuildVoteRow.locator("[data-toolbox-votes-order-input='build-game']").blur();
    await expect(page.locator("[data-toolbox-votes-status]")).toContainText("Build Game order updated to 7.");
    await expect(page.locator("[data-toolbox-votes-selected-order]")).toHaveText("7");
    await expect(page.locator("[data-toolbox-votes-tool-id='publish'] td").nth(5)).toHaveText("1");
    await expect(page.locator("[data-toolbox-votes-tool-id='publish'] td").nth(7)).toHaveText("up");
    await expect(page.locator("[data-route='admin-tool-votes']")).toHaveCount(1);
    const mockDbToolboxTables = await page.evaluate(async () => {
      const response = await fetch("/api/mock-db/snapshot");
      const payload = await response.json();
      return {
        voteOrders: payload.data.tables.toolbox_vote_order,
        votes: payload.data.tables.toolbox_votes,
      };
    });
    expect(mockDbToolboxTables.votes).toEqual(expect.arrayContaining([
      expect.objectContaining({
        direction: "up",
        toolId: "build-game",
        userKey: MOCK_DB_KEYS.users.user1,
      }),
      expect.objectContaining({
        direction: "up",
        toolId: "build-game",
        userKey: MOCK_DB_KEYS.users.user2,
      }),
    ]));
    expect(mockDbToolboxTables.voteOrders).toEqual(expect.arrayContaining([
      expect.objectContaining({
        order: 7,
        toolId: "build-game",
      }),
    ]));

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
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("toolbox Build Path status filters support multi-select registry-matched tool rows", async ({ page }) => {
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

  async function expectActiveFilters(activeChannels) {
    for (const releaseChannel of ["planned", "wireframe", "beta", "complete"]) {
      const filter = page.locator(`[data-toolbox-status-filter='${releaseChannel}']`);
      const active = activeChannels.includes(releaseChannel);
      await expect(filter).toHaveAttribute("aria-pressed", String(active));
      if (active) {
        await expect(filter).toHaveClass(/primary/);
      } else {
        await expect(filter).not.toHaveClass(/primary/);
      }
    }
  }

  async function expectBuildPathChannels(expectedChannels, expectedCount) {
    await expect(page.locator("[data-build-path-tool]")).toHaveCount(expectedCount);
    await expect(page.locator("[data-build-path-release-channel]")).toHaveCount(expectedCount);
    const releaseChannels = await page.locator("[data-build-path-release-channel]").evaluateAll((rows) => (
      rows.map((row) => row.getAttribute("data-build-path-release-channel"))
    ));
    expect(releaseChannels.every((releaseChannel) => expectedChannels.includes(releaseChannel))).toBe(true);
  }

  async function expectBuildPathOrder(toolTitle, expectedOrder) {
    await expect(page.locator(`[data-build-path-tool='${toolTitle}'] td`).first()).toHaveText(String(expectedOrder));
  }

  try {
    await workspaceV2CoverageReporter.start(page);
    await setServerSession(server, MOCK_DB_KEYS.users.user1);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-tools-order]")).toHaveClass(/primary/);
    await page.locator("[data-tools-sort='grouped']").click();
    await expect(page.locator("[data-tools-sort='grouped']")).toHaveClass(/primary/);
    await page.locator("[data-tools-view='build-path']").click();
    await expect(page.locator("[data-tools-view='build-path']")).toHaveClass(/primary/);
    await expect(page.locator("[data-tools-order]")).not.toHaveClass(/primary/);
    await expect(page.locator("[data-tools-sort='grouped']")).not.toHaveClass(/primary/);

    await expect(page.locator("[data-toolbox-status-filter]")).toHaveText([
      "Planned (28)",
      "Wireframe (4)",
      "Beta (5)",
      "Complete (1)",
    ]);
    await expectActiveFilters(["complete"]);
    await expect(page.locator("[data-build-path-tool='Colors']")).toBeVisible();
    await expectBuildPathChannels(["complete"], 1);
    await expectBuildPathOrder("Colors", REGISTRY_BY_ID.get("colors").order);

    await page.locator("[data-toolbox-status-filter='planned']").click();
    await expectActiveFilters(["planned", "complete"]);
    await expectBuildPathChannels(["planned", "complete"], 29);
    await expect(page.locator("[data-build-path-tool='AI Assistant']")).toBeVisible();
    await expectBuildPathOrder("AI Assistant", REGISTRY_BY_ID.get("ai-assistant").order);
    await expectBuildPathOrder("Colors", REGISTRY_BY_ID.get("colors").order);

    await page.locator("[data-toolbox-status-filter='complete']").click();
    await expectActiveFilters(["planned"]);
    await expectBuildPathChannels(["planned"], 28);
    await expect(page.locator("[data-build-path-tool='Colors']")).toHaveCount(0);
    await expect(page.locator("[data-build-path-tool='AI Assistant']")).toBeVisible();

    await page.locator("[data-toolbox-status-filter='wireframe']").click();
    await expectActiveFilters(["planned", "wireframe"]);
    await expectBuildPathChannels(["planned", "wireframe"], 32);
    await expect(page.locator("[data-build-path-tool='Build Game']")).toBeVisible();
    await expectBuildPathOrder("Build Game", REGISTRY_BY_ID.get("build-game").order);

    await page.locator("[data-toolbox-status-filter='beta']").click();
    await expectActiveFilters(["planned", "wireframe", "beta"]);
    await expectBuildPathChannels(["planned", "wireframe", "beta"], 37);

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Colors Picker Preview header controls update live and reset to defaults", async ({ page }) => {
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

  async function setSlider(selector, value) {
    await page.locator(selector).evaluate((input, nextValue) => {
      input.value = String(nextValue);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, value);
  }

  async function firstPreviewFill() {
    return page.locator("[data-palette-generator-preview-row]")
      .first()
      .locator("[data-palette-generator-swatch]")
      .first()
      .locator("rect")
      .getAttribute("fill");
  }

  try {
    await workspaceV2CoverageReporter.start(page);
    await setServerSession(server, MOCK_DB_KEYS.users.user1);
    await page.goto(`${server.baseUrl}/toolbox/colors/index.html`, { waitUntil: "networkidle" });

    const previewSummary = page.locator("[data-palette-preview-accordion] summary");
    const summaryOrder = await previewSummary.evaluate((summary) => (
      Array.from(summary.children).map((child) => {
        if (child.hasAttribute("data-palette-preview-controls")) return "preview-controls";
        if (child.querySelector("[data-palette-generator-preview-status]")) return "preview-status";
        return child.textContent.trim();
      })
    ));
    expect(summaryOrder).toEqual(["Picker Preview", "preview-controls", "preview-status"]);

    const previewControls = page.locator("[data-palette-preview-controls]");
    await expect(previewControls.locator("[data-palette-preview-hue]")).toBeVisible();
    await expect(previewControls.locator("[data-palette-preview-saturation]")).toBeVisible();
    await expect(previewControls.locator("[data-palette-preview-brightness]")).toBeVisible();
    await expect(previewControls.locator("[data-palette-preview-reset]")).toHaveText("Default");
    await expect(page.locator("[data-palette-preview-hue-value]")).toContainText("0");
    await expect(page.locator("[data-palette-preview-saturation-value]")).toHaveText("100%");
    await expect(page.locator("[data-palette-preview-brightness-value]")).toHaveText("100%");

    await expect(page.locator("[data-palette-generator-swatch]").first()).toBeVisible();
    const initialFill = await firstPreviewFill();
    await setSlider("[data-palette-preview-hue]", 45);
    await expect(page.locator("[data-palette-preview-hue-value]")).toContainText("+45");
    await expect.poll(firstPreviewFill).not.toBe(initialFill);
    const hueAdjustedFill = await firstPreviewFill();

    await setSlider("[data-palette-preview-saturation]", 50);
    await expect(page.locator("[data-palette-preview-saturation-value]")).toHaveText("50%");
    await expect.poll(firstPreviewFill).not.toBe(hueAdjustedFill);
    const saturationAdjustedFill = await firstPreviewFill();

    await setSlider("[data-palette-preview-brightness]", 75);
    await expect(page.locator("[data-palette-preview-brightness-value]")).toHaveText("75%");
    await expect.poll(firstPreviewFill).not.toBe(saturationAdjustedFill);

    await page.locator("[data-palette-preview-hue]").dblclick();
    await expect(page.locator("[data-palette-preview-hue-value]")).toContainText("0");

    await setSlider("[data-palette-preview-hue]", 90);
    await setSlider("[data-palette-preview-saturation]", 25);
    await setSlider("[data-palette-preview-brightness]", 125);
    await page.locator("[data-palette-preview-reset]").click();
    await expect(page.locator("[data-palette-preview-hue-value]")).toContainText("0");
    await expect(page.locator("[data-palette-preview-saturation-value]")).toHaveText("100%");
    await expect(page.locator("[data-palette-preview-brightness-value]")).toHaveText("100%");
    await expect(page.locator("[data-palette-preview-accordion]")).toHaveJSProperty("open", true);

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
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
    await workspaceV2CoverageReporter.start(page);
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
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("local dev port guard redirects human localhost pages to port 5501", async ({ page }) => {
  const server = await startRepoServer();
  try {
    await workspaceV2CoverageReporter.start(page);
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
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
