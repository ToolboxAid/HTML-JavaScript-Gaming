import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";

const TOOL_IMAGE_FALLBACK = "/assets/theme-v2/images/image-missing.svg";

const GAME_DESIGN_CONSTANTS = {
  GAME_DESIGN_GAME_TYPES: ["Platformer"],
  GAME_DESIGN_GENRES: ["Adventure"],
  GAME_DESIGN_PLAYER_MODES: [{ label: "Single Player", value: "1 Player" }],
  GAME_DESIGN_PLAY_STYLES: ["Exploration"],
};

const GAME_DESIGN_SNAPSHOT = {
  activeDesign: null,
  activeGame: null,
  capabilityDemoGames: [],
  progressHandoff: {
    currentFocus: "Design",
    gameProgress: "Not started",
    progressChecklist: [],
    publishingProgress: "Not ready",
    recommendedNextTool: "Game Configuration",
  },
  tables: {},
};

const GAME_DESIGN_VALIDATION = {
  findings: [],
  status: "Ready",
};

const TOOL_REGISTRY_SNAPSHOT = {
  activeTools: [
    {
      displayName: "Build Game",
      folderName: "build-game",
      id: "build-game",
      imageSources: { badge: TOOL_IMAGE_FALLBACK, tool: TOOL_IMAGE_FALLBACK },
      name: "Build Game",
      path: "build-game",
      route: "/toolbox/build-game/index.html",
    },
    {
      displayName: "Game Design",
      folderName: "game-design",
      id: "game-design",
      imageSources: { badge: TOOL_IMAGE_FALLBACK, tool: TOOL_IMAGE_FALLBACK },
      name: "Game Design",
      path: "game-design",
      route: "/toolbox/game-design/index.html",
    },
    {
      displayName: "Game Hub",
      folderName: "game-hub",
      id: "game-hub",
      imageSources: { badge: TOOL_IMAGE_FALLBACK, tool: TOOL_IMAGE_FALLBACK },
      name: "Game Hub",
      path: "game-hub",
      route: "/toolbox/game-hub/index.html",
    },
  ],
  tools: [],
};

TOOL_REGISTRY_SNAPSHOT.tools = TOOL_REGISTRY_SNAPSHOT.activeTools;

async function openRepoPage(page, pathName) {
  const server = await startRepoServer();
  const pageErrors = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.route("**/api/toolbox/game-design/constants", async (route) => {
    await route.fulfill({ json: { data: GAME_DESIGN_CONSTANTS, ok: true } });
  });
  await page.route("**/api/public/config", async (route) => {
    await route.fulfill({
      json: {
        data: {
          environmentBanner: {
            active: true,
            message: "Development Environment",
            tone: "warning",
          },
          publicConfig: {},
        },
        ok: true,
      },
    });
  });
  await page.route("**/api/platform-settings/banner", async (route) => {
    await route.fulfill({
      json: {
        data: {
          banner: {
            active: false,
            message: "",
            tone: "info",
          },
          diagnostics: { active: false },
        },
        ok: true,
      },
    });
  });
  await page.route("**/api/toolbox/registry/snapshot", async (route) => {
    await route.fulfill({ json: { data: TOOL_REGISTRY_SNAPSHOT, ok: true } });
  });
  await page.route("**/api/toolbox/game-design/repositories", async (route) => {
    await route.fulfill({ json: { data: { repositoryId: "tool-display-mode-fixture" }, ok: true } });
  });
  await page.route("**/api/toolbox/game-design/repositories/**/methods/**", async (route) => {
    const methodName = decodeURIComponent(route.request().url().split("/methods/").pop() || "");
    const resultByMethod = {
      getSnapshot: GAME_DESIGN_SNAPSHOT,
      openGameContext: { message: "Opened fixture game." },
      saveDesign: { message: "Saved fixture design." },
      validateDesign: GAME_DESIGN_VALIDATION,
    };
    await route.fulfill({
      json: {
        data: { result: resultByMethod[methodName] || null },
        ok: true,
      },
    });
  });

  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { pageErrors, server };
}

