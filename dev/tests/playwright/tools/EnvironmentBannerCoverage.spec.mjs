import { expect, test } from "@playwright/test";
import { SEED_DB_KEYS } from "../../../../api/seed/seed-db-keys.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const SAFE_PUBLIC_ENV = Object.freeze({
  GAMEFOUNDRY_API_URL: "http://127.0.0.1:5501",
  GAMEFOUNDRY_ENVIRONMENT_LABEL: "Development Environment",
  GAMEFOUNDRY_SITE_URL: "http://127.0.0.1:5501",
});

const COVERAGE_PAGES = Object.freeze([
  Object.freeze({ family: "root/home", path: "/index.html" }),
  Object.freeze({ family: "marketplace", path: "/marketplace/index.html" }),
  Object.freeze({ family: "learn", path: "/learn/index.html" }),
  Object.freeze({ family: "account", path: "/account/sign-in.html" }),
  Object.freeze({ family: "admin", path: "/admin/system-health.html" }),
  Object.freeze({ family: "owner", path: "/owner/memberships.html" }),
  Object.freeze({ family: "legal", path: "/legal/privacy-policy.html" }),
  Object.freeze({ family: "memberships", path: "/memberships/index.html" }),
]);

function withEnv(nextEnv, callback) {
  const previousEnv = {};
  Object.keys(nextEnv).forEach((key) => {
    previousEnv[key] = process.env[key];
    if (nextEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = nextEnv[key];
    }
  });
  return Promise.resolve()
    .then(callback)
    .finally(() => {
      Object.entries(previousEnv).forEach(([key, value]) => {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      });
    });
}

async function stubInactivePlatformBanner(page) {
  await page.route("**/api/platform-settings/banner", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: {
          banner: {
            active: false,
            message: "",
            source: "platform-settings",
            sourceTable: "platform_settings",
            sourceTableRowKey: "",
            tone: "info",
          },
          diagnostics: {
            active: false,
            message: "",
            sourceTable: "platform_settings",
            sourceTableRowKey: "",
          },
          sourceTable: "platform_settings",
        },
        ok: true,
      }),
      contentType: "application/json; charset=utf-8",
      status: 200,
    });
  });
}

async function setAdminSession(server) {
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey: SEED_DB_KEYS.users.admin }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

async function startBannerPage(page) {
  const server = await startRepoServer();
  await setAdminSession(server);
  await stubInactivePlatformBanner(page);
  await workspaceV2CoverageReporter.start(page);
  return server;
}

async function closeBannerPage(page, server) {
  await workspaceV2CoverageReporter.stop(page);
  await server.close();
}

async function expectEnvironmentBanner(page, label) {
  const headerBanner = page.locator("[data-platform-banner-source='environment-config'][data-platform-banner-placement='header']");
  const footerBanner = page.locator("[data-platform-banner-source='environment-config'][data-platform-banner-placement='footer']");
  await expect(headerBanner).toContainText(label);
  await expect(footerBanner).toContainText(label);
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("environment banner renders across shared-layout page families", async ({ page }) => {
  await withEnv(SAFE_PUBLIC_ENV, async () => {
    const server = await startBannerPage(page);
    try {
      for (const pageTarget of COVERAGE_PAGES) {
        await page.goto(`${server.baseUrl}${pageTarget.path}`, { waitUntil: "networkidle" });
        await expectEnvironmentBanner(page, SAFE_PUBLIC_ENV.GAMEFOUNDRY_ENVIRONMENT_LABEL);
        const diagnostics = await page.evaluate(() => window.GameFoundryEnvironmentBannerDiagnostics);
        expect(diagnostics.environmentBannerActive).toBe(true);
        expect(diagnostics.environmentLabelConfigured).toBe(true);
        expect(diagnostics.environmentSafeguard).toBe("non-production-banner-visible");
        expect(diagnostics.secretsExposed).toBe(false);
      }
    } finally {
      await closeBannerPage(page, server);
    }
  });
});

test("missing local environment label renders actionable diagnostic banner", async ({ page }) => {
  await withEnv({
    ...SAFE_PUBLIC_ENV,
    GAMEFOUNDRY_ENVIRONMENT_LABEL: undefined,
  }, async () => {
    const server = await startBannerPage(page);
    try {
      await page.goto(`${server.baseUrl}/index.html`, { waitUntil: "networkidle" });
      const headerBanner = page.locator("[data-platform-banner-source='environment-config'][data-platform-banner-placement='header']");
      await expect(headerBanner).toContainText("GAMEFOUNDRY_ENVIRONMENT_LABEL");
      await expect(headerBanner).toContainText(".env");
      await expect(headerBanner).toHaveClass(/platform-banner--danger/);
    } finally {
      await closeBannerPage(page, server);
    }
  });
});

test("production label hides the environment banner by default", async ({ page }) => {
  await withEnv({
    ...SAFE_PUBLIC_ENV,
    GAMEFOUNDRY_ENVIRONMENT_LABEL: "Production",
  }, async () => {
    const server = await startBannerPage(page);
    try {
      await page.goto(`${server.baseUrl}/index.html`, { waitUntil: "networkidle" });
      await expect(page.locator("[data-platform-banner-source='environment-config']")).toHaveCount(0);
      const diagnostics = await page.evaluate(() => window.GameFoundryEnvironmentBannerDiagnostics);
      expect(diagnostics.environmentBannerActive).toBe(false);
      expect(diagnostics.environmentLabelConfigured).toBe(true);
      expect(diagnostics.environmentSafeguard).toBe("production-banner-hidden");
      expect(diagnostics.secretsExposed).toBe(false);
    } finally {
      await closeBannerPage(page, server);
    }
  });
});
