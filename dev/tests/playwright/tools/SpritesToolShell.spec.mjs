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
  "Line",
  "Rectangle",
  "Circle",
  "Picker",
  "Move",
  "Zoom",
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
    await expect(page.locator("[data-sprites-tools-panel]")).toContainText("Sprite Tools");
    await expect(page.getByText("Drawing Tools")).toBeVisible();
    await expect(page.getByText("Canvas Setup")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Pixel Work Area" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Sprite Details" })).toBeVisible();
    await expect(page.locator("[data-sprites-toolbar]")).toBeVisible();
    await expect(page.getByRole("button", { name: "Pencil tool" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Eraser tool" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Fill tool" })).toBeEnabled();
    for (const toolName of SPRITE_TOOLBAR_PLACEHOLDERS) {
      await expect(page.getByRole("button", { name: `${toolName} tool placeholder` })).toBeDisabled();
    }
    await expect(page.locator("[data-sprites-tool-status]")).toContainText("Pencil is active");
    await expect(page.locator("[data-sprites-pixel-grid]")).toBeVisible();
    await expect(page.locator("[data-sprites-pixel-grid] [role='gridcell']")).toHaveCount(256);
    await expect(page.locator("[data-sprites-grid-status]")).toContainText("Canvas display mode: 16x16");
    await page.getByRole("button", { name: "32x32" }).click();
    await expect(page.locator("[data-sprites-pixel-grid]")).toHaveAttribute("aria-label", "Sprite Creator 32 by 32 pixel canvas");
    await expect(page.locator("[data-sprites-pixel-grid] [role='gridcell']")).toHaveCount(1024);
    await expect(page.locator("[data-sprites-grid-status]")).toContainText("Canvas display mode: 32x32");
    await expect(page.getByRole("button", { name: "32x32" })).toHaveAttribute("aria-pressed", "true");
    const firstPixel = page.locator("[data-sprites-pixel-grid] [role='gridcell']").first();
    await firstPixel.click();
    await expect(firstPixel).toHaveClass(/is-painted/);
    await expect(page.locator("[data-sprites-draft-status]")).toContainText("1 draft pixel painted");
    await page.getByRole("button", { name: "Eraser tool" }).click();
    await firstPixel.click();
    await expect(firstPixel).not.toHaveClass(/is-painted/);
    await expect(page.locator("[data-sprites-draft-status]")).toContainText("empty draft");
    await page.getByRole("button", { name: "Fill tool" }).click();
    await expect(page.locator("[data-sprites-pixel-grid] .is-painted")).toHaveCount(1024);
    await expect(page.locator("[data-sprites-draft-status]")).toContainText("1024 draft pixels painted");
    await expect(page.locator("[data-sprites-shell-status]")).toContainText("Editor ready");
    await expect(page.locator("main")).toContainText("Palette/Colors keys only");
    await expect(page.locator("main")).not.toContainText(/Not implemented yet|future rebuild work|Static wireframe only|Plan sprite creation/i);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);

    expect(failures.failedRequests).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  } finally {
    await server.close();
  }
});
