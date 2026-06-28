import http from "node:http";
import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../../api/persistence/mock-db-store.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const PRIMARY_NAVIGATION_ORDER = ["Games", "Toolbox", "Marketplace", "Learn", "Sign In"];
const SUPABASE_ENV_KEYS = [
  "GAMEFOUNDRY_AUTH_PROVIDER",
  "GAMEFOUNDRY_DB_PROVIDER",
  "GAMEFOUNDRY_SUPABASE_ANON_KEY",
  "GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY",
  "GAMEFOUNDRY_SUPABASE_URL",
];
const PUBLIC_ENV_KEYS = [
  "GAMEFOUNDRY_API_URL",
  "GAMEFOUNDRY_SITE_URL",
];
let fakeSupabaseServer;
let previousSupabaseEnv;

function identityTables() {
  const timestamp = "2026-06-15T00:00:00.000Z";
  const audit = {
    createdAt: timestamp,
    createdBy: MOCK_DB_KEYS.users.admin,
    updatedAt: timestamp,
    updatedBy: MOCK_DB_KEYS.users.admin,
  };
  return {
    roles: [
      {
        key: MOCK_DB_KEYS.roles.creator,
        roleSlug: "creator",
        name: "Creator",
        description: "Creator account.",
        isActive: true,
        isSystemRole: false,
        ...audit,
      },
      {
        key: MOCK_DB_KEYS.roles.admin,
        roleSlug: "admin",
        name: "Admin",
        description: "Administrative account.",
        isActive: true,
        isSystemRole: false,
        ...audit,
      },
    ],
    user_roles: [
      {
        key: MOCK_DB_KEYS.userRoles.user1User,
        userKey: MOCK_DB_KEYS.users.user1,
        roleKey: MOCK_DB_KEYS.roles.creator,
        ...audit,
      },
      {
        key: MOCK_DB_KEYS.userRoles.adminAdmin,
        userKey: MOCK_DB_KEYS.users.admin,
        roleKey: MOCK_DB_KEYS.roles.admin,
        ...audit,
      },
    ],
    users: [
      {
        key: MOCK_DB_KEYS.users.user1,
        displayName: "User 1",
        email: "user1@example.invalid",
        authProvider: "supabase-auth",
        authProviderUserId: "supabase-user-1",
        isActive: true,
        ...audit,
      },
      {
        key: MOCK_DB_KEYS.users.admin,
        displayName: "DavidQ",
        email: "qbytes.dq@gmail.com",
        authProvider: "supabase-auth",
        authProviderUserId: "supabase-admin",
        isActive: true,
        ...audit,
      },
    ],
  };
}

function startFakeSupabaseServer() {
  const tables = identityTables();
  const server = http.createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString("utf8");
    const body = rawBody ? JSON.parse(rawBody) : {};
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");

    if (requestUrl.pathname === "/auth/v1/health") {
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }

    if (requestUrl.pathname.startsWith("/rest/v1/")) {
      const tableName = decodeURIComponent(requestUrl.pathname.split("/").pop() || "");
      tables[tableName] = tables[tableName] || [];
      if (request.method === "POST") {
        const rows = Array.isArray(body) ? body : [body];
        rows.forEach((row) => {
          const index = tables[tableName].findIndex((existing) => existing.key === row.key);
          if (index >= 0) {
            tables[tableName][index] = {
              ...tables[tableName][index],
              ...row,
            };
          } else {
            tables[tableName].push(row);
          }
        });
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(JSON.stringify(rows));
        return;
      }
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify(tables[tableName]));
      return;
    }

    response.statusCode = 404;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ message: "Unknown fake Supabase route." }));
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
        close: () => new Promise((closeResolve) => {
          server.closeAllConnections?.();
          server.close(closeResolve);
        }),
      });
    });
  });
}

