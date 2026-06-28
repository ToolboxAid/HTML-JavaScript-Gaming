import { expect, test } from "@playwright/test";
import { GAME_JOURNEY_BOOTSTRAP_BUCKETS } from "../../../../api/persistence/tool-repositories/game-journey-mock-repository.js";
import { MOCK_DB_KEYS } from "../../../../api/persistence/mock-db-store.js";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { createGameJourneyCompletionMetricsPostgresClientStub } from "../../helpers/gameJourneyCompletionMetricsPostgresClientStub.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";

const EDITABLE_STATUS_OPTIONS = ["New", "Exploring", "Refining", "Ready"];
const FILTER_STATUS_OPTIONS = ["New", "Exploring", "Refining", "Ready", "Project", "Archived"];
const DEFAULT_VISIBLE_STATUS_OPTIONS = ["New", "Exploring", "Refining", "Ready", "Project"];

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

async function expectProductionCopy(page) {
  await expect(page.locator("main")).not.toContainText(
    /\bDB-shaped\b|\bin-page data model\b|\buserId\b|\bideaId\b|\bnoteId\b|\bsystem flag\b|\bmetadata\b|\bseed\b|\bdebug\b|\bselected context\b|\bmock\b|\btest\b|\binternal implementation\b|\bplaceholder\b|\bproject records\b|\bmutating API\b|\bserver\b|\bAPI\b|\blocal server\b|\bport\b|\bunderlying systems\b|\bauth\b|\bAI\b|\bdatabase behavior\b/i,
  );
}

async function expectNoNavigationFallbackUi(page) {
  await expect(page.locator("body")).not.toContainText("Tool navigation is temporarily unavailable. Refresh the page or try again shortly.");
  await expect(page.locator(".tool-display-mode")).not.toContainText(/\bserver\b|\bAPI\b|\blocal server\b|\bport\b|\bregistry\b|\bsnapshot\b/i);
}

