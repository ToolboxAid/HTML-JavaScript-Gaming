import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../../api/persistence/mock-db-store.js";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const IDEA_BOARD_EDITABLE_STATUS_OPTIONS = ["New", "Exploring", "Refining", "Ready"];
const IDEA_BOARD_FILTER_STATUS_OPTIONS = ["New", "Exploring", "Refining", "Ready", "Project", "Archived"];
const INLINE_STYLE_ATTRIBUTE_PATTERN = new RegExp("\\s" + "sty" + "le=", "i");
const INLINE_STYLE_TAG_PATTERN = new RegExp("<" + "sty" + "le[\\s>]", "i");

const TOOL_ROUTE_SMOKE_CASES = [
  { heading: "Game Journey", route: "/tools/game-journey/index.html" },
  { heading: "Idea Board", route: "/tools/idea-board/index.html" },
  { heading: "Colors", route: "/tools/colors/index.html" },
  { heading: "Assets", route: "/tools/assets/index.html" },
  { heading: "Tags", route: "/tools/tags/index.html" },
  { heading: "Achievements", route: "/tools/achievements/index.html" },
  { heading: "Build Game", route: "/tools/build-game/index.html" },
  { heading: "Saved Data", route: "/tools/saved-data/index.html" },
  { heading: "Languages", route: "/tools/languages/index.html" },
];

const STATUS_HELP_TEXT = Object.freeze({
  planned: "Not designed yet.\nNo meaningful UI.\nNo ownership defined.",
  wireframe: "Tool exists.\nUser can understand workflow.\nData ownership is defined.\nNot functionally usable.",
  beta: "Functionally usable.\nCan be used in a real game.\nMay still contain incomplete workflows, placeholder data, UI cleanup issues, unused fields, missing validation, or incomplete code review.",
  complete: "Functionally usable.\nCode reviewed.\nDead code removed.\nInvalid fields removed.\nUI cleaned up.\nNo known placeholder data.\nNo known invalid controls.\nReady for long-term support.",
  deprecated: "Tool remains supported but is not recommended for new workflows.\nMust remain deprecated before removal.",
});

const GAME_JOURNEY_GROUP_ORDER = Object.freeze([
  "Idea",
  "Design",
  "Graphics",
  "Audio",
  "Objects",
  "Worlds",
  "Interface",
  "Controls",
  "Rules",
  "Progression",
  "Play Test",
  "Publish",
  "Share",
]);

const GAME_JOURNEY_ACCORDION_LABELS = Object.freeze([
  "0% Complete — Idea: Dream, brainstorm, and explore",
  "0% Complete — Design: Shape your game's story and systems",
  "0% Complete — Graphics: Create the visual look of your game",
  "0% Complete — Audio: Build sounds, music, and voices",
  "0% Complete — Objects: Create the things players interact with",
  "0% Complete — Worlds: Build levels, maps, and places to explore",
  "0% Complete — Interface: Design menus, HUDs, and player screens",
  "0% Complete — Controls: Define how players interact with your game",
  "0% Complete — Rules: Create gameplay behavior and events",
  "0% Complete — Progression: Build rewards, unlocks, and advancement",
  "0% Complete — Play Test: Test, debug, and improve your game",
  "0% Complete — Publish: Prepare and release your game",
  "0% Complete — Share: Grow your audience and community",
]);

