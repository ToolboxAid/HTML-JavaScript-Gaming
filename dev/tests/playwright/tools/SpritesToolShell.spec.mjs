import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { getToolRegistrySnapshot } from "../../../../toolbox/toolRegistry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");
const SPRITE_TOOLBAR_PLACEHOLDERS = [
  "Move",
];

function contentTypeForPath(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".js" || extension === ".mjs") return "text/javascript; charset=utf-8";
  if (extension === ".json") return "application/json";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".woff2") return "font/woff2";
  if (extension === ".woff") return "font/woff";
  return "application/octet-stream";
}

function isInsideRepoRoot(absolutePath) {
  const relativePath = path.relative(repoRoot, absolutePath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

function jsonResponse(response, payload) {
  response.statusCode = 200;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}

async function startSpriteShellTestServer() {
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
      const requestOrigin = `http://${request.headers.host}`;

      if (requestUrl.pathname === "/api/public/config") {
        jsonResponse(response, {
          data: {
            publicConfig: {
              apiUrl: `${requestOrigin}/api`,
              environmentLabel: "Playwright",
              siteUrl: requestOrigin,
            },
          },
          ok: true,
        });
        return;
      }

      if (requestUrl.pathname === "/api/toolbox/registry/snapshot") {
        jsonResponse(response, {
          data: getToolRegistrySnapshot(),
          ok: true,
        });
        return;
      }

      if (requestUrl.pathname === "/api/session/current") {
        jsonResponse(response, {
          data: {
            authenticated: false,
            session: null,
            user: null,
          },
          ok: true,
        });
        return;
      }

      if (requestUrl.pathname === "/api/platform-settings/banner") {
        jsonResponse(response, {
          data: {
            banner: null,
            enabled: false,
          },
          ok: true,
        });
        return;
      }

      if (requestUrl.pathname === "/api/toolbox/game-hub/repositories") {
        jsonResponse(response, {
          data: {
            repositoryId: "sprites-shell-playwright",
          },
          ok: true,
        });
        return;
      }

      if (/^\/api\/toolbox\/game-hub\/repositories\/[^/]+\/methods\//.test(requestUrl.pathname)) {
        jsonResponse(response, {
          data: {
            result: null,
          },
          ok: true,
        });
        return;
      }

      if (requestUrl.pathname === "/api/game-journey/completion-metrics") {
        jsonResponse(response, {
          data: {
            metrics: [],
          },
          ok: true,
        });
        return;
      }

      const decodedPath = decodeURIComponent(requestUrl.pathname);
      const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
      const absolutePath = path.resolve(repoRoot, `.${normalizedPath}`);
      if (!isInsideRepoRoot(absolutePath)) {
        response.statusCode = 403;
        response.end("Forbidden");
        return;
      }

      let targetPath = absolutePath;
      const stat = await fs.stat(targetPath).catch(() => null);
      if (stat && stat.isDirectory()) {
        targetPath = path.join(targetPath, "index.html");
      }

      const responseContents = await fs.readFile(targetPath);
      response.statusCode = 200;
      response.setHeader("Content-Type", contentTypeForPath(targetPath));
      response.end(responseContents);
    } catch {
      response.statusCode = 404;
      response.end("Not Found");
    }
  });

  await new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => resolve());
    server.on("error", reject);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to start Sprite Creator shell test server.");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: async () => {
      await new Promise((resolve, reject) => {
        const forceClose = setTimeout(() => {
          server.closeAllConnections?.();
        }, 250);
        server.close((error) => {
          clearTimeout(forceClose);
          if (error) reject(error);
          else resolve();
        });
        server.closeIdleConnections?.();
      });
    },
  };
}

function collectPageFailures(page) {
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];

  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`FAILED ${request.url()}`);
  });
  page.on("pageerror", (error) => {
    const text = error.stack || error.message;
    if (!isBrowserExtensionNoise(text)) {
      pageErrors.push(error.message);
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error" && !isBrowserExtensionNoise(message.text())) {
      consoleErrors.push(message.text());
    }
  });

  return { consoleErrors, failedRequests, pageErrors };
}

