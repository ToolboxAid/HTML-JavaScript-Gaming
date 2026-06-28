import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";
import { SEED_DB_KEYS } from "../../../../api/seed/seed-db-keys.mjs";

const TYPE_OPTIONS = ["Collectible", "Custom", "Decoration", "Enemy", "Goal", "Hazard", "Hero", "Platform", "Projectile", "Spawn Point", "Wall"];
const OLD_SAMPLE_PATH_PATTERN = new RegExp(["M" + "VP", "Padd" + "le", "Ba" + "ll"].join("|"), "i");
const OLD_INTERNAL_COPY_PATTERN = new RegExp([
  ["page", " session only"].join(""),
  ["hand", "off"].join(""),
  ["Setup ", "readiness"].join(""),
  ["Session ", "\\+ Assets"].join(""),
  ["Readiness ", "Checks"].join(""),
  ["Runtime ", "Scope"].join(""),
  ["authoring ", "hand", "off"].join(""),
  ["Game Configuration is ", "not ready"].join(""),
  ["Object ", "setup ", "table"].join(""),
  ["Object ", "setup ", "rows"].join(""),
  ["Not ", "connected ", "yet"].join(""),
  "connected",
  "publishes",
  "coverage",
  ["technical ", "object ", "family"].join(""),
  ["in", "ternal"].join(""),
  ["runtime ", "type"].join(""),
].join("|"), "i");
const LOW_VALUE_STATUS_CHECK_PATTERN = new RegExp([
  ["Ready ", "Objects"].join(""),
  ["Render ", "Assets"].join(""),
  ["Missing ", "Hitboxes"].join(""),
  ["Missing ", "Events"].join(""),
  ["Needs ", "Objects"].join(""),
  ["Needs ", "Review"].join(""),
  ["No ", "sprite ", "render ", "selected"].join(""),
].join("|"), "i");

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "objects",
    surface: "Objects Tool table input",
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

async function postApiPayload(baseUrl, path, body = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const payload = await response.json();
  return { payload, response };
}

async function signInCreator(baseUrl) {
  const { response } = await postApiPayload(baseUrl, "/api/session/user", {
    userKey: SEED_DB_KEYS.users.user1,
  });
  expect(response.ok).toBe(true);
}

async function clearObjectsForActiveGame(baseUrl) {
  const repository = await postApiPayload(baseUrl, "/api/toolbox/objects/repositories", { options: {} });
  expect(repository.response.ok).toBe(true);
  const repositoryId = repository.payload.data.repositoryId;
  const cleared = await postApiPayload(baseUrl, `/api/toolbox/objects/repositories/${repositoryId}/methods/replaceObjects`, {
    args: [[]],
  });
  expect(cleared.response.ok).toBe(true);
}

async function createReviewMessage(baseUrl) {
  const suffix = Date.now().toString(36);
  const profile = await postApiPayload(baseUrl, "/api/messages/tts-profiles", {
    emotionSettings: [{
      emotion: "calm",
      emotionLabel: "Calm",
      pitch: 1,
      rate: 1,
      volume: 1,
    }],
    language: "en-US",
    name: `Objects Review Voice ${suffix}`,
    pitch: 1,
    providerKey: "browser-speech",
    rate: 1,
    voiceName: "Default browser voice",
    volume: 1,
  });
  expect(profile.response.ok).toBe(true);
  const message = await postApiPayload(baseUrl, "/api/messages/messages", {
    active: true,
    emotionProfileKey: profile.payload.data.ttsProfile.emotionSettings[0].key,
    messageText: "Review hero is ready.",
    name: `Objects Review Message ${suffix}`,
    voiceProfileKey: profile.payload.data.ttsProfile.key,
  });
  expect(message.response.ok).toBe(true);
  return message.payload.data.message;
}