const GAME_JOURNEY_GROUP_COLORS = Object.freeze({
  "Idea": { hex: "#FF2D2D", rgb: "rgb(255, 45, 45)" },
  "Design": { hex: "#FF7A00", rgb: "rgb(255, 122, 0)" },
  "Graphics": { hex: "#FFC857", rgb: "rgb(255, 200, 87)" },
  "Audio": { hex: "#FACC15", rgb: "rgb(250, 204, 21)" },
  "Objects": { hex: "#A3E635", rgb: "rgb(163, 230, 53)" },
  "Worlds": { hex: "#7DD957", rgb: "rgb(125, 217, 87)" },
  "Interface": { hex: "#2DD4BF", rgb: "rgb(45, 212, 191)" },
  "Controls": { hex: "#20D6FF", rgb: "rgb(32, 214, 255)" },
  "Rules": { hex: "#4DA3FF", rgb: "rgb(77, 163, 255)" },
  "Progression": { hex: "#818CF8", rgb: "rgb(129, 140, 248)" },
  "Play Test": { hex: "#B877FF", rgb: "rgb(184, 119, 255)" },
  "Publish": { hex: "#D946EF", rgb: "rgb(217, 70, 239)" },
  "Share": { hex: "#FF4F8B", rgb: "rgb(255, 79, 139)" },
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

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

async function fetchApiData(server, pathName) {
  const response = await fetch(`${server.baseUrl}${pathName}`, {
    headers: { "content-type": "application/json" },
  });
  const payload = await response.json();
  expect(response.ok, JSON.stringify(payload)).toBe(true);
  expect(payload.ok, JSON.stringify(payload)).toBe(true);
  return payload.data;
}

async function postApiData(server, pathName, body) {
  const response = await fetch(`${server.baseUrl}${pathName}`, {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const payload = await response.json();
  expect(response.ok, JSON.stringify(payload)).toBe(true);
  expect(payload.ok, JSON.stringify(payload)).toBe(true);
  return payload.data;
}

async function toolMetadataById(server) {
  const snapshot = await fetchApiData(server, "/api/toolbox/registry/snapshot");
  return new Map(snapshot.activeTools.map((tool) => [tool.id, tool]));
}

async function restoreColorsToolMetadata(server) {
  await postApiData(server, "/api/toolbox/votes/metadata", {
    group: "Design",
    path: "toolbox/colors/index.html",
    releaseChannel: "complete",
    status: "complete",
    toolId: "colors",
  });
}

function votePercent(count, total) {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

function voteCountFromText(text, label) {
  const match = String(text || "").trim().match(new RegExp(`^${label} (\\d+)$`));
  expect(match).not.toBeNull();
  return Number.parseInt(match[1], 10);
}

async function voteControlState(voteControls) {
  const upVote = voteControls.locator("[data-toolbox-vote='up']");
  const downVote = voteControls.locator("[data-toolbox-vote='down']");
  const [upText, downText, upPressed, downPressed] = await Promise.all([
    upVote.textContent(),
    downVote.textContent(),
    upVote.getAttribute("aria-pressed"),
    downVote.getAttribute("aria-pressed"),
  ]);
  return {
    currentVote: upPressed === "true" ? "up" : downPressed === "true" ? "down" : "",
    down: voteCountFromText(downText, "Down"),
    up: voteCountFromText(upText, "Up"),
  };
}

function applyVoteState(state, direction) {
  const next = {
    currentVote: direction,
    down: state.down,
    up: state.up,
  };
  if (state.currentVote === direction) {
    return next;
  }
  if (state.currentVote === "up") {
    next.up = Math.max(0, next.up - 1);
  }
  if (state.currentVote === "down") {
    next.down = Math.max(0, next.down - 1);
  }
  if (direction === "up") {
    next.up += 1;
  }
  if (direction === "down") {
    next.down += 1;
  }
  return next;
}

async function expectVoteControlState(voteControls, expected) {
  const upVote = voteControls.locator("[data-toolbox-vote='up']");
  const downVote = voteControls.locator("[data-toolbox-vote='down']");
  await expect(upVote).toHaveText(`Up ${expected.up}`);
  await expect(downVote).toHaveText(`Down ${expected.down}`);
  await expect(upVote).toHaveAttribute("aria-pressed", String(expected.currentVote === "up"));
  await expect(downVote).toHaveAttribute("aria-pressed", String(expected.currentVote === "down"));
  if (expected.currentVote === "up") {
    await expect(upVote).toHaveClass(/primary/);
    await expect(downVote).not.toHaveClass(/primary/);
    return;
  }
  if (expected.currentVote === "down") {
    await expect(upVote).not.toHaveClass(/primary/);
    await expect(downVote).toHaveClass(/primary/);
    return;
  }
  await expect(upVote).not.toHaveClass(/primary/);
  await expect(downVote).not.toHaveClass(/primary/);
}

async function expectAdminVoteRowState(voteRow, expected) {
  const total = expected.up + expected.down;
  await expect(voteRow.locator("td").nth(5)).toHaveText(String(expected.up));
  await expect(voteRow.locator("td").nth(6)).toHaveText(String(expected.down));
  await expect(voteRow.locator("td").nth(7)).toHaveText(String(total));
  await expect(voteRow.locator("td").nth(8)).toHaveText(`${votePercent(expected.up, total)}%`);
  await expect(voteRow.locator("td").nth(9)).toHaveText(`${votePercent(expected.down, total)}%`);
  await expect(voteRow.locator("td").nth(10)).toHaveText(expected.currentVote || "None");
}

function voteStateFromSnapshot(snapshot, toolId) {
  const row = snapshot.rows.find((voteRow) => voteRow.toolId === toolId);
  expect(row).toBeTruthy();
  return {
    currentVote: row.currentUserVote || "",
    down: Number(row.down) || 0,
    up: Number(row.up) || 0,
  };
}

function restoreEnvValue(key, value) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}

async function expectIdeaChevron(page, ideaId, iconName) {
  const metrics = await page.locator(`[data-idea-board-idea-row='${ideaId}'] th`).evaluate((cell, targetIdeaId) => {
    const label = cell.querySelector(".idea-board-idea-label");
    const text = label.querySelector(".idea-board-idea-label__text");
    const icon = cell.querySelector(`[data-idea-board-chevron='${targetIdeaId}']`);
    const cellStyles = getComputedStyle(cell);
    const labelStyles = getComputedStyle(label);
    const iconStyles = getComputedStyle(icon);
    return {
      iconName: icon.dataset.ideaBoardChevronIcon,
      labelDisplay: labelStyles.display,
      iconWidth: Number.parseFloat(iconStyles.width),
      iconHeight: Number.parseFloat(iconStyles.height),
      fontSize: Number.parseFloat(cellStyles.fontSize),
      iconColor: iconStyles.backgroundColor,
      iconBeforeText: Boolean(icon.compareDocumentPosition(text) & Node.DOCUMENT_POSITION_FOLLOWING),
      iconVerticalAlign: Number.parseFloat(iconStyles.verticalAlign),
      textColor: cellStyles.color,
      maskImage: iconStyles.getPropertyValue("-webkit-mask-image") || iconStyles.maskImage,
    };
  }, ideaId);
  expect(metrics.iconName).toBe(iconName);
  expect(metrics.labelDisplay).toBe("inline");
  expect(Math.abs(metrics.iconWidth - metrics.fontSize)).toBeLessThanOrEqual(1);
  expect(Math.abs(metrics.iconHeight - metrics.fontSize)).toBeLessThanOrEqual(1);
  expect(metrics.iconColor).toBe(metrics.textColor);
  expect(metrics.iconBeforeText).toBe(true);
  expect(metrics.iconVerticalAlign).toBeLessThan(0);
  expect(metrics.maskImage).toContain(iconName);
}

async function expectButtonLeftAligned(page, buttonSelector, containerSelector) {
  const metrics = await page.locator(buttonSelector).evaluate((button, selector) => {
    const container = button.ownerDocument.querySelector(selector);
    const buttonRect = button.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const containerStyles = getComputedStyle(container);
    return {
      buttonLeft: buttonRect.left,
      containerLeft: containerRect.left,
      containerWidth: containerRect.width,
      expectedLeft: containerRect.left + Number.parseFloat(containerStyles.paddingLeft || "0"),
    };
  }, containerSelector);
  expect(Math.abs(metrics.buttonLeft - metrics.expectedLeft)).toBeLessThanOrEqual(2);
  expect(metrics.buttonLeft).toBeLessThan(metrics.containerLeft + metrics.containerWidth / 2);
}

async function expectExpandedNotesChildIndentation(page, ideaId, expectedInputRows = 0) {
  const metrics = await page.locator(`[data-idea-board-expanded-row='${ideaId}']`).evaluate((row, targetIdeaId) => {
    const expandedCell = row.querySelector(":scope > td");
    const childSurface = row.querySelector(".idea-board-notes-child-surface");
    const noteCell = row.querySelector(`[data-idea-board-notes-table='${targetIdeaId}'] tbody tr td:first-child`);
    const noteInput = row.querySelector("[data-idea-board-note-input]");
    const addNote = row.querySelector(`[data-idea-board-add-note='${targetIdeaId}']`);
    const addNoteActions = row.querySelector(".idea-board-notes-child-actions");
    const expandedStyles = getComputedStyle(expandedCell);
    const noteCellStyles = getComputedStyle(noteCell);
    const addNoteActionStyles = getComputedStyle(addNoteActions);
    const expandedRect = expandedCell.getBoundingClientRect();
    const childRect = childSurface.getBoundingClientRect();
    const noteCellRect = noteCell.getBoundingClientRect();
    const expandedPadding = Number.parseFloat(expandedStyles.paddingLeft || "0");
    const noteCellPadding = Number.parseFloat(noteCellStyles.paddingLeft || "0");
    return {
      addNoteLeft: addNote.getBoundingClientRect().left,
      childSurfaceLeft: childRect.left,
      expandedContentLeft: expandedRect.left + expandedPadding,
      expectedContentLeft: expandedRect.left + 2 * (expandedPadding + noteCellPadding),
      inputLeft: noteInput ? noteInput.getBoundingClientRect().left : null,
      inputRows: row.querySelectorAll("[data-idea-board-note-input-row]").length,
      noteContentLeft: noteCellRect.left + noteCellPadding,
      actionContentLeft: addNoteActions.getBoundingClientRect().left + Number.parseFloat(addNoteActionStyles.paddingLeft || "0"),
    };
  }, ideaId);
  expect(metrics.childSurfaceLeft).toBeGreaterThan(metrics.expandedContentLeft);
  expect(Math.abs(metrics.noteContentLeft - metrics.expectedContentLeft)).toBeLessThanOrEqual(2);
  expect(Math.abs(metrics.addNoteLeft - metrics.expectedContentLeft)).toBeLessThanOrEqual(2);
  expect(Math.abs(metrics.actionContentLeft - metrics.expectedContentLeft)).toBeLessThanOrEqual(2);
  expect(metrics.inputRows).toBe(expectedInputRows);
  if (expectedInputRows > 0) {
    expect(Math.abs(metrics.inputLeft - metrics.expectedContentLeft)).toBeLessThanOrEqual(2);
  }
}

async function expectIdeaBoardProductionCopy(page) {
  await expect(page.locator("main")).not.toContainText(
    /\bDB-shaped\b|\bin-page data model\b|\buserId\b|\bideaId\b|\bnoteId\b|\bsystem flag\b|\bmetadata\b|\bseed\b|\bdebug\b|\bselected context\b|\bmock\b|\btest\b|\binternal implementation\b|\bplaceholder\b|\bproject records\b|\bmutating API\b|\bserver\b|\bAPI\b|\blocal server\b|\bport\b|\bunderlying systems\b|\bauth\b|\bAI\b|\bdatabase behavior\b/i,
  );
}

async function expectNoToolNavigationFallbackUi(page) {
  await expect(page.locator("body")).not.toContainText("Tool navigation is temporarily unavailable. Refresh the page or try again shortly.");
  await expect(page.locator(".tool-display-mode")).not.toContainText(/\bserver\b|\bAPI\b|\blocal server\b|\bport\b|\bregistry\b|\bsnapshot\b/i);
}

test("tools route aliases render toolbox tool pages", async ({ page }) => {
  const server = await startRepoServer();
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
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
    await workspaceV2CoverageReporter.start(page);
    for (const { heading, route } of TOOL_ROUTE_SMOKE_CASES) {
      await page.goto(`${server.baseUrl}${route}`, { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("[data-return-to-top] [data-theme-icon='chevron-up']")).toHaveAttribute("data-theme-icon-file", "gfs-chevron-up.svg");
    }

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
  }
});

test("Idea Board launches from Toolbox with accordion table notes model", async ({ page }) => {
  const server = await startRepoServer();
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];
  const mutatingApiRequests = [];

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
    await workspaceV2CoverageReporter.start(page);
    await setServerSession(server, MOCK_DB_KEYS.users.user1);
    page.on("request", (request) => {
      const requestUrl = request.url();
      if (requestUrl.includes("/api/") && request.method() !== "GET" && !requestUrl.includes("/methods/getActiveGame")) {
        mutatingApiRequests.push(`${request.method()} ${requestUrl}`);
      }
    });
    await page.goto(`${server.baseUrl}/toolbox/index.html?view=group&group=idea`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-tools-count]")).toContainText("Tool Count:");
    await expect(page.locator("[data-tools-accordion='Idea']")).toHaveCount(1);
    await expect(page.locator("[data-tools-accordion='Idea']")).toBeVisible();
    await expect(page.locator("[data-tools-accordion='Idea']")).toHaveJSProperty("open", true);
    const ideaBoardLink = page.locator("[data-toolbox-tool-name-link='Idea Board']");
    await expect(ideaBoardLink).toBeVisible();
    await expect(ideaBoardLink).toHaveAttribute("href", "/toolbox/idea-board/index.html");
    await expect(ideaBoardLink).toHaveAttribute("data-registered-tool-route", "toolbox/idea-board/index.html");

    await ideaBoardLink.click();
    await page.waitForURL(/\/toolbox\/idea-board\/index\.html$/);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { level: 1, name: "Idea Board" })).toBeVisible();
    await expectIdeaBoardProductionCopy(page);
    await expectNoToolNavigationFallbackUi(page);
    const ideaBoardSections = await page.locator("[data-idea-board-section]").evaluateAll((sections) => (
      sections.map((section) => section.getAttribute("data-idea-board-section"))
    ));
    expect(ideaBoardSections).toEqual([
      "Status Filter",
      "Status",
      "Workflow",
      "Idea Table",
      "Notes Governance",
      "Diagnostics",
    ]);
    await expect(page.locator("[data-idea-board-table]")).toBeVisible();
    await expect(page.locator("[data-idea-board-table] > thead th[scope='col']")).toHaveText(["Idea", "Pitch", "Status", "Notes", "Actions"]);
    await expect(page.locator("[data-idea-board-status-filter-option]")).toHaveCount(IDEA_BOARD_FILTER_STATUS_OPTIONS.length);
    await expect(page.locator(".idea-board-show-filter__option")).toHaveText(IDEA_BOARD_FILTER_STATUS_OPTIONS);
    await expect(page.locator("[data-idea-board-idea-row]")).toHaveCount(3);
    await expect(page.locator("[data-idea-board-expanded-row]")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-add-idea]")).toHaveText("Add Idea");
    await expectButtonLeftAligned(page, "[data-idea-board-add-idea]", "[data-idea-board-add-idea-row] > td");
    await expect(page.getByText(/another/i)).toHaveCount(0);
    await expect(page.locator("[data-idea-board-notes-count='top-thoughts']")).toHaveText("3 Notes");
    await expect(page.locator("[data-idea-board-notes-count='sky-orchard']")).toHaveText("3 Notes");
    await expect(page.locator("[data-idea-board-notes-count='clockwork-courier']")).toHaveText("0 Notes");
    await expectIdeaChevron(page, "top-thoughts", "gfs-chevron-down.svg");
    await expect(page.locator("[data-idea-board-status]")).toHaveText("Ready to shape ideas and notes.");
    await page.locator("[data-idea-board-notes-count='top-thoughts']").click();
    await expect(page.locator("[data-idea-board-expanded-row]")).toHaveCount(0);
    await page.locator("[data-idea-board-idea-cell='top-thoughts']").click();
    await expect(page.locator("[data-idea-board-expanded-row='top-thoughts']")).toBeVisible();
    await expectIdeaBoardProductionCopy(page);
    await expectIdeaChevron(page, "top-thoughts", "gfs-chevron-up.svg");
    await expect(page.locator("[data-idea-board-idea-row='top-thoughts'] + [data-idea-board-expanded-row='top-thoughts']")).toHaveCount(1);
    await expect(page.locator("[data-idea-board-expanded-row='top-thoughts'] [data-idea-board-notes-header]")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-expanded-row='top-thoughts'] :is(h1,h2,h3,h4,h5,h6)").filter({ hasText: /^Notes$/ })).toHaveCount(0);
    await expect(page.locator("[data-idea-board-expanded-row='top-thoughts'] > td > .content-stack")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-notes-table='top-thoughts'] th[scope='col']")).toHaveText(["Note", "Actions"]);
    await expect(page.getByText("Notes for Sky Orchard")).toHaveCount(0);
    await expect(page.getByText("Selected idea context")).toHaveCount(0);
    await expect(page.getByText("Selected")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-add-note='top-thoughts']")).toBeVisible();
    await expect(page.locator("[data-idea-board-add-note='top-thoughts']")).toHaveText("Add Note");
    await expectExpandedNotesChildIndentation(page, "top-thoughts");
    await expect(page.locator("[data-idea-board-create-project]")).toHaveCount(0);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("script[src='assets/toolbox/idea-board/js/index.js']")).toHaveCount(1);
    mutatingApiRequests.length = 0;
    await page.locator("[data-idea-board-add-note='top-thoughts']").click();
    await page.locator("[data-idea-board-note-input]").fill("Capture traversal risks before project creation.");
    await page.locator("[data-idea-board-note-action='save']").click();
    await expect(page.locator("[data-idea-board-notes-table='top-thoughts']")).toContainText("Capture traversal risks before project creation.");
    await page.locator("[data-idea-board-idea-cell='clockwork-courier']").click();
    await expect(page.locator("[data-idea-board-expanded-row='clockwork-courier']")).toBeVisible();
    await expect(page.locator("[data-idea-board-notes-table='clockwork-courier']")).not.toContainText("Capture traversal risks before project creation.");
    await page.locator("[data-idea-board-add-idea]").click();
    await page.locator("[data-idea-board-idea-input]").fill("Launch Tile");
    await page.locator("[data-idea-board-pitch-input]").fill("Turn a polished board idea into a project.");
    await expect(page.locator("[data-idea-board-idea-status-input] option")).toHaveText(IDEA_BOARD_EDITABLE_STATUS_OPTIONS);
    await page.locator("[data-idea-board-idea-status-input]").selectOption("Ready");
    await page.locator("[data-idea-board-idea-action='save']").click();
    await expect(page.locator("[data-idea-board-idea-row='launch-tile'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Create Project", "Delete"]);
    expect(mutatingApiRequests).toEqual([]);

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("toolbox index shows wireframe and beta tools while Planned remains opt-in", async ({ page }) => {
  const server = await startRepoServer();
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
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
    await workspaceV2CoverageReporter.start(page);
    await setServerSession(server, "");
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    const guestSavedDataVotes = page.locator("[data-toolbox-tool-card='Saved Data'] [data-toolbox-vote-controls='Saved Data']");
    await expect(guestSavedDataVotes.locator("[data-toolbox-vote='up']")).toHaveText("Up 0");
    await expect(guestSavedDataVotes.locator("[data-toolbox-vote='down']")).toHaveText("Down 0");
    await expect(guestSavedDataVotes.locator("[data-toolbox-vote='up']")).toBeDisabled();
    await expect(guestSavedDataVotes.locator("[data-toolbox-vote='down']")).toBeDisabled();
    await expect(guestSavedDataVotes.locator("[data-toolbox-vote-login-required='Saved Data']")).toHaveText("Sign in required to vote.");

    await setServerSession(server, MOCK_DB_KEYS.users.user1);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-tool-name-link='AI Command Center']")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-tool-name-link='Colors']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Idea Board']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Fonts']")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-tool-name-link='Assets']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Tags']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Build Game']")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-tool-name-link='Saved Data']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Languages']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Achievements']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Game Configuration']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Game Design']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Game Journey']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Game Hub']")).toHaveAttribute("href", "/toolbox/game-hub/index.html");
    await expect(page.locator("[data-toolbox-tool-name-link='Text To Speech']")).toHaveAttribute("href", "/toolbox/text-to-speech/index.html");
    await expect(page.locator("[data-toolbox-tool-name-link='Publish']")).toHaveCount(0);
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 16/43");
    await page.locator("[data-toolbox-status-filter='planned']").click();
    await expect(page.locator("[data-toolbox-status-filter='planned']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-toolbox-tool-card][data-toolbox-release-channel='planned']")).toHaveCount(26);
    await expect(page.locator("[data-toolbox-tool-card]")).toHaveCount(42);
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 42/43");
    await expect(page.locator("[data-toolbox-tool-name-link='AI Command Center']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Game Crew']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Publish']")).toBeVisible();
    await page.locator("[data-toolbox-status-filter='deprecated']").click();
    await expect(page.locator("[data-toolbox-tool-name-link='Build Game']")).toBeVisible();
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 43/43");

    await setServerSession(server, MOCK_DB_KEYS.users.admin);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-tool-name-link='Colors']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Colors']")).toHaveAttribute("href", "/toolbox/colors/index.html");
    await expect(page.locator("[data-toolbox-tool-name-link='Idea Board']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Fonts']")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-tool-name-link='Publish']")).toHaveCount(0);
    await page.locator("[data-toolbox-status-filter='planned']").click();
    await expect(page.locator("[data-toolbox-tool-name-link='Publish']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-name-link='Fonts']")).toBeVisible();
    await page.locator("[data-toolbox-status-filter='deprecated']").click();
    await expect(page.locator("[data-toolbox-tool-name-link='Build Game']")).toBeVisible();
    const colorsCard = page.locator("[data-toolbox-tool-name-link='Colors']").locator("xpath=ancestor::article[1]");
    await expect(colorsCard.locator("[data-toolbox-readiness]")).toHaveText("Complete");

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
  }
});

