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
    surface: "Controls game/account user split",
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

async function exposeGamepads(page) {
  await page.evaluate(() => {
    function makePad(id, index) {
      return {
        axes: [0, 0, 0, 0],
        buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 })),
        connected: true,
        id,
        index,
        mapping: "standard",
        timestamp: Date.now(),
      };
    }
    Object.defineProperty(navigator, "getGamepads", {
      configurable: true,
      value: () => [
        makePad("Arcade Test Pad", 0),
        makePad("Studio Flight Pad", 1),
      ],
    });
  });
}

async function editGameControl(page, rowText, {
  enabled,
  event = "eventD",
  normalized,
  usageLabel,
} = {}) {
  const row = page.locator("[data-input-mapping-row]").filter({ hasText: rowText }).first();
  await row.getByRole("button", { name: "Edit" }).click();
  if (normalized !== undefined) {
    await page.locator("[data-input-row-normalized]").selectOption(normalized);
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
  ]) {
    const checkbox = page.locator(locator);
    if (await checkbox.isChecked()) {
      await checkbox.uncheck();
    }
  }
  const eventLocatorByField = {
    eventD: "[data-input-row-event-d]",
    eventDC: "[data-input-row-event-d-c]",
    eventH: "[data-input-row-event-h]",
    eventU: "[data-input-row-event-u]",
  };
  await page.locator(eventLocatorByField[event]).check();
  await page.locator("[data-input-save-mapping]").click();
}

