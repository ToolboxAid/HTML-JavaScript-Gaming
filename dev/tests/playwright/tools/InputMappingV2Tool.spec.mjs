import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../../api/persistence/mock-db-store.js";
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
  await page.addInitScript(({ apiUrl, siteUrl }) => {
    window.GameFoundryPublicConfig = {
      apiUrl,
      environmentLabel: "Development Environment",
      siteUrl,
    };
  }, { apiUrl: `${server.baseUrl}/api`, siteUrl: server.baseUrl });
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
    const response = await fetch("/api/local-db/snapshot");
    const payload = await response.json();
    return payload.data.tables.game_input_mappings || [];
  });
}

async function controllerProfileRecords(page) {
  return page.evaluate(async () => {
    const response = await fetch("/api/local-db/snapshot");
    const payload = await response.json();
    return payload.data.tables.player_controller_profiles || [];
  });
}

async function selectedInputDeviceRecords(page) {
  return page.evaluate(async () => {
    const response = await fetch("/api/local-db/snapshot");
    const payload = await response.json();
    return payload.data.tables.player_input_device_selections || [];
  });
}

async function setSessionUserInPage(page, userKey) {
  await page.evaluate(async (nextUserKey) => {
    const response = await fetch("/api/session/user", {
      body: JSON.stringify({ userKey: nextUserKey }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    const payload = await response.json();
    window.dispatchEvent(new CustomEvent("gamefoundry:mock-db-session-user-changed", {
      detail: payload.data,
    }));
  }, userKey);
}

async function logoutSessionInPage(page) {
  await page.evaluate(async () => {
    const response = await fetch("/api/session/logout", { method: "POST" });
    const payload = await response.json();
    window.dispatchEvent(new CustomEvent("gamefoundry:mock-db-session-user-changed", {
      detail: payload.data,
    }));
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
    await expect(page.locator("[data-input-status-log]")).toHaveText("Loaded default Game Controls for review. Save to persist changes through the server API.");
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
    const constants = await page.evaluate(async () => {
      const response = await fetch("/api/toolbox/controls/constants");
      const payload = await response.json();
      return payload.data;
    });
    expect(constants.INPUT_MAPPING_TOOL_TABLES).toEqual([
      "game_input_mappings",
      "player_controller_profiles",
      "player_input_device_selections",
      "input_custom_action_records",
    ]);
    expect(constants.GAME_CONTROL_NORMALIZED_INPUTS).toEqual(GAME_CONTROL_NORMALIZED_INPUTS);
    expect(constants.COMMON_DEFAULT_GAME_CONTROLS).toEqual([
      "action.cancel",
      "action.confirm",
      "action.pause",
      "action.primary",
      "action.secondary",
      "action.start",
      "move.x-",
      "move.x+",
      "move.y-",
      "move.y+",
    ]);
    expect(constants.ENGINE_OWNED_NORMALIZED_INPUTS).toEqual(["action.pause"]);
    expect(constants.CONTROL_EVENT_OPTIONS.map((option) => option.field)).toEqual(["eventD", "eventH", "eventU", "eventDC"]);
    expect(constants.NORMALIZED_USAGE_LABELS["action.primary"]).toBe("Primary Action");
    const controlsSource = await page.evaluate(async () => fetch("/assets/toolbox/controls/js/index.js").then((response) => response.text()));
    expect(controlsSource).not.toMatch(/const\s+(CONTROL_EVENT_OPTIONS|GAME_CONTROL_NORMALIZED_INPUTS|NORMALIZED_USAGE_LABELS|COMMON_DEFAULT_GAME_CONTROLS|ENGINE_OWNED_NORMALIZED_INPUTS)\s*=/);

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
    await page.setViewportSize({ width: 1440, height: 1100 });
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
      const items = Array.from(list.querySelectorAll("li")).map((item, index) => {
        const rect = item.getBoundingClientRect();
        return {
          index,
          left: Math.round(rect.left),
          top: Math.round(rect.top),
        };
      });
      const leftPositions = [...new Set(items.map((item) => item.left))].sort((left, right) => left - right);
      const columnIndexes = leftPositions.map((left) => items
        .filter((item) => item.left === left)
        .sort((leftItem, rightItem) => leftItem.top - rightItem.top)
        .map((item) => item.index));
      return {
        columnIndexes,
        columnCount: style.columnCount,
        listStylePosition: style.listStylePosition,
        paddingLeft: Number.parseFloat(style.paddingLeft),
        topSortedByColumn: columnIndexes.every((indexes) =>
          indexes.every((itemIndex, index) => index === 0 || indexes[index - 1] < itemIndex),
        ),
        topToBottomThenLeftToRight: columnIndexes.every((indexes, index) => {
          if (index === 0) {
            return true;
          }
          return Math.max(...columnIndexes[index - 1]) < Math.min(...indexes);
        }),
        uniqueColumns: leftPositions.length,
      };
    });
    expect(supportedControlTypeLayout).toMatchObject({
      columnCount: "3",
      listStylePosition: "outside",
      topSortedByColumn: true,
      topToBottomThenLeftToRight: true,
      uniqueColumns: 3,
    });
    expect(supportedControlTypeLayout.columnIndexes.every((indexes) => indexes.length > 0)).toBe(true);
    expect(supportedControlTypeLayout.paddingLeft).toBeGreaterThan(0);
    await expect(page.locator("[data-account-user-controls-selected-device-status]")).toHaveText("Default Profile");
    const keyboardDefaultRadio = page.locator("[data-account-user-controls-selected-device='default:keyboard']");
    const mouseDefaultRadio = page.locator("[data-account-user-controls-selected-device='default:mouse']");
    const gamepadDefaultRadio = page.locator("[data-account-user-controls-selected-device='default:gamepad']");
    await expect(page.locator("[data-account-user-controls-default-profile='Keyboard'] td").first().locator("[data-account-user-controls-selected-device='default:keyboard']")).toBeVisible();
    await expect(page.locator("[data-account-user-controls-default-profile='Mouse'] td").first().locator("[data-account-user-controls-selected-device='default:mouse']")).toBeVisible();
    await expect(page.locator("[data-account-user-controls-default-profile='Gamepad'] td").first().locator("[data-account-user-controls-selected-device='default:gamepad']")).toBeVisible();
    await expect(keyboardDefaultRadio).toHaveAttribute("name", "account-user-controls-selected-device-keyboard");
    await expect(mouseDefaultRadio).toHaveAttribute("name", "account-user-controls-selected-device-mouse");
    await expect(gamepadDefaultRadio).toHaveAttribute("name", "account-user-controls-selected-device-gamepad");
    await keyboardDefaultRadio.check();
    await expect(keyboardDefaultRadio).toBeChecked();
    await expect(mouseDefaultRadio).not.toBeChecked();
    await mouseDefaultRadio.check();
    await expect(keyboardDefaultRadio).toBeChecked();
    await expect(mouseDefaultRadio).toBeChecked();
    await gamepadDefaultRadio.check();
    await expect(keyboardDefaultRadio).toBeChecked();
    await expect(mouseDefaultRadio).toBeChecked();
    await expect(gamepadDefaultRadio).toBeChecked();
    await expect(page.locator("[data-account-user-controls-selected-device-status]")).toHaveText("Selected Devices: Keyboard Default Profile; Mouse Default Profile; Gamepad Default Profile.");
    await expect.poll(async () => (await selectedInputDeviceRecords(page)).length).toBe(3);
    expect(await selectedInputDeviceRecords(page)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        deviceType: "Keyboard",
        label: "Keyboard Default Profile",
        selectionKey: "default:keyboard",
        selectionType: "default",
      }),
      expect.objectContaining({
        deviceType: "Mouse",
        label: "Mouse Default Profile",
        selectionKey: "default:mouse",
        selectionType: "default",
      }),
      expect.objectContaining({
        deviceType: "Gamepad",
        label: "Gamepad Default Profile",
        selectionKey: "default:gamepad",
        selectionType: "default",
      }),
    ]));
    expect(await controllerProfileRecords(page)).toHaveLength(0);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-account-user-controls-selected-device='default:keyboard']")).toBeChecked();
    await expect(page.locator("[data-account-user-controls-selected-device='default:mouse']")).toBeChecked();
    await expect(page.locator("[data-account-user-controls-selected-device='default:gamepad']")).toBeChecked();
    await expect(page.locator("[data-account-user-controls-selected-device-status]")).toHaveText("Selected Devices: Keyboard Default Profile; Mouse Default Profile; Gamepad Default Profile.");
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

    const controllerDropdown = page.locator("[data-account-user-controls-device]");
    const controllerToolbar = page.locator("[aria-label='Account controller device selection']");
    const expectControllerToolbarSingleLine = async () => {
      const toolbarLayout = await controllerToolbar.evaluate((toolbar) => {
        const refresh = toolbar.querySelector("[data-account-user-controls-refresh]");
        const label = toolbar.querySelector("label[for='account-user-controls-device']");
        const select = toolbar.querySelector("[data-account-user-controls-device]");
        const create = toolbar.querySelector("[data-account-user-controls-add-profile]");
        const controls = [refresh, label, select, create].filter(Boolean);
        const rects = controls.map((control) => control.getBoundingClientRect());
        const centers = rects.map((rect) => Math.round(rect.top + (rect.height / 2)));
        const selectRect = select.getBoundingClientRect();
        const refreshRect = refresh.getBoundingClientRect();
        const createRect = create.getBoundingClientRect();
        return {
          createVisible: createRect.width > 0 && createRect.height > 0,
          flexWrap: getComputedStyle(toolbar).flexWrap,
          maxCenterDelta: Math.max(...centers) - Math.min(...centers),
          refreshVisible: refreshRect.width > 0 && refreshRect.height > 0,
          selectFlexGrow: getComputedStyle(select).flexGrow,
          selectWidth: Math.round(selectRect.width),
          widerThanCreate: selectRect.width > createRect.width,
          widerThanRefresh: selectRect.width > refreshRect.width,
        };
      });
      expect(toolbarLayout).toMatchObject({
        createVisible: true,
        flexWrap: "nowrap",
        refreshVisible: true,
        selectFlexGrow: "1",
        widerThanCreate: true,
        widerThanRefresh: true,
      });
      expect(toolbarLayout.maxCenterDelta).toBeLessThanOrEqual(2);
      expect(toolbarLayout.selectWidth).toBeGreaterThan(0);
    };
    await expect(controllerDropdown).toHaveCount(1);
    await expect(controllerDropdown.locator("option")).toHaveText(["Choose a game controller"]);
    await expectControllerToolbarSingleLine();
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
    const keyboardProfileRadio = page.locator("[data-account-user-controls-selected-device='profile:generic-keyboard-keyboard-profile']");
    await expect(keyboardProfileRadio).toHaveAttribute("name", "account-user-controls-selected-device-keyboard");
    await keyboardProfileRadio.check();
    await expect(keyboardProfileRadio).toBeChecked();
    await expect(page.locator("[data-account-user-controls-selected-device='default:mouse']")).toBeChecked();
    await expect(page.locator("[data-account-user-controls-selected-device='default:gamepad']")).toBeChecked();
    await expect.poll(async () => (await selectedInputDeviceRecords(page)).length).toBe(3);
    expect(await selectedInputDeviceRecords(page)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        deviceType: "Keyboard",
        profileId: "generic-keyboard-keyboard-profile",
        selectionKey: "profile:generic-keyboard-keyboard-profile",
        selectionType: "profile",
      }),
      expect.objectContaining({
        deviceType: "Mouse",
        selectionKey: "default:mouse",
        selectionType: "default",
      }),
      expect.objectContaining({
        deviceType: "Gamepad",
        selectionKey: "default:gamepad",
        selectionType: "default",
      }),
    ]));

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
    const mouseProfileRadio = page.locator("[data-account-user-controls-selected-device='profile:generic-mouse-mouse-profile']");
    await expect(mouseProfileRadio).toHaveAttribute("name", "account-user-controls-selected-device-mouse");
    await mouseProfileRadio.check();
    await expect(keyboardProfileRadio).toBeChecked();
    await expect(mouseProfileRadio).toBeChecked();
    await expect(page.locator("[data-account-user-controls-selected-device='default:gamepad']")).toBeChecked();
    expect(await selectedInputDeviceRecords(page)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        deviceType: "Keyboard",
        profileId: "generic-keyboard-keyboard-profile",
        selectionType: "profile",
      }),
      expect.objectContaining({
        deviceType: "Mouse",
        profileId: "generic-mouse-mouse-profile",
        selectionType: "profile",
      }),
      expect.objectContaining({
        deviceType: "Gamepad",
        selectionKey: "default:gamepad",
        selectionType: "default",
      }),
    ]));

    await exposeGamepads(page);
    await page.locator("[data-account-user-controls-refresh]").click();
    await expect(page.locator("[data-account-user-controls-device-status]")).toContainText("2 game controllers detected automatically", { timeout: 4000 });
    await expect(controllerDropdown.locator("option")).toHaveText([
      "Choose a game controller",
      "Arcade Test Pad",
      "Studio Flight Pad",
    ]);
    await expect(page.locator("[data-account-user-controls-detected-device]")).toHaveCount(0);
    await expect(page.locator("[data-account-user-controls-detected-device] [data-account-user-controls-selected-device]")).toHaveCount(0);
    await expect(page.locator("[data-account-user-controls-selected-device='device:gamepad:studio-flight-pad']")).toHaveCount(0);
    await controllerDropdown.selectOption("gamepad-1");
    await expect(controllerDropdown).toHaveValue("gamepad-1");
    await expect(page.locator("[data-account-user-controls-device-status]")).toContainText("Studio Flight Pad selected.");
    await expectControllerToolbarSingleLine();
    await page.locator("[data-account-user-controls-add-profile]").click();
    await expect(page.locator("[data-account-user-controls-editing-row]")).toContainText("Gamepad");
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Created Studio Flight Pad Profile. Editing the new profile.");
    expect(await controllerProfileRecords(page)).toHaveLength(2);
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
      "Custom Arcade Pad (Custom Arcade Pad Profile)",
    ]));
    expect(selectedDeviceLabels).not.toContain("Keyboard");
    expect(selectedDeviceLabels).not.toContain("Mouse");
    expect(selectedDeviceLabels).not.toContain("Arcade Test Pad");
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
    const gamepadProfileRadio = page.locator(`[data-account-user-controls-selected-device='profile:${gamepadProfile.id}']`);
    await expect(gamepadProfileRadio).toHaveAttribute("name", "account-user-controls-selected-device-gamepad");
    await gamepadProfileRadio.check();
    await expect(keyboardProfileRadio).toBeChecked();
    await expect(mouseProfileRadio).toBeChecked();
    await expect(gamepadProfileRadio).toBeChecked();
    await expect(page.locator("[data-account-user-controls-selected-device-status]")).toHaveText("Selected Devices: Keyboard (Keyboard Profile); Mouse (Mouse Profile); Custom Arcade Pad (Custom Arcade Pad Profile).");
    expect(await selectedInputDeviceRecords(page)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        deviceType: "Keyboard",
        profileId: "generic-keyboard-keyboard-profile",
        selectionType: "profile",
      }),
      expect.objectContaining({
        deviceType: "Mouse",
        profileId: "generic-mouse-mouse-profile",
        selectionType: "profile",
      }),
      expect.objectContaining({
        deviceType: "Gamepad",
        profileId: gamepadProfile.id,
        selectionType: "profile",
      }),
    ]));

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-account-user-controls-selected-device='profile:generic-keyboard-keyboard-profile']")).toBeChecked();
    await expect(page.locator("[data-account-user-controls-selected-device='profile:generic-mouse-mouse-profile']")).toBeChecked();
    await expect(page.locator(`[data-account-user-controls-selected-device='profile:${gamepadProfile.id}']`)).toBeChecked();
    await expect(page.locator("[data-account-user-controls-selected-device-status]")).toHaveText("Selected Devices: Keyboard (Keyboard Profile); Mouse (Mouse Profile); Gamepad selected device not connected. Using Default Profile.");
    expect(await controllerProfileRecords(page)).toHaveLength(3);
    expect(await selectedInputDeviceRecords(page)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        deviceType: "Keyboard",
        profileId: "generic-keyboard-keyboard-profile",
        selectionType: "profile",
      }),
      expect.objectContaining({
        deviceType: "Mouse",
        profileId: "generic-mouse-mouse-profile",
        selectionType: "profile",
      }),
      expect.objectContaining({
        deviceType: "Gamepad",
        profileId: gamepadProfile.id,
        selectionType: "profile",
      }),
    ]));
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

