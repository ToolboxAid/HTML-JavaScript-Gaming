import { expect, test } from "@playwright/test";
import { SEED_DB_KEYS } from "../../../../api/seed/seed-db-keys.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const ADMIN_LABELS = Object.freeze([
  "Admin Tools",
  "Analytics",
  "Controls",
  "Creators",
  "DB Viewer",
  "Environments",
  "Game Migration",
  "Infrastructure",
  "Invites",
  "Moderation",
  "Operations",
  "Platform Settings",
  "Ratings",
  "Responsibilities",
  "Site Setup",
  "System Health",
  "Tool Votes",
]);

const OWNER_LABELS = Object.freeze([
  "Owner Tools",
  "AI Credits",
  "Branding",
  "Design System",
  "Grouping Colors",
  "Legal (planned)",
  "Memberships",
  "Marketplace Settings (planned)",
  "Notes",
  "Revenue (planned)",
  "Site Settings",
  "Themes",
]);

async function setSessionUser(server, userKey) {
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey }),
    headers: { "content-type": "application/json" },
    method: "POST",
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

async function stubToolboxRegistrySnapshot(page) {
  await page.route("**/api/toolbox/registry/snapshot", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: {
          activeTools: [],
          imageFallback: "/assets/theme-v2/images/image-missing.svg",
          readinessByStatus: {},
          toolboxContract: {},
          tools: [],
        },
        ok: true,
      }),
      contentType: "application/json; charset=utf-8",
      status: 200,
    });
  });
}

async function openPage(page, pagePath, userKey = SEED_DB_KEYS.users.admin) {
  const server = await startRepoServer();
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
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
  page.on("requestfailed", (request) => failedRequests.push(`FAILED ${request.url()}`));
  await stubInactivePlatformBanner(page);
  await stubToolboxRegistrySnapshot(page);
  await fetch(`${server.baseUrl}/api/local-db/seed`, { method: "POST" });
  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: "local-db" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await setSessionUser(server, userKey);
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${pagePath}`, { waitUntil: "networkidle" });
  return {
    consoleErrors,
    failedRequests,
    pageErrors,
    previousApiUrl,
    previousSiteUrl,
    server,
  };
}

function restoreEnvValue(key, value) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}

async function closePage(page, context) {
  await workspaceV2CoverageReporter.stop(page);
  await context.server.close();
  restoreEnvValue("GAMEFOUNDRY_API_URL", context.previousApiUrl);
  restoreEnvValue("GAMEFOUNDRY_SITE_URL", context.previousSiteUrl);
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("Admin menu renders operational platform pages only", async ({ page }) => {
  const context = await openPage(page, "/admin/invitations.html");
  try {
    await expect(page.locator("nav[aria-label='Admin tool pages'] :is(a, span)")).toHaveText(ADMIN_LABELS);
    const adminLinks = page.locator("nav[aria-label='Admin tool pages'] a");
    const adminRenderedLabels = await page.locator("nav[aria-label='Admin tool pages'] :is(a, span)").allTextContents();
    expect(adminRenderedLabels).toEqual([...adminRenderedLabels].sort((left, right) => left.localeCompare(right)));
    expect(new Set(adminRenderedLabels).size).toBe(adminRenderedLabels.length);
    const adminHrefs = await adminLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href") || ""));
    expect(new Set(adminHrefs).size).toBe(adminHrefs.length);
    for (const href of adminHrefs) {
      const response = await page.request.get(new URL(href, context.server.baseUrl).toString());
      expect(response.status(), `${href} should open`).toBeLessThan(400);
    }
    const adminLinkText = (await adminLinks.allTextContents()).join("\n");
    for (const label of [
      "Branding",
      "Design System",
      "Grouping Colors",
      "Site Settings",
      "Themes",
    ]) {
      expect(adminLinkText).not.toContain(label);
    }
    await expect(page.locator("nav[aria-label='Admin tool pages'] span[aria-disabled='true']")).toHaveText("Admin Tools");
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await closePage(page, context);
  }
});

test("Owner menu renders business controls and planned entries without broken links", async ({ page }) => {
  const context = await openPage(page, "/owner/memberships.html");
  try {
    await expect(page.locator("nav[aria-label='Owner tool pages'] :is(a, span)")).toHaveText(OWNER_LABELS);
    const ownerLinks = page.locator("nav[aria-label='Owner tool pages'] a");
    const ownerLinkText = (await ownerLinks.allTextContents()).join("\n");
    for (const label of [
      "DB Viewer",
      "Infrastructure",
      "Invites",
      "Operations",
      "Platform Settings",
      "System Health",
      "Creators",
    ]) {
      expect(ownerLinkText).not.toContain(label);
    }
    await expect(page.locator("nav[aria-label='Owner tool pages']").getByRole("link", { name: "AI Credits" })).toHaveAttribute("href", /owner\/ai-credits\.html/);
    await expect(page.locator("nav[aria-label='Owner tool pages']").getByRole("link", { name: "Notes" })).toHaveAttribute("href", /owner\/notes\.html/);
    await expect(page.locator("nav[aria-label='Owner tool pages'] span[aria-disabled='true']")).toHaveText([
      "Owner Tools",
      "Legal (planned)",
      "Marketplace Settings (planned)",
      "Revenue (planned)",
    ]);
    await expect(page.locator("nav[aria-label='Owner tool pages'] span[aria-disabled='true'] a")).toHaveCount(0);
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await closePage(page, context);
  }
});

test("Owner Notes resolves under owner path and is owner-only", async ({ page }) => {
  const context = await openPage(page, "/owner/notes.html");
  try {
    await expect(page).toHaveTitle(/Notes - Game Foundry Studio/);
    await expect(page.locator("main[data-owner-notes][data-admin-notes-viewer]")).toBeVisible();
    await expect(page.locator("[data-admin-notes-status]")).toContainText("Loaded dev/archive/legacy-docs-build/admin-notes/index.txt.");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Admin Notes Ownership");
    await expect(page.locator("[aria-label='Owner business pages'] a[aria-current='page']")).toHaveText("Notes");
    await expect(page.locator("[aria-label='Owner business pages'] a[href='/admin/notes.html']")).toHaveCount(0);
    await expect(page.locator("nav[aria-label='Admin tool pages'] a", { hasText: "Notes" })).toHaveCount(0);
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await closePage(page, context);
  }

  const blockedContext = await openPage(page, "/owner/notes.html", SEED_DB_KEYS.users.user1);
  try {
    await expect(page.locator("[data-session-access-blocked='owner']")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Owner role required" })).toBeVisible();
    expect(blockedContext.pageErrors).toEqual([]);
    expect(blockedContext.consoleErrors).toEqual([]);
    expect(blockedContext.failedRequests).toEqual([]);
  } finally {
    await closePage(page, blockedContext);
  }
});

test("Moved Owner business page resolves under owner path", async ({ page }) => {
  const context = await openPage(page, "/owner/branding.html");
  try {
    await expect(page).toHaveTitle(/Branding - Game Foundry Studio/);
    await expect(page.locator("[aria-label='Owner business pages'] a[aria-current='page']")).toHaveText("Branding");
    await expect(page.locator("[aria-label='Owner business pages'] a[href='/admin/branding.html']")).toHaveCount(0);
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await closePage(page, context);
  }
});
