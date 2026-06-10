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

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "input-mapping-v2",
    surface: "Controls input mapping rebuild",
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

async function openInputMappingPage(page, path = "/toolbox/input-mapping-v2/index.html") {
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

async function inputMappingRecords(page) {
  return page.evaluate(async () => {
    const response = await fetch("/api/mock-db/snapshot");
    const payload = await response.json();
    return payload.data.tables.input_mapping_records || [];
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
  const failures = await openInputMappingPage(page, "/toolbox/input-mapping-v2/index.html?workspace=demo-project");

  try {
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("summary").filter({ hasText: "Actions" })).toBeVisible();
    await expect(page.locator("summary").filter({ hasText: "Capture" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mappings" })).toBeVisible();
    await expect(page.getByText("Mapping JSON", { exact: true })).toBeVisible();
    await expect(page.getByText("Devices", { exact: true })).toBeVisible();
    await expect(page.getByText("Status", { exact: true })).toBeVisible();
    await expect(page.locator("[data-input-return-workspace]")).toBeVisible();
    await expect(page.locator("[data-input-mapping-table] th")).toHaveText([
      "Object",
      "Action",
      "Input Device",
      "Input",
      "State",
      "Actions",
    ]);
    await expect(page.locator("[data-input-add-mapping]")).toHaveCount(1);
    await expect(page.locator("[data-input-mapping-table] tfoot [data-input-add-mapping]")).toBeVisible();
    await expect(page.locator("[data-input-mapping-table] tfoot [data-input-reset-mappings]")).toBeVisible();
    await expect(page.locator("[data-input-action-select] option")).toHaveText(DEFAULT_ACTION_LABELS);
    await expect(page.locator("[data-input-default-actions] li")).toHaveText(DEFAULT_ACTION_LABELS);
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

    await page.getByRole("button", { name: "Refresh Devices" }).click();
    await expect(page.locator("[data-input-status-log]")).toHaveText("Device diagnostics refreshed.");
    await page.getByRole("button", { name: "Capture Gamepad" }).click();
    await expect(page.locator("[data-input-capture-status]")).toContainText("WARN: Gamepad capture unavailable.");
    await expect(page.locator("[data-input-capture-status]")).toContainText("connect a gamepad");
    await expect(page.locator("[data-input-capture-status]")).toContainText("press a button or move an axis");

    const registryEntry = await controlsRegistryEntry(page);
    expect(registryEntry.path).toBe("toolbox/input-mapping-v2/index.html");
    expect(registryEntry.status).toBe("beta");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Controls Input Mapping supports table-first inline add, cancel, save, and edit", async ({ page }) => {
  const failures = await openInputMappingPage(page);

  try {
    const addButton = page.locator("[data-input-mapping-table] tfoot [data-input-add-mapping]");
    await expect(addButton).toBeEnabled();

    await addButton.click();
    await expect(addButton).toBeDisabled();
    await expect(page.locator("[data-input-editing-row]")).toHaveCount(1);
    await expect(page.locator("[data-input-editing-row] td")).toHaveCount(6);
    await expect(page.locator("[data-input-editing-row] td").last().locator("button")).toHaveText(["Save", "Cancel"]);
    await expect(page.locator("[data-input-editing-row] td").last().locator("button").last()).toHaveText("Cancel");

    await page.locator("[data-input-editing-row] [data-input-cancel-mapping]").click();
    await expect(page.locator("[data-input-editing-row]")).toHaveCount(0);
    await expect(addButton).toBeEnabled();
    await expect(page.locator("[data-input-mapping-list]")).toContainText("No mappings added yet.");

    await addButton.click();
    await page.locator("[data-input-row-action]").selectOption("fire");
    await page.locator("[data-input-row-device]").selectOption("keyboard");
    await page.locator("[data-input-row-binding]").fill("KeyF");
    await page.locator("[data-input-save-mapping]").click();
    await expect(addButton).toBeEnabled();
    await expect(page.locator("[data-input-editing-row]")).toHaveCount(0);
    await expect(page.locator("[data-input-mapping-list] tr")).toHaveCount(1);
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Fire");
    await expect(page.locator("[data-input-delete-token]")).toHaveText("Keyboard KeyF");
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
    await page.locator("[data-input-row-binding]").fill("KeyG");
    await page.locator("[data-input-save-mapping]").click();
    await expect(addButton).toBeEnabled();
    await expect(page.locator("[data-input-delete-token]")).toHaveText("Keyboard KeyG");
    records = await inputMappingRecords(page);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      action: "fire",
      binding: "KeyG",
      source: "keyboard",
      state: "Active",
    });

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-delete-token]")).toHaveText("Keyboard KeyG");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Controls Input Mapping captures KeyA, deletes token, and persists through shared DB", async ({ page }) => {
  const failures = await openInputMappingPage(page);

  try {
    await seedHeroObject(page);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-object-select] option")).toContainText(["Global", "Hero"]);
    await page.locator("[data-input-object-select]").selectOption("hero");
    await page.locator("[data-input-action-select]").selectOption("moveLeft");
    await expect(page.locator("[data-input-capture-selection]")).toHaveText("Selected action: Move Left");

    await page.getByRole("button", { name: "Capture Keyboard" }).click();
    await expect(page.locator("[data-input-capture-status]")).toHaveText("Press a keyboard key to map the selected action.");
    await page.keyboard.press("KeyA");
    await expect(page.locator("[data-input-mapping-list] tr")).toHaveCount(1);
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Hero");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Move Left");
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Keyboard");
    await expect(page.locator("[data-input-delete-token]")).toHaveText("Keyboard KeyA");
    await expect(page.locator("[data-input-mapping-json]")).toContainText('"action": "moveLeft"');
    await expect(page.locator("[data-input-mapping-json]")).toContainText('"label": "Keyboard KeyA"');
    await expect(page.locator("[data-input-output-status]")).toHaveText("Complete");

    let records = await inputMappingRecords(page);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      action: "moveLeft",
      binding: "KeyA",
      objectKey: "hero",
      source: "keyboard",
    });

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-input-mapping-list]")).toContainText("Hero");
    await expect(page.locator("[data-input-delete-token]")).toHaveText("Keyboard KeyA");

    await page.locator("[data-input-delete-token]").click();
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

test("Controls compatibility route uses rebuilt Input Mapping surface", async ({ page }) => {
  const failures = await openInputMappingPage(page, "/toolbox/controls/index.html");

  try {
    await expect(page.getByRole("heading", { name: "Input Mapping" })).toBeVisible();
    await expect(page.locator("[data-input-mapping-table]")).toBeVisible();
    await expect(page.locator("main")).not.toContainText(/Static wireframe only|Not implemented yet|no database|no runtime behavior/i);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
