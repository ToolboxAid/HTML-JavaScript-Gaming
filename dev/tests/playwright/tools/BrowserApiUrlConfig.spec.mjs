import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { expect, test } from "@playwright/test";
import { startLocalApiServer } from "../../../../api/server/local-api-server.mjs";
import { SEED_DB_KEYS } from "../../../../api/seed/seed-db-keys.mjs";
import { resolveStaticRouteTarget } from "../../../../api/server/static-web-root.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const LIVE_SERVER_ORIGIN = "http://127.0.0.1:5500";
const LOCAL_API_ORIGIN = "http://127.0.0.1:5501";
const LOCAL_API_URL = `${LOCAL_API_ORIGIN}/api`;

const PUBLIC_API_ENV = Object.freeze({
  GAMEFOUNDRY_API_URL: LOCAL_API_URL,
  GAMEFOUNDRY_ENVIRONMENT_LABEL: "Development Environment",
  GAMEFOUNDRY_SITE_URL: LOCAL_API_ORIGIN,
});

let localDbRunId = 0;

function nextLocalDbStoragePath() {
  localDbRunId += 1;
  return path.join(process.cwd(), "dev", "workspace", "tmp", "local-db", `browser-api-url-config-${process.pid}-${localDbRunId}.local-db-state`);
}

function contentTypeForPath(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".js" || extension === ".mjs") return "text/javascript; charset=utf-8";
  if (extension === ".json") return "application/json; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  return "application/octet-stream";
}

async function withEnv(nextEnv, callback) {
  const previousEnv = {};
  Object.keys(nextEnv).forEach((key) => {
    previousEnv[key] = process.env[key];
    process.env[key] = nextEnv[key];
  });
  try {
    return await callback();
  } finally {
    Object.entries(previousEnv).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  }
}

async function startStaticLiveServer() {
  const repoRoot = process.cwd();
  const server = http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url || "/", LIVE_SERVER_ORIGIN);
    if (requestUrl.pathname.startsWith("/api/")) {
      response.statusCode = 404;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ ok: false, error: "Static Live Server does not serve API routes." }));
      return;
    }
    const decodedPath = decodeURIComponent(requestUrl.pathname);
    const { targetPath } = await resolveStaticRouteTarget({ decodedPath, repoRoot });
    const contents = targetPath ? await fs.readFile(targetPath).catch(() => null) : null;
    if (!contents) {
      response.statusCode = 404;
      response.end("Not Found");
      return;
    }
    response.statusCode = 200;
    response.setHeader("Content-Type", contentTypeForPath(targetPath));
    response.end(contents);
  });

  try {
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(5500, "127.0.0.1", resolve);
    });
  } catch (error) {
    if (error?.code !== "EADDRINUSE") {
      throw error;
    }
    const response = await fetch(`${LIVE_SERVER_ORIGIN}/account/sign-in.html`).catch(() => null);
    if (!response?.ok) {
      throw error;
    }
    return {
      baseUrl: LIVE_SERVER_ORIGIN,
      close: async () => {},
    };
  }

  return {
    baseUrl: LIVE_SERVER_ORIGIN,
    close: async () => {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    },
  };
}

async function startLocalApiForConfig() {
  try {
    return await startLocalApiServer({ host: "127.0.0.1", port: 5501 });
  } catch (error) {
    if (error?.code !== "EADDRINUSE") {
      throw error;
    }
    const response = await fetch(`${LOCAL_API_ORIGIN}/api/public/config`).catch(() => null);
    if (!response?.ok) {
      throw error;
    }
    return {
      baseUrl: LOCAL_API_ORIGIN,
      close: async () => {},
    };
  }
}

