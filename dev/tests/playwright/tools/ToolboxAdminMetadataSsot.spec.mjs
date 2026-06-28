import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../../api/persistence/mock-db-store.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const EXPECTED_TOOL_COUNT = 46;
const EXPECTED_VISIBLE_TOOL_COUNT = 45;
const REQUIRED_ADMIN_TOOLS = [
  "Environments",
  "Game Migration",
  "Platform Settings",
];
const REQUIRED_RESTORED_TOOLS = [
  "AI Command Center",
  "Creator Learning",
  "Game Crew",
];
const EXPECTED_SETUP_COMPACT_ORDER = [
  "Game Hub",
  "Game Design",
  "Colors",
  "Assets",
  "Game Configuration",
  "Objects",
  "Controls",
  "Hitboxes",
  "Events",
  "Saved Data",
  "Debug",
  "Game Testing",
  "Publish",
  "Tags",
  "Game Journey",
];
const INTENDED_SETUP_PATH_TOOLS = [
  "Game Hub",
  "Game Design",
  "Colors",
  "Assets",
  "Vector Asset Studio",
  "Game Configuration",
  "Objects",
  "Controls",
  "Hitboxes",
  "Events",
  "Saved Data",
  "Debug",
  "Game Testing",
  "Publish",
  "Tags",
  "Game Journey",
];
const SETUP_TOOL_RECORD_MAP = Object.freeze({
  "Vector Asset Studio": "Assets",
});
const TOOL_PLANNING_FIELDS = [
  "progressChecklist",
  "readiness",
  "requiredForPlayable",
  "requiredForPublish",
  "requiredForTestable",
  "requires",
];
const STATUS_VALUES = new Set(["planned", "wireframe", "beta", "complete", "deprecated"]);

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "toolbox-admin-metadata-ssot",
    surface: "Toolbox/Admin Tool Votes metadata SSoT",
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

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

async function fetchApiData(server, path, options = {}) {
  const response = await fetch(`${server.baseUrl}${path}`, {
    headers: { "content-type": "application/json" },
    ...options,
  });
  const payload = await response.json();
  expect(response.ok, JSON.stringify(payload)).toBe(true);
  expect(payload.ok, JSON.stringify(payload)).toBe(true);
  return payload.data;
}

