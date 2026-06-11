import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const NORMALIZED_INPUTS = [
  "move.x-",
  "move.x+",
  "move.y-",
  "move.y+",
  "aim.x-",
  "aim.x+",
  "aim.y-",
  "aim.y+",
  "action.primary",
  "action.secondary",
  "action.tertiary",
  "action.quaternary",
  "action.confirm",
  "action.cancel",
  "action.menu",
  "action.start",
  "action.select",
  "action.pause",
  "dpad.up",
  "dpad.down",
  "dpad.left",
  "dpad.right",
  "trigger.left",
  "trigger.right",
];

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "controls",
    surface: "Controls control events and account mapping",
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

function collectPageFailures(page) {
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

  return { consoleErrors, failedRequests, pageErrors };
}

async function openRepoPage(page, path, options = {}) {
  const server = await startRepoServer();
  const failures = collectPageFailures(page);
  if (options.sessionUserKey !== undefined) {
    await fetch(`${server.baseUrl}/api/session/user`, {
      body: JSON.stringify({ userKey: options.sessionUserKey || "" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
  }
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${path}`, { waitUntil: "networkidle" });
  return { ...failures, server };
}

async function closeWithCoverage(page, failures) {
  await workspaceV2CoverageReporter.stop(page);
  await failures.server.close();
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function inputMappingRecords(page) {
  return page.evaluate(async () => {
    const response = await fetch("/api/mock-db/snapshot");
    const payload = await response.json();
    return payload.data.tables.game_input_mappings || [];
  });
}

async function controllerProfileRecords(page) {
  return page.evaluate(async () => {
    const response = await fetch("/api/mock-db/snapshot");
    const payload = await response.json();
    return payload.data.tables.player_controller_profiles || [];
  });
}

async function exposeGamepad(page) {
  await page.evaluate(() => {
    window.__arcadeAxes = [0, 0, 0, 0];
    window.__arcadeButtons = Array.from({ length: 16 }, () => ({ pressed: false, value: 0 }));
    Object.defineProperty(navigator, "getGamepads", {
      configurable: true,
      value: () => [{
        axes: window.__arcadeAxes,
        buttons: window.__arcadeButtons,
        connected: true,
        id: "Arcade Test Pad",
        index: 0,
        mapping: "standard",
        timestamp: Date.now(),
      }],
    });
  });
}

async function fillReadyConfiguration(page, summary = "A playable setup with configured player mode.") {
  await page.getByLabel("Game Basics").fill(summary);
  await page.getByLabel("Game Rules").fill("Reach the goal and avoid hazards.");
  await page.getByLabel("Player Setup").fill("Players use the configured player mode.");
  await page.getByLabel("World Setup").fill("One arena with clear spawn positions.");
  await page.getByLabel("Object Setup").fill("Hero, hazards, goals, and scoring objects.");
  await page.getByLabel("Audio Setup").fill("Simple feedback sounds.");
  await page.getByLabel("Test Readiness").fill("Confirm controls, scoring, fail, and win paths.");
}

async function addGameControl(page, {
  enabled = true,
  event = "eventD",
  family = "Keyboard",
  normalized = "action.primary",
  usageLabel = "Jump",
} = {}) {
  await page.locator("[data-input-add-mapping]").click();
  await page.locator("[data-input-row-normalized]").selectOption(normalized);
  await page.locator("[data-input-row-family]").selectOption(family);
  await page.locator("[data-input-row-usage-label]").fill(usageLabel);
  if (!enabled) {
    await page.locator("[data-input-row-enabled]").uncheck();
  }
  for (const locator of [
    "[data-input-row-event-d]",
    "[data-input-row-event-h]",
    "[data-input-row-event-u]",
    "[data-input-row-event-d-c]",
    "[data-input-row-event-drag]",
    "[data-input-row-event-axis]",
  ]) {
    const checkbox = page.locator(locator);
    if (await checkbox.isChecked()) {
      await checkbox.uncheck();
    }
  }
  const eventLocatorByField = {
    eventAxis: "[data-input-row-event-axis]",
    eventD: "[data-input-row-event-d]",
    eventDC: "[data-input-row-event-d-c]",
    eventDrag: "[data-input-row-event-drag]",
    eventH: "[data-input-row-event-h]",
    eventU: "[data-input-row-event-u]",
  };
  await page.locator(eventLocatorByField[event]).check();
  await page.locator("[data-input-save-mapping]").click();
}

test("Game Controls owns generic mappings and presets", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/controls/index.html");

  try {
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator(".tool-center-panel > h2")).toHaveText("Game Controls");
    await expect(page.locator("[data-controller-profile-table]")).toHaveCount(0);
    await expect(page.locator("[data-account-user-controls-link]")).toHaveAttribute("href", "/account/user-controls.html");
    await expect(page.locator("[data-input-mapping-table] th")).toHaveText([
      "Enabled",
      "Normalized Action Type",
      "Usage Label",
      "Input Family",
      "D",
      "H",
      "U",
      "DC",
      "Drag",
      "Axis",
      "Object",
      "State",
      "Actions",
    ]);
    await expect(page.locator("[data-input-action-label]")).toContainText(NORMALIZED_INPUTS);
    await expect(page.locator("[data-input-control-type-list]")).toContainText("Keyboard Key");
    await expect(page.locator("[data-input-control-type-list]")).toContainText("Pointer Drag");
    await expect(page.locator("[data-input-action-select] option")).toHaveText(NORMALIZED_INPUTS);
    await expect(page.locator("[data-input-preset]")).toHaveText([
      "Platformer",
      "Shooter",
      "Paddle / Ball",
      "Menu",
      "Vehicle",
      "Fighting",
      "Party / Arena",
    ]);

    await page.locator("[data-input-preset='platformer']").click();
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Move Left");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Jump");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Look Up");
    const records = await inputMappingRecords(page);
    expect(records).toHaveLength(7);
    expect(records.find((record) => record.usageLabel === "Move Left")).toMatchObject({
      enabled: true,
      eventD: true,
      normalizedInput: "move.x-",
      usageLabel: "Move Left",
    });
    expect(records.find((record) => record.usageLabel === "Look Up")).toMatchObject({
      enabled: false,
      eventD: true,
      normalizedInput: "move.y-",
      usageLabel: "Look Up",
    });
    expect(records.every((record) => !Object.hasOwn(record, "inputEventPhase"))).toBe(true);
    expect(JSON.stringify(records)).not.toContain("DU");
    expect(JSON.stringify(records)).not.toContain("DHU");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Game Controls validates enabled rows and persists separate event fields", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/controls/index.html");

  try {
    await page.locator("[data-input-add-mapping]").click();
    await page.locator("[data-input-save-mapping]").click();
    await expect(page.locator("[data-input-row-validation]")).toContainText("Add a Usage Label");
    expect(await inputMappingRecords(page)).toHaveLength(0);
    await page.locator("[data-input-row-usage-label]").fill("Custom Fly");
    await page.locator("[data-input-row-normalized]").evaluate((select) => {
      const option = document.createElement("option");
      option.value = "custom.fly";
      option.textContent = "custom.fly";
      select.append(option);
      select.value = "custom.fly";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.locator("[data-input-save-mapping]").click();
    await expect(page.locator("[data-input-row-validation]")).toContainText("fixed normalized action type");
    expect(await inputMappingRecords(page)).toHaveLength(0);
    await page.locator("[data-input-cancel-mapping]").click();
    await page.locator("[data-input-add-mapping]").click();
    await page.locator("[data-input-row-enabled]").uncheck();
    await page.locator("[data-input-save-mapping]").click();
    let records = await inputMappingRecords(page);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      enabled: false,
      usageLabel: "",
    });

    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });
    await page.locator("[data-input-reset-mappings]").click();

    await addGameControl(page, {
      event: "eventD",
      family: "Gamepad",
      normalized: "action.primary",
      usageLabel: "Start Charge",
    });
    await addGameControl(page, {
      event: "eventH",
      family: "Gamepad",
      normalized: "action.primary",
      usageLabel: "Charge",
    });
    await addGameControl(page, {
      event: "eventU",
      family: "Gamepad",
      normalized: "action.primary",
      usageLabel: "Release Shot",
    });
    await addGameControl(page, {
      event: "eventDC",
      family: "Mouse",
      normalized: "action.secondary",
      usageLabel: "Double Tap Dodge",
    });
    await addGameControl(page, {
      event: "eventDrag",
      family: "Mouse",
      normalized: "aim.x+",
      usageLabel: "Drag Aim",
    });
    await addGameControl(page, {
      event: "eventAxis",
      family: "Joystick",
      normalized: "trigger.right",
      usageLabel: "Analog Thrust",
    });

    records = await inputMappingRecords(page);
    expect(records).toHaveLength(6);
    expect(records.filter((record) => record.normalizedInput === "action.primary")).toHaveLength(3);
    expect(records.find((record) => record.usageLabel === "Start Charge")).toMatchObject({ eventD: true, eventU: false });
    expect(records.find((record) => record.usageLabel === "Charge")).toMatchObject({ eventH: true });
    expect(records.find((record) => record.usageLabel === "Release Shot")).toMatchObject({ eventD: false, eventU: true });
    expect(records.find((record) => record.usageLabel === "Double Tap Dodge")).toMatchObject({ eventDC: true });
    expect(records.find((record) => record.usageLabel === "Drag Aim")).toMatchObject({ eventDrag: true });
    expect(records.find((record) => record.usageLabel === "Analog Thrust")).toMatchObject({ eventAxis: true, inputFamily: "Joystick" });
    expect(records.every((record) => !Object.hasOwn(record, "controllerId") && !Object.hasOwn(record, "controllerName") && !Object.hasOwn(record, "physicalInput"))).toBe(true);

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Release Shot");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Double Tap Dodge");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Drag Aim");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Account User Controls maps physical input to generic normalized controls", async ({ page }) => {
  const failures = await openRepoPage(page, "/account/user-controls.html", {
    sessionUserKey: MOCK_DB_KEYS.users.user1,
  });

  try {
    await expect(page.locator("[data-session-access-blocked]")).toHaveCount(0);
    await exposeGamepad(page);
    await page.locator("[data-account-user-controls-refresh]").click();
    await expect(page.locator("[data-account-user-controls-device] option")).toContainText([
      "Choose a physical controller",
      "Keyboard/Mouse",
      "Gamepad: Arcade Test Pad",
    ]);
    await expect(page.locator("[data-account-user-controls-types]")).toContainText("Gamepad Axis");
    await page.locator("[data-account-user-controls-device]").selectOption("gamepad-0");
    await page.locator("[data-account-user-controls-add-profile]").click();
    await expect(page.locator("[data-account-user-controls-editing-row]")).toContainText("Gamepad: Arcade Test Pad");
    await expect(page.locator("[data-account-user-controls-input-pair]").filter({ hasText: "Button0" }).locator("[data-account-user-controls-input-normalized]")).toHaveValue("action.primary");
    const axis0 = page.locator("[data-account-user-controls-input-pair]").filter({ hasText: "Axis0" });
    await axis0.locator("[data-account-user-controls-input-negative]").selectOption("move.x-");
    await axis0.locator("[data-account-user-controls-input-positive]").selectOption("move.x+");
    await axis0.locator("[data-account-user-controls-deadzone]").fill("0.4");
    await axis0.locator("[data-account-user-controls-invert]").check();
    await page.locator("[data-account-user-controls-save]").click();

    const profiles = await controllerProfileRecords(page);
    expect(profiles).toHaveLength(1);
    expect(profiles[0]).toMatchObject({
      controllerId: "Arcade Test Pad",
      controllerName: "Arcade Test Pad",
      deviceType: "Gamepad",
      profileName: "Arcade Test Pad Profile",
    });
    expect(profiles[0].inputMappings.find((mapping) => mapping.physicalInput === "Axis0")).toMatchObject({
      deadzone: 0.4,
      invert: true,
      negativeNormalizedInput: "move.x-",
      positiveNormalizedInput: "move.x+",
    });
    expect(profiles[0]).not.toHaveProperty("gameAction");
    expect(profiles[0]).not.toHaveProperty("objectKey");
    expect(JSON.stringify(profiles[0])).not.toContain("eventD");
    expect(JSON.stringify(profiles[0])).not.toContain("eventU");
    expect(JSON.stringify(profiles[0])).not.toContain("eventDC");
    expect(JSON.stringify(profiles[0])).not.toContain("eventDrag");

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-account-user-controls-list]")).toContainText("Gamepad: Arcade Test Pad");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Player Mode persists from Game Configuration, not Controls", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-configuration/index.html?project=player-mode-pr-035");

  try {
    await expect(page.locator("[data-game-configuration-player-mode] option")).toHaveText([
      "1 Player",
      "2+ Turn Based",
      "2+ Concurrent",
    ]);
    await page.locator("[data-game-configuration-player-mode]").selectOption("2+ Concurrent");
    await fillReadyConfiguration(page);
    await page.getByRole("button", { name: "Save Game Configuration" }).click();
    await expect(page.locator("[data-game-configuration-output-player-mode]")).toHaveText("2+ Concurrent");

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-game-configuration-player-mode]")).toHaveValue("2+ Concurrent");
    await expect(page.locator("[data-game-configuration-output-player-mode]")).toHaveText("2+ Concurrent");

    await page.goto(`${failures.server.baseUrl}/toolbox/controls/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("main")).not.toContainText("Player Mode");
    await expect(page.locator("[data-game-configuration-player-mode]")).toHaveCount(0);

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Input Mapping V2 compatibility route points creators to Controls", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/input-mapping-v2/index.html");

  try {
    await expect(page.getByRole("heading", { name: "Input Mapping V2" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open Controls" })).toHaveAttribute("href", "/toolbox/controls/index.html");
    await expect(page.locator("[data-input-mapping-table]")).toHaveCount(0);
    await expect(page.locator("[data-controller-profile-table]")).toHaveCount(0);
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});
