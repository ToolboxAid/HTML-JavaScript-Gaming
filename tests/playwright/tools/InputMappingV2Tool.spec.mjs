import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const DEFAULT_ACTION_LABELS = [
  "Cancel",
  "Confirm",
  "Fire",
  "Interact",
  "Jump",
  "Move Down",
  "Move Left",
  "Move Right",
  "Move Up",
  "Pause",
  "Rotate Left",
  "Rotate Right",
  "Select",
  "Start",
  "Thrust",
];

const DEFAULT_ACTION_DESCRIPTIONS = [
  "Back out of a menu or choice.",
  "Accept a choice or prompt.",
  "Use the primary attack or tool.",
  "Use nearby objects or prompts.",
  "Make the object jump.",
  "Move the object downward.",
  "Move the object left.",
  "Move the object right.",
  "Move the object upward.",
  "Pause gameplay or open the pause menu.",
  "Turn the object counterclockwise.",
  "Turn the object clockwise.",
  "Highlight or choose menu items.",
  "Begin gameplay or open the start menu.",
  "Push the object forward.",
];

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "controls",
    surface: "Controls input mapping",
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

async function openControlsPage(page, path = "/toolbox/controls/index.html") {
  const server = await startRepoServer();
  const failures = collectPageFailures(page);
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${path}`, { waitUntil: "networkidle" });
  return { ...failures, server };
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function seedHeroObject(page) {
  await page.evaluate(async () => {
    const initResponse = await fetch("/api/toolbox/objects/repositories", {
      body: JSON.stringify({ options: {} }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const initPayload = await initResponse.json();
    const repositoryId = initPayload.data.repositoryId;
    const saveResponse = await fetch(`/api/toolbox/objects/repositories/${repositoryId}/methods/replaceObjects`, {
      body: JSON.stringify({
        args: [[{
          behavior: "Responds to mapped input.",
          id: "hero",
          interaction: "Uses controls.",
          name: "Hero",
          render: { type: "None" },
          role: "Hero",
          state: "Active",
          traits: ["playerControlled", "movable"],
          type: "Dynamic",
        }]],
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    await saveResponse.json();
  });
}

async function seedObjectActionValidationRecords(page) {
  await page.evaluate(async () => {
    const initResponse = await fetch("/api/toolbox/objects/repositories", {
      body: JSON.stringify({ options: {} }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const initPayload = await initResponse.json();
    const repositoryId = initPayload.data.repositoryId;
    const saveResponse = await fetch(`/api/toolbox/objects/repositories/${repositoryId}/methods/replaceObjects`, {
      body: JSON.stringify({
        args: [[
          {
            behavior: "Responds to mapped input.",
            id: "hero",
            interaction: "Uses controls.",
            name: "Hero",
            render: { type: "None" },
            role: "Hero",
            state: "Active",
            traits: ["playerControlled", "movable", "collides"],
            type: "Dynamic",
          },
          {
            behavior: "Adds score when collected.",
            id: "coin",
            interaction: "Can be collected by the hero.",
            name: "Coin",
            render: { type: "None" },
            role: "Collectible",
            state: "Active",
            traits: ["collectible", "scores"],
            type: "Collectible",
          },
          {
            behavior: "Launches forward when fired.",
            id: "bolt",
            interaction: "Can damage targets.",
            name: "Bolt",
            render: { type: "None" },
            role: "Projectile",
            state: "Active",
            traits: ["movable", "hazard"],
            type: "Dynamic",
          },
        ]],
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    await saveResponse.json();
  });
}

async function seedInvalidCollectibleMapping(page) {
  await page.evaluate(async () => {
    const initResponse = await fetch("/api/toolbox/controls/repositories", {
      body: JSON.stringify({ options: {} }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const initPayload = await initResponse.json();
    const repositoryId = initPayload.data.repositoryId;
    const saveResponse = await fetch(`/api/toolbox/controls/repositories/${repositoryId}/methods/replaceMappings`, {
      body: JSON.stringify({
        args: [[{
          action: "moveLeft",
          actionLabel: "Move Left",
          binding: "KeyA",
          engine: "KeyboardState",
          id: "coin-move-left",
          inputDevice: "Keyboard",
          label: "Keyboard KeyA",
          objectKey: "coin",
          objectName: "Coin",
          source: "keyboard",
          state: "Active",
        }]],
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    await saveResponse.json();
  });
}

async function inputMappingRecords(page) {
  return page.evaluate(async () => {
    const response = await fetch("/api/mock-db/snapshot");
    const payload = await response.json();
    return payload.data.tables.input_mapping_records || [];
  });
}

async function controllerProfileRecords(page) {
  return page.evaluate(async () => {
    const response = await fetch("/api/mock-db/snapshot");
    const payload = await response.json();
    return payload.data.tables.input_controller_profile_records || [];
  });
}

async function customActionRecords(page) {
  return page.evaluate(async () => {
    const response = await fetch("/api/mock-db/snapshot");
    const payload = await response.json();
    return payload.data.tables.input_custom_action_records || [];
  });
}

async function controlsRegistryEntry(page) {
  return page.evaluate(async () => {
    const response = await fetch("/api/toolbox/registry/snapshot");
    const payload = await response.json();
    return payload.data.tools.find((tool) => tool.id === "controls") || null;
  });
}

test("Controls Input Mapping launch panels, defaults, diagnostics, and workspace return match UAT", async ({ page }) => {
  const failures = await openControlsPage(page, "/toolbox/controls/index.html?workspace=demo-project");

  try {
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("summary").filter({ hasText: "Actions" })).toBeVisible();
    await expect(page.locator("aside").first().locator("[data-input-action-select]")).toHaveCount(0);
    await expect(page.locator("aside").first().locator("[data-input-object-select]")).toHaveCount(0);
    await expect(page.locator("[data-input-action-catalog] th")).toHaveText(["Action Name", "Description"]);
    await expect(page.locator("summary").filter({ hasText: "Capture" })).toHaveCount(0);
    await expect(page.locator("aside").first().locator("summary").filter({ hasText: "Controller Profiles" })).toHaveCount(0);
    await expect(page.locator("[data-input-mapping-accordion] summary")).toHaveText("Input Mapping");
    await expect(page.locator("[data-controller-profile-accordion] summary")).toHaveText("Controller Profile");
    await expect(page.locator(".tool-center-panel [data-controller-profile-planning]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mappings" })).toBeVisible();
    await expect(page.locator("[data-input-state-explanation]")).toHaveText("State: Active means the mapping is available to the game. Disabled means the mapping is saved but ignored by the game until re-enabled.");
    await expect(page.getByText("Mapping JSON", { exact: true })).toHaveCount(0);
    await expect(page.locator("[data-input-mapping-json]")).toHaveCount(0);
    await expect(page.getByText("Devices", { exact: true })).toBeVisible();
    await expect(page.getByText("Status", { exact: true })).toBeVisible();
    await expect(page.locator("[data-input-return-workspace]")).toBeVisible();
    await expect(page.locator("[data-controller-profile-table] th")).toHaveText([
      "Device Type",
      "Controller Name",
      "Controller ID",
      "Mapping Profile",
      "Action",
    ]);
    await expect(page.locator("[data-controller-profile-list]")).toContainText("No controller profiles saved yet.");
    await expect(page.locator("[data-controller-profile-table]")).not.toContainText("Create Profile Needed");
    await expect(page.locator("[data-controller-profile-status]")).toContainText("WARN: Unknown controller.");
    await expect(page.locator("[data-controller-profile-status]")).toContainText("use Add Profile");
    await expect(page.locator("[data-controller-profile-fallback-status]")).toHaveText("Missing Mapping. Missing saved profile for this controller.");
    await expect(page.locator("[data-controller-profile-create-default]")).toBeHidden();
    await expect(page.locator("[data-controller-profile-planning]")).toContainText("Future game launch will match Controller ID to a saved Mapping Profile");
    await expect(page.locator("[data-controller-profile-add]")).toBeVisible();
    await expect(page.locator("[data-controller-device-select] option")).toHaveText([
      "Choose a game controller",
    ]);
    await expect(page.locator("[data-controller-device-select]")).not.toContainText("Keyboard");
    await expect(page.locator("[data-controller-device-select]")).not.toContainText("Mouse");
    expect(await controllerProfileRecords(page)).toHaveLength(0);
    await expect(page.locator("[data-input-mapping-table] th")).toHaveText([
      "Object",
      "Action",
      "Input Device",
      "Mapping Profile",
      "Input",
      "State",
      "Actions",
    ]);
    await expect(page.locator("[data-input-add-mapping]")).toHaveCount(1);
    await expect(page.locator("[data-input-mapping-table] tfoot [data-input-add-mapping]")).toBeVisible();
    await expect(page.locator("[data-input-mapping-table] tfoot [data-input-reset-mappings]")).toBeVisible();
    await expect(page.locator("[data-input-mapping-table] tfoot [data-input-selected-context]")).toBeVisible();
    await expect(page.locator("[data-input-mapping-table] tfoot [data-input-action-select]")).toBeVisible();
    await expect(page.locator("[data-input-mapping-table] tfoot [data-input-object-select]")).toBeVisible();
    await expect(page.locator("[data-input-mapping-table] tfoot [data-input-action-select] option")).toHaveText(DEFAULT_ACTION_LABELS);
    await expect(page.locator("[data-input-mapping-table] tfoot [data-input-object-select] option")).toHaveText(["Global"]);
    await expect(page.locator("[data-input-object-summary-name]")).toHaveText("Global");
    await expect(page.locator("[data-input-object-summary-role]")).toHaveText("Global");
    await expect(page.locator("[data-input-object-summary-actions]")).toHaveText(DEFAULT_ACTION_LABELS.join(", "));
    await expect(page.locator("[data-input-action-label]")).toHaveText(DEFAULT_ACTION_LABELS);
    await expect(page.locator("[data-input-action-description]")).toHaveText(DEFAULT_ACTION_DESCRIPTIONS);
    await expect(page.locator("[data-input-custom-action-name]")).toBeVisible();
    await expect(page.locator("[data-input-custom-action-add]")).toBeVisible();
    expect(await customActionRecords(page)).toHaveLength(0);
    expect(DEFAULT_ACTION_LABELS).toEqual([...DEFAULT_ACTION_LABELS].sort((left, right) => left.localeCompare(right)));
    await expect(page.locator("[data-input-action-select]")).toContainText("Pause");
    await expect(page.locator("[data-input-action-select]")).toContainText("Select");
    await expect(page.locator("[data-input-action-select]")).toContainText("Start");
    await expect(page.locator("[data-input-action-select]")).toContainText("Move Left");
    await expect(page.locator("[data-input-action-select]")).toContainText("Move Right");
    await expect(page.locator("[data-input-action-select]")).toContainText("Move Up");
    await expect(page.locator("[data-input-action-select]")).toContainText("Move Down");
    await expect(page.locator("[data-input-action-select]")).toContainText("Confirm");
    await expect(page.locator("[data-input-action-select]")).toContainText("Cancel");
    await expect(page.locator("[data-input-action-select]")).toContainText("Fire");
    await expect(page.locator("[data-input-action-select]")).toContainText("Thrust");
    await expect(page.locator("[data-input-action-select]")).toContainText("Rotate Left");
    await expect(page.locator("[data-input-action-select]")).toContainText("Rotate Right");
    await expect(page.locator("[data-input-source-diagnostics]")).toContainText("InputService + KeyboardState");
    await expect(page.locator("[data-input-source-diagnostics]")).toContainText("InputService + MouseState");
    await expect(page.locator("[data-input-source-diagnostics]")).toContainText("InputService + GamepadState + GamepadInputAdapter");
    await expect(page.locator("[data-input-source-diagnostics]")).toContainText("GamepadInputAdapter");

    await page.locator("[data-input-action-select]").selectOption("moveLeft");
    await expect(page.locator("[data-input-status-log]")).toHaveText("Selected Move Left action for new mappings.");
    await page.getByRole("button", { name: "Refresh Devices" }).click();
    await expect(page.locator("[data-input-status-log]")).toHaveText("Device diagnostics refreshed.");

    const registryEntry = await controlsRegistryEntry(page);
    expect(registryEntry.path).toBe("toolbox/controls/index.html");
    expect(registryEntry.status).toBe("wireframe");
    expect(registryEntry.status).not.toBe("beta");
    expect(registryEntry.releaseChannel).toBe("wireframe");
    expect(registryEntry.releaseChannelLabel).toBe("Wireframe");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Controls Input Mapping supports table-first inline add, cancel, save, and edit", async ({ page }) => {
  const failures = await openControlsPage(page);

  try {
    const addButton = page.locator("[data-input-mapping-table] tfoot [data-input-add-mapping]");
    await expect(addButton).toBeEnabled();

    await addButton.click();
    await expect(addButton).toBeDisabled();
    await expect(page.locator("[data-input-editing-row]")).toHaveCount(1);
    await expect(page.locator("[data-input-editing-row] td")).toHaveCount(7);
    await expect(page.locator("[data-input-editing-row] td").last().locator("button")).toHaveText(["Save", "Cancel"]);
    await expect(page.locator("[data-input-editing-row] td").last().locator("button").last()).toHaveText("Cancel");
    await expect(page.locator("[data-input-row-capture-keyboard]")).toBeVisible();
    await expect(page.locator("[data-input-row-capture-mouse]")).toHaveCount(0);
    await expect(page.locator("[data-input-row-capture-gamepad]")).toHaveCount(0);
    await expect(page.locator("[data-input-row-device] option")).toHaveText(["Keyboard", "Mouse", "Gamepad"]);
    await page.locator("[data-input-row-device]").selectOption("mouse");
    await expect(page.locator("[data-input-row-capture-keyboard]")).toHaveCount(0);
    await expect(page.locator("[data-input-row-capture-mouse]")).toBeVisible();
    await expect(page.locator("[data-input-row-capture-gamepad]")).toHaveCount(0);
    await page.locator("[data-input-row-device]").selectOption("gamepad");
    await expect(page.locator("[data-input-row-capture-keyboard]")).toHaveCount(0);
    await expect(page.locator("[data-input-row-capture-mouse]")).toHaveCount(0);
    await expect(page.locator("[data-input-row-capture-gamepad]")).toBeVisible();
    await page.evaluate(() => {
      Object.defineProperty(navigator, "getGamepads", {
        configurable: true,
        value: () => [],
      });
    });
    await page.locator("[data-input-row-capture-gamepad]").click();
    await expect(page.locator("[data-input-status-log]")).toContainText("WARN: Gamepad capture unavailable.");
    await expect(page.locator("[data-input-status-log]")).toContainText("connect a gamepad");
    await expect(page.locator("[data-input-status-log]")).toContainText("press a button or move an axis");

    await page.locator("[data-input-editing-row] [data-input-cancel-mapping]").click();
    await expect(page.locator("[data-input-editing-row]")).toHaveCount(0);
    await expect(addButton).toBeEnabled();
    await expect(page.locator("[data-input-mapping-list]")).toContainText("No mappings added yet.");

    await addButton.click();
    await page.locator("[data-input-row-action]").selectOption("fire");
    await page.locator("[data-input-row-device]").selectOption("keyboard");
    await expect(page.locator("[data-input-row-profile] option")).toHaveText(["No saved profile"]);
    await expect(page.locator("[data-input-row-binding]")).toHaveAttribute("type", "hidden");
    await page.locator("[data-input-row-capture-keyboard]").click();
    await expect(page.locator("[data-input-status-log]")).toHaveText("Press a keyboard key to capture input for this row.");
    await page.keyboard.press("KeyF");
    await expect(page.locator("[data-input-row-binding-value]")).toHaveText("Keyboard KeyF");
    await expect(page.locator("[data-input-row-capture-keyboard]")).toHaveCount(0);
    await page.locator("[data-input-row-binding-value]").click();
    await expect(page.locator("[data-input-status-log]")).toHaveText("Press a keyboard key to capture input for this row.");
    await page.keyboard.press("KeyF");
    await page.locator("[data-input-row-device]").selectOption("mouse");
    await expect(page.locator("[data-input-row-binding-value]")).toBeHidden();
    await expect(page.locator("[data-input-row-capture-keyboard]")).toHaveCount(0);
    await expect(page.locator("[data-input-row-capture-mouse]")).toBeVisible();
    await expect(page.locator("[data-input-row-capture-gamepad]")).toHaveCount(0);
    await page.locator("[data-input-row-device]").selectOption("keyboard");
    await expect(page.locator("[data-input-row-capture-keyboard]")).toBeVisible();
    await page.locator("[data-input-row-capture-keyboard]").click();
    await page.keyboard.press("KeyF");
    await expect(page.locator("[data-input-row-binding-value]")).toHaveText("Keyboard KeyF");
    await page.locator("[data-input-save-mapping]").click();
    await expect(addButton).toBeEnabled();
    await expect(page.locator("[data-input-editing-row]")).toHaveCount(0);
    await expect(page.locator("[data-input-mapping-list] tr")).toHaveCount(1);
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Fire");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("No saved profile");
    await expect(page.locator("[data-input-token]")).toHaveText("Keyboard KeyF");
    let records = await inputMappingRecords(page);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      action: "fire",
      binding: "KeyF",
      source: "keyboard",
      state: "Active",
    });

    await page.locator("[data-input-edit-mapping]").click();
    await expect(page.locator("[data-input-editing-row]")).toHaveCount(1);
    await expect(page.locator("[data-input-mapping-row]")).toHaveCount(0);
    await expect(addButton).toBeDisabled();
    await expect(page.locator("[data-input-row-binding-value]")).toHaveText("Keyboard KeyF");
    await expect(page.locator("[data-input-row-capture-keyboard]")).toHaveCount(0);
    await page.locator("[data-input-row-binding-value]").click();
    await expect(page.locator("[data-input-status-log]")).toHaveText("Press a keyboard key to capture input for this row.");
    await page.keyboard.press("KeyG");
    await expect(page.locator("[data-input-row-binding-value]")).toHaveText("Keyboard KeyG");
    await page.locator("[data-input-save-mapping]").click();
    await expect(addButton).toBeEnabled();
    await expect(page.locator("[data-input-token]")).toHaveText("Keyboard KeyG");
    records = await inputMappingRecords(page);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      action: "fire",
      binding: "KeyG",
      source: "keyboard",
      state: "Active",
    });

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-token]")).toHaveText("Keyboard KeyG");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Controls filters actions by DB-backed object and flags invalid object action mappings", async ({ page }) => {
  const failures = await openControlsPage(page);

  try {
    await seedObjectActionValidationRecords(page);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-mapping-table] tfoot [data-input-object-select] option")).toHaveText([
      "Global",
      "Hero",
      "Coin",
      "Bolt",
    ]);

    await page.locator("[data-input-object-select]").selectOption("coin");
    await expect(page.locator("[data-input-object-summary-name]")).toHaveText("Coin");
    await expect(page.locator("[data-input-object-summary-role]")).toHaveText("Collectible");
    await expect(page.locator("[data-input-object-summary-actions]")).toHaveText("Confirm, Interact, Select");
    await expect(page.locator("[data-input-action-select] option")).toHaveText(["Confirm", "Interact", "Select"]);
    await expect(page.locator("[data-input-action-select]")).not.toContainText("Move Left");
    await expect(page.locator("[data-input-action-select]")).not.toContainText("Move Right");
    await expect(page.locator("[data-input-action-select]")).not.toContainText("Jump");

    await page.locator("[data-input-add-mapping]").click();
    await expect(page.locator("[data-input-row-object]")).toHaveValue("coin");
    await expect(page.locator("[data-input-row-action] option")).toHaveText(["Confirm", "Interact", "Select"]);
    await expect(page.locator("[data-input-row-action]")).not.toContainText("Move Left");
    await page.locator("[data-input-cancel-mapping]").click();

    await page.locator("[data-input-object-select]").selectOption("hero");
    await expect(page.locator("[data-input-object-summary-role]")).toHaveText("Hero");
    await expect(page.locator("[data-input-action-select]")).toContainText("Move Left");
    await expect(page.locator("[data-input-action-select]")).toContainText("Move Right");
    await expect(page.locator("[data-input-action-select]")).toContainText("Jump");
    await expect(page.locator("[data-input-action-select]")).toContainText("Interact");

    await page.locator("[data-input-object-select]").selectOption("bolt");
    await expect(page.locator("[data-input-object-summary-role]")).toHaveText("Projectile");
    await expect(page.locator("[data-input-object-summary-actions]")).toHaveText("Fire, Rotate Left, Rotate Right, Thrust");
    await expect(page.locator("[data-input-action-select] option")).toHaveText(["Fire", "Rotate Left", "Rotate Right", "Thrust"]);
    await page.locator("[data-input-action-select]").selectOption("fire");
    await page.locator("[data-input-add-mapping]").click();
    await expect(page.locator("[data-input-row-object]")).toHaveValue("bolt");
    await expect(page.locator("[data-input-row-action]")).toHaveValue("fire");
    await page.locator("[data-input-row-capture-keyboard]").click();
    await page.keyboard.press("KeyL");
    await expect(page.locator("[data-input-row-binding-value]")).toHaveText("Keyboard KeyL");
    await page.locator("[data-input-save-mapping]").click();
    await expect(page.locator("[data-input-mapping-row]").filter({ hasText: "Bolt" })).toContainText("Fire");
    await expect(page.locator("[data-input-output-status]")).toHaveText("Complete");

    let records = await inputMappingRecords(page);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      action: "fire",
      binding: "KeyL",
      objectKey: "bolt",
      source: "keyboard",
    });

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-mapping-row]").filter({ hasText: "Bolt" })).toContainText("Fire");
    await expect(page.locator("[data-input-token]")).toHaveText("Keyboard KeyL");

    await seedInvalidCollectibleMapping(page);
    await page.reload({ waitUntil: "networkidle" });
    const invalidRow = page.locator("[data-input-mapping-row]").filter({ hasText: "Coin" });
    await expect(invalidRow).toContainText("Move Left");
    await expect(invalidRow.locator("[data-input-mapping-validation]")).toContainText("Needs update:");
    await expect(invalidRow.locator("[data-input-mapping-validation]")).toContainText("Move Left is not available for Collectible.");
    await expect(invalidRow.locator("[data-input-mapping-validation]")).toContainText("Edit this row and choose: Confirm, Interact, Select.");
    await expect(page.locator("[data-input-output-status]")).toHaveText("Pending Setup");

    await invalidRow.locator("[data-input-edit-mapping]").click();
    await expect(page.locator("[data-input-row-object]")).toHaveValue("coin");
    await expect(page.locator("[data-input-row-action] option")).toHaveText(["Confirm", "Interact", "Select"]);
    await page.locator("[data-input-row-action]").selectOption("interact");
    await expect(page.locator("[data-input-row-validation]")).toHaveText("");
    await page.locator("[data-input-save-mapping]").click();
    await expect(page.locator("[data-input-output-status]")).toHaveText("Complete");
    await expect(page.locator("[data-input-mapping-validation]")).toHaveCount(0);
    records = await inputMappingRecords(page);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      action: "interact",
      binding: "KeyA",
      objectKey: "coin",
      source: "keyboard",
    });

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-mapping-row]").filter({ hasText: "Coin" })).toContainText("Interact");
    await expect(page.locator("[data-input-output-status]")).toHaveText("Complete");

    await page.evaluate(() => {
      Object.defineProperty(navigator, "getGamepads", {
        configurable: true,
        value: () => [{
          axes: [0],
          buttons: [{ pressed: false, value: 0 }],
          id: "Validation Pad",
          index: 0,
        }],
      });
    });
    await page.locator("[data-input-refresh-devices]").click();
    await expect(page.locator("[data-controller-device-select]")).toContainText("Gamepad: Validation Pad");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("This will delete all Mappings, are you sure?");
      await dialog.dismiss();
    });
    await page.locator("[data-input-reset-mappings]").click();
    await expect(page.locator("[data-input-status-log]")).toHaveText("Reset canceled.");
    await expect(page.locator("[data-input-mapping-row]").filter({ hasText: "Coin" })).toContainText("Interact");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("This will delete all Mappings, are you sure?");
      await dialog.accept();
    });
    await page.locator("[data-input-reset-mappings]").click();
    await expect(page.locator("[data-input-mapping-list]")).toContainText("No mappings added yet.");
    records = await inputMappingRecords(page);
    expect(records).toHaveLength(0);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-mapping-list]")).toContainText("No mappings added yet.");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Controls generates controller profiles, shows fallback status, and mappings reference saved profiles", async ({ page }) => {
  const failures = await openControlsPage(page);

  try {
    await expect(page.locator("[data-controller-profile-list]")).toContainText("No controller profiles saved yet.");
    expect(await controllerProfileRecords(page)).toHaveLength(0);

    await page.evaluate(() => {
      window.__arcadeButtons = Array.from({ length: 16 }, () => ({ pressed: false, value: 0 }));
      window.__arcadeAxes = [0, 0];
      Object.defineProperty(navigator, "getGamepads", {
        configurable: true,
        value: () => [{
          axes: window.__arcadeAxes,
          buttons: window.__arcadeButtons,
          id: "Arcade Test Pad",
          index: 0,
        }],
      });
    });
    await page.locator("[data-input-refresh-devices]").click();
    await expect(page.locator("[data-controller-device-select] option")).toHaveText([
      "Choose a game controller",
      "Gamepad: Arcade Test Pad",
    ]);
    await expect(page.locator("[data-controller-device-select]")).not.toContainText("Keyboard");
    await expect(page.locator("[data-controller-device-select]")).not.toContainText("Mouse");

    await page.locator("[data-controller-device-select]").selectOption("gamepad-0");
    await expect(page.locator("[data-controller-profile-editing-row]")).toHaveCount(0);
    await expect(page.locator("[data-controller-profile-fallback-status]")).toContainText("Using Default Gamepad Mapping");
    await expect(page.locator("[data-controller-profile-fallback-status]")).toContainText("Missing saved profile for this controller");
    await expect(page.locator("[data-controller-profile-create-default]")).toBeVisible();
    expect(await controllerProfileRecords(page)).toHaveLength(0);

    await page.locator("[data-controller-profile-add]").click();
    await expect(page.locator("[data-controller-profile-list]")).toContainText("Arcade Test Pad");
    await expect(page.locator("[data-controller-profile-list]")).toContainText("Arcade Test Pad Profile");
    await expect(page.locator("[data-controller-profile-list]")).toContainText("0/18 Actions assigned");
    await expect(page.locator("[data-controller-profile-table] th")).toHaveText([
      "Device Type",
      "Controller Name",
      "Controller ID",
      "Mapping Profile",
      "Action",
    ]);
    await expect(page.locator("[data-controller-profile-row]").first()).not.toContainText("Button0");
    await expect(page.locator("[data-controller-profile-actions-row]")).toHaveCount(0);
    await expect(page.locator("[data-controller-profile-input-action]")).toHaveCount(0);
    await expect(page.locator("[data-controller-profile-fallback-status]")).toContainText("Exact saved profile");

    let profiles = await controllerProfileRecords(page);
    expect(profiles).toHaveLength(1);
    expect(profiles[0]).toMatchObject({
      actions: [],
      controllerId: "Arcade Test Pad",
      controllerName: "Arcade Test Pad",
      deviceType: "Gamepad",
      mappingProfile: "Arcade Test Pad Profile",
    });
    expect(profiles[0].inputs).toEqual([
      "Button0",
      "Button1",
      "Button2",
      "Button3",
      "Button4",
      "Button5",
      "Trigger Left",
      "Trigger Right",
      "Button8",
      "Button9",
      "Button10",
      "Button11",
      "DPad Up",
      "DPad Down",
      "DPad Left",
      "DPad Right",
      "Axis0",
      "Axis1",
    ]);

    await page.locator("[data-controller-profile-edit]").click();
    const editRow = page.locator("[data-controller-profile-editing-row]");
    await expect(editRow.locator("td").nth(0)).toHaveText("Gamepad");
    await expect(editRow.locator("td").nth(1)).toHaveText("Arcade Test Pad");
    await expect(editRow.locator("td").nth(2)).toHaveText("Arcade Test Pad");
    await expect(editRow.locator("td").nth(3)).toHaveText("Arcade Test Pad Profile");
    await expect(editRow.locator("select")).toHaveCount(0);
    await expect(editRow.locator("input")).toHaveCount(0);
    await expect(editRow.locator("button")).toHaveText(["Save", "Cancel"]);

    const editingActionsRow = page.locator("[data-controller-profile-editing-actions-row]");
    await expect(editingActionsRow.locator(".content-grid--three")).toBeVisible();
    await expect(editingActionsRow.locator("[data-controller-profile-input-pair]")).toHaveCount(18);
    await expect(editingActionsRow.locator("[data-controller-profile-input-pair]").first().locator("strong")).toHaveText("Button0");
    await expect(editingActionsRow.locator("[data-controller-profile-input-action]")).toHaveCount(18);

    await page.locator("[data-controller-profile-save]").click();
    await expect(page.locator("[data-controller-profile-status]")).toContainText("Action Required");
    profiles = await controllerProfileRecords(page);
    expect(profiles[0].actions).toEqual([]);

    const inputActionSelects = editingActionsRow.locator("[data-controller-profile-input-action]");
    const inputActionCount = await inputActionSelects.count();
    expect(inputActionCount).toBe(profiles[0].inputs.length);
    for (let index = 0; index < inputActionCount; index += 1) {
      await inputActionSelects.nth(index).selectOption(index === 0 ? "fire" : "moveRight");
    }
    await expect(inputActionSelects.nth(1)).toHaveValue("moveRight");
    await page.evaluate(() => {
      window.__arcadeButtons[0] = { pressed: true, value: 1 };
    });
    const activeProfileInput = page.locator("[data-controller-profile-input-pair][data-controller-profile-input-active='true']");
    await expect(activeProfileInput.locator("strong")).toHaveText("Button0");
    await expect(activeProfileInput.locator("[data-controller-profile-input-assigned-action]")).toHaveText("Selected Action: Fire");
    await expect(editingActionsRow.locator("[data-controller-profile-input-pair]").nth(1)).not.toHaveAttribute("data-controller-profile-input-active", "true");
    await expect(editingActionsRow.locator("[data-controller-profile-input-pair]").nth(1).locator("[data-controller-profile-input-assigned-action]")).toHaveText("Assigned Action: Move Right");

    await page.locator("[data-controller-profile-save]").click();
    profiles = await controllerProfileRecords(page);
    expect(profiles[0].actions).toHaveLength(profiles[0].inputs.length);
    expect(profiles[0].actions[0]).toBe("fire");
    expect(profiles[0].actions[1]).toBe("moveRight");
    await expect(page.locator("[data-controller-profile-input-action]")).toHaveCount(0);

    await page.locator("[data-controller-profile-edit]").click();
    await page.locator("[data-controller-profile-input-action]").first().selectOption("jump");
    await page.locator("[data-controller-profile-cancel]").click();
    profiles = await controllerProfileRecords(page);
    expect(profiles[0].actions[0]).toBe("fire");
    await expect(page.locator("[data-controller-profile-input-action]")).toHaveCount(0);

    await page.locator("[data-controller-profile-trash]").click();
    await expect(page.locator("[data-controller-profile-list]")).toContainText("No controller profiles saved yet.");
    expect(await controllerProfileRecords(page)).toHaveLength(0);
    await expect(page.locator("[data-controller-profile-create-default]")).toBeVisible();
    await page.locator("[data-controller-profile-create-default]").click();
    profiles = await controllerProfileRecords(page);
    expect(profiles).toHaveLength(1);
    expect(profiles[0].mappingProfile).toBe("Arcade Test Pad Profile");

    expect(profiles).toHaveLength(1);

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-mapping-accordion] summary")).toHaveText("Input Mapping");
    await expect(page.locator("[data-controller-profile-accordion] summary")).toHaveText("Controller Profile");
    await expect(page.locator("[data-controller-profile-list]")).toContainText("Arcade Test Pad Profile");
    await page.evaluate(() => {
      Object.defineProperty(navigator, "getGamepads", {
        configurable: true,
        value: () => [{
          axes: [],
          buttons: [{ pressed: true, value: 1 }],
          id: "Arcade Test Pad",
          index: 0,
        }],
      });
    });
    await page.locator("[data-input-refresh-devices]").click();
    await page.locator("[data-controller-device-select]").selectOption("gamepad-0");
    await expect(page.locator("[data-controller-profile-fallback-status]")).toContainText("Exact saved profile");

    await page.locator("[data-input-add-mapping]").click();
    await page.locator("[data-input-row-action]").selectOption("fire");
    await page.locator("[data-input-row-device]").selectOption("gamepad");
    await page.locator("[data-input-row-profile]").selectOption({ label: "Arcade Test Pad Profile" });
    await page.locator("[data-input-row-capture-gamepad]").click();
    await expect(page.locator("[data-input-row-binding-value]")).toHaveText("Gamepad Button0");
    await page.locator("[data-input-save-mapping]").click();
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Arcade Test Pad Profile");
    await expect(page.locator("[data-input-token]")).toHaveText("Gamepad Button0");

    let records = await inputMappingRecords(page);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      action: "fire",
      binding: "Pad0:Button0",
      controllerProfileId: profiles[0].id,
      mappingProfile: "Arcade Test Pad Profile",
      source: "gamepad",
    });

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-controller-profile-list]")).toContainText("Arcade Test Pad Profile");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Arcade Test Pad Profile");
    profiles = await controllerProfileRecords(page);
    records = await inputMappingRecords(page);
    expect(profiles).toHaveLength(1);
    expect(records).toHaveLength(1);
    expect(records[0].controllerProfileId).toBe(profiles[0].id);

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Controls persists custom Actions and exposes them in mapping dropdowns after reload", async ({ page }) => {
  const failures = await openControlsPage(page);

  try {
    await seedHeroObject(page);
    await page.reload({ waitUntil: "networkidle" });

    await page.locator("[data-input-custom-action-name]").fill("Dash Burst");
    await page.locator("[data-input-custom-action-add]").click();
    await expect(page.locator("[data-input-custom-action-status]")).toHaveText("Dash Burst saved.");
    await expect(page.locator("[data-input-action-catalog]")).toContainText("Dash Burst");
    await expect(page.locator("[data-input-action-select]")).toContainText("Dash Burst");

    let customActions = await customActionRecords(page);
    expect(customActions).toHaveLength(1);
    expect(customActions[0]).toMatchObject({
      id: "custom-dash-burst",
      label: "Dash Burst",
    });

    await page.locator("[data-input-object-select]").selectOption("hero");
    await expect(page.locator("[data-input-action-select]")).toContainText("Dash Burst");
    await page.locator("[data-input-action-select]").selectOption("custom-dash-burst");
    await page.locator("[data-input-add-mapping]").click();
    await expect(page.locator("[data-input-row-object]")).toHaveValue("hero");
    await expect(page.locator("[data-input-row-action]")).toHaveValue("custom-dash-burst");
    await page.locator("[data-input-row-capture-keyboard]").click();
    await page.keyboard.press("KeyD");
    await page.locator("[data-input-save-mapping]").click();
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Dash Burst");

    let records = await inputMappingRecords(page);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      action: "custom-dash-burst",
      actionLabel: "Dash Burst",
      binding: "KeyD",
      objectKey: "hero",
      source: "keyboard",
    });

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-action-catalog]")).toContainText("Dash Burst");
    await expect(page.locator("[data-input-action-select]")).toContainText("Dash Burst");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Dash Burst");
    await expect(page.locator("[data-input-token]")).toHaveText("Keyboard KeyD");
    customActions = await customActionRecords(page);
    records = await inputMappingRecords(page);
    expect(customActions).toHaveLength(1);
    expect(records).toHaveLength(1);

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Controls Input Mapping gates input capture to edit mode and deletes only through Trash", async ({ page }) => {
  const failures = await openControlsPage(page);

  try {
    await seedHeroObject(page);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-mapping-table] tfoot [data-input-object-select] option")).toContainText(["Global", "Hero"]);
    await page.locator("[data-input-object-select]").selectOption("hero");
    await page.locator("[data-input-action-select]").selectOption("moveLeft");
    await expect(page.locator("[data-input-mapping-table] tfoot [data-input-action-select]")).toHaveValue("moveLeft");
    await expect(page.locator("[data-input-mapping-table] tfoot [data-input-object-select]")).toHaveValue("hero");

    await page.locator("[data-input-add-mapping]").click();
    await expect(page.locator("[data-input-row-object]")).toHaveValue("hero");
    await expect(page.locator("[data-input-row-action]")).toHaveValue("moveLeft");
    await page.locator("[data-input-row-capture-keyboard]").click();
    await expect(page.locator("[data-input-status-log]")).toHaveText("Press a keyboard key to capture input for this row.");
    await page.keyboard.press("KeyA");
    await expect(page.locator("[data-input-row-binding-value]")).toHaveText("Keyboard KeyA");
    await page.locator("[data-input-save-mapping]").click();
    await expect(page.locator("[data-input-mapping-list] tr")).toHaveCount(1);
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Hero");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Move Left");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Keyboard");
    await expect(page.locator("[data-input-token]")).toHaveText("Keyboard KeyA");
    await expect(page.locator("[data-input-mapping-json]")).toHaveCount(0);
    await expect(page.locator("[data-input-output-status]")).toHaveText("Complete");

    let records = await inputMappingRecords(page);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      action: "moveLeft",
      binding: "KeyA",
      objectKey: "hero",
      source: "keyboard",
    });

    await page.locator("[data-input-object-select]").selectOption("global");
    await page.locator("[data-input-action-select]").selectOption("fire");
    await page.locator("[data-input-add-mapping]").click();
    await expect(page.locator("[data-input-row-object]")).toHaveValue("global");
    await expect(page.locator("[data-input-row-action]")).toHaveValue("fire");
    await page.locator("[data-input-row-capture-keyboard]").click();
    await page.keyboard.press("KeyF");
    await expect(page.locator("[data-input-row-binding-value]")).toHaveText("Keyboard KeyF");
    await page.locator("[data-input-save-mapping]").click();
    await expect(page.locator("[data-input-mapping-list] tr")).toHaveCount(2);
    await expect(page.locator("[data-input-mapping-row]").filter({ hasText: "Fire" }).locator("[data-input-token]")).toHaveText("Keyboard KeyF");
    await expect(page.locator("[data-input-mapping-row]").filter({ hasText: "Move Left" }).locator("[data-input-token]")).toHaveText("Keyboard KeyA");

    records = await inputMappingRecords(page);
    expect(records).toHaveLength(2);
    expect(records.find((record) => record.action === "fire")).toMatchObject({
      binding: "KeyF",
      objectKey: "global",
      source: "keyboard",
    });

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Hero");
    await expect(page.locator("[data-input-mapping-row]").filter({ hasText: "Move Left" }).locator("[data-input-token]")).toHaveText("Keyboard KeyA");
    await expect(page.locator("[data-input-mapping-row]").filter({ hasText: "Fire" }).locator("[data-input-token]")).toHaveText("Keyboard KeyF");

    await page.locator("[data-input-mapping-row]").filter({ hasText: "Move Left" }).locator("[data-input-token]").click();
    await expect(page.locator("[data-input-editing-row]")).toHaveCount(0);
    await expect(page.locator("[data-input-mapping-row]").filter({ hasText: "Move Left" }).locator("[data-input-token]")).toHaveText("Keyboard KeyA");
    records = await inputMappingRecords(page);
    expect(records).toHaveLength(2);

    await page.locator("[data-input-mapping-row]").filter({ hasText: "Move Left" }).locator("[data-input-edit-mapping]").click();
    await expect(page.locator("[data-input-row-binding-value]")).toHaveText("Keyboard KeyA");
    await page.locator("[data-input-row-binding-value]").click();
    await expect(page.locator("[data-input-status-log]")).toHaveText("Press a keyboard key to capture input for this row.");
    await page.keyboard.press("KeyB");
    await expect(page.locator("[data-input-row-binding-value]")).toHaveText("Keyboard KeyB");
    await page.locator("[data-input-save-mapping]").click();
    await expect(page.locator("[data-input-mapping-row]").filter({ hasText: "Move Left" }).locator("[data-input-token]")).toHaveText("Keyboard KeyB");
    await expect(page.locator("[data-input-mapping-row]").filter({ hasText: "Fire" }).locator("[data-input-token]")).toHaveText("Keyboard KeyF");

    records = await inputMappingRecords(page);
    expect(records).toHaveLength(2);
    expect(records.find((record) => record.action === "moveLeft")).toMatchObject({ binding: "KeyB" });
    expect(records.find((record) => record.action === "fire")).toMatchObject({ binding: "KeyF" });

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-mapping-row]").filter({ hasText: "Move Left" }).locator("[data-input-token]")).toHaveText("Keyboard KeyB");
    await expect(page.locator("[data-input-mapping-row]").filter({ hasText: "Fire" }).locator("[data-input-token]")).toHaveText("Keyboard KeyF");

    await page.locator("[data-input-mapping-row]").filter({ hasText: "Move Left" }).locator("[data-input-trash-mapping]").click();
    await expect(page.locator("[data-input-mapping-list]")).not.toContainText("Move Left");
    await expect(page.locator("[data-input-mapping-row]").filter({ hasText: "Fire" }).locator("[data-input-token]")).toHaveText("Keyboard KeyF");
    await page.locator("[data-input-mapping-row]").filter({ hasText: "Fire" }).locator("[data-input-trash-mapping]").click();
    await expect(page.locator("[data-input-mapping-list]")).toContainText("No mappings added yet.");
    await expect(page.locator("[data-input-output-status]")).toHaveText("Not Configured");
    records = await inputMappingRecords(page);
    expect(records).toHaveLength(0);

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Input Mapping V2 compatibility route points creators to Controls", async ({ page }) => {
  const failures = await openControlsPage(page, "/toolbox/input-mapping-v2/index.html");

  try {
    await expect(page.getByRole("heading", { name: "Input Mapping V2" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open Controls" })).toHaveAttribute("href", "/toolbox/controls/index.html");
    await expect(page.locator("main")).toContainText("Controls is now the user-facing tool for input mappings, controller profiles, device detection, and mapping persistence.");
    await expect(page.locator("main")).toContainText("This deprecated route is kept only to guide older links to Controls.");
    await expect(page.locator("[data-input-mapping-table]")).toHaveCount(0);
    await expect(page.locator("[data-controller-profile-table]")).toHaveCount(0);
    await expect(page.getByText("Mapping JSON", { exact: true })).toHaveCount(0);
    await expect(page.locator("[data-input-mapping-json]")).toHaveCount(0);
    await expect(page.locator("summary").filter({ hasText: "Capture" })).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(/Static wireframe only|Not implemented yet|no database|no runtime behavior/i);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
