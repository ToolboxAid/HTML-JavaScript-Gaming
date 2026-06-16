import { expect, test } from "@playwright/test";
import http from "node:http";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const AUTH_ENV_KEYS = Object.freeze([
  "GAMEFOUNDRY_SUPABASE_ANON_KEY",
  "GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY",
  "GAMEFOUNDRY_SUPABASE_URL",
]);

function authUserIdForEmail(email) {
  return `supabase-${String(email || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function restoreEnv(previousEnv) {
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function useFakeSupabaseEnv(baseUrl) {
  const previousEnv = Object.fromEntries(AUTH_ENV_KEYS.map((key) => [key, process.env[key]]));
  process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY = "playwright-anon-key";
  process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY = "playwright-service-role-key";
  process.env.GAMEFOUNDRY_SUPABASE_URL = baseUrl;
  return () => restoreEnv(previousEnv);
}

function startFakeSupabaseAuthServer() {
  const identityTables = {
    roles: [],
    user_roles: [],
    users: [],
  };
  const calls = [];
  const server = http.createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString("utf8");
    const body = rawBody ? JSON.parse(rawBody) : {};
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
    calls.push({
      headers: request.headers,
      method: request.method,
      path: `${requestUrl.pathname}${requestUrl.search}`,
    });
    response.setHeader("Content-Type", "application/json; charset=utf-8");

    if (requestUrl.pathname === "/auth/v1/health") {
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }

    if (requestUrl.pathname === "/auth/v1/admin/users") {
      response.end(JSON.stringify({
        user: {
          email: body.email,
          id: authUserIdForEmail(body.email),
        },
      }));
      return;
    }

    if (requestUrl.pathname === "/auth/v1/token") {
      response.end(JSON.stringify({
        access_token: "fake-playwright-access-token",
        refresh_token: "fake-playwright-refresh-token",
        token_type: "bearer",
        user: {
          email: body.email,
          id: authUserIdForEmail(body.email),
        },
      }));
      return;
    }

    if (requestUrl.pathname.startsWith("/rest/v1/")) {
      const tableName = decodeURIComponent(requestUrl.pathname.split("/").pop() || "");
      if (request.method === "POST") {
        const rows = Array.isArray(body) ? body : [body];
        identityTables[tableName] = identityTables[tableName] || [];
        rows.forEach((row) => {
          const rowIndex = identityTables[tableName].findIndex((record) => record.key === row.key);
          if (rowIndex === -1) {
            identityTables[tableName].push(row);
            return;
          }
          identityTables[tableName][rowIndex] = {
            ...identityTables[tableName][rowIndex],
            ...row,
          };
        });
        response.end(JSON.stringify(rows));
        return;
      }
      response.end(JSON.stringify(identityTables[tableName] || []));
      return;
    }

    response.statusCode = 404;
    response.end(JSON.stringify({ message: "Not Found" }));
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start fake Supabase server."));
        return;
      }
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        calls,
        close: () => new Promise((closeResolve) => {
          server.closeAllConnections?.();
          server.close(closeResolve);
        }),
      });
    });
  });
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("account sign in resolves Supabase-backed session through the local API", async ({ page }) => {
  const fakeSupabase = await startFakeSupabaseAuthServer();
  const restoreAuthEnv = useFakeSupabaseEnv(fakeSupabase.baseUrl);
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
    if (response.status() >= 400 && response.url().startsWith(server.baseUrl)) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    if (request.url().startsWith(server.baseUrl)) {
      failedRequests.push(`FAILED ${request.url()}`);
    }
  });

  try {
    await workspaceV2CoverageReporter.start(page);
    const email = `playwright-sign-in-${Date.now()}@example.test`;
    const password = "Playwright-Supabase-Dev!42";

    await page.goto(`${server.baseUrl}/account/create-account.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-account-auth-submit]")).toBeEnabled();
    const createAccountResponse = page.waitForResponse((response) => response.url().endsWith("/api/auth/create-account"));
    await page.fill("[data-account-auth-email]", email);
    await page.fill("[data-account-auth-password]", password);
    await page.click("[data-account-auth-submit]");
    const createAccountPayload = await (await createAccountResponse).json();
    expect(createAccountPayload.ok).toBe(true);
    expect(createAccountPayload.data.identityProvisioned).toBe(true);
    expect(createAccountPayload.data.roleSlugs).toEqual(["user"]);
    await expect(page.locator("[data-account-auth-status]")).toContainText("Account created");

    await page.goto(`${server.baseUrl}/account/sign-in.html?returnTo=account/achievements.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-login-submit]")).toBeEnabled();
    const signInResponse = page.waitForResponse((response) => response.url().endsWith("/api/auth/sign-in"));
    await page.fill("[data-login-identity]", email);
    await page.fill("[data-login-password]", password);
    await page.click("[data-login-submit]");
    expect((await signInResponse).ok()).toBe(true);
    await expect(page).toHaveURL(/\/account\/achievements\.html$/);

    const sessionResponse = await page.request.get(`${server.baseUrl}/api/session/current`);
    const sessionPayload = await sessionResponse.json();
    expect(sessionResponse.ok()).toBe(true);
    expect(sessionPayload.ok).toBe(true);
    expect(sessionPayload.data.authenticated).toBe(true);
    expect(sessionPayload.data.userKey).toBe(createAccountPayload.data.userKey);
    expect(sessionPayload.data.roleSlugs).toEqual(["user"]);

    expect(fakeSupabase.calls.some((call) => call.path === "/auth/v1/token?grant_type=password")).toBe(true);
    expect(fakeSupabase.calls.some((call) => call.path === "/auth/v1/admin/users")).toBe(true);
    expect(fakeSupabase.calls.some((call) => call.path === "/rest/v1/users?select=*")).toBe(true);
    expect(fakeSupabase.calls.some((call) => call.path === "/rest/v1/roles?select=*")).toBe(true);
    expect(fakeSupabase.calls.some((call) => call.path === "/rest/v1/user_roles?select=*")).toBe(true);
    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
    await fakeSupabase.close();
    restoreAuthEnv();
  }
});