function spriteCell(page, row, column) {
  return page.locator(`[data-sprite-pixel-row="${row}"][data-sprite-pixel-column="${column}"]`);
}

async function previewCellHasPaint(page, row, column) {
  const gridSize = Number(await page.locator("[data-sprites-pixel-grid]").getAttribute("data-sprites-grid-size"));
  return page.locator("[data-sprites-preview-canvas]").evaluate((canvas, coordinates) => {
    const context = canvas.getContext("2d");
    if (!context || !Number.isFinite(coordinates.gridSize) || coordinates.gridSize <= 0) {
      return false;
    }
    const cellSize = canvas.width / coordinates.gridSize;
    const x = Math.max(0, Math.min(canvas.width - 1, Math.floor((coordinates.column - 0.5) * cellSize)));
    const y = Math.max(0, Math.min(canvas.height - 1, Math.floor((coordinates.row - 0.5) * cellSize)));
    return context.getImageData(x, y, 1, 1).data[3] > 0;
  }, { column, gridSize, row });
}

async function expectCenterAndPreviewPainted(page, row, column, colorClass = null) {
  const cell = spriteCell(page, row, column);
  await expect(cell).toHaveClass(/is-painted/);
  if (colorClass) {
    await expect(cell).toHaveClass(new RegExp(colorClass));
  }
  expect(await previewCellHasPaint(page, row, column)).toBe(true);
}

async function expectCenterAndPreviewEmpty(page, row, column) {
  await expect(spriteCell(page, row, column)).not.toHaveClass(/is-painted/);
  expect(await previewCellHasPaint(page, row, column)).toBe(false);
}