test("Toolbox Controls shows game controls only and preserves game mapping presets", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/controls/index.html");

  try {
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator(".tool-center-panel > h2")).toHaveText("Game Controls");
    await expect(page.locator("[data-input-mapping-accordion] > summary")).toHaveText("Game Controls");
    await expect(page.locator("[data-input-family-panel]")).toHaveCount(0);
    await expect(page.locator("[data-input-combo-controls]")).toHaveCount(0);
    await expect(page.locator("[data-input-source-diagnostics]")).toHaveCount(0);
    await expect(page.locator("[data-input-add-mapping], [data-input-add-keyboard-family], [data-input-add-mouse-family], [data-input-add-joystick-family], [data-input-reset-mappings]")).toHaveCount(0);
    await expect(page.locator("[data-input-action-select], [data-input-object-select]")).toHaveCount(0);
    await expect(page.locator("[data-input-mapping-table] th")).toHaveText([
      "Enabled",
      "Normalized Action",
      "Usage Label",
      "D",
      "H",
      "U",
      "DC",
      "Actions",
    ]);
    await expect(page.locator("[data-input-mapping-table] th").filter({ hasText: /Keyboard|Mouse|Joystick|Gamepad|Combo|Object|State|Family/ })).toHaveCount(0);
    await expect(page.locator("[data-input-action-label]")).toContainText(NORMALIZED_INPUTS);
    await expect(page.locator("[data-input-preset]")).toHaveText([
      "Platformer",
      "Shooter",
      "Paddle / Ball",
      "Menu",
      "Vehicle",
      "Fighting",
      "Party / Arena",
    ]);
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Missing Game Control Mapping");

    await page.locator("[data-input-preset='platformer']").click();
    await expect(page.locator("[data-input-status-log]")).toHaveText("Applied platformer preset. Common rows are enabled; alternate rows are disabled.");
    await expect(page.locator("[data-input-mapping-row]")).toHaveCount(7);
    await expect(page.locator("[data-input-mapping-count]")).toHaveText("7");
    await expect(page.locator("[data-input-enabled-count]")).toHaveText("5");
    await expect(page.locator("[data-input-output-count]")).toHaveText("7");
    await expect(page.locator("[data-input-save-status]")).toHaveText("Complete");
    await expect(page.locator("[data-input-mapping-list]")).not.toContainText("Missing Game Control Mapping");

    const jumpRow = page.locator("[data-input-mapping-row]").filter({ hasText: "Jump" }).first();
    await expect(jumpRow.locator("td").nth(0).locator("input")).toBeChecked();
    await expect(jumpRow.locator("input[aria-label='D']")).toBeChecked();
    await expect(jumpRow.locator("input[aria-label='H']")).not.toBeChecked();
    await expect(jumpRow.locator("input[aria-label='U']")).not.toBeChecked();
    await expect(jumpRow.locator("input[aria-label='DC']")).not.toBeChecked();
    await expect(jumpRow.locator("td:has(input[aria-label='D'])")).toHaveAttribute("data-input-event-checked", "true");

    const lookUpRow = page.locator("[data-input-mapping-row]").filter({ hasText: "Look Up" }).first();
    await expect(lookUpRow.locator("td").nth(0).locator("input")).not.toBeChecked();

    const records = await inputMappingRecords(page);
    expect(records).toHaveLength(7);
    expect(records.find((record) => record.usageLabel === "Jump")).toMatchObject({
      enabled: true,
      eventD: true,
      normalizedInput: "action.primary",
      usageLabel: "Jump",
    });
    expect(records.find((record) => record.usageLabel === "Look Up")).toMatchObject({
      enabled: false,
      normalizedInput: "move.y-",
      state: "Disabled",
    });
    expect(records.every((record) => !record.inputFamily)).toBe(true);
    expect(records.every((record) => !Object.hasOwn(record, "controllerId") && !Object.hasOwn(record, "controllerName") && !Object.hasOwn(record, "physicalInput"))).toBe(true);
    expect(JSON.stringify(records)).not.toMatch(/Keyboard|Mouse|Gamepad|Joystick|Button\d+|Key[A-Z]|MouseButton/);

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Game Controls validates rows and persists device-agnostic event fields", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/controls/index.html");

  try {
    await page.locator("[data-input-preset='shooter']").click();
    await expect(page.locator("[data-input-mapping-row]")).toHaveCount(8);

    await page.locator("[data-input-mapping-row]").filter({ hasText: "Fire" }).first().getByRole("button", { name: "Edit" }).click();
    await page.locator("[data-input-row-usage-label]").fill("");
    await page.locator("[data-input-save-mapping]").click();
    await expect(page.locator("[data-input-row-validation]")).toContainText("Add a Usage Label");
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
    await expect(page.locator("[data-input-row-validation]")).toContainText("normalized action");
    await page.locator("[data-input-cancel-mapping]").click();

    await editGameControl(page, "Fire", {
      event: "eventH",
      usageLabel: "Charge Shot",
    });
    await editGameControl(page, "Pause", {
      event: "eventDC",
      usageLabel: "Double Tap Pause",
    });

    let records = await inputMappingRecords(page);
    expect(records).toHaveLength(8);
    expect(records.find((record) => record.usageLabel === "Charge Shot")).toMatchObject({ eventD: false, eventH: true });
    expect(records.find((record) => record.usageLabel === "Double Tap Pause")).toMatchObject({ eventDC: true });
    expect(records.every((record) => !record.inputFamily)).toBe(true);
    expect(records.every((record) => !Object.hasOwn(record, "controllerId") && !Object.hasOwn(record, "controllerName") && !Object.hasOwn(record, "physicalInput"))).toBe(true);

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Charge Shot");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Double Tap Pause");
    records = await inputMappingRecords(page);
    expect(records.find((record) => record.usageLabel === "Charge Shot")).toMatchObject({ eventH: true });

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Account User Controls owns physical input mapping accordions and profiles", async ({ page }) => {
  const failures = await openRepoPage(page, "/account/user-controls.html", {
    sessionUserKey: MOCK_DB_KEYS.users.user1,
  });

  try {
    await expect(page.locator("[data-session-access-blocked]")).toHaveCount(0);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-account-user-controls-section] > summary")).toHaveText([
      "Keyboard",
      "Mouse",
      "Game Controllers",
      "Combo Inputs",
    ]);
    await expect(page.locator("[data-account-user-controls-section='Keyboard']")).toContainText("Visible fallback");
    await expect(page.locator("[data-account-user-controls-section='Keyboard']")).toContainText("KeyW");
    await expect(page.locator("[data-account-user-controls-section='Keyboard']")).toContainText("move.y-");
    await expect(page.locator("[data-account-user-controls-section='Mouse']")).toContainText("MouseButton0");
    await expect(page.locator("[data-account-user-controls-section='Mouse']")).toContainText("action.primary");
    await expect(page.locator("[data-account-user-controls-section='Combo Inputs']")).toContainText("Wireframe only");
    expect(await controllerProfileRecords(page)).toHaveLength(0);

    await page.locator("[data-account-user-controls-save-all]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("FAIL: Create a user control profile before saving.");
    expect(await controllerProfileRecords(page)).toHaveLength(0);

    await expect(page.locator("[data-account-user-controls-device] option")).toContainText([
      "Choose a physical controller",
      "Keyboard",
      "Mouse",
    ]);
    await page.locator("[data-account-user-controls-device]").selectOption("keyboard");
    await page.locator("[data-account-user-controls-add-profile]").click();
    await expect(page.locator("[data-account-user-controls-editing-row]")).toContainText("Keyboard: Keyboard");
    await expect(page.locator("[data-account-user-controls-input-pair]").filter({ hasText: "KeyW" }).locator("[data-account-user-controls-input-normalized]")).toHaveValue("move.y-");
    await page.locator("[data-account-user-controls-save-all]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Saved Keyboard Profile.");

    await page.locator("[data-account-user-controls-device]").selectOption("mouse");
    await page.locator("[data-account-user-controls-add-profile]").click();
    await expect(page.locator("[data-account-user-controls-editing-row]")).toContainText("Mouse: Mouse");
    await expect(page.locator("[data-account-user-controls-input-pair]").filter({ hasText: "MouseButton0" }).locator("[data-account-user-controls-input-normalized]")).toHaveValue("action.primary");
    await page.locator("[data-account-user-controls-save-all]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Saved Mouse Profile.");

    await exposeGamepads(page);
    await expect(page.locator("[data-account-user-controls-device-status]")).toContainText("2 game controllers detected automatically", { timeout: 4000 });
    await expect(page.locator("[data-account-user-controls-device] option")).toContainText([
      "Choose a physical controller",
      "Keyboard",
      "Mouse",
      "Gamepad: Arcade Test Pad",
      "Gamepad: Studio Flight Pad",
    ]);
    await page.locator("[data-account-user-controls-device]").selectOption("gamepad-1");
    await expect(page.locator("[data-account-user-controls-device]")).toHaveValue("gamepad-1");
    await page.locator("[data-account-user-controls-add-profile]").click();
    await expect(page.locator("[data-account-user-controls-editing-row]")).toContainText("Gamepad: Studio Flight Pad");
    await expect(page.locator("[data-account-user-controls-input-pair]").filter({ hasText: "Button0" }).locator("[data-account-user-controls-input-normalized]")).toHaveValue("action.primary");
    const axis0 = page.locator("[data-account-user-controls-input-pair]").filter({ hasText: "Axis0" });
    await axis0.locator("[data-account-user-controls-deadzone]").fill("0.4");
    await axis0.locator("[data-account-user-controls-invert]").check();
    const axis0Sensitivity = axis0.locator("[data-account-user-controls-sensitivity]");
    await expect(axis0Sensitivity).toBeVisible();
    await axis0Sensitivity.fill("125");
    await expect(axis0.locator("[data-slider-value-for='accountUserControlsSensitivity']")).toHaveText("125%");
    await page.locator("[data-account-user-controls-save-all]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Saved Studio Flight Pad Profile.");

    const profiles = await controllerProfileRecords(page);
    expect(profiles).toHaveLength(3);
    expect(profiles.find((profile) => profile.profileName === "Keyboard Profile")).toMatchObject({
      controllerId: "generic-keyboard",
      controllerName: "Keyboard",
      deviceType: "Keyboard",
    });
    expect(profiles.find((profile) => profile.profileName === "Mouse Profile")).toMatchObject({
      controllerId: "generic-mouse",
      controllerName: "Mouse",
      deviceType: "Mouse",
    });
    const gamepadProfile = profiles.find((profile) => profile.profileName === "Studio Flight Pad Profile");
    expect(gamepadProfile).toMatchObject({
      controllerId: "Studio Flight Pad",
      controllerName: "Studio Flight Pad",
      deviceType: "Gamepad",
      profileName: "Studio Flight Pad Profile",
    });
    expect(gamepadProfile.inputMappings.find((mapping) => mapping.physicalInput === "Axis0")).toMatchObject({
      deadzone: 0.4,
      invert: true,
      sensitivity: 125,
    });
    expect(JSON.stringify(profiles)).not.toContain("gameAction");
    expect(JSON.stringify(profiles)).not.toContain("objectKey");
    expect(JSON.stringify(profiles)).not.toContain("eventD");
    expect(JSON.stringify(profiles)).not.toContain("eventU");
    expect(JSON.stringify(profiles)).not.toContain("eventDC");

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-account-user-controls-list]")).toContainText("Keyboard: Keyboard");
    await expect(page.locator("[data-account-user-controls-list]")).toContainText("Mouse: Mouse");
    await expect(page.locator("[data-account-user-controls-list]")).toContainText("Gamepad: Studio Flight Pad");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Account navigation exposes User Controls in sorted browseable menus", async ({ page }) => {
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
    await expect(page.locator(".site-header .nav-item").filter({ has: page.locator("[data-route='account']") }).last().locator(".sub-menu a")).toHaveText([
      "Account Home",
      "Achievements",
      "Logout",
      "Preferences",
      "Profile",
      "Security",
      "User Controls",
    ]);

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Controls split keeps shared engine input contracts in the account surface", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/controls/index.html");

  try {
    const sources = await page.evaluate(async () => {
      const [controls, accountControls] = await Promise.all([
        fetch("/toolbox/controls/controls.js").then((response) => response.text()),
        fetch("/account/user-controls-page.js").then((response) => response.text()),
      ]);
      return { accountControls, controls };
    });
    expect(sources.controls).toContain("../../src/engine/input/NormalizedInputRegistry.js");
    expect(sources.controls).not.toContain("../../src/engine/input/InputService.js");
    expect(sources.controls).not.toContain("DEVICE_POLL_INTERVAL_MS");
    expect(sources.accountControls).toContain("../src/engine/input/InputService.js");
    expect(sources.accountControls).toContain("../src/engine/input/NormalizedInputRegistry.js");
    expect(sources.accountControls).toContain("../src/engine/input/GamepadInputClassifier.js");
    expect(sources.accountControls).toContain("DEVICE_POLL_INTERVAL_MS");
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