test("toolbox status kickers, filters, card order, and voting controls work from registry metadata", async ({ page }) => {
  const server = await startRepoServer();
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
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
    await workspaceV2CoverageReporter.start(page);
    await setServerSession(server, MOCK_DB_KEYS.users.admin);
    await restoreColorsToolMetadata(server);
    await setServerSession(server, MOCK_DB_KEYS.users.user1);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });

    await expect(page.locator("[data-toolbox-status-filter]")).toHaveText([
      "Planned (26)",
      "Wireframe (5)",
      "Beta (8)",
      "Complete (3)",
      "Deprecated (1)",
    ]);
    await expect(page.locator("[data-toolbox-status-filter='planned']")).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-toolbox-status-filter='wireframe']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-toolbox-status-filter='complete']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-toolbox-status-filter='beta']")).toHaveAttribute("aria-pressed", "true");
    const statusFilterTopPositions = await page.locator("[data-toolbox-status-filter]").evaluateAll((buttons) => (
      buttons.map((button) => Math.round(button.getBoundingClientRect().top))
    ));
    expect(new Set(statusFilterTopPositions).size).toBe(1);

    await page.locator("[data-tools-view='build-path']").click();
    await expect(page.locator("[data-toolbox-status-filter]")).toHaveText([
      "Planned (26)",
      "Wireframe (5)",
      "Beta (8)",
      "Complete (3)",
      "Deprecated (1)",
    ]);
    await expect(page.locator("[data-toolbox-status-filter='planned']")).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-toolbox-status-filter='wireframe']")).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-toolbox-status-filter='beta']")).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-toolbox-status-filter='complete']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-toolbox-status-filter='deprecated']")).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-build-path-table='workflow'] th")).toHaveText(["Order", "Tool", "Status"]);
    await expect(page.locator("[data-build-path-tool='Colors']")).toBeVisible();
    await expect(page.locator("[data-build-path-tool='Colors']")).toHaveAttribute("data-build-path-release-channel", "complete");
    await expect(page.locator("[data-build-path-tool='Build Game']")).toHaveCount(0);
    await page.locator("[data-toolbox-status-filter='deprecated']").click();
    await expect(page.locator("[data-build-path-tool='Build Game']")).toBeVisible();
    await page.locator("[data-tools-order]").click();
    await expect(page.locator("[data-toolbox-status-filter='planned']")).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-toolbox-status-filter='wireframe']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-toolbox-status-filter='beta']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-toolbox-status-filter='complete']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-toolbox-status-filter='deprecated']")).toHaveAttribute("aria-pressed", "false");
    await page.locator("[data-toolbox-status-filter='deprecated']").click();
    await expect(page.locator("[data-toolbox-status-filter='deprecated']")).toHaveAttribute("aria-pressed", "true");

    for (const toolName of ["Assets", "Tags", "Game Configuration", "Game Design", "Game Journey"]) {
      const betaCard = page.locator(`[data-toolbox-tool-card='${toolName}']`);
      await expect(betaCard).toBeVisible();
      await expect(betaCard.locator("[data-toolbox-kicker]")).toHaveText("Beta");
      await expect(betaCard.locator("[data-toolbox-kicker]")).toHaveAttribute(
        "title",
        STATUS_HELP_TEXT.beta,
      );
    }

    for (const toolName of ["Colors", "Game Hub", "Idea Board"]) {
      const completeCard = page.locator(`[data-toolbox-tool-card='${toolName}']`);
      await expect(completeCard).toBeVisible();
      await expect(completeCard.locator("[data-toolbox-kicker]")).toHaveText("Complete");
      await expect(completeCard.locator("[data-toolbox-kicker]")).toHaveAttribute(
        "title",
        STATUS_HELP_TEXT.complete,
      );
    }

    const wireframeCard = page.locator("[data-toolbox-tool-card='Saved Data']");
    await expect(wireframeCard).toBeVisible();
    await expect(wireframeCard.locator("[data-toolbox-kicker]")).toHaveText("Wireframe");
    await expect(wireframeCard.locator("[data-toolbox-kicker]")).toHaveClass(/swatch-label/);
    await expect(wireframeCard.locator("[data-toolbox-kicker]")).toHaveAttribute(
      "title",
      STATUS_HELP_TEXT.wireframe,
    );
    await expect(wireframeCard.locator("[data-toolbox-tile-action-row='Saved Data'] a.btn")).toHaveText("Open Tool");
    await expect(wireframeCard.locator("[data-toolbox-plan-details='Saved Data']")).toContainText("Wireframe details");

    const deprecatedCard = page.locator("[data-toolbox-tool-card='Build Game']");
    await expect(deprecatedCard).toBeVisible();
    await expect(deprecatedCard.locator("[data-toolbox-kicker]")).toHaveText("Deprecated");
    await expect(deprecatedCard.locator("[data-toolbox-kicker]")).toHaveClass(/swatch-label/);
    await expect(deprecatedCard.locator("[data-toolbox-kicker]")).toHaveAttribute(
      "title",
      STATUS_HELP_TEXT.deprecated,
    );
    await expect(deprecatedCard.locator("[data-toolbox-tile-action-row='Build Game'] a.btn")).toHaveText("Open Tool");
    await expect(deprecatedCard.locator("[data-toolbox-plan-details='Build Game']")).toContainText("Deprecated details");

    const actionOrder = await deprecatedCard.locator("[data-toolbox-tile-action-row='Build Game']").evaluate((row) => (
      Array.from(row.children).map((child) => {
        if (child.tagName.toLowerCase() === "img") return "badge";
        if (child.tagName.toLowerCase() === "a") return child.textContent.trim();
        if (child.hasAttribute("data-toolbox-group-badge")) return "group";
        return child.tagName.toLowerCase();
      })
    ));
    expect(actionOrder).toEqual(["badge", "Open Tool"]);
    const bodyOrder = await deprecatedCard.locator(".card-body").evaluate((body) => (
      Array.from(body.children).map((child) => {
        if (child.hasAttribute("data-toolbox-tile-action-row")) return "action";
        if (child.hasAttribute("data-toolbox-group-badge")) return "group";
        if (child.hasAttribute("data-toolbox-vote-controls")) return "feedback";
        if (child.hasAttribute("data-toolbox-plan-details")) return "plan-details";
        if (child.hasAttribute("data-toolbox-state-badge")) return "state";
        return child.tagName.toLowerCase();
      })
    ));
    expect(bodyOrder.slice(2, 7)).toEqual(["action", "group", "state", "feedback", "plan-details"]);
    const groupAndStateTop = await deprecatedCard.locator(".card-body").evaluate((body) => {
      const group = body.querySelector("[data-toolbox-group-badge]");
      const state = body.querySelector("[data-toolbox-state-badge]");
      return {
        group: Math.round(group.getBoundingClientRect().top),
        state: Math.round(state.getBoundingClientRect().top),
      };
    });
    expect(groupAndStateTop.state).toBeGreaterThan(groupAndStateTop.group);

    const buildVotes = deprecatedCard.locator("[data-toolbox-vote-controls='Build Game']");
    await expect(buildVotes).toBeVisible();
    const buildUpVote = buildVotes.locator("[data-toolbox-vote='up']");
    const buildDownVote = buildVotes.locator("[data-toolbox-vote='down']");
    let buildVoteState = await voteControlState(buildVotes);
    await expectVoteControlState(buildVotes, buildVoteState);
    await buildUpVote.click();
    buildVoteState = applyVoteState(buildVoteState, "up");
    await expectVoteControlState(buildVotes, buildVoteState);
    await buildDownVote.click();
    buildVoteState = applyVoteState(buildVoteState, "down");
    await expectVoteControlState(buildVotes, buildVoteState);
    await buildDownVote.click();
    buildVoteState = applyVoteState(buildVoteState, "down");
    await expectVoteControlState(buildVotes, buildVoteState);
    await expect(page.locator("[data-toolbox-launch-status]")).toHaveText("Build Game down vote recorded for Admin review.");

    await page.goto(`${server.baseUrl}/toolbox/index.html?view=group`, { waitUntil: "networkidle" });
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    if ((await page.locator("[data-toolbox-status-filter='deprecated']").getAttribute("aria-pressed")) !== "true") {
      await page.locator("[data-toolbox-status-filter='deprecated']").click();
    }
    const restoredBuildVotes = page.locator("[data-toolbox-tool-card='Build Game'] [data-toolbox-vote-controls='Build Game']");
    await expectVoteControlState(restoredBuildVotes, buildVoteState);

    await setServerSession(server, MOCK_DB_KEYS.users.user2);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    if ((await page.locator("[data-toolbox-status-filter='deprecated']").getAttribute("aria-pressed")) !== "true") {
      await page.locator("[data-toolbox-status-filter='deprecated']").click();
    }
    const userTwoBuildVotes = page.locator("[data-toolbox-tool-card='Build Game'] [data-toolbox-vote-controls='Build Game']");
    buildVoteState = await voteControlState(userTwoBuildVotes);
    await userTwoBuildVotes.locator("[data-toolbox-vote='up']").click();
    buildVoteState = applyVoteState(buildVoteState, "up");
    await expectVoteControlState(userTwoBuildVotes, buildVoteState);

    await setServerSession(server, MOCK_DB_KEYS.users.user1);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    if ((await page.locator("[data-toolbox-status-filter='deprecated']").getAttribute("aria-pressed")) !== "true") {
      await page.locator("[data-toolbox-status-filter='deprecated']").click();
    }
    const userOneReturnedBuildVotes = page.locator("[data-toolbox-tool-card='Build Game'] [data-toolbox-vote-controls='Build Game']");
    buildVoteState = { ...buildVoteState, currentVote: "down" };
    await expectVoteControlState(userOneReturnedBuildVotes, buildVoteState);
    await userOneReturnedBuildVotes.locator("[data-toolbox-vote='up']").click();
    buildVoteState = applyVoteState(buildVoteState, "up");
    await expectVoteControlState(userOneReturnedBuildVotes, buildVoteState);

    await setServerSession(server, MOCK_DB_KEYS.users.admin);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-tool-card='Publish']")).toHaveCount(0);
    await page.locator("[data-toolbox-status-filter='planned']").click();
    const plannedCard = page.locator("[data-toolbox-tool-card='Publish']");
    await expect(plannedCard).toBeVisible();
    await expect(plannedCard.locator("[data-toolbox-kicker]")).toHaveText("Planned");
    await expect(plannedCard.locator("[data-toolbox-kicker]")).toHaveClass(/swatch-label/);
    await expect(plannedCard.locator("[data-toolbox-kicker]")).toHaveAttribute("title", STATUS_HELP_TEXT.planned);
    await expect(plannedCard.locator("[data-toolbox-vote-controls='Publish']")).toBeVisible();
    const publishVotes = plannedCard.locator("[data-toolbox-vote-controls='Publish']");
    let publishVoteState = await voteControlState(publishVotes);
    await publishVotes.locator("[data-toolbox-vote='up']").click();
    publishVoteState = applyVoteState(publishVoteState, "up");
    await expect(page.locator("[data-toolbox-launch-status]")).toHaveText("Publish up vote recorded for Admin review.");
    await plannedCard.locator("[data-toolbox-tile-action-row='Publish'] a.btn").click();
    await expect(page).toHaveURL(/\/toolbox\/index\.html$/);
    await expect(page.locator("[data-toolbox-launch-status]")).toContainText("Publish is planned.");

    const plannedFontCard = page.locator("[data-toolbox-tool-card='Fonts']");
    await expect(plannedFontCard.locator("[data-toolbox-kicker]")).toHaveText("Planned");
    await expect(plannedFontCard.locator("[data-toolbox-kicker]")).toHaveAttribute("title", STATUS_HELP_TEXT.planned);
    await expect(plannedFontCard.locator("[data-toolbox-vote-controls='Fonts']")).toBeVisible();
    await expect(page.locator("[data-toolbox-tool-card='Colors'] [data-toolbox-kicker]")).toHaveAttribute(
      "title",
      STATUS_HELP_TEXT.complete,
    );

    const graphicsGroupLabel = page.locator("[data-toolbox-group-label='Graphics']").first();
    await expect(graphicsGroupLabel).toBeVisible();
    await expect(graphicsGroupLabel).toHaveCSS("background-color", "rgb(255, 200, 87)");
    await expect(graphicsGroupLabel).toHaveCSS("color", "rgb(9, 11, 15)");
    const designActionRow = page.locator("[data-toolbox-tile-action-row='Colors']");
    await expect(designActionRow.locator("[data-toolbox-group-label='Graphics']")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-tool-card='Colors'] .card-body > [data-toolbox-group-badge] [data-toolbox-group-label='Graphics']")).toHaveCSS("background-color", "rgb(255, 200, 87)");
    await expect(page.locator("[data-toolbox-tool-card='Colors'] .card-body > [data-toolbox-state-badge]")).toHaveAttribute("data-toolbox-state-badge", "complete");

    const adminVoteSnapshot = await fetchApiData(server, "/api/toolbox/votes/snapshot");
    const adminBuildVoteState = voteStateFromSnapshot(adminVoteSnapshot, "build-game");
    const originalToolOrder = adminVoteSnapshot.rows.map((row) => row.toolId);
    publishVoteState = voteStateFromSnapshot(adminVoteSnapshot, "publish");

    await page.goto(`${server.baseUrl}/admin/tool-votes.html`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: "Tool Votes" })).toBeVisible();
    await expect(page.locator("[data-toolbox-votes-status]")).toContainText("DavidQ");
    await expect(page.locator("[data-toolbox-votes-sort]")).toHaveText([
      "Tool",
      "Order ↑",
      "Group",
      "Path",
      "State",
      "Votes Up",
      "Votes Down",
      "Total Votes",
      "Up %",
      "Down %",
      "Current User Vote",
    ]);
    await expect(page.locator("[data-toolbox-votes-layout].tool-workspace.tool-workspace--wide")).toBeVisible();
    await expect(page.locator("[data-toolbox-votes-layout] > .tool-column")).toHaveCount(2);
    await expect(page.locator("[data-admin-tool-menu] a")).toHaveText([
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
    await expect(page.locator("[data-toolbox-votes-width-toggle]")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-votes-width-status]")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-votes-selected-order]")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-votes-selected-group]")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-votes-selected-path]")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-votes-order-input]")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-votes-group-edit]")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-votes-path-edit]")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-votes-status-edit]")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-votes-metadata-save]")).toHaveCount(0);
    const registryById = await toolMetadataById(server);
    const adminBuildVoteRow = page.locator("[data-toolbox-votes-tool-id='build-game']");
    await expect(adminBuildVoteRow.locator("td").first().locator("a")).toHaveText("Build Game");
    await expect(adminBuildVoteRow.locator("td").first().locator("a")).toHaveAttribute("href", /toolbox\/build-game\/index\.html$/);
    await expect(adminBuildVoteRow.locator("td").nth(1)).toHaveText(String(registryById.get("build-game").order));
    await expect(adminBuildVoteRow.locator("[data-toolbox-votes-state='build-game']")).toHaveValue("deprecated");
    await expect(adminBuildVoteRow.locator("[data-toolbox-votes-state='build-game'] option")).toHaveText([
      "Planned",
      "Wireframe",
      "Beta",
      "Complete",
      "Deprecated",
    ]);
    await expectAdminVoteRowState(adminBuildVoteRow, adminBuildVoteState);
    await adminBuildVoteRow.locator("td").nth(1).click();
    await expect(adminBuildVoteRow).toHaveAttribute("aria-selected", "true");
    await page.locator("[data-toolbox-votes-sort='toolName']").click();
    await expect(page.locator("[data-toolbox-votes-sort-header='toolName']")).toHaveAttribute("aria-sort", "ascending");
    await expect(page.locator("[data-toolbox-votes-sort='toolName']")).toHaveClass(/primary/);
    await expect(page.locator("[data-toolbox-votes-drag-status]")).toContainText("disabled while sorted by Tool");
    await expect(adminBuildVoteRow).toHaveAttribute("draggable", "false");
    await page.locator("[data-toolbox-votes-sort='order']").click();
    await expect(page.locator("[data-toolbox-votes-sort-header='order']")).toHaveAttribute("aria-sort", "ascending");
    await expect(page.locator("[data-toolbox-votes-drag-status]")).toContainText("enabled while sorted by Order");
    await expect(adminBuildVoteRow).toHaveAttribute("draggable", "true");
    await page.evaluate(() => {
      const source = document.querySelector("[data-toolbox-votes-tool-id='build-game']");
      const target = document.querySelector("[data-toolbox-votes-tool-id='game-hub']");
      if (!source || !target) {
        throw new Error("Toolbox vote drag/drop rows were not available.");
      }
      const targetBox = target.getBoundingClientRect();
      const dataTransfer = new DataTransfer();
      source.dispatchEvent(new DragEvent("dragstart", { bubbles: true, dataTransfer }));
      target.dispatchEvent(new DragEvent("dragover", {
        bubbles: true,
        clientY: targetBox.top + 1,
        dataTransfer,
      }));
      target.dispatchEvent(new DragEvent("drop", {
        bubbles: true,
        clientY: targetBox.top + 1,
        dataTransfer,
      }));
      source.dispatchEvent(new DragEvent("dragend", { bubbles: true, dataTransfer }));
    });
    await expect(page.locator("[data-toolbox-votes-status]")).toContainText("Rows were renumbered with whole-number order values.");
    await expect(adminBuildVoteRow.locator("td").nth(1)).toHaveText("1");
    await expect(page.locator("[data-toolbox-votes-tool-id='game-hub'] td").nth(1)).toHaveText("2");
    await expect(adminBuildVoteRow).toHaveAttribute("aria-selected", "true");
    await expectAdminVoteRowState(page.locator("[data-toolbox-votes-tool-id='publish']"), publishVoteState);

    const colorsVoteRow = page.locator("[data-toolbox-votes-tool-id='colors']");
    await colorsVoteRow.click();
    await expect(colorsVoteRow.locator("[data-toolbox-votes-state='colors']")).toHaveValue("complete");
    await colorsVoteRow.locator("[data-toolbox-votes-state='colors']").selectOption("beta");
    await expect(page.locator("[data-toolbox-votes-status]")).toContainText("Colors state updated to Beta");
    await expect(colorsVoteRow.locator("[data-toolbox-votes-state='colors']")).toHaveValue("beta");

    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await page.locator("[data-tools-view='build-path']").click();
    await expect(page.locator("[data-toolbox-status-filter='complete']")).toHaveText("Complete (2)");
    await expect(page.locator("[data-build-path-tool='Colors']")).toHaveCount(0);
    await page.locator("[data-toolbox-status-filter='beta']").click();
    const colorsBuildPathRow = page.locator("[data-build-path-tool='Colors']");
    await expect(colorsBuildPathRow).toBeVisible();
    await expect(colorsBuildPathRow).toHaveAttribute("data-build-path-group", "Design");
    await expect(colorsBuildPathRow).toHaveAttribute("data-build-path-path", "toolbox/colors/index.html");
    await expect(colorsBuildPathRow).toHaveAttribute("data-build-path-release-channel", "beta");
    await expect(colorsBuildPathRow).toHaveAttribute("data-build-path-metadata-source", "toolbox_tool_metadata");
    await expect(colorsBuildPathRow.locator("[data-build-path-tool-link='Colors']")).toHaveAttribute("href", /toolbox\/colors\/index\.html$/);

    await expect(page.locator("[data-route='admin-tool-votes']")).toHaveCount(1);
    const productDataSnapshot = await fetchApiData(server, "/api/product-data/snapshot");
    const mockDbToolboxTables = {
      metadata: productDataSnapshot.tables.toolbox_tool_metadata,
      votes: productDataSnapshot.tables.toolbox_votes,
    };
    expect(mockDbToolboxTables.votes).toEqual(expect.arrayContaining([
      expect.objectContaining({
        direction: "up",
        toolId: "build-game",
        userKey: MOCK_DB_KEYS.users.user1,
      }),
      expect.objectContaining({
        direction: "up",
        toolId: "build-game",
        userKey: MOCK_DB_KEYS.users.user2,
      }),
    ]));
    expect(mockDbToolboxTables.metadata.every((row) => Number.isInteger(row.order))).toBe(true);
    expect(mockDbToolboxTables.metadata).toEqual(expect.arrayContaining([
      expect.objectContaining({
        order: 1,
        toolId: "build-game",
      }),
      expect.objectContaining({
        group: "Design",
        path: "toolbox/colors/index.html",
        releaseChannel: "beta",
        toolId: "colors",
      }),
    ]));
    await restoreColorsToolMetadata(server);
    await postApiData(server, "/api/toolbox/votes/order-list", { toolIds: originalToolOrder });

    const toolboxSource = await page.evaluate(async () => {
      const response = await fetch("/toolbox/index.html");
      return response.text();
    });
    expect(toolboxSource).not.toMatch(/<script(?![^>]+src=)[^>]*>/i);
    expect(toolboxSource).not.toMatch(INLINE_STYLE_TAG_PATTERN);
    expect(toolboxSource).not.toContain("onclick=");

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
  }
});