function expectNoRuntimeErrors(failures) {
  expect(failures.pageErrors).toEqual([]);
}

async function platformBannerSnapshot(page) {
  await expect(page.locator("header.site-header")).toBeVisible();
  await expect(page.locator("[data-platform-banner-source='environment-config'][data-platform-banner-placement='header']")).toHaveCount(1);
  await expect(page.locator("[data-platform-banner-source='environment-config'][data-platform-banner-placement='footer']")).toHaveCount(1);
  return page.evaluate(() => {
    const header = document.querySelector("header.site-header");
    const headerBanner = document.querySelector("[data-platform-banner-source='environment-config'][data-platform-banner-placement='header']");
    const footerBanner = document.querySelector("[data-platform-banner-source='environment-config'][data-platform-banner-placement='footer']");
    const headerInner = headerBanner?.querySelector(".platform-banner__inner") || null;
    const headerMessage = headerBanner?.querySelector(".platform-banner__message") || null;
    const footerMessage = footerBanner?.querySelector(".platform-banner__message") || null;
    const nav = header?.querySelector(":scope > .container.nav") || null;
    const headerBox = header?.getBoundingClientRect();
    const headerBannerBox = headerBanner?.getBoundingClientRect();
    const footerBannerBox = footerBanner?.getBoundingClientRect();
    const headerInnerBox = headerInner?.getBoundingClientRect();
    const navBox = nav?.getBoundingClientRect();
    return {
      footerBannerDisplay: footerBanner ? getComputedStyle(footerBanner).display : "",
      footerBannerHeight: Number((footerBannerBox?.height || 0).toFixed(2)),
      footerBannerVisible: Boolean(footerBannerBox && footerBannerBox.width > 0 && footerBannerBox.height > 0),
      footerMessageText: footerMessage?.textContent?.trim() || "",
      headerBannerDisplay: headerBanner ? getComputedStyle(headerBanner).display : "",
      headerBannerHeight: Number((headerBannerBox?.height || 0).toFixed(2)),
      headerBannerVisible: Boolean(headerBannerBox && headerBannerBox.width > 0 && headerBannerBox.height > 0),
      headerVisible: Boolean(headerBox && headerBox.width > 0 && headerBox.height > 0),
      headerInnerDisplay: headerInner ? getComputedStyle(headerInner).display : "",
      headerInnerHeight: Number((headerInnerBox?.height || 0).toFixed(2)),
      headerInnerVisible: Boolean(headerInnerBox && headerInnerBox.width > 0 && headerInnerBox.height > 0),
      headerMessageText: headerMessage?.textContent?.trim() || "",
      navDisplay: nav ? getComputedStyle(nav).display : "",
      navVisible: Boolean(navBox && navBox.width > 0 && navBox.height > 0),
    };
  });
}

async function expectPlatformBannerMode(page, { focusMode }) {
  const snapshot = await platformBannerSnapshot(page);
  expect(snapshot.headerVisible).toBe(true);
  expect(snapshot.headerBannerDisplay).toBe("block");
  expect(snapshot.headerBannerVisible).toBe(true);
  expect(snapshot.headerMessageText).toBe("Development Environment");
  expect(snapshot.headerInnerDisplay).toBe("flex");
  expect(snapshot.headerInnerHeight).toBeGreaterThan(0);
  expect(snapshot.headerInnerVisible).toBe(true);
  expect(snapshot.footerMessageText).toBe("Development Environment");
  if (focusMode) {
    expect(snapshot.footerBannerDisplay).toBe("none");
    expect(snapshot.footerBannerHeight).toBe(0);
    expect(snapshot.footerBannerVisible).toBe(false);
    expect(snapshot.navDisplay).toBe("none");
    expect(snapshot.navVisible).toBe(false);
  } else {
    expect(snapshot.footerBannerDisplay).toBe("block");
    expect(snapshot.footerBannerHeight).toBeGreaterThan(0);
    expect(snapshot.footerBannerVisible).toBe(true);
    expect(snapshot.navDisplay).toBe("flex");
    expect(snapshot.navVisible).toBe(true);
  }
}

