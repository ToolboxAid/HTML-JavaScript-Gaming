import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

function contentTypeForPath(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".js" || extension === ".mjs") return "text/javascript; charset=utf-8";
  if (extension === ".json") return "application/json; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

async function startStaticOnlyServer() {
  const repoRoot = process.cwd();
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
      const decodedPath = decodeURIComponent(requestUrl.pathname);
      const absolutePath = path.resolve(repoRoot, `.${path.normalize(decodedPath)}`);
      const relativePath = path.relative(repoRoot, absolutePath);
      if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        response.statusCode = 403;
        response.end("Forbidden");
        return;
      }
      let targetPath = absolutePath;
      const stat = await fs.stat(targetPath).catch(() => null);
      if (stat && stat.isDirectory()) {
        targetPath = path.join(targetPath, "index.html");
      }
      const fileContents = await fs.readFile(targetPath);
      response.statusCode = 200;
      response.setHeader("Content-Type", contentTypeForPath(targetPath));
      response.end(fileContents);
    } catch {
      response.statusCode = 404;
      response.end("Not Found");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to start static-only test server.");
  }
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: async () => {
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("static-only login keeps Local Mem clickable and diagnoses Local DB API requirement", async ({ page }) => {
  const server = await startStaticOnlyServer();
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

  try {
    await workspaceV2CoverageReporter.start(page);
    await page.goto(`${server.baseUrl}/login.html`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Login", level: 1 })).toBeVisible();
    await expect(page.locator("[data-login-mode]")).toHaveText(["Local Mem", "Local DB"]);
    await expect(page.locator("[data-login-mode='local-mem']")).toBeEnabled();
    await expect(page.locator("[data-login-mode='local-db']")).toBeEnabled();
    await expect(page.locator("[data-login-mode='local-mem']")).toHaveClass(/primary/);
    await expect(page.locator("[data-login-mode-title]")).toHaveText("Local Mem");
    await expect(page.locator("[data-login-mode-status]")).toContainText("Static-only server detected");
    await expect(page.locator("[data-login-mode-status]")).toContainText("API-backed local server");
    await expect(page.locator("[data-login-user]")).toHaveCount(0);
    await expect(page.locator("[data-login-user-status]")).toContainText("No local users are available");
    await expect(page.getByRole("button", { name: "UAT" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Prod" })).toHaveCount(0);

    await page.locator("[data-login-mode='local-mem']").click();
    await expect(page.locator("[data-login-mode='local-mem']")).toHaveClass(/primary/);
    await expect(page.locator("[data-login-mode-status]")).toContainText("Local Mem selection remains available");

    await page.locator("[data-login-mode='local-db']").click();
    await expect(page.locator("[data-login-mode='local-db']")).toHaveClass(/primary/);
    await expect(page.locator("[data-login-mode-title]")).toHaveText("Local DB");
    await expect(page.locator("[data-login-mode-status]")).toContainText("Local DB requires the API-backed local server");
    await expect(page.locator("[data-login-mode-status]")).toContainText("SQLite-backed Local DB");

    expect(failedRequests.some((request) => request.includes("/api/session/current"))).toBe(true);
    expect(failedRequests.filter((request) => request.includes("/api/session/mode"))).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors.filter((message) => !message.includes("Failed to load resource"))).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
