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

async function editGameControl(page, rowText, {
  enabled,
  event = "eventD",
  family,
  normalized,
  usageLabel,
} = {}) {
  const row = page.locator("[data-input-mapping-row]").filter({ hasText: rowText }).first();
  await row.getByRole("button", { name: "Edit" }).click();
  if (normalized !== undefined) {
    await page.locator("[data-input-row-normalized]").selectOption(normalized);
  }
  if (family !== undefined) {
    await page.locator("[data-input-row-family]").selectOption(family);
  }
  if (usageLabel !== undefined) {
    await page.locator("[data-input-row-usage-label]").fill(usageLabel);
  }
  if (enabled === false) {
    await page.locator("[data-input-row-enabled]").uncheck();
  } else if (enabled === true) {
    await page.locator("[data-input-row-enabled]").check();
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
    await expect(page.locator("[data-input-source-diagnostics] li")).toHaveCount(7);
    await expect(page.locator("[data-input-device-count]")).toHaveText("7");
    await expect(page.locator("[data-input-source-diagnostics] li[data-input-device-diagnostic='keyboard']")).toHaveAttribute("title", /Keyboard key states/);
    await expect(page.locator("[data-input-source-diagnostics] li[data-input-device-diagnostic='mouse']")).toHaveAttribute("aria-label", /Mouse buttons/);
    await expect(page.locator("[data-input-device-guidance]")).toContainText("game-owned");
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

    await page.locator("[data-input-add-mapping]").click();
    await expect(page.locator("[data-input-status-log]")).toHaveText("Added the full normalized game control set. Common rows are enabled; alternate rows are disabled.");
    await expect(page.locator("[data-input-mapping-row]")).toHaveCount(NORMALIZED_INPUTS.length);
    await expect(page.locator("[data-input-mapping-count]")).toHaveText(String(NORMALIZED_INPUTS.length));
    await expect(page.locator("[data-input-output-count]")).toHaveText(String(NORMALIZED_INPUTS.length));
    await expect(page.locator("[data-input-save-status]")).toHaveText("Complete");
    await expect(page.locator("[data-input-mapping-list]")).not.toContainText("Missing Game Control Mapping");
    const primaryActionRow = page.locator("[data-input-mapping-row]").filter({ hasText: "action.primary" }).first();
    await expect(primaryActionRow.locator("td").nth(0).locator("input")).toBeChecked();
    await expect(primaryActionRow.locator("td").nth(11)).toHaveText("Active");
    const aimRightRow = page.locator("[data-input-mapping-row]").filter({ hasText: "aim.x+" }).first();
    await expect(aimRightRow.locator("td").nth(0).locator("input")).not.toBeChecked();
    await expect(aimRightRow.locator("td").nth(11)).toHaveText("Disabled");
    let records = await inputMappingRecords(page);
    expect(records).toHaveLength(NORMALIZED_INPUTS.length);
    expect(records.map((record) => record.normalizedInput).sort()).toEqual([...NORMALIZED_INPUTS].sort());
    expect(records.find((record) => record.normalizedInput === "action.primary")).toMatchObject({
      enabled: true,
      objectKey: "global",
      state: "Active",
      usageLabel: "Primary Action",
    });
    expect(records.find((record) => record.normalizedInput === "aim.x+")).toMatchObject({
      enabled: false,
      state: "Disabled",
      usageLabel: "Aim Right",
    });

    await page.locator("[data-input-add-keyboard-family]").click();
    await expect(page.locator("[data-input-status-log]")).toHaveText("Added generic Keyboard game control rows.");
    await expect(page.locator("[data-input-mapping-row]")).toHaveCount(NORMALIZED_INPUTS.length + 10);
    const genericKeyboardPrimary = page.locator("[data-input-mapping-row='generic-keyboard-control-global-5-action-primary']");
    await expect(genericKeyboardPrimary).toContainText("Keyboard");
    await genericKeyboardPrimary.getByRole("button", { name: "Edit" }).click();
    await expect(page.locator("[data-input-row-family]")).toHaveValue("Keyboard");
    await page.locator("[data-input-row-usage-label]").fill("Keyboard Jump");
    await page.locator("[data-input-save-mapping]").click();
    await expect(page.locator("[data-input-mapping-row='generic-keyboard-control-global-5-action-primary']")).toContainText("Keyboard Jump");
    records = await inputMappingRecords(page);
    expect(records.filter((record) => record.id.startsWith("generic-keyboard-control-"))).toHaveLength(10);
    expect(records.find((record) => record.usageLabel === "Keyboard Jump")).toMatchObject({
      inputFamily: "Keyboard",
      normalizedInput: "action.primary",
    });

    await page.locator("[data-input-add-mouse-family]").click();
    await expect(page.locator("[data-input-status-log]")).toHaveText("Added generic Mouse game control rows.");
    await expect(page.locator("[data-input-mapping-row]")).toHaveCount(NORMALIZED_INPUTS.length + 16);
    await expect(page.locator("[data-input-mapping-row='generic-mouse-control-global-2-aim-x']")).toContainText("Mouse");
    records = await inputMappingRecords(page);
    expect(records.filter((record) => record.id.startsWith("generic-mouse-control-"))).toHaveLength(6);
    expect(records.filter((record) => record.id.startsWith("generic-mouse-control-")).every((record) => record.inputFamily === "Mouse")).toBe(true);

    await page.locator("[data-input-preset='platformer']").click();
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Move Left");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Jump");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Look Up");
    records = await inputMappingRecords(page);
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
    const initialRecords = await inputMappingRecords(page);
    expect(initialRecords).toHaveLength(NORMALIZED_INPUTS.length);

    await page.locator("[data-input-mapping-row]").filter({ hasText: "Primary Action" }).first().getByRole("button", { name: "Edit" }).click();
    await page.locator("[data-input-row-usage-label]").fill("");
    await page.locator("[data-input-save-mapping]").click();
    await expect(page.locator("[data-input-row-validation]")).toContainText("Add a Usage Label");
    expect((await inputMappingRecords(page)).find((record) => record.normalizedInput === "action.primary")).toMatchObject({
      usageLabel: "Primary Action",
    });
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
    expect((await inputMappingRecords(page)).find((record) => record.normalizedInput === "action.primary")).toMatchObject({
      normalizedInput: "action.primary",
      usageLabel: "Primary Action",
    });
    await page.locator("[data-input-cancel-mapping]").click();
    await editGameControl(page, "Primary Action", {
      event: "eventD",
      family: "Gamepad",
      usageLabel: "Start Charge",
    });
    await editGameControl(page, "Secondary Action", {
      event: "eventDC",
      family: "Mouse",
      usageLabel: "Double Tap Dodge",
    });
    await editGameControl(page, "Aim Right", {
      event: "eventDrag",
      family: "Mouse",
      usageLabel: "Drag Aim",
    });
    await editGameControl(page, "Right Trigger", {
      event: "eventAxis",
      family: "Joystick",
      usageLabel: "Analog Thrust",
    });

    let records = await inputMappingRecords(page);
    expect(records).toHaveLength(NORMALIZED_INPUTS.length);
    expect(records.find((record) => record.usageLabel === "Start Charge")).toMatchObject({ eventD: true, eventU: false });
    expect(records.find((record) => record.usageLabel === "Double Tap Dodge")).toMatchObject({ eventDC: true });
    expect(records.find((record) => record.usageLabel === "Drag Aim")).toMatchObject({ eventDrag: true });
    expect(records.find((record) => record.usageLabel === "Analog Thrust")).toMatchObject({ eventAxis: true, inputFamily: "Joystick" });
    expect(records.every((record) => !Object.hasOwn(record, "controllerId") && !Object.hasOwn(record, "controllerName") && !Object.hasOwn(record, "physicalInput"))).toBe(true);

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Start Charge");
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
    await page.locator("[data-account-user-controls-save-all]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("FAIL: Create a user control profile before saving.");
    await exposeGamepad(page);
    await page.locator("[data-account-user-controls-refresh]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Device list refreshed. Keyboard/Mouse and 1 game controller available.");
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
    const axis0Sensitivity = axis0.locator("[data-account-user-controls-sensitivity]");
    await expect(axis0Sensitivity).toBeVisible();
    await expect(axis0Sensitivity).toHaveAttribute("min", "10");
    await expect(axis0Sensitivity).toHaveAttribute("max", "200");
    await axis0Sensitivity.fill("150");
    await expect(axis0.locator("[data-slider-value-for='accountUserControlsSensitivity']")).toHaveText("150%");
    await axis0Sensitivity.dblclick();
    await expect(axis0Sensitivity).toHaveValue("100");
    await expect(axis0.locator("[data-slider-value-for='accountUserControlsSensitivity']")).toHaveText("100%");
    await axis0Sensitivity.fill("125");
    await page.locator("[data-account-user-controls-save-all]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Saved Arcade Test Pad Profile.");

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
      sensitivity: 125,
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

test("Account pages use shared side navigation with active state", async ({ page }) => {
  const failures = await openRepoPage(page, "/account/user-controls.html", {
    sessionUserKey: MOCK_DB_KEYS.users.user1,
  });

  try {
    await expect(page.locator("[data-account-side-nav]")).toBeVisible();
    await expect(page.locator("[data-account-side-nav-link]")).toHaveText([
      "Account Home",
      "Achievements",
      "Preferences",
      "Profile",
      "Security",
      "User Controls",
    ]);
    await expect(page.locator("[data-account-side-nav-link][aria-current='page']")).toHaveText("User Controls");
    await expect(page.locator("[data-account-side-nav-link]", { hasText: "Profile" })).toHaveAttribute("href", /account\/profile\.html$/);

    await page.goto(`${failures.server.baseUrl}/account/profile.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-account-side-nav]")).toBeVisible();
    await expect(page.locator("[data-account-side-nav-link][aria-current='page']")).toHaveText("Profile");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Controls input implementation is owned by shared engine input services", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/controls/index.html");

  try {
    const sources = await page.evaluate(async () => {
      const [controls, accountControls] = await Promise.all([
        fetch("/toolbox/controls/controls.js").then((response) => response.text()),
        fetch("/account/user-controls-page.js").then((response) => response.text()),
      ]);
      return { accountControls, controls };
    });
    expect(sources.controls).toContain("../../src/engine/input/InputService.js");
    expect(sources.controls).toContain("../../src/engine/input/NormalizedInputRegistry.js");
    expect(sources.accountControls).toContain("../src/engine/input/InputService.js");
    expect(sources.accountControls).toContain("../src/engine/input/NormalizedInputRegistry.js");
    expect(sources.accountControls).toContain("../src/engine/input/GamepadInputClassifier.js");
    for (const source of [sources.controls, sources.accountControls]) {
      expect(source).not.toMatch(/addEventListener\(\s*["']keydown/);
      expect(source).not.toMatch(/addEventListener\(\s*["']keyup/);
      expect(source).not.toMatch(/gamepadconnected/);
      expect(source).not.toMatch(/navigator\.getGamepads/);
    }

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Player Mode is owned by Game Design and displayed from the Configuration handoff", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html?project=player-mode-pr-036");

  try {
    await expect(page.locator("[data-game-design-player-mode] option")).toHaveText([
      "Select player mode",
      "1 Player",
      "2+ Turn Based",
      "2+ Concurrent",
    ]);
    await page.getByLabel("Game Type").selectOption("Puzzle");
    await page.getByLabel("Genre").selectOption("Adventure");
    await page.getByLabel("Play Style").selectOption("Single Player");
    await page.getByLabel("Player Mode").selectOption("2+ Concurrent");
    await page.getByLabel("Design Summary").fill("Player mode is configured with play style on Game Design.");
    await page.getByRole("button", { name: "Save Game Design" }).click();
    await expect(page.locator("[data-game-design-output-player-mode]")).toHaveText("2+ Concurrent");

    await page.goto(`${failures.server.baseUrl}/toolbox/game-configuration/index.html?project=player-mode-pr-036`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-game-configuration-player-mode]")).toHaveCount(0);
    await expect(page.locator("[data-game-configuration-output-player-mode]")).toHaveText("1 Player");

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
