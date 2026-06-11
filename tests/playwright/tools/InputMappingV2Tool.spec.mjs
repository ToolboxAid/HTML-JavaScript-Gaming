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

const NORMALIZED_INPUTS = [
  "move.x",
  "move.y",
  "aim.x",
  "aim.y",
  "button.south",
  "button.east",
  "button.west",
  "button.north",
  "dpad.up",
  "dpad.down",
  "dpad.left",
  "dpad.right",
  "trigger.left",
  "trigger.right",
  "start",
  "select",
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

async function seedObjects(page) {
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
          id: "coin-move-left",
          normalizedInput: "move.x",
          objectKey: "coin",
          objectName: "Coin",
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

async function exposeGamepad(page) {
  await page.evaluate(() => {
    window.__arcadeAxes = [0, 0];
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

test("Controls splits Game Controls and Player Controller Profiles with normalized input ownership", async ({ page }) => {
  const failures = await openControlsPage(page, "/toolbox/controls/index.html?workspace=demo-project");

  try {
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator(".tool-center-panel > h2")).toHaveText("Game Controls");
    await expect(page.locator("[data-input-mapping-accordion] summary")).toHaveText("Game Controls");
    await expect(page.locator("[data-controller-profile-accordion] summary")).toHaveText("Player Controller Profiles");
    await expect(page.locator("[data-input-mapping-table] th")).toHaveText([
      "Normalized Input",
      "Game Action",
      "Object",
      "State",
      "Actions",
    ]);
    await expect(page.locator("[data-controller-profile-table] th")).toHaveText([
      "Physical Controller",
      "Physical Input",
      "Normalized Input",
      "Deadzone",
      "Invert",
      "Actions",
    ]);
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Missing Game Control Mapping");
    await expect(page.locator("[data-input-output-status]")).toHaveText("Missing Game Control Mapping");
    await expect(page.locator("[data-controller-profile-fallback-status]")).toHaveText("Missing Controller Profile. Create Player Controller Profile.");
    await expect(page.locator("[data-controller-profile-status]")).toContainText("Missing Controller Profile");
    await expect(page.locator("[data-controller-device-select] option")).toHaveText([
      "Choose a physical controller",
      "Keyboard",
      "Mouse",
    ]);
    await expect(page.locator("[data-input-action-catalog] th")).toHaveText(["Action Name", "Description"]);
    await expect(page.locator("[data-input-action-label]")).toHaveText(DEFAULT_ACTION_LABELS);
    await expect(page.locator("[data-input-action-description]")).toHaveText(DEFAULT_ACTION_DESCRIPTIONS);
    await expect(page.locator("[data-input-action-select] option")).toHaveText(DEFAULT_ACTION_LABELS);
    await expect(page.locator("summary").filter({ hasText: "Capture" })).toHaveCount(0);
    await expect(page.getByText("Mapping JSON", { exact: true })).toHaveCount(0);
    await expect(page.locator("[data-input-source-diagnostics]")).toContainText("Normalized Input Registry");
    await expect(page.locator("[data-input-return-workspace]")).toBeVisible();

    const registryEntry = await controlsRegistryEntry(page);
    expect(registryEntry.path).toBe("toolbox/controls/index.html");
    expect(registryEntry.status).toBe("wireframe");
    expect(registryEntry.releaseChannelLabel).toBe("Wireframe");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Game Controls save normalized input to game action mappings and validate object actions", async ({ page }) => {
  const failures = await openControlsPage(page);

  try {
    await seedObjects(page);
    await seedInvalidCollectibleMapping(page);
    await page.reload({ waitUntil: "networkidle" });

    await expect(page.locator("[data-input-mapping-row]")).toContainText("move.x");
    await expect(page.locator("[data-input-mapping-row]")).toContainText("Move Left");
    await expect(page.locator("[data-input-mapping-row]")).toContainText("Coin");
    await expect(page.locator("[data-input-mapping-row]")).toContainText("Needs update:");
    await expect(page.locator("[data-input-mapping-row]")).toContainText("Move Left is not available for Collectible");

    await page.locator("[data-input-trash-mapping]").click();
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Missing Game Control Mapping");
    await page.locator("[data-input-object-select]").selectOption("hero");
    await expect(page.locator("[data-input-action-select]")).toContainText("Move Left");
    await page.locator("[data-input-action-select]").selectOption("moveLeft");
    await page.locator("[data-input-add-mapping]").click();
    await expect(page.locator("[data-input-editing-row] td")).toHaveCount(5);
    await expect(page.locator("[data-input-row-normalized] option")).toHaveText(NORMALIZED_INPUTS);
    await expect(page.locator("[data-input-row-object]")).toHaveValue("hero");
    await expect(page.locator("[data-input-row-action]")).toHaveValue("moveLeft");
    await page.locator("[data-input-row-normalized]").selectOption("move.x");
    await page.locator("[data-input-save-mapping]").click();

    await expect(page.locator("[data-input-mapping-row]")).toContainText("move.x");
    await expect(page.locator("[data-input-mapping-row]")).toContainText("Move Left");
    await expect(page.locator("[data-input-mapping-row]")).toContainText("Hero");
    await expect(page.locator("[data-input-output-status]")).toHaveText("Complete");

    let records = await inputMappingRecords(page);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      action: "moveLeft",
      actionLabel: "Move Left",
      binding: "",
      inputDevice: "Normalized Input",
      normalizedInput: "move.x",
      objectKey: "hero",
      source: "normalized",
      state: "Active",
    });

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-mapping-row]")).toContainText("move.x");
    await page.locator("[data-input-edit-mapping]").click();
    await page.locator("[data-input-row-normalized]").selectOption("button.south");
    await page.locator("[data-input-row-action]").selectOption("fire");
    await page.locator("[data-input-save-mapping]").click();
    records = await inputMappingRecords(page);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      action: "fire",
      normalizedInput: "button.south",
      objectKey: "hero",
    });

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("This will delete all Mappings, are you sure?");
      await dialog.dismiss();
    });
    await page.locator("[data-input-reset-mappings]").click();
    expect(await inputMappingRecords(page)).toHaveLength(1);
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("This will delete all Mappings, are you sure?");
      await dialog.accept();
    });
    await page.locator("[data-input-reset-mappings]").click();
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Missing Game Control Mapping");
    expect(await inputMappingRecords(page)).toHaveLength(0);

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Player Controller Profiles persist physical-to-normalized mappings with analog settings", async ({ page }) => {
  const failures = await openControlsPage(page);

  try {
    await exposeGamepad(page);
    await page.locator("[data-input-refresh-devices]").click();
    await expect(page.locator("[data-controller-device-select] option")).toContainText([
      "Choose a physical controller",
      "Keyboard",
      "Mouse",
      "Gamepad: Arcade Test Pad",
    ]);

    await page.locator("[data-controller-device-select]").selectOption("keyboard");
    await page.locator("[data-controller-profile-add]").click();
    await expect(page.locator("[data-controller-profile-list]")).toContainText("Keyboard: Keyboard");
    let profiles = await controllerProfileRecords(page);
    expect(profiles).toHaveLength(1);
    expect(profiles[0].inputMappings.find((mapping) => mapping.physicalInput === "KeyW")).toMatchObject({
      normalizedInput: "move.y",
      physicalInput: "KeyW",
    });

    await page.locator("[data-controller-device-select]").selectOption("gamepad-0");
    await expect(page.locator("[data-controller-profile-fallback-status]")).toContainText("Using Default Gamepad Mapping");
    await expect(page.locator("[data-controller-profile-create-default]")).toBeVisible();
    await page.locator("[data-controller-profile-create-default]").click();
    await expect(page.locator("[data-controller-profile-editing-row]")).toContainText("Gamepad: Arcade Test Pad");
    await expect(page.locator("[data-controller-profile-input-pair]")).toHaveCount(18);
    await expect(page.locator("[data-controller-profile-input-pair]").first().locator("strong")).toHaveText("Button0");
    await expect(page.locator("[data-controller-profile-input-normalized]").first()).toHaveValue("button.south");
    await expect(page.locator("[data-controller-profile-input-pair]").filter({ hasText: "Axis0" }).locator("[data-controller-profile-deadzone]")).toBeVisible();
    await page.locator("[data-controller-profile-input-pair]").filter({ hasText: "Axis0" }).locator("[data-controller-profile-deadzone]").fill("0.35");
    await page.locator("[data-controller-profile-input-pair]").filter({ hasText: "Axis0" }).locator("[data-controller-profile-invert]").check();

    await page.evaluate(() => {
      window.__arcadeButtons[0] = { pressed: true, value: 1 };
      window.__arcadeAxes[0] = 0.7;
    });
    await page.locator("[data-input-refresh-devices]").click();
    await expect(page.locator("[data-input-source-diagnostics]")).toContainText("Active inputs: Button0, Axis0");
    const activeInputs = page.locator("[data-controller-profile-input-pair][data-controller-profile-input-active='true']");
    await expect(activeInputs).toHaveCount(2);
    await expect(activeInputs.filter({ hasText: "Button0" }).locator("[data-controller-profile-input-assigned-normalized]")).toHaveCSS("color", "rgb(255, 200, 87)");
    await expect(activeInputs.filter({ hasText: "Button0" }).locator("[data-controller-profile-input-assigned-normalized]")).toContainText("Selected Normalized Input: button.south");

    await page.locator("[data-controller-profile-save]").click();
    profiles = await controllerProfileRecords(page);
    expect(profiles).toHaveLength(2);
    const gamepadProfile = profiles.find((profile) => profile.controllerName === "Arcade Test Pad");
    expect(gamepadProfile.inputMappings).toHaveLength(18);
    expect(gamepadProfile.inputMappings.find((mapping) => mapping.physicalInput === "Axis0")).toMatchObject({
      deadzone: 0.35,
      invert: true,
      normalizedInput: "move.x",
    });

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-controller-profile-list]")).toContainText("Keyboard: Keyboard");
    await expect(page.locator("[data-controller-profile-list]")).toContainText("Gamepad: Arcade Test Pad");
    profiles = await controllerProfileRecords(page);
    expect(profiles).toHaveLength(2);

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Custom game Actions persist and do not appear in player controller normalized input dropdowns", async ({ page }) => {
  const failures = await openControlsPage(page);

  try {
    await seedObjects(page);
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("[data-input-custom-action-name]").fill("Dash Burst");
    await page.locator("[data-input-custom-action-add]").click();
    await expect(page.locator("[data-input-custom-action-status]")).toHaveText("Dash Burst saved.");
    await expect(page.locator("[data-input-action-catalog]")).toContainText("Dash Burst");
    await expect(page.locator("[data-input-action-select]")).toContainText("Dash Burst");
    expect(await customActionRecords(page)).toHaveLength(1);

    await page.locator("[data-controller-device-select]").selectOption("mouse");
    await page.locator("[data-controller-profile-add]").click();
    await page.locator("[data-controller-profile-edit]").click();
    await expect(page.locator("[data-controller-profile-input-normalized]").first()).not.toContainText("Dash Burst");
    await page.locator("[data-controller-profile-cancel]").click();

    await page.locator("[data-input-object-select]").selectOption("hero");
    await page.locator("[data-input-action-select]").selectOption("custom-dash-burst");
    await page.locator("[data-input-add-mapping]").click();
    await page.locator("[data-input-row-normalized]").selectOption("button.east");
    await page.locator("[data-input-save-mapping]").click();
    await expect(page.locator("[data-input-mapping-row]")).toContainText("Dash Burst");
    await expect(page.locator("[data-input-mapping-row]")).toContainText("button.east");
    let records = await inputMappingRecords(page);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      action: "custom-dash-burst",
      actionLabel: "Dash Burst",
      normalizedInput: "button.east",
      objectKey: "hero",
    });

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-action-catalog]")).toContainText("Dash Burst");
    await expect(page.locator("[data-input-mapping-row]")).toContainText("Dash Burst");
    records = await inputMappingRecords(page);
    expect(records).toHaveLength(1);

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
    await expect(page.locator("summary").filter({ hasText: "Capture" })).toHaveCount(0);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