test("toolbox grouped view renders Game Journey order with unique colors while Build Path keeps metadata groups", async ({ page }) => {
  const server = await startRepoServer();
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
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
    await workspaceV2CoverageReporter.start(page);
    await setServerSession(server, MOCK_DB_KEYS.users.admin);
    const registryById = await toolMetadataById(server);
    const registryByTitle = new Map(Array.from(registryById.values()).map((tool) => [tool.displayName, tool]));

    await page.goto(`${server.baseUrl}/toolbox/index.html?view=group`, { waitUntil: "networkidle" });
    const plannedFilter = page.locator("[data-toolbox-status-filter='planned']");
    if (await plannedFilter.getAttribute("aria-pressed") !== "true") {
      await plannedFilter.click();
    }
    const deprecatedFilter = page.locator("[data-toolbox-status-filter='deprecated']");
    if (await deprecatedFilter.getAttribute("aria-pressed") !== "true") {
      await deprecatedFilter.click();
    }
    await expect(page.locator("[data-toolbox-status-filter='planned']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-toolbox-status-filter='deprecated']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-tools-accordion]")).toHaveCount(GAME_JOURNEY_GROUP_ORDER.length);
    const groupNames = await page.locator("[data-tools-accordion]").evaluateAll((accordions) => (
      accordions.map((accordion) => accordion.dataset.toolsAccordion)
    ));
    expect(groupNames).toEqual(GAME_JOURNEY_GROUP_ORDER);

    const accordionLabels = await page.locator("[data-tools-accordion] > summary [data-toolbox-group-label]").evaluateAll((labels) => (
      labels.map((label) => label.textContent.trim())
    ));
    expect(accordionLabels).toEqual(GAME_JOURNEY_ACCORDION_LABELS);
    expect(accordionLabels.every((label) => /^\d+% Complete — .+: .+$/.test(label))).toBe(true);
    expect(accordionLabels.join(" ")).not.toContain("xxx%");
    expect(accordionLabels.join(" ")).not.toMatch(/\(\d+ of \d+ complete/);
    expect(accordionLabels.join(" ")).not.toContain("inactive");
    expect(accordionLabels.join(" ")).not.toContain("active");
    expect(accordionLabels.every((label) => !/[\r\n]/.test(label))).toBe(true);

    const groupSwatches = await page.locator("[data-tools-accordion] > summary [data-toolbox-group-label]").evaluateAll((labels) => (
      labels.map((label) => ({
        group: label.dataset.toolboxGroupLabel,
        backgroundColor: getComputedStyle(label).backgroundColor,
        className: label.className,
      }))
    ));
    expect(groupSwatches.map((swatch) => swatch.group)).toEqual(GAME_JOURNEY_GROUP_ORDER);
    expect(new Set(groupSwatches.map((swatch) => swatch.backgroundColor)).size).toBe(GAME_JOURNEY_GROUP_ORDER.length);
    expect(new Set(groupSwatches.map((swatch) => swatch.className)).size).toBe(GAME_JOURNEY_GROUP_ORDER.length);
    for (const swatch of groupSwatches) {
      expect(GAME_JOURNEY_GROUP_COLORS[swatch.group].hex).toMatch(/^#[0-9A-F]{6}$/);
      expect(swatch.backgroundColor).toBe(GAME_JOURNEY_GROUP_COLORS[swatch.group].rgb);
    }

    const toolboxGroupsByTool = await page.locator("[data-toolbox-tool-card]").evaluateAll((cards) => (
      Object.fromEntries(cards.map((card) => [
        card.getAttribute("data-toolbox-tool-card"),
        card.querySelector("[data-toolbox-group-label]")?.textContent.trim() || "",
      ]))
    ));
    expect(toolboxGroupsByTool["Idea Board"]).toBe("Idea");
    expect(toolboxGroupsByTool["Creator Learning"]).toBe("Idea");
    expect(toolboxGroupsByTool["AI Command Center"]).toBe("Design");
    expect(toolboxGroupsByTool["Game Hub"]).toBe("Design");
    expect(toolboxGroupsByTool["Game Configuration"]).toBe("Design");
    expect(toolboxGroupsByTool["Game Crew"]).toBe("Design");
    expect(toolboxGroupsByTool["Tags"]).toBe("Design");
    expect(toolboxGroupsByTool["Game Journey"]).toBe("Progression");
    expect(toolboxGroupsByTool["Publish"]).toBe("Publish");
    expect(toolboxGroupsByTool["Marketplace"]).toBe("Share");
    expect(toolboxGroupsByTool.Users).toBeUndefined();

    const designToolOrder = await page.locator("[data-tools-accordion='Design'] [data-toolbox-tool-card]").evaluateAll((cards) => (
      cards.map((card) => card.getAttribute("data-toolbox-tool-card"))
    ));
    const expectedDesignTools = ["Game Hub", "Game Crew", "Game Configuration", "Tags", "Game Design", "AI Command Center"];
    expect(designToolOrder).toEqual(expect.arrayContaining(expectedDesignTools));
    expect(designToolOrder.filter((title) => expectedDesignTools.includes(title))).toEqual(expectedDesignTools);

    const toolLinks = await page.locator("[data-toolbox-tool-name-link]").evaluateAll((links) => (
      links.map((link) => ({
        title: link.dataset.toolboxToolNameLink,
        route: link.dataset.registeredToolRoute,
        href: link.getAttribute("href"),
      }))
    ));
    await expect(page.locator("[data-toolbox-tool-card]")).toHaveCount(toolLinks.length);
    for (const link of toolLinks) {
      const registryTool = registryByTitle.get(link.title);
      expect(registryTool, `${link.title} should remain registered`).toBeTruthy();
      expect(link.route).toBe(registryTool.route);
      expect(link.href).toBe(`/${registryTool.route.replace(/^\/+/, "")}`);
    }

    await page.locator("[data-tools-view='build-path']").click();
    const betaFilter = page.locator("[data-toolbox-status-filter='beta']");
    if (await betaFilter.getAttribute("aria-pressed") !== "true") {
      await betaFilter.click();
    }
    await expect(page.locator("[data-build-path-tool='Game Hub']")).toHaveAttribute("data-build-path-group", "Build/Create");
    await expect(page.locator("[data-build-path-tool='Colors']")).toHaveAttribute("data-build-path-group", "Design");

    const toolboxSource = await page.evaluate(async () => {
      const response = await fetch("/toolbox/index.html");
      return response.text();
    });
    expect(toolboxSource).not.toMatch(/<script(?![^>]+src=)[^>]*>/i);
    expect(toolboxSource).not.toMatch(INLINE_STYLE_TAG_PATTERN);
    expect(toolboxSource).not.toMatch(INLINE_STYLE_ATTRIBUTE_PATTERN);
    expect(toolboxSource).not.toContain("onclick=");
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
  }
});

test("toolbox grouped Game Journey accordions keep friendly labels readable on mobile", async ({ page }) => {
  const server = await startRepoServer();
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
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
    await page.setViewportSize({ width: 390, height: 844 });
    await workspaceV2CoverageReporter.start(page);
    await setServerSession(server, MOCK_DB_KEYS.users.admin);
    await page.goto(`${server.baseUrl}/toolbox/index.html?view=group`, { waitUntil: "networkidle" });
    const plannedFilter = page.locator("[data-toolbox-status-filter='planned']");
    if (await plannedFilter.getAttribute("aria-pressed") !== "true") {
      await plannedFilter.click();
    }
    const deprecatedFilter = page.locator("[data-toolbox-status-filter='deprecated']");
    if (await deprecatedFilter.getAttribute("aria-pressed") !== "true") {
      await deprecatedFilter.click();
    }

    const labels = page.locator("[data-tools-accordion] > summary [data-toolbox-group-label]");
    await expect(labels).toHaveText(GAME_JOURNEY_ACCORDION_LABELS);
    const labelLayout = await labels.evaluateAll((items) => (
      items.map((label) => {
        const rect = label.getBoundingClientRect();
        const viewportWidth = document.documentElement.clientWidth;
        return {
          fitsViewport: rect.left >= 0 && rect.right <= viewportWidth,
          text: label.textContent.trim(),
          wraps: getComputedStyle(label).whiteSpace !== "nowrap",
        };
      })
    ));
    expect(labelLayout.every((item) => item.fitsViewport)).toBe(true);
    expect(labelLayout.every((item) => item.wraps)).toBe(true);
    expect(labelLayout.map((item) => item.text)).toEqual(GAME_JOURNEY_ACCORDION_LABELS);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
  }
});

