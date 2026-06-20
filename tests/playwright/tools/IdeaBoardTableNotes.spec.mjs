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

test("Idea Board presents a table-first work surface and governed notes workflow", async ({ page }) => {
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
    await expect(page.locator("[data-idea-board-table] th[scope='col']")).toHaveText(["Idea", "Pitch", "Status", "Owner", "Updated", "Notes"]);
    await expect(page.locator("[data-idea-board-table] tbody tr")).toHaveCount(2);
    await expect(page.locator("[data-idea-board-idea-row='sky-orchard']")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("[data-idea-board-selected-title]")).toHaveText("Notes for Sky Orchard");
    await expect(page.locator("[data-idea-board-notes-table] th[scope='col']")).toHaveText(["Note", "Type", "Created By", "Created", "Updated", "Actions"]);
    await expect(page.locator("[data-idea-board-system-note] [data-idea-board-action='delete']")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-system-note] [data-idea-board-action='edit']")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-system-note]").first()).toContainText("System locked");

    await page.locator("[data-idea-board-add-note]").click();
    await expect(page.locator("[data-idea-board-inline-input-row]")).toHaveCount(1);
    await expect(page.locator("[data-idea-board-inline-input-row] [data-idea-board-action]")).toHaveText(["Save", "Cancel"]);
    await page.locator("[data-idea-board-note-input]").fill("Prototype the storm creature escalation table.");
    await page.locator("[data-idea-board-action='save']").click();
    const skyCreatorNote = page.locator("[data-idea-board-notes-table] tbody tr").first();
    await expect(skyCreatorNote).toContainText("Prototype the storm creature escalation table.");
    await expect(skyCreatorNote.locator("td").nth(1)).toHaveText("Creator");
    await expect(skyCreatorNote.locator("td").nth(2)).toHaveText("Creator");

    await page.locator("[data-idea-board-select-idea='clockwork-courier']").click();
    await expect(page.locator("[data-idea-board-idea-row='clockwork-courier']")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("[data-idea-board-selected-title]")).toHaveText("Notes for Clockwork Courier");
    await expect(page.locator("[data-idea-board-notes-table]")).not.toContainText("Prototype the storm creature escalation table.");
    await expect(page.locator("[data-idea-board-notes-table]")).toContainText("Check whether district routing stays readable after the first reset.");

    await page.locator("[data-idea-board-add-note]").click();
    await page.locator("[data-idea-board-note-input]").fill("Map the reset rules before writing project records.");
    await page.locator("[data-idea-board-action='save']").click();
    await expect(page.locator("[data-idea-board-notes-table]")).toContainText("Map the reset rules before writing project records.");

    await page.locator("[data-idea-board-select-idea='sky-orchard']").click();
    await expect(page.locator("[data-idea-board-selected-title]")).toHaveText("Notes for Sky Orchard");
    await expect(page.locator("[data-idea-board-notes-table]")).toContainText("Prototype the storm creature escalation table.");
    await expect(page.locator("[data-idea-board-notes-table]")).not.toContainText("Map the reset rules before writing project records.");
    await page.locator("[data-idea-board-notes-table] tbody tr").first().locator("[data-idea-board-action='edit']").click();
    await page.locator("[data-idea-board-note-input]").fill("Prototype storm creature escalation after core loop review.");
    await page.locator("[data-idea-board-action='save']").click();
    await expect(page.locator("[data-idea-board-notes-table]")).toContainText("Prototype storm creature escalation after core loop review.");

    await page.locator("[data-idea-board-notes-table] tbody tr").first().locator("[data-idea-board-action='delete']").click();
    await expect(page.locator("[data-idea-board-notes-table]")).not.toContainText("Prototype storm creature escalation after core loop review.");
    await page.locator("[data-idea-board-select-idea='clockwork-courier']").click();
    await expect(page.locator("[data-idea-board-notes-table]")).toContainText("Map the reset rules before writing project records.");

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
