import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const STATIC_LOCAL_PORT = 5500;

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
    server.listen(STATIC_LOCAL_PORT, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to start static-only 127.0.0.1:5500 test server.");
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

test("static 127.0.0.1:5500 login requires the API-backed local server", async ({ page }) => {
  const server = await startStaticOnlyServer();
  const requests = [];
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];

  page.on("request", (request) => {
    requests.push(request.url());
  });
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
    await page.goto(`${server.baseUrl}/account/sign-in.html`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Sign In", level: 1 })).toBeVisible();
    await expect(page.locator("[data-login-mode]")).toHaveText(["Local DB"]);
    await expect(page.locator("[data-login-mode='local-mem']")).toHaveCount(0);
    await expect(page.locator("[data-login-mode='local-db']")).toBeDisabled();
    await expect(page.locator("[data-login-mode='local-db']")).not.toHaveClass(/primary/);
    await expect(page.locator("[data-login-mode-disabled-message]")).toBeVisible();
    await expect(page.locator("[data-login-mode-disabled-message]")).toContainText("Use the API-backed local server for sign-in.");
    await expect(page.locator("[data-login-mode-disabled-message]")).toContainText("npm run dev:local-api");
    await expect(page.locator("[data-login-mode-disabled-message]")).toContainText("http://127.0.0.1:5501/account/sign-in.html");
    await expect(page.locator("[data-login-mode-disabled-message]")).toContainText("Local DB is disabled");
    await expect(page.locator("[data-login-mode-title]")).toHaveText("Session API required");
    await expect(page.locator("[data-login-mode-description]")).toContainText("Start the API-backed local server");
    await expect(page.locator("[data-login-mode-status]")).toContainText("Sign-in/session diagnostic");
    await expect(page.locator("[data-login-mode-status]")).toContainText("Use the API-backed local server for sign-in.");
    await expect(page.locator("[data-login-mode-status]")).toContainText("npm run dev:local-api");
    await expect(page.locator("[data-login-mode-status]")).toContainText("http://127.0.0.1:5501/account/sign-in.html");
    await expect(page.locator("main hr")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Local Development Status", level: 2 })).toBeVisible();
    await expect(page.locator("[data-login-status-current-url]")).toContainText(`${server.baseUrl}/account/sign-in.html`);
    await expect(page.locator("[data-login-status-server-mode]")).toHaveText("Static-only local server");
    await expect(page.locator("[data-login-status-api]")).toContainText("Unavailable");
    await expect(page.locator("[data-login-status-disabled-reason]")).toContainText("Local DB is disabled");
    await expect(page.locator("[data-login-status-disabled-reason]")).toContainText("npm run dev:local-api");
    await expect(page.locator("[data-login-status-disabled-reason]")).toContainText("http://127.0.0.1:5501/account/sign-in.html");
    await expect(page.locator("[data-login-status-endpoint]")).toHaveText("/api/session/current");
    await expect(page.locator("[data-login-status-api-url]")).toHaveText("http://127.0.0.1:5501/account/sign-in.html");
    await expect(page.locator("[data-login-status-command]")).toHaveText("npm run dev:local-api");
    await expect(page.locator("[data-login-user]")).toHaveCount(0);
    await expect(page.locator("[data-login-user-status]")).toContainText("No local users are available until /api/session responds");
    await expect(page.getByRole("button", { name: "UAT" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Prod" })).toHaveCount(0);

    expect(requests.filter((request) => request.includes("/api/session/current"))).toEqual([]);
    expect(requests.filter((request) => request.includes("/api/session/"))).toEqual([]);
    expect(failedRequests.filter((request) => request.includes("/api/session/current"))).toEqual([]);
    expect(failedRequests.filter((request) => request.includes("/api/session/mode"))).toEqual([]);
    expect(failedRequests.filter((request) => request.includes("/api/session/users"))).toEqual([]);
    expect(failedRequests.filter((request) => request.includes("/api/session/modes"))).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect([...pageErrors, ...consoleErrors].filter((message) => /ShowOneChild|showOneChild|ActionableCoachmark/.test(message))).toEqual([]);
    expect(consoleErrors.filter((message) => !message.includes("Failed to load resource"))).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