test("Game Crew friendly route resolves while old Users route remains compatible", async ({ page }) => {
  const server = await startRepoServer();
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
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
    await workspaceV2CoverageReporter.start(page);
    await setServerSession(server, MOCK_DB_KEYS.users.admin);
    await page.goto(`${server.baseUrl}/toolbox/index.html?view=group&group=create`, { waitUntil: "networkidle" });
    const plannedFilter = page.locator("[data-toolbox-status-filter='planned']");
    if (await plannedFilter.getAttribute("aria-pressed") !== "true") {
      await plannedFilter.click();
    }
    const gameCrewLink = page.locator("[data-toolbox-tool-name-link='Game Crew']");
    await expect(gameCrewLink).toHaveAttribute("href", "/toolbox/game-crew/index.html");
    await expect(gameCrewLink).toHaveAttribute("data-registered-tool-route", "toolbox/game-crew/index.html");

    await expect(gameCrewLink).toHaveAttribute("data-toolbox-launch-blocked", "planned");

    await page.goto(`${server.baseUrl}/toolbox/game-crew/index.html`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: "Game Crew" })).toBeVisible();
    await expect(page.locator("main")).toContainText("Plan game-level crew assignments");
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);

    await page.goto(`${server.baseUrl}/toolbox/users/index.html`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: "Game Crew Route Moved" })).toBeVisible();
    const compatibilityLink = page.getByRole("link", { name: "Open Game Crew" });
    await expect(compatibilityLink).toHaveAttribute("href", "/toolbox/game-crew/index.html");
    await compatibilityLink.click();
    await page.waitForURL(/\/toolbox\/game-crew\/index\.html$/);
    await expect(page.getByRole("heading", { level: 1, name: "Game Crew" })).toBeVisible();

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
  }
});

