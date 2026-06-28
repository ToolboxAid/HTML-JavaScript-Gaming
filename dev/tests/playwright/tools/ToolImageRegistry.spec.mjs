import { expect, test } from "@playwright/test";
import {
  TOOL_IMAGE_BADGE_ROOT,
  TOOL_IMAGE_FALLBACK,
  TOOL_IMAGE_SIZE_SUFFIX_PATTERN,
  TOOL_IMAGE_TOOL_ROOT,
  getActiveToolRegistry,
  getToolById,
  getToolImageCoverage,
  getToolImageDiagnostics,
  getToolImageSource,
  isApprovedToolImagePath
} from "../../../../www/toolbox/toolRegistry.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const activeTools = getActiveToolRegistry();

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "tool-images",
    surface: "Toolbox registry image contract and image fallback"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

function restoreEnvValue(key, value) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}

async function openRepoPage(page, pathName) {
  const server = await startRepoServer();
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
  const closeServer = server.close.bind(server);
  server.close = async () => {
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
    await closeServer();
  };
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

function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

function resolvedPath(source) {
  return new URL(source, "http://example.test").pathname;
}

test("registry defines approved badge and tool image fields for every active tool", () => {
  expect(activeTools.length).toBeGreaterThan(0);

  for (const tool of activeTools) {
    expect(Object.hasOwn(tool, "hero")).toBe(false);
    expect(typeof tool.badge).toBe("string");
    expect(typeof tool.tool).toBe("string");
    expect(tool.badge.startsWith(TOOL_IMAGE_BADGE_ROOT)).toBe(true);
    expect(tool.tool.startsWith(TOOL_IMAGE_TOOL_ROOT)).toBe(true);
    expect(isApprovedToolImagePath(tool.badge, "badge")).toBe(true);
    expect(isApprovedToolImagePath(tool.tool, "tool")).toBe(true);
    expect(tool.badge).not.toMatch(TOOL_IMAGE_SIZE_SUFFIX_PATTERN);
    expect(tool.tool).not.toMatch(TOOL_IMAGE_SIZE_SUFFIX_PATTERN);
  }
});

test("registry coverage reports complete approved image assets", () => {
  const coverageRows = getToolImageCoverage();
  const coverageById = new Map(coverageRows.map((row) => [row.id, row]));
  const missingRows = coverageRows.filter((row) => row.badgeFallbackUsed || row.toolFallbackUsed);

  expect(coverageRows).toHaveLength(activeTools.length);
  expect(missingRows).toEqual([]);

  for (const tool of activeTools) {
    const coverage = coverageById.get(tool.id);
    expect(coverage).toBeTruthy();
    expect(coverage.badgePath).toBe(tool.badge);
    expect(coverage.toolPath).toBe(tool.tool);
    expect(coverage.badgeExists).toBe(true);
    expect(coverage.toolExists).toBe(true);
    expect(coverage.badgeFallbackUsed).toBe(false);
    expect(coverage.toolFallbackUsed).toBe(false);
    expect(getToolImageSource(tool, "badge")).toBe(tool.badge);
    expect(getToolImageSource(tool, "tool")).toBe(tool.tool);
    expect(getToolImageSource(tool, "badge")).not.toBe(TOOL_IMAGE_FALLBACK);
    expect(getToolImageSource(tool, "tool")).not.toBe(TOOL_IMAGE_FALLBACK);
  }
});

test("registry diagnostics identify missing approved image assets", () => {
  const missingTool = {
    badge: "/assets/theme-v2/images/badges/missing-diagnostic-test.png",
    tool: "/assets/theme-v2/images/tools/missing-diagnostic-test.png"
  };

  expect(getToolImageSource(missingTool, "badge")).toBe(TOOL_IMAGE_FALLBACK);
  expect(getToolImageSource(missingTool, "tool")).toBe(TOOL_IMAGE_FALLBACK);
  expect(getToolImageDiagnostics(missingTool)).toEqual([
    "Badge image missing; fallback shown.",
    "Tool image missing; fallback shown."
  ]);
});

test("Toolbox cards consume registry image sources and expose visible image diagnostics", async ({ page }) => {
  const gameDesign = getToolById("game-design");
  const failures = await openRepoPage(page, "/toolbox/index.html");

  try {
    const card = page.locator("article.control-card").filter({
      has: page.getByRole("heading", { exact: true, name: "Game Design" })
    }).first();
    await expect(card).toBeVisible();
    await expect(card.locator(".card-media img")).toHaveAttribute("src", getToolImageSource(gameDesign, "tool"));
    await expect(card.locator("img[alt='Game Design badge']")).toHaveAttribute("src", getToolImageSource(gameDesign, "badge"));
    await expect(card.locator("[data-tool-image-diagnostic]")).toHaveCount(0);

    await card.locator(".card-media img").evaluate((image) => {
      image.dispatchEvent(new Event("error"));
    });
    await expect(card.locator("[data-tool-image-diagnostic]")).toContainText("Tool image missing; fallback shown.");
    await expect(card.locator(".card-media img")).toHaveAttribute("src", TOOL_IMAGE_FALLBACK);

    await card.locator("img[alt='Game Design badge']").evaluate((image) => {
      image.dispatchEvent(new Event("error"));
    });
    await expect(card.locator("[data-tool-image-diagnostic]")).toContainText("Badge image missing; fallback shown.");
    await expect(card.locator("img[alt='Game Design badge']")).toHaveAttribute("src", TOOL_IMAGE_FALLBACK);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("representative tool pages consume registry images in Tool Display Mode", async ({ page }) => {
  const toolCases = [
    { path: "/toolbox/game-hub/index.html", toolId: "game-hub" },
    { path: "/toolbox/game-design/index.html", toolId: "game-design" },
    { path: "/toolbox/game-configuration/index.html", toolId: "game-configuration" },
    { path: "/toolbox/build-game/index.html", toolId: "build-game" }
  ];
  const failures = await openRepoPage(page, toolCases[0].path);

  try {
    for (const toolCase of toolCases) {
      const tool = getToolById(toolCase.toolId);
      await page.goto(`${failures.server.baseUrl}${toolCase.path}`, { waitUntil: "networkidle" });
      await expect(page.locator("#toolDisplayMode summary > .tool-display-mode__badge")).toBeVisible();
      await expect(page.locator("#toolDisplayMode summary > .tool-display-mode__tool-name")).toHaveText(tool.displayName);
      await expect(page.locator("#toolDisplayMode summary > .tool-display-mode__character")).toBeVisible();
      await expect(page.locator("#toolDisplayMode summary > .tool-display-mode__mode-icon")).toHaveAttribute(
        "data-theme-icon-file",
        "gfs-fullscreen.svg"
      );
      await expect(page.locator(".tool-display-mode__navigation-row")).toHaveCount(0);

      const displayImages = await page.evaluate(() => ({
        badge: document.querySelector(".tool-display-mode__badge")?.src || "",
        tool: document.querySelector(".tool-display-mode__character")?.src || ""
      }));

      expect(resolvedPath(displayImages.badge)).toBe(getToolImageSource(tool, "badge"));
      expect(resolvedPath(displayImages.tool)).toBe(getToolImageSource(tool, "tool"));
    }
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