async function toolDisplayControlSnapshot(page) {
  return page.locator("#toolDisplayMode").evaluate((displayMode) => {
    const summary = displayMode.querySelector("summary");
    const badge = summary.querySelector(".tool-display-mode__badge");
    const fullscreenName = summary.querySelector(".tool-display-mode__fullscreen-name");
    const character = summary.querySelector(".tool-display-mode__character");
    const modeIcon = summary.querySelector(".tool-display-mode__mode-icon");
    const baseIcon = document.createElement("span");
    baseIcon.className = "layout-icon";
    baseIcon.style.display = "inline-block";
    baseIcon.style.position = "absolute";
    baseIcon.style.visibility = "hidden";
    const goldProbe = document.createElement("span");
    goldProbe.style.color = "var(--gold)";
    goldProbe.style.position = "absolute";
    goldProbe.style.visibility = "hidden";
    document.body.append(baseIcon, goldProbe);

    const displayModeBox = displayMode.getBoundingClientRect();
    const summaryBox = summary.getBoundingClientRect();
    const badgeBox = badge.getBoundingClientRect();
    const nameBox = fullscreenName.getBoundingClientRect();
    const characterBox = character.getBoundingClientRect();
    const iconBox = modeIcon.getBoundingClientRect();
    const baseBox = baseIcon.getBoundingClientRect();
    const summaryStyle = getComputedStyle(summary);
    const summaryContentRight = summaryBox.right - (parseFloat(summaryStyle.paddingRight) || 0);
    const summaryContentBox = {
      bottom: summaryBox.bottom - (parseFloat(summaryStyle.paddingBottom) || 0),
      left: summaryBox.left + (parseFloat(summaryStyle.paddingLeft) || 0),
      right: summaryBox.right - (parseFloat(summaryStyle.paddingRight) || 0),
      top: summaryBox.top + (parseFloat(summaryStyle.paddingTop) || 0),
    };
    const characterStyle = getComputedStyle(character);
    const characterVisible = characterStyle.display !== "none" && characterBox.width > 0 && characterBox.height > 0;
    const contentBoxes = [badgeBox, nameBox, iconBox];
    if (characterVisible) {
      contentBoxes.splice(2, 0, characterBox);
    }
    const boxesOverlap = (first, second) => !(
      first.right <= second.left ||
      second.right <= first.left ||
      first.bottom <= second.top ||
      second.bottom <= first.top
    );
    const contentContained = contentBoxes.every((box) => (
      box.left >= summaryContentBox.left - 1 &&
      box.right <= summaryContentBox.right + 1 &&
      box.top >= summaryContentBox.top - 1 &&
      box.bottom <= summaryContentBox.bottom + 1
    ));
    const contentDoesNotOverlap = contentBoxes.every((box, index) => (
      contentBoxes.slice(index + 1).every((otherBox) => !boxesOverlap(box, otherBox))
    ));
    const characterNaturalRatio = character.naturalWidth / character.naturalHeight;
    const sameVisualRow = contentBoxes.every((box) => {
      const itemCenter = box.top + (box.height / 2);
      const iconCenter = iconBox.top + (iconBox.height / 2);
      return Math.abs(itemCenter - iconCenter) <= 4;
    });
    const result = {
      badgeHeight: Number(badgeBox.height.toFixed(2)),
      badgeLeftAligned: Math.abs(badgeBox.left - summaryContentBox.left) <= 1,
      badgeWidth: Number(badgeBox.width.toFixed(2)),
      characterAfterName: characterBox.left >= nameBox.right - 1,
      characterDisplay: characterStyle.display,
      characterHeight: Number(characterBox.height.toFixed(2)),
      characterNaturalRatio: Number(characterNaturalRatio.toFixed(2)),
      characterRatio: Number((characterBox.width / characterBox.height).toFixed(2)),
      characterVisible,
      characterWidth: Number(characterBox.width.toFixed(2)),
      chevronCount: summary.querySelectorAll(".tool-display-mode__chevron").length,
      contentContained,
      contentDoesNotOverlap,
      controlRightAligned: Math.abs(summaryBox.right - displayModeBox.right) <= 3,
      displayModeChildren: Array.from(displayMode.children).map((child) => child.tagName.toLowerCase()),
      fullscreenNameDisplay: getComputedStyle(fullscreenName).display,
      fullscreenNameFlexGrow: getComputedStyle(fullscreenName).flexGrow,
      fullscreenNameJustifyContent: getComputedStyle(fullscreenName).justifyContent,
      fullscreenNameMinWidth: getComputedStyle(fullscreenName).minWidth,
      fullscreenNameTextAlign: getComputedStyle(fullscreenName).textAlign,
      goldColor: getComputedStyle(goldProbe).color,
      iconColor: getComputedStyle(modeIcon).color,
      iconFile: modeIcon.dataset.themeIconFile,
      iconHeightScale: Number((iconBox.height / baseBox.height).toFixed(2)),
      iconName: modeIcon.dataset.themeIcon,
      iconAnchoredToSummaryRight: Math.abs(iconBox.right - summaryContentRight) <= 3,
      iconWidthScale: Number((iconBox.width / baseBox.width).toFixed(2)),
      navigationRowCount: summary.querySelectorAll(".tool-display-mode__navigation-row").length,
      navigationTextRemoved: !/Previous:|Next:/.test(summary.textContent || ""),
      sameVisualRow,
      summaryDisplay: summaryStyle.display,
      summaryFlexDirection: summaryStyle.flexDirection,
      summaryFlexWrap: summaryStyle.flexWrap,
      summaryChildren: Array.from(summary.children).map((child) => ({
        className: child.className,
        tagName: child.tagName.toLowerCase(),
        themeIcon: child.dataset.themeIcon || "",
      })),
      summaryOrder: getComputedStyle(summary).order,
    };

    baseIcon.remove();
    goldProbe.remove();
    return result;
  });
}

