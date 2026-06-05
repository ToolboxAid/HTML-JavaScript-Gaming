import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";
import { getActiveToolRegistry, getToolRoute } from "../../../toolbox/toolRegistry.js";

const PRIMARY_NAVIGATION_ORDER = ["Games", "Toolbox", "Marketplace", "Learn", "Account", "Admin"];

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
});

async function openRepoPage(page, pathName) {
  const server = await startRepoServer();
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
  return { failedRequests, pageErrors, server };
}

function normalizeMenuText(text) {
  return text.replace(/[▾▸]/g, "").trim();
}

function sortedCopy(labels) {
  return [...labels].sort((left, right) => left.localeCompare(right));
}

function expectAlphabetical(labels) {
  expect(labels).toEqual(sortedCopy(labels));
}

async function primaryNavigationLabels(page) {
  return (await page.locator("nav.nav-links > a, nav.nav-links > .nav-item > a").evaluateAll((links) => (
    links.map((link) => link.textContent.trim())
  ))).map(normalizeMenuText);
}

async function storageSnapshot(page) {
  return page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage }
  }));
}

test("root tools surface links current tool pages without old_* routes", async ({ page }) => {
  const { failedRequests, pageErrors, server } = await openRepoPage(page, "/toolbox/index.html");

  try {
    await expect(page.locator("[data-tools-accordion-list] .control-card")).not.toHaveCount(0);
    await expect(page.getByRole("button", { name: /Order/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Group/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Progress" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Build Path" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Build Path" })).not.toHaveAttribute("aria-disabled", "true");
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 30/37");
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveText("GUEST VIEW • Preview only • Sign in to create");
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveAttribute("href", /role=user/);
    await expect(page.locator("[data-project-data-menu]")).toBeHidden();
    await expect(page.locator("[data-project-data-action]")).toHaveCount(3);
    await expect(page.locator("[data-project-data-action]:visible")).toHaveCount(0);
    await expect(page.locator("[aria-label='Toolbox role simulation']")).toHaveClass(/callout/);
    await expect(page.locator("[aria-label='Toolbox role simulation']")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveClass(/status/);
    const roleBannerIsFinalHeaderRow = await page.locator("[aria-label='Toolbox role simulation']").evaluate((row) => (
      (row.previousElementSibling?.matches("header.site-header") === true || row.previousElementSibling?.querySelector(":scope > header.site-header") !== null)
      && row.nextElementSibling?.tagName.toLowerCase() === "main"
    ));
    expect(roleBannerIsFinalHeaderRow).toBe(true);
    await expect(page.locator("[data-toolbox-admin-nav-group]")).toHaveCount(0);
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='admin']")).toHaveCount(1);
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
    for (const route of ["account", "admin", "games"]) {
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
    const languagesCard = page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: "Languages" })
    });
    await expect(languagesCard.locator("a.btn")).toHaveAttribute("href", "../toolbox/languages/index.html");
    const defaultToolLabels = await page.locator("main [data-tools-accordion-list] .control-card h3").evaluateAll((labels) => labels.map((label) => label.textContent.trim()));
    expect(defaultToolLabels).toEqual(expect.arrayContaining([
      "Audio",
      "Build Game",
      "Colors",
      "Controls",
      "Fonts",
      "Hitboxes",
      "Languages",
      "Marketplace",
      "Music",
      "Objects",
      "Saved Data",
      "Voices",
      "Worlds"
    ]));
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
      "Users",
      "Environments",
      "Game Migration",
      "Platform Settings",
      "Cloud",
      "Custom Extensions"
    ]));
    await expect(page.locator("main .control-card .kicker")).toHaveCount(0);
    const assetsCard = page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Assets$/ })
    }).first();
    await expect(assetsCard).toHaveClass(/(^|\s)tool-group-design(\s|$)/);
    const allCardsHaveGroupClass = await page.locator("main [data-tools-accordion-list] .control-card").evaluateAll((cards) => (
      cards.every((card) => Array.from(card.classList).some((className) => className.startsWith("tool-group-")))
    ));
    expect(allCardsHaveGroupClass).toBe(true);
    const assetsBorderColor = await assetsCard.evaluate((card) => getComputedStyle(card).borderColor);
    expect(assetsBorderColor).not.toBe("rgba(0, 0, 0, 0)");
    await expect(assetsCard.locator(".card-body > .content-cluster")).toContainText("Design");
    await expect(assetsCard.locator(".card-body > .content-cluster")).toHaveCount(1);
    const assetsBodyOrder = await assetsCard.locator(".card-body").evaluate((body) => (
      Array.from(body.children).map((child) => child.classList.contains("content-cluster") ? "content-cluster" : child.tagName.toLowerCase())
    ));
    expect(assetsBodyOrder).toEqual(["h3", "p", "a", "content-cluster"]);
    await expect(assetsCard.locator(".card-media-link")).toHaveAttribute("href", "../toolbox/assets/index.html");
    await expect(assetsCard.locator("a.btn")).toHaveAttribute("href", "../toolbox/assets/index.html");
    const previewImage = assetsCard.locator(".card-media-link img");
    const transformBeforeHover = await previewImage.evaluate((image) => getComputedStyle(image).transform);
    await assetsCard.locator(".card-media-link").hover();
    await page.waitForTimeout(100);
    const transformAfterHover = await previewImage.evaluate((image) => getComputedStyle(image).transform);
    expect(transformAfterHover).not.toBe(transformBeforeHover);
    expect(transformAfterHover).not.toBe("none");
    const previewOverflow = await assetsCard.evaluate((card) => {
      const media = card.querySelector(".card-media");
      const link = card.querySelector(".card-media-link");
      return [card, media, link].map((element) => getComputedStyle(element).overflow);
    });
    expect(previewOverflow).toEqual(["visible", "visible", "visible"]);
    await assetsCard.locator(".card-media-link").click();
    await page.waitForURL(/\/toolbox\/assets\/index\.html$/);
    await page.goBack({ waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveText("GUEST VIEW • Preview only • Sign in to create");
    const worldsCard = page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Worlds$/ })
    }).first();
    await expect(worldsCard).toHaveClass(/(^|\s)tool-group-design(\s|$)/);
    await expect(worldsCard).toContainText("Planned world types");
    await expect(worldsCard.locator("[data-child-capabilities='Worlds'] li")).toHaveText(["Vector", "Tilemap", "Isometric", "Hex"]);
    const objectsCard = page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Objects$/ })
    }).first();
    await expect(objectsCard).toContainText("Planned object types");
    await expect(objectsCard.locator("[data-child-capabilities='Objects'] li")).toHaveText(["Vector", "Sprite", "Character", "Enemy", "Interactive"]);
    await page.getByRole("button", { name: "Group" }).click();
    const guestGroupLabels = await page.locator("[data-tools-accordion-list] details[data-tools-accordion]").evaluateAll((groups) => (
      groups.map((group) => group.dataset.toolsAccordion)
    ));
    expect(guestGroupLabels).toEqual(["AI", "Audio", "Build/Create", "Design", "Marketplace", "Platform", "Play"]);
    await expect(page.locator("[data-tools-accordion='Admin']")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Progress" })).toHaveCount(0);
    await expect(page.locator("[data-tools-accordion-list] .control-card h3", { hasText: /^Progress$/ })).toHaveCount(0);
    await page.getByRole("button", { name: "Build Path" }).click();
    await expect(page.locator("[data-build-path-table='workflow']")).toBeVisible();
    await expect(page.locator("[data-build-path-table='workflow'] th")).toHaveText(["Order", "Tool", "Status", "Complete"]);
    await expect(page.getByText("Build Path Guidance")).toBeVisible();
    await expect(page.getByText("Active Project: Demo Project")).toBeVisible();
    await expect(page.getByText("What should I do next? Game Configuration")).toBeVisible();
    await expect(page.getByText("Project Completion: Demo Project identity ready")).toBeVisible();
    await expect(page.getByText("Publishing Progress: Publish blocked until configuration and required assets are ready")).toBeVisible();
    await expect(page.getByText("Current Focus: Complete Game Configuration")).toBeVisible();
    await expect(page.getByText("Work top-to-bottom and left-to-right through the workflow table.")).toBeVisible();
    await expect(page.locator("[data-build-path-tool='Project Workspace']")).toContainText("🟢 Complete");
    await expect(page.locator("[data-build-path-tool='Game Configuration']")).toContainText("🟡 In Progress");
    await expect(page.locator("[data-build-path-tool='Publish']")).toContainText("🔴 Not Started");
    await expect(page.locator("[data-build-path-tool='Publish']")).not.toContainText("⚪ N/A");
    await expect(page.locator("[data-tools-accordion-list] .control-card h3", { hasText: /^Build Path$/ })).toHaveCount(0);
    await expect(page.locator("main").getByText("Arcade", { exact: true })).toHaveCount(0);
    const toolLabels = await page.locator("[data-tools-accordion-list] .control-card h3").evaluateAll((labels) => labels.map((label) => label.textContent.trim()));
    const oldToolLabelToken = ["Stu", "dio"].join("");
    const allowedProductId = "GameFoundryStudio";
    expect(toolLabels.filter((label) => new RegExp(`\\b${oldToolLabelToken}\\b`).test(label) && !label.includes(allowedProductId))).toEqual([]);
    const hrefs = await page.locator("a[href]").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(hrefs.filter((href) => href && /(^|\/|\.\.\/)tools\/old_/.test(href))).toEqual([]);
    expect(failedRequests.filter((request) => request.includes("/toolbox/old_"))).toEqual([]);

    await page.locator("[data-toolbox-role-banner]").click();
    await page.waitForURL(/role=user/);
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveText("CREATOR VIEW • Project tools enabled • Switch to Admin View");
    await expect(page.locator("[data-project-data-menu]")).toBeHidden();
    await expect(page.locator("[data-project-data-action]:visible")).toHaveCount(0);
    await expect(page.locator("[aria-label='Toolbox role simulation']")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 30/37");
    await expect(page.locator("main").getByText("Users", { exact: true })).toHaveCount(0);
    await expect(page.locator("[data-toolbox-admin-nav-group]")).toHaveCount(0);
    await page.locator("[data-toolbox-role-banner]").click();
    await page.waitForURL(/role=admin/);
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveText("ADMIN VIEW • Planned tools visible • Switch to Creator View");
    await expect(page.locator("[aria-label='Toolbox role simulation']")).toContainText("ADMIN VIEW • Planned tools visible • Switch to Creator View");
    await expect(page.locator("[aria-label='Toolbox role simulation']")).toContainText("Project Data ▾");
    await expect(page.locator("[data-project-data-menu]")).toBeVisible();
    await expect(page.locator("[data-project-data-menu] > summary")).toHaveText("Project Data ▾");
    await page.locator("[data-project-data-menu] > summary").click();
    await expect(page.locator("[data-project-data-menu]")).toHaveAttribute("open", "");
    await expect(page.locator("[data-project-data-action]")).toHaveText([
      "Reset Project Data",
      "Seed Demo Project",
      "Clear Test Data"
    ]);
    const beforeProjectDataActions = await storageSnapshot(page);
    await page.getByRole("button", { name: "Reset Project Data" }).click();
    await page.getByRole("button", { name: "Seed Demo Project" }).click();
    await page.getByRole("button", { name: "Clear Test Data" }).click();
    expect(await storageSnapshot(page)).toEqual(beforeProjectDataActions);
    await expect(page.locator("[aria-label='Toolbox role simulation']")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 37/37");
    await expect(page.locator("[data-toolbox-admin-nav-group]")).toHaveCount(0);
    const adminLabels = await page.locator("main [data-tools-accordion-list] .control-card h3").evaluateAll((labels) => labels.map((label) => label.textContent.trim()));
    expect(adminLabels).toEqual(expect.arrayContaining([
      "Cloud",
      "Custom Extensions",
      "MIDI",
      "Particles"
    ]));
    expect(adminLabels).not.toEqual(expect.arrayContaining([
      "Users",
      "Environments",
      "Game Migration",
      "Platform Settings"
    ]));
    await page.getByRole("button", { name: "Group" }).click();
    const adminGroupLabels = await page.locator("[data-tools-accordion-list] details[data-tools-accordion]").evaluateAll((groups) => (
      groups.map((group) => group.dataset.toolsAccordion)
    ));
    expect(adminGroupLabels).toEqual(["AI", "Audio", "Build/Create", "Design", "Marketplace", "Platform", "Play"]);
    await expect(page.getByRole("button", { name: "Progress" })).toHaveCount(0);
    await page.getByRole("button", { name: "Build Path" }).click();
    await expect(page.locator("[data-build-path-table='workflow']")).toBeVisible();
    await page.locator("[data-toolbox-role-banner]").click();
    await page.waitForURL(/role=user/);
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveText("CREATOR VIEW • Project tools enabled • Switch to Admin View");
    await expect(page.locator("[data-project-data-menu]")).toBeHidden();
    await expect(page.locator("[data-project-data-action]:visible")).toHaveCount(0);
    await expect(page.locator("main").getByText("Users", { exact: true })).toHaveCount(0);
    await expect(page.locator("[data-toolbox-admin-nav-group]")).toHaveCount(0);
    await page.goto(`${server.baseUrl}/toolbox/index.html?role=guest`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveText("GUEST VIEW • Preview only • Sign in to create");
    await expect(page.locator("[data-project-data-menu]")).toBeHidden();
    await expect(page.locator("[data-project-data-action]:visible")).toHaveCount(0);
    await expect(page.locator("[aria-label='Toolbox role simulation']")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 30/37");
    await expect(page.locator("main").getByText("Users", { exact: true })).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("common header renders primary navigation order across active pages", async ({ page }) => {
  const server = await startRepoServer();
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
    "/admin/site-settings.html"
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

      for (const route of ["account", "admin", "games"]) {
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
      expect(bodyText.replace(/GameFoundryStudio/g, "").match(/\bStudio\b/g) || []).toEqual([]);

      if (pagePath === "/toolbox/index.html") {
        await expect(page.locator("[data-toolbox-role-banner]")).toHaveText("GUEST VIEW • Preview only • Sign in to create");
        await expect(page.locator("[data-toolbox-role-banner]")).toHaveClass(/status/);
        await expect(page.locator("[aria-label='Toolbox role simulation']")).toHaveClass(/callout/);
        const roleBannerIsFinalHeaderRow = await page.locator("[aria-label='Toolbox role simulation']").evaluate((row) => (
          (row.previousElementSibling?.matches("header.site-header") === true || row.previousElementSibling?.querySelector(":scope > header.site-header") !== null)
          && row.nextElementSibling?.tagName.toLowerCase() === "main"
        ));
        expect(roleBannerIsFinalHeaderRow).toBe(true);
      }
    }

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
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
      path: "/learn/project-workspace/index.html",
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
    const { failedRequests, pageErrors, server } = await openRepoPage(page, learnPage.path);

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
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  }
});

test("tool template future-state page loads from root Theme V2 paths", async ({ page }) => {
  const { failedRequests, pageErrors, server } = await openRepoPage(page, "/toolbox/_tool_template-v2/index.html");

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
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("active tool pages do not render placeholder center panel images", async ({ page }) => {
  const activeRoutes = getActiveToolRegistry()
    .map((tool) => getToolRoute(tool))
    .filter(Boolean);
  const { failedRequests, pageErrors, server } = await openRepoPage(page, `/${activeRoutes[0]}`);

  try {
    for (const route of activeRoutes) {
      await page.goto(`${server.baseUrl}/${route}`, { waitUntil: "networkidle" });
      await expect(page.locator(".tool-center-panel")).toBeVisible();
      await expect(page.locator(".tool-center-panel > img[src$='image-missing.svg']")).toHaveCount(0);
      await expect(page.locator(".tool-center-panel h1, .tool-center-panel h2, .tool-center-panel h3").first()).toBeVisible();
    }
    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