test("Sprite Creator shell loads with visible tool, canvas, details, and status regions", async ({ page }) => {
  const server = await startSpriteShellTestServer();
  const failures = collectPageFailures(page);

  try {
    await page.goto(`${server.baseUrl}/toolbox/sprites/index.html`, { waitUntil: "networkidle" });

    await expect(page).toHaveTitle(/Sprite Creator - GameFoundryStudio/);
    await expect(page.getByRole("heading", { level: 1, name: "Sprite Creator" })).toBeVisible();
    await expect(page.locator("[data-sprites-tools-panel]")).toBeVisible();
    await expect(page.locator("[data-sprites-work-area]")).toBeVisible();
    await expect(page.locator("[data-sprites-details-panel]")).toBeVisible();
    await expect(page.locator("[data-sprites-footer-status]")).toBeVisible();
    await expect(page.locator("main")).toContainText("Choose a drawing action for the current unsaved sprite draft.");
    await expect(page.locator("main")).toContainText("Saving to the sprite library remains deferred");
    await expect(page.locator("[data-sprites-tools-panel]")).toContainText("Sprite Tools");
    await expect(page.getByText("Drawing Tools", { exact: true })).toBeVisible();
    await expect(page.getByText("Canvas Setup", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Pixel Work Area" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Sprite Details" })).toBeVisible();
    await expect(page.locator("[data-sprites-toolbar]")).toBeVisible();
    await expect(page.getByRole("button", { name: "Pencil tool" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Eraser tool" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Fill tool" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Line tool" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Rectangle tool" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Circle tool" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Picker tool" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Zoom tool" })).toBeEnabled();
    for (const toolName of SPRITE_TOOLBAR_PLACEHOLDERS) {
      await expect(page.getByRole("button", { name: `${toolName} tool placeholder` })).toBeDisabled();
    }
    await expect(page.locator("[data-sprites-tool-status]")).toContainText("Pencil is active");
    await expect(page.locator("[data-sprites-palette-panel]")).toBeVisible();
    await expect(page.locator("[data-sprites-palette-status]")).toContainText("Active editor color: Ink");
    await expect(page.locator("[data-sprites-pixel-grid]")).toBeVisible();
    await expect(page.locator("[data-sprites-pixel-grid] [role='gridcell']")).toHaveCount(256);
    await expect(page.locator("[data-sprites-grid-status]")).toContainText("Canvas display mode: 16x16");
    await expect(page.locator("[data-sprites-zoom-status]")).toContainText("100%");
    await page.getByRole("button", { name: "32x32" }).click();
    await expect(page.locator("[data-sprites-pixel-grid]")).toHaveAttribute("aria-label", "Sprite Creator 32 by 32 pixel canvas");
    await expect(page.locator("[data-sprites-pixel-grid] [role='gridcell']")).toHaveCount(1024);
    await expect(page.locator("[data-sprites-grid-status]")).toContainText("Canvas display mode: 32x32");
    await expect(page.getByRole("button", { name: "32x32" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Undo" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Redo" })).toBeDisabled();
    const firstPixel = page.locator("[data-sprites-pixel-grid] [role='gridcell']").first();
    await firstPixel.click();
    await expect(firstPixel).toHaveClass(/is-painted/);
    await expect(page.locator("[data-sprites-draft-status]")).toContainText("1 draft pixel painted");
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(firstPixel).not.toHaveClass(/is-painted/);
    await expect(page.getByRole("button", { name: "Redo" })).toBeEnabled();
    await page.getByRole("button", { name: "Redo" }).click();
    await expect(firstPixel).toHaveClass(/is-painted/);
    await page.getByRole("button", { name: "Eraser tool" }).click();
    await firstPixel.click();
    await expect(firstPixel).not.toHaveClass(/is-painted/);
    await expect(page.locator("[data-sprites-draft-status]")).toContainText("empty draft");
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(firstPixel).toHaveClass(/is-painted/);
    await page.getByRole("button", { name: "Redo" }).click();
    await expect(firstPixel).not.toHaveClass(/is-painted/);
    await page.getByRole("button", { name: "Gold editor color" }).click();
    await expect(page.locator("[data-sprites-palette-status]")).toContainText("Active editor color: Gold");
    await page.getByRole("button", { name: "Pencil tool" }).click();
    await firstPixel.click();
    await expect(firstPixel).toHaveClass(/sprite-canvas-cell--gold/);
    await page.getByRole("button", { name: "Blue editor color" }).click();
    await page.getByRole("button", { name: "Picker tool" }).click();
    await firstPixel.click();
    await expect(page.locator("[data-sprites-palette-status]")).toContainText("Active editor color: Gold");
    await expect(page.locator("[data-sprites-tool-status]")).toContainText("Picker selected Gold");
    await page.getByRole("button", { name: "Blue editor color" }).click();
    await page.getByRole("button", { name: "Fill tool" }).click();
    await expect(page.locator("[data-sprites-pixel-grid] .is-painted")).toHaveCount(1024);
    await expect(page.locator("[data-sprites-pixel-grid] .sprite-canvas-cell--blue")).toHaveCount(1024);
    await expect(page.locator("[data-sprites-draft-status]")).toContainText("1024 draft pixels painted");
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(page.locator("[data-sprites-pixel-grid] .is-painted")).toHaveCount(1);
    await page.getByRole("button", { name: "Redo" }).click();
    await expect(page.locator("[data-sprites-pixel-grid] .is-painted")).toHaveCount(1024);
    await page.getByRole("button", { name: "Clear Canvas" }).click();
    await expect(page.locator("[data-sprites-pixel-grid] .is-painted")).toHaveCount(0);
    await expect(page.locator("[data-sprites-draft-status]")).toContainText("empty draft");
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(page.locator("[data-sprites-pixel-grid] .is-painted")).toHaveCount(1024);
    await page.getByRole("button", { name: "Redo" }).click();
    await expect(page.locator("[data-sprites-pixel-grid] .is-painted")).toHaveCount(0);
    await page.getByRole("button", { name: "Fill tool" }).click();
    await expect(page.locator("[data-sprites-pixel-grid] .is-painted")).toHaveCount(1024);
    await page.getByRole("button", { name: "Reset to 16x16" }).click();
    await expect(page.locator("[data-sprites-pixel-grid]")).toHaveAttribute("aria-label", "Sprite Creator 16 by 16 pixel canvas");
    await expect(page.locator("[data-sprites-pixel-grid] [role='gridcell']")).toHaveCount(256);
    await expect(page.locator("[data-sprites-pixel-grid] .is-painted")).toHaveCount(0);
    await expect(page.locator("[data-sprites-draft-status]")).toContainText("empty draft");
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(page.locator("[data-sprites-pixel-grid]")).toHaveAttribute("aria-label", "Sprite Creator 32 by 32 pixel canvas");
    await expect(page.locator("[data-sprites-pixel-grid] .is-painted")).toHaveCount(1024);
    await page.getByRole("button", { name: "Redo" }).click();
    await expect(page.locator("[data-sprites-pixel-grid]")).toHaveAttribute("aria-label", "Sprite Creator 16 by 16 pixel canvas");
    await expect(page.locator("[data-sprites-pixel-grid] .is-painted")).toHaveCount(0);
    await page.getByRole("button", { name: "Blue editor color" }).click();
    await page.getByRole("button", { name: "Fill tool" }).click();
    await expect(page.locator("[data-sprites-pixel-grid] .is-painted")).toHaveCount(256);
    await page.getByRole("button", { name: "Zoom tool" }).click();
    await page.getByRole("button", { name: "200%" }).click();
    await expect(page.locator("[data-sprites-grid-shell]")).toHaveAttribute("data-sprites-zoom-level", "2");
    await expect(page.locator("[data-sprites-zoom-status]")).toContainText("200%");
    await page.getByRole("button", { name: "400%" }).click();
    await expect(page.locator("[data-sprites-grid-shell]")).toHaveAttribute("data-sprites-zoom-level", "4");
    await expect(page.locator("[data-sprites-zoom-status]")).toContainText("400%");
    await page.getByRole("button", { name: "100%" }).click();
    await expect(page.locator("[data-sprites-grid-shell]")).toHaveAttribute("data-sprites-zoom-level", "1");
    const gridCells = page.locator("[data-sprites-pixel-grid] [role='gridcell']");
    await page.getByRole("button", { name: "Clear Canvas" }).click();
    await page.getByRole("button", { name: "Green editor color" }).click();
    await page.getByRole("button", { name: "Line tool" }).click();
    await gridCells.nth(0).click();
    await expect(page.locator("[data-sprites-tool-status]")).toContainText("Line start selected");
    await gridCells.nth(5).click();
    await expect(page.locator("[data-sprites-tool-status]")).toContainText("Line added");
    await expect(page.locator("[data-sprites-pixel-grid] .is-painted")).toHaveCount(6);
    await page.getByRole("button", { name: "Clear Canvas" }).click();
    await page.getByRole("button", { name: "Rectangle tool" }).click();
    await gridCells.nth(0).click();
    await gridCells.nth(34).click();
    await expect(page.locator("[data-sprites-tool-status]")).toContainText("Rectangle added");
    await expect(page.locator("[data-sprites-pixel-grid] .is-painted")).toHaveCount(8);
    await page.getByRole("button", { name: "Clear Canvas" }).click();
    await page.getByRole("button", { name: "Circle tool" }).click();
    await gridCells.nth(68).click();
    await gridCells.nth(71).click();
    await expect(page.locator("[data-sprites-tool-status]")).toContainText("Circle added");
    const circlePaintedCount = await page.locator("[data-sprites-pixel-grid] .is-painted").count();
    expect(circlePaintedCount).toBeGreaterThan(8);
    await expect(page.locator("[data-sprites-preview-canvas]")).toBeVisible();
    const previewHasPaint = await page.locator("[data-sprites-preview-canvas]").evaluate((canvas) => {
      const context = canvas.getContext("2d");
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let index = 3; index < imageData.length; index += 4) {
        if (imageData[index] > 0) {
          return true;
        }
      }
      return false;
    });
    expect(previewHasPaint).toBe(true);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download PNG" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("sprite-creator-draft.png");
    await expect(page.locator("[data-sprites-export-status]")).toContainText("PNG downloaded");
    await expect(page.locator("[data-sprites-shell-status]")).toContainText("Editor ready");
    await expect(page.locator("main")).toContainText("Palette/Colors remains the reusable color source");
    await expect(page.locator("main")).not.toContainText(/Not implemented yet|future rebuild work|Static wireframe only|Plan sprite creation|later editor slice/i);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);

    expect(failures.failedRequests).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  } finally {
    await server.close();
  }
});