test("toolbox Build Path status filters support multi-select registry-matched tool rows", async ({ page }) => {
  const server = await startRepoServer();
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
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

  async function expectActiveFilters(activeChannels) {
    for (const releaseChannel of ["planned", "wireframe", "beta", "complete", "deprecated"]) {
      const filter = page.locator(`[data-toolbox-status-filter='${releaseChannel}']`);
      const active = activeChannels.includes(releaseChannel);
      await expect(filter).toHaveAttribute("aria-pressed", String(active));
      if (active) {
        await expect(filter).toHaveClass(/primary/);
      } else {
        await expect(filter).not.toHaveClass(/primary/);
      }
    }
  }

  async function expectBuildPathChannels(expectedChannels, expectedCount) {
    await expect(page.locator("[data-build-path-tool]")).toHaveCount(expectedCount);
    await expect(page.locator("[data-build-path-release-channel]")).toHaveCount(expectedCount);
    const releaseChannels = await page.locator("[data-build-path-release-channel]").evaluateAll((rows) => (
      rows.map((row) => row.getAttribute("data-build-path-release-channel"))
    ));
    expect(releaseChannels.every((releaseChannel) => expectedChannels.includes(releaseChannel))).toBe(true);
  }

  async function expectBuildPathOrder(toolTitle, expectedOrder) {
    await expect(page.locator(`[data-build-path-tool='${toolTitle}'] td`).first()).toHaveText(String(expectedOrder));
  }

  try {
    await workspaceV2CoverageReporter.start(page);
    await setServerSession(server, MOCK_DB_KEYS.users.admin);
    await restoreColorsToolMetadata(server);
    await setServerSession(server, MOCK_DB_KEYS.users.user1);
    const registryById = await toolMetadataById(server);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-tools-order]")).toHaveClass(/primary/);
    await page.locator("[data-tools-sort='grouped']").click();
    await expect(page.locator("[data-tools-sort='grouped']")).toHaveClass(/primary/);
    await page.locator("[data-tools-view='build-path']").click();
    await expect(page.locator("[data-tools-view='build-path']")).toHaveClass(/primary/);
    await expect(page.locator("[data-tools-order]")).not.toHaveClass(/primary/);
    await expect(page.locator("[data-tools-sort='grouped']")).not.toHaveClass(/primary/);

    await expect(page.locator("[data-toolbox-status-filter]")).toHaveText([
      "Planned (26)",
      "Wireframe (5)",
      "Beta (8)",
      "Complete (3)",
      "Deprecated (1)",
    ]);
    await expectActiveFilters(["complete"]);
    await expect(page.locator("[data-build-path-tool='Colors']")).toBeVisible();
    await expectBuildPathChannels(["complete"], 3);
    await expectBuildPathOrder("Colors", registryById.get("colors").order);

    await page.locator("[data-toolbox-status-filter='planned']").click();
    await expectActiveFilters(["planned", "complete"]);
    await expectBuildPathChannels(["planned", "complete"], 29);
    await expect(page.locator("[data-build-path-tool='AI Command Center']")).toBeVisible();
    await expectBuildPathOrder("AI Command Center", registryById.get("ai-assistant").order);
    await expectBuildPathOrder("Colors", registryById.get("colors").order);

    await page.locator("[data-toolbox-status-filter='complete']").click();
    await expectActiveFilters(["planned"]);
    await expectBuildPathChannels(["planned"], 26);
    await expect(page.locator("[data-build-path-tool='Colors']")).toHaveCount(0);
    await expect(page.locator("[data-build-path-tool='AI Command Center']")).toBeVisible();

    await page.locator("[data-toolbox-status-filter='wireframe']").click();
    await expectActiveFilters(["planned", "wireframe"]);
    await expectBuildPathChannels(["planned", "wireframe"], 31);
    await expect(page.locator("[data-build-path-tool='Saved Data']")).toBeVisible();
    await expect(page.locator("[data-build-path-tool='Build Game']")).toHaveCount(0);

    await page.locator("[data-toolbox-status-filter='deprecated']").click();
    await expectActiveFilters(["planned", "wireframe", "deprecated"]);
    await expectBuildPathChannels(["planned", "wireframe", "deprecated"], 32);
    await expect(page.locator("[data-build-path-tool='Build Game']")).toBeVisible();
    await expectBuildPathOrder("Build Game", registryById.get("build-game").order);

    await page.locator("[data-toolbox-status-filter='beta']").click();
    await expectActiveFilters(["planned", "wireframe", "beta", "deprecated"]);
    await expectBuildPathChannels(["planned", "wireframe", "beta", "deprecated"], 40);

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
  }
});

