import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../../api/persistence/mock-db-store.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "build-path",
    surface: "toolbox build path SSoT",
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function openRepoPage(page, pathName) {
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

  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

async function setServerSession(server, userKey) {
  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: "local-db" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

async function fetchApiData(server, pathName) {
  const response = await fetch(`${server.baseUrl}${pathName}`, {
    headers: { "content-type": "application/json" },
  });
  const payload = await response.json();
  expect(response.ok, JSON.stringify(payload)).toBe(true);
  expect(payload.ok, JSON.stringify(payload)).toBe(true);
  return payload.data;
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests.filter((request) => !request.includes("game-foundry-mascot-sheet.png"))).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors.filter((message) => !message.includes("Failed to load resource: the server responded with a status of 404"))).toEqual([]);
}

async function buildPathRows(page) {
  return page.locator("[data-build-path-table='workflow'] tbody tr").evaluateAll((rows) => (
    rows.map((row) => ({
      group: row.dataset.buildPathGroup,
      metadataSource: row.dataset.buildPathMetadataSource,
      order: Number(row.children[0].textContent.trim()),
      path: row.dataset.buildPathPath,
      releaseChannel: row.dataset.buildPathReleaseChannel,
      status: row.dataset.buildPathStatus,
      tool: row.dataset.buildPathTool,
    }))
  ));
}

test("Toolbox removes Progress view and renders the DB-backed Build Path table", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html");

  try {
    await expect(page.getByRole("button", { name: "Progress" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Build Path" })).toBeVisible();

    await page.getByRole("button", { name: "Build Path" }).click();
    await expect(page.locator("[data-build-path-table='workflow']")).toBeVisible();
    await expect(page.locator("[data-build-path-table='workflow'] th")).toHaveText(["Order", "Tool", "Status"]);
    await expect(page.getByText("What should I do next? Game Configuration")).toBeVisible();
    await expect(page.getByText("Work top-to-bottom and left-to-right through the workflow table.")).toBeVisible();

    await expect(page.locator("[data-toolbox-status-filter]")).toHaveText([
      "Planned (27)",
      "Wireframe (4)",
      "Beta (6)",
      "Complete (3)",
      "Deprecated (1)",
    ]);
    const rows = await buildPathRows(page);
    expect(rows).toEqual([
      expect.objectContaining({
        metadataSource: "toolbox_tool_metadata",
        order: 1,
        releaseChannel: "complete",
        status: "Complete",
        tool: "Game Hub",
      }),
      expect.objectContaining({
        metadataSource: "toolbox_tool_metadata",
        order: 3,
        releaseChannel: "complete",
        status: "Complete",
        tool: "Colors",
      }),
    ]);

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Build Path preserves DB order across selected status filters", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html");

  try {
    await page.getByRole("button", { name: "Build Path" }).click();
    await page.locator("[data-toolbox-status-filter='beta']").click();

    const rows = await buildPathRows(page);
    expect(rows.map((row) => row.tool)).toEqual([
      "Game Hub",
      "Game Design",
      "Colors",
      "Message Studio",
      "Assets",
      "Game Configuration",
      "Objects",
      "Tags",
      "Game Journey",
      "Text To Speech",
    ]);
    expect(rows.map((row) => row.order)).toEqual([1, 2, 3, 3, 4, 5, 6, 13, 14, 38]);
    expect(rows.map((row) => row.releaseChannel)).toEqual(["complete", "beta", "complete", "beta", "beta", "beta", "beta", "beta", "beta", "beta"]);
    expect(rows.every((row) => row.metadataSource === "toolbox_tool_metadata")).toBe(true);

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Build Path tool names link to registered routes and render badge images", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html");

  try {
    await page.getByRole("button", { name: "Build Path" }).click();
    const rows = page.locator("[data-build-path-table='workflow'] tbody tr");
    await expect(rows).not.toHaveCount(0);

    const row = page.locator("[data-build-path-tool='Colors']");
    await expect(row).toHaveCount(1);
    const toolName = await row.getAttribute("data-build-path-tool");
    const registrySnapshot = await fetchApiData(failures.server, "/api/toolbox/registry/snapshot");
    const registryToolsByDisplayName = new Map(registrySnapshot.activeTools.map((tool) => [tool.displayName, tool]));
    const registryTool = registryToolsByDisplayName.get(toolName);
    expect(registryTool, `Registry entry missing for ${toolName}`).toBeTruthy();
    const route = registryTool.route;

    await expect(row.locator("[data-build-path-tool-link]")).toHaveText(toolName);
    await expect(row.locator("[data-build-path-tool-link]")).toHaveAttribute("data-registered-tool-route", route);
    await expect(row.locator("[data-build-path-tool-link]")).toHaveAttribute("href", "/" + route);
    await expect(row.locator("[data-build-path-badge]")).toHaveAttribute("src", registryTool.imageSources.badge);
    await expect(row.locator("[data-build-path-badge]")).toHaveAttribute("alt", toolName + " badge");
    await expect(row.locator("[data-tool-image-diagnostic]")).toHaveCount(0);

    await row.locator("[data-build-path-badge]").evaluate((image) => {
      image.dispatchEvent(new Event("error"));
    });
    await expect(row.locator("[data-build-path-badge]")).toHaveAttribute("src", registrySnapshot.imageFallback);
    await expect(row.locator("[data-tool-image-diagnostic]")).toContainText("Badge image missing; fallback shown.");

    await row.locator("[data-build-path-tool-link]").click();
    await page.waitForURL(/\/toolbox\/colors\/index\.html$/);
    await expect(page.locator(".page-title h1")).toHaveText("Colors");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Admin navigation exposes Tool Votes and removes Tools Progress", async ({ page }) => {
  const failures = await openRepoPage(page, "/index.html");

  try {
    await setServerSession(failures.server, MOCK_DB_KEYS.users.admin);
    await page.goto(`${failures.server.baseUrl}/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='admin']")).toHaveCount(1);
    await expect(page.locator("[data-toolbox-menu]").getByText("Admin", { exact: true })).toHaveCount(0);
    await expect(page.locator("nav.nav-links a[data-route='admin-tool-votes']")).toHaveText("Tool Votes");
    await expect(page.locator("nav.nav-links a[data-route='admin-tools-progress']")).toHaveCount(0);
    await expect(page.locator("nav.nav-links").getByText("Tools Progress", { exact: true })).toHaveCount(0);
    await expect(page.locator("nav.nav-links").getByText("Game Progress", { exact: true })).toHaveCount(0);

    await page.goto(`${failures.server.baseUrl}/admin/tool-votes.html`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Tool Votes" })).toBeVisible();
    await expect(page.locator("[data-toolbox-votes-status]")).toContainText("Showing Toolbox vote totals");
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("nav.nav-links").getByText("Tools Progress", { exact: true })).toHaveCount(0);
    await expect(page.locator("nav.nav-links").getByText("Game Progress", { exact: true })).toHaveCount(0);

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
