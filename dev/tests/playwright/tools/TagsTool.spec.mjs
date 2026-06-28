import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { createPostgresConnectionClient } from "../../../../api/persistence/postgres-connection-client.mjs";
import { SEED_DB_KEYS } from "../../../../api/seed/seed-db-keys.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

let tagsSchemaReadyPromise = null;

async function ensureTagsDatabaseSchema() {
  if (!tagsSchemaReadyPromise) {
    tagsSchemaReadyPromise = (async () => {
      const client = createPostgresConnectionClient();
      const ddlFiles = [
        "dev/build/database/ddl/account.sql",
        "dev/build/database/ddl/game-workspace.sql",
        "dev/build/database/ddl/tags.sql",
      ];
      for (const ddlFile of ddlFiles) {
        const ddl = await readFile(path.resolve(ddlFile), "utf8");
        await client.query(ddl);
      }
    })();
  }
  try {
    await tagsSchemaReadyPromise;
  } catch (error) {
    tagsSchemaReadyPromise = null;
    throw error;
  }
}

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "tags-tool",
    surface: "Tags first-class tool and flat project tag assignment"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function setServerSession(server, userKey = SEED_DB_KEYS.users.user1) {
  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: "local-db" }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
}

async function createRepositoryApiClient(server, toolId) {
  const createResponse = await fetch(`${server.baseUrl}/api/toolbox/${toolId}/repositories`, {
    body: JSON.stringify({ options: {} }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
  const createPayload = await createResponse.json();
  expect(createPayload.ok).toBe(true);
  const repositoryId = createPayload.data.repositoryId;

  async function callRepositoryMethod(methodName, ...args) {
    const response = await fetch(`${server.baseUrl}/api/toolbox/${toolId}/repositories/${repositoryId}/methods/${methodName}`, {
      body: JSON.stringify({ args }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    return payload.data.result;
  }
  callRepositoryMethod.repositoryId = repositoryId;
  return callRepositoryMethod;
}

async function persistActiveGameHubProject(server) {
  const callGameHubMethod = await createRepositoryApiClient(server, "game-hub");
  await callGameHubMethod("updateGameStatus", "demo-game", "Under Construction");
}

async function openRepoPage(page, pathName, options = {}) {
  const server = await startRepoServer();
  await ensureTagsDatabaseSchema();
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

  if (options.sessionUserKey !== null) {
    await setServerSession(server, options.sessionUserKey || SEED_DB_KEYS.users.user1);
    await persistActiveGameHubProject(server);
  }
  await page.addInitScript(() => {
    window.GameFoundryPublicConfig = {
      apiUrl: `${window.location.origin}/api`
    };
  });
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function createTagsApiClient(server) {
  return createRepositoryApiClient(server, "tags");
}

async function readProductRows(tableName, query = "select=*") {
  const client = createPostgresConnectionClient();
  return client.requestTable(tableName, { query });
}

test("Tags API exposes flat project tag tables and assignment workflow", async () => {
  const server = await startRepoServer();
  try {
    await ensureTagsDatabaseSchema();
    await setServerSession(server);
    await persistActiveGameHubProject(server);
    const callTagsMethod = await createTagsApiClient(server);
    const uniqueTagLabel = `Hero ${Date.now()}`;
    const updatedTagLabel = `${uniqueTagLabel} Asset`;
    const updatedTagSlug = updatedTagLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const snapshot = await callTagsMethod("getSnapshot");
    expect(Object.keys(snapshot.tables).sort()).toEqual(["project_tag_assignments", "project_tags"]);
    expect(snapshot.tags.map((tag) => tag.label)).toEqual(expect.arrayContaining([
      "boss-fight",
      "fantasy",
      "kids",
      "medium",
      "pixel-art",
      "platformer",
    ]));

    const addResult = await callTagsMethod("addTag", {
      description: "Hero vocabulary",
      label: uniqueTagLabel
    });
    expect(addResult.added).toBe(true);
    expect(addResult.tag).toEqual(expect.objectContaining({
      createdAt: expect.any(String),
      createdBy: expect.any(String),
      key: expect.stringMatching(/^[0-9A-HJKMNP-TV-Z]{26}$/),
      label: uniqueTagLabel,
      updatedAt: expect.any(String),
      updatedBy: expect.any(String)
    }));

    const duplicate = await callTagsMethod("addTag", { label: uniqueTagLabel.toLowerCase() });
    expect(duplicate.added).toBe(false);
    expect(duplicate.validation.findings[0]).toMatchObject({
      label: "Tag Label",
      status: "Duplicate",
    });

    expect(snapshot.assignedTags.map((tag) => tag.label).sort()).toEqual([
      "fantasy",
      "platformer",
    ]);

    const assignResult = await callTagsMethod("assignTagToProject", addResult.tag.id);
    expect(assignResult.assigned).toBe(true);
    expect(assignResult.snapshot.assignedTags).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: uniqueTagLabel }),
      expect.objectContaining({ label: "fantasy" }),
      expect.objectContaining({ label: "platformer" })
    ]));
    await expect.poll(async () => {
      const rows = await readProductRows("project_tag_assignments", `tagKey=eq.${encodeURIComponent(addResult.tag.key)}`);
      return rows.some((row) => row.tagKey === addResult.tag.key);
    }).toBe(true);

    const updateResult = await callTagsMethod("updateTag", addResult.tag.id, {
      description: "Hero and player vocabulary",
      label: updatedTagLabel
    });
    expect(updateResult.updated).toBe(true);
    expect(updateResult.tag.description).toBe("Hero and player vocabulary");
    const updatedTagRows = await readProductRows("project_tags", `key=eq.${encodeURIComponent(updateResult.tag.key)}`);
    expect(updatedTagRows).toEqual([
      expect.objectContaining({
        active: true,
        description: "Hero and player vocabulary",
        label: updatedTagLabel,
        slug: updatedTagSlug,
      })
    ]);

    const removeResult = await callTagsMethod("removeTagFromProject", updateResult.tag.id);
    expect(removeResult.removed).toBe(true);
    await expect.poll(async () => {
      const rows = await readProductRows("project_tag_assignments", `tagKey=eq.${encodeURIComponent(updateResult.tag.key)}`);
      return rows.some((row) => row.tagKey === updateResult.tag.key);
    }).toBe(false);
    const deleteResult = await callTagsMethod("deleteTag", updateResult.tag.id);
    expect(deleteResult.deleted).toBe(true);
    const finalSnapshot = await callTagsMethod("getSnapshot");
    expect(finalSnapshot.tags.some((tag) => tag.id === updateResult.tag.id)).toBe(false);
    const deletedRows = await readProductRows("project_tags", `key=eq.${encodeURIComponent(updateResult.tag.key)}`);
    expect(deletedRows).toEqual([
      expect.objectContaining({
        active: false,
        label: updatedTagLabel,
      })
    ]);
  } finally {
    await server.close();
  }
});

test("Tags page supports add, edit, usage expansion, delete, and toolbox registration", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/tags/index.html");

  try {
    const uniqueTagLabel = `Hero ${Date.now()}`;
    const updatedTagLabel = `${uniqueTagLabel} Asset`;
    const uniqueTagSlug = uniqueTagLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    await expect(page.getByRole("heading", { level: 1, name: "Tags" })).toBeVisible();
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("[data-toolbox-selected-game-name]")).toHaveText("Demo Game");
    await expect(page.locator("[data-tags-active-project]")).toHaveText("Demo Game");
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    const addTagPlacement = await page.locator("[data-tags-add]").evaluate((button) => ({
      insideTagsTableCard: Boolean(button.closest(".card")?.querySelector("[data-tags-table]")),
      insideSidePanel: Boolean(button.closest("aside"))
    }));
    expect(addTagPlacement).toEqual({
      insideTagsTableCard: true,
      insideSidePanel: false
    });
    const runtimeReferences = await page.locator("script[src], link[href]").evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("src") || node.getAttribute("href") || "")
    );
    expect(runtimeReferences.join("\n")).not.toContain("archive/v1-v2");

    await page.getByRole("button", { name: "Add Tag" }).click();
    const newRow = page.locator("[data-tags-editing-row='__new__']");
    await expect(newRow).toBeVisible();
    await newRow.getByLabel("Tag Label").fill(uniqueTagLabel);
    await newRow.getByLabel("Description").fill("Hero assets");
    await newRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-tags-log]")).toHaveText(`Added ${uniqueTagLabel}.`);
    await expect(page.locator("[data-tags-row]").filter({ hasText: uniqueTagLabel })).toBeVisible();
    await expect.poll(async () => Number(await page.locator("[data-tags-count]").textContent())).toBeGreaterThanOrEqual(7);

    await page.getByRole("button", { name: "Add Tag" }).click();
    const duplicateRow = page.locator("[data-tags-editing-row='__new__']");
    await duplicateRow.getByLabel("Tag Label").fill(uniqueTagLabel.toLowerCase());
    await duplicateRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-tags-log]")).toHaveText("Choose a unique project tag label.");
    await duplicateRow.getByRole("button", { name: "Cancel" }).click();

    await page.locator("[data-tags-row]").filter({ hasText: uniqueTagLabel }).getByRole("button", { name: `Show usage for ${uniqueTagLabel}` }).click();
    await expect(page.locator(`[data-tags-usage-row='${uniqueTagSlug}']`)).toContainText("Tool");
    await expect(page.locator(`[data-tags-usage-row='${uniqueTagSlug}']`)).toContainText("Item Name");
    await expect(page.locator(`[data-tags-usage-row='${uniqueTagSlug}']`)).toContainText("No usage yet.");

    await page.locator("[data-tags-row]").filter({ hasText: uniqueTagLabel }).getByRole("button", { name: "Assign" }).click();
    await expect(page.locator("[data-tags-log]")).toHaveText(`Assigned ${uniqueTagLabel} to Demo Game.`);
    await expect.poll(async () => Number(await page.locator("[data-tags-assigned-count]").textContent())).toBeGreaterThanOrEqual(1);
    await expect(page.locator("[data-tags-assigned-labels]")).toContainText(uniqueTagLabel);
    await page.getByRole("button", { name: "Refresh Tags" }).click();
    await expect(page.locator("[data-tags-assigned-labels]")).toContainText(uniqueTagLabel);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-selected-game-name]")).toHaveText("Demo Game");
    await expect(page.locator("[data-tags-assigned-labels]")).toContainText(uniqueTagLabel);
    await expect(page.locator("[data-tags-row]").filter({ hasText: uniqueTagLabel }).getByRole("button", { name: "Remove" })).toBeVisible();
    await page.locator("[data-tags-row]").filter({ hasText: uniqueTagLabel }).getByRole("button", { name: "Remove" }).click();
    await expect(page.locator("[data-tags-log]")).toHaveText(`Removed ${uniqueTagLabel} from Demo Game.`);
    await expect.poll(async () => Number(await page.locator("[data-tags-assigned-count]").textContent())).toBeGreaterThanOrEqual(0);

    await page.locator("[data-tags-row]").filter({ hasText: uniqueTagLabel }).getByRole("button", { name: "Edit" }).click();
    const editRow = page.locator(`[data-tags-editing-row='${uniqueTagSlug}']`);
    await editRow.getByLabel("Tag Label").fill(updatedTagLabel);
    await editRow.getByLabel("Description").fill("Hero and player assets");
    await editRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-tags-log]")).toHaveText(`Updated ${updatedTagLabel}.`);
    await expect(page.locator("[data-tags-row]").filter({ hasText: updatedTagLabel })).toContainText("Hero and player assets");

    await page.locator("[data-tags-row]").filter({ hasText: updatedTagLabel }).getByRole("button", { name: "Trash" }).click();
    await expect(page.locator("[data-tags-log]")).toHaveText(`Deleted ${updatedTagLabel}.`);
    await expect.poll(async () => Number(await page.locator("[data-tags-count]").textContent())).toBeGreaterThanOrEqual(6);

    const registryResponse = await fetch(`${failures.server.baseUrl}/api/toolbox/registry/snapshot`);
    const registryPayload = await registryResponse.json();
    expect(registryPayload.ok).toBe(true);
    expect(registryPayload.data.activeTools.find((tool) => tool.id === "tags")).toEqual(expect.objectContaining({
      badge: "/assets/theme-v2/images/badges/tags.png",
      displayName: "Tags",
      route: "toolbox/tags/index.html",
      tool: "/assets/theme-v2/images/tools/tags.png",
      visibleInToolsList: true
    }));
    const tagsRegistryTool = registryPayload.data.activeTools.find((tool) => tool.id === "tags");
    expect(tagsRegistryTool.badge).not.toBe("/assets/theme-v2/images/badges/assets.png");
    expect(tagsRegistryTool.tool).not.toBe("/assets/theme-v2/images/tools/assets.png");

    await page.goto(`${failures.server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    const tagsTile = page.locator("[data-toolbox-tool-card='Tags']");
    await expect(tagsTile).toBeVisible();
    await expect(tagsTile.locator("img[alt='Tags badge']")).toHaveAttribute("src", "/assets/theme-v2/images/badges/tags.png");
    await expect(tagsTile.locator(".card-media img")).toHaveAttribute("src", "/assets/theme-v2/images/tools/tags.png");
    await expect(tagsTile.locator("[data-tool-image-diagnostic]")).toHaveCount(0);

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Tags guest write actions redirect to sign in before saving project data", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/tags/index.html", { sessionUserKey: null });

  try {
    await page.getByRole("button", { name: "Add Tag" }).click();
    const newRow = page.locator("[data-tags-editing-row='__new__']");
    await expect(newRow).toBeVisible();
    await newRow.getByLabel("Tag Label").fill("Guest Tag");
    await newRow.getByRole("button", { name: "Save" }).click();
    await page.waitForURL(/\/account\/sign-in\.html$/);
    expect(failures.failedRequests.filter((request) => /^\d/.test(request) && !request.includes("/account/sign-in.html"))).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page).catch(() => {});
    await failures.server.close();
  }
});

test("Tags API rejects guest write actions", async () => {
  const server = await startRepoServer();
  try {
    await ensureTagsDatabaseSchema();
    const callTagsMethod = await createTagsApiClient(server);
    const writeMethods = [
      ["addTag", [{ label: "Guest API Tag" }]],
      ["updateTag", ["platformer", { label: "Guest Update" }]],
      ["assignTagToProject", ["platformer"]],
      ["removeTagFromProject", ["platformer"]],
      ["deleteTag", ["platformer"]],
    ];

    for (const [methodName, args] of writeMethods) {
      const response = await fetch(`${server.baseUrl}/api/toolbox/tags/repositories/${callTagsMethod.repositoryId}/methods/${methodName}`, {
        body: JSON.stringify({ args }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const payload = await response.json();
      expect(response.status).toBe(401);
      expect(payload.ok).toBe(false);
      expect(payload.error).toContain("Sign in required to save project tags through the API.");
    }
  } finally {
    await server.close();
  }
});