async function expectToolDisplayControl(page, { badgeSize, characterVisible, characterWidth = 0, focusMode = false, iconFile, iconName }) {
  await expect(page.locator("#toolDisplayMode summary .tool-display-mode__navigation-row")).toHaveCount(0);
  await expect(page.locator("#toolDisplayMode summary")).not.toContainText(/Previous:|Next:/);
  const snapshot = await toolDisplayControlSnapshot(page);
  expect(snapshot.badgeHeight).toBeCloseTo(badgeSize, 0);
  expect(snapshot.badgeLeftAligned).toBe(true);
  expect(snapshot.badgeWidth).toBeCloseTo(badgeSize, 0);
  expect(snapshot.characterVisible).toBe(characterVisible);
  if (characterVisible) {
    expect(snapshot.characterDisplay).toBe("block");
    expect(snapshot.characterHeight).toBeCloseTo(characterWidth / snapshot.characterNaturalRatio, 0);
    expect(snapshot.characterRatio).toBeCloseTo(snapshot.characterNaturalRatio, 1);
    expect(snapshot.characterWidth).toBeCloseTo(characterWidth, 0);
  } else {
    expect(snapshot.characterDisplay).toBe("none");
    expect(snapshot.characterHeight).toBe(0);
    expect(snapshot.characterWidth).toBe(0);
  }
  expect(snapshot.chevronCount).toBe(0);
  expect(snapshot.contentContained).toBe(true);
  expect(snapshot.contentDoesNotOverlap).toBe(true);
  expect(snapshot.controlRightAligned).toBe(true);
  expect(snapshot.displayModeChildren).toEqual(["summary"]);
  expect(snapshot.fullscreenNameDisplay).toBe("flex");
  expect(snapshot.fullscreenNameFlexGrow).toBe("1");
  expect(snapshot.fullscreenNameMinWidth).toBe("0px");
  if (focusMode) {
    expect(snapshot.fullscreenNameJustifyContent).toBe("center");
    expect(snapshot.fullscreenNameTextAlign).toBe("center");
  }
  expect(snapshot.iconColor).toBe(snapshot.goldColor);
  expect(snapshot.iconFile).toBe(iconFile);
  expect(snapshot.iconName).toBe(iconName);
  expect(snapshot.iconAnchoredToSummaryRight).toBe(true);
  expect(snapshot.iconHeightScale).toBeGreaterThanOrEqual(2.55);
  expect(snapshot.iconHeightScale).toBeLessThanOrEqual(2.65);
  expect(snapshot.iconWidthScale).toBeGreaterThanOrEqual(2.55);
  expect(snapshot.iconWidthScale).toBeLessThanOrEqual(2.65);
  expect(snapshot.navigationRowCount).toBe(0);
  expect(snapshot.navigationTextRemoved).toBe(true);
  expect(snapshot.sameVisualRow).toBe(true);
  expect(snapshot.summaryDisplay).toBe("flex");
  expect(snapshot.summaryFlexDirection).toBe("row");
  expect(snapshot.summaryFlexWrap).toBe("wrap");
  expect(snapshot.summaryChildren).toEqual([
    { className: "tool-display-mode__badge", tagName: "img", themeIcon: "" },
    { className: "tool-display-mode__fullscreen-name", tagName: "span", themeIcon: "" },
    { className: "tool-display-mode__character", tagName: "img", themeIcon: "" },
    {
      className: `theme-icon theme-icon--${iconName} layout-icon tool-display-mode__mode-icon`,
      tagName: "span",
      themeIcon: iconName,
    },
  ]);
  expect(snapshot.summaryOrder).toBe("0");
}

