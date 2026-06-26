import { expect, test } from "@playwright/test";
import { TAGS_TOOL_TABLES, createTagsToolMockRepository } from "../../../src/dev-runtime/persistence/tool-repositories/tags-mock-repository.js";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

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

async function setServerSession(server, userKey = MOCK_DB_KEYS.users.user1) {
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

async function openRepoPage(page, pathName, options = {}) {
  const server = await startRepoServer();
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
    await setServerSession(server, options.sessionUserKey || MOCK_DB_KEYS.users.user1);
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

test("Tags repository exposes flat project tag tables and assignment workflow", () => {
  const repository = createTagsToolMockRepository({ persist: false });
  expect(Object.keys(repository.getTables()).sort()).toEqual([...TAGS_TOOL_TABLES].sort());
  expect(Object.keys(repository.getTables()).sort()).toEqual(["project_tag_assignments", "project_tags"]);
  expect(repository.listTags().map((tag) => tag.label)).toEqual([
    "boss-fight",
    "fantasy",
    "kids",
    "medium",
    "pixel-art",
    "platformer",
  ]);

  const addResult = repository.addTag({
    description: "Hero vocabulary",
    label: "Hero"
  });
  expect(addResult.added).toBe(true);
  expect(addResult.tag).toEqual(expect.objectContaining({
    createdAt: expect.any(String),
    createdBy: expect.any(String),
    key: expect.stringMatching(/^[0-9A-HJKMNP-TV-Z]{26}$/),
    label: "Hero",
    updatedAt: expect.any(String),
    updatedBy: expect.any(String)
  }));
  expect(repository.listTags()).toEqual(expect.arrayContaining([
    expect.objectContaining({
      description: "Hero vocabulary",
      label: "Hero",
      usageCount: 0
    })
  ]));

  const duplicate = repository.addTag({ label: "hero" });
  expect(duplicate.added).toBe(false);
  expect(duplicate.validation.findings[0]).toMatchObject({
    label: "Tag Label",
    status: "Duplicate",
  });

  const assignResult = repository.assignTagToProject(addResult.tag.id);
  expect(assignResult.assigned).toBe(true);
  expect(repository.getSnapshot().assignedTags).toEqual([
    expect.objectContaining({ label: "Hero" })
  ]);

  const updateResult = repository.updateTag(addResult.tag.id, {
    description: "Hero and player vocabulary",
    label: "Hero Asset"
  });
  expect(updateResult.updated).toBe(true);
  expect(repository.findTag(updateResult.tag.id).description).toBe("Hero and player vocabulary");

  const removeResult = repository.removeTagFromProject(updateResult.tag.id);
  expect(removeResult.removed).toBe(true);
  const deleteResult = repository.deleteTag(updateResult.tag.id);
  expect(deleteResult.deleted).toBe(true);
  expect(repository.findTag(updateResult.tag.id)).toBeNull();
});

test("Tags page supports add, edit, usage expansion, delete, and toolbox registration", async ({ page }) => {
  const failures = await openRepoPage(page, "/tools/tags/index.html");

  try {
    await expect(page.getByRole("heading", { level: 1, name: "Tags" })).toBeVisible();
    await expect(page.locator(".tool-workspace")).toBeVisible();
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
    await newRow.getByLabel("Tag Label").fill("Hero");
    await newRow.getByLabel("Description").fill("Hero assets");
    await newRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-tags-log]")).toHaveText("Added Hero.");
    await expect(page.locator("[data-tags-row]").filter({ hasText: "Hero" })).toBeVisible();
    await expect(page.locator("[data-tags-count]")).toHaveText("7");

    await page.getByRole("button", { name: "Add Tag" }).click();
    const duplicateRow = page.locator("[data-tags-editing-row='__new__']");
    await duplicateRow.getByLabel("Tag Label").fill("hero");
    await duplicateRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-tags-log]")).toHaveText("Choose a unique project tag label.");
    await duplicateRow.getByRole("button", { name: "Cancel" }).click();

    await page.locator("[data-tags-row]").filter({ hasText: "Hero" }).getByRole("button", { name: "Show usage for Hero" }).click();
    await expect(page.locator("[data-tags-usage-row='hero']")).toContainText("Tool");
    await expect(page.locator("[data-tags-usage-row='hero']")).toContainText("Item Name");
    await expect(page.locator("[data-tags-usage-row='hero']")).toContainText("No usage yet.");

    await page.locator("[data-tags-row]").filter({ hasText: "Hero" }).getByRole("button", { name: "Assign" }).click();
    await expect(page.locator("[data-tags-log]")).toHaveText("Assigned Hero to Demo Game.");
    await expect(page.locator("[data-tags-assigned-count]")).toHaveText("1");
    await expect(page.locator("[data-tags-assigned-labels]")).toHaveText("Hero");
    await page.getByRole("button", { name: "Refresh Tags" }).click();
    await expect(page.locator("[data-tags-assigned-labels]")).toHaveText("Hero");
    await page.locator("[data-tags-row]").filter({ hasText: "Hero" }).getByRole("button", { name: "Remove" }).click();
    await expect(page.locator("[data-tags-log]")).toHaveText("Removed Hero from Demo Game.");
    await expect(page.locator("[data-tags-assigned-count]")).toHaveText("0");

    await page.locator("[data-tags-row]").filter({ hasText: "Hero" }).getByRole("button", { name: "Edit" }).click();
    const editRow = page.locator("[data-tags-editing-row='hero']");
    await editRow.getByLabel("Tag Label").fill("Hero Asset");
    await editRow.getByLabel("Description").fill("Hero and player assets");
    await editRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-tags-log]")).toHaveText("Updated Hero Asset.");
    await expect(page.locator("[data-tags-row]").filter({ hasText: "Hero Asset" })).toContainText("Hero and player assets");

    await page.locator("[data-tags-row]").filter({ hasText: "Hero Asset" }).getByRole("button", { name: "Trash" }).click();
    await expect(page.locator("[data-tags-log]")).toHaveText("Deleted Hero Asset.");
    await expect(page.locator("[data-tags-count]")).toHaveText("6");

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
  const failures = await openRepoPage(page, "/tools/tags/index.html", { sessionUserKey: null });

  try {
    await page.getByRole("button", { name: "Add Tag" }).click();
    const newRow = page.locator("[data-tags-editing-row='__new__']");
    await newRow.getByLabel("Tag Label").fill("Guest Tag");
    await newRow.getByRole("button", { name: "Save" }).click();
    await page.waitForURL(/\/account\/sign-in\.html$/);
    expect(failures.failedRequests.filter((request) => /^\d/.test(request) && !request.includes("/account/sign-in.html"))).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page).catch(() => {});
    await failures.server.close();
  }
});
