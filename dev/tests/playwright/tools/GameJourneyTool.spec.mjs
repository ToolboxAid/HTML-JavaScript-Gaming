import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { createGameJourneyCompletionMetricsPostgresClientStub } from "../../helpers/gameJourneyCompletionMetricsPostgresClientStub.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";
import {
  GAME_JOURNEY_KEYS,
  GAME_JOURNEY_RECOMMENDED_TARGETS,
  GAME_JOURNEY_STATUS_BY_ID,
  GAME_JOURNEY_STATUSES,
  GAME_JOURNEY_TOOL_OWNERSHIP_AREAS,
  createGameJourneyMockRepository,
} from "../../../../api/persistence/tool-repositories/game-journey-mock-repository.js";
import { createGameJourneyCompletionMetricsStore } from "../../../../api/persistence/game-journey-completion-metrics-store.mjs";
import { MOCK_DB_KEYS, getStandaloneMockDbSeedTables } from "../../../../api/persistence/mock-db-store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../../..");
const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const standaloneSeedTables = getStandaloneMockDbSeedTables();

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "game-journey",
    surface: "Game Journey tool"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function openRepoPage(page, pathName, options = {}) {
  const gameJourneyCompletionMetricsPostgresClient = createGameJourneyCompletionMetricsPostgresClientStub();
  const server = await startRepoServer({
    gameJourneyCompletionMetricsPostgresClient,
  });
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
  const collectCoverage = options.collectCoverage !== false;
  const sessionUserKey = options.sessionUserKey === undefined ? MOCK_DB_KEYS.users.user1 : options.sessionUserKey;
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
  if (collectCoverage) {
    await workspaceV2CoverageReporter.start(page);
  }
  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: "local-db" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey: sessionUserKey || "" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  if (typeof options.beforeGoto === "function") {
    await options.beforeGoto({ server, sessionUserKey });
  }
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return {
    consoleErrors,
    failedRequests,
    gameJourneyCompletionMetricsPostgresClient,
    pageErrors,
    previousApiUrl,
    previousSiteUrl,
    server,
  };
}

async function fetchApiData(server, pathName, options = {}) {
  const response = await fetch(`${server.baseUrl}${pathName}`, {
    headers: options.body ? { "content-type": "application/json" } : undefined,
    ...options,
  });
  const payload = await response.json();
  expect(response.ok, JSON.stringify(payload)).toBe(true);
  expect(payload.ok).toBe(true);
  return payload.data;
}

async function replaceObjectsForActiveGame(server, objects) {
  const repositoryData = await fetchApiData(server, "/api/toolbox/objects/repositories", {
    body: JSON.stringify({ options: {} }),
    method: "POST",
  });
  const resultData = await fetchApiData(
    server,
    `/api/toolbox/objects/repositories/${repositoryData.repositoryId}/methods/replaceObjects`,
    {
      body: JSON.stringify({ args: [objects] }),
      method: "POST",
    },
  );
  return resultData.result;
}

function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

function statusLabels() {
  return GAME_JOURNEY_STATUSES.map((status) => `${status.icon} ${status.label}`);
}

function statusLabel(statusId) {
  const status = GAME_JOURNEY_STATUS_BY_ID[statusId];
  return status ? `${status.icon} ${status.label}` : statusId;
}

function restoreEnvValue(key, value) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}

function createFailingCompletionMetricsPostgresClient() {
  const failure = new Error("Active metrics store temporarily unavailable.");
  return {
    dumpTable() {
      return [];
    },
    async query() {
      throw failure;
    },
    async requestTable() {
      throw failure;
    },
  };
}

function expectStaticToolOwnershipAreas(areas) {
  expect(areas.map((area) => area.sectionName)).toEqual([
    "Idea",
    "Design",
    "Graphics",
    "Audio",
    "Objects",
    "Worlds",
    "Interface",
    "Controls",
    "Rules",
    "Progression",
    "Play Test",
    "Publish",
    "Share",
  ]);
  expect(areas.every((area) => area.sectionKey && area.ownershipArea && area.toolNames.length > 0)).toBe(true);
  expect(areas.flatMap((area) => area.toolNames)).toEqual(expect.arrayContaining([
    "Idea Board",
    "Game Design",
    "Assets",
    "Audio",
    "Objects",
    "Worlds",
    "Controls",
    "Events",
    "Game Journey",
    "Game Testing",
    "Publish",
    "Community",
  ]));
  expect(areas.flatMap((area) => Object.keys(area))).not.toEqual(expect.arrayContaining([
    "plannedCount",
    "completedCount",
    "percentComplete",
  ]));
}

async function visibleTreeStatuses(page) {
  return page.locator("[data-journey-item-button]").evaluateAll((buttons) =>
    buttons.map((button) => button.dataset.journeyItemStatus),
  );
}

async function expectTreeOnlyStatus(page, statusId, expectedCount) {
  const statuses = await visibleTreeStatuses(page);
  expect(statuses, `Note Tree should show ${expectedCount} ${statusId} row(s)`).toHaveLength(expectedCount);
  expect(statuses.every((status) => status === statusId), `Note Tree rows must all be ${statusId}`).toBe(true);
}

async function expectNoTreeRows(page) {
  await expect(page.locator("[data-journey-item-button]")).toHaveCount(0);
  await expect(page.locator("[data-journey-item-tree]")).toContainText("No journey items yet.");
}

async function expectFilteredSummaryRows(page, statusId, expectedRows) {
  const statusColumns = {
    "not-started": 2,
    blocker: 3,
    decide: 4,
    "in-progress": 5,
    complete: 6,
    skipped: 7,
  };
  const rows = await page.locator("[data-journey-summary-body] tr").evaluateAll((items) =>
    items
      .filter((row) => row.querySelector("[data-journey-note-button]"))
      .map((row) => Array.from(row.cells).map((cell) => cell.textContent.trim())),
  );
  expect(rows, `Summary rows for ${statusId}`).toHaveLength(expectedRows.length);
  expectedRows.forEach((expectedRow, index) => {
    const cells = rows[index];
    expect(cells[0]).toContain(expectedRow.name);
    Object.entries(statusColumns).forEach(([columnStatus, columnIndex]) => {
      expect(cells[columnIndex], `${expectedRow.name} ${columnStatus} count`).toBe(
        columnStatus === statusId ? String(expectedRow.count) : "0",
      );
    });
    expect(cells[8], `${expectedRow.name} Open count`).toBe(String(expectedRow.open));
    expect(cells[9], `${expectedRow.name} Total count`).toBe(String(expectedRow.total));
  });
}

test("Game Journey exposes static tool ownership areas without automatic counts", async () => {
  expectStaticToolOwnershipAreas(GAME_JOURNEY_TOOL_OWNERSHIP_AREAS);
  expect(GAME_JOURNEY_RECOMMENDED_TARGETS.map((target) => target.label)).toEqual([
    "Hero",
    "Enemy",
    "Boss",
    "Background",
    "Music",
  ]);

  const gameJourneyCompletionMetricsPostgresClient = createGameJourneyCompletionMetricsPostgresClientStub();
  const server = await startRepoServer({
    gameJourneyCompletionMetricsPostgresClient,
  });
  try {
    const constants = await fetchApiData(server, "/api/toolbox/game-journey/constants");
    expectStaticToolOwnershipAreas(constants.GAME_JOURNEY_TOOL_OWNERSHIP_AREAS);
    expect(constants.GAME_JOURNEY_RECOMMENDED_TARGETS.map((target) => target.label)).toEqual([
      "Hero",
      "Enemy",
      "Boss",
      "Background",
      "Music",
    ]);
  } finally {
    await server.close();
  }
});

