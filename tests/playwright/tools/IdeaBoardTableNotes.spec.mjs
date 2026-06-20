import { expect, test } from "@playwright/test";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";

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
      textColor: cellStyles.color,
      maskImage: iconStyles.getPropertyValue("-webkit-mask-image") || iconStyles.maskImage,
    };
  }, ideaId);
  expect(metrics.iconName).toBe(iconName);
  expect(metrics.labelDisplay).toBe("inline-flex");
  expect(Math.abs(metrics.iconWidth - metrics.fontSize)).toBeLessThanOrEqual(1);
  expect(Math.abs(metrics.iconHeight - metrics.fontSize)).toBeLessThanOrEqual(1);
  expect(metrics.iconColor).toBe(metrics.textColor);
  expect(metrics.maskImage).toContain(iconName);
}

test("Idea Board uses DB-shaped accordion table ideas and notes", async ({ page }) => {
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
    if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`);
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
    if (request.url().includes("/api/") && request.method() !== "GET") {
      mutatingApiRequests.push(`${request.method()} ${request.url()}`);
    }
  });

  try {
    await page.goto(`${server.baseUrl}/toolbox/idea-board/index.html`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: "Idea Board" })).toBeVisible();
    await expect(page.locator("[data-idea-board-table] > thead th[scope='col']")).toHaveText([
      "Idea",
      "Pitch",
      "Status",
      "Updated",
      "Notes",
      "Actions",
    ]);
    await expect(page.locator("[data-idea-board-idea-row]")).toHaveCount(3);
    await expect(page.locator("[data-idea-board-expanded-row]")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-add-idea-row]")).toHaveCount(1);
    await expect(page.locator("[data-idea-board-notes-chevron]")).toHaveCount(0);
    await expect(page.getByText("Selected idea context")).toHaveCount(0);
    await expect(page.getByText("Notes for Sky Orchard")).toHaveCount(0);
    await expect(page.getByText("Selected")).toHaveCount(0);

    await expect(page.locator("[data-idea-board-idea-row='top-thoughts'] th")).toHaveText("Top Thoughts");
    await expectIdeaChevron(page, "top-thoughts", "gfs-chevron-down.svg");
    await expect(page.locator("[data-idea-board-idea-row='top-thoughts'] td").nth(0)).toHaveText("Smartest person wins...");
    await expect(page.locator("[data-idea-board-idea-row='top-thoughts'] td").nth(1)).toHaveText("Exploring");
    await expect(page.locator("[data-idea-board-idea-row='top-thoughts'] td").nth(2)).toHaveText("2026-06-20");
    await expect(page.locator("[data-idea-board-notes-count='top-thoughts']")).toHaveText("3 Notes");
    await expect(page.locator("[data-idea-board-idea-row='top-thoughts'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Delete"]);

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
    await expectIdeaChevron(page, "top-thoughts", "gfs-chevron-up.svg");
    await expect(page.locator("[data-idea-board-expanded-row='top-thoughts'] [data-idea-board-notes-header='top-thoughts']")).toHaveText("Notes");
    await expect(page.locator("[data-idea-board-notes-table='top-thoughts'] th[scope='col']")).toHaveText(["Note", "Actions"]);
    await expect(page.locator("[data-idea-board-notes-table] th[scope='col']", { hasText: "Type" })).toHaveCount(0);
    await expect(page.locator("[data-idea-board-notes-table] th[scope='col']", { hasText: "Created By" })).toHaveCount(0);
    await expect(page.locator("[data-idea-board-notes-table] th[scope='col']", { hasText: "Created" })).toHaveCount(0);
    await expect(page.locator("[data-idea-board-notes-table] th[scope='col']", { hasText: "Updated" })).toHaveCount(0);

    const systemNote = page.locator("[data-idea-board-notes-table='top-thoughts'] [data-idea-board-system-note]").first();
    await expect(systemNote.locator("[data-idea-board-note-action]")).toHaveText(["Edit"]);
    await expect(systemNote.locator("[data-idea-board-note-action='delete']")).toHaveCount(0);
    await systemNote.locator("[data-idea-board-note-action='edit']").click();
    await expect(page.locator("[data-idea-board-note-input-row] [data-idea-board-note-action]")).toHaveText(["Save", "Cancel"]);
    await page.locator("[data-idea-board-note-input]").fill("System note can be edited in-place.");
    await page.locator("[data-idea-board-note-action='save']").click();
    await expect(page.locator("[data-idea-board-notes-table='top-thoughts']")).toContainText("System note can be edited in-place.");
    await expect(page.locator("[data-idea-board-system-note] [data-idea-board-note-action='delete']")).toHaveCount(0);

    await page.locator("[data-idea-board-add-note='top-thoughts']").click();
    await expect(page.locator("[data-idea-board-note-input-row] [data-idea-board-note-action]")).toHaveText(["Save", "Cancel"]);
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
    await expect(ideaInputRow.locator("td").nth(2)).toHaveText(/\d{4}-\d{2}-\d{2}/);
    await expect(ideaInputRow.locator("td").nth(3)).toHaveText("0 Notes");
    await page.locator("[data-idea-board-idea-input]").fill("Lantern Reef");
    await page.locator("[data-idea-board-pitch-input]").fill("Guide light through a reef that rearranges at dusk.");
    await page.locator("[data-idea-board-idea-status-input]").selectOption("Parked");
    await page.locator("[data-idea-board-idea-action='save']").click();
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef']")).toBeVisible();
    await expect(page.locator("[data-idea-board-notes-count='lantern-reef']")).toHaveText("0 Notes");
    await expect(page.locator("[data-idea-board-expanded-row='lantern-reef']")).toHaveCount(0);

    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='edit']").click();
    await expect(page.locator("[data-idea-board-idea-input-row] [data-idea-board-idea-action]")).toHaveText(["Save", "Cancel"]);
    await expect(page.locator("[data-idea-board-idea-status-input]")).toHaveCount(1);
    await page.locator("[data-idea-board-idea-status-input]").selectOption("Ready to Shape");
    await page.locator("[data-idea-board-idea-action='save']").click();
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] td").nth(1)).toHaveText("Ready to Shape");

    expect(mutatingApiRequests).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
    await server.close();
  }
});
