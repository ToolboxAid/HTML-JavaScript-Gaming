import { expect, test } from "@playwright/test";
import {
  applyToolRegistryMetadata,
  getActiveToolRegistry,
  toolRegistryMetadataDiagnostic
} from "../../../toolbox/toolRegistry.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const RESTORED_GROUPS = ["AI", "Audio", "Build/Create", "Design", "Marketplace", "Platform", "Play"];
const REPRESENTATIVE_GROUP_TOOLS = Object.freeze({
  "AI Assistant": ["AI", "tool-group-ai"],
  Audio: ["Audio", "tool-group-audio"],
  "Project Workspace": ["Build/Create", "tool-group-build"],
  "Game Design": ["Design", "tool-group-design"],
  Marketplace: ["Marketplace", "tool-group-marketplace"],
  Controls: ["Platform", "tool-group-platform"],
  "Game Testing": ["Play", "tool-group-play"]
});

const expectedTools = getActiveToolRegistry();

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "tools-progress",
    surface: "admin tools progress and toolbox color model"
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

function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function toolsProgressRows(page) {
  return page.locator("[data-tools-progress-body] tr").evaluateAll((rows) => (
    rows.map((row) => ({
      colorGroup: row.dataset.toolsProgressColorGroup,
      complete: row.dataset.toolsProgressComplete,
      group: row.dataset.toolsProgressGroup,
      order: Number(row.dataset.toolsProgressOrder),
      status: row.dataset.toolsProgressStatus,
      tool: row.dataset.toolsProgressTool
    }))
  ));
}

async function buildPathRows(page) {
  return page.locator("[data-build-path-table='workflow'] tbody tr").evaluateAll((rows) => (
    rows.map((row) => ({
      complete: row.dataset.buildPathComplete,
      order: Number(row.children[0].textContent.trim()),
      status: row.dataset.buildPathStatus,
      tool: row.dataset.buildPathTool
    }))
  ));
}

test("Admin Tools Progress hydrates every planned and active tool in build order", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/tools-progress.html");

  try {
    await expect(page.getByRole("heading", { name: "Tools Progress" })).toBeVisible();
    await expect(page.locator("[data-tools-progress-next]")).toContainText("What should I build next for the platform?");
    await expect(page.locator("[data-tools-progress-body] tr")).toHaveCount(expectedTools.length);
    await expect(page.locator("table[aria-label='Platform Tooling Progress'] th")).toHaveText([
      "Order",
      "Tool",
      "Group",
      "Status",
      "Complete"
    ]);

    const rows = await toolsProgressRows(page);
    expect(rows.map((row) => row.tool)).toEqual(expectedTools.map((tool) => tool.displayName));
    expect(rows.map((row) => row.order)).toEqual(expectedTools.map((tool) => tool.order));
    expect(rows.map((row) => row.status)).toEqual(expectedTools.map((tool) => tool.status));
    expect(rows.map((row) => row.complete)).toEqual(expectedTools.map((tool) => tool.readiness));
    expect(rows.map((row) => row.order)).toEqual([...rows.map((row) => row.order)].sort((left, right) => left - right));
    await expect(page.locator("[data-tools-progress-status-diagnostic]")).toHaveCount(0);
    await expect(page.locator("[data-tools-progress-summary]")).toContainText(`Tools Progress lists ${expectedTools.length}/${expectedTools.length}`);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Toolbox status cards consume Admin Tools Progress metadata", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/tools-progress.html");

  try {
    const adminRows = await toolsProgressRows(page);
    const statusByTool = new Map(adminRows.map((row) => [row.tool, row.status]));

    await page.goto(`${failures.server.baseUrl}/toolbox/index.html?role=admin`, { waitUntil: "networkidle" });
    for (const toolName of ["Project Workspace", "Game Configuration", "Build Game", "Cloud"]) {
      const card = page.locator("main .control-card").filter({
        has: page.locator("h3", { hasText: new RegExp(`^${toolName}$`) })
      }).first();
      await expect(card.locator("[data-toolbox-readiness]")).toHaveText(statusByTool.get(toolName));
    }
    await expect(page.locator("[data-toolbox-status-diagnostic]")).toHaveCount(0);

    await page.goto(`${failures.server.baseUrl}/toolbox/index.html?role=user`, { waitUntil: "networkidle" });
    const normalStatuses = await page.locator("[data-toolbox-readiness]").evaluateAll((statuses) => statuses.map((status) => status.textContent.trim()));
    expect(normalStatuses).toEqual(["Ready", "Ready", "Ready", "Ready"]);
    expect(normalStatuses.every((status) => status === "Ready")).toBe(true);
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Assets$/ }) })).toHaveCount(1);
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Configuration$/ }) })).toHaveCount(1);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Toolbox registry source reports missing metadata diagnostics", async () => {
  const missingTool = applyToolRegistryMetadata({
    active: true,
    displayName: "Missing Metadata Tool",
    id: "missing-metadata-tool",
    order: 999
  });

  expect(missingTool.missingStatusMetadata).toBe(true);
  expect(toolRegistryMetadataDiagnostic(missingTool)).toContain("Missing Toolbox registry metadata");
  expect(missingTool.status).toBe("Missing Metadata");
  expect(missingTool.readiness).toBe("No");
});

