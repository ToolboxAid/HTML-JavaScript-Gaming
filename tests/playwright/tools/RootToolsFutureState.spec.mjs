import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";
import { getActiveToolRegistry, getToolRoute } from "../../../toolbox/toolRegistry.js";

const PRIMARY_NAVIGATION_ORDER = ["Games", "Toolbox", "Marketplace", "Learn", "Login", "Admin"];

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

test("root tools surface links current tool pages without old_* routes", async ({ page }) => {
  const { failedRequests, pageErrors, server } = await openRepoPage(page, "/toolbox/index.html");

  try {
    await expect(page.locator("[data-tools-accordion-list] .control-card")).not.toHaveCount(0);
    await expect(page.getByRole("button", { name: /Order/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Group/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Progress" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Build Path" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Build Path" })).not.toHaveAttribute("aria-disabled", "true");
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 4/37");
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
    const readyProjectWorkspaceCard = page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: "Project Workspace" })
    });
    await expect(readyProjectWorkspaceCard.locator("a.btn")).toHaveAttribute("href", "../toolbox/project-workspace/index.html");
    const defaultToolLabels = await page.locator("main [data-tools-accordion-list] .control-card h3").evaluateAll((labels) => labels.map((label) => label.textContent.trim()));
    expect(defaultToolLabels).toEqual(["Assets", "Game Configuration", "Game Design", "Project Workspace"]);
    await expect(page.locator("[data-toolbox-readiness]")).toHaveText(["Ready", "Ready", "Ready", "Ready"]);
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^AI Assistant$/ }) })).toHaveCount(0);
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
    const designCard = page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Game Design$/ })
    }).first();
    await expect(designCard).toHaveClass(/(^|\s)tool-group-design(\s|$)/);
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
    await expect(designActionRow.locator(".brand-color-swatch")).toHaveClass(/swatch-pink/);
    await expect(designActionRow.locator("[data-toolbox-readiness]")).toHaveText("Ready");
    await expect(designCard.locator("ul")).toHaveCount(0);
    const designBodyOrder = await designCard.locator(".card-body").evaluate((body) => (
      Array.from(body.children).map((child) => child.classList.contains("content-cluster") ? "content-cluster" : child.tagName.toLowerCase())
    ));
    expect(designBodyOrder).toEqual(["h3", "p", "content-cluster"]);
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
    expect(guestGroupLabels).toEqual(["Build/Create", "Design"]);
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

    await page.goto(`${server.baseUrl}/toolbox/index.html?role=user`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 4/37");
    await expect(page.locator("main").getByText("Users", { exact: true })).toHaveCount(0);
    await expect(page.locator("[data-toolbox-admin-nav-group]")).toHaveCount(0);
    await page.goto(`${server.baseUrl}/toolbox/index.html?role=admin`, { waitUntil: "networkidle" });
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
    await expect(page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Project Workspace$/ })
    }).locator("[data-toolbox-readiness]")).toHaveText("Ready");
    await expect(page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Game Configuration$/ })
    }).locator("[data-toolbox-readiness]")).toHaveText("Ready");
    await expect(page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Assets$/ })
    }).locator("[data-toolbox-readiness]")).toHaveText("Ready");
    await expect(page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Build Game$/ })
    }).locator("[data-toolbox-readiness]")).toHaveText("Planned");
    await expect(page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Cloud$/ })
    }).locator("[data-toolbox-readiness]")).toHaveText("Hidden");
    const worldsCard = page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Worlds$/ })
    }).first();
    await expect(worldsCard).toHaveClass(/(^|\s)tool-group-design(\s|$)/);
    await expect(worldsCard.locator("[data-toolbox-readiness]")).toHaveText("Wireframe");
    await expect(worldsCard.locator("[data-child-capabilities='Worlds']")).toHaveText("Planned world types: Vector, Tilemap, Isometric, Hex");
    await expect(worldsCard.locator("ul")).toHaveCount(0);
    const worldsBodyOrder = await worldsCard.locator(".card-body").evaluate((body) => (
      Array.from(body.children).map((child) => child.hasAttribute("data-toolbox-tile-values") ? "values" : child.classList.contains("content-cluster") ? "content-cluster" : child.tagName.toLowerCase())
    ));
    expect(worldsBodyOrder.at(-1)).toBe("values");
    const objectsCard = page.locator("main .control-card").filter({
      has: page.locator("h3", { hasText: /^Objects$/ })
    }).first();
    await expect(objectsCard).toContainText("Planned object types");
    await expect(objectsCard.locator("[data-child-capabilities='Objects']")).toHaveText("Planned object types: Vector, Sprite, Character, Enemy, Interactive");
    await page.getByRole("button", { name: "Group" }).click();
    const adminGroupLabels = await page.locator("[data-tools-accordion-list] details[data-tools-accordion]").evaluateAll((groups) => (
      groups.map((group) => group.dataset.toolsAccordion)
    ));
    expect(adminGroupLabels).toEqual(["AI", "Audio", "Build/Create", "Design", "Marketplace", "Platform", "Play"]);
    await expect(page.getByRole("button", { name: "Progress" })).toHaveCount(0);
    await page.getByRole("button", { name: "Build Path" }).click();
    await expect(page.locator("[data-build-path-table='workflow']")).toBeVisible();
    await page.goto(`${server.baseUrl}/toolbox/index.html?role=user`, { waitUntil: "networkidle" });
    await expect(page.locator("main").getByText("Users", { exact: true })).toHaveCount(0);
    await expect(page.locator("[data-toolbox-admin-nav-group]")).toHaveCount(0);
    await page.goto(`${server.baseUrl}/toolbox/index.html?role=guest`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 4/37");
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
        await expect(page.locator("[data-tools-count]")).toBeVisible();
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

test("representative active tool pages align center cleanup and registry group colors", async ({ page }) => {
  const representativeToolIds = [
    "ai-assistant",
    "project-workspace",
    "game-design",
    "colors",
    "audio",
    "game-testing",
    "controls",
    "publish"
  ];
  const activeTools = getActiveToolRegistry()
    .filter((tool) => representativeToolIds.includes(tool.id))
    .map((tool) => ({ ...tool, route: getToolRoute(tool) }))
    .filter((tool) => Boolean(tool.route));
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
  const { failedRequests, pageErrors, server } = await openRepoPage(page, "/toolbox/index.html?role=admin&view=group");

  try {
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
    expect(toolboxCardGroupClasses.every((className) => ssotGroupClasses.includes(className))).toBe(true);
    expect(toolboxCardGroupClasses.filter((className) => legacyGroupClasses.includes(className))).toEqual([]);

    for (const tool of activeTools) {
      await page.goto(`${server.baseUrl}/${tool.route}`, { waitUntil: "networkidle" });
      await expect(page.locator(".tool-center-panel")).toBeVisible();
      await expect(page.locator(".tool-center-panel > img[src$='image-missing.svg']")).toHaveCount(0);
      await expect(page.locator(".tool-center-panel h1, .tool-center-panel h2, .tool-center-panel h3").first()).toBeVisible();

      const expectedFromToolboxGroup = toolboxGroupCardStyles.get(tool.displayName);
      const expectedGroupClass = expectedFromToolboxGroup?.groupClass || tool.colorGroup;
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

      if (expectedFromToolboxGroup) {
        expect(sidePanelStyles.map((styles) => styles.borderColor)).toEqual([
          expectedFromToolboxGroup.borderColor,
          expectedFromToolboxGroup.borderColor
        ]);
        expect(sidePanelStyles.map((styles) => styles.headerColor)).toEqual([
          expectedFromToolboxGroup.borderColor,
          expectedFromToolboxGroup.borderColor
        ]);
        expect(sidePanelHrColors).toEqual([
          expectedFromToolboxGroup.borderColor,
          expectedFromToolboxGroup.borderColor
        ]);
      }
    }

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