test("Sprite Creator keeps center canvas and right preview in sync", async ({ page }) => {
  const server = await startSpriteShellTestServer();
  const failures = collectPageFailures(page);

  try {
    await page.goto(`${server.baseUrl}/toolbox/sprites/index.html`, { waitUntil: "networkidle" });

    await spriteCell(page, 1, 1).click();
    await expectCenterAndPreviewPainted(page, 1, 1, "sprite-canvas-cell--ink");

    await page.getByRole("button", { name: "Eraser tool" }).click();
    await spriteCell(page, 1, 1).click();
    await expectCenterAndPreviewEmpty(page, 1, 1);

    await page.getByRole("button", { name: "Blue editor color" }).click();
    await page.getByRole("button", { name: "Fill tool" }).click();
    await expectCenterAndPreviewPainted(page, 1, 1, "sprite-canvas-cell--blue");

    await page.getByRole("button", { name: "Clear Canvas" }).click();
    await expectCenterAndPreviewEmpty(page, 1, 1);

    await page.getByRole("button", { name: "Undo" }).click();
    await expectCenterAndPreviewPainted(page, 1, 1, "sprite-canvas-cell--blue");

    await page.getByRole("button", { name: "Redo" }).click();
    await expectCenterAndPreviewEmpty(page, 1, 1);

    await page.getByRole("button", { name: "Gold editor color" }).click();
    await page.getByRole("button", { name: "Pencil tool" }).click();
    await spriteCell(page, 2, 2).click();
    await expectCenterAndPreviewPainted(page, 2, 2, "sprite-canvas-cell--gold");
    await page.getByRole("button", { name: "Blue editor color" }).click();
    await page.getByRole("button", { name: "Picker tool" }).click();
    await spriteCell(page, 2, 2).click();
    await expect(page.locator("[data-sprites-palette-status]")).toContainText("Active editor color: Gold");
    await expectCenterAndPreviewPainted(page, 2, 2, "sprite-canvas-cell--gold");

    await page.getByRole("button", { name: "Zoom tool" }).click();
    await page.getByRole("button", { name: "200%" }).click();
    await expect(page.locator("[data-sprites-grid-shell]")).toHaveAttribute("data-sprites-zoom-level", "2");
    await expectCenterAndPreviewPainted(page, 2, 2, "sprite-canvas-cell--gold");

    await page.getByRole("button", { name: "Clear Canvas" }).click();
    await page.getByRole("button", { name: "Green editor color" }).click();
    await page.getByRole("button", { name: "Line tool" }).click();
    await spriteCell(page, 1, 1).click();
    await spriteCell(page, 1, 4).click();
    await expectCenterAndPreviewPainted(page, 1, 2, "sprite-canvas-cell--green");

    await page.getByRole("button", { name: "Clear Canvas" }).click();
    await page.getByRole("button", { name: "Rectangle tool" }).click();
    await spriteCell(page, 2, 2).click();
    await spriteCell(page, 4, 4).click();
    await expectCenterAndPreviewPainted(page, 2, 3, "sprite-canvas-cell--green");

    await page.getByRole("button", { name: "Clear Canvas" }).click();
    await page.getByRole("button", { name: "Circle tool" }).click();
    await spriteCell(page, 8, 8).click();
    await spriteCell(page, 8, 11).click();
    await expectCenterAndPreviewPainted(page, 8, 11, "sprite-canvas-cell--green");

    expect(failures.failedRequests).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  } finally {
    await server.close();
  }
});
