import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const GAME_CONTROL_NORMALIZED_INPUTS = [
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
  "action.pause",
  "action.start",
  "action.select",
];

const GAME_CONTROL_USAGE_LABELS = [
  "Move Left",
  "Move Right",
  "Move Up",
  "Move Down",
  "Aim Left",
  "Aim Right",
  "Aim Up",
  "Aim Down",
  "Primary Action",
  "Secondary Action",
  "Third Action",
  "Fourth Action",
  "Confirm",
  "Cancel",
  "Pause",
  "Start",
  "Select",
];

const EVENT_CONTROL_LABELS = {
  eventD: "D = Down",
  eventDC: "DC = Double Click / Double Press",
  eventH: "H = Hold",
  eventU: "U = Up",
};

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

async function selectedInputDeviceRecords(page) {
  return page.evaluate(async () => {
    const response = await fetch("/api/mock-db/snapshot");
    const payload = await response.json();
    return payload.data.tables.player_input_device_selections || [];
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

async function gameControlRowLabels(page) {
  return page.locator("[data-input-mapping-table] tbody tr").evaluateAll((rows) => rows.map((row) => {
    const usageInput = row.querySelector("[data-input-row-usage-label]");
    if (usageInput) {
      return usageInput.value;
    }
    return row.children[2]?.textContent?.trim() || "";
  }));
}

test("Toolbox Controls shows game controls only and keeps presets wireframe safe", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/controls/index.html");

  try {
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator(".tool-center-panel > h2")).toHaveText("Game Controls");
    await expect(page.locator("[data-controls-side-accordion='left']")).toBeVisible();
    await expect(page.locator("[data-controls-side-accordion='right']")).toBeVisible();
    await expect(page.locator("[data-input-mapping-accordion] > summary")).toHaveText("Game Controls");
    await expect(page.locator("summary").filter({ hasText: "Normalized Controls" })).toHaveCount(0);
    await expect(page.locator("[data-input-action-catalog], [data-input-default-actions], [data-input-action-label]")).toHaveCount(0);
    await expect(page.locator("[data-input-family-panel]")).toHaveCount(0);
    await expect(page.locator("[data-input-combo-controls] > summary")).toHaveText("Combo Controls");
    await expect(page.locator("[data-input-combo-controls]")).toContainText("Wireframe only: Keyboard Shift + Mouse Right Click can become a future combo control.");
    await expect(page.locator("[data-input-preset-planning] li")).toHaveText([
      "Fighting",
      "Menu",
      "Paddle / Ball",
      "Party / Arena",
      "Platformer",
      "Shooter",
      "Vehicle",
    ]);
    await expect(page.locator("[data-input-preset]")).toHaveCount(0);
    await expect(page.locator(".tool-column").first()).toContainText("Wireframe only: Presets can become future genre-specific Game Controls templates.");
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
    await expect(page.locator("[data-input-mapping-table] th").nth(3)).toHaveAttribute("title", "Down");
    await expect(page.locator("[data-input-mapping-table] th").nth(3)).toHaveAttribute("aria-label", EVENT_CONTROL_LABELS.eventD);
    await expect(page.locator("[data-input-mapping-table] th").nth(4)).toHaveAttribute("title", "Hold");
    await expect(page.locator("[data-input-mapping-table] th").nth(4)).toHaveAttribute("aria-label", EVENT_CONTROL_LABELS.eventH);
    await expect(page.locator("[data-input-mapping-table] th").nth(5)).toHaveAttribute("title", "Up");
    await expect(page.locator("[data-input-mapping-table] th").nth(5)).toHaveAttribute("aria-label", EVENT_CONTROL_LABELS.eventU);
    await expect(page.locator("[data-input-mapping-table] th").nth(6)).toHaveAttribute("title", "Double Click / Double Press");
    await expect(page.locator("[data-input-mapping-table] th").nth(6)).toHaveAttribute("aria-label", EVENT_CONTROL_LABELS.eventDC);
    await expect(page.locator("[data-input-mapping-table] th").filter({ hasText: /Keyboard|Mouse|Joystick|Gamepad|Combo|Object|State|Family/ })).toHaveCount(0);
    await expect(page.locator("[data-input-status-log]")).toHaveText("Loaded default Game Controls. Common rows are enabled; alternate rows are disabled.");
    await expect(page.locator("[data-input-mapping-row]")).toHaveCount(GAME_CONTROL_NORMALIZED_INPUTS.length);
    await expect(page.locator("[data-input-mapping-count]")).toHaveText(String(GAME_CONTROL_NORMALIZED_INPUTS.length));
    await expect(page.locator("[data-input-enabled-count]")).toHaveText("10");
    await expect(page.locator("[data-input-output-count]")).toHaveText(String(GAME_CONTROL_NORMALIZED_INPUTS.length));
    await expect(page.locator("[data-input-save-status]")).toHaveText("Complete");
    await expect(page.locator("[data-input-mapping-list]")).not.toContainText("Missing Game Control Mapping");
    await expect(page.locator("[data-input-mapping-list]")).not.toContainText("dpad.");
    await expect(page.locator("[data-input-mapping-list]")).not.toContainText("trigger.");
    await expect(page.locator("[data-input-mapping-list]")).not.toContainText("D-Pad");
    await expect(page.locator("[data-input-mapping-list]")).not.toContainText("Trigger");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("aim.x-");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("aim.x+");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("aim.y-");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("aim.y+");

    const primaryRow = page.locator("[data-input-mapping-row]").filter({ hasText: "Primary Action" }).first();
    await expect(primaryRow.locator("td").nth(0).locator("input")).toBeChecked();
    await expect(primaryRow.locator(`input[aria-label="${EVENT_CONTROL_LABELS.eventD}"]`)).toBeChecked();
    await expect(primaryRow.locator(`input[aria-label="${EVENT_CONTROL_LABELS.eventH}"]`)).not.toBeChecked();
    await expect(primaryRow.locator(`input[aria-label="${EVENT_CONTROL_LABELS.eventU}"]`)).not.toBeChecked();
    await expect(primaryRow.locator(`input[aria-label="${EVENT_CONTROL_LABELS.eventDC}"]`)).not.toBeChecked();
    await expect(primaryRow.locator(`td:has(input[aria-label="${EVENT_CONTROL_LABELS.eventD}"])`)).toHaveAttribute("data-input-event-checked", "true");
    await expect(primaryRow.locator(`input[aria-label="${EVENT_CONTROL_LABELS.eventD}"]`)).toBeDisabled();
    await expect(primaryRow.locator(`input[aria-label="${EVENT_CONTROL_LABELS.eventH}"]`)).toBeDisabled();

    const checkedDisabledCheckboxStyle = await primaryRow.locator(`input[aria-label="${EVENT_CONTROL_LABELS.eventD}"]`).evaluate((input) => {
      const checkboxStyle = window.getComputedStyle(input);
      const checkStyle = window.getComputedStyle(input, "::before");
      return {
        backgroundColor: checkboxStyle.backgroundColor,
        checkBackgroundColor: checkStyle.backgroundColor,
        checkTransform: checkStyle.transform,
        opacity: checkboxStyle.opacity,
      };
    });
    const uncheckedDisabledCheckboxStyle = await primaryRow.locator(`input[aria-label="${EVENT_CONTROL_LABELS.eventH}"]`).evaluate((input) => {
      const checkboxStyle = window.getComputedStyle(input);
      const checkStyle = window.getComputedStyle(input, "::before");
      return {
        backgroundColor: checkboxStyle.backgroundColor,
        checkTransform: checkStyle.transform,
        opacity: checkboxStyle.opacity,
      };
    });
    expect(checkedDisabledCheckboxStyle.backgroundColor).toBe(uncheckedDisabledCheckboxStyle.backgroundColor);
    expect(checkedDisabledCheckboxStyle.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(checkedDisabledCheckboxStyle.checkBackgroundColor).toBe("rgb(18, 18, 18)");
    expect(checkedDisabledCheckboxStyle.checkTransform).not.toBe("matrix(0, 0, 0, 0, 0, 0)");
    expect(checkedDisabledCheckboxStyle.opacity).toBe("1");
    expect(uncheckedDisabledCheckboxStyle.checkTransform).toBe("matrix(0, 0, 0, 0, 0, 0)");
    expect(uncheckedDisabledCheckboxStyle.opacity).toBe("1");

    const moveLeftRow = page.locator("[data-input-mapping-row]").filter({ hasText: "Move Left" }).first();
    await expect(moveLeftRow.locator(`input[aria-label="${EVENT_CONTROL_LABELS.eventD}"]`)).not.toBeChecked();
    await expect(moveLeftRow.locator(`input[aria-label="${EVENT_CONTROL_LABELS.eventH}"]`)).toBeChecked();
    await expect(moveLeftRow.locator(`input[aria-label="${EVENT_CONTROL_LABELS.eventU}"]`)).not.toBeChecked();
    await expect(moveLeftRow.locator(`input[aria-label="${EVENT_CONTROL_LABELS.eventDC}"]`)).not.toBeChecked();

    const aimRightRow = page.locator("[data-input-mapping-row]").filter({ hasText: "Aim Right" }).first();
    await expect(aimRightRow.locator("td").nth(0).locator("input")).not.toBeChecked();
    await expect(aimRightRow.locator(`input[aria-label="${EVENT_CONTROL_LABELS.eventD}"]`)).not.toBeChecked();
    await expect(aimRightRow.locator(`input[aria-label="${EVENT_CONTROL_LABELS.eventH}"]`)).toBeChecked();
    await expect(aimRightRow.locator(`input[aria-label="${EVENT_CONTROL_LABELS.eventU}"]`)).not.toBeChecked();
    await expect(aimRightRow.locator(`input[aria-label="${EVENT_CONTROL_LABELS.eventDC}"]`)).not.toBeChecked();

    const pauseRow = page.locator("[data-input-mapping-row]").filter({ hasText: "Pause" }).first();
    await expect(pauseRow).toHaveAttribute("data-input-engine-owned", "true");
    await expect(pauseRow).toContainText("Pause is handled by the engine.");
    await expect(pauseRow.getByRole("button", { name: "Edit" })).toHaveCount(0);
    await expect(pauseRow.getByRole("button", { name: "Trash" })).toHaveCount(0);

    let records = await inputMappingRecords(page);
    expect(records).toHaveLength(GAME_CONTROL_NORMALIZED_INPUTS.length);
    expect(records.map((record) => record.normalizedInput).sort()).toEqual([...GAME_CONTROL_NORMALIZED_INPUTS].sort());
    expect(records.find((record) => record.usageLabel === "Move Left")).toMatchObject({
      eventD: false,
      eventDC: false,
      eventH: true,
      eventU: false,
      normalizedInput: "move.x-",
    });
    expect(records.find((record) => record.usageLabel === "Primary Action")).toMatchObject({
      enabled: true,
      eventD: true,
      normalizedInput: "action.primary",
      usageLabel: "Primary Action",
    });
    expect(records.find((record) => record.usageLabel === "Aim Right")).toMatchObject({
      enabled: false,
      eventD: false,
      eventDC: false,
      eventH: true,
      eventU: false,
      normalizedInput: "aim.x+",
      state: "Disabled",
    });
    expect(records.find((record) => record.normalizedInput === "action.pause")).toMatchObject({
      enabled: true,
      normalizedInput: "action.pause",
      usageLabel: "Pause",
    });
    expect(records.every((record) => !record.inputFamily)).toBe(true);
    expect(records.every((record) => !Object.hasOwn(record, "controllerId") && !Object.hasOwn(record, "controllerName") && !Object.hasOwn(record, "physicalInput"))).toBe(true);
    expect(JSON.stringify(records)).not.toMatch(/Keyboard|Mouse|Gamepad|Joystick|Button\d+|Key[A-Z]|MouseButton|dpad\.|trigger\./);

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Game Controls edits the selected row in place and preserves row order", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/controls/index.html");

  try {
    await expect(page.locator("[data-input-mapping-row]")).toHaveCount(GAME_CONTROL_NORMALIZED_INPUTS.length);
    expect(await gameControlRowLabels(page)).toEqual(GAME_CONTROL_USAGE_LABELS);

    await page.locator("[data-input-mapping-table] tbody tr").first().getByRole("button", { name: "Edit" }).click();
    await expect(page.locator("[data-input-mapping-table] tbody tr").first()).toHaveAttribute("data-input-editing-row", "true");
    await expect(page.locator("[data-input-row-usage-label]")).toHaveValue("Move Left");
    await page.locator("[data-input-row-usage-label]").fill("Move Left Prime");
    await page.locator("[data-input-save-mapping]").click();
    await expect(page.locator("[data-input-mapping-table] tbody tr").first()).toContainText("Move Left Prime");
    expect(await gameControlRowLabels(page)).toEqual([
      "Move Left Prime",
      ...GAME_CONTROL_USAGE_LABELS.slice(1),
    ]);

    const aimDownIndex = GAME_CONTROL_USAGE_LABELS.indexOf("Aim Down");
    await page.locator("[data-input-mapping-row]").filter({ hasText: "Aim Down" }).first().getByRole("button", { name: "Edit" }).click();
    const rowsDuringMiddleEdit = page.locator("[data-input-mapping-table] tbody tr");
    await expect(rowsDuringMiddleEdit.nth(aimDownIndex)).toHaveAttribute("data-input-editing-row", "true");
    await expect(rowsDuringMiddleEdit.first()).not.toHaveAttribute("data-input-editing-row", "true");
    await expect(page.locator("[data-input-row-usage-label]")).toHaveValue("Aim Down");
    expect(await gameControlRowLabels(page)).toEqual([
      "Move Left Prime",
      ...GAME_CONTROL_USAGE_LABELS.slice(1, aimDownIndex),
      "Aim Down",
      ...GAME_CONTROL_USAGE_LABELS.slice(aimDownIndex + 1),
    ]);
    await page.locator("[data-input-row-usage-label]").fill("Aim Down Draft");
    await page.locator("[data-input-cancel-mapping]").click();
    expect(await gameControlRowLabels(page)).toEqual([
      "Move Left Prime",
      ...GAME_CONTROL_USAGE_LABELS.slice(1),
    ]);

    const pauseRow = page.locator("[data-input-mapping-row]").filter({ hasText: "Pause" }).first();
    await expect(pauseRow).toContainText("Pause is handled by the engine.");
    await expect(pauseRow.getByRole("button", { name: "Edit" })).toHaveCount(0);
    await expect(pauseRow.getByRole("button", { name: "Trash" })).toHaveCount(0);

    await page.locator("[data-input-mapping-row]").filter({ hasText: "Secondary Action" }).first().getByRole("button", { name: "Trash" }).click();
    const labelsAfterTrash = await gameControlRowLabels(page);
    expect(labelsAfterTrash).not.toContain("Secondary Action");
    expect(labelsAfterTrash).toEqual([
      "Move Left Prime",
      "Move Right",
      "Move Up",
      "Move Down",
      "Aim Left",
      "Aim Right",
      "Aim Up",
      "Aim Down",
      "Primary Action",
      "Third Action",
      "Fourth Action",
      "Confirm",
      "Cancel",
      "Pause",
      "Start",
      "Select",
    ]);

    let records = await inputMappingRecords(page);
    expect(records).toHaveLength(GAME_CONTROL_NORMALIZED_INPUTS.length - 1);
    expect(records.map((record) => record.usageLabel)).toEqual(labelsAfterTrash);

    await page.reload({ waitUntil: "networkidle" });
    expect(await gameControlRowLabels(page)).toEqual(labelsAfterTrash);
    records = await inputMappingRecords(page);
    expect(records.map((record) => record.usageLabel)).toEqual(labelsAfterTrash);

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Game Controls validates rows and persists device-agnostic event fields", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/controls/index.html");

  try {
    await expect(page.locator("[data-input-preset]")).toHaveCount(0);
    await expect(page.locator("[data-input-mapping-row]")).toHaveCount(GAME_CONTROL_NORMALIZED_INPUTS.length);

    await page.locator("[data-input-mapping-row]").filter({ hasText: "Primary Action" }).first().getByRole("button", { name: "Edit" }).click();
    const gameControlOptions = await page.locator("[data-input-row-normalized] option").evaluateAll((options) => options.map((option) => option.value));
    expect(gameControlOptions).toEqual(GAME_CONTROL_NORMALIZED_INPUTS);
    expect(gameControlOptions).not.toContain("dpad.up");
    expect(gameControlOptions).not.toContain("trigger.left");
    expect(gameControlOptions).not.toContain("action.menu");
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

    await editGameControl(page, "Primary Action", {
      event: "eventH",
      usageLabel: "Charge Shot",
    });

    let records = await inputMappingRecords(page);
    expect(records).toHaveLength(GAME_CONTROL_NORMALIZED_INPUTS.length);
    expect(records.find((record) => record.usageLabel === "Charge Shot")).toMatchObject({ eventD: false, eventH: true });
    expect(records.find((record) => record.normalizedInput === "action.pause")).toMatchObject({
      enabled: true,
      eventD: true,
      eventDC: false,
      eventH: false,
      eventU: false,
      usageLabel: "Pause",
    });
    expect(records.every((record) => !record.inputFamily)).toBe(true);
    expect(records.every((record) => !Object.hasOwn(record, "controllerId") && !Object.hasOwn(record, "controllerName") && !Object.hasOwn(record, "physicalInput"))).toBe(true);

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Charge Shot");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Pause is handled by the engine.");
    records = await inputMappingRecords(page);
    expect(records.find((record) => record.usageLabel === "Charge Shot")).toMatchObject({ eventH: true });
    expect(records.find((record) => record.normalizedInput === "action.pause")).toMatchObject({ enabled: true, usageLabel: "Pause" });

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("User Controls owns physical input mapping accordions and profiles", async ({ page }) => {
  const failures = await openRepoPage(page, "/account/user-controls.html", {
    sessionUserKey: MOCK_DB_KEYS.users.user1,
  });

  try {
    await expect(page.locator("[data-session-access-blocked]")).toHaveCount(0);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "User Controls" })).toBeVisible();
    await expect(page.locator(".card-body")).not.toContainText("Account User Controls");
    await expect(page.locator(".account-panel--fill")).toBeVisible();
    await expect(page.locator(".card--fill")).toBeVisible();
    await expect(page.locator(".card-body--fill")).toBeVisible();
    await expect(page.locator("[data-account-user-controls-section] > summary")).toHaveText([
      "Keyboard",
      "Mouse",
      "Game Controllers",
      "Combo Inputs",
    ]);
    await expect(page.locator("[data-account-user-controls-selected-device-options]")).toHaveCount(0);
    const supportedControlTypes = await page.locator("[data-account-user-controls-types] li").allTextContents();
    expect(supportedControlTypes).toEqual([...supportedControlTypes].sort((left, right) => left.localeCompare(right)));
    const supportedControlTypeLayout = await page.locator("[data-account-user-controls-types]").evaluate((list) => {
      const style = getComputedStyle(list);
      const leftPositions = Array.from(list.querySelectorAll("li"))
        .map((item) => Math.round(item.getBoundingClientRect().left));
      return {
        columnCount: style.columnCount,
        listStylePosition: style.listStylePosition,
        paddingLeft: Number.parseFloat(style.paddingLeft),
        uniqueColumns: new Set(leftPositions).size,
      };
    });
    expect(supportedControlTypeLayout).toMatchObject({
      columnCount: "2",
      listStylePosition: "outside",
    });
    expect(supportedControlTypeLayout.paddingLeft).toBeGreaterThan(0);
    expect(supportedControlTypeLayout.uniqueColumns).toBeGreaterThan(1);
    await expect(page.locator("[data-account-user-controls-selected-device-status]")).toHaveText("Default Profile");
    await expect(page.locator("[data-account-user-controls-default-profile='Mouse'] td").first().locator("[data-account-user-controls-selected-device='default:mouse']")).toBeVisible();
    await page.locator("[data-account-user-controls-selected-device='default:mouse']").check();
    await expect(page.locator("[data-account-user-controls-selected-device-status]")).toHaveText("Selected Device: Mouse Default Profile.");
    await expect.poll(async () => (await selectedInputDeviceRecords(page)).length).toBe(1);
    expect(await selectedInputDeviceRecords(page)).toEqual([
      expect.objectContaining({
        deviceType: "Mouse",
        label: "Mouse Default Profile",
        selectionKey: "default:mouse",
        selectionType: "default",
      }),
    ]);
    expect(await controllerProfileRecords(page)).toHaveLength(0);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-account-user-controls-selected-device='default:mouse']")).toBeChecked();
    await expect(page.locator("[data-account-user-controls-selected-device-status]")).toHaveText("Selected Device: Mouse Default Profile.");
    expect(await controllerProfileRecords(page)).toHaveLength(0);

    await expect(page.locator("[data-account-user-controls-section='Keyboard']")).toContainText("Default Profile");
    await expect(page.locator("[data-account-user-controls-section='Keyboard']")).toContainText("Create my profile");
    await expect(page.locator("[data-account-user-controls-section='Keyboard']")).not.toContainText("Visible fallback");
    await expect(page.locator("[data-account-user-controls-section='Keyboard']")).not.toContainText("Keyboard:");
    await expect(page.locator("[data-account-user-controls-default-profile='Keyboard']")).toContainText("Default Profile");
    await expect(page.locator("[data-account-user-controls-list-family='Keyboard'] tr").first()).toHaveAttribute("data-account-user-controls-default-profile", "Keyboard");
    await expect(page.locator("[data-account-user-controls-default-profile='Keyboard'] button")).toHaveText(["View"]);
    await expect(page.locator("[data-account-user-controls-default-profile='Keyboard']")).not.toContainText("Edit");
    await expect(page.locator("[data-account-user-controls-default-profile='Keyboard']")).not.toContainText("Trash");
    await page.locator("[data-account-user-controls-view-default='Keyboard']").click();
    await expect(page.locator("[data-account-user-controls-section='Keyboard']")).toContainText("KeyW");
    await expect(page.locator("[data-account-user-controls-section='Keyboard']")).toContainText("ShiftLeft");
    await expect(page.locator("[data-account-user-controls-section='Keyboard']")).toContainText("ControlLeft");
    await expect(page.locator("[data-account-user-controls-section='Keyboard']")).toContainText("Backspace");
    await expect(page.locator("[data-account-user-controls-section='Keyboard']")).toContainText("move.y-");
    await expect(page.locator("[data-account-user-controls-section='Keyboard']")).not.toContainText("Escape");
    await expect(page.locator("[data-account-user-controls-section='Keyboard']")).not.toContainText("Tab");
    await expect(page.locator("[data-account-user-controls-section='Mouse']")).toContainText("Default Profile");
    await expect(page.locator("[data-account-user-controls-section='Mouse']")).toContainText("Create my profile");
    await expect(page.locator("[data-account-user-controls-section='Mouse']")).not.toContainText("Visible fallback");
    await expect(page.locator("[data-account-user-controls-section='Mouse']")).not.toContainText("Mouse:");
    await expect(page.locator("[data-account-user-controls-default-profile='Mouse']")).toContainText("Default Profile");
    await expect(page.locator("[data-account-user-controls-list-family='Mouse'] tr").first()).toHaveAttribute("data-account-user-controls-default-profile", "Mouse");
    await expect(page.locator("[data-account-user-controls-default-profile='Mouse'] button")).toHaveText(["View"]);
    await page.locator("[data-account-user-controls-view-default='Mouse']").click();
    await expect(page.locator("[data-account-user-controls-section='Mouse']")).toContainText("MouseButton0");
    await expect(page.locator("[data-account-user-controls-section='Mouse']")).toContainText("MouseButton1");
    await expect(page.locator("[data-account-user-controls-section='Mouse']")).toContainText("MouseWheelUp");
    await expect(page.locator("[data-account-user-controls-section='Mouse']")).toContainText("MouseWheelDown");
    await expect(page.locator("[data-account-user-controls-section='Mouse']")).toContainText("MouseX-");
    await expect(page.locator("[data-account-user-controls-section='Mouse']")).toContainText("MouseY+");
    await expect(page.locator("[data-account-user-controls-section='Mouse']")).toContainText("action.primary");
    await expect(page.locator("[data-account-user-controls-section='Mouse']")).toContainText("action.scrollUp");
    const mouseXNegativeDefault = page.locator("[data-account-user-controls-default-input='MouseX-']");
    await expect(mouseXNegativeDefault.locator("td").nth(1)).toHaveText("aim.x-");
    await expect(mouseXNegativeDefault.locator("td").nth(2)).toHaveText("N/A");
    await expect(mouseXNegativeDefault.locator("td").nth(3)).toHaveText("N/A");
    await expect(mouseXNegativeDefault.locator("td").nth(4)).toHaveText("100%");
    await expect(page.locator("[data-account-user-controls-section='Combo Inputs']")).toContainText("Wireframe only");
    await expect(page.locator("[data-account-user-controls-list-family='Keyboard']")).not.toContainText("No keyboard user control profile saved yet.");
    await expect(page.locator("[data-account-user-controls-list-family='Mouse']")).not.toContainText("No mouse user control profile saved yet.");
    await expect(page.locator("[data-account-user-controls-list-family='Gamepad']")).not.toContainText("No game controller profiles saved yet.");
    await expect(page.locator("[data-account-user-controls-list-family='Gamepad'] tr").first()).toHaveAttribute("data-account-user-controls-default-profile", "Gamepad");
    await expect(page.locator("[data-account-user-controls-default-profile='Gamepad'] button")).toHaveText(["View"]);
    await page.locator("[data-account-user-controls-view-default='Gamepad']").click();
    await expect(page.locator("[data-account-user-controls-section='Game Controllers']")).toContainText("Button4");
    await expect(page.locator("[data-account-user-controls-section='Game Controllers']")).toContainText("Button11");
    await expect(page.locator("[data-account-user-controls-section='Game Controllers']")).toContainText("Trigger Left");
    const defaultTriggerLeft = page.locator("[data-account-user-controls-default-input='Trigger Left']");
    await expect(defaultTriggerLeft.locator("td").nth(1)).toHaveText("trigger.left");
    await expect(defaultTriggerLeft.locator("td").nth(2)).toHaveText("0.2");
    await expect(defaultTriggerLeft.locator("td").nth(3)).toHaveText("Off");
    await expect(defaultTriggerLeft.locator("td").nth(4)).toHaveText("100%");
    const defaultButton4 = page.locator("[data-account-user-controls-default-input='Button4']");
    await expect(defaultButton4.locator("td").nth(1)).toHaveText("Unassigned");
    const defaultAxis0 = page.locator("[data-account-user-controls-default-input='Axis0']");
    await expect(defaultAxis0.locator("td").nth(1)).toHaveText("Negative move.x-; Positive move.x+");
    await expect(defaultAxis0.locator("td").nth(2)).toHaveText("0.2");
    await expect(defaultAxis0.locator("td").nth(3)).toHaveText("Off");
    await expect(defaultAxis0.locator("td").nth(4)).toHaveText("100%");
    expect(await controllerProfileRecords(page)).toHaveLength(0);

    await expect(page.locator("[data-account-user-controls-save-all]")).toHaveCount(0);
    expect(await controllerProfileRecords(page)).toHaveLength(0);

    await expect(page.locator("[data-account-user-controls-device] option")).toHaveText([
      "Choose a game controller",
    ]);
    await expect(page.locator("[data-account-user-controls-section='Game Controllers']")).not.toContainText("Gamepad:");
    await expect(page.locator("[data-account-user-controls-section='Game Controllers']")).not.toContainText("Keyboard Profile");
    await expect(page.locator("[data-account-user-controls-section='Game Controllers']")).not.toContainText("Mouse Profile");

    const keyboardSectionOrder = await page.locator("[data-account-user-controls-section='Keyboard']").evaluate((section) => {
      const table = section.querySelector("[data-account-user-controls-table='Keyboard']");
      const create = section.querySelector("[data-account-user-controls-edit-family='Keyboard']");
      return Boolean(table && create && (table.compareDocumentPosition(create) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    expect(keyboardSectionOrder).toBe(true);

    await page.locator("[data-account-user-controls-section='Keyboard'] [data-account-user-controls-edit-family='Keyboard']").click();
    await expect(page.locator("[data-account-user-controls-editing-row]")).toContainText("Keyboard");
    await expect(page.locator("[data-account-user-controls-controller-name]")).toHaveValue("Keyboard");
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Created Keyboard Profile. Editing the new profile.");
    expect(await controllerProfileRecords(page)).toHaveLength(1);
    await expect(page.locator("[data-account-user-controls-profile-row='generic-keyboard-keyboard-profile']")).toHaveCount(0);
    await expect(page.locator("[data-account-user-controls-table='Keyboard'] > thead th")).toHaveText([
      "Selected Device",
      "Physical Controller",
      "Physical Input",
      "Normalized Control",
      "Actions",
    ]);
    await expect(page.locator("[data-account-user-controls-section='Keyboard'] [data-account-user-controls-generated-input-table] th")).toHaveText([
      "Physical Input",
      "Normalized Control",
    ]);
    await expect(page.locator("[data-account-user-controls-section='Keyboard']")).not.toContainText("Deadzone");
    await expect(page.locator("[data-account-user-controls-section='Keyboard']")).not.toContainText("Sensitivity");
    await expect(page.locator("[data-account-user-controls-physical-input='0']")).toHaveValue("KeyW");
    await expect(page.locator("[data-account-user-controls-section='Keyboard'] [data-account-user-controls-input-normalized]")).toHaveCount(10);
    await expect(page.locator("[data-account-user-controls-input-normalized='0']")).toHaveValue("move.y-");
    await expect(page.locator("[data-account-user-controls-input-normalized='0']")).toBeEnabled();
    const keyboardNormalizedOptions = await page.locator("[data-account-user-controls-section='Keyboard'] [data-account-user-controls-input-normalized='0'] option").evaluateAll((options) => options.map((option) => option.value));
    expect(keyboardNormalizedOptions).not.toContain("dpad.up");
    expect(keyboardNormalizedOptions).not.toContain("trigger.left");
    await page.locator("[data-account-user-controls-physical-input='0']").click();
    await expect(page.locator("[data-account-user-controls-physical-input='0']")).toHaveValue("");
    await page.waitForTimeout(20);
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("[data-account-user-controls-physical-input='0']")).toHaveValue("ArrowRight");
    await page.locator("[data-account-user-controls-physical-input='1']").click();
    await expect(page.locator("[data-account-user-controls-physical-input='1']")).toHaveValue("");
    await page.waitForTimeout(5200);
    await expect(page.locator("[data-account-user-controls-physical-input='1']")).toHaveValue("KeyA");
    await page.locator("[data-account-user-controls-save]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Saved Keyboard Profile.");
    await expect(page.locator("[data-account-user-controls-editing-row]")).toHaveCount(0);
    await expect(page.locator("[data-account-user-controls-profile-row='generic-keyboard-keyboard-profile']")).toContainText("Keyboard");
    await expect(page.locator("[data-account-user-controls-section='Keyboard'] [data-account-user-controls-edit-family='Keyboard']")).toBeEnabled();
    expect((await controllerProfileRecords(page)).map((profile) => profile.profileName)).toContain("Keyboard Profile");

    await page.locator("[data-account-user-controls-section='Keyboard'] [data-account-user-controls-edit-family='Keyboard']").click();
    await expect(page.locator("[data-account-user-controls-editing-row]")).toContainText("Keyboard");
    await expect(page.locator("[data-account-user-controls-controller-name]")).toHaveValue("Keyboard 2");
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Created Keyboard 2 Profile. Editing the new profile.");
    expect(await controllerProfileRecords(page)).toHaveLength(2);
    await page.locator("[data-account-user-controls-controller-name]").fill("Keyboard");
    await page.locator("[data-account-user-controls-save]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("FAIL: Keyboard Profile already exists for Keyboard.");
    await page.locator("[data-account-user-controls-cancel]").click();
    await page.locator("[data-account-user-controls-trash='generic-keyboard-keyboard-2-profile']").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("Deleted user control profile.");
    expect(await controllerProfileRecords(page)).toHaveLength(1);

    await page.locator("[data-account-user-controls-section='Mouse'] [data-account-user-controls-edit-family='Mouse']").click();
    await expect(page.locator("[data-account-user-controls-editing-row]")).toContainText("Mouse");
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Created Mouse Profile. Editing the new profile.");
    expect(await controllerProfileRecords(page)).toHaveLength(2);
    await expect(page.locator("[data-account-user-controls-controller-name]")).toHaveValue("Mouse");
    await expect(page.locator("[data-account-user-controls-physical-input='0']")).toHaveValue("MouseButton0");
    const mouseNormalizedOptions = await page.locator("[data-account-user-controls-section='Mouse'] [data-account-user-controls-input-normalized='0'] option").evaluateAll((options) => options.map((option) => option.value));
    expect(mouseNormalizedOptions).not.toContain("dpad.up");
    expect(mouseNormalizedOptions).not.toContain("trigger.left");
    expect(mouseNormalizedOptions).toContain("action.scrollUp");
    const mouseButton0Input = page.locator("[data-account-user-controls-section='Mouse'] [data-account-user-controls-physical-input='0']");
    await mouseButton0Input.click();
    await expect(mouseButton0Input).toHaveValue("");
    await page.waitForTimeout(20);
    await mouseButton0Input.dispatchEvent("mousedown", { button: 0, bubbles: true });
    await mouseButton0Input.dispatchEvent("mouseup", { button: 0, bubbles: true });
    await mouseButton0Input.dispatchEvent("click", { button: 0, bubbles: true });
    await expect(mouseButton0Input).toHaveValue("MouseButton0");
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("Captured MouseButton0. Save the profile to keep it.");
    await page.waitForTimeout(300);
    await expect(mouseButton0Input).toHaveValue("MouseButton0");
    await page.locator("[data-account-user-controls-physical-input='1']").click();
    await expect(page.locator("[data-account-user-controls-physical-input='1']")).toHaveValue("");
    await page.waitForTimeout(5200);
    await expect(page.locator("[data-account-user-controls-physical-input='1']")).toHaveValue("MouseButton2");
    await expect(page.locator("[data-account-user-controls-input-normalized='0']")).toHaveValue("action.primary");
    await page.locator("[data-account-user-controls-save]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Saved Mouse Profile.");

    await exposeGamepads(page);
    await expect(page.locator("[data-account-user-controls-device-status]")).toContainText("2 game controllers detected automatically", { timeout: 4000 });
    await expect(page.locator("[data-account-user-controls-device] option")).toHaveText([
      "Choose a game controller",
      "Arcade Test Pad",
      "Studio Flight Pad",
    ]);
    await page.locator("[data-account-user-controls-device]").selectOption("gamepad-1");
    await expect(page.locator("[data-account-user-controls-device]")).toHaveValue("gamepad-1");
    await page.locator("[data-account-user-controls-add-profile]").click();
    await expect(page.locator("[data-account-user-controls-editing-row]")).toContainText("Gamepad");
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Created Studio Flight Pad Profile. Editing the new profile.");
    expect(await controllerProfileRecords(page)).toHaveLength(3);
    await expect(page.locator("[data-account-user-controls-controller-name]")).toHaveValue("Studio Flight Pad");
    await page.locator("[data-account-user-controls-controller-name]").fill("Custom Arcade Pad");
    await expect(page.locator("[data-account-user-controls-generated-input-table] th")).toHaveText([
      "Physical Input",
      "Normalized Control",
      "Deadzone",
      "Invert",
      "Sensitivity",
    ]);
    const button0 = page.locator("[data-account-user-controls-input-pair]").filter({ hasText: "Button0" });
    await expect(button0.locator("[data-account-user-controls-input-normalized]")).toHaveValue("action.primary");
    await expect(button0).toContainText("N/A");
    await expect(button0.locator("[data-account-user-controls-deadzone]")).toHaveCount(0);
    await expect(button0.locator("[data-account-user-controls-sensitivity]")).toHaveCount(0);
    const button4 = page.locator("[data-account-user-controls-input-pair]").filter({ hasText: "Button4" });
    await expect(button4.locator("[data-account-user-controls-input-normalized]")).toHaveValue("");
    const button11 = page.locator("[data-account-user-controls-input-pair]").filter({ hasText: "Button11" });
    await expect(button11.locator("[data-account-user-controls-input-normalized]")).toHaveValue("");
    const dpadUp = page.locator("[data-account-user-controls-input-pair]").filter({ hasText: "DPad Up" });
    await expect(dpadUp.locator("[data-account-user-controls-input-normalized]")).toHaveValue("move.y-");
    await expect(dpadUp).toContainText("N/A");
    await expect(dpadUp.locator("[data-account-user-controls-deadzone]")).toHaveCount(0);
    await expect(dpadUp.locator("[data-account-user-controls-sensitivity]")).toHaveCount(0);
    const dpadDown = page.locator("[data-account-user-controls-input-pair]").filter({ hasText: "DPad Down" });
    await expect(dpadDown.locator("[data-account-user-controls-input-normalized]")).toHaveValue("move.y+");
    const dpadLeft = page.locator("[data-account-user-controls-input-pair]").filter({ hasText: "DPad Left" });
    await expect(dpadLeft.locator("[data-account-user-controls-input-normalized]")).toHaveValue("move.x-");
    const dpadRight = page.locator("[data-account-user-controls-input-pair]").filter({ hasText: "DPad Right" });
    await expect(dpadRight.locator("[data-account-user-controls-input-normalized]")).toHaveValue("move.x+");
    await expect(page.locator("body")).not.toContainText("Not applicable");
    const axis0 = page.locator("[data-account-user-controls-input-pair]").filter({ hasText: "Axis0" });
    await expect(axis0.locator("[data-account-user-controls-input-negative]")).toHaveValue("move.x-");
    await expect(axis0.locator("[data-account-user-controls-input-positive]")).toHaveValue("move.x+");
    await axis0.locator("[data-account-user-controls-deadzone]").fill("0.4");
    await axis0.locator("[data-account-user-controls-invert]").check();
    const axis0Sensitivity = axis0.locator("[data-account-user-controls-sensitivity]");
    await expect(axis0Sensitivity).toBeVisible();
    await axis0Sensitivity.fill("125");
    await expect(axis0.locator("[data-slider-value-for='accountUserControlsSensitivity']")).toHaveText("125%");
    const triggerLeft = page.locator("[data-account-user-controls-input-pair]").filter({ hasText: "Trigger Left" });
    await expect(triggerLeft.locator("[data-account-user-controls-input-normalized]")).toHaveValue("trigger.left");
    await expect(triggerLeft.locator("[data-account-user-controls-deadzone]")).toBeVisible();
    await expect(triggerLeft.locator("[data-account-user-controls-invert]")).toBeVisible();
    await expect(triggerLeft.locator("[data-account-user-controls-sensitivity]")).toBeVisible();
    const triggerRight = page.locator("[data-account-user-controls-input-pair]").filter({ hasText: "Trigger Right" });
    await expect(triggerRight.locator("[data-account-user-controls-input-normalized]")).toHaveValue("trigger.right");
    const gamepadNormalizedOptions = await triggerLeft.locator("[data-account-user-controls-input-normalized] option").evaluateAll((options) => options.map((option) => option.value));
    expect(gamepadNormalizedOptions).toContain("dpad.up");
    expect(gamepadNormalizedOptions).toContain("trigger.left");
    await page.locator("[data-account-user-controls-save]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Saved Custom Arcade Pad Profile.");
    const selectedDeviceLabels = await page.locator("[data-account-user-controls-selected-device]").evaluateAll((inputs) =>
      inputs.map((input) => (input.getAttribute("aria-label") || "").replace(/^Select /, "")),
    );
    expect(selectedDeviceLabels).toEqual(expect.arrayContaining([
      "Keyboard Default Profile",
      "Mouse Default Profile",
      "Gamepad Default Profile",
      "Keyboard (Keyboard Profile)",
      "Mouse (Mouse Profile)",
      "Arcade Test Pad",
      "Custom Arcade Pad (Custom Arcade Pad Profile)",
    ]));
    expect(selectedDeviceLabels).not.toContain("Keyboard");
    expect(selectedDeviceLabels).not.toContain("Mouse");
    expect(selectedDeviceLabels).not.toContain("Studio Flight Pad");

    const profiles = await controllerProfileRecords(page);
    expect(profiles).toHaveLength(3);
    expect(profiles.find((profile) => profile.profileName === "Keyboard Profile")).toMatchObject({
      controllerId: "generic-keyboard",
      controllerName: "Keyboard",
      deviceType: "Keyboard",
    });
    expect(profiles.find((profile) => profile.profileName === "Keyboard Profile").inputMappings[0]).toMatchObject({
      normalizedInput: "move.y-",
      physicalInput: "ArrowRight",
    });
    expect(profiles.find((profile) => profile.profileName === "Mouse Profile")).toMatchObject({
      controllerId: "generic-mouse",
      controllerName: "Mouse",
      deviceType: "Mouse",
    });
    expect(profiles.find((profile) => profile.profileName === "Mouse Profile").inputMappings[0]).toMatchObject({
      normalizedInput: "action.primary",
      physicalInput: "MouseButton0",
    });
    const gamepadProfile = profiles.find((profile) => profile.profileName === "Custom Arcade Pad Profile");
    expect(gamepadProfile).toMatchObject({
      controllerId: "Studio Flight Pad",
      controllerName: "Custom Arcade Pad",
      deviceType: "Gamepad",
      profileName: "Custom Arcade Pad Profile",
    });
    expect(gamepadProfile.inputMappings.find((mapping) => mapping.physicalInput === "Axis0")).toMatchObject({
      deadzone: 0.4,
      invert: true,
      sensitivity: 125,
    });
    expect(gamepadProfile.inputMappings.find((mapping) => mapping.physicalInput === "DPad Up")).toMatchObject({ normalizedInput: "move.y-" });
    expect(gamepadProfile.inputMappings.find((mapping) => mapping.physicalInput === "DPad Down")).toMatchObject({ normalizedInput: "move.y+" });
    expect(gamepadProfile.inputMappings.find((mapping) => mapping.physicalInput === "DPad Left")).toMatchObject({ normalizedInput: "move.x-" });
    expect(gamepadProfile.inputMappings.find((mapping) => mapping.physicalInput === "DPad Right")).toMatchObject({ normalizedInput: "move.x+" });
    expect(gamepadProfile.inputMappings.find((mapping) => mapping.physicalInput === "Button4")).toMatchObject({ normalizedInput: "" });
    expect(gamepadProfile.inputMappings.find((mapping) => mapping.physicalInput === "Button11")).toMatchObject({ normalizedInput: "" });
    expect(gamepadProfile.inputMappings.find((mapping) => mapping.physicalInput === "Trigger Left")).toMatchObject({ normalizedInput: "trigger.left" });
    expect(gamepadProfile.inputMappings.find((mapping) => mapping.physicalInput === "Trigger Right")).toMatchObject({ normalizedInput: "trigger.right" });
    expect(JSON.stringify(profiles)).not.toContain("gameAction");
    expect(JSON.stringify(profiles)).not.toContain("objectKey");
    expect(JSON.stringify(profiles)).not.toContain("eventD");
    expect(JSON.stringify(profiles)).not.toContain("eventU");
    expect(JSON.stringify(profiles)).not.toContain("eventDC");
    await page.locator(`[data-account-user-controls-selected-device='profile:${gamepadProfile.id}']`).check();
    await expect(page.locator("[data-account-user-controls-selected-device-status]")).toHaveText("Selected Device: Custom Arcade Pad (Custom Arcade Pad Profile).");

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-account-user-controls-selected-device-status]")).toHaveText("Selected device not connected. Using Default Profile.");
    expect(await controllerProfileRecords(page)).toHaveLength(3);
    expect((await controllerProfileRecords(page)).map((profile) => profile.profileName)).not.toContain("Default Profile");
    await expect(page.locator("[data-account-user-controls-list-family='Keyboard']")).toContainText("Keyboard");
    await expect(page.locator("[data-account-user-controls-list-family='Keyboard']")).not.toContainText("Keyboard:");
    await expect(page.locator("[data-account-user-controls-list-family='Mouse']")).toContainText("Mouse");
    await expect(page.locator("[data-account-user-controls-list-family='Mouse']")).not.toContainText("Mouse:");
    await expect(page.locator("[data-account-user-controls-list-family='Gamepad']")).toContainText("Custom Arcade Pad");
    await expect(page.locator("[data-account-user-controls-list-family='Gamepad']")).not.toContainText("Gamepad:");
    await page.locator("[data-account-user-controls-section='Keyboard'] [data-account-user-controls-edit='generic-keyboard-keyboard-profile']").click();
    await expect(page.locator("[data-account-user-controls-physical-input='0']")).toHaveValue("ArrowRight");
    await page.locator("[data-account-user-controls-cancel]").click();

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
    await expect(page.locator("[data-account-side-nav-accordion-layout='left-right']")).toBeVisible();
    await expect(page.locator("[data-account-side-nav-accordion='left']")).toHaveAttribute("open", "");
    await expect(page.locator("[data-account-side-nav-accordion='right']")).not.toHaveAttribute("open", "");
    const sideNavAccordionMetrics = await page.locator("[data-account-side-nav-accordion-layout='left-right']").evaluate((layout) => {
      const left = layout.querySelector("[data-account-side-nav-accordion='left']")?.getBoundingClientRect();
      const right = layout.querySelector("[data-account-side-nav-accordion='right']")?.getBoundingClientRect();
      return left && right
        ? {
          leftX: left.x,
          rightX: right.x,
          topDelta: Math.abs(left.y - right.y),
        }
        : null;
    });
    expect(sideNavAccordionMetrics).toEqual(expect.objectContaining({
      topDelta: expect.any(Number),
    }));
    expect(sideNavAccordionMetrics.rightX).toBeGreaterThan(sideNavAccordionMetrics.leftX);
    expect(sideNavAccordionMetrics.topDelta).toBeLessThanOrEqual(1);
    await expect(page.locator("[data-account-side-nav-link]")).toHaveText([
      "Account Home",
      "Achievements",
      "Preferences",
      "Profile",
      "Security",
      "User Controls",
    ]);
    await expect(page.locator("[data-account-side-nav-link][aria-current='page']")).toHaveText("User Controls");
    await page.locator("[data-account-side-nav-accordion='left'] > summary").click();
    await expect(page.locator("[data-account-side-nav-accordion='left']")).not.toHaveAttribute("open", "");
    await expect(page.locator("[data-account-side-nav-link]").first()).toBeHidden();
    await page.locator("[data-account-side-nav-accordion='left'] > summary").click();
    await expect(page.locator("[data-account-side-nav-accordion='left']")).toHaveAttribute("open", "");
    await expect(page.locator("[data-account-side-nav-link]").first()).toBeVisible();
    await page.locator("[data-account-side-nav-accordion='right'] > summary").click();
    await expect(page.locator("[data-account-side-nav-accordion='right']")).toHaveAttribute("open", "");
    await page.locator("[data-account-side-nav-accordion='right'] > summary").click();
    await expect(page.locator("[data-account-side-nav-accordion='right']")).not.toHaveAttribute("open", "");
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
    expect(sources.controls).not.toContain("GAME_CONTROL_PRESETS");
    expect(sources.controls).not.toContain("applyGameControlPreset");
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