async function expectModeIconUsesAutoMargin() {
  const css = await fs.readFile("assets/theme-v2/css/panels.css", "utf8");
  const layoutCss = await fs.readFile("assets/theme-v2/css/layout.css", "utf8");
  const statusCss = await fs.readFile("assets/theme-v2/css/status.css", "utf8");
  const js = await fs.readFile("assets/theme-v2/js/tool-display-mode.js", "utf8");
  expect(css).toMatch(/\.tool-display-mode__mode-icon\s*{[^}]*margin-left:\s*auto;/s);
  expect(css).not.toMatch(/\.tool-display-mode__(body|identity-row|description|navigation-row|navigation-link|navigation-icon)\b/);
  expect(layoutCss).toMatch(/body\.tool-focus-mode\s+\.site-header\s*>\s*\.container\.nav\s*{[^}]*display:\s*none\s*!important/s);
  expect(statusCss).not.toMatch(/tool-focus-mode\s+\.platform-banner__inner/);
  expect(statusCss).toMatch(/body\.tool-focus-mode\s+\[data-platform-banner-placement="footer"\]\s*{[^}]*display:\s*none\s*!important/s);
  expect(js).not.toMatch(/tool-display-mode__navigation-row|Previous:|Next:|getToolNavigationTargets|createNavigationControl/);
}

test("shared Tool Display Mode uses the final single-line layout behavior", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html");

  try {
    await expectPlatformBannerMode(page, { focusMode: false });
    await expect(page.locator("#toolDisplayMode summary [data-theme-icon='fullscreen']")).toBeVisible();
    await expectToolDisplayControl(page, {
      badgeSize: 128,
      characterVisible: true,
      characterWidth: 224,
      iconFile: "gfs-fullscreen.svg",
      iconName: "fullscreen",
    });
    await expectModeIconUsesAutoMargin();

    await page.locator("#toolDisplayMode summary").click();
    await expect(page.locator("body")).toHaveClass(/tool-focus-mode/);
    await expectPlatformBannerMode(page, { focusMode: true });
    await expectToolDisplayControl(page, {
      badgeSize: 64,
      characterVisible: false,
      focusMode: true,
      iconFile: "gfs-exit-fullscreen.svg",
      iconName: "exit-fullscreen",
    });

    await page.locator("#toolDisplayMode summary").click();
    await expect(page.locator("body")).not.toHaveClass(/tool-focus-mode/);
    await expectPlatformBannerMode(page, { focusMode: false });
    await expectToolDisplayControl(page, {
      badgeSize: 128,
      characterVisible: true,
      characterWidth: 224,
      iconFile: "gfs-fullscreen.svg",
      iconName: "fullscreen",
    });

    expectNoRuntimeErrors(failures);
  } finally {
    await failures.server.close();
  }
});
