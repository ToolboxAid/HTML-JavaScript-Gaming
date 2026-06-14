import { expect, test } from "@playwright/test";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";

const SESSION_ROUTE_CHECKS = [
  { method: "HEAD", route: "/api/session/current", status: 200 },
  { method: "OPTIONS", route: "/api/session/mode", status: 204 },
  { method: "GET", route: "/api/session/current", status: 200 },
  { method: "GET", route: "/api/session/modes", status: 200 },
  { method: "GET", route: "/api/session/users", status: 200 },
  { body: { modeId: "local-db" }, method: "POST", route: "/api/session/mode", status: 200 },
  { body: { userKey: "" }, method: "POST", route: "/api/session/user", status: 200 },
  { body: {}, method: "POST", route: "/api/session/logout", status: 200 },
];

test("login session API routes recover static probes and Local DB mode calls", async ({ page }) => {
  const server = await startRepoServer();
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
    for (const check of SESSION_ROUTE_CHECKS) {
      const response = await fetch(`${server.baseUrl}${check.route}`, {
        body: check.body ? JSON.stringify(check.body) : undefined,
        headers: check.body ? { "content-type": "application/json" } : undefined,
        method: check.method,
      });
      expect(response.status, `${check.method} ${check.route}`).toBe(check.status);
      expect([404, 405], `${check.method} ${check.route}`).not.toContain(response.status);
      if (check.method !== "HEAD" && check.method !== "OPTIONS") {
        const payload = await response.json();
        expect(payload.ok, `${check.method} ${check.route}`).toBe(true);
        expect(payload.data, `${check.method} ${check.route}`).toBeDefined();
      }
    }

    await page.goto(`${server.baseUrl}/login.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-login-mode]")).toHaveText(["Local DB"]);
    await expect(page.locator("[data-login-mode='local-mem']")).toHaveCount(0);
    await expect(page.locator("[data-login-mode='local-db']")).toBeEnabled();
    await expect(page.getByRole("button", { name: "UAT" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Prod" })).toHaveCount(0);
    expect(await page.evaluate(() => Object.prototype.hasOwnProperty.call(window, "ActionableCoachmark"))).toBe(false);

    expect(failedRequests.filter((entry) => entry.includes("/api/session"))).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await server.close();
  }
});