async function startFakeSupabaseAuthServer() {
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    if (requestUrl.pathname === "/auth/v1/health") {
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }
    response.end(JSON.stringify([]));
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Unable to start fake Supabase Auth server.");
  }
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: async () => {
      await new Promise((resolve) => {
        server.closeAllConnections?.();
        server.close(resolve);
      });
    },
  };
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("Live Server 5500 pages use configured apiUrl for auth, Admin, and Owner APIs", async ({ page }) => {
  const localDbStoragePath = nextLocalDbStoragePath();
  const fakeSupabase = await startFakeSupabaseAuthServer();
  try {
    await withEnv({
      ...PUBLIC_API_ENV,
      GAMEFOUNDRY_LOCAL_DB_PATH: localDbStoragePath,
      GAMEFOUNDRY_SUPABASE_ANON_KEY: "browser-api-url-config-anon",
      GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "browser-api-url-config-service-role",
      GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
    }, async () => {
      const apiServer = await startLocalApiForConfig();
      const staticServer = await startStaticLiveServer();
      const requests = [];
      const failedAuthRequests = [];

      page.on("request", (request) => {
        const url = request.url();
        if (url.includes("/api/")) {
          requests.push(url);
        }
      });
      page.on("response", (response) => {
        const url = response.url();
        if (response.status() >= 400 && /\/api\/auth\//.test(url)) {
          failedAuthRequests.push(`${response.status()} ${url}`);
        }
      });
      page.on("requestfailed", (request) => {
        const url = request.url();
        if (/\/api\/auth\//.test(url)) {
          failedAuthRequests.push(`FAILED ${url}`);
        }
      });

      try {
        await fetch(`${apiServer.baseUrl}/api/local-db/seed`, { method: "POST" });
        await workspaceV2CoverageReporter.start(page);
        const authStatusResponse = page.waitForResponse(`${LOCAL_API_URL}/auth/status`);
        await page.goto(`${staticServer.baseUrl}/account/sign-in.html`, { waitUntil: "networkidle" });
        expect((await authStatusResponse).ok()).toBe(true);
        await expect(page.getByRole("heading", { name: "Sign In", level: 1 })).toBeVisible();
        await expect(page.locator("[data-login-status]")).toHaveText("Account service is available.");
        expect(requests).toContain(`${LOCAL_API_URL}/auth/status`);
        expect(requests).not.toContain(`${LIVE_SERVER_ORIGIN}/api/auth/status`);
        expect(failedAuthRequests).toEqual([]);

        await fetch(`${apiServer.baseUrl}/api/session/user`, {
          body: JSON.stringify({ userKey: SEED_DB_KEYS.users.admin }),
          headers: { "content-type": "application/json" },
          method: "POST",
        });
        const adminStatusResponse = page.waitForResponse(`${LOCAL_API_URL}/admin/system-health/status`);
        await page.goto(`${staticServer.baseUrl}/admin/system-health.html`, { waitUntil: "networkidle" });
        expect((await adminStatusResponse).ok()).toBe(true);
        await expect(page.getByRole("heading", { name: "System Health", level: 1 })).toBeVisible();
        expect(requests).toContain(`${LOCAL_API_URL}/admin/system-health/status`);
        expect(requests).not.toContain(`${LIVE_SERVER_ORIGIN}/api/admin/system-health/status`);

        const ownerSettingsResponse = page.waitForResponse(`${LOCAL_API_URL}/owner/memberships/settings`);
        await page.goto(`${staticServer.baseUrl}/owner/memberships.html`, { waitUntil: "networkidle" });
        expect((await ownerSettingsResponse).ok()).toBe(true);
        await expect(page.getByRole("heading", { name: "Memberships", level: 1 })).toBeVisible();
        expect(requests).toContain(`${LOCAL_API_URL}/owner/memberships/settings`);
        expect(requests).not.toContain(`${LIVE_SERVER_ORIGIN}/api/owner/memberships/settings`);
        expect(requests.filter((url) => url.startsWith(`${LIVE_SERVER_ORIGIN}/api/`))).toEqual([]);
      } finally {
        await workspaceV2CoverageReporter.stop(page);
        await staticServer.close();
        await apiServer.close();
        await fs.rm(localDbStoragePath, { force: true });
      }
    });
  } finally {
    await fakeSupabase.close();
  }
});