test.beforeAll(async () => {
  previousSupabaseEnv = Object.fromEntries(SUPABASE_ENV_KEYS.map((key) => [key, process.env[key]]));
  fakeSupabaseServer = await startFakeSupabaseServer();
  process.env.GAMEFOUNDRY_AUTH_PROVIDER = "supabase-auth";
  process.env.GAMEFOUNDRY_DB_PROVIDER = "supabase-postgres";
  process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY = "test-anon-key";
  process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
  process.env.GAMEFOUNDRY_SUPABASE_URL = fakeSupabaseServer.baseUrl;
});

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "workspace-contract",
    surface: "root tools future state"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
  await fakeSupabaseServer?.close();
  SUPABASE_ENV_KEYS.forEach((key) => {
    if (previousSupabaseEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = previousSupabaseEnv[key];
    }
  });
});

async function openRepoPage(page, pathName) {
  const server = await startRepoServer();
  const restorePublicEnv = useRepoServerPublicEnv(server);
  const failedRequests = [];
  const pageErrors = [];
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
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
  return { failedRequests, pageErrors, restorePublicEnv, server };
}

async function setServerSession(server, userKey) {
  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: "local-db" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

async function fetchRegistrySnapshot(server) {
  const response = await fetch(`${server.baseUrl}/api/toolbox/registry/snapshot`);
  const payload = await response.json();
  expect(response.ok, JSON.stringify(payload)).toBe(true);
  expect(payload.ok, JSON.stringify(payload)).toBe(true);
  return payload.data;
}

function normalizeMenuText(text) {
  return text.replace(/[▾▸]/g, "").trim();
}

function sortedCopy(labels) {
  return [...labels].sort((left, right) => left.localeCompare(right));
}

function restoreEnvValue(key, value) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}

function useRepoServerPublicEnv(server) {
  const previousValues = Object.fromEntries(PUBLIC_ENV_KEYS.map((key) => [key, process.env[key]]));
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
  return () => {
    for (const [key, value] of Object.entries(previousValues)) {
      restoreEnvValue(key, value);
    }
  };
}

function expectAlphabetical(labels) {
  expect(labels).toEqual(sortedCopy(labels));
}

async function primaryNavigationLabels(page) {
  return (await page.locator("nav.nav-links > a, nav.nav-links > .nav-item > a").evaluateAll((links) => (
    links.map((link) => link.textContent.trim())
  ))).map(normalizeMenuText);
}