async function openObjectsPage(page, { signedIn = true } = {}) {
  const server = await startRepoServer();
  const failures = collectPageFailures(page);
  await signInCreator(server.baseUrl);
  await clearObjectsForActiveGame(server.baseUrl);
  if (!signedIn) {
    const { response } = await postApiPayload(server.baseUrl, "/api/session/logout", {});
    expect(response.ok).toBe(true);
  }
  await page.addInitScript(({ apiUrl, siteUrl }) => {
    window.GameFoundryPublicConfig = {
      apiUrl,
      environmentLabel: "Development Environment",
      siteUrl,
    };
  }, { apiUrl: `${server.baseUrl}/api`, siteUrl: server.baseUrl });
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/toolbox/objects/index.html`, { waitUntil: "networkidle" });
  return { ...failures, server };
}

async function openToolboxPage(page) {
  const server = await startRepoServer();
  const failures = collectPageFailures(page);
  await page.addInitScript(({ apiUrl, siteUrl }) => {
    window.GameFoundryPublicConfig = {
      apiUrl,
      environmentLabel: "Development Environment",
      siteUrl,
    };
  }, { apiUrl: `${server.baseUrl}/api`, siteUrl: server.baseUrl });
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
  return { ...failures, server };
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function fillActiveRow(page, { name, renderType = "None", type, state = "Active" }) {
  await page.locator("[data-objects-row-name]").fill(name);
  await page.locator("[data-objects-row-type]").selectOption(type);
  await page.locator("[data-objects-row-state]").selectOption(state);
  await page.locator("[data-objects-row-render-type]").selectOption(renderType);
}

async function objectDefinitionRecords(page) {
  return page.evaluate(async () => {
    const response = await fetch("/api/local-db/snapshot");
    const payload = await response.json();
    return payload.data.tables.object_definition_records || [];
  });
}

async function objectsRegistryEntry(page) {
  return page.evaluate(async () => {
    const response = await fetch("/api/toolbox/registry/snapshot");
    const payload = await response.json();
    return payload.data.tools.find((tool) => tool.id === "objects") || null;
  });
}

test("Objects exposes production copy, setup status, and broad table input", async ({ page }) => {
  const failures = await openObjectsPage(page);

  try {
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(OLD_SAMPLE_PATH_PATTERN);
    await expect(page.locator("main")).not.toContainText(OLD_INTERNAL_COPY_PATTERN);
    await expect(page.locator("main")).not.toContainText(/\bRole\b/i);
    await expect(page.locator("main")).not.toContainText(/\bTraits\b/i);
    await expect(page.locator("main")).toContainText("Type");
    await expect(page.locator("main")).toContainText("Capabilities");
    await expect(page.locator("main")).not.toContainText(["Not", "connected", "yet"].join(" "));
    await expect(page.getByRole("heading", { level: 2, name: "Object Builder" })).toBeVisible();
    await expect(page.getByText("Object Type Catalog", { exact: true })).toBeVisible();
    await expect(page.locator("[data-objects-template-select]")).toHaveCount(1);
    await expect(page.locator("[data-objects-list-table] tfoot [data-objects-template-select] option")).toHaveText(["Select template", ...TYPE_OPTIONS]);
    await expect(page.locator("[data-objects-table-footer-actions] [data-objects-add-row]")).toBeVisible();
    await expect(page.locator("[data-objects-table-footer-actions] [data-objects-reset-table]")).toBeVisible();
    await expect(page.locator("[data-objects-table-footer-catalog] [data-objects-template-select]")).toBeVisible();
    const footerPositions = await page.locator("[data-objects-table-footer]").evaluate((footer) => {
      const actions = footer.querySelector("[data-objects-table-footer-actions]");
      const catalog = footer.querySelector("[data-objects-table-footer-catalog]");
      return {
        actionsLeft: actions.getBoundingClientRect().left,
        catalogLeft: catalog.getBoundingClientRect().left,
      };
    });
    expect(footerPositions.catalogLeft).toBeGreaterThan(footerPositions.actionsLeft);
    await expect(page.locator("[aria-label='Object type catalog'] th")).toHaveText(["Template", "Capability"]);
    await expect(page.locator("[aria-label='Object type catalog'] thead")).not.toContainText("State");
    await expect(page.locator("[aria-label='Object type catalog'] thead")).not.toContainText("Render");
    await expect(page.locator("[data-objects-template-catalog] tr").first().locator("td")).toHaveCount(2);
    await expect(page.locator("[data-objects-template-catalog] tr")).toHaveCount(TYPE_OPTIONS.length);
    await expect(page.locator("[data-objects-template-catalog] td:first-child")).toHaveText(TYPE_OPTIONS);
    await expect(page.locator("[data-objects-template-catalog]")).toContainText("Spawn Point");
    await expect(page.locator("[data-objects-template-catalog]")).toContainText("Decoration");
    await expect(page.locator("[data-objects-template-catalog]")).not.toContainText("Events");
    await expect(page.locator("[data-objects-template-catalog]")).not.toContainText("Sprite");
    await expect(page.locator("[data-objects-template-catalog]")).toContainText("Can Move");
    await expect(page.locator("[data-objects-template-catalog]")).toContainText("Scores Points");
    const constants = await page.evaluate(async () => {
      const response = await fetch("/api/toolbox/objects/constants");
      const payload = await response.json();
      return payload.data;
    });
    expect(constants.OBJECTS_TOOL_TABLES).toEqual(["object_definition_records"]);
    expect(constants.OBJECT_TYPE_TEMPLATES.map((template) => template.type)).toEqual(TYPE_OPTIONS);
    expect(constants.STARTER_OBJECTS.map((object) => object.name)).toEqual(["Hero", "Projectile", "Wall"]);
    expect(constants.CAPABILITY_LABELS.movable).toBe("Can Move");
    const objectsSource = await page.evaluate(async () => fetch("/assets/toolbox/objects/js/index.js").then((response) => response.text()));
    expect(objectsSource).toContain('readServerToolConstants("objects")');
    expect(objectsSource).toContain('requireServerConstant(constants, "CAPABILITY_LABELS", "objects")');
    expect(objectsSource).toContain('requireServerConstant(constants, "OBJECT_TYPE_TEMPLATES", "objects")');
    expect(objectsSource).toContain('requireServerConstant(constants, "STARTER_OBJECTS", "objects")');
    await expect(page.getByRole("heading", { level: 3, name: "Object Status" })).toHaveCount(0);
    await expect(page.locator("[aria-label='Object status summary']")).toHaveCount(0);
    await expect(page.locator("[data-objects-status-summary]")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(LOW_VALUE_STATUS_CHECK_PATTERN);
    await expect(page.locator("[data-objects-list-table] th")).toHaveText([
      "Name",
      "Type",
      "State",
      "Render",
      "Capabilities",
      "Render Asset",
      "Actions",
    ]);
    await expect(page.locator("[data-objects-list-table] thead")).not.toContainText("Status");
    await expect(page.getByText("Object Types", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Type Choices", { exact: true })).toHaveCount(0);
    await expect(page.locator("[data-objects-type-basics]")).toHaveCount(0);
    await expect(page.locator("[data-objects-readiness]")).toHaveText("Not Configured");
    await expect(page.locator("[data-objects-output-readiness]")).toHaveText("Not Configured");
    await expect(page.locator("[data-objects-asset-status]")).toHaveText("Not Configured");
    await expect(page.locator("[data-objects-output-setup]")).toHaveText("Add objects to begin setup.");
    await expect(page.locator("[data-objects-validation-overlay]")).toBeHidden();
    await expect(page.locator("[data-objects-validation-list]")).toHaveText("PASS: Object details are valid.");
    await expect(page.locator("[data-objects-capability-basics]")).toContainText("Can Move");
    await expect(page.locator("[data-objects-capability-basics]")).toContainText("Player Controlled");
    await expect(page.locator("[data-objects-capability-basics]")).toContainText("Can Collide");
    await expect(page.locator("[data-objects-capability-basics]")).toContainText("Scores Points");
    await expect(page.locator("[data-objects-capability-basics]")).toContainText("Causes Damage");
    await expect(page.locator("[data-objects-capability-basics]")).toContainText("Takes Damage");
    await expect(page.locator("[data-objects-capability-basics]")).not.toContainText("bounces");

    await expect(page.locator("[data-objects-list-table] tfoot [data-objects-add-row]")).toBeVisible();
    await expect(page.locator("[data-objects-list-table] tfoot [data-objects-reset-table]")).toBeVisible();

    await page.getByRole("button", { name: "Seed Starter Objects" }).click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Seeded starter objects: Hero, Projectile, and Wall.");
    await expect(page.locator("[data-objects-readiness]")).toHaveText("Pending Setup");
    await expect(page.locator("[data-objects-output-readiness]")).toHaveText("Pending Setup");
    await expect(page.locator("[data-objects-count]")).toHaveText("3");
    await expect(page.locator("[data-objects-output-count]")).toHaveText("3");
    await expect(page.locator("[data-objects-validation-overlay]")).toBeHidden();
    await expect(page.locator("[data-objects-list] tr")).toHaveCount(3);
    await expect(page.locator("[data-objects-list]")).toContainText("Hero");
    await expect(page.locator("[data-objects-list]")).toContainText("Projectile");
    await expect(page.locator("[data-objects-list]")).toContainText("Wall");
    await expect(page.locator("[data-objects-row-status]")).toHaveCount(0);
    await expect(page.locator("[data-objects-row-status-badge]")).toHaveCount(0);
    await expect(page.locator("[data-objects-row-open-hitboxes]")).toHaveCount(3);
    await expect(page.locator("[data-objects-row-open-events]")).toHaveCount(3);
    await expect(page.locator("[data-objects-row-edit-sprite]")).toHaveCount(0);
    await expect(page.locator("[data-objects-list] [data-objects-edit-row]")).toHaveCount(3);
    await expect(page.locator("[data-objects-list] [data-objects-trash-row]")).toHaveCount(3);
    const firstActionCell = page.locator("[data-objects-list] tr").first().locator("td").last();
    const firstActionGroup = firstActionCell.locator(".action-group");
    await expect(firstActionGroup).toHaveClass(/action-group/);
    await expect(firstActionGroup).toHaveClass(/action-group--tight/);
    await expect(firstActionGroup.locator("button, a")).toHaveText([
      "Edit",
      "Details",
      "Open Hitboxes",
      "Open Events",
      "Trash",
    ]);
    await expect(firstActionCell.locator("[data-objects-edit-row='hero']")).toBeVisible();
    await expect(firstActionCell.locator("[data-objects-details-row='hero']")).toBeVisible();
    await expect(firstActionCell.locator("[data-objects-row-open-hitboxes]")).toBeVisible();
    await expect(firstActionCell.locator("[data-objects-row-open-events]")).toBeVisible();
    await expect(firstActionCell.locator("[data-objects-trash-row='hero']")).toBeVisible();
    await expect(page.locator("[data-objects-row-open-hitboxes]").first()).toHaveClass(/primary/);
    await expect(page.locator("[data-objects-row-open-events]").first()).toHaveClass(/primary/);
    await expect(page.locator("[data-objects-row-open-hitboxes]").first()).toHaveAttribute("title", "Missing Hitbox.");
    await expect(page.locator("[data-objects-row-open-events]").first()).toHaveAttribute(
      "title",
      "Missing Events. Events configure when object behavior happens."
    );
    await expect(page.locator("[data-objects-output-render-asset]")).toHaveText("None");
    await expect(page.locator("[data-objects-edit-sprite]")).toBeHidden();
    await expect(page.locator("[data-objects-output-setup]")).toHaveText("Objects have saved setup details.");

    await page.getByRole("button", { name: "Validate Setup" }).click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Validation PASS: Object details are ready for review.");
    await expect(page.locator("[data-objects-validation-list]")).toHaveText("PASS: Object details are valid.");
    await expect(page.locator("main")).not.toContainText(OLD_INTERNAL_COPY_PATTERN);

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Objects table add disables while active row can cancel, save, edit, and trash", async ({ page }) => {
  const failures = await openObjectsPage(page);

  try {
    const addButton = page.getByRole("button", { name: "Add Object" });
    await expect(addButton).toBeEnabled();
    await addButton.click();
    await expect(addButton).toBeDisabled();
    await expect(page.locator("[data-objects-row-name]")).toBeVisible();
    await expect(page.locator("[data-objects-cancel-row]")).toBeVisible();
    await expect(page.locator("[data-objects-row-type] option")).toHaveText(["Select type", ...TYPE_OPTIONS]);
    const activeActionCell = page.locator("[data-objects-editing-row]").locator("td").last();
    const activeActionGroup = activeActionCell.locator(".action-group");
    await expect(activeActionGroup).toHaveClass(/action-group/);
    await expect(activeActionGroup).toHaveClass(/action-group--tight/);
    await expect(activeActionGroup.locator("button")).toHaveText(["Save", "Cancel"]);
    await expect(page.locator("[data-objects-row-status]")).toHaveCount(0);

    await page.locator("[data-objects-cancel-row]").click();
    await expect(addButton).toBeEnabled();
    await expect(page.locator("[data-objects-list]")).toContainText("No objects drafted yet.");

    await addButton.click();
    await fillActiveRow(page, { name: "Hero", type: "Hero" });
    await page.locator("[data-objects-save-row]").click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Added Hero.");
    await expect(addButton).toBeEnabled();
    await expect(page.locator("[data-objects-list]")).toContainText("Hero");
    await expect(page.locator("[data-objects-list]")).toContainText("Player Controlled");
    await expect(page.locator("[data-objects-list]")).toContainText("None");
    await expect(page.locator("[data-objects-validation-list]")).not.toContainText("Render Asset");
    await expect(page.locator("[data-objects-edit-row='hero']")).toBeVisible();
    await expect(page.locator("[data-objects-details-row='hero']")).toBeVisible();
    await expect(page.locator("[data-objects-trash-row='hero']")).toBeVisible();
    const savedActionCell = page.locator("[data-objects-list] tr").first().locator("td").last();
    const savedActionGroup = savedActionCell.locator(".action-group");
    await expect(savedActionGroup).toHaveClass(/action-group/);
    await expect(savedActionGroup).toHaveClass(/action-group--tight/);
    await expect(savedActionGroup.locator("button, a")).toHaveText([
      "Edit",
      "Details",
      "Open Hitboxes",
      "Open Events",
      "Trash",
    ]);

    await page.locator("[data-objects-edit-row='hero']").click();
    await expect(addButton).toBeDisabled();
    await page.locator("[data-objects-row-name]").fill("Hero Prime");
    await page.locator("[data-objects-row-type]").selectOption("Enemy");
    await page.locator("[data-objects-save-row]").click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Saved Hero Prime.");
    await expect(page.locator("[data-objects-list]")).toContainText("Hero Prime");
    await expect(page.locator("[data-objects-edit-row='hero']")).toHaveCount(0);
    await expect(page.locator("[data-objects-edit-row='hero-prime']")).toBeVisible();

    await page.locator("[data-objects-trash-row='hero-prime']").click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Trashed object row.");
    await expect(page.locator("[data-objects-list]")).toContainText("No objects drafted yet.");
    await expect(addButton).toBeEnabled();

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Guest save redirects to sign-in", async ({ page }) => {
  const failures = await openObjectsPage(page, { signedIn: false });

  try {
    await page.getByRole("button", { name: "Add Object" }).click();
    await fillActiveRow(page, {
      name: "Guest Object",
      type: "Hero",
    });
    await page.locator("[data-objects-save-row]").click();
    await page.waitForURL(/\/account\/sign-in\.html$/);
    expect(failures.failedRequests.filter((request) => /^\d/.test(request) && !request.includes("/account/sign-in.html"))).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Objects persists added, edited, deleted, and sprite-linked rows through shared DB", async ({ page }) => {
  const failures = await openObjectsPage(page);

  try {
    const addButton = page.getByRole("button", { name: "Add Object" });
    await addButton.click();
    await fillActiveRow(page, {
      name: "Persistent Hero",
      type: "Hero",
    });
    await page.locator("[data-objects-save-row]").click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Added Persistent Hero.");

    let rows = await objectDefinitionRecords(page);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual(expect.objectContaining({
      name: "Persistent Hero",
      renderType: "None",
      type: "Hero",
    }));

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-objects-list] tr").first().locator("td").nth(0)).toHaveText("Persistent Hero");
    await expect(page.locator("[data-objects-list] tr").first().locator("td").nth(1)).toHaveText("Hero");
    await expect(page.locator("[data-objects-list] tr").first().locator("td").nth(2)).toHaveText("Active");

    await page.locator("[data-objects-edit-row='persistent-hero']").click();
    await page.locator("[data-objects-row-name]").fill("Persistent Hero Prime");
    await page.locator("[data-objects-row-state]").selectOption("Disabled");
    await page.locator("[data-objects-save-row]").click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Saved Persistent Hero Prime.");

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-objects-list] tr").first().locator("td").nth(0)).toHaveText("Persistent Hero Prime");
    await expect(page.locator("[data-objects-list] tr").first().locator("td").nth(2)).toHaveText("Disabled");
    rows = await objectDefinitionRecords(page);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual(expect.objectContaining({
      name: "Persistent Hero Prime",
      state: "Disabled",
    }));

    await page.locator("[data-objects-trash-row='persistent-hero-prime']").click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Trashed object row.");
    rows = await objectDefinitionRecords(page);
    expect(rows).toHaveLength(0);

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-objects-list]")).toContainText("No objects drafted yet.");

    await page.getByRole("button", { name: "Add Object" }).click();
    await fillActiveRow(page, {
      name: "Persistent Bolt",
      renderType: "Sprite",
      type: "Projectile",
    });
    await page.locator("[data-objects-save-row]").click();
    await expect(page.locator("[data-objects-log]")).toContainText("Created editable default sprite asset sprite_persistent_bolt for Persistent Bolt.");
    rows = await objectDefinitionRecords(page);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual(expect.objectContaining({
      name: "Persistent Bolt",
      renderAssetKey: "sprite_persistent_bolt",
      renderType: "Sprite",
      type: "Projectile",
    }));

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-objects-list]")).toContainText("Persistent Bolt");
    await expect(page.locator("[data-objects-list]")).toContainText("sprite_persistent_bolt");
    await expect(page.locator("[data-objects-row-edit-sprite]")).toHaveAttribute(
      "href",
      "/toolbox/sprites/index.html?assetKey=sprite_persistent_bolt&objectKey=persistent-bolt&sourceTool=objects"
    );
    await expect(page.locator("[data-objects-edit-sprite]")).toHaveAttribute(
      "href",
      "/toolbox/sprites/index.html?assetKey=sprite_persistent_bolt&objectKey=persistent-bolt&sourceTool=objects"
    );
    await expect(page.locator("main")).not.toContainText(OLD_INTERNAL_COPY_PATTERN);

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Object Details panel saves reviewable properties through shared DB", async ({ page }) => {
  const failures = await openObjectsPage(page);

  try {
    const message = await createReviewMessage(failures.server.baseUrl);

    await page.getByRole("button", { name: "Add Object" }).click();
    await fillActiveRow(page, {
      name: "Review Hero",
      renderType: "Sprite",
      type: "Hero",
    });
    await page.locator("[data-objects-save-row]").click();
    await expect(page.locator("[data-objects-log]")).toContainText("Added Review Hero.");
    await expect(page.locator("[data-objects-log]")).toContainText("Created editable default sprite asset sprite_review_hero for Review Hero.");

    await page.locator("[data-objects-details-row='review-hero']").click();
    await expect(page.locator("[data-objects-detail-selected]")).toHaveText("Review Hero");
    await expect(page.locator("[data-objects-detail-name]")).toHaveValue("Review Hero");
    await expect(page.locator("[data-objects-detail-type] option")).toHaveText(["Select type", ...TYPE_OPTIONS]);
    await expect(page.locator("[data-objects-detail-type]")).toHaveValue("Hero");
    await expect(page.locator("[data-objects-detail-active]")).toBeChecked();
    await expect(page.locator("[data-objects-detail-visible]")).toBeChecked();
    await expect(page.locator("[data-objects-detail-sprite]")).toHaveValue("sprite_review_hero");
    await expect(page.locator("[data-objects-detail-unsaved]")).toHaveText("Unsaved changes: none");
    await expect(page.locator("[data-objects-detail-save]")).toBeDisabled();
    await expect(page.locator("[data-objects-asset-links]")).toContainText("Sprite:");
    await expect(page.locator("[data-objects-asset-links]")).toContainText("sprite_review_hero");
    await expect(page.locator("[data-objects-asset-links]")).toContainText("Audio: No reference set.");
    await expect(page.locator("[data-objects-asset-links]")).toContainText("Message: No reference set.");
    await expect(page.locator("[data-objects-details-form]")).not.toContainText(/\bBehavior\b|\bRules\b|\bWorlds\b/);

    await page.locator("[data-objects-detail-description]").fill("Hero object used by Product Owner review.");
    await expect(page.locator("[data-objects-detail-unsaved]")).toHaveText("Unsaved changes: yes");
    await expect(page.locator("[data-objects-detail-save]")).toBeEnabled();
    await page.locator("[data-objects-detail-cancel]").click();
    await expect(page.locator("[data-objects-detail-description]")).toHaveValue("");
    await expect(page.locator("[data-objects-detail-unsaved]")).toHaveText("Unsaved changes: none");
    await expect(page.locator("[data-objects-log]")).toHaveText("Canceled Object Details changes.");

    await page.locator("[data-objects-detail-name]").fill("");
    await page.locator("[data-objects-detail-save]").click();
    await expect(page.locator("[data-objects-validation-list]")).toContainText("Name: Enter a name before saving Object Details.");
    await expect(page.locator("[data-objects-log]")).toHaveText("Object Details blocked: 1 validation action.");

    await page.locator("[data-objects-detail-name]").fill("Review Hero Prime");
    await page.locator("[data-objects-detail-description]").fill("Hero object used by Product Owner review.");
    await page.locator("[data-objects-detail-type]").selectOption("Enemy");
    await page.locator("[data-objects-detail-tags]").fill("hero, review, boss-fight");
    await page.locator("[data-objects-detail-active]").uncheck();
    await page.locator("[data-objects-detail-visible]").uncheck();
    await page.locator("[data-objects-detail-sprite]").fill("sprite_review_hero");
    await page.locator("[data-objects-detail-audio]").fill("missing-review-hero.wav");
    await page.locator("[data-objects-detail-message]").fill("missing-message-key");
    await page.locator("[data-objects-detail-defaults]").fill("speed=8\nhealth=3");
    await page.locator("[data-objects-detail-save]").click();
    await expect(page.locator("[data-objects-validation-list]")).toContainText("Audio reference: Use an existing audio asset reference");
    await expect(page.locator("[data-objects-validation-list]")).toContainText("Message reference: Use an existing message reference");
    await expect(page.locator("[data-objects-log]")).toHaveText("Object Details blocked: 2 validation actions.");

    await page.locator("[data-objects-detail-audio]").fill("");
    await page.locator("[data-objects-detail-message]").fill(message.key);
    await page.locator("[data-objects-detail-save]").click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Saved Object Details for Review Hero Prime.");
    await expect(page.locator("[data-objects-list]")).toContainText("Review Hero Prime");
    await expect(page.locator("[data-objects-list] tr").first().locator("td").nth(1)).toHaveText("Enemy");
    await expect(page.locator("[data-objects-list] tr").first().locator("td").nth(2)).toHaveText("Disabled");
    await expect(page.locator("[data-objects-detail-unsaved]")).toHaveText("Unsaved changes: none");
    await expect(page.locator("[data-objects-asset-links]")).toContainText("Audio: No reference set.");
    await expect(page.locator("[data-objects-asset-links]")).toContainText(message.name);
    await expect(page.locator("[data-objects-asset-link-sprite]")).toHaveAttribute(
      "href",
      "/toolbox/sprites/index.html?assetKey=sprite_review_hero&objectKey=review-hero-prime&sourceTool=objects"
    );
    await expect(page.locator("[data-objects-asset-link-audio]")).toHaveCount(0);
    await expect(page.locator("[data-objects-message-link]")).toHaveAttribute("href", "/toolbox/messages/index.html");
    await expect(page.locator("[data-objects-reference-warning]")).toHaveCount(0);

    const rows = await objectDefinitionRecords(page);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual(expect.objectContaining({
      name: "Review Hero Prime",
      renderAssetKey: "sprite_review_hero",
      renderType: "Sprite",
      state: "Disabled",
      type: "Enemy",
    }));
    expect(rows[0].interaction.details).toEqual({
      active: false,
      audioReference: "",
      defaultValues: "speed=8\nhealth=3",
      description: "Hero object used by Product Owner review.",
      messageReference: message.key,
      spriteReference: "sprite_review_hero",
      tags: ["hero", "review", "boss-fight"],
      visible: false,
    });

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-objects-list]")).toContainText("Review Hero Prime");
    await expect(page.locator("[data-objects-detail-selected]")).toHaveText("Review Hero Prime");
    await expect(page.locator("[data-objects-detail-description]")).toHaveValue("Hero object used by Product Owner review.");
    await expect(page.locator("[data-objects-detail-type]")).toHaveValue("Enemy");
    await expect(page.locator("[data-objects-detail-tags]")).toHaveValue("hero, review, boss-fight");
    await expect(page.locator("[data-objects-detail-active]")).not.toBeChecked();
    await expect(page.locator("[data-objects-detail-visible]")).not.toBeChecked();
    await expect(page.locator("[data-objects-detail-sprite]")).toHaveValue("sprite_review_hero");
    await expect(page.locator("[data-objects-detail-audio]")).toHaveValue("");
    await expect(page.locator("[data-objects-detail-message]")).toHaveValue(message.key);
    await expect(page.locator("[data-objects-detail-defaults]")).toHaveValue("speed=8\nhealth=3");
    await expect(page.locator("[data-objects-asset-links]")).toContainText("Audio: No reference set.");
    await expect(page.locator("[data-objects-asset-links]")).toContainText(message.name);

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Object Type Catalog selection prefills active table rows", async ({ page }) => {
  const failures = await openObjectsPage(page);

  try {
    await expect(page.locator("[data-objects-list-table] tfoot [data-objects-template-select]")).toBeVisible();
    await page.locator("[data-objects-template-select]").selectOption("Hazard");
    await expect(page.locator("[data-objects-log]")).toHaveText("Hazard template selected for the next object row.");

    await page.getByRole("button", { name: "Add Object" }).click();
    await expect(page.locator("[data-objects-row-type]")).toHaveValue("Hazard");
    await expect(page.locator("[data-objects-row-state]")).toHaveValue("Active");
    await expect(page.locator("[data-objects-row-render-type]")).toHaveValue("Sprite");
    await expect(page.locator("[data-objects-row-capabilities-preview]")).toContainText("Causes Damage");
    await expect(page.locator("[data-objects-row-capabilities-preview]")).toContainText("Takes Damage");
    await expect(page.locator("[data-objects-row-render-asset-preview]")).toHaveText("Links on save");
    await expect(page.locator("[data-objects-row-status]")).toHaveCount(0);
    await expect(page.locator("[data-objects-editing-row]").locator("td").last().locator(".action-group")).toHaveClass(/action-group/);
    await expect(page.locator("[data-objects-row-edit-sprite]")).toHaveCount(0);
    await expect(page.locator("[data-objects-row-open-hitboxes]")).toHaveCount(0);
    await expect(page.locator("[data-objects-row-open-events]")).toHaveCount(0);

    await page.locator("[data-objects-template-select]").selectOption("Platform");
    await expect(page.locator("[data-objects-log]")).toHaveText("Applied Platform template to the active row.");
    await expect(page.locator("[data-objects-row-type]")).toHaveValue("Platform");
    await expect(page.locator("[data-objects-row-state]")).toHaveValue("Active");
    await expect(page.locator("[data-objects-row-render-type]")).toHaveValue("None");
    await expect(page.locator("[data-objects-row-capabilities-preview]")).toHaveText("Can Collide");
    await expect(page.locator("[data-objects-row-render-asset-preview]")).toHaveText("None");
    await expect(page.locator("[data-objects-row-status]")).toHaveCount(0);

    await page.locator("[data-objects-template-select]").selectOption("Hero");
    await page.locator("[data-objects-row-name]").fill("Catalog Hero");
    await expect(page.locator("[data-objects-row-status]")).toHaveCount(0);
    await expect(page.locator("[data-objects-row-edit-sprite]")).toHaveCount(0);
    await expect(page.locator("[data-objects-row-open-hitboxes]")).toHaveCount(0);
    await expect(page.locator("[data-objects-row-open-events]")).toHaveCount(0);
    await page.locator("[data-objects-save-row]").click();
    await expect(page.locator("[data-objects-log]")).toContainText("Added Catalog Hero.");
    await expect(page.locator("[data-objects-log]")).toContainText("Created editable default sprite asset sprite_catalog_hero for Catalog Hero.");
    await expect(page.locator("[data-objects-list]")).toContainText("Catalog Hero");
    await expect(page.locator("[data-objects-list]")).toContainText("Hero");
    await expect(page.locator("[data-objects-list]")).toContainText("Player Controlled");
    await expect(page.locator("[data-objects-list]")).toContainText("Can Move");
    await expect(page.locator("[data-objects-list]")).toContainText("Takes Damage");
    await expect(page.locator("[data-objects-output-render-asset]")).toHaveText("sprite_catalog_hero");
    await expect(page.locator("[data-objects-row-status]")).toHaveCount(0);
    await expect(page.locator("[data-objects-row-edit-sprite]")).toHaveAttribute(
      "href",
      "/toolbox/sprites/index.html?assetKey=sprite_catalog_hero&objectKey=catalog-hero&sourceTool=objects"
    );
    await expect(page.locator("[data-objects-row-open-hitboxes]")).toHaveAttribute(
      "href",
      "/toolbox/hitboxes/index.html?objectKey=catalog-hero&sourceTool=objects"
    );
    await expect(page.locator("[data-objects-row-open-events]")).toHaveAttribute(
      "href",
      "/toolbox/events/index.html?objectKey=catalog-hero&sourceTool=objects"
    );
    const catalogActionCell = page.locator("[data-objects-list] tr").first().locator("td").last();
    const catalogActionGroup = catalogActionCell.locator(".action-group");
    await expect(catalogActionGroup).toHaveClass(/action-group/);
    await expect(catalogActionGroup).toHaveClass(/action-group--tight/);
    await expect(catalogActionGroup.locator("button, a")).toHaveText([
      "Edit",
      "Details",
      "Edit Sprite",
      "Open Hitboxes",
      "Open Events",
      "Trash",
    ]);
    await expect(page.locator("[data-objects-row-edit-sprite]")).toHaveClass(/cyan/);
    await expect(page.locator("[data-objects-row-open-hitboxes]")).toHaveClass(/primary/);
    await expect(page.locator("[data-objects-row-open-events]")).toHaveClass(/primary/);
    await expect(page.locator("[data-objects-row-edit-sprite]")).toHaveAttribute("title", "Sprite asset ready.");
    await expect(page.locator("[data-objects-row-open-hitboxes]")).toHaveAttribute("title", "Missing Hitbox.");
    await expect(page.locator("[data-objects-row-open-events]")).toHaveAttribute(
      "title",
      "Missing Events. Events configure when object behavior happens."
    );
    await expect(page.locator("[data-objects-edit-sprite]")).toHaveAttribute(
      "href",
      "/toolbox/sprites/index.html?assetKey=sprite_catalog_hero&objectKey=catalog-hero&sourceTool=objects"
    );

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Objects table save preserves linked sprite asset create and resolve behavior", async ({ page }) => {
  const failures = await openObjectsPage(page);

  try {
    await page.getByRole("button", { name: "Add Object" }).click();
    await fillActiveRow(page, {
      name: "Bolt",
      renderType: "Sprite",
      type: "Projectile",
    });
    await expect(page.locator("[data-objects-row-render-asset-preview]")).toHaveText("Links on save");
    await expect(page.locator("[data-objects-row-render-asset-preview]").locator("input, textarea, select")).toHaveCount(0);
    await page.locator("[data-objects-save-row]").click();

    await expect(page.locator("[data-objects-log]")).toContainText("Added Bolt.");
    await expect(page.locator("[data-objects-log]")).toContainText("Created editable default sprite asset sprite_bolt for Bolt.");
    await expect(page.locator("[data-objects-list]")).toContainText("sprite_bolt");
    await expect(page.locator("[data-objects-list] tr").first().locator("td").nth(5).locator("input, textarea, select")).toHaveCount(0);
    await expect(page.locator("[data-objects-asset-status]")).toHaveText("1 Linked");
    await expect(page.locator("[data-objects-list]")).toContainText("Bolt");
    await expect(page.locator("[data-objects-row-status]")).toHaveCount(0);
    await expect(page.locator("[data-objects-row-edit-sprite]")).toHaveAttribute(
      "href",
      "/toolbox/sprites/index.html?assetKey=sprite_bolt&objectKey=bolt&sourceTool=objects"
    );
    await expect(page.locator("[data-objects-row-open-hitboxes]")).toHaveAttribute(
      "href",
      "/toolbox/hitboxes/index.html?objectKey=bolt&sourceTool=objects"
    );
    await expect(page.locator("[data-objects-row-open-events]")).toHaveAttribute(
      "href",
      "/toolbox/events/index.html?objectKey=bolt&sourceTool=objects"
    );
    await expect(page.locator("[data-objects-row-edit-sprite]")).toHaveClass(/cyan/);
    await expect(page.locator("[data-objects-row-open-hitboxes]")).toHaveClass(/primary/);
    await expect(page.locator("[data-objects-row-open-events]")).toHaveClass(/primary/);
    await expect(page.locator("[data-objects-list] tr").first().locator("td").last().locator(".action-group")).toHaveClass(/action-group/);
    await expect(page.locator("[data-objects-output-render-asset]")).toHaveText("sprite_bolt");
    await expect(page.locator("[data-objects-output-sprite-preview]")).toContainText("sprite_bolt");
    await expect(page.locator("[data-objects-output-sprite-preview]")).toContainText("projects/");
    await expect(page.locator("[data-objects-edit-sprite]")).toBeVisible();
    await expect(page.locator("[data-objects-edit-sprite]")).toHaveAttribute(
      "href",
      "/toolbox/sprites/index.html?assetKey=sprite_bolt&objectKey=bolt&sourceTool=objects"
    );

    const originalSprite = await page.evaluate(async () => {
      const response = await fetch("/api/local-db/snapshot");
      const payload = await response.json();
      return payload.data.tables.asset_library_items.find((row) => row.id === "sprite_bolt");
    });
    const updatedSpritePath = (originalSprite.storedPath || originalSprite.path).replace(/[^/]+$/, "sprite_bolt_reworked.png");
    const updatedSprite = {
      ...originalSprite,
      fileName: "sprite_bolt_reworked.png",
      name: "Bolt Reworked Sprite",
      originalName: "sprite_bolt_reworked.png",
      path: updatedSpritePath,
      storedPath: updatedSpritePath,
      updatedAt: new Date().toISOString(),
    };
    await page.route("**/api/toolbox/assets/repositories/*/methods/listAssets", async (route) => {
      await route.fulfill({
        body: JSON.stringify({ data: { result: [updatedSprite] }, ok: true }),
        contentType: "application/json",
        status: 200,
      });
    });
    expect(updatedSprite.name).toBe("Bolt Reworked Sprite");
    await page.evaluate(() => {
      window.dispatchEvent(new Event("focus"));
      window.dispatchEvent(new Event("gamefoundry:objects-refresh-assets"));
    });
    await expect(page.locator("[data-objects-list]")).toContainText("Bolt Reworked Sprite (sprite_bolt)");
    await expect(page.locator("[data-objects-output-render-asset]")).toHaveText("Bolt Reworked Sprite (sprite_bolt)");
    await expect(page.locator("[data-objects-output-sprite-preview]")).toContainText("sprite_bolt_reworked.png");
    await expect(page.locator("[data-objects-edit-sprite]")).toHaveAttribute(
      "href",
      "/toolbox/sprites/index.html?assetKey=sprite_bolt&objectKey=bolt&sourceTool=objects"
    );

    await page.locator("[data-objects-edit-row='bolt']").click();
    await expect(page.locator("[data-objects-row-render-asset-preview]")).toHaveText("Bolt Reworked Sprite (sprite_bolt)");
    await expect(page.locator("[data-objects-row-render-asset-preview]").locator("input, textarea, select")).toHaveCount(0);
    await page.locator("[data-objects-save-row]").click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Saved Bolt.");
    await expect(page.locator("[data-objects-log]")).not.toContainText("Sprite asset link blocked");
    await expect(page.locator("[data-objects-list]")).toContainText("Bolt Reworked Sprite (sprite_bolt)");
    await expect(page.locator("main")).not.toContainText(OLD_INTERNAL_COPY_PATTERN);

    await page.getByRole("button", { name: "Reset Table" }).click();
    await page.getByRole("button", { name: "Add Object" }).click();
    await fillActiveRow(page, {
      name: "Bolt",
      renderType: "Sprite",
      type: "Projectile",
    });
    await page.locator("[data-objects-save-row]").click();
    await expect(page.locator("[data-objects-log]")).toContainText("Added Bolt.");
    await expect(page.locator("[data-objects-log]")).toContainText("Resolved existing sprite asset sprite_bolt for Bolt.");

    const spriteRows = await page.evaluate(async () => {
      const response = await fetch("/api/local-db/snapshot");
      const payload = await response.json();
      return payload.data.tables.asset_library_items.filter((asset) => asset.id === "sprite_bolt");
    });
    expect(spriteRows).toHaveLength(1);
    expect(spriteRows[0]).toEqual(expect.objectContaining({
      assetRole: "image",
      fileName: "sprite_bolt.png",
      id: "sprite_bolt",
      name: "sprite_bolt",
      status: "Ready",
      usage: "sprite",
    }));
    expect(spriteRows[0].storedPath).toContain("/image/sprite/sprite_bolt.png");
    expect(JSON.stringify(spriteRows)).not.toMatch(/placeholder/i);

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Objects is a clickable beta tool from Toolbox", async ({ page }) => {
  const failures = await openToolboxPage(page);

  try {
    const objectsCard = page.locator("[data-toolbox-tool-card='Objects']");
    await expect(objectsCard).toBeVisible();
    await expect(objectsCard).toHaveAttribute("data-toolbox-release-channel", "beta");
    await expect(objectsCard.locator("[data-toolbox-kicker]")).toHaveText("Beta");
    await expect(objectsCard.locator("[data-toolbox-plan-details]")).toHaveCount(0);
    await expect(objectsCard).not.toContainText("Wireframe details");
    await expect(objectsCard.locator("[data-toolbox-tool-name-link='Objects']")).toHaveAttribute("href", "/toolbox/objects/index.html");
    const registryEntry = await objectsRegistryEntry(page);
    expect(registryEntry).toEqual(expect.objectContaining({
      releaseChannel: "beta",
      releaseChannelLabel: "Beta",
      status: "beta",
    }));
    expect(registryEntry.shortDescription).toContain("types");
    expect(registryEntry.shortDescription).not.toMatch(/\broles\b/i);
    await objectsCard.locator("[data-toolbox-tool-name-link='Objects']").click();
    await expect(page.getByRole("heading", { level: 1, name: "Objects" })).toBeVisible();

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
