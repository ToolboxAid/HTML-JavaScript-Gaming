import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

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

test("root tools surface links current tool pages without old_* routes", async ({ page }) => {
  const { failedRequests, pageErrors, server } = await openRepoPage(page, "/toolbox/index.html");

  try {
    await expect(page.locator("[data-tools-accordion-list] .control-card")).not.toHaveCount(0);
    await expect(page.getByRole("button", { name: /Order/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Group/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Progress" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Build Path" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Progress" })).not.toHaveAttribute("aria-disabled", "true");
    await expect(page.getByRole("button", { name: "Build Path" })).not.toHaveAttribute("aria-disabled", "true");
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 30/37");
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveText("GUEST VIEW • Preview only • Sign in to create");
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveAttribute("href", /role=user/);
    await expect(page.locator("[aria-label='Toolbox role simulation']")).toHaveClass(/callout/);
    await expect(page.locator("[aria-label='Toolbox role simulation']")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(page.locator("[data-toolbox-admin-nav-group]")).toHaveCount(0);
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='admin']")).toHaveCount(1);
    await expect(page.locator("nav.nav-links > a[data-route='learn']")).toHaveCount(1);
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
    expect(defaultToolLabels.filter((label) => ["Vector", "Tilemap", "Isometric", "Hex"].includes(label))).toEqual([]);
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
    await expect(assetsCard).toHaveClass(/(^|\s)tool-group-content(\s|$)/);
    const allCardsHaveGroupClass = await page.locator("main [data-tools-accordion-list] .control-card").evaluateAll((cards) => (
      cards.every((card) => Array.from(card.classList).some((className) => className.startsWith("tool-group-")))
    ));
    expect(allCardsHaveGroupClass).toBe(true);
    const assetsBorderColor = await assetsCard.evaluate((card) => getComputedStyle(card).borderColor);
    expect(assetsBorderColor).not.toBe("rgba(0, 0, 0, 0)");
    await expect(assetsCard.locator(".card-body > .content-cluster")).toContainText("Content");
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
    await expect(worldsCard).toHaveClass(/(^|\s)tool-group-create(\s|$)/);
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
    expect(guestGroupLabels).toEqual(["Create", "Build", "Content", "Media", "Test", "Share", "Account"]);
    await expect(page.locator("[data-tools-accordion='Admin']")).toHaveCount(0);
    await page.getByRole("button", { name: "Progress" }).click();
    await expect(page.locator("[data-tools-accordion-list] [data-toolbox-readiness='locked']").first()).toBeVisible();
    await expect(page.locator("[data-tools-accordion-list] [data-toolbox-readiness='ready']").first()).toBeVisible();
    await expect(page.locator("[data-tools-accordion-list] [data-toolbox-readiness='in-progress']").first()).toBeVisible();
    await expect(page.locator("[data-tools-accordion-list] [data-toolbox-readiness='complete']").first()).toBeVisible();
    await expect(page.locator("[data-tools-accordion-list] .control-card h3", { hasText: /^Progress$/ })).toHaveCount(0);
    await expect(page.getByText("Project Progress: Core path in-progress")).toBeVisible();
    await expect(page.getByText("Publishing Progress: Publish blocked until configuration and required assets are ready")).toBeVisible();
    await expect(page.getByText("Current Focus: Complete Game Configuration")).toBeVisible();
    await expect(page.getByText("Recommended Next Tool: Build Game")).toBeVisible();
    await expect(page.getByText(/requiredForTestable:/).first()).toBeVisible();
    await expect(page.getByText(/requiredForPublish:/).first()).toBeVisible();
    await page.getByRole("button", { name: "Build Path" }).click();
    await expect(page.locator("[data-tools-accordion='Project Workspace']")).toBeVisible();
    await expect(page.locator("[data-tools-accordion='Game Design']")).toBeVisible();
    await expect(page.locator("[data-tools-accordion='Game Configuration']")).toBeVisible();
    await expect(page.locator("[data-tools-accordion='Required Tool Path']")).toBeVisible();
    await expect(page.locator("[data-tools-accordion='Build Game']")).toBeVisible();
    await expect(page.locator("[data-tools-accordion='Game Testing']")).toBeVisible();
    await expect(page.locator("[data-tools-accordion='Publish']")).toBeVisible();
    await expect(page.getByText("Build Game is the package and playable-output checkpoint for this wireframe.")).toBeVisible();
    await expect(page.getByText("Game Testing collects test readiness, hitboxes, debug policy, performance checks, and event review.")).toBeVisible();
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
    await expect(page.locator("[aria-label='Toolbox role simulation']")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 30/37");
    await expect(page.locator("main").getByText("Users", { exact: true })).toHaveCount(0);
    await expect(page.locator("[data-toolbox-admin-nav-group]")).toHaveCount(0);
    await page.locator("[data-toolbox-role-banner]").click();
    await page.waitForURL(/role=admin/);
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveText("ADMIN VIEW • Planned tools visible • Switch to Creator View");
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
    expect(adminGroupLabels).toEqual(["Create", "Build", "Content", "Media", "Test", "Share", "Account"]);
    await page.locator("[data-toolbox-role-banner]").click();
    await page.waitForURL(/role=user/);
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveText("CREATOR VIEW • Project tools enabled • Switch to Admin View");
    await expect(page.locator("main").getByText("Users", { exact: true })).toHaveCount(0);
    await expect(page.locator("[data-toolbox-admin-nav-group]")).toHaveCount(0);
    await page.goto(`${server.baseUrl}/toolbox/index.html?role=guest`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveText("GUEST VIEW • Preview only • Sign in to create");
    await expect(page.locator("[aria-label='Toolbox role simulation']")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 30/37");
    await expect(page.locator("main").getByText("Users", { exact: true })).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("learn wireframe pages load with shared Theme V2 structure", async ({ page }) => {
  const learnPages = [
    {
      path: "/learn/index.html",
      headings: ["Search documentation", "Browse by tool", "Tutorials", "Videos", "Examples", "FAQ"]
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