test("root tools surface links current tool pages without old_* routes", async ({ page }) => {
  const { failedRequests, pageErrors, restorePublicEnv, server } = await openRepoPage(page, "/toolbox/index.html");

  try {
    await expect(page.locator("[data-tools-accordion-list] .control-card")).not.toHaveCount(0);
    await expect(page.getByRole("button", { name: /Order/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Group/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Progress" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Build Path" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Build Path" })).not.toHaveAttribute("aria-disabled", "true");
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 15/43");
    await expect(page.locator("[data-toolbox-admin-nav-group]")).toHaveCount(0);
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='admin']")).toHaveCount(0);
    await expect(page.locator("nav.nav-links > a[data-route='learn']")).toHaveCount(1);
    const topNavigationLabels = await primaryNavigationLabels(page);
    expect(topNavigationLabels).toEqual(PRIMARY_NAVIGATION_ORDER);
    const toolboxMenuGroups = (await page.locator("[data-toolbox-menu] [data-toolbox-menu-group-label]").evaluateAll((links) => (
      links.map((link) => link.textContent.trim())
    ))).map(normalizeMenuText);
    expectAlphabetical(toolboxMenuGroups);
    const toolboxNestedMenus = await page.locator("[data-toolbox-submenu]").evaluateAll((menus) => (
      menus.map((menu) => Array.from(menu.querySelectorAll(":scope > a[data-toolbox-menu-item]")).map((link) => link.textContent.trim()))
    ));
    for (const menuLabels of toolboxNestedMenus) {
      expectAlphabetical(menuLabels);
    }
    for (const route of ["account", "admin", "games", "marketplace"]) {
      const menuLabels = await page.locator(`nav.nav-links > .nav-item:has(> a[data-route='${route}']) > .sub-menu > a`).evaluateAll((links) => (
        links.map((link) => link.textContent.trim())
      ));
      expectAlphabetical(menuLabels);
    }
    const footerMenus = await page.locator("footer .footer__links").evaluateAll((menus) => (
      menus.map((menu) => Array.from(menu.querySelectorAll(":scope > a")).map((link) => link.textContent.trim()))
    ));
    for (const menuLabels of footerMenus) {
      expectAlphabetical(menuLabels);
    }
    await expect(page.locator("[data-toolbox-menu] a[href='toolbox/learn/index.html']")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-menu]").getByText("Admin", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Progress Wireframe")).toHaveCount(0);
    await expect(page.getByText("Build Path Wireframe")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-wireframe]")).toHaveCount(0);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    const readyGameWorkspaceCard = page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: "Game Hub" })
    });
    await expect(readyGameWorkspaceCard.locator("a.btn")).toHaveAttribute("href", "../toolbox/game-hub/index.html");
    const defaultToolLabels = await page.locator("main [data-tools-accordion-list] .control-card h3").evaluateAll((labels) => labels.map((label) => label.textContent.trim()));
    expect(defaultToolLabels).toEqual(["Achievements", "Assets", "Colors", "Controls", "Game Configuration", "Game Design", "Game Hub", "Game Journey", "Idea Board", "Languages", "Message Studio", "Objects", "Saved Data", "Tags", "Text To Speech"]);
    const textToSpeechCard = page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Text To Speech$/ })
    });
    await expect(textToSpeechCard.locator("[data-toolbox-tool-name-link='Text To Speech']")).toHaveAttribute("href", "/toolbox/text-to-speech/index.html");
    await expect(textToSpeechCard.locator("[data-toolbox-tool-name-link='Text To Speech']")).toHaveAttribute("data-registered-tool-route", "toolbox/text-to-speech/index.html");
    await expect(page.locator("[data-toolbox-readiness]")).toHaveText(["Wireframe", "Beta", "Complete", "Wireframe", "Beta", "Beta", "Beta", "Beta", "Wireframe", "Wireframe", "Beta", "Beta", "Wireframe", "Beta", "Beta"]);
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^AI Command Center$/ }) })).toHaveCount(0);
    const oldStandaloneLabels = [
      ["Palette", "Manager"].join(" "),
      ["Stor", "age", " ", "Inspector"].join(""),
      ["So", "und"].join(""),
      ["In", "put"].join(""),
      ["Palette", " / ", "Colors"].join(""),
      ["In", "put", " Mapping"].join(""),
      ["Object", " Vector"].join(""),
      ["World", " Vector"].join(""),
      ["Music", " Library"].join(""),
      ["Local", "ization"].join(""),
      ["Collision", " Inspector"].join(""),
      ["Save", " Data"].join(""),
      "Maps"
    ];
    expect(defaultToolLabels.filter((label) => oldStandaloneLabels.includes(label))).toEqual([]);
    expect(defaultToolLabels.filter((label) => ["Vector", "Tilemap", "Isometric", "Hex", "Sprite", "Character", "Enemy", "Interactive"].includes(label))).toEqual([]);
    expect(defaultToolLabels).not.toEqual(expect.arrayContaining([
      "Creators",
      "Environments",
      "Game Migration",
      "Platform Settings",
      "Cloud",
      "Custom Extensions"
    ]));
    await expect(page.locator("main .control-card .kicker")).toHaveCount(0);
    const designCard = page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Game Design$/ })
    }).first();
    await expect(designCard).toHaveClass(/(^|\s)tool-group-journey-design(\s|$)/);
    const allCardsHaveGroupClass = await page.locator("main [data-tools-accordion-list] .control-card").evaluateAll((cards) => (
      cards.every((card) => Array.from(card.classList).some((className) => className.startsWith("tool-group-")))
    ));
    expect(allCardsHaveGroupClass).toBe(true);
    const designBorderColor = await designCard.evaluate((card) => getComputedStyle(card).borderColor);
    expect(designBorderColor).not.toBe("rgba(0, 0, 0, 0)");
    const designActionRow = designCard.locator("[data-toolbox-tile-action-row='Game Design']");
    await expect(designActionRow).toHaveCount(1);
    await expect(designActionRow.locator("img[alt='Game Design badge']")).toHaveCount(1);
    await expect(designActionRow.locator("a.btn")).toHaveAttribute("href", "../toolbox/game-design/index.html");
    await expect(designActionRow.locator(".brand-color-swatch")).toHaveCount(0);
    await expect(designActionRow.locator("[data-toolbox-readiness]")).toHaveCount(0);
    await expect(designCard.locator("ul")).toHaveCount(0);
    const designBodyOrder = await designCard.locator(".card-body").evaluate((body) => (
      Array.from(body.children).map((child) => child.classList.contains("content-cluster") ? "content-cluster" : child.tagName.toLowerCase())
    ));
    expect(designBodyOrder).toEqual(["h3", "p", "content-cluster", "content-cluster", "span"]);
    await expect(designCard.locator(".card-media-link")).toHaveAttribute("href", "../toolbox/game-design/index.html");
    const previewImage = designCard.locator(".card-media-link img");
    const transformBeforeHover = await previewImage.evaluate((image) => getComputedStyle(image).transform);
    await designCard.locator(".card-media-link").hover();
    await page.waitForTimeout(100);
    const transformAfterHover = await previewImage.evaluate((image) => getComputedStyle(image).transform);
    expect(transformAfterHover).not.toBe(transformBeforeHover);
    expect(transformAfterHover).not.toBe("none");
    const previewOverflow = await designCard.evaluate((card) => {
      const media = card.querySelector(".card-media");
      const link = card.querySelector(".card-media-link");
      return [card, media, link].map((element) => getComputedStyle(element).overflow);
    });
    expect(previewOverflow).toEqual(["visible", "visible", "visible"]);
    await designCard.locator(".card-media-link").click();
    await page.waitForURL(/\/toolbox\/game-design\/index\.html$/);
    await page.goBack({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Group" }).click();
    const guestGroupLabels = await page.locator("[data-tools-accordion-list] details[data-tools-accordion]").evaluateAll((groups) => (
      groups.map((group) => group.dataset.toolsAccordion)
    ));
    expect(guestGroupLabels).toEqual(["Idea", "Design", "Graphics", "Audio", "Objects", "Interface", "Controls", "Progression"]);
    await expect(page.locator("[data-tools-accordion='Admin']")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Progress" })).toHaveCount(0);
    await expect(page.locator("[data-tools-accordion-list] .control-card h3", { hasText: /^Progress$/ })).toHaveCount(0);
    await page.getByRole("button", { name: "Build Path" }).click();
    await expect(page.locator("[data-build-path-table='workflow']")).toBeVisible();
    await expect(page.locator("[data-build-path-table='workflow'] th")).toHaveText(["Order", "Tool", "Status"]);
    await expect(page.getByText("Build Path Guidance")).toBeVisible();
    await expect(page.getByText("Active Game: Demo Game")).toBeVisible();
    await expect(page.getByText("What should I do next? Game Configuration")).toBeVisible();
    await expect(page.getByText("Game Progress: Demo Game identity ready")).toBeVisible();
    await expect(page.getByText("Launch Progress: Publish blocked until configuration and required assets are ready")).toBeVisible();
    await expect(page.getByText("Current Focus: Complete Game Configuration")).toBeVisible();
    await expect(page.getByText("Work top-to-bottom and left-to-right through the workflow table.")).toBeVisible();
    await expect(page.locator("[data-build-path-tool]")).not.toHaveCount(0);
    await expect(page.locator("[data-tools-accordion-list] .control-card h3", { hasText: /^Build Path$/ })).toHaveCount(0);
    await expect(page.locator("main").getByText("Arcade", { exact: true })).toHaveCount(0);
    const toolLabels = await page.locator("[data-tools-accordion-list] .control-card h3").evaluateAll((labels) => labels.map((label) => label.textContent.trim()));
    const oldToolLabelToken = ["Stu", "dio"].join("");
    const allowedProductId = "GameFoundryStudio";
    expect(toolLabels.filter((label) => new RegExp(`\\b${oldToolLabelToken}\\b`).test(label) && !label.includes(allowedProductId))).toEqual([]);
    const hrefs = await page.locator("a[href]").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(hrefs.filter((href) => href && /(^|\/|\.\.\/)tools\/old_/.test(href))).toEqual([]);
    expect(failedRequests.filter((request) => request.includes("/toolbox/old_"))).toEqual([]);

    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 15/43");
    await expect(page.locator("main").getByText("Users", { exact: true })).toHaveCount(0);
    await expect(page.locator("main").getByText("Creators", { exact: true })).toHaveCount(0);
    await expect(page.locator("[data-toolbox-admin-nav-group]")).toHaveCount(0);
    await setServerSession(server, MOCK_DB_KEYS.users.admin);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 15/46");
    await expect(page.locator("[data-toolbox-admin-nav-group]")).toHaveCount(0);
    const adminLabels = await page.locator("main [data-tools-accordion-list] .control-card h3").evaluateAll((labels) => labels.map((label) => label.textContent.trim()));
    expect(adminLabels).toEqual(defaultToolLabels);
    expect(adminLabels).not.toEqual(expect.arrayContaining([
      "Creators",
      "Environments",
      "Game Migration",
      "Platform Settings"
    ]));
    await expect(page.locator("main .control-card").filter({
      has: page.locator("[data-toolbox-tool-name-link='Game Hub'][href='/toolbox/game-hub/index.html']")
    }).locator("[data-toolbox-readiness]")).toHaveText("Beta");
    await expect(page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Game Configuration$/ })
    }).locator("[data-toolbox-readiness]")).toHaveText("Beta");
    await expect(page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Assets$/ })
    }).locator("[data-toolbox-readiness]")).toHaveText("Beta");
    await expect(page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Build Game$/ })
    })).toHaveCount(0);
    await expect(page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Cloud$/ })
    })).toHaveCount(0);
    await expect(page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Worlds$/ })
    })).toHaveCount(0);
    const objectsCard = page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Objects$/ })
    }).first();
    await expect(objectsCard).toContainText("Object types");
    await expect(objectsCard.locator("[data-child-capabilities='Objects']")).toHaveText("Object types: Static, Dynamic, Collectible, Hazard, Goal");
    await page.getByRole("button", { name: "Group" }).click();
    const adminGroupLabels = await page.locator("[data-tools-accordion-list] details[data-tools-accordion]").evaluateAll((groups) => (
      groups.map((group) => group.dataset.toolsAccordion)
    ));
    expect(adminGroupLabels).toEqual(["Idea", "Design", "Graphics", "Audio", "Objects", "Interface", "Controls", "Progression"]);
    await expect(page.getByRole("button", { name: "Progress" })).toHaveCount(0);
    await page.getByRole("button", { name: "Build Path" }).click();
    await expect(page.locator("[data-build-path-table='workflow']")).toBeVisible();
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("main").getByText("Users", { exact: true })).toHaveCount(0);
    await expect(page.locator("main").getByText("Creators", { exact: true })).toHaveCount(0);
    await expect(page.locator("[data-toolbox-admin-nav-group]")).toHaveCount(0);
    await setServerSession(server, "");
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 15/43");
    await expect(page.locator("main").getByText("Users", { exact: true })).toHaveCount(0);
    await expect(page.locator("main").getByText("Creators", { exact: true })).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  } finally {
    restorePublicEnv();
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("common header renders primary navigation order across active pages", async ({ page }) => {
  const server = await startRepoServer();
  const restorePublicEnv = useRepoServerPublicEnv(server);
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];
  const commonHeaderPages = [
    "/index.html",
    "/toolbox/index.html",
    "/games/index.html",
    "/marketplace/index.html",
    "/learn/index.html",
    "/account/index.html",
    "/admin/site-setup.html"
  ];

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

  try {
    for (const pagePath of commonHeaderPages) {
      await page.goto(`${server.baseUrl}${pagePath}`, { waitUntil: "networkidle" });
      await expect(page.locator("header.site-header")).toBeVisible();
      expect(await primaryNavigationLabels(page)).toEqual(PRIMARY_NAVIGATION_ORDER);

      for (const route of ["account", "admin", "games", "marketplace"]) {
        const menuLabels = await page.locator(`nav.nav-links > .nav-item:has(> a[data-route='${route}']) > .sub-menu > a`).evaluateAll((links) => (
          links.map((link) => link.textContent.trim())
        ));
        expectAlphabetical(menuLabels);
      }

      const toolboxMenuGroups = (await page.locator("[data-toolbox-menu] [data-toolbox-menu-group-label]").evaluateAll((links) => (
        links.map((link) => link.textContent.trim())
      ))).map(normalizeMenuText);
      expectAlphabetical(toolboxMenuGroups);

      const toolboxNestedMenus = await page.locator("[data-toolbox-submenu]").evaluateAll((menus) => (
        menus.map((menu) => Array.from(menu.querySelectorAll(":scope > a[data-toolbox-menu-item]")).map((link) => link.textContent.trim()))
      ));
      for (const menuLabels of toolboxNestedMenus) {
        expectAlphabetical(menuLabels);
      }

      await expect(page.locator("[data-toolbox-menu]").getByText("Admin", { exact: true })).toHaveCount(0);

      const bodyText = await page.locator("body").innerText();
      expect(bodyText.replace(/GameFoundryStudio|Game Foundry Studio|Message Studio/g, "").match(/\bStudio\b/g) || []).toEqual([]);

      if (pagePath === "/toolbox/index.html") {
        await expect(page.locator("[data-tools-count]")).toBeVisible();
      }
    }

    expect(failedRequests.filter((request) => !request.includes("game-foundry-mascot-sheet.png"))).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors.filter((message) => !message.includes("404 (Not Found)"))).toEqual([]);
  } finally {
    restorePublicEnv();
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("learn wireframe pages load with shared Theme V2 structure", async ({ page }) => {
  const learnPages = [
    {
      path: "/learn/index.html",
      headings: ["Browse by tool", "Examples", "FAQ", "Getting Started", "Search documentation", "Tutorials", "Videos"]
    },
    {
      path: "/learn/getting-started/index.html",
      headings: ["Desktop Target", "Ideal Width", "Minimum Comfortable Width", "Panel Layout", "Smaller Screens", "Wireframe Status"]
    },
    {
      path: "/learn/game-hub/index.html",
      headings: ["Overview", "Quick Start", "Common Tasks", "Related Documentation", "Related Videos", "Examples"]
    },
    {
      path: "/learn/game-design/index.html",
      headings: ["Overview", "Quick Start", "Common Tasks", "Related Documentation", "Related Videos", "Examples"]
    },
    {
      path: "/learn/game-configuration/index.html",
      headings: ["Overview", "Quick Start", "Common Tasks", "Related Documentation", "Related Videos", "Examples"]
    },
    {
      path: "/learn/assets/index.html",
      headings: ["Overview", "Quick Start", "Common Tasks", "Related Documentation", "Related Videos", "Examples"]
    },
    {
      path: "/learn/colors/index.html",
      headings: ["Overview", "Quick Start", "Common Tasks", "Related Documentation", "Related Videos", "Examples"]
    },
    {
      path: "/learn/objects/index.html",
      headings: ["Overview", "Quick Start", "Common Tasks", "Related Documentation", "Related Videos", "Examples"]
    },
    {
      path: "/learn/worlds/index.html",
      headings: ["Overview", "Quick Start", "Common Tasks", "Related Documentation", "Related Videos", "Examples"]
    },
    {
      path: "/learn/audio/index.html",
      headings: ["Overview", "Quick Start", "Common Tasks", "Related Documentation", "Related Videos", "Examples"]
    },
    {
      path: "/learn/publish/index.html",
      headings: ["Overview", "Quick Start", "Common Tasks", "Related Documentation", "Related Videos", "Examples"]
    }
  ];

  for (const learnPage of learnPages) {
    const { failedRequests, pageErrors, restorePublicEnv, server } = await openRepoPage(page, learnPage.path);

    try {
      await expect(page.locator("header.site-header")).toBeVisible();
      await expect(page.locator("footer.footer")).toBeVisible();
      await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
      for (const heading of learnPage.headings) {
        await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
      }
      if (learnPage.path === "/learn/index.html") {
        const learnCardHeadings = await page.locator("main .card-grid .control-card h2").evaluateAll((headings) => (
          headings.map((heading) => heading.textContent.trim())
        ));
        expectAlphabetical(learnCardHeadings);
        const learnToolLinks = await page.locator("main .content-cluster a.btn").evaluateAll((links) => (
          links.map((link) => link.textContent.trim())
        ));
        expectAlphabetical(learnToolLinks);
      }
      await expect(page.locator("iframe, video")).toHaveCount(0);
      expect(failedRequests).toEqual([]);
      expect(pageErrors).toEqual([]);
    } finally {
      restorePublicEnv();
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  }
});

test("tool template future-state page loads from root Theme V2 paths", async ({ page }) => {
  const { failedRequests, pageErrors, restorePublicEnv, server } = await openRepoPage(page, "/dev/templates/tool-template-v2/index.html");

  try {
    await expect(page.locator("base")).toHaveAttribute("href", "/");
    await expect(page.locator("header.site-header")).toBeVisible();
    await expect(page.locator("footer.footer")).toBeVisible();
    await expect(page.locator("#toolDisplayMode")).toBeVisible();
    await expect(page.locator(".tool-center-panel")).toContainText("Workspace");
    const loadedReferences = await page.locator("script[src],link[href],img[src]").evaluateAll((elements) => (
      elements.map((element) => element.getAttribute("src") || element.getAttribute("href")).filter(Boolean)
    ));
    expect(loadedReferences.filter((reference) => reference.includes("GameFoundryStudio/"))).toEqual([]);
    expect(loadedReferences.filter((reference) => reference.includes("toolbox/old_"))).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
  } finally {
    restorePublicEnv();
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("representative active tool pages align center cleanup and registry group colors", async ({ page }) => {
  const representativeToolIds = [
    "ai-assistant",
    "game-hub",
    "game-design",
    "colors",
    "audio",
    "game-testing",
    "controls",
    "publish"
  ];
  const legacyHeaderClasses = ["molten-orange", "forge-gold", "electric-blue", "arcade-cyan", "purple", "steel-gray"];
  const legacyGroupClasses = [
    "tool-group-ai-learning",
    "tool-group-build-create",
    "tool-group-community-marketplace",
    "tool-group-content-assets",
    "tool-group-media-audio",
    "tool-group-media-audio-community",
    "tool-group-platform-cloud",
    "tool-group-dev-system",
    "tool-group-development-system",
    "tool-group-create",
    "tool-group-content",
    "tool-group-media",
    "tool-group-share",
    "tool-group-test",
    "tool-group-account"
  ];
  const ssotGroupClasses = [
    "tool-group-ai",
    "tool-group-audio",
    "tool-group-build",
    "tool-group-design",
    "tool-group-marketplace",
    "tool-group-platform",
    "tool-group-play"
  ];
  const gameJourneyGroupClasses = [
    "tool-group-idea",
    "tool-group-journey-design",
    "tool-group-graphics",
    "tool-group-journey-audio",
    "tool-group-objects",
    "tool-group-worlds",
    "tool-group-interface",
    "tool-group-controls",
    "tool-group-rules",
    "tool-group-progression",
    "tool-group-play-test",
    "tool-group-publish",
    "tool-group-journey-share"
  ];
  const { failedRequests, pageErrors, restorePublicEnv, server } = await openRepoPage(page, "/toolbox/index.html?view=group");

  try {
    const registrySnapshot = await fetchRegistrySnapshot(server);
    const activeTools = registrySnapshot.activeTools
      .filter((tool) => representativeToolIds.includes(tool.id))
      .map((tool) => ({ ...tool, route: tool.route || tool.path || "" }))
      .filter((tool) => Boolean(tool.route));

    await page.getByRole("button", { name: "Group" }).click();
    const toolboxGroupCardStyles = new Map(await page.locator("main [data-tools-accordion-list] .control-card").evaluateAll((cards) => (
      cards.map((card) => {
        const title = card.querySelector("h3")?.textContent?.trim() || "";
        const groupClass = Array.from(card.classList).find((className) => className.startsWith("tool-group-")) || "";
        return [
          title,
          {
            borderColor: getComputedStyle(card).borderTopColor,
            groupClass
          }
        ];
      })
    )));
    const toolboxCardGroupClasses = [...toolboxGroupCardStyles.values()].map((styles) => styles.groupClass);
    expect(toolboxCardGroupClasses.every((className) => gameJourneyGroupClasses.includes(className))).toBe(true);
    expect(toolboxCardGroupClasses.filter((className) => legacyGroupClasses.includes(className))).toEqual([]);

    for (const tool of activeTools) {
      await page.goto(`${server.baseUrl}/${tool.route}`, { waitUntil: "networkidle" });
      await expect(page.locator(".tool-center-panel")).toBeVisible();
      await expect(page.locator(".tool-center-panel > img[src$='image-missing.svg']")).toHaveCount(0);
      await expect(page.locator(".tool-center-panel h1, .tool-center-panel h2, .tool-center-panel h3").first()).toBeVisible();

      const expectedFromToolboxGroup = toolboxGroupCardStyles.get(tool.displayName);
      const expectedGroupClass = tool.colorGroup;
      if (expectedFromToolboxGroup) {
        expect(gameJourneyGroupClasses).toContain(expectedFromToolboxGroup.groupClass);
      }
      expect(ssotGroupClasses).toContain(expectedGroupClass);
      expect(legacyGroupClasses).not.toContain(expectedGroupClass);
      const sideColumns = page.locator(".tool-workspace > aside.tool-column");
      await expect(sideColumns).toHaveCount(2);
      const groupClassesByColumn = await sideColumns.evaluateAll((columns) => (
        columns.map((column) => Array.from(column.classList).filter((className) => className.startsWith("tool-group-")))
      ));
      expect(groupClassesByColumn).toEqual([[expectedGroupClass], [expectedGroupClass]]);

      const sidePanelStyles = await sideColumns.evaluateAll((columns, staleHeaderClasses) => (
        columns.map((column) => {
          const header = column.querySelector(".tool-column-header");
          const heading = header?.querySelector("h2, h3");
          const headerClasses = Array.from(header?.classList || []);
          return {
            borderColor: getComputedStyle(column).borderTopColor,
            headerBackgroundColor: header ? getComputedStyle(header).backgroundColor : "",
            headerColor: heading ? getComputedStyle(heading).color : "",
            staleHeaderClasses: headerClasses.filter((className) => staleHeaderClasses.includes(className))
          };
        })
      ), legacyHeaderClasses);
      expect(sidePanelStyles.every((styles) => styles.staleHeaderClasses.length === 0)).toBe(true);
      expect(sidePanelStyles.every((styles) => styles.headerBackgroundColor !== "rgba(0, 0, 0, 0)")).toBe(true);
      const sidePanelHrColors = await sideColumns.evaluateAll((columns) => (
        columns.map((column) => {
          const hr = document.createElement("hr");
          column.append(hr);
          const borderColor = getComputedStyle(hr).borderTopColor;
          hr.remove();
          return borderColor;
        })
      ));

      expect(sidePanelStyles.map((styles) => styles.borderColor)).toEqual(sidePanelStyles.map((styles) => styles.headerColor));
      expect(sidePanelHrColors).toEqual(sidePanelStyles.map((styles) => styles.borderColor));
    }

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
  } finally {
    restorePublicEnv();
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