test("Colors Picker Preview header sort buttons reorder the grid", async ({ page }) => {
  const server = await startRepoServer();
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
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

  async function previewHexes(limit = 16) {
    return page.locator("[data-palette-generator-swatch]").evaluateAll((swatches, max) => (
      swatches.slice(0, max).map((swatch) => swatch.dataset.paletteGeneratorHex)
    ), limit);
  }

  function lightness(hex) {
    const value = hex.replace("#", "");
    const red = Number.parseInt(value.slice(0, 2), 16) / 255;
    const green = Number.parseInt(value.slice(2, 4), 16) / 255;
    const blue = Number.parseInt(value.slice(4, 6), 16) / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    return (max + min) / 2;
  }

  try {
    await workspaceV2CoverageReporter.start(page);
    await setServerSession(server, MOCK_DB_KEYS.users.user1);
    await page.goto(`${server.baseUrl}/toolbox/colors/index.html`, { waitUntil: "networkidle" });

    const previewSummary = page.locator("[data-palette-preview-accordion] summary");
    const summaryOrder = await previewSummary.evaluate((summary) => (
      Array.from(summary.children).map((child) => {
        if (child.hasAttribute("data-palette-preview-controls")) return "preview-controls";
        if (child.querySelector("[data-palette-generator-preview-status]")) return "preview-status";
        return child.textContent.trim();
      }).filter(Boolean)
    ));
    expect(summaryOrder).toEqual(["Picker Preview", "preview-controls", "preview-status"]);

    const previewControls = page.locator("[data-palette-preview-controls]");
    await expect(previewControls.locator("[data-palette-preview-sort-key]")).toHaveText(["Hue", "Sat", "Brit", "Default"]);
    await expect(previewControls.locator("[data-palette-preview-sort-key='default']")).toHaveClass(/primary/);
    await expect(previewControls.locator("input[type='range']")).toHaveCount(0);
    await expect(page.locator("[data-palette-preview-hue]")).toHaveCount(0);
    await expect(page.locator("[data-palette-preview-saturation]")).toHaveCount(0);
    await expect(page.locator("[data-palette-preview-brightness]")).toHaveCount(0);
    await expect(page.locator("[data-palette-preview-reset]")).toHaveCount(0);

    await expect(page.locator("[data-palette-generator-swatch]").first()).toBeVisible();
    const initialHexes = await previewHexes();
    await previewControls.locator("[data-palette-preview-sort-key='brightness']").click();
    await expect(previewControls.locator("[data-palette-preview-sort-key='brightness']")).toHaveText("Brit ^");
    await expect(previewControls.locator("[data-palette-preview-sort-key='brightness']")).toHaveClass(/primary/);
    await expect.poll(previewHexes).not.toEqual(initialHexes);
    const brightnessSortedHexes = await previewHexes();
    const lightnessValues = brightnessSortedHexes.map(lightness);
    expect(lightnessValues).toEqual([...lightnessValues].sort((left, right) => left - right));
    await previewControls.locator("[data-palette-preview-sort-key='brightness']").click();
    await expect(previewControls.locator("[data-palette-preview-sort-key='brightness']")).toHaveText("Brit v");
    await previewControls.locator("[data-palette-preview-sort-key='default']").click();
    await expect(previewControls.locator("[data-palette-preview-sort-key='default']")).toHaveClass(/primary/);
    await expect.poll(previewHexes).toEqual(initialHexes);
    await expect(page.locator("[data-palette-preview-accordion]")).toHaveJSProperty("open", true);

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
  }
});