test("Game Journey progress dashboard summarizes completion metrics", async ({ page }) => {
  const previousLocalDbPath = process.env.GAMEFOUNDRY_LOCAL_DB_PATH;
  const localDbPath = path.join(process.cwd(), "dev", "workspace", "tmp", "local-db", `game-journey-targets-${process.pid}-${Date.now()}.local-db-state`);
  process.env.GAMEFOUNDRY_LOCAL_DB_PATH = localDbPath;
  const gameJourneyCompletionMetricsPostgresClient = createGameJourneyCompletionMetricsPostgresClientStub();
  const server = await startRepoServer({
    gameJourneyCompletionMetricsPostgresClient,
  });
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];
  const recommendedTargetRequests = [];

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
  page.on("request", (request) => {
    const requestUrl = request.url();
    if (requestUrl.includes("/api/toolbox/game-journey/repositories/") && requestUrl.includes("/methods/updateRecommendedTarget")) {
      recommendedTargetRequests.push(request.postDataJSON());
    }
  });

  try {
    await workspaceV2CoverageReporter.start(page);
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
    await replaceObjectsForActiveGame(server, []);
    await page.goto(`${server.baseUrl}/toolbox/game-journey/index.html?game=demo-game`, { waitUntil: "networkidle" });

    await expect(page.locator("[data-journey-active-game]")).toHaveText("Active game: Demo Game.");
    await expect(page.locator("[data-journey-progress-dashboard]")).toBeVisible();
    await expect(page.locator("details > summary", { hasText: /^Journey Progress Dashboard$/ })).toHaveCount(1);
    await expect(page.locator("[data-journey-completion-metrics]")).toContainText("Journey progress: 0 of 66 planned items done (0%). 10 sections are active focus areas; 4 are planning context.");
    await expect(page.locator("[data-journey-overall-progress] .mini-stat")).toHaveText([
      "0%Overall",
      "0Done",
      "66Planned",
      "10Active Focus",
    ]);
    await expect(page.locator("[data-journey-section-progress] table")).toHaveAttribute("aria-label", "Game Journey section progress");
    await expect(page.locator("[data-journey-section-progress] th")).toHaveText([
      "Journey Area",
      "Planned",
      "Done",
      "Complete",
      "Focus",
    ]);
    await expect(page.locator("[data-journey-completion-bucket]")).toHaveCount(14);
    await expect(page.locator("[data-journey-completion-bucket='001-idea'] td")).toHaveText([
      "Idea",
      "4",
      "0",
      "0%",
      "Planning context",
    ]);
    await expect(page.getByRole("heading", { name: "Strongest Areas" })).toBeVisible();
    await expect(page.locator("[data-journey-most-complete-areas] li")).toHaveCount(3);
    await expect(page.locator("[data-journey-most-complete-areas] li").first()).toHaveText("Idea: 0% complete (0 of 4 planned)");
    await expect(page.getByRole("heading", { name: "Start Next" })).toBeVisible();
    await expect(page.locator("[data-journey-least-complete-areas] li")).toHaveCount(3);
    await expect(page.locator("[data-journey-least-complete-areas] li").first()).toHaveText("Idea: 0% complete (0 of 4 planned)");
    await expect(page.getByRole("heading", { name: "What To Do Next" })).toBeVisible();
    await expect(page.locator("[data-journey-completion-insights] li")).toHaveText([
      "Completion is low because no planned items are complete yet.",
      "4 sections are planning context, so they stay visible without counting as active focus areas.",
      "Idea is one of the most complete areas with 0 of 4 planned items complete.",
      "Idea needs attention: complete one planned item or adjust the planned count if the scope changed.",
      "Next focus: Create, Design, and Graphics. Complete one small item in each area before expanding the plan.",
      "Next action: mark one finished section item complete so overall progress can rise above 0%.",
    ]);
    await expect(page.locator("[data-journey-recommended-target]")).toHaveCount(5);
    const recommendedTargetOrder = await page.locator("[data-journey-recommended-target]").evaluateAll((rows) => (
      rows.map((row) => row.dataset.journeyRecommendedTarget)
    ));
    expect(recommendedTargetOrder).toEqual([
      "hero",
      "enemy",
      "boss",
      "background",
      "music",
    ]);
    await expect(page.locator("[data-journey-recommended-targets] th")).toHaveText(["Target", "Section", "Count"]);
    await expect(page.locator("[data-journey-recommended-target] td:first-child")).toHaveText([
      "Hero [1]",
      "Enemy [4]",
      "Boss [1]",
      "Background [3]",
      "Music [5]",
    ]);
    await expect(page.locator("[data-journey-recommended-target='hero'] td").nth(1)).toHaveText("Objects");
    await expect(page.locator("[data-journey-recommended-target='enemy'] td").nth(1)).toHaveText("Objects");
    await expect(page.locator("[data-journey-recommended-target='boss'] td").nth(1)).toHaveText("Objects");
    await expect(page.locator("[data-journey-recommended-target='background'] td").nth(1)).toHaveText("Graphics");
    await expect(page.locator("[data-journey-recommended-target='music'] td").nth(1)).toHaveText("Audio");
    await expect(page.locator("[data-journey-target-input='hero']")).toHaveValue("1");
    await expect(page.locator("[data-journey-target-input='enemy']")).toHaveValue("4");
    await expect(page.locator("[data-journey-target-input='boss']")).toHaveValue("1");
    await expect(page.locator("[data-journey-target-input='background']")).toHaveValue("3");
    await expect(page.locator("[data-journey-target-input='music']")).toHaveValue("5");
    await expect(page.locator("[data-journey-recommended-target] input[type='checkbox']")).toHaveCount(0);
    await expect(page.locator("[data-journey-target-input='hero']")).toHaveAttribute("type", "number");
    await expect(page.locator("[data-journey-target-input='hero']")).toHaveAttribute("inputmode", "numeric");
    await expect(page.locator("[data-journey-target-input='hero']")).toHaveAttribute("aria-label", "Hero count");
    await page.locator("[data-journey-target-input='hero']").fill("2");
    await expect(page.locator("[data-journey-target-status]")).toHaveText("Saved Hero target at 2.");
    await expect(page.locator("[data-journey-target-input='hero']")).toHaveValue("2");
    await expect(page.locator("[data-journey-target-count-preview='hero']")).toHaveText(" [2]");
    expect(recommendedTargetRequests).toHaveLength(1);
    expect(recommendedTargetRequests[0].args).toEqual(["hero", 2]);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-journey-target-input='hero']")).toHaveValue("2");
    await expect(page.locator("[data-journey-target-count-preview='hero']")).toHaveText(" [2]");
    const repositoryData = await fetchApiData(server, "/api/toolbox/game-journey/repositories", {
      body: JSON.stringify({ options: {} }),
      method: "POST",
    });
    const tablesData = await fetchApiData(server, `/api/toolbox/game-journey/repositories/${repositoryData.repositoryId}/methods/getTables`, {
      body: JSON.stringify({ args: [] }),
      method: "POST",
    });
    const persistedTarget = (tablesData.result.game_journey_items || []).find((item) =>
      item.linkedRecordType === "recommended-target" && item.linkedRecordId === "hero",
    );
    const objectsBucketNote = (tablesData.result.game_journey_notes || []).find((note) =>
      note.gameKey === GAME_JOURNEY_KEYS.game && note.name === "Objects",
    );
    expect(objectsBucketNote?.key).toMatch(ULID_PATTERN);
    expect(persistedTarget).toMatchObject({
      gameKey: GAME_JOURNEY_KEYS.game,
      noteKey: objectsBucketNote.key,
      order: 2,
      title: "Recommended target: Hero",
    });
    expect(JSON.parse(persistedTarget.userDetails)).toMatchObject({ suggestedCount: 2 });
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
    await fs.rm(localDbPath, { force: true });
    restoreEnvValue("GAMEFOUNDRY_LOCAL_DB_PATH", previousLocalDbPath);
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
  }
});

test("Game Journey reflects meaningful Objects readiness in Journey progress", async ({ page }) => {
  const reviewReadyObject = {
    details: {
      defaultValues: "speed=8",
      description: "Primary playable object for Product Owner review.",
      spriteReference: "sprite_journey_hero",
      tags: ["hero", "review"],
    },
    name: "Journey Hero",
    render: {
      assetKey: "sprite_journey_hero",
      previewPath: "projects/demo-game/sprites/journey-hero.png",
      type: "Sprite",
    },
    role: "Hero",
    state: "Active",
    traits: ["playerControlled", "movable"],
  };
  const failures = await openRepoPage(page, "/toolbox/game-journey/index.html?game=demo-game", {
    beforeGoto: async ({ server }) => {
      await replaceObjectsForActiveGame(server, [reviewReadyObject]);
    },
  });

  try {
    await expect(page.locator("[data-journey-active-game]")).toHaveText("Active game: Demo Game.");
    await expect(page.locator("details > summary", { hasText: /^Objects Stage Readiness$/ })).toHaveCount(1);
    await expect(page.locator("[data-journey-objects-readiness-status]")).toHaveText(
      "Objects readiness: 5 of 5 criteria complete. Product Owner review can start.",
    );
    await expect(page.locator("[data-journey-objects-readiness] tr")).toHaveCount(5);
    await expect(page.locator("[data-journey-objects-readiness] tr td:nth-child(2)")).toHaveText([
      "PASS",
      "PASS",
      "PASS",
      "PASS",
      "PASS",
    ]);
    await expect(page.locator("[data-journey-objects-review-checklist] li")).toHaveText([
      "Confirm the object list matches the current Game Hub game.",
      "Confirm each object name and type is understandable to a Creator.",
      "Confirm sprite, audio, and message references are resolved or intentionally empty.",
      "Confirm at least one meaningful player-facing object exists.",
      "Confirm Objects validation is clean before expanding later gameplay work.",
    ]);
    await expect(page.locator("[data-journey-completion-metrics]")).toContainText(
      "Journey progress: 5 of 66 planned items done (8%). 10 sections are active focus areas; 4 are planning context.",
    );
    await expect(page.locator("[data-journey-completion-bucket='006-objects'] td")).toHaveText([
      "Objects",
      "5",
      "5",
      "100%",
      "Active focus",
    ]);

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-journey-objects-readiness-status]")).toHaveText(
      "Objects readiness: 5 of 5 criteria complete. Product Owner review can start.",
    );
    await expect(page.locator("[data-journey-completion-bucket='006-objects'] td")).toHaveText([
      "Objects",
      "5",
      "5",
      "100%",
      "Active focus",
    ]);
    await expectNoPageFailures(failures);
  } finally {
    await replaceObjectsForActiveGame(failures.server, []);
    await closeWithCoverage(page, failures);
  }
});

async function closeWithCoverage(page, failures) {
  await workspaceV2CoverageReporter.stop(page);
  await failures.server.close();
  restoreEnvValue("GAMEFOUNDRY_API_URL", failures.previousApiUrl);
  restoreEnvValue("GAMEFOUNDRY_SITE_URL", failures.previousSiteUrl);
}