test("Idea Board uses accordion table ideas and notes", async ({ page }) => {
  const server = await startRepoServer({
    gameJourneyCompletionMetricsPostgresClient: createGameJourneyCompletionMetricsPostgresClientStub(),
  });
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  const previousSupabaseEnv = {
    GAMEFOUNDRY_DATABASE_URL: process.env.GAMEFOUNDRY_DATABASE_URL,
    GAMEFOUNDRY_SUPABASE_ANON_KEY: process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY,
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY,
    GAMEFOUNDRY_SUPABASE_URL: process.env.GAMEFOUNDRY_SUPABASE_URL,
  };
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
  process.env.GAMEFOUNDRY_DATABASE_URL = "postgres://idea-board:test@127.0.0.1:5432/idea_board";
  process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY = "idea-board-anon-key";
  process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY = "idea-board-service-role-key";
  process.env.GAMEFOUNDRY_SUPABASE_URL = `${server.baseUrl}/fake-supabase`;
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];
  const mutatingApiRequests = [];
  const createGamePayloads = [];
  const createGameResponsePromises = [];
  const gameHubRepositoryRequests = [];

  page.on("response", (response) => {
    if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`);
    const responseUrl = response.url();
    if (responseUrl.includes("/api/toolbox/game-hub/repositories/") && responseUrl.includes("/methods/createGame")) {
      createGameResponsePromises.push(response.json());
    }
  });
  page.on("requestfailed", (request) => failedRequests.push(`FAILED ${request.url()}`));
  page.on("pageerror", (error) => {
    const text = error.stack || error.message;
    if (!isBrowserExtensionNoise(text)) pageErrors.push(error.message);
  });
  page.on("console", (message) => {
    if (message.type() === "error" && !isBrowserExtensionNoise(message.text())) consoleErrors.push(message.text());
  });
  page.on("request", (request) => {
    const requestUrl = request.url();
    if (requestUrl.includes("/api/") && request.method() !== "GET") {
      mutatingApiRequests.push(`${request.method()} ${requestUrl}`);
    }
    if (requestUrl.includes("/api/toolbox/game-hub/repositories/") && requestUrl.includes("/methods/createGame")) {
      createGamePayloads.push(request.postDataJSON());
    }
    if (requestUrl.includes("/api/toolbox/game-hub/repositories/")) {
      gameHubRepositoryRequests.push(`${request.method()} ${requestUrl}`);
    }
  });

  try {
    await page.route("**/api/platform-settings/banner", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: { banner: { active: false, message: "", tone: "info" } },
          ok: true,
        }),
      });
    });
    await page.route("**/api/toolbox/registry/snapshot", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            activeTools: [],
            readinessByStatus: {},
            tools: [],
            toolboxContract: {},
          },
          ok: true,
        }),
      });
    });
    await page.request.post(`${server.baseUrl}/api/session/user`, {
      data: { userKey: MOCK_DB_KEYS.users.user1 },
    });
    await page.goto(`${server.baseUrl}/toolbox/idea-board/index.html`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: "Idea Board" })).toBeVisible();
    await expectProductionCopy(page);
    await expectNoNavigationFallbackUi(page);
    await expect(page.locator("[data-idea-board-table] > thead th[scope='col']")).toHaveText([
      "Idea",
      "Pitch",
      "Status",
      "Notes",
      "Actions",
    ]);
    await expect(page.locator("[data-idea-board-idea-row]")).toHaveCount(3);
    await expect(page.locator("[data-idea-board-expanded-row]")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-add-idea-row]")).toHaveCount(1);
    await expect(page.locator("[data-idea-board-add-idea]")).toHaveText("Add Idea");
    await expectButtonLeftAligned(page, "[data-idea-board-add-idea]", "[data-idea-board-add-idea-row] > td");
    await expect(page.locator(".tool-center-panel [data-idea-board-show-filter]")).toHaveCount(0);
    const statusFilterAccordion = page.locator("aside.tool-group-idea").first().locator("[data-idea-board-section='Status Filter']");
    await expect(page.locator("aside.tool-group-idea").first().locator(".accordion-stack > details").first()).toHaveAttribute("data-idea-board-section", "Status Filter");
    await expect(statusFilterAccordion.locator("summary")).toHaveText("Status Filter");
    await expect(statusFilterAccordion.locator("[data-idea-board-filter-select-all]")).toHaveText("Select All");
    await expect(statusFilterAccordion.locator("[data-idea-board-filter-clear-all]")).toHaveText("Clear All");
    await expect(statusFilterAccordion.locator("[data-idea-board-status-filter-option]")).toHaveCount(FILTER_STATUS_OPTIONS.length);
    const statusFilterTheme = await statusFilterAccordion.locator("[data-idea-board-status-filter-option][value='New']").evaluate((input) => ({
      accentColor: getComputedStyle(input).accentColor,
      toolGroupColor: getComputedStyle(input.closest(".control-lab")).getPropertyValue("--tool-group-color").trim(),
    }));
    expect(statusFilterTheme).toEqual({
      accentColor: "rgb(255, 45, 45)",
      toolGroupColor: "#ff2d2d",
    });
    await expect(statusFilterAccordion.locator(".idea-board-show-filter__option")).toHaveText(FILTER_STATUS_OPTIONS);
    const checkedStatuses = await page.locator("[data-idea-board-status-filter-option]:checked").evaluateAll((inputs) => (
      inputs.map((input) => input.value)
    ));
    expect(checkedStatuses).toEqual(DEFAULT_VISIBLE_STATUS_OPTIONS);
    await expect(page.locator("[data-idea-board-status-filter-option][value='Archived']")).not.toBeChecked();
    await expect(page.getByText(/another/i)).toHaveCount(0);
    await expect(page.locator("[data-idea-board-notes-chevron]")).toHaveCount(0);
    await expect(page.getByText("Selected idea context")).toHaveCount(0);
    await expect(page.getByText("Notes for Sky Orchard")).toHaveCount(0);
    await expect(page.getByText("Selected")).toHaveCount(0);

    await expect(page.locator("[data-idea-board-idea-row='top-thoughts'] th")).toHaveText("Top Thoughts");
    await expectIdeaChevron(page, "top-thoughts", "gfs-chevron-down.svg");
    await expect(page.locator("[data-idea-board-idea-row='top-thoughts'] td").nth(0)).toHaveText("Smartest person wins...");
    await expect(page.locator("[data-idea-board-idea-row='top-thoughts'] td").nth(1)).toHaveText("Exploring");
    await expect(page.locator("[data-idea-board-notes-count='top-thoughts']")).toHaveText("3 Notes");
    await expect(page.locator("[data-idea-board-idea-row='top-thoughts'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Delete"]);
    await expect(page.locator("[data-idea-board-idea-row='top-thoughts'] [data-idea-board-idea-action='create-project']")).toHaveCount(0);
    const ideaLabelWrapping = await page.locator("[data-idea-board-idea-row='top-thoughts'] .idea-board-idea-label").evaluate((label) => {
      const labelStyles = getComputedStyle(label);
      const textStyles = getComputedStyle(label.querySelector(".idea-board-idea-label__text"));
      return {
        overflowWrap: textStyles.overflowWrap,
        whiteSpace: labelStyles.whiteSpace,
      };
    });
    expect(ideaLabelWrapping).toEqual({
      overflowWrap: "anywhere",
      whiteSpace: "normal",
    });

    await expect(page.locator("[data-idea-board-idea-row='sky-orchard'] th")).toHaveText("Sky Orchard");
    await expectIdeaChevron(page, "sky-orchard", "gfs-chevron-down.svg");
    await expect(page.locator("[data-idea-board-idea-row='sky-orchard'] td").nth(0)).toHaveText("Grow floating islands...");
    await expect(page.locator("[data-idea-board-notes-count='sky-orchard']")).toHaveText("3 Notes");
    await expect(page.locator("[data-idea-board-idea-row='clockwork-courier'] th")).toHaveText("Clockwork Courier");
    await expect(page.locator("[data-idea-board-idea-row='clockwork-courier'] td").nth(0)).toHaveText("Deliver messages through looping city...");
    await expect(page.locator("[data-idea-board-notes-count='clockwork-courier']")).toHaveText("0 Notes");

    await page.locator("[data-idea-board-notes-count='top-thoughts']").click();
    await expect(page.locator("[data-idea-board-expanded-row]")).toHaveCount(0);
    await page.locator("[data-idea-board-idea-cell='top-thoughts']").click();
    await expect(page.locator("[data-idea-board-expanded-row='top-thoughts']")).toBeVisible();
    await expect(page.locator("[data-idea-board-expanded-row='top-thoughts'] > td")).toHaveAttribute("colspan", "5");
    await expectProductionCopy(page);
    await expectIdeaChevron(page, "top-thoughts", "gfs-chevron-up.svg");
    await expect(page.locator("[data-idea-board-idea-row='top-thoughts'] + [data-idea-board-expanded-row='top-thoughts']")).toHaveCount(1);
    await expect(page.locator("[data-idea-board-expanded-row='top-thoughts'] [data-idea-board-notes-header]")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-expanded-row='top-thoughts'] :is(h1,h2,h3,h4,h5,h6)").filter({ hasText: /^Notes$/ })).toHaveCount(0);
    await expect(page.locator("[data-idea-board-expanded-row='top-thoughts'] > td > .content-stack")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-notes-table='top-thoughts'] th[scope='col']")).toHaveText(["Note", "Actions"]);
    await expect(page.locator("[data-idea-board-add-note='top-thoughts']")).toHaveText("Add Note");
    await expectExpandedNotesChildIndentation(page, "top-thoughts");
    await expect(page.locator("[data-idea-board-notes-table] th[scope='col']", { hasText: "Type" })).toHaveCount(0);
    await expect(page.locator("[data-idea-board-notes-table] th[scope='col']", { hasText: "Created By" })).toHaveCount(0);
    await expect(page.locator("[data-idea-board-notes-table] th[scope='col']", { hasText: "Created" })).toHaveCount(0);
    await expect(page.locator("[data-idea-board-notes-table] th[scope='col']", { hasText: "Updated" })).toHaveCount(0);

    const systemNote = page.locator("[data-idea-board-notes-table='top-thoughts'] [data-idea-board-system-note]").first();
    await expect(systemNote.locator("[data-idea-board-note-action]")).toHaveText(["Edit"]);
    await expect(systemNote.locator("[data-idea-board-note-action='delete']")).toHaveCount(0);
    await systemNote.locator("[data-idea-board-note-action='edit']").click();
    await expect(page.locator("[data-idea-board-note-input-row] [data-idea-board-note-action]")).toHaveText(["Save", "Cancel"]);
    await expectExpandedNotesChildIndentation(page, "top-thoughts", 1);
    await page.locator("[data-idea-board-note-input]").fill("Starter note can be edited in place.");
    await page.locator("[data-idea-board-note-action='save']").click();
    await expect(page.locator("[data-idea-board-notes-table='top-thoughts']")).toContainText("Starter note can be edited in place.");
    await expect(page.locator("[data-idea-board-system-note] [data-idea-board-note-action='delete']")).toHaveCount(0);

    await page.locator("[data-idea-board-add-note='top-thoughts']").click();
    await expect(page.locator("[data-idea-board-note-input-row] [data-idea-board-note-action]")).toHaveText(["Save", "Cancel"]);
    await expectExpandedNotesChildIndentation(page, "top-thoughts", 1);
    await page.locator("[data-idea-board-note-input]").fill("Add a fourth table-shaped note.");
    await page.locator("[data-idea-board-note-action='save']").click();
    await expect(page.locator("[data-idea-board-notes-table='top-thoughts']")).toContainText("Add a fourth table-shaped note.");
    await expect(page.locator("[data-idea-board-notes-count='top-thoughts']")).toHaveText("4 Notes");

    await page.locator("[data-idea-board-notes-table='top-thoughts'] tbody tr").last().locator("[data-idea-board-note-action='edit']").click();
    await page.locator("[data-idea-board-note-input]").fill("Edited fourth table-shaped note.");
    await page.locator("[data-idea-board-note-action='save']").click();
    await expect(page.locator("[data-idea-board-notes-table='top-thoughts']")).toContainText("Edited fourth table-shaped note.");
    await page.locator("[data-idea-board-notes-table='top-thoughts'] tbody tr").last().locator("[data-idea-board-note-action='delete']").click();
    await expect(page.locator("[data-idea-board-notes-table='top-thoughts']")).not.toContainText("Edited fourth table-shaped note.");
    await expect(page.locator("[data-idea-board-notes-count='top-thoughts']")).toHaveText("3 Notes");

    await page.locator("[data-idea-board-idea-cell='sky-orchard']").click();
    await expect(page.locator("[data-idea-board-expanded-row='top-thoughts']")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-expanded-row='sky-orchard']")).toBeVisible();
    await expect(page.locator("[data-idea-board-idea-row='sky-orchard'] + [data-idea-board-expanded-row='sky-orchard']")).toHaveCount(1);
    await expectIdeaChevron(page, "sky-orchard", "gfs-chevron-up.svg");
    await page.locator("[data-idea-board-notes-count='sky-orchard']").click();
    await expect(page.locator("[data-idea-board-expanded-row='sky-orchard']")).toBeVisible();
    await page.locator("[data-idea-board-idea-cell='sky-orchard']").click();
    await expect(page.locator("[data-idea-board-expanded-row]")).toHaveCount(0);
    await expectIdeaChevron(page, "sky-orchard", "gfs-chevron-down.svg");

    await page.locator("[data-idea-board-add-idea]").click();
    const ideaInputRow = page.locator("[data-idea-board-idea-input-row]").last();
    await expect(ideaInputRow.locator("[data-idea-board-idea-action]")).toHaveText(["Save", "Cancel"]);
    await expect(ideaInputRow.locator("[data-idea-board-idea-status-input]")).toHaveCount(1);
    await expect(ideaInputRow.locator("[data-idea-board-idea-status-input] option")).toHaveText(EDITABLE_STATUS_OPTIONS);
    await expect(ideaInputRow.locator("td").nth(2)).toHaveText("0 Notes");
    await ideaInputRow.locator("[data-idea-board-idea-status-input]").evaluate((select) => {
      const option = document.createElement("option");
      option.value = "Project";
      option.textContent = "Project";
      select.append(option);
      select.value = "Project";
    });
    await page.locator("[data-idea-board-idea-input]").fill("Project Trap");
    await page.locator("[data-idea-board-pitch-input]").fill("Project status cannot be saved from the editable row.");
    await page.locator("[data-idea-board-idea-action='save']").click();
    await expect(page.locator("[data-idea-board-status]")).toHaveText("Enter an idea, pitch, and status before saving.");
    await expect(page.locator("[data-idea-board-idea-row='project-trap']")).toHaveCount(0);
    await ideaInputRow.locator("[data-idea-board-idea-status-input]").evaluate((select) => {
      select.querySelector("option[value='Project']")?.remove();
      select.value = "Refining";
    });
    await page.locator("[data-idea-board-idea-input]").fill("Lantern Reef");
    await page.locator("[data-idea-board-pitch-input]").fill("Guide light through a reef that rearranges at dusk.");
    await page.locator("[data-idea-board-idea-status-input]").selectOption("Refining");
    await page.locator("[data-idea-board-idea-action='save']").click();
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef']")).toBeVisible();
    await expect(page.locator("[data-idea-board-notes-count='lantern-reef']")).toHaveText("0 Notes");
    await expect(page.locator("[data-idea-board-expanded-row='lantern-reef']")).toHaveCount(0);

    await page.locator("[data-idea-board-idea-cell='lantern-reef']").click();
    await expect(page.locator("[data-idea-board-expanded-row='lantern-reef']")).toBeVisible();
    await page.locator("[data-idea-board-add-note='lantern-reef']").click();
    await page.locator("[data-idea-board-note-input]").fill("Use dusk tide changes as the first Game Hub planning note.");
    await page.locator("[data-idea-board-note-action='save']").click();
    await expect(page.locator("[data-idea-board-notes-count='lantern-reef']")).toHaveText("1 Note");

    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='edit']").click();
    await expect(page.locator("[data-idea-board-idea-input-row] [data-idea-board-idea-action]")).toHaveText(["Save", "Cancel"]);
    await expect(page.locator("[data-idea-board-idea-status-input]")).toHaveCount(1);
    await expect(page.locator("[data-idea-board-idea-status-input] option")).toHaveText(EDITABLE_STATUS_OPTIONS);
    await page.locator("[data-idea-board-idea-status-input]").selectOption("Ready");
    await page.locator("[data-idea-board-idea-action='save']").click();
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] td").nth(1)).toHaveText("Ready");
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Create Project", "Delete"]);
    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='create-project']").click();
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] td").nth(1)).toHaveText("Project");
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Open in Game Hub", "Archive"]);
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='edit']")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='delete']")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-add-note='lantern-reef']")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-notes-table='lantern-reef'] [data-idea-board-note-action]")).toHaveCount(0);
    expect(createGamePayloads).toHaveLength(1);
    const [createGameInput] = createGamePayloads[0].args;
    expect(Object.keys(createGameInput).sort()).toEqual(["name", "purpose", "sourceIdea", "status"]);
    expect(createGameInput).toMatchObject({
      name: "Lantern Reef",
      purpose: "Game",
      sourceIdea: {
        idea: "Lantern Reef",
        pitch: "Guide light through a reef that rearranges at dusk.",
        notes: ["Use dusk tide changes as the first Game Hub planning note."],
      },
      status: "Planning",
    });
    const [createGameResponse] = await Promise.all(createGameResponsePromises);
    const createdProject = createGameResponse?.data?.result;
    expect(createdProject?.journeyBootstrap?.buckets.map((bucket) => bucket.bucketName)).toEqual(GAME_JOURNEY_BOOTSTRAP_BUCKETS);
    expect(createdProject?.journeyBootstrap?.buckets.every((bucket) => bucket.noteKey && bucket.itemKey)).toBe(true);
    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='archive']").click();
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef']")).toHaveCount(0);
    await page.locator("[data-idea-board-status-filter-option][value='Archived']").check();
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef']")).toBeVisible();
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] td").nth(1)).toHaveText("Archived");
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Restore", "Delete"]);
    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='restore']").click();
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] td").nth(1)).toHaveText("Project");
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Open in Game Hub", "Archive"]);
    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='open-project']").click();
    await page.waitForURL(/\/toolbox\/game-hub\/index\.html\?game=lantern-reef-\d+$/);
    await expect(page.getByRole("heading", { level: 1, name: "Game Hub" })).toBeVisible();
    await expect(page.locator("[data-active-game-name]")).toHaveCount(0);
    await expect(page.locator("[data-game-list]")).toContainText("Lantern Reef");
    await expect(page.locator("aside [data-game-list]")).toHaveCount(0);
    await expect(page.locator(".tool-center-panel [data-game-list]")).toContainText("Lantern Reef");
    await expect(page.locator("[data-source-idea-section]")).toHaveCount(0);
    await expect(page.locator("[data-game-output-panels]")).toHaveCount(0);
    await expect(page.locator("[data-game-hub-foundation]")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Delete Open Game" })).toHaveCount(0);
    const activeGameToggle = page.locator("[data-game-toggle][data-game-active='true']");
    await expect(activeGameToggle).toHaveText("Lantern Reef");
    await activeGameToggle.click();
    let expandedRows = page.locator("[data-game-expanded-row]");
    await expect(expandedRows).toHaveCount(2);
    await expect(expandedRows.nth(0)).toHaveAttribute("data-game-child-row", "source-idea");
    await expect(expandedRows.nth(1)).toHaveAttribute("data-game-child-row", "readiness-output");
    let sourceIdeaChildTable = expandedRows.nth(0).locator("[data-game-child-table='source-idea']");
    await expect(sourceIdeaChildTable.locator("caption")).toHaveText("Source Idea");
    await expect(sourceIdeaChildTable.locator("thead th")).toHaveText(["Context", "Details"]);
    await expect(sourceIdeaChildTable.locator("tbody tr")).toHaveText([
      "IdeaLantern Reef",
      "PitchGuide light through a reef that rearranges at dusk.",
      "Note 1Use dusk tide changes as the first Game Hub planning note.",
    ]);
    await expect(sourceIdeaChildTable.locator(":is(input, textarea, select, button)")).toHaveCount(0);
    await expect(expandedRows.nth(1).locator("[data-game-child-table='readiness-output'] caption")).toHaveText("Readiness Output");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-active-game-name]")).toHaveCount(0);
    await expect(page.locator("[data-game-list]")).toContainText("Lantern Reef");
    await expect(page.locator("[data-source-idea-section]")).toHaveCount(0);
    await expect(page.locator("[data-game-output-panels]")).toHaveCount(0);
    await expect(page.locator("[data-game-hub-foundation]")).toHaveCount(0);
    await activeGameToggle.click();
    expandedRows = page.locator("[data-game-expanded-row]");
    await expect(expandedRows).toHaveCount(2);
    sourceIdeaChildTable = expandedRows.nth(0).locator("[data-game-child-table='source-idea']");
    await expect(sourceIdeaChildTable.locator("tbody tr")).toHaveText([
      "IdeaLantern Reef",
      "PitchGuide light through a reef that rearranges at dusk.",
      "Note 1Use dusk tide changes as the first Game Hub planning note.",
    ]);
    await expect(page.getByRole("button", { name: "Delete Open Game" })).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(/\bproject records\b|\bAPI\b|\bDB\b|\bmock\b|\bseed\b|\bdebug\b|\binternal\b/i);
    await expect(page.getByRole("link", { name: "Open Game Journey" })).toHaveCount(0);
    const createdGameKey = new URL(page.url()).searchParams.get("game");
    await page.goto(`${server.baseUrl}/toolbox/game-journey/index.html?game=${createdGameKey}`, { waitUntil: "networkidle" });
    await page.waitForURL(/\/toolbox\/game-journey\/index\.html\?game=lantern-reef-\d+$/);
    await expect(page.locator("[data-journey-active-game]")).toHaveText("Active game: Lantern Reef.");
    const journeyNoteNames = await page.locator("[data-journey-summary-body] [data-journey-note-button]").evaluateAll((buttons) => (
      buttons.map((button) => button.textContent.trim())
    ));
    const journeyBucketNames = journeyNoteNames.filter((name) => GAME_JOURNEY_BOOTSTRAP_BUCKETS.includes(name));
    expect(journeyBucketNames).toEqual(GAME_JOURNEY_BOOTSTRAP_BUCKETS);
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Source Idea: Lantern Reef");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("10000011");
    await expect(page.locator("[data-journey-recent-activity]")).toContainText("Created 13 Game Journey starter buckets.");
    await expect(page.locator("[data-journey-recent-activity]")).toContainText("Created 1 Game Journey item from Source Idea.");

    expect(mutatingApiRequests.some((request) => request.includes("/api/toolbox/game-hub/repositories"))).toBe(true);
    expect(mutatingApiRequests.some((request) => request.includes("/methods/createGame"))).toBe(true);
    expect(gameHubRepositoryRequests.some((request) => request.includes("/methods/openGame"))).toBe(true);
    expect(gameHubRepositoryRequests.some((request) => request.includes("/methods/listGames"))).toBe(true);
    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
    Object.entries(previousSupabaseEnv).forEach(([key, value]) => restoreEnvValue(key, value));
    await server.close();
  }
});

test("Idea Board gates Create Project to Ready ideas and locks converted projects", async ({ page }) => {
  const server = await startRepoServer({
    gameJourneyCompletionMetricsPostgresClient: createGameJourneyCompletionMetricsPostgresClientStub(),
  });
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  const previousSupabaseEnv = {
    GAMEFOUNDRY_DATABASE_URL: process.env.GAMEFOUNDRY_DATABASE_URL,
    GAMEFOUNDRY_SUPABASE_ANON_KEY: process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY,
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY,
    GAMEFOUNDRY_SUPABASE_URL: process.env.GAMEFOUNDRY_SUPABASE_URL,
  };
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
  process.env.GAMEFOUNDRY_DATABASE_URL = "postgres://idea-board:test@127.0.0.1:5432/idea_board";
  process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY = "idea-board-anon-key";
  process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY = "idea-board-service-role-key";
  process.env.GAMEFOUNDRY_SUPABASE_URL = `${server.baseUrl}/fake-supabase`;
  const createGameRequests = [];
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];

  page.on("request", (request) => {
    const requestUrl = request.url();
    if (requestUrl.includes("/api/toolbox/game-hub/repositories/") && requestUrl.includes("/methods/createGame")) {
      createGameRequests.push(request.postDataJSON());
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`);
  });
  page.on("pageerror", (error) => {
    const text = error.stack || error.message;
    if (!isBrowserExtensionNoise(text)) pageErrors.push(error.message);
  });
  page.on("console", (message) => {
    if (message.type() === "error" && !isBrowserExtensionNoise(message.text())) consoleErrors.push(message.text());
  });

  try {
    await page.route("**/api/platform-settings/banner", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: { banner: { active: false, message: "", tone: "info" } },
          ok: true,
        }),
      });
    });
    await page.route("**/api/toolbox/registry/snapshot", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            activeTools: [],
            readinessByStatus: {},
            tools: [],
            toolboxContract: {},
          },
          ok: true,
        }),
      });
    });
    await page.request.post(`${server.baseUrl}/api/session/user`, {
      data: { userKey: MOCK_DB_KEYS.users.user1 },
    });

    await page.goto(`${server.baseUrl}/toolbox/idea-board/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-idea-board-idea-row='top-thoughts'] [data-idea-board-idea-action='create-project']")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-idea-row='sky-orchard'] [data-idea-board-idea-action='create-project']")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-idea-row='clockwork-courier'] [data-idea-board-idea-action='create-project']")).toHaveCount(0);

    await page.locator("[data-idea-board-add-idea]").click();
    await page.locator("[data-idea-board-idea-input]").fill("Validation Reef");
    await page.locator("[data-idea-board-pitch-input]").fill("Verify project gating and read-only conversion.");
    await page.locator("[data-idea-board-idea-status-input]").selectOption("Refining");
    await page.locator("[data-idea-board-idea-action='save']").click();
    await expect(page.locator("[data-idea-board-idea-row='validation-reef'] td").nth(1)).toHaveText("Refining");
    await expect(page.locator("[data-idea-board-idea-row='validation-reef'] [data-idea-board-idea-action='create-project']")).toHaveCount(0);
    expect(createGameRequests).toEqual([]);

    await page.locator("[data-idea-board-idea-cell='validation-reef']").click();
    await page.locator("[data-idea-board-add-note='validation-reef']").click();
    await page.locator("[data-idea-board-note-input]").fill("This note should become read-only project context.");
    await page.locator("[data-idea-board-note-action='save']").click();
    await expect(page.locator("[data-idea-board-notes-count='validation-reef']")).toHaveText("1 Note");

    await page.locator("[data-idea-board-idea-row='validation-reef'] [data-idea-board-idea-action='edit']").click();
    await page.locator("[data-idea-board-idea-status-input]").selectOption("Ready");
    await page.locator("[data-idea-board-idea-action='save']").click();
    await expect(page.locator("[data-idea-board-idea-row='validation-reef'] td").nth(1)).toHaveText("Ready");
    await expect(page.locator("[data-idea-board-idea-row='validation-reef'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Create Project", "Delete"]);

    await page.locator("[data-idea-board-idea-row='validation-reef'] [data-idea-board-idea-action='create-project']").click();
    await expect(page.locator("[data-idea-board-idea-row='validation-reef'] td").nth(1)).toHaveText("Project");
    await expect(page.locator("[data-idea-board-idea-row='validation-reef'] [data-idea-board-idea-action]")).toHaveText(["Open in Game Hub", "Archive"]);
    await expect(page.locator("[data-idea-board-idea-row='validation-reef'] [data-idea-board-idea-action='edit']")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-idea-row='validation-reef'] [data-idea-board-idea-action='delete']")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-add-note='validation-reef']")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-notes-table='validation-reef'] [data-idea-board-note-action]")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-note-input-row]")).toHaveCount(0);
    expect(createGameRequests).toHaveLength(1);
    expect(Object.keys(createGameRequests[0].args[0]).sort()).toEqual(["name", "purpose", "sourceIdea", "status"]);

    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
    Object.entries(previousSupabaseEnv).forEach(([key, value]) => restoreEnvValue(key, value));
    await server.close();
  }
});

test("Idea Board guest write actions redirect to sign in before saving data", async ({ page }) => {
  const server = await startRepoServer({
    gameJourneyCompletionMetricsPostgresClient: createGameJourneyCompletionMetricsPostgresClientStub(),
  });
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  const previousSupabaseEnv = {
    GAMEFOUNDRY_DATABASE_URL: process.env.GAMEFOUNDRY_DATABASE_URL,
    GAMEFOUNDRY_SUPABASE_ANON_KEY: process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY,
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY,
    GAMEFOUNDRY_SUPABASE_URL: process.env.GAMEFOUNDRY_SUPABASE_URL,
  };
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
  process.env.GAMEFOUNDRY_DATABASE_URL = "postgres://idea-board:test@127.0.0.1:5432/idea_board";
  process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY = "idea-board-anon-key";
  process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY = "idea-board-service-role-key";
  process.env.GAMEFOUNDRY_SUPABASE_URL = `${server.baseUrl}/fake-supabase`;
  const createGameRequests = [];

  page.on("request", (request) => {
    const requestUrl = request.url();
    if (requestUrl.includes("/api/toolbox/game-hub/repositories/") && requestUrl.includes("/methods/createGame")) {
      createGameRequests.push(requestUrl);
    }
  });

  const openBoard = async () => {
    await page.goto(`${server.baseUrl}/toolbox/idea-board/index.html`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: "Idea Board" })).toBeVisible();
    await expect(page.locator("[data-idea-board-idea-row]")).toHaveCount(3);
  };
  const expectSignInRedirect = async () => {
    await page.waitForURL(/\/account\/sign-in\.html$/);
  };
  const expectNoIdeaBoardBrowserStorage = async () => {
    const storageKeys = await page.evaluate(() => {
      const matchesIdeaBoard = (key) => /idea[-_]?board|ideaBoard|idea|note/i.test(key);
      return {
        local: Object.keys(window.localStorage || {}).filter(matchesIdeaBoard),
        session: Object.keys(window.sessionStorage || {}).filter(matchesIdeaBoard),
      };
    });
    expect(storageKeys).toEqual({ local: [], session: [] });
  };
  const signInCreator = async () => {
    await page.request.post(`${server.baseUrl}/api/session/user`, {
      data: { userKey: MOCK_DB_KEYS.users.user1 },
    });
  };
  const signOutCreator = async () => {
    await page.request.post(`${server.baseUrl}/api/session/user`, {
      data: { userKey: "" },
    });
  };
  const addReadyIdea = async (name) => {
    await page.locator("[data-idea-board-add-idea]").click();
    await page.locator("[data-idea-board-idea-input]").fill(name);
    await page.locator("[data-idea-board-pitch-input]").fill(`${name} should require authenticated API session writes.`);
    await page.locator("[data-idea-board-idea-status-input]").selectOption("Ready");
    await page.locator("[data-idea-board-idea-action='save']").click();
  };

  try {
    await page.route("**/api/platform-settings/banner", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: { banner: { active: false, message: "", tone: "info" } },
          ok: true,
        }),
      });
    });
    await page.route("**/api/toolbox/registry/snapshot", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            activeTools: [],
            readinessByStatus: {},
            tools: [],
            toolboxContract: {},
          },
          ok: true,
        }),
      });
    });

    await openBoard();
    await page.locator("[data-idea-board-idea-cell='top-thoughts']").click();
    await expect(page.locator("[data-idea-board-expanded-row='top-thoughts']")).toBeVisible();
    await expect(page).toHaveURL(/\/toolbox\/idea-board\/index\.html$/);

    await openBoard();
    await page.locator("[data-idea-board-add-idea]").click();
    await page.locator("[data-idea-board-idea-input]").fill("Guest Reef");
    await page.locator("[data-idea-board-pitch-input]").fill("Guest cannot save Idea Board records.");
    await page.locator("[data-idea-board-idea-status-input]").selectOption("Ready");
    await page.locator("[data-idea-board-idea-action='save']").click();
    await expectSignInRedirect();

    await openBoard();
    await page.locator("[data-idea-board-idea-row='top-thoughts'] [data-idea-board-idea-action='edit']").click();
    await page.locator("[data-idea-board-pitch-input]").fill("Guest cannot update Idea Board records.");
    await page.locator("[data-idea-board-idea-action='save']").click();
    await expectSignInRedirect();

    await openBoard();
    await page.locator("[data-idea-board-idea-row='top-thoughts'] [data-idea-board-idea-action='delete']").click();
    await expectSignInRedirect();

    await openBoard();
    await page.locator("[data-idea-board-idea-cell='top-thoughts']").click();
    await page.locator("[data-idea-board-add-note='top-thoughts']").click();
    await page.locator("[data-idea-board-note-input]").fill("Guest cannot save Idea Board notes.");
    await page.locator("[data-idea-board-note-action='save']").click();
    await expectSignInRedirect();

    await openBoard();
    await page.locator("[data-idea-board-idea-cell='top-thoughts']").click();
    await page.locator("[data-idea-board-notes-table='top-thoughts'] tbody tr").nth(1).locator("[data-idea-board-note-action='edit']").click();
    await page.locator("[data-idea-board-note-input]").fill("Guest cannot update Idea Board notes.");
    await page.locator("[data-idea-board-note-action='save']").click();
    await expectSignInRedirect();

    await openBoard();
    await page.locator("[data-idea-board-idea-cell='top-thoughts']").click();
    await page.locator("[data-idea-board-notes-table='top-thoughts'] tbody tr").nth(1).locator("[data-idea-board-note-action='delete']").click();
    await expectSignInRedirect();

    await signInCreator();
    await openBoard();
    await addReadyIdea("Guest Project Gate");
    await expect(page.locator("[data-idea-board-idea-row='guest-project-gate'] [data-idea-board-idea-action='create-project']")).toBeVisible();
    await signOutCreator();
    await page.locator("[data-idea-board-idea-row='guest-project-gate'] [data-idea-board-idea-action='create-project']").click();
    await expectSignInRedirect();

    await signInCreator();
    await openBoard();
    await addReadyIdea("Guest Archive Gate");
    await page.locator("[data-idea-board-idea-row='guest-archive-gate'] [data-idea-board-idea-action='create-project']").click();
    await expect(page.locator("[data-idea-board-idea-row='guest-archive-gate'] [data-idea-board-idea-action='archive']")).toBeVisible();
    createGameRequests.length = 0;
    await signOutCreator();
    await page.locator("[data-idea-board-idea-row='guest-archive-gate'] [data-idea-board-idea-action='archive']").click();
    await expectSignInRedirect();

    await signInCreator();
    await openBoard();
    await addReadyIdea("Guest Restore Gate");
    await page.locator("[data-idea-board-idea-row='guest-restore-gate'] [data-idea-board-idea-action='create-project']").click();
    await page.locator("[data-idea-board-idea-row='guest-restore-gate'] [data-idea-board-idea-action='archive']").click();
    await page.locator("[data-idea-board-status-filter-option][value='Archived']").check();
    await expect(page.locator("[data-idea-board-idea-row='guest-restore-gate'] [data-idea-board-idea-action='restore']")).toBeVisible();
    createGameRequests.length = 0;
    await signOutCreator();
    await page.locator("[data-idea-board-idea-row='guest-restore-gate'] [data-idea-board-idea-action='restore']").click();
    await expectSignInRedirect();
    expect(createGameRequests).toEqual([]);
    await expectNoIdeaBoardBrowserStorage();
  } finally {
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
    Object.entries(previousSupabaseEnv).forEach(([key, value]) => restoreEnvValue(key, value));
    await server.close();
  }
});

test("Idea Board remains usable without visible navigation fallback when registry navigation is unavailable", async ({ page }) => {
  const server = await startRepoServer();
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
  const pageErrors = [];
  const consoleErrors = [];

  await page.route("**/api/toolbox/registry/snapshot", async (route) => {
    await route.fulfill({ body: "", status: 204 });
  });
  await page.request.post(`${server.baseUrl}/api/session/user`, {
    data: { userKey: MOCK_DB_KEYS.users.user1 },
  });

  page.on("pageerror", (error) => {
    const text = error.stack || error.message;
    if (!isBrowserExtensionNoise(text)) pageErrors.push(error.message);
  });
  page.on("console", (message) => {
    const text = message.text();
    if (message.type() === "error" && !isBrowserExtensionNoise(text)) consoleErrors.push(text);
  });

  try {
    await page.goto(`${server.baseUrl}/toolbox/idea-board/index.html`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: "Idea Board" })).toBeVisible();
    await expectProductionCopy(page);
    await expectNoNavigationFallbackUi(page);
    await expect(page.locator(".tool-display-mode__navigation-row")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-table]")).toBeVisible();
    await expect(page.locator("[data-idea-board-idea-row]")).toHaveCount(3);

    await page.locator("[data-idea-board-idea-cell='top-thoughts']").click();
    await expect(page.locator("[data-idea-board-expanded-row='top-thoughts']")).toBeVisible();
    await page.locator("[data-idea-board-add-note='top-thoughts']").click();
    await page.locator("[data-idea-board-note-input]").fill("Navigation fallback does not block table notes.");
    await page.locator("[data-idea-board-note-action='save']").click();
    await expect(page.locator("[data-idea-board-notes-table='top-thoughts']")).toContainText("Navigation fallback does not block table notes.");

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
    await server.close();
  }
});
