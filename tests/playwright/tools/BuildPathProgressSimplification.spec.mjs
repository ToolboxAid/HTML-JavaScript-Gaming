import { expect, test } from "@playwright/test";
import {
  TOOL_IMAGE_FALLBACK,
  TOOL_REGISTRY,
  getToolImageSource,
  getToolRoute
} from "../../../toolbox/toolRegistry.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const registryToolsByDisplayName = new Map(TOOL_REGISTRY.map((tool) => [tool.displayName, tool]));

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "build-path",
    surface: "toolbox build path simplification"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

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

  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function buildPathRows(page) {
  return page.locator("[data-build-path-table='workflow'] tbody tr").evaluateAll((rows) => (
    rows.map((row) => ({
      complete: row.dataset.buildPathComplete,
      order: Number(row.children[0].textContent.trim()),
      status: row.dataset.buildPathStatus,
      tool: row.dataset.buildPathTool
    }))
  ));
}

test("Toolbox removes Progress view and renders Build Path workflow table", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html?role=user");

  try {
    await expect(page.getByRole("button", { name: "Progress" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Build Path" })).toBeVisible();

    await page.getByRole("button", { name: "Build Path" }).click();
    await expect(page.locator("[data-build-path-table='workflow']")).toBeVisible();
    await expect(page.locator("[data-build-path-table='workflow'] th")).toHaveText(["Order", "Tool", "Status", "Complete"]);
    await expect(page.getByText("What should I do next? Game Configuration")).toBeVisible();
    await expect(page.getByText("Project Completion: Demo Project identity ready")).toBeVisible();
    await expect(page.getByText("Work top-to-bottom and left-to-right through the workflow table.")).toBeVisible();

    const rows = await buildPathRows(page);
    expect(rows.slice(0, 6).map((row) => row.tool)).toEqual([
      "Project Workspace",
      "Game Design",
      "Game Configuration",
      "Colors",
      "Controls",
      "Assets"
    ]);
    expect(rows.map((row) => row.order)).toEqual(rows.map((_, index) => index + 1));
    expect(rows.map((row) => row.status)).toEqual(expect.arrayContaining([
      "🟢 Complete",
      "🟡 In Progress",
      "🔴 Not Started"
    ]));
    const publishRow = rows.find((row) => row.tool === "Publish");
    expect(publishRow.status).not.toBe("⚪ N/A");
    expect(publishRow.complete).not.toBe("N/A");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Build Path shows N/A only for non-required contributor-focused tools", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html?role=user&memberRole=Audio%20Creator");

  try {
    await page.getByRole("button", { name: "Build Path" }).click();
    await expect(page.locator("[data-toolbox-role-focus='Audio Creator']")).toBeVisible();

    const rows = await buildPathRows(page);
    const colorsRow = rows.find((row) => row.tool === "Colors");
    const audioRow = rows.find((row) => row.tool === "Audio");
    const publishRow = rows.find((row) => row.tool === "Publish");

    expect(colorsRow.status).toBe("⚪ N/A");
    expect(colorsRow.complete).toBe("N/A");
    expect(audioRow.status).not.toBe("⚪ N/A");
    expect(publishRow.status).not.toBe("⚪ N/A");
    expect(publishRow.complete).not.toBe("N/A");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Build Path tool names link to registered routes and render badge images", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html?role=admin");

  try {
    await page.getByRole("button", { name: "Build Path" }).click();
    const rows = page.locator("[data-build-path-table='workflow'] tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    for (let index = 0; index < rowCount; index += 1) {
      const row = rows.nth(index);
      const toolName = await row.getAttribute("data-build-path-tool");
      const registryTool = registryToolsByDisplayName.get(toolName);
      expect(registryTool, `Registry entry missing for ${toolName}`).toBeTruthy();
      const route = getToolRoute(registryTool);

      await expect(row.locator("[data-build-path-tool-link]")).toHaveText(toolName);
      await expect(row.locator("[data-build-path-tool-link]")).toHaveAttribute("data-registered-tool-route", route);
      await expect(row.locator("[data-build-path-tool-link]")).toHaveAttribute("href", "/" + route);
      await expect(row.locator("[data-build-path-badge]")).toHaveAttribute("src", getToolImageSource(registryTool, "badge"));
      await expect(row.locator("[data-build-path-badge]")).toHaveAttribute("alt", toolName + " badge");
      await expect(row.locator("[data-tool-image-diagnostic]")).toHaveCount(0);
    }

    const gameDesignRow = page.locator("[data-build-path-tool='Game Design']");
    await gameDesignRow.locator("[data-build-path-badge]").evaluate((image) => {
      image.dispatchEvent(new Event("error"));
    });
    await expect(gameDesignRow.locator("[data-build-path-badge]")).toHaveAttribute("src", TOOL_IMAGE_FALLBACK);
    await expect(gameDesignRow.locator("[data-tool-image-diagnostic]")).toContainText("Badge image missing; fallback shown.");

    await gameDesignRow.locator("[data-build-path-tool-link]").click();
    await page.waitForURL(/\/toolbox\/game-design\/index\.html$/);
    await expect(page.locator(".page-title h1")).toHaveText("Game Design");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Admin navigation exposes Tools Progress and removes Project Progress", async ({ page }) => {
  const failures = await openRepoPage(page, "/index.html");

  try {
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='admin']")).toHaveCount(1);
    await expect(page.locator("[data-toolbox-menu]").getByText("Admin", { exact: true })).toHaveCount(0);
    await expect(page.locator("nav.nav-links a[data-route='admin-tools-progress']")).toHaveText("Tools Progress");
    await expect(page.locator("nav.nav-links").getByText("Project Progress", { exact: true })).toHaveCount(0);

    await page.goto(`${failures.server.baseUrl}/admin/tools-progress.html`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Tools Progress" })).toBeVisible();
    await expect(page.locator("[data-tools-progress-next]")).toContainText("What should I build next for the platform?");
    await expect(page.getByText("Project completion belongs in Project Build Path, not here.")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("nav.nav-links").getByText("Project Progress", { exact: true })).toHaveCount(0);

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