test("Game Journey summary table uses inline notes and item subtables", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-journey/index.html?game=demo-game");

  try {
    await expect(page.locator("details > summary", { hasText: /^Add Note$/ })).toHaveCount(0);
    await expect(page.locator("details > summary", { hasText: /^Selected Note Metadata$/ })).toHaveCount(0);
    await expect(page.locator("details > summary", { hasText: /^Note Tree$/ })).toHaveCount(0);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);

    const summaryTable = page.locator("[data-journey-summary-table]");
    await expect(summaryTable).toBeVisible();
    const headers = await summaryTable.locator("thead th").evaluateAll((cells) =>
      cells.map((cell) => cell.textContent.trim().replace(/\s+/g, " ")),
    );
    expect(headers).toEqual(expect.arrayContaining(["Name", "Type", "Owner", "Actions"]));
    expect(headers.at(-1)).toBe("Actions");

    const addNoteButton = page.locator("[data-journey-add-note]");
    await expect(addNoteButton).toBeVisible();
    const addNoteBelowTable = await addNoteButton.evaluate((button) => {
      const table = document.querySelector("[data-journey-summary-table]");
      return Boolean(table && table.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(addNoteBelowTable).toBe(true);

    const systemRow = page.locator(`[data-journey-summary-note-row="${GAME_JOURNEY_KEYS.notes.designPass}"]`);
    await expect(systemRow.locator("td").nth(2)).toHaveText("System-created");
    await expect(systemRow.locator("[data-journey-delete-note]")).toBeDisabled();
    await systemRow.locator("[data-journey-edit-note]").click();
    const systemEditRow = page.locator(`[data-journey-edit-note-row="${GAME_JOURNEY_KEYS.notes.designPass}"]`);
    await expect(systemEditRow.locator("[data-journey-note-name-input]")).toBeDisabled();
    await expect(systemEditRow.locator("[data-journey-note-type-select]")).toBeDisabled();
    await expect(page.locator(`[data-journey-note-tree-row="${GAME_JOURNEY_KEYS.notes.designPass}"] > td > [data-journey-item-tree] > .table-wrapper > table`)).toHaveAttribute("aria-label", "Selected note item subtable");

    await addNoteButton.click();
    const addRow = page.locator("[data-journey-add-note-row]");
    await expect(addRow).toBeVisible();
    await expect(page.locator("[data-journey-note-tree-row='new-note'] > td > [data-journey-item-tree] > .table-wrapper > table")).toHaveAttribute("aria-label", "Selected note item subtable");
    await addRow.locator("[data-journey-new-note-name]").fill("Usability Audit");
    await addRow.locator("[data-journey-new-note-type]").selectOption(GAME_JOURNEY_KEYS.noteTypes.task);
    await addRow.locator("[data-journey-save-new-note]").click();
    await expect(page.locator("[data-journey-note-status]")).toContainText("Added Usability Audit");

    const userRow = page.locator("[data-journey-summary-note-row]", { hasText: "Usability Audit" });
    await expect(userRow.locator("td").nth(1)).toHaveText("Task");
    await expect(userRow.locator("td").nth(2)).toHaveText("You");
    await expect(userRow.locator("td").last()).toContainText("Edit");
    await expect(userRow.locator("td").last()).toContainText("Delete");
    await expect(userRow.locator("[data-journey-delete-note]")).toBeEnabled();

    await userRow.locator("[data-journey-edit-note]").click();
    const userEditRow = page.locator("[data-journey-edit-note-row]", { hasText: "Task" });
    await expect(userEditRow.locator("[data-journey-note-name-input]")).toHaveValue("Usability Audit");
    await userEditRow.locator("[data-journey-note-name-input]").fill("Usability Audit Updated");
    await userEditRow.locator("[data-journey-save-note]").click();
    await expect(page.locator("[data-journey-note-status]")).toContainText("Saved Usability Audit Updated");
    await expect(page.locator("[data-journey-summary-note-row]", { hasText: "Usability Audit Updated" })).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("[data-journey-summary-note-row]", { hasText: "Usability Audit Updated" }).locator("[data-journey-delete-note]").click();
    await expect(page.locator("[data-journey-note-status]")).toHaveText("Deleted user-created note.");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Usability Audit Updated");

    await expect(page.locator("[data-journey-progress-dashboard]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "What To Do Next" })).toBeVisible();
    await expect(page.locator("[data-journey-recommended-target='hero']")).toBeVisible();
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Game Journey edits rows and updates note summary counts live", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-journey/index.html?game=demo-game");

  try {
    await expect(page.locator("h1")).toHaveText("Game Journey");
    await expect(page.locator(".tool-workspace--wide")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-journey-active-game]")).toHaveText("Active game: Demo Game.");
    await expect(page.locator("[data-journey-selected-note]")).toContainText("Palette and Input Density");
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for selected note: Palette and Input Density.");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("3");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("3");
    await expect(page.locator("[data-journey-stat-not-started]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-in-progress]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-decide]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-skipped]")).toHaveText("0");
    await expect(page.locator("[data-journey-completion-metrics]")).toContainText("Journey progress: 0 of 66 planned items done (0%). 10 sections are active focus areas; 4 are planning context.");
    await expect(page.locator("[data-journey-completion-bucket]")).toHaveCount(14);
    await expect(page.locator("[data-journey-completion-bucket='001-idea'] td")).toHaveText([
      "Idea",
      "4",
      "0",
      "0%",
      "Planning context",
    ]);
    await expect(page.locator("[data-journey-filter='all']")).toHaveClass(/primary/);
    await expect(page.locator("[data-journey-filter='all']")).toHaveAttribute("aria-current", "true");
    await expect(page.locator("[data-journey-filter]")).toHaveText([
      "All Notes",
      "My Notes",
      "Not Started",
      "Blocked",
      "Decisions",
      "In Progress",
      "Complete",
      "Skipped",
      "System Generated",
    ]);
    const compactButtonWidth = await page.locator("[data-journey-filter='all']").evaluate((button) =>
      Number.parseFloat(getComputedStyle(button).minWidth),
    );
    expect(compactButtonWidth).toBeGreaterThanOrEqual(70);
    const statTileLayout = await page.locator("[aria-label='Selected note statistics'] .mini-stat").evaluateAll((tiles) =>
      tiles.map((tile) => {
        const strong = tile.querySelector("strong");
        const label = tile.querySelector("[data-journey-stat-label]");
        const strongRect = strong?.getBoundingClientRect();
        const labelRect = label?.getBoundingClientRect();
        return {
          children: Array.from(tile.children).map((child) => child.tagName),
          tileClass: tile.className || "",
          labelClass: label?.className || "",
          labelText: label?.textContent?.trim() || "",
          valueLabelSameLine: Boolean(
            strongRect &&
              labelRect &&
              Math.abs((strongRect.top + strongRect.height / 2) - (labelRect.top + labelRect.height / 2)) <= 2,
          ),
          hasStatusClass: Array.from(tile.querySelectorAll("*")).some((element) =>
            /\b(status|pill)\b/.test(element.className || ""),
          ),
        };
      }),
    );
    expect(statTileLayout).toHaveLength(8);
    expect(statTileLayout.map((tile) => tile.children)).toEqual([
      ["STRONG", "SPAN"],
      ["STRONG", "SPAN"],
      ["STRONG", "SPAN"],
      ["STRONG", "SPAN"],
      ["STRONG", "SPAN"],
      ["STRONG", "SPAN"],
      ["STRONG", "SPAN"],
      ["STRONG", "SPAN"],
    ]);
    expect(statTileLayout.map((tile) => tile.labelText)).toEqual([
      "Open",
      "Total",
      ...statusLabels(),
    ]);
    expect(statTileLayout.every((tile) => tile.tileClass.includes("mini-stat--inline"))).toBe(true);
    expect(statTileLayout.every((tile) => tile.valueLabelSameLine)).toBe(true);
    expect(statTileLayout.every((tile) => tile.labelClass === "" && !tile.hasStatusClass)).toBe(true);
    const dividerPlacement = await page.locator("[data-journey-stat-divider]").evaluate((divider) => {
      const column = divider.closest(".tool-column[class*='tool-group-']");
      return {
        previousStat: divider.previousElementSibling?.querySelector("[data-journey-stat-label]")?.textContent?.trim(),
        nextStat: divider.nextElementSibling?.querySelector("[data-journey-stat-label]")?.textContent?.trim(),
        borderTopColor: getComputedStyle(divider).borderTopColor,
        borderTopWidth: getComputedStyle(divider).borderTopWidth,
        columnBorderColor: column ? getComputedStyle(column).borderTopColor : "",
        role: divider.getAttribute("role"),
      };
    });
    expect(dividerPlacement).toMatchObject({
      previousStat: "Total",
      nextStat: statusLabels()[0],
      role: "separator",
    });
    expect(Number.parseFloat(dividerPlacement.borderTopWidth)).toBeGreaterThanOrEqual(0.75);
    expect(Number.parseFloat(dividerPlacement.borderTopWidth)).toBeLessThanOrEqual(1);
    expect(dividerPlacement.borderTopColor).toBe(dividerPlacement.columnBorderColor);
    await expect(page.locator(`[data-journey-note-button="${GAME_JOURNEY_KEYS.notes.designPass}"]`)).toHaveClass(/primary/);
    await expect(page.locator(`[data-journey-item-button="${GAME_JOURNEY_KEYS.items.designAffordance}"]`)).toHaveClass(/primary/);
    await expect(page.locator(`[data-journey-item-button="${GAME_JOURNEY_KEYS.items.designAffordance}"]`)).toContainText("Designer review should focus on checkbox visibility");
    const treeRowLayout = await page.locator(`[data-journey-item-row="${GAME_JOURNEY_KEYS.items.designAffordance}"]`).evaluate((row) => {
      const content = row.querySelector("[data-journey-item-button]");
      const action = row.querySelector("[data-journey-system-item-indicator], [data-journey-delete-item]");
      const contentStyles = getComputedStyle(content);
      const contentRect = content.getBoundingClientRect();
      const actionRect = action.getBoundingClientRect();
      return {
        contentFlexBasis: contentStyles.flexBasis,
        contentMaxWidth: contentStyles.maxWidth,
        contentTextAlign: contentStyles.textAlign,
        contentWhiteSpace: contentStyles.whiteSpace,
        actionSameLine: Math.abs((contentRect.top + contentRect.height / 2) - (actionRect.top + actionRect.height / 2)) <= 2,
        actionRightOfContent: actionRect.left >= contentRect.right,
      };
    });
    expect(treeRowLayout).toEqual({
      contentFlexBasis: "90%",
      contentMaxWidth: "90%",
      contentTextAlign: "left",
      contentWhiteSpace: "nowrap",
      actionSameLine: true,
      actionRightOfContent: true,
    });
    await expect(page.locator("[data-journey-title-input]")).toBeDisabled();
    await expect(page.locator("[data-journey-system-guidance]")).toContainText("Check whether selected swatches clearly expose batch tagging");
    const guidanceWraps = await page.locator("[data-journey-system-guidance]").evaluate((guidance) => {
      const styles = getComputedStyle(guidance);
      return {
        usesAvailableWidth: guidance.getBoundingClientRect().width >= guidance.parentElement.getBoundingClientRect().width - 2,
        wrapsNaturally: styles.overflowWrap === "anywhere",
      };
    });
    expect(guidanceWraps).toEqual({
      usesAvailableWidth: true,
      wrapsNaturally: true,
    });
    await expect(page.locator(`[data-journey-selected-item-details="${GAME_JOURNEY_KEYS.items.designAffordance}"]`)).toContainText("Item Details");
    await expect(page.locator("[data-journey-item-details-input]")).toHaveValue("Designer review should focus on checkbox visibility and selected-row contrast.");
    const detailsFollowsSelectedRow = await page.locator(`[data-journey-selected-item-details="${GAME_JOURNEY_KEYS.items.designAffordance}"]`).evaluate((details, itemKey) => {
      const previous = details.previousElementSibling;
      return Boolean(previous?.matches(`[data-journey-item-row="${itemKey}"]`));
    }, GAME_JOURNEY_KEYS.items.designAffordance);
    expect(detailsFollowsSelectedRow).toBe(true);
    const itemDetailsLayout = await page.locator(`[data-journey-selected-item-details="${GAME_JOURNEY_KEYS.items.designAffordance}"]`).evaluate((details) => {
      const label = details.querySelector("label[for='journeyItemDetailsInput']");
      const input = details.querySelector("#journeyItemDetailsInput");
      const labelRect = label.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();
      return {
        usesFormTable: Boolean(label.closest("table.tool-form-table")),
        labelIsLeftOfInput: labelRect.right <= inputRect.left,
      };
    });
    expect(itemDetailsLayout).toEqual({
      usesFormTable: true,
      labelIsLeftOfInput: true,
    });
    await expect(page.locator("#journeyStatusInput option")).toHaveText(statusLabels());
    const dropdownLabels = await page.locator("#journeyStatusInput option").allTextContents();
    expect(dropdownLabels.some((label) => /\[[ .x!?-]\]/.test(label))).toBe(false);
    await expect(page.locator("[data-journey-status-legend]")).toHaveCount(0);
    await expect(page.locator("aside.tool-column").last().locator(".callout", { hasText: "Status Legend" })).toHaveCount(0);
    await expect(page.locator("details > summary", { hasText: /^Note Tree$/ })).toHaveCount(1);
    await expect(page.locator("details > summary", { hasText: /^Selected Note Tree$/ })).toHaveCount(0);
    await expect(page.locator("table[aria-label='Game Journey note summary'] thead th")).toHaveText([
      "Name",
      "Type",
      GAME_JOURNEY_STATUSES[0].icon,
      GAME_JOURNEY_STATUSES[1].icon,
      GAME_JOURNEY_STATUSES[2].icon,
      GAME_JOURNEY_STATUSES[3].icon,
      GAME_JOURNEY_STATUSES[4].icon,
      GAME_JOURNEY_STATUSES[5].icon,
      "Open",
      "Total",
      "Updated ↓"
    ]);
    const summaryTableWidth = await page.locator("[data-journey-summary-table]").evaluate((table) => {
      const tableBox = table.getBoundingClientRect();
      const wrapperBox = table.parentElement.getBoundingClientRect();
      return Math.round(tableBox.width - wrapperBox.width);
    });
    expect(Math.abs(summaryTableWidth)).toBeLessThanOrEqual(1);
    await expect(page.getByText("Current Folder")).toHaveCount(0);
    await expect(page.getByText("Return to root index")).toHaveCount(0);
    await expect(page.getByText("Open folder")).toHaveCount(0);
    await expect(page.getByLabel("Indent")).toHaveCount(0);
    await expect(page.locator("[data-journey-item-tree] ul ul li", { hasText: "Confirm batch tag language" })).toBeVisible();
    const compactNestedSpacing = await page.locator("[data-journey-item-tree] ul ul").first().evaluate((list) => Number.parseFloat(getComputedStyle(list).marginTop));
    expect(compactNestedSpacing).toBeLessThanOrEqual(8);

    await page.getByLabel("Status").selectOption("blocker");
    await page.locator("[data-journey-new-item-title-input]").fill("Batch verification item");
    await page.getByRole("button", { name: "Add Item" }).click();
    await expect(page.locator("[data-journey-title-input]")).toBeEnabled();
    await expect(page.locator("[data-journey-title-input]")).toHaveValue("Batch verification item");
    await expect(page.locator("[data-journey-item-tree]")).not.toContainText("New journey item");
    await page.locator("[data-journey-item-details-input]").fill("User-created verification details.");
    await page.getByRole("button", { name: "Update Item" }).click();
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("4");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("4");
    await expect(page.locator("[data-journey-stat-blocker]")).toHaveText("1");
    await expect(page.locator("[data-journey-item-tree]")).toContainText("Batch verification item");
    await expect(page.locator("[data-journey-item-details-input]")).toHaveValue("User-created verification details.");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(3)).toHaveText("1");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(8)).toHaveText("4");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(9)).toHaveText("4");

    await page.getByLabel("Status").selectOption("complete");
    await page.getByRole("button", { name: "Update Item" }).click();
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("3");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("4");
    await expect(page.locator("[data-journey-stat-complete]")).toHaveText("1");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(6)).toHaveText("1");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(8)).toHaveText("3");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(9)).toHaveText("4");

    await page.getByLabel("Status").selectOption("skipped");
    await page.getByRole("button", { name: "Update Item" }).click();
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("3");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("4");
    await expect(page.locator("[data-journey-stat-complete]")).toHaveText("0");
    await expect(page.locator("[data-journey-stat-skipped]")).toHaveText("1");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(7)).toHaveText("1");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(8)).toHaveText("3");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(9)).toHaveText("4");

    await page.getByRole("button", { name: /Confirm batch tag language/ }).click();
    await page.getByRole("button", { name: "<" }).click();
    await expect(page.locator("[data-journey-item-tree] > ul > li", { hasText: "Confirm batch tag language" })).toBeVisible();
    await page.getByRole("button", { name: ">" }).click();
    await expect(page.locator("[data-journey-item-tree] ul ul li", { hasText: "Confirm batch tag language" })).toBeVisible();

    await page.getByRole("button", { name: /Review palette swatch affordance/ }).click();
    await page.getByRole("button", { name: "Move Down" }).click();
    await expect(page.locator("[data-journey-item-button]").first()).toContainText("Confirm batch tag language");
    await page.getByRole("button", { name: "Move Up" }).click();
    await expect(page.locator("[data-journey-item-button]").first()).toContainText("Review palette swatch affordance");

    const suggestedLinks = page.locator("[data-journey-suggested-tools] a");
    await expect(suggestedLinks.first()).toHaveAttribute("href", /toolbox\/index\.html\?view=group&group=/);
    await expect(suggestedLinks.first()).toHaveAttribute("href", /context=game-journey/);

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Game Journey updates selected note types from the mock DB", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-journey/index.html?game=demo-game", {
    collectCoverage: false,
  });

  try {
    const selectedNoteType = page.locator("[data-journey-note-type-select]");
    const newNoteType = page.locator("[data-journey-new-note-type]");
    await expect(selectedNoteType).toHaveValue(GAME_JOURNEY_KEYS.noteTypes.design);
    await page.locator("[data-journey-note-type-select]").selectOption(GAME_JOURNEY_KEYS.noteTypes.task);
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(1)).toHaveText("Task");
    const typeOptionCountBefore = await selectedNoteType.locator("option").count();
    await page.getByLabel("Add Note Type").fill("Playtest");
    await page.getByRole("button", { name: "Add Note Type" }).click();
    await expect(page.locator("[data-journey-type-status]")).toContainText("Playtest is available");
    await expect(selectedNoteType.locator("option", { hasText: "Playtest" })).toHaveCount(1);
    await expect(newNoteType.locator("option", { hasText: "Playtest" })).toHaveCount(1);
    await expect(newNoteType).toHaveValue(ULID_PATTERN);
    await selectedNoteType.selectOption({ label: "Playtest" });
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(1)).toHaveText("Playtest");
    await page.getByLabel("Add Note Type").fill("playtest");
    await page.getByRole("button", { name: "Add Note Type" }).click();
    await expect(page.locator("[data-journey-type-status]")).toContainText("Playtest already exists");
    await expect(selectedNoteType.locator("option")).toHaveCount(typeOptionCountBefore + 1);

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Game Journey sorts summary columns and adds user-owned notes", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-journey/index.html?game=demo-game");

  try {
    const sortKeys = [
      "name",
      "type",
      "not-started",
      "blocker",
      "decide",
      "in-progress",
      "complete",
      "skipped",
      "open",
      "total",
      "updated",
    ];
    await expect(page.locator("[data-journey-sort-header='updated']")).toHaveAttribute("aria-sort", "descending");
    await expect(page.locator("[data-journey-sort='updated']")).toHaveClass(/primary/);
    await expect(page.locator("[data-journey-sort='updated']")).toContainText("↓");
    await expect(page.locator("[data-journey-sort='name']")).not.toHaveClass(/primary/);
    await expect(page.locator("[data-journey-sort='name']")).not.toContainText(/[↑↓]/);
    for (const key of sortKeys) {
      await page.locator(`[data-journey-sort="${key}"]`).click();
      await expect(page.locator(`[data-journey-sort-header="${key}"]`)).toHaveAttribute("aria-sort", "ascending");
      await expect(page.locator(`[data-journey-sort="${key}"]`)).toHaveClass(/primary/);
      await expect(page.locator(`[data-journey-sort="${key}"]`)).toContainText("↑");
      await page.locator(`[data-journey-sort="${key}"]`).click();
      await expect(page.locator(`[data-journey-sort-header="${key}"]`)).toHaveAttribute("aria-sort", "descending");
      await expect(page.locator(`[data-journey-sort="${key}"]`)).toHaveClass(/primary/);
      await expect(page.locator(`[data-journey-sort="${key}"]`)).toContainText("↓");
    }

    await page.locator("[data-journey-sort='name']").click();
    await expect(page.locator("[data-journey-note-button]").first()).toHaveText("Palette and Input Density");
    await page.locator("[data-journey-sort='name']").click();
    await expect(page.locator("[data-journey-note-button]").first()).toHaveText("Story Beats");

    const noteRowsBefore = await page.locator("[data-journey-note-button]").count();
    await page.locator("[data-journey-new-note-name]").fill("Usability Audit");
    await page.locator("[data-journey-new-note-type]").selectOption(GAME_JOURNEY_KEYS.noteTypes.task);
    await page.getByRole("button", { name: "Add Note", exact: true }).click();
    await expect(page.locator("[data-journey-note-status]")).toContainText("Added Usability Audit");
    await expect(page.locator("[data-journey-note-button]")).toHaveCount(noteRowsBefore + 1);
    await expect(page.locator("[data-journey-note-button]", { hasText: "Usability Audit" })).toHaveClass(/primary/);
    await expect(page.locator("[data-journey-selected-note]")).toContainText("Usability Audit (Task)");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("0");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("0");
    await expect(page.locator("[data-journey-item-tree]")).toContainText("No journey items yet.");
    await expect(page.locator("[data-journey-editor-status]")).toContainText("Add Item will create a user-created editable item");
    await expect(page.locator("[data-journey-title-input]")).toBeEnabled();

    await page.locator("[data-journey-title-input]").fill("First user-added task");
    await page.getByRole("button", { name: "Add Item" }).click();
    await expect(page.locator("[data-journey-editor-status]")).toContainText("User-created item");
    await expect(page.locator("[data-journey-title-input]")).toBeEnabled();
    await expect(page.locator("[data-journey-title-input]")).toHaveValue("First user-added task");
    await expect(page.locator("#journeyStatusInput")).toHaveValue("not-started");
    await expect(page.locator("[data-journey-item-tree]")).toContainText("First user-added task");
    await expect(page.locator("[data-journey-item-tree]")).not.toContainText("New journey item");
    await page.locator("[data-journey-item-details-input]").fill("First task details stay user-editable.");
    await page.getByRole("button", { name: "Update Item" }).click();
    await expect(page.locator("[data-journey-item-tree]")).toContainText("First task details stay user-editable.");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("1");
    const userRow = page.locator("[data-journey-item-row]").filter({ hasText: "First user-added task" });
    await expect(userRow.locator("[data-journey-delete-item]")).toHaveCount(1);
    await expect(userRow.locator("[data-journey-system-item-indicator]")).toHaveCount(0);

    await page.locator("[data-journey-filter='system']").click();
    await expect(page.locator("[data-journey-filter='system']")).toHaveClass(/primary/);
    await expect(page.locator("[data-journey-filter='system']")).toHaveAttribute("aria-current", "true");
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: System Generated (2 notes).");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("5");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("5");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Usability Audit");
    await expect(page.locator("[data-journey-item-tree]")).not.toContainText("First user-added task");
    expect(await page.locator("[data-journey-item-tree] [data-journey-system-item-indicator]").count()).toBeGreaterThan(0);

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Game Journey filters all notes, my notes, and status-specific notes", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-journey/index.html?game=demo-game");

  try {
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("User 1");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Release Readiness");
    await page.locator("[data-journey-filter='mine']").click();
    await expect(page.locator("[data-journey-filter='mine']")).toHaveClass(/primary/);
    await expect(page.locator("[data-journey-filter='mine']")).toHaveAttribute("aria-current", "true");
    await expect(page.locator("[data-journey-filter='all']")).not.toHaveClass(/primary/);
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: My Notes (2 notes).");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("5");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("5");
    await expect(page.locator("[data-journey-stat-not-started]")).toHaveText("2");
    await expect(page.locator("[data-journey-stat-in-progress]")).toHaveText("2");
    await expect(page.locator("[data-journey-stat-decide]")).toHaveText("1");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Palette and Input Density");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Story Beats");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Release Readiness");

    await page.locator("[data-journey-filter='all']").click();
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: All Notes (2 notes).");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("5");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("5");

    await page.locator("[data-journey-filter='blocker']").click();
    await expect(page.locator("[data-journey-filter='blocker']")).toHaveClass(/primary/);
    await expect(page.locator("[data-journey-filter='blocker']")).toHaveAttribute("aria-current", "true");
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: Blocked (0 notes).");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("0");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("0");
    await expect(page.locator("[data-journey-stat-blocker]")).toHaveText("0");
    await expect(page.locator("[data-journey-stat-complete]")).toHaveText("0");
    await expect(page.locator("[data-journey-stat-skipped]")).toHaveText("0");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Release Readiness");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Story Beats");
    await expectFilteredSummaryRows(page, "blocker", []);
    await expectNoTreeRows(page);

    await page.locator("[data-journey-filter='decide']").click();
    await expect(page.locator("[data-journey-filter='decide']")).toHaveClass(/primary/);
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: Decisions (1 notes).");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-decide]")).toHaveText("1");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Palette and Input Density");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Research Questions");
    await expectFilteredSummaryRows(page, "decide", [
      { name: "Palette and Input Density", count: 1, open: 1, total: 1 },
    ]);
    await expectTreeOnlyStatus(page, "decide", 1);
    await expect(page.locator("[data-journey-item-tree]")).toContainText(statusLabel("decide"));
    await expect(page.locator("[data-journey-item-tree]")).not.toContainText(statusLabel("in-progress"));

    await page.locator("[data-journey-filter='not-started']").click();
    await expect(page.locator("[data-journey-filter='not-started']")).toHaveClass(/primary/);
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: Not Started (2 notes).");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("2");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("2");
    await expect(page.locator("[data-journey-stat-not-started]")).toHaveText("2");
    await expect(page.locator("[data-journey-stat-in-progress]")).toHaveText("0");
    await expectFilteredSummaryRows(page, "not-started", [
      { name: "Story Beats", count: 1, open: 1, total: 1 },
      { name: "Palette and Input Density", count: 1, open: 1, total: 1 },
    ]);
    await expectTreeOnlyStatus(page, "not-started", 1);
    await expect(page.locator("[data-journey-item-tree]")).not.toContainText(statusLabel("in-progress"));

    await page.locator("[data-journey-filter='in-progress']").click();
    await expect(page.locator("[data-journey-filter='in-progress']")).toHaveClass(/primary/);
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: In Progress (2 notes).");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("2");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("2");
    await expect(page.locator("[data-journey-stat-in-progress]")).toHaveText("2");
    await expect(page.locator("[data-journey-stat-not-started]")).toHaveText("0");
    await expectFilteredSummaryRows(page, "in-progress", [
      { name: "Story Beats", count: 1, open: 1, total: 1 },
      { name: "Palette and Input Density", count: 1, open: 1, total: 1 },
    ]);
    await expectTreeOnlyStatus(page, "in-progress", 1);
    await expect(page.locator("[data-journey-item-tree]")).not.toContainText(statusLabel("not-started"));

    await page.locator("[data-journey-filter='complete']").click();
    await expect(page.locator("[data-journey-filter='complete']")).toHaveClass(/primary/);
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: Complete (0 notes).");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("0");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("0");
    await expect(page.locator("[data-journey-stat-complete]")).toHaveText("0");
    await expectFilteredSummaryRows(page, "complete", []);
    await expectNoTreeRows(page);

    await page.locator("[data-journey-filter='skipped']").click();
    await expect(page.locator("[data-journey-filter='skipped']")).toHaveClass(/primary/);
    await expect(page.locator("[data-journey-filter='skipped']")).toHaveAttribute("aria-current", "true");
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: Skipped (0 notes).");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("0");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("0");
    await expect(page.locator("[data-journey-stat-skipped]")).toHaveText("0");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Release Readiness");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Story Beats");
    await expectFilteredSummaryRows(page, "skipped", []);
    await expectNoTreeRows(page);

    await page.locator("[data-journey-filter='system']").click();
    await expect(page.locator("[data-journey-filter='system']")).toHaveClass(/primary/);
    await expect(page.locator("[data-journey-filter='system']")).toHaveAttribute("aria-current", "true");
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: System Generated (2 notes).");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("5");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("5");
    const visibleSystemRows = await page.locator("[data-journey-item-button]").count();
    expect(visibleSystemRows).toBeGreaterThan(0);
    await expect(page.locator("[data-journey-system-item-indicator]")).toHaveCount(visibleSystemRows);

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Game Journey supports Guest as the selected shared session user", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-journey/index.html?game=demo-game", {
    sessionUserKey: "",
  });

  try {
    await expect(page.locator("[data-session-user-header]")).toHaveCount(0);
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Sign In");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).not.toHaveAttribute("href", /login\.html/i);
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='account']) > .sub-menu")).toBeHidden();
    await expect(page.locator("[data-journey-summary-body]")).toContainText("No notes match the current Game Journey filter.");
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: All Notes (0 notes).");
    await expect(page.locator("[data-journey-diagnostics]")).toContainText("Guest is unauthenticated");
    await expect(page.locator("[data-journey-editor-status]")).toContainText("Guest is unauthenticated");
    await expect(page.locator("[data-journey-new-note-name]")).toBeDisabled();
    await expect(page.locator("[data-journey-new-note-type]")).toBeDisabled();
    await expect(page.getByRole("button", { name: "Add Note", exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Add Item" })).toBeDisabled();
    await expect(page.locator("[data-journey-search-input]")).toBeEnabled();
    await page.locator("[data-journey-search-input]").fill("first task");
    await expect(page.locator("[data-journey-search-status]")).toHaveText("Search matched 0 notes.");

    await page.locator("[data-journey-filter='mine']").click();
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: My Notes (0 notes).");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("No notes match the current Game Journey filter.");

    await fetch(`${failures.server.baseUrl}/api/local-db/seed`, { method: "POST" });
    await fetch(`${failures.server.baseUrl}/api/session/user`, {
      body: JSON.stringify({ userKey: MOCK_DB_KEYS.users.admin }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    await page.goto(`${failures.server.baseUrl}/admin/db-viewer.html`, { waitUntil: "networkidle" });
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("DavidQ");
    await page.getByRole("button", { name: "Game Journey" }).click();
    await expect(page.locator("[data-admin-db-table='game_journey_notes']")).not.toContainText("Guest Scratch Note");
    await expect(page.locator("[data-admin-db-table='game_journey_items']")).not.toContainText("Guest first task");
    await page.getByRole("button", { name: "User Roles" }).click();
    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("Guest");

    await fetch(`${failures.server.baseUrl}/api/session/user`, {
      body: JSON.stringify({ userKey: MOCK_DB_KEYS.users.user3 }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    const user3TableReferences = await page.evaluate(async (user3Key) => {
      const snapshot = await fetch("/api/local-db/snapshot").then((response) => response.json());
      return Object.entries(snapshot.data.tables || {})
        .filter(([, rows]) => Array.isArray(rows) && rows.some((record) =>
          Object.values(record).includes(user3Key),
        ))
        .map(([tableName]) => tableName)
        .sort();
    }, MOCK_DB_KEYS.users.user3);
    expect(user3TableReferences).toEqual(["tool_state_samples", "user_roles", "users"]);
    await page.goto(`${failures.server.baseUrl}/toolbox/game-journey/index.html?game=demo-game`, { waitUntil: "networkidle" });
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("User 3");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("No notes match the current Game Journey filter.");
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: All Notes (0 notes).");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Game Journey search filters notes, tree items, and visible counts", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-journey/index.html?game=demo-game");

  try {
    const searchInput = page.locator("[data-journey-search-input]");
    await expect(searchInput).toBeVisible();

    await searchInput.fill("keyboard-friendly");
    await expect(page.locator("[data-journey-search-status]")).toHaveText("Search matched 1 note.");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Palette and Input Density");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Release Readiness");
    await expect(page.locator("[data-journey-item-tree]")).toContainText("Review palette swatch affordance");
    await expect(page.locator("[data-journey-item-tree]")).not.toContainText("Confirm batch tag language");
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for selected note: Palette and Input Density.");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-in-progress]")).toHaveText("1");

    await expect(page.locator("[data-journey-search-clear]")).toHaveCount(0);
    await searchInput.fill("");
    await expect(page.locator("[data-journey-search-status]")).toHaveText("Search is clear.");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("3");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Release Readiness");

    await page.locator("[data-journey-filter='blocker']").click();
    await expect(page.locator("[data-journey-filter='blocker']")).toHaveClass(/primary/);
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await searchInput.fill("Skipped");
    await expect(page.locator("[data-journey-search-status]")).toHaveText("Search matched 0 notes.");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Release Readiness");
    await expect(page.locator("[data-journey-item-tree]")).not.toContainText("Skip launch-day checklist items that no longer apply");
    await expect(page.locator("[data-journey-item-tree]")).not.toContainText("Resolve final validation lane ownership");
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: Blocked (0 notes).");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("0");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("0");
    await expect(page.locator("[data-journey-stat-skipped]")).toHaveText("0");

    await searchInput.fill("");
    await expect(page.locator("[data-journey-filter='blocker']")).toHaveClass(/primary/);
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: Blocked (0 notes).");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("0");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("0");
    await expect(page.locator("[data-journey-item-tree]")).not.toContainText("Resolve final validation lane ownership");

    await fetch(`${failures.server.baseUrl}/api/session/user`, {
      body: JSON.stringify({ userKey: MOCK_DB_KEYS.users.user2 }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    await page.goto(`${failures.server.baseUrl}/toolbox/game-journey/index.html?game=demo-game`, { waitUntil: "networkidle" });
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("User 2");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Release Readiness");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Research Questions");
    await searchInput.fill("Skipped");
    await expect(page.locator("[data-journey-search-status]")).toHaveText("Search matched 1 note.");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Release Readiness");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Research Questions");
    await expectTreeOnlyStatus(page, "skipped", 1);
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("0");
    await expect(page.locator("[data-journey-stat-skipped]")).toHaveText("1");
    await searchInput.fill("");
    await page.locator("[data-journey-filter='mine']").click();
    await searchInput.fill("Skipped");
    await expect(page.locator("[data-journey-search-status]")).toHaveText("Search matched 1 note.");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Release Readiness");
    await expectTreeOnlyStatus(page, "skipped", 1);
    await searchInput.fill("");
    await page.locator("[data-journey-filter='blocker']").click();
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: Blocked (1 notes).");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-blocker]")).toHaveText("1");
    await expectTreeOnlyStatus(page, "blocker", 1);
    await searchInput.fill("Skipped");
    await expect(page.locator("[data-journey-search-status]")).toHaveText("Search matched 0 notes.");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Release Readiness");
    await expectNoTreeRows(page);
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("0");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("0");
    await expect(page.locator("[data-journey-stat-skipped]")).toHaveText("0");
    await searchInput.fill("");
    await expect(page.locator("[data-journey-filter='blocker']")).toHaveClass(/primary/);
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("1");
    await expect(page.locator("[data-journey-item-tree]")).toContainText("Resolve final validation lane ownership");
    await expect(page.locator("[data-journey-item-tree]")).not.toContainText("Skip launch-day checklist items that no longer apply");

    await page.locator("[data-journey-filter='skipped']").click();
    await searchInput.fill("Skipped");
    await expect(page.locator("[data-journey-search-status]")).toHaveText("Search matched 1 note.");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Release Readiness");
    await expectTreeOnlyStatus(page, "skipped", 1);
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("0");
    await expect(page.locator("[data-journey-stat-skipped]")).toHaveText("1");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Game Journey enforces item ownership while resolving template guidance", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-journey/index.html?game=demo-game");

  try {
    await expect(page.locator(`[data-journey-item-button="${GAME_JOURNEY_KEYS.items.designAffordance}"]`)).toHaveClass(/primary/);
    await expect(page.getByRole("button", { name: "Delete Row" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Delete user-created item" })).toHaveCount(0);
    const systemRow = page.locator(`[data-journey-item-row="${GAME_JOURNEY_KEYS.items.designAffordance}"]`);
    await expect(systemRow.locator("[data-journey-delete-item]")).toHaveCount(0);
    const systemIndicator = systemRow.locator("[data-journey-system-item-indicator]");
    await expect(systemIndicator).toHaveAttribute("src", /forge-bot\.svg$/);
    await expect(systemIndicator).toHaveAttribute("alt", "forge-bot created");
    await expect(systemIndicator).toHaveAttribute("title", "forge-bot created");
    const systemIndicatorBox = await systemIndicator.boundingBox();
    expect(Math.round(systemIndicatorBox.width)).toBe(32);
    expect(Math.round(systemIndicatorBox.height)).toBe(32);
    const systemRowEndAlignment = await systemRow.evaluate((row) => {
      const rowRect = row.getBoundingClientRect();
      const indicator = row.querySelector("[data-journey-system-item-indicator]");
      const indicatorRect = indicator.getBoundingClientRect();
      return Math.round(rowRect.right - indicatorRect.right);
    });
    expect(systemRowEndAlignment).toBeLessThanOrEqual(2);
    await expect(page.locator("[data-journey-editor-status]")).toContainText("System-created item");
    await expect(page.locator("[data-journey-editor-status]")).toContainText("Original meaning: Review palette swatch affordance");
    await expect(page.locator("[data-journey-title-input]")).toBeDisabled();
    await expect(page.locator("[data-journey-system-guidance]")).toContainText("Check whether selected swatches clearly expose batch tagging");
    await expect(page.locator("[data-journey-system-guidance] textarea, [data-journey-system-guidance] input")).toHaveCount(0);

    await page.locator("[data-journey-item-details-input]").fill("System item details edited by user.");
    await page.getByLabel("Status").selectOption("blocker");
    await page.getByRole("button", { name: "Update Item" }).click();
    await expect(page.locator("[data-journey-item-tree]")).toContainText("Review palette swatch affordance in the active game palette.");
    await expect(page.locator("[data-journey-item-tree]")).not.toContainText("System row edited label");
    await expect(systemRow.locator("[data-journey-delete-item]")).toHaveCount(0);
    await expect(page.locator("[data-journey-editor-status]")).toContainText("Original meaning: Review palette swatch affordance");
    await expect(page.locator("[data-journey-diagnostics]")).toContainText(`Selected item updatedBy: ${MOCK_DB_KEYS.users.user1}.`);

    await page.getByLabel("Status").selectOption("not-started");
    await page.locator("[data-journey-new-item-title-input]").fill("User owned cleanup item");
    await page.getByRole("button", { name: "Add Item" }).click();
    await expect(page.locator("[data-journey-editor-status]")).toContainText("User-created item");
    await expect(page.locator("[data-journey-title-input]")).toHaveValue("User owned cleanup item");
    await expect(page.locator("[data-journey-item-tree]")).not.toContainText("New journey item");
    await page.locator("[data-journey-item-details-input]").fill("Created by mistake.");
    await page.getByRole("button", { name: "Update Item" }).click();
    await expect(page.locator("[data-journey-item-tree]")).toContainText("User owned cleanup item");
    await expect(page.locator("[data-journey-item-details-input]")).toHaveValue("Created by mistake.");
    const userRow = page.locator("[data-journey-item-row]").filter({ hasText: "User owned cleanup item" });
    await expect(userRow.locator("[data-journey-system-item-indicator]")).toHaveCount(0);
    await expect(userRow.locator("[data-journey-delete-item]")).toHaveCount(1);
    const deleteUserRow = userRow.getByRole("button", { name: "Delete user-created item" });
    await expect(deleteUserRow).toBeVisible();
    const deleteButtonBox = await deleteUserRow.boundingBox();
    expect(Math.round(deleteButtonBox.width)).toBe(32);
    expect(Math.round(deleteButtonBox.height)).toBe(32);
    const userRowEndAlignment = await userRow.evaluate((row) => {
      const rowRect = row.getBoundingClientRect();
      const action = row.querySelector("[data-journey-delete-item]");
      const actionRect = action.getBoundingClientRect();
      return Math.round(rowRect.right - actionRect.right);
    });
    expect(userRowEndAlignment).toBeLessThanOrEqual(2);
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("4");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("It is best to keep the note unless it was created by mistake.");
      await dialog.dismiss();
    });
    await deleteUserRow.click();
    await expect(page.locator("[data-journey-item-tree]")).toContainText("User owned cleanup item");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("4");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("It is best to keep the note unless it was created by mistake.");
      await dialog.accept();
    });
    await deleteUserRow.click();
    await expect(page.locator("[data-journey-item-tree]")).not.toContainText("User owned cleanup item");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("3");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("3");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Game Journey displays system template diagnostics", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-journey/index.html?game=demo-game&templateDiagnostic=all");

  try {
    await expect(page.locator("[data-journey-diagnostics]")).toContainText("missing templateKey");
    await expect(page.locator("[data-journey-diagnostics]")).toContainText(`inactive templateKey ${GAME_JOURNEY_KEYS.templates.inactiveGuidance}`);
    await expect(page.locator("[data-journey-diagnostics]")).toContainText(`references missing templateKey ${GAME_JOURNEY_KEYS.templates.invalidMissing}`);
    await page.getByRole("button", { name: /Missing template diagnostic item/ }).click();
    await expect(page.locator("[data-journey-item-tree]")).toContainText("System guidance is unavailable until the linked template is repaired.");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Game Journey mock data keeps system guidance template-owned", async () => {
  const repository = createGameJourneyMockRepository({
    completionMetricsPostgresClient: createGameJourneyCompletionMetricsPostgresClientStub(),
    memoryDbTables: standaloneSeedTables,
    persist: false,
    sessionUserKey: MOCK_DB_KEYS.users.user1,
  });
  repository.openGame("demo-game");

  const tables = await repository.getTables();
  expect(tables.game_journey_items).toBeTruthy();
  expect(tables.game_journey_templates).toBeTruthy();
  expect(tables.game_journey_entries).toBeUndefined();

  const auditFields = ["createdAt", "updatedAt", "createdBy", "updatedBy"];
  for (const [tableName, records] of Object.entries(tables)) {
    expect(records.length, `${tableName} should include records for DB Viewer diagnostics`).toBeGreaterThan(0);
    for (const record of records) {
      for (const field of auditFields) {
        expect(record, `${tableName} record must include ${field}`).toHaveProperty(field);
      }
    }
  }

  const primaryKeyFields = {
    game_journey_note_types: "key",
    game_journey_notes: "key",
    game_journey_templates: "key",
    game_journey_items: "key",
    game_journey_activity: "key",
  };
  for (const [tableName, primaryKeyField] of Object.entries(primaryKeyFields)) {
    for (const record of tables[tableName]) {
      expect(record[primaryKeyField], `${tableName}.${primaryKeyField} must be ULID-style`).toMatch(ULID_PATTERN);
      expect(record[primaryKeyField], `${tableName}.${primaryKeyField} must not be a readable demo key`).not.toMatch(/^(activity|demo-game|note-|item-|template-|custom-type-)/);
    }
  }

  tables.game_journey_notes.forEach((note) => {
    expect(note.gameKey).toMatch(ULID_PATTERN);
    expect(note.ownerKey).toMatch(ULID_PATTERN);
    expect(note.typeKey).toMatch(ULID_PATTERN);
    expect(note).not.toHaveProperty("id");
    expect(note).not.toHaveProperty("gameId");
    expect(note).not.toHaveProperty("ownerId");
    expect(note).not.toHaveProperty("typeId");
  });
  tables.game_journey_items.forEach((item) => {
    expect(item.gameKey).toMatch(ULID_PATTERN);
    expect(item.noteKey).toMatch(ULID_PATTERN);
    if (item.templateKey) {
      expect(item.templateKey).toMatch(ULID_PATTERN);
    }
    expect(item).not.toHaveProperty("itemId");
    expect(item).not.toHaveProperty("gameId");
    expect(item).not.toHaveProperty("noteId");
    expect(item).not.toHaveProperty("templateId");
  });
  tables.game_journey_activity.forEach((activity) => {
    expect(activity.gameKey).toMatch(ULID_PATTERN);
    expect(activity.noteKey).toMatch(ULID_PATTERN);
    expect(activity).not.toHaveProperty("id");
    expect(activity).not.toHaveProperty("gameId");
    expect(activity).not.toHaveProperty("noteId");
  });

  const forbiddenItemFields = ["originalMeaning", "systemGuidance", "linkedToolContexts"];
  for (const item of tables.game_journey_items) {
    for (const field of forbiddenItemFields) {
      expect(item).not.toHaveProperty(field);
    }
    expect(item).toHaveProperty("key");
    expect(item).toHaveProperty("gameKey");
    expect(item).toHaveProperty("noteKey");
    expect(item).toHaveProperty("status");
    expect(item).toHaveProperty("title");
    expect(item).toHaveProperty("userDetails");
    expect(item).toHaveProperty("createdBy");
    expect(item).toHaveProperty("updatedBy");
    expect(item).toHaveProperty("templateKey");
    expect(item).toHaveProperty("linkedRecordType");
    expect(item).toHaveProperty("linkedRecordId");
    expect(item).toHaveProperty("createdAt");
    expect(item).toHaveProperty("updatedAt");
  }

  const activeTemplateIds = new Set(
    tables.game_journey_templates
      .filter((template) => template.isActive)
      .map((template) => template.key),
  );
  const systemItems = tables.game_journey_items.filter((item) => item.createdBy === MOCK_DB_KEYS.users.forgeBot);
  expect(systemItems.length).toBeGreaterThan(0);
  for (const item of systemItems) {
    expect(activeTemplateIds.has(item.templateKey)).toBe(true);
  }

  const selectedSystemItem = repository.getSelectedItem();
  expect(selectedSystemItem.systemGuidance).toContain("Check whether selected swatches");
  expect(selectedSystemItem.originalMeaning).toContain("Review palette swatch affordance");

  const userUpdate = repository.updateItem(GAME_JOURNEY_KEYS.items.designAffordance, {
    title: "User should not rewrite the system title",
    status: "blocker",
    userDetails: "User-owned details on a system-created item.",
  });
  expect(userUpdate.title).toBe("Review palette swatch affordance in the active game palette.");
  expect(userUpdate.status).toBe("blocker");
  expect(userUpdate.userDetails).toBe("User-owned details on a system-created item.");
  expect(userUpdate.updatedBy).toBe(MOCK_DB_KEYS.users.user1);
  expect(userUpdate.createdBy).toBe(MOCK_DB_KEYS.users.forgeBot);

  const systemUpdate = repository.applySystemItemUpdate(GAME_JOURNEY_KEYS.items.designAffordance, {
    title: "System automation title",
    status: "complete",
    userDetails: "System automation detail.",
  });
  expect(systemUpdate.title).toBe("System automation title");
  expect(systemUpdate.status).toBe("complete");
  expect(systemUpdate.updatedBy).toBe(MOCK_DB_KEYS.users.forgeBot);

  const userItem = repository.addItem({
    title: "User free item",
    status: "not-started",
    userDetails: "No template required.",
  });
  expect(userItem.createdBy).toBe(MOCK_DB_KEYS.users.user1);
  expect(userItem.updatedBy).toBe(MOCK_DB_KEYS.users.user1);
  expect(userItem.key).toMatch(ULID_PATTERN);
  expect(userItem.templateKey).toBe("");
  expect(repository.deleteItem(userItem.key).deleted).toBe(true);
  expect(repository.deleteItem(GAME_JOURNEY_KEYS.items.designAffordance).deleted).toBe(false);

  const typeCount = repository.listNoteTypes().length;
  const typeResult = repository.addNoteType("Playtest");
  expect(typeResult.created).toBe(true);
  expect(typeResult.type.key).toMatch(ULID_PATTERN);
  expect(repository.listNoteTypes()).toHaveLength(typeCount + 1);
  const duplicateResult = repository.addNoteType("playtest");
  expect(duplicateResult.created).toBe(false);
  expect(duplicateResult.duplicate).toBe(true);
  expect(repository.listNoteTypes()).toHaveLength(typeCount + 1);

  repository.updateSelectedNoteType(GAME_JOURNEY_KEYS.noteTypes.task);
  expect(repository.getSelectedNote().type.name).toBe("Task");

  const addedNote = repository.addNote({
    name: "Repository-created note",
    typeKey: typeResult.type.key,
  });
  expect(addedNote.name).toBe("Repository-created note");
  expect(addedNote.type.name).toBe("Playtest");
  expect(addedNote.ownerKey).toBe(MOCK_DB_KEYS.users.user1);
  expect(addedNote.createdBy).toBe(MOCK_DB_KEYS.users.user1);
  expect(addedNote.key).toMatch(ULID_PATTERN);
  expect(addedNote.items).toHaveLength(0);
  const firstAddedItem = repository.addItem({
    title: "First editable user item",
    status: "not-started",
    userDetails: "Created from an empty note.",
  });
  expect(firstAddedItem.createdBy).toBe(MOCK_DB_KEYS.users.user1);
  expect(firstAddedItem.title).toBe("First editable user item");
});

test("Game Journey Local API persists completion metrics to Postgres", async () => {
  const gameJourneyCompletionMetricsPostgresClient = createGameJourneyCompletionMetricsPostgresClientStub();
  const server = await startRepoServer({
    gameJourneyCompletionMetricsPostgresClient,
  });
  try {
    const initial = await fetchApiData(server, "/api/game-journey/completion-metrics");
    expect(initial.databaseEngine).toBe("Postgres");
    expect(initial.databaseConfigKey).toBe("GAMEFOUNDRY_DATABASE_URL");
    expect(initial.records).toHaveLength(14);
    expect(initial.records.find((metric) => metric.bucketKey === "001-idea")).toMatchObject({
      active: false,
      completedCount: 0,
      percentComplete: 0,
      plannedCount: 4,
      status: "inactive",
    });

    const updated = await fetchApiData(server, "/api/game-journey/completion-metrics/001-idea", {
      body: JSON.stringify({
        active: true,
        completedCount: 2,
        plannedCount: 4,
      }),
      method: "POST",
    });
    expect(updated.updatedMetric).toMatchObject({
      active: true,
      bucketKey: "001-idea",
      completedCount: 2,
      percentComplete: 50,
      plannedCount: 4,
      status: "active",
    });

    const after = await fetchApiData(server, "/api/game-journey/completion-metrics");
    expect(after.records.find((metric) => metric.bucketKey === "001-idea")).toMatchObject({
      active: true,
      completedCount: 2,
      percentComplete: 50,
      plannedCount: 4,
      status: "active",
    });

    const row = gameJourneyCompletionMetricsPostgresClient
      .dumpTable("game_journey_completion_metrics")
      .find((metric) => metric.bucketKey === "001-idea");
    expect(row).toMatchObject({
      active: true,
      completedCount: 2,
      plannedCount: 4,
      status: "active",
    });
  } finally {
    await server.close();
  }
});

test("Game Journey completion metrics fail visibly when Postgres is not configured", async () => {
  const store = createGameJourneyCompletionMetricsStore({
    env: {},
  });

  await expect(store.listMetrics()).rejects.toThrow(/GAMEFOUNDRY_DATABASE_URL/);
});

test("Game Journey requires an active game before editing", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-journey/index.html?game=none");

  try {
    await expect(page.locator("[data-journey-active-game]")).toContainText("No active game is open");
    await expect(page.locator("[data-journey-diagnostics]")).toContainText("Open a game in Game Hub");
    await expect(page.getByRole("button", { name: "Add Item" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Update Item" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Add Note", exact: true })).toBeDisabled();
    await expect(page.locator("[data-journey-title-input]")).toBeDisabled();
    await expect(page.locator("[data-journey-note-type-select]")).toHaveCount(0);
    await expect(page.locator("[data-journey-new-note-type]")).toHaveCount(0);

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Game Hub hands the active game route to Game Journey", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-hub/index.html");

  try {
    const journeyLink = page.getByRole("link", { name: "Open Game Journey" });
    await expect(journeyLink).toHaveAttribute("href", /toolbox\/game-journey\/index\.html\?game=demo-game$/);
    await journeyLink.click();
    await page.waitForURL(/toolbox\/game-journey\/index\.html\?game=demo-game$/);
    await expect(page.locator("[data-journey-active-game]")).toHaveText("Active game: Demo Game.");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Toolbox registration exposes Game Journey navigation", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html?view=group&group=create");

  try {
    const journeyLink = page.locator("[data-toolbox-tool-name-link='Game Journey']").first();
    await expect(journeyLink).toHaveText("Game Journey");
    await expect(journeyLink).toHaveAttribute("href", /\/game-journey\/index\.html$/);
    await expect(journeyLink).toHaveAttribute("data-registered-tool-route", "toolbox/game-journey/index.html");

    await page.goto(`${failures.server.baseUrl}/toolbox/index.html?view=group&group=create`, { waitUntil: "networkidle" });
    const userJourneyLink = page.locator("[data-toolbox-tool-name-link='Game Journey']").first();
    await expect(userJourneyLink).toHaveText("Game Journey");
    await expect(userJourneyLink).toHaveAttribute("href", /\/game-journey\/index\.html$/);
    await expect(userJourneyLink).toHaveAttribute("data-registered-tool-route", "toolbox/game-journey/index.html");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Toolbox renders Creator-safe Game Journey progress outage copy", async ({ page }) => {
  const forbiddenOutagePrefix = ["Game Journey completion metrics", "unavailable"].join(" ");
  const server = await startRepoServer({
    gameJourneyCompletionMetricsPostgresClient: createFailingCompletionMetricsPostgresClient(),
  });
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;

  try {
    await page.goto(`${server.baseUrl}/toolbox/index.html?view=group&group=create`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-game-journey-completion-diagnostic]").first()).toHaveText(
      "Game Journey progress is temporarily unavailable. Continue building while progress refreshes.",
    );
    await expect(page.locator("body")).not.toContainText(forbiddenOutagePrefix);
    await expect(page.locator("body")).not.toContainText("Postgres");
  } finally {
    await server.close();
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
  }
});

test("Game Journey source stays separate from notes files and browser persistence", async () => {
  const sourcePaths = [
    "toolbox/game-journey/index.html",
    "assets/toolbox/game-journey/js/index.js",
    "api/persistence/tool-repositories/game-journey-mock-repository.js"
  ];
  const banned = [
    "admin" + "-notes",
    "data-admin" + "-note",
    "local" + "Storage",
    "session" + "Storage"
  ];

  for (const relativePath of sourcePaths) {
    const source = await fs.readFile(path.join(repoRoot, relativePath), "utf8");
    for (const value of banned) {
      expect(source.includes(value), `${relativePath} must not include ${value}`).toBe(false);
    }
  }

  const server = await startRepoServer();
  try {
    const response = await fetch(`${server.baseUrl}/api/toolbox/registry/snapshot`);
    const payload = await response.json();
    const gameJourneyRegistry = payload.data.activeTools.find((tool) => tool.id === "game-journey");
    expect(gameJourneyRegistry).toMatchObject({
      adminOnly: false,
      id: "game-journey",
      planningSource: "toolbox_tool_planning",
      requiredForPublish: true,
      status: "beta",
      visibleInToolsList: true,
    });
  } finally {
    await server.close();
  }
});