test("restored group colors propagate to Admin Tools Progress and Toolbox Group view", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/tools-progress.html");

  try {
    for (const [toolName, [group, colorGroup]] of Object.entries(REPRESENTATIVE_GROUP_TOOLS)) {
      const row = page.locator(`[data-tools-progress-tool='${toolName}']`);
      await expect(row).toHaveAttribute("data-tools-progress-group", group);
      await expect(row).toHaveAttribute("data-tools-progress-color-group", colorGroup);
      await expect(row).toHaveClass(new RegExp(`(^|\\s)${colorGroup}(\\s|$)`));
    }

    await page.goto(`${failures.server.baseUrl}/toolbox/index.html?role=admin`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Group" }).click();
    const groupLabels = await page.locator("[data-tools-accordion-list] details[data-tools-accordion]").evaluateAll((groups) => (
      groups.map((group) => group.dataset.toolsAccordion)
    ));
    expect(groupLabels).toEqual(RESTORED_GROUPS);

    for (const [toolName, [group, colorGroup]] of Object.entries(REPRESENTATIVE_GROUP_TOOLS)) {
      const card = page.locator(`[data-tools-accordion='${group}'] .control-card`).filter({
        has: page.locator("h3", { hasText: new RegExp(`^${toolName}$`) })
      }).first();
      await expect(card).toHaveClass(new RegExp(`(^|\\s)${colorGroup}(\\s|$)`));
      const borderColor = await card.evaluate((element) => getComputedStyle(element).borderColor);
      expect(borderColor).not.toBe("rgba(0, 0, 0, 0)");
    }

    await expect(page.locator("[data-toolbox-admin-nav-group]")).toHaveCount(0);
    await expect(page.locator("main").getByText("Arcade", { exact: true })).toHaveCount(0);
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.replace(/GameFoundryStudio/g, "").match(/\bStudio\b/g) || []).toEqual([]);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Project Build Path remains project-specific workflow order separate from Tools Progress", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html?role=user&memberRole=Audio%20Creator");

  try {
    await expect(page.getByRole("button", { name: "Progress" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Build Path" })).toBeVisible();
    await page.getByRole("button", { name: "Build Path" }).click();
    await expect(page.locator("[data-build-path-table='workflow']")).toBeVisible();
    await expect(page.locator("[data-build-path-table='workflow'] th")).toHaveText(["Order", "Tool", "Status", "Complete"]);
    await expect(page.getByText("What should I do next? Game Configuration")).toBeVisible();

    const rows = await buildPathRows(page);
    expect(rows.slice(0, 6).map((row) => row.tool)).toEqual([
      "Project Workspace",
      "Game Design",
      "Game Configuration",
      "Colors",
      "Controls",
      "Assets"
    ]);
    expect(rows.map((row) => row.order)).toEqual(rows.map((_, index) => index + 1));
    expect(rows.find((row) => row.tool === "Colors").complete).toBe("N/A");
    expect(rows.find((row) => row.tool === "Audio").complete).not.toBe("N/A");
    expect(rows.find((row) => row.tool === "Publish").complete).not.toBe("N/A");
    expect(rows.find((row) => row.tool === "Publish").status).not.toContain("N/A");

    await page.goto(`${failures.server.baseUrl}/admin/tools-progress.html`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Tools Progress" })).toBeVisible();
    await expect(page.locator("nav.nav-links").getByText("Project Progress", { exact: true })).toHaveCount(0);
    await expect(page.locator("nav.nav-links a[data-route='admin-tools-progress']")).toHaveText("Tools Progress");
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