function countByStatus(rows) {
  return rows.reduce((counts, row) => {
    const status = row.status || row.releaseChannel || "planned";
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
}

async function openTrackedPage(page, server, pathName) {
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
  return { consoleErrors, failedRequests, pageErrors };
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function activateBuildPathAllStatusFilters(page) {
  await page.getByRole("button", { name: "Build Path" }).click();
  for (const status of STATUS_VALUES) {
    const button = page.locator(`[data-toolbox-status-filter='${status}']`);
    if ((await button.getAttribute("aria-pressed")) !== "true") {
      await button.click();
    }
  }
}

test("Toolbox and Admin Tool Votes share the same DB-backed metadata and planning", async ({ page }) => {
  const server = await startRepoServer();
  await setServerSession(server, MOCK_DB_KEYS.users.admin);
  const failures = await openTrackedPage(page, server, "/admin/tool-votes.html");

  try {
    const snapshot = await fetchApiData(server, "/api/toolbox/votes/snapshot");
    const registrySnapshot = await fetchApiData(server, "/api/toolbox/registry/snapshot");
    const mockDbSnapshot = await fetchApiData(server, "/api/local-db/snapshot");
    expect(snapshot.rows).toHaveLength(EXPECTED_TOOL_COUNT);
    expect(registrySnapshot.activeTools).toHaveLength(EXPECTED_TOOL_COUNT);
    expect(registrySnapshot.toolboxContract).toEqual(expect.objectContaining({
      releaseChannels: ["planned", "wireframe", "beta", "complete", "deprecated"],
      defaultReleaseChannels: expect.objectContaining({
        buildPath: ["complete"],
        toolbox: ["wireframe", "beta", "complete"],
      }),
    }));
    expect(registrySnapshot.toolboxContract.releaseChannelHelpText).toEqual(expect.objectContaining({
      planned: expect.stringContaining("No meaningful UI."),
      wireframe: expect.stringContaining("Not functionally usable."),
      beta: expect.stringContaining("Can be used in a real game."),
      complete: expect.stringContaining("Ready for long-term support."),
      deprecated: expect.stringContaining("not recommended for new workflows."),
    }));
    expect(registrySnapshot.toolboxContract.groups).toEqual(expect.arrayContaining(["AI", "Build/Create", "Design", "Platform"]));
    expect(registrySnapshot.toolboxContract.toolboxGroupOrder).toEqual(expect.arrayContaining(["Create", "Build", "Content", "Admin"]));
    expect(registrySnapshot.toolboxContract.groupSwatches.Design).toBe("toolbox-group-design");
    expect(registrySnapshot.toolboxContract.releaseChannelSwatches.complete).toBe("swatch-green");
    expect(registrySnapshot.toolboxContract.releaseChannelSwatches.deprecated).toBe("swatch-purple");
    expect(registrySnapshot.toolboxContract.roleFocusTools.Designer).toEqual(expect.arrayContaining(["Game Hub", "Colors"]));
    expect(new Set(snapshot.rows.map((row) => row.toolKey || row.toolId)).size).toBe(EXPECTED_TOOL_COUNT);
    expect(mockDbSnapshot.schemas.toolbox_tool_metadata).not.toEqual(expect.arrayContaining(TOOL_PLANNING_FIELDS));
    expect(mockDbSnapshot.schemas.toolbox_tool_planning).toEqual(expect.arrayContaining(TOOL_PLANNING_FIELDS));
    expect(mockDbSnapshot.tables.toolbox_tool_metadata).toHaveLength(EXPECTED_TOOL_COUNT);
    expect(mockDbSnapshot.tables.toolbox_tool_planning).toHaveLength(EXPECTED_TOOL_COUNT);
    expect(mockDbSnapshot.tables.toolbox_tool_metadata.every((row) => (
      TOOL_PLANNING_FIELDS.every((field) => !Object.hasOwn(row, field))
    ))).toBe(true);
    expect(mockDbSnapshot.tables.toolbox_tool_planning.every((row) => row.toolKey)).toBe(true);
    const registryColors = registrySnapshot.activeTools.find((tool) => tool.id === "colors");
    expect(registryColors).toEqual(expect.objectContaining({
      planningSource: "toolbox_tool_planning",
      requiredForPublish: true,
      requiredForTestable: true,
    }));
    expect(Array.isArray(registryColors.progressChecklist)).toBe(true);
    expect(Array.isArray(registryColors.requires)).toBe(true);
    expect(registrySnapshot.activeTools.find((tool) => tool.id === "objects")).toEqual(expect.objectContaining({
      capabilityLabel: "Object types",
      childCapabilities: ["Static", "Dynamic", "Collectible", "Hazard", "Goal"],
      releaseChannel: "beta",
      status: "beta",
    }));
    expect(registrySnapshot.activeTools.find((tool) => tool.id === "controls")).toEqual(expect.objectContaining({
      path: "toolbox/controls/index.html",
      releaseChannel: "wireframe",
      status: "wireframe",
      visibleInToolsList: true,
    }));
    expect(registrySnapshot.activeTools.find((tool) => tool.id === "input-mapping-v2")).toEqual(expect.objectContaining({
      path: "toolbox/input-mapping-v2/index.html",
      releaseChannel: "deprecated",
      status: "deprecated",
      visibleInToolsList: false,
    }));
    expect(registrySnapshot.activeTools.find((tool) => tool.id === "users")).toEqual(expect.objectContaining({
      category: "Create",
      displayName: "Game Crew",
      releaseChannel: "planned",
      status: "planned",
      visibleInToolsList: true,
    }));

    for (const row of snapshot.rows) {
      expect(row.toolKey, row.toolName).toBeTruthy();
      expect(row.toolName, row.toolKey).toBeTruthy();
      expect(row.group, row.toolName).toBeTruthy();
      expect(row.path, row.toolName).toBeTruthy();
      expect(Number.isInteger(Number(row.order)), row.toolName).toBe(true);
      expect(STATUS_VALUES.has(row.status || row.releaseChannel), row.toolName).toBe(true);
    }

    const snapshotNames = snapshot.rows.map((row) => row.toolName).sort((left, right) => left.localeCompare(right));
    const visibleSnapshotRows = snapshot.rows.filter((row) => row.toolName !== "Input Mapping V2");
    const visibleSnapshotNames = visibleSnapshotRows.map((row) => row.toolName).sort((left, right) => left.localeCompare(right));
    expect(snapshotNames).toEqual(expect.arrayContaining([...REQUIRED_ADMIN_TOOLS, ...REQUIRED_RESTORED_TOOLS]));
    const counts = countByStatus(snapshot.rows);
    const visibleCounts = countByStatus(visibleSnapshotRows);
    expect(counts).toMatchObject({
      beta: 6,
      complete: 3,
      planned: 31,
      wireframe: 4,
      deprecated: 2,
    });
    const orderedSetupRows = snapshot.rows
      .filter((row) => EXPECTED_SETUP_COMPACT_ORDER.includes(row.toolName))
      .sort((left, right) => Number(left.order) - Number(right.order));
    expect(orderedSetupRows.map((row) => row.toolName)).toEqual(EXPECTED_SETUP_COMPACT_ORDER);
    const reconciledSetupRows = INTENDED_SETUP_PATH_TOOLS.map((toolName) => {
      const mappedToolName = SETUP_TOOL_RECORD_MAP[toolName] || toolName;
      return {
        mappedToolName,
        row: snapshot.rows.find((candidate) => candidate.toolName === mappedToolName),
        toolName,
      };
    });
    expect(reconciledSetupRows).toHaveLength(INTENDED_SETUP_PATH_TOOLS.length);
    expect(reconciledSetupRows.every(({ row }) => row)).toBe(true);
    expect(new Set(reconciledSetupRows.map(({ mappedToolName }) => mappedToolName)).size).toBe(EXPECTED_SETUP_COMPACT_ORDER.length);
    expect(reconciledSetupRows.find(({ toolName }) => toolName === "Vector Asset Studio")).toEqual(expect.objectContaining({
      mappedToolName: "Assets",
      row: expect.objectContaining({
        releaseChannel: "beta",
        toolName: "Assets",
      }),
    }));
    expect(reconciledSetupRows.every(({ row }) => STATUS_VALUES.has(row.status || row.releaseChannel))).toBe(true);
    expect(snapshot.rows.find((row) => row.toolName === "Vector Asset Studio")).toBeUndefined();
    expect(snapshot.rows.find((row) => row.toolName === "Build Game")).toEqual(expect.objectContaining({
      releaseChannel: "deprecated",
      status: "deprecated",
    }));
    expect(snapshot.rows.find((row) => row.toolName === "Input Mapping V2")).toEqual(expect.objectContaining({
      path: "toolbox/input-mapping-v2/index.html",
      releaseChannel: "deprecated",
      status: "deprecated",
    }));
    expect(snapshot.rows.find((row) => row.toolName === "Particles")).toEqual(expect.objectContaining({
      group: "Design",
    }));
    expect(snapshot.rows.find((row) => row.toolName === "MIDI")).toEqual(expect.objectContaining({
      group: "Audio",
    }));
    expect(snapshot.rows.find((row) => row.toolName === "Music")).toEqual(expect.objectContaining({
      group: "Audio",
    }));

    await expect(page.locator("[data-toolbox-votes-tool-id]")).toHaveCount(EXPECTED_TOOL_COUNT);
    await expect(page.locator("[data-toolbox-votes-state-help]")).toContainText("Beta: Functionally usable.");
    await expect(page.locator("[data-toolbox-votes-state='colors']")).toHaveAttribute("title", /Complete: Functionally usable/);
    const adminNames = (await page.locator("[data-toolbox-votes-tool-id]").evaluateAll((rows) => (
      rows.map((row) => row.children[0]?.textContent.trim() || "")
    ))).sort((left, right) => left.localeCompare(right));
    expect(adminNames).toEqual(snapshotNames);

    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await activateBuildPathAllStatusFilters(page);
    await expect(page.locator("[data-build-path-tool]")).toHaveCount(EXPECTED_VISIBLE_TOOL_COUNT);
    await expect(page.locator("[data-toolbox-status-filter]")).toHaveText([
      `Planned (${visibleCounts.planned})`,
      `Wireframe (${visibleCounts.wireframe})`,
      `Beta (${visibleCounts.beta})`,
      `Complete (${visibleCounts.complete})`,
      `Deprecated (${visibleCounts.deprecated})`,
    ]);
    await expect(page.locator("[data-toolbox-status-filter='beta']")).toHaveAttribute("title", /Can be used in a real game/);
    await expect(page.locator("[data-build-path-status-help='complete']").first()).toHaveAttribute("title", /Ready for long-term support/);
    const buildPathNames = (await page.locator("[data-build-path-tool]").evaluateAll((rows) => (
      rows.map((row) => row.dataset.buildPathTool || "")
    ))).sort((left, right) => left.localeCompare(right));
    expect(buildPathNames).toEqual(visibleSnapshotNames);

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Admin metadata edits update the same DB-backed metadata used by Toolbox after reload", async ({ page }) => {
  const server = await startRepoServer();
  await setServerSession(server, MOCK_DB_KEYS.users.admin);
  const failures = await openTrackedPage(page, server, "/admin/tool-votes.html");

  try {
    const initialSnapshot = await fetchApiData(server, "/api/toolbox/votes/snapshot");
    const initialToolIds = initialSnapshot.rows.map((row) => row.toolKey || row.toolId);
    const creatorLearningRow = page.locator("[data-toolbox-votes-tool-id='learn']");
    await expect(creatorLearningRow).toBeVisible();
    const groupSelect = creatorLearningRow.locator("[data-toolbox-votes-group='learn']");
    const nextGroup = (await groupSelect.inputValue()) === "Design" ? "AI" : "Design";
    await groupSelect.selectOption(nextGroup);
    await expect(page.locator("[data-toolbox-votes-status]")).toContainText(`Creator Learning group updated to ${nextGroup}`);

    const nextPath = "learn/index.html?metadata=ssot";
    const pathInput = page.locator("[data-toolbox-votes-path='learn']");
    await pathInput.fill(nextPath);
    await pathInput.dispatchEvent("change");
    await expect(page.locator("[data-toolbox-votes-status]")).toContainText("Creator Learning path updated");

    await creatorLearningRow.locator("[data-toolbox-votes-state='learn']").selectOption("beta");
    await expect(page.locator("[data-toolbox-votes-status]")).toContainText("Creator Learning state updated to Beta");

    const reorderedIds = ["learn", ...initialToolIds.filter((toolId) => toolId !== "learn")];
    await fetchApiData(server, "/api/toolbox/votes/order-list", {
      body: JSON.stringify({ toolIds: reorderedIds }),
      method: "POST",
    });

    const updatedSnapshot = await fetchApiData(server, "/api/toolbox/votes/snapshot");
    const creatorLearning = updatedSnapshot.rows.find((row) => (row.toolKey || row.toolId) === "learn");
    expect(creatorLearning).toEqual(expect.objectContaining({
      group: nextGroup,
      order: 1,
      path: nextPath,
      status: "beta",
      releaseChannel: "beta",
      toolName: "Creator Learning",
    }));
    const registrySnapshot = await fetchApiData(server, "/api/toolbox/registry/snapshot");
    const registryCreatorLearning = registrySnapshot.activeTools.find((tool) => tool.id === "learn");
    expect(registryCreatorLearning).toEqual(expect.objectContaining({
      category: nextGroup,
      order: 1,
      releaseChannel: "beta",
      route: nextPath,
    }));

    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Build Path" }).click();
    const betaFilter = page.locator("[data-toolbox-status-filter='beta']");
    if ((await betaFilter.getAttribute("aria-pressed")) !== "true") {
      await betaFilter.click();
    }
    const buildPathRow = page.locator("[data-build-path-tool='Creator Learning']");
    await expect(buildPathRow).toBeVisible();
    await expect(buildPathRow).toHaveAttribute("data-build-path-metadata-source", "toolbox_tool_metadata");
    await expect(buildPathRow).toHaveAttribute("data-build-path-release-channel", "beta");
    await expect(buildPathRow).toHaveAttribute("data-build-path-group", nextGroup);
    await expect(buildPathRow).toHaveAttribute("data-build-path-path", nextPath);
    await expect(buildPathRow.locator("td").first()).toHaveText("1");
    await expect(buildPathRow.locator("[data-build-path-tool-link='Creator Learning']")).toHaveAttribute(
      "href",
      /learn\/index\.html\?metadata=ssot$/,
    );

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Toolbox page does not own hardcoded tool count text", async () => {
  const server = await startRepoServer();

  try {
    const [html, script] = await Promise.all([
      fetch(`${server.baseUrl}/toolbox/index.html`).then((response) => response.text()),
      fetch(`${server.baseUrl}/toolbox/tools-page-accordions.js`).then((response) => response.text()),
    ]);
    expect(html).not.toMatch(/Planned \(\d+\)|Wireframe \(\d+\)|Beta \(\d+\)|Complete \(\d+\)/);
    expect(script).not.toMatch(/Planned \(\d+\)|Wireframe \(\d+\)|Beta \(\d+\)|Complete \(\d+\)/);
    expect(script).not.toMatch(/Tool Count: \d+\/\d+/);
  } finally {
    await server.close();
  }
});

test("Toolbox and Admin pages do not request the retired browser registry module", async ({ page }) => {
  const server = await startRepoServer();
  await setServerSession(server, MOCK_DB_KEYS.users.admin);
  const registryRequests = [];

  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/toolbox/toolRegistry.js") {
      registryRequests.push(request.url());
    }
  });

  try {
    await workspaceV2CoverageReporter.start(page);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await page.goto(`${server.baseUrl}/admin/tool-votes.html`, { waitUntil: "networkidle" });
    expect(registryRequests).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
