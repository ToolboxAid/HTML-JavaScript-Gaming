import { expect, test } from "@playwright/test";
import { TAGS_TOOL_TABLES, createTagsToolMockRepository } from "../../../src/dev-runtime/persistence/tool-repositories/tags-mock-repository.js";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "tags-tool",
    surface: "Tags first-class tool and shared vocabulary table"
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
    body: JSON.stringify({ modeId: "local-mem" }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
}

async function openRepoPage(page, pathName) {
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

  await setServerSession(server);
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

test("Tags repository exposes shared workspace tag table", () => {
  const repository = createTagsToolMockRepository({ persist: false });
  expect(Object.keys(repository.getTables()).sort()).toEqual([...TAGS_TOOL_TABLES].sort());

  const addResult = repository.addTag({
    description: "Hero vocabulary",
    name: "Hero"
  });
  expect(addResult.added).toBe(true);
  expect(repository.listTags()).toEqual([
    expect.objectContaining({
      description: "Hero vocabulary",
      name: "Hero",
      usageCount: 0
    })
  ]);

  const updateResult = repository.updateTag(addResult.tag.id, {
    description: "Hero and player vocabulary",
    name: "Hero Asset"
  });
  expect(updateResult.updated).toBe(true);
  expect(repository.findTag(addResult.tag.id).description).toBe("Hero and player vocabulary");

  const deleteResult = repository.deleteTag(addResult.tag.id);
  expect(deleteResult.deleted).toBe(true);
  expect(repository.listTags()).toEqual([]);
});

test("Tags page supports add, edit, usage expansion, delete, and toolbox registration", async ({ page }) => {
  const failures = await openRepoPage(page, "/tools/tags/index.html");

  try {
    await expect(page.getByRole("heading", { level: 1, name: "Tags" })).toBeVisible();
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    const runtimeReferences = await page.locator("script[src], link[href]").evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("src") || node.getAttribute("href") || "")
    );
    expect(runtimeReferences.join("\n")).not.toContain("archive/v1-v2");

    await page.getByRole("button", { name: "Add Tag" }).click();
    const newRow = page.locator("[data-tags-editing-row='__new__']");
    await expect(newRow).toBeVisible();
    await newRow.getByLabel("Tag Name").fill("Hero");
    await newRow.getByLabel("Description").fill("Hero assets");
    await newRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-tags-log]")).toHaveText("Added Hero.");
    await expect(page.locator("[data-tags-row]").filter({ hasText: "Hero" })).toBeVisible();
    await expect(page.locator("[data-tags-count]")).toHaveText("1");

    await page.locator("[data-tags-row]").filter({ hasText: "Hero" }).getByRole("button", { name: "Show usage for Hero" }).click();
    await expect(page.locator("[data-tags-usage-row='hero']")).toContainText("Tool");
    await expect(page.locator("[data-tags-usage-row='hero']")).toContainText("Item Name");
    await expect(page.locator("[data-tags-usage-row='hero']")).toContainText("No usage yet.");

    await page.locator("[data-tags-row]").filter({ hasText: "Hero" }).getByRole("button", { name: "Edit" }).click();
    const editRow = page.locator("[data-tags-editing-row='hero']");
    await editRow.getByLabel("Tag Name").fill("Hero Asset");
    await editRow.getByLabel("Description").fill("Hero and player assets");
    await editRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-tags-log]")).toHaveText("Updated Hero Asset.");
    await expect(page.locator("[data-tags-row]").filter({ hasText: "Hero Asset" })).toContainText("Hero and player assets");

    await page.locator("[data-tags-row]").filter({ hasText: "Hero Asset" }).getByRole("button", { name: "Trash" }).click();
    await expect(page.locator("[data-tags-log]")).toHaveText("Deleted Hero Asset.");
    await expect(page.locator("[data-tags-table]")).toContainText("No tags added yet.");

    const registryResponse = await fetch(`${failures.server.baseUrl}/api/toolbox/registry/snapshot`);
    const registryPayload = await registryResponse.json();
    expect(registryPayload.ok).toBe(true);
    expect(registryPayload.data.activeTools.find((tool) => tool.id === "tags")).toEqual(expect.objectContaining({
      displayName: "Tags",
      route: "toolbox/tags/index.html",
      visibleInToolsList: true
    }));

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