test("wireframe-only pages expose left center right accordion controls without runtime wiring", async ({ page }) => {
  const server = await startRepoServer();
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
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
    await workspaceV2CoverageReporter.start(page);
    const cases = [
      { heading: "Achievements", route: "/toolbox/achievements/index.html", left: "Achievement Setup", center: "Achievement Board", right: "Validation" },
      { heading: "Build Game", route: "/toolbox/build-game/index.html", left: "Build Setup", center: "Publish Candidate Checklist", right: "Readiness" },
      { heading: "Saved Data", route: "/toolbox/saved-data/index.html", left: "Save Scope", center: "Save Slots", right: "Validation" },
      { heading: "Languages", route: "/toolbox/languages/index.html", left: "Localization Setup", center: "Translation Matrix", right: "Coverage" },
    ];

    for (const testCase of cases) {
      await page.goto(`${server.baseUrl}${testCase.route}`, { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { level: 1, name: testCase.heading })).toBeVisible();
      await expect(page.locator(".tool-workspace")).toBeVisible();
      await expect(page.locator("aside.tool-column").first().locator("summary", { hasText: testCase.left })).toBeVisible();
      await expect(page.locator(".tool-center-panel").locator("summary", { hasText: testCase.center })).toBeVisible();
      await expect(page.locator("aside.tool-column").last().locator("summary", { hasText: testCase.right })).toBeVisible();
      await expect(page.locator(".tool-center-panel details.vertical-accordion")).toHaveCount(3);
      await expect(page.locator("aside.tool-column").first().locator("select, input, textarea, button").first()).toBeVisible();
      await expect(page.getByText(/Static wireframe only|wireframe planning surface|wireframe controls|No runtime|not wired/i).first()).toBeVisible();
      const source = await page.evaluate(async () => {
        const response = await fetch(window.location.pathname);
        return response.text();
      });
      expect(source).not.toMatch(/<script(?![^>]+src=)[^>]*>/i);
      expect(source).not.toMatch(INLINE_STYLE_TAG_PATTERN);
      expect(source).not.toMatch(/\son(?:click|change|input|submit|keydown|keyup|load)=/i);
    }

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
  }
});

test("local dev pages remain on the repo test server", async ({ page }) => {
  const server = await startRepoServer();
  try {
    await workspaceV2CoverageReporter.start(page);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "domcontentloaded" });
    expect(new URL(page.url()).origin).toBe(server.baseUrl);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