test("User Controls creates one profile from only the selected controller dropdown device", async ({ page }) => {
  const failures = await openRepoPage(page, "/account/user-controls.html", {
    sessionUserKey: MOCK_DB_KEYS.users.user1,
  });

  try {
    await exposeGamepads(page);
    await page.locator("[data-account-user-controls-refresh]").click();
    await expect(page.locator("[data-account-user-controls-device-status]")).toContainText("2 game controllers detected automatically", { timeout: 4000 });
    const controllerDropdown = page.locator("[data-account-user-controls-device]");
    await expect(controllerDropdown.locator("option")).toHaveText([
      "Choose a game controller",
      "Arcade Test Pad",
      "Studio Flight Pad",
    ]);
    await expect(page.locator("[data-account-user-controls-detected-device]")).toHaveCount(0);
    await expect(page.locator("[data-account-user-controls-detected-device] [data-account-user-controls-selected-device]")).toHaveCount(0);
    await expect(page.locator("[data-account-user-controls-list-family='Gamepad'] [data-account-user-controls-profile-row]")).toHaveCount(0);
    expect(await controllerProfileRecords(page)).toHaveLength(0);

    await page.locator("[data-account-user-controls-add-profile]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("WARN: Choose a detected game controller before creating a user control profile.");
    await expect(page.locator("[data-account-user-controls-editing-row]")).toHaveCount(0);
    expect(await controllerProfileRecords(page)).toHaveLength(0);

    await controllerDropdown.selectOption("gamepad-1");
    await expect(controllerDropdown).toHaveValue("gamepad-1");
    await expect(page.locator("[data-account-user-controls-device-status]")).toContainText("Studio Flight Pad selected.");

    await page.locator("[data-account-user-controls-add-profile]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Created Studio Flight Pad Profile. Editing the new profile.");
    await expect(page.locator("[data-account-user-controls-editing-row]")).toContainText("Gamepad");
    await expect(page.locator("[data-account-user-controls-controller-name]")).toHaveValue("Studio Flight Pad");
    await expect(page.locator("[data-account-user-controls-editing-row]").getByRole("button", { name: "Save" })).toBeVisible();
    await expect(page.locator("[data-account-user-controls-editing-row]").getByRole("button", { name: "Cancel" })).toBeVisible();
    await expect(page.locator("[data-account-user-controls-editing-row]").getByRole("button", { name: "Edit" })).toHaveCount(0);
    await expect(page.locator("[data-account-user-controls-editing-row]").getByRole("button", { name: "Trash" })).toHaveCount(0);
    expect(await controllerProfileRecords(page)).toHaveLength(0);

    await page.locator("[data-account-user-controls-controller-name]").fill("1.1");
    await page.locator("[data-account-user-controls-save]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Saved 1.1 Profile.");
    const firstProfiles = await controllerProfileRecords(page);
    expect(firstProfiles).toHaveLength(1);
    expect(firstProfiles[0]).toMatchObject({
      controllerId: "Studio Flight Pad",
      controllerName: "1.1",
      deviceType: "Gamepad",
      profileName: "1.1 Profile",
    });
    expect(firstProfiles.map((profile) => profile.profileName)).not.toContain("Arcade Test Pad Profile");
    const firstProfileId = firstProfiles[0].id;
    await expect(page.locator("[data-account-user-controls-detected-device]")).toHaveCount(0);
    await expect(page.locator("[data-account-user-controls-detected-device] [data-account-user-controls-selected-device]")).toHaveCount(0);
    const savedFirstProfileRow = page.locator(`[data-account-user-controls-profile-row='${firstProfileId}']`);
    await expect(savedFirstProfileRow).toContainText("1.1");
    await expect(savedFirstProfileRow.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(savedFirstProfileRow.getByRole("button", { name: "Trash" })).toBeVisible();
    await expect(page.locator("[data-account-user-controls-list-family='Gamepad']")).not.toContainText("Arcade Test Pad Profile");

    await controllerDropdown.selectOption("gamepad-1");
    await page.locator("[data-account-user-controls-add-profile]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Created Studio Flight Pad Profile. Editing the new profile.");
    await expect(page.locator("[data-account-user-controls-controller-name]")).toHaveValue("Studio Flight Pad");
    await expect(page.locator("[data-account-user-controls-editing-row]")).toContainText("Gamepad");
    expect(await controllerProfileRecords(page)).toHaveLength(1);
    expect((await controllerProfileRecords(page))[0]).toMatchObject({
      controllerName: "1.1",
      id: firstProfileId,
      profileName: "1.1 Profile",
    });
    await page.locator("[data-account-user-controls-save]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Saved Studio Flight Pad Profile.");
    const repeatedProfiles = await controllerProfileRecords(page);
    expect(repeatedProfiles).toHaveLength(2);
    expect(new Set(repeatedProfiles.map((profile) => profile.id)).size).toBe(2);
    expect(repeatedProfiles.filter((profile) => profile.controllerId === "Studio Flight Pad")).toHaveLength(2);
    expect(repeatedProfiles.find((profile) => profile.id === firstProfileId)).toMatchObject({
      controllerName: "1.1",
      profileName: "1.1 Profile",
    });
    expect(repeatedProfiles.map((profile) => profile.profileName).sort()).toEqual([
      "1.1 Profile",
      "Studio Flight Pad Profile",
    ]);
    expect(repeatedProfiles.map((profile) => profile.profileName)).not.toContain("Arcade Test Pad Profile");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("User Controls scopes profiles to the active owning user", async ({ page }) => {
  const failures = await openRepoPage(page, "/account/user-controls.html", {
    sessionUserKey: MOCK_DB_KEYS.users.user1,
  });

  try {
    const keyboardProfiles = page.locator("[data-account-user-controls-list-family='Keyboard'] [data-account-user-controls-profile-row]");
    await page.locator("[data-account-user-controls-section='Keyboard'] [data-account-user-controls-edit-family='Keyboard']").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Created Keyboard Profile. Editing the new profile.");
    await page.locator("[data-account-user-controls-save]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Saved Keyboard Profile.");
    await expect(keyboardProfiles).toHaveCount(1);
    await expect(keyboardProfiles.first()).toContainText("Keyboard");
    let profileRows = await controllerProfileRecords(page);
    expect(profileRows).toEqual([
      expect.objectContaining({
        playerId: MOCK_DB_KEYS.users.user1,
        profileName: "Keyboard Profile",
      }),
    ]);

    await logoutSessionInPage(page);
    await expect(page.locator("[data-session-access-blocked]")).toBeVisible();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveCount(0);
    await expect(keyboardProfiles).toHaveCount(0);
    profileRows = await controllerProfileRecords(page);
    expect(profileRows).toEqual([
      expect.objectContaining({
        playerId: MOCK_DB_KEYS.users.user1,
        profileName: "Keyboard Profile",
      }),
    ]);

    await setSessionUserInPage(page, MOCK_DB_KEYS.users.user2);
    await page.goto(`${failures.server.baseUrl}/account/user-controls.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-session-access-blocked]")).toHaveCount(0);
    await expect(keyboardProfiles).toHaveCount(0);
    await expect(page.locator("[data-account-user-controls-list-family='Keyboard']")).not.toContainText("Keyboard Profile");

    await page.locator("[data-account-user-controls-section='Keyboard'] [data-account-user-controls-edit-family='Keyboard']").click();
    await expect(page.locator("[data-account-user-controls-controller-name]")).toHaveValue("Keyboard");
    await page.locator("[data-account-user-controls-controller-name]").fill("User 2 Keyboard");
    await page.locator("[data-account-user-controls-save]").click();
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("PASS: Saved User 2 Keyboard Profile.");
    await expect(keyboardProfiles).toHaveCount(1);
    await expect(keyboardProfiles.first()).toContainText("User 2 Keyboard");
    profileRows = await controllerProfileRecords(page);
    expect(profileRows).toEqual(expect.arrayContaining([
      expect.objectContaining({
        playerId: MOCK_DB_KEYS.users.user1,
        profileName: "Keyboard Profile",
      }),
      expect.objectContaining({
        playerId: MOCK_DB_KEYS.users.user2,
        profileName: "User 2 Keyboard Profile",
      }),
    ]));

    await setSessionUserInPage(page, MOCK_DB_KEYS.users.user1);
    await expect(page.locator("[data-account-user-controls-status]")).toHaveText("User Controls loaded for the selected user.");
    await expect(keyboardProfiles).toHaveCount(1);
    await expect(keyboardProfiles.first()).toContainText("Keyboard");
    await expect(page.locator("[data-account-user-controls-list-family='Keyboard']")).not.toContainText("User 2 Keyboard");
    await keyboardProfiles.first().getByRole("button", { name: "Edit" }).click();
    await expect(page.locator("[data-account-user-controls-controller-name]")).toHaveValue("Keyboard");
    await page.locator("[data-account-user-controls-cancel]").click();

    await setSessionUserInPage(page, MOCK_DB_KEYS.users.user2);
    await expect(keyboardProfiles).toHaveCount(1);
    await expect(keyboardProfiles.first()).toContainText("User 2 Keyboard");
    await expect(page.locator("[data-account-user-controls-list-family='Keyboard']")).not.toContainText("Keyboard Profile");
    await keyboardProfiles.first().getByRole("button", { name: "Edit" }).click();
    await expect(page.locator("[data-account-user-controls-controller-name]")).toHaveValue("User 2 Keyboard");
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
    const readAccountPanelMetrics = async () => page.locator(".account-panel").evaluate((panel) => {
      const aside = panel.querySelector("[data-account-side-nav]")?.getBoundingClientRect();
      const center = panel.querySelector(":scope > .card")?.getBoundingClientRect();
      const pages = panel.querySelector("[data-account-side-nav-accordion='pages']")?.getBoundingClientRect();
      const guidance = panel.querySelector("[data-account-side-nav-accordion='guidance']")?.getBoundingClientRect();
      const panelBox = panel.getBoundingClientRect();
      return aside && center && pages && guidance
        ? {
          asideLeft: aside.left,
          asideRight: aside.right,
          asideWidth: aside.width,
          centerLeft: center.left,
          centerRight: center.right,
          centerWidth: center.width,
          expectedCenterWidth: panelBox.right - center.left,
          guidanceY: guidance.y,
          panelLeft: panelBox.left,
          panelRight: panelBox.right,
          pagesBottom: pages.bottom,
          xDelta: Math.abs(pages.x - guidance.x),
        }
        : null;
    });

    await expect(page.locator("[data-account-side-nav]")).toBeVisible();
    const sideNavStructure = await page.locator("[data-account-side-nav]").evaluate((aside) => {
      const header = aside.querySelector(":scope > .tool-column-header");
      const stack = aside.querySelector(":scope > .accordion-stack");
      return {
        ariaLabel: aside.getAttribute("aria-label"),
        classes: Array.from(aside.classList),
        dataAttribute: aside.getAttribute("data-account-side-nav"),
        directAccordionCount: stack
          ? Array.from(stack.children).filter((child) => child.matches("details.vertical-accordion")).length
          : 0,
        headerText: header?.querySelector("h2, h3")?.textContent?.trim() || "",
        layout: stack?.getAttribute("data-account-side-nav-accordion-layout") || "",
        stackClassName: stack?.className || "",
        stackTagName: stack?.tagName.toLowerCase() || "",
        tagName: aside.tagName.toLowerCase(),
      };
    });
    expect(sideNavStructure).toEqual(expect.objectContaining({
      ariaLabel: "Account pages",
      classes: expect.arrayContaining(["side-menu", "tool-column"]),
      dataAttribute: "",
      directAccordionCount: 2,
      headerText: "Account",
      layout: "stacked",
      stackClassName: "accordion-stack",
      stackTagName: "div",
      tagName: "aside",
    }));
    expect(sideNavStructure.classes).not.toContain("tool-group-platform");
    const accountColorTreatment = await page.locator(".account-panel").evaluate((panel) => {
      const aside = panel.querySelector("[data-account-side-nav]");
      const centerCard = panel.querySelector(":scope > .card");
      const summary = aside?.querySelector("details.vertical-accordion summary");
      const toggle = aside?.querySelector("[data-account-side-nav-collapse]");
      const headerTitle = aside?.querySelector(".tool-column-header h2");
      const asideStyles = aside ? getComputedStyle(aside) : null;
      const centerStyles = centerCard ? getComputedStyle(centerCard) : null;
      const summaryStyles = summary ? getComputedStyle(summary) : null;
      const toggleStyles = toggle ? getComputedStyle(toggle) : null;
      const headerTitleStyles = headerTitle ? getComputedStyle(headerTitle) : null;
      return asideStyles && centerStyles && summaryStyles && toggleStyles && headerTitleStyles
        ? {
          asideBackgroundImage: asideStyles.backgroundImage,
          asideBorderColor: asideStyles.borderTopColor,
          centerBackgroundImage: centerStyles.backgroundImage,
          centerBorderColor: centerStyles.borderTopColor,
          centerTextColor: centerStyles.color,
          headerTitleColor: headerTitleStyles.color,
          summaryColor: summaryStyles.color,
          toggleColor: toggleStyles.color,
        }
        : null;
    });
    expect(accountColorTreatment).toEqual(expect.objectContaining({
      asideBackgroundImage: expect.any(String),
      asideBorderColor: expect.any(String),
      centerBackgroundImage: expect.any(String),
      centerBorderColor: expect.any(String),
      centerTextColor: expect.any(String),
      headerTitleColor: expect.any(String),
      summaryColor: expect.any(String),
      toggleColor: expect.any(String),
    }));
    expect(accountColorTreatment.asideBackgroundImage).toBe(accountColorTreatment.centerBackgroundImage);
    expect(accountColorTreatment.asideBorderColor).toBe(accountColorTreatment.centerBorderColor);
    expect(accountColorTreatment.summaryColor).toBe(accountColorTreatment.centerTextColor);
    expect(accountColorTreatment.toggleColor).toBe(accountColorTreatment.headerTitleColor);
    const collapseButton = page.locator("[data-account-side-nav-collapse]");
    await expect(collapseButton).toBeVisible();
    await expect(collapseButton).toHaveClass(/horizontal-accordion-toggle--left/);
    await expect(collapseButton).toHaveAttribute("aria-expanded", "true");
    await expect(collapseButton).toHaveAttribute("aria-label", "Collapse Account");
    const toggleHeaderMetrics = await collapseButton.evaluate((button) => {
      const title = button.closest(".tool-column-header")?.querySelector("h2")?.getBoundingClientRect();
      const buttonBox = button.getBoundingClientRect();
      return title
        ? {
          buttonLeft: buttonBox.left,
          titleRight: title.right,
        }
        : null;
    });
    expect(toggleHeaderMetrics).toEqual(expect.objectContaining({
      buttonLeft: expect.any(Number),
      titleRight: expect.any(Number),
    }));
    expect(toggleHeaderMetrics.buttonLeft).toBeGreaterThan(toggleHeaderMetrics.titleRight);
    await expect(page.locator("[data-account-side-nav-accordion-layout='stacked']")).toBeVisible();
    await expect(page.locator("[data-account-side-nav-accordion='pages']")).toHaveAttribute("open", "");
    await expect(page.locator("[data-account-side-nav-accordion='guidance']")).not.toHaveAttribute("open", "");
    const sideNavAccordionMetrics = await readAccountPanelMetrics();
    expect(sideNavAccordionMetrics).toEqual(expect.objectContaining({
      guidanceY: expect.any(Number),
      asideLeft: expect.any(Number),
      asideRight: expect.any(Number),
      asideWidth: expect.any(Number),
      centerLeft: expect.any(Number),
      centerRight: expect.any(Number),
      centerWidth: expect.any(Number),
      expectedCenterWidth: expect.any(Number),
      panelLeft: expect.any(Number),
      panelRight: expect.any(Number),
      pagesBottom: expect.any(Number),
      xDelta: expect.any(Number),
    }));
    expect(sideNavAccordionMetrics.asideLeft).toBeGreaterThanOrEqual(sideNavAccordionMetrics.panelLeft);
    expect(sideNavAccordionMetrics.asideRight).toBeLessThan(sideNavAccordionMetrics.centerLeft);
    expect(sideNavAccordionMetrics.centerRight).toBeCloseTo(sideNavAccordionMetrics.panelRight, 0);
    expect(sideNavAccordionMetrics.centerRight - sideNavAccordionMetrics.centerLeft)
      .toBeCloseTo(sideNavAccordionMetrics.expectedCenterWidth, 0);
    expect(sideNavAccordionMetrics.xDelta).toBeLessThanOrEqual(1);
    expect(sideNavAccordionMetrics.guidanceY).toBeGreaterThanOrEqual(sideNavAccordionMetrics.pagesBottom);
    await collapseButton.click();
    await expect(page.locator("[data-account-side-nav]")).toHaveClass(/is-collapsed/);
    await expect(page.locator(".account-panel")).toHaveClass(/is-left-collapsed/);
    await expect(collapseButton).toHaveAttribute("aria-expanded", "false");
    await expect(collapseButton).toHaveAttribute("aria-label", "Expand Account");
    await expect(page.locator("[data-account-side-nav-link]").first()).toBeHidden();
    const collapsedMetrics = await readAccountPanelMetrics();
    expect(collapsedMetrics.asideRight).toBeLessThan(collapsedMetrics.centerLeft);
    expect(collapsedMetrics.centerRight).toBeCloseTo(collapsedMetrics.panelRight, 0);
    expect(collapsedMetrics.centerWidth).toBeGreaterThan(sideNavAccordionMetrics.centerWidth);
    await collapseButton.click();
    await expect(page.locator("[data-account-side-nav]")).not.toHaveClass(/is-collapsed/);
    await expect(page.locator(".account-panel")).not.toHaveClass(/is-left-collapsed/);
    await expect(collapseButton).toHaveAttribute("aria-expanded", "true");
    await expect(collapseButton).toHaveAttribute("aria-label", "Collapse Account");
    await expect(page.locator("[data-account-side-nav-link]").first()).toBeVisible();
    await expect(page.locator("[data-account-side-nav-link]")).toHaveText([
      "Account Home",
      "Achievements",
      "AI Credits",
      "Preferences",
      "Profile",
      "Security",
      "User Controls",
    ]);
    await expect(page.locator("[data-account-side-nav-link][aria-current='page']")).toHaveText("User Controls");
    await page.locator("[data-account-side-nav-accordion='pages'] > summary").click();
    await expect(page.locator("[data-account-side-nav-accordion='pages']")).not.toHaveAttribute("open", "");
    await expect(page.locator("[data-account-side-nav-link]").first()).toBeHidden();
    await page.locator("[data-account-side-nav-accordion='pages'] > summary").click();
    await expect(page.locator("[data-account-side-nav-accordion='pages']")).toHaveAttribute("open", "");
    await expect(page.locator("[data-account-side-nav-link]").first()).toBeVisible();
    await page.locator("[data-account-side-nav-accordion='guidance'] > summary").click();
    await expect(page.locator("[data-account-side-nav-accordion='guidance']")).toHaveAttribute("open", "");
    await page.locator("[data-account-side-nav-accordion='guidance'] > summary").click();
    await expect(page.locator("[data-account-side-nav-accordion='guidance']")).not.toHaveAttribute("open", "");
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
        fetch("/assets/toolbox/controls/js/index.js").then((response) => response.text()),
        fetch("/account/user-controls-page.js").then((response) => response.text()),
      ]);
      return { accountControls, controls };
    });
    expect(sources.controls).toContain("../../www/src/engine/input/NormalizedInputRegistry.js");
    expect(sources.controls).not.toContain("../../www/src/engine/input/InputService.js");
    expect(sources.controls).not.toContain("DEVICE_POLL_INTERVAL_MS");
    expect(sources.controls).not.toContain("GAME_CONTROL_PRESETS");
    expect(sources.controls).not.toContain("applyGameControlPreset");
    expect(sources.accountControls).toContain("../www/src/engine/input/InputService.js");
    expect(sources.accountControls).toContain("../www/src/engine/input/NormalizedInputRegistry.js");
    expect(sources.accountControls).toContain("../www/src/engine/input/GamepadInputClassifier.js");
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
