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

test("Idea Board presents inline tree grid idea and note actions", async ({ page }) => {
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
    await expect(page.locator("[data-idea-board-table] > thead th[scope='col']", { hasText: "Owner" })).toHaveCount(0);
    await expect(page.locator("[data-idea-board-idea-row]")).toHaveCount(2);
    await expect(page.locator("[data-idea-board-section='Selected Notes']")).toHaveCount(0);
    await expect(page.getByText("Notes for Sky Orchard")).toHaveCount(0);
    await expect(page.getByText("Selected idea context")).toHaveCount(0);
    await expect(page.locator("[data-idea-board-idea-row='sky-orchard']")).toHaveAttribute("aria-selected", "true");

    const initialRowOrder = await page.locator("[data-idea-board-ideas-body] > tr").evaluateAll((rows) => (
      rows.map((row) => row.getAttribute("data-idea-board-idea-row") || row.getAttribute("data-idea-board-expanded-row"))
    ));
    expect(initialRowOrder.slice(0, 3)).toEqual(["sky-orchard", "sky-orchard", "clockwork-courier"]);
    await expect(page.locator("[data-idea-board-idea-row='sky-orchard'] [data-idea-board-select-idea]")).toHaveText("2 Notes");
    await expect(page.locator("[data-idea-board-notes-table='sky-orchard'] th[scope='col']")).toHaveText(["Note", "Actions"]);
    await expect(page.locator("[data-idea-board-notes-table] th[scope='col']", { hasText: "Type" })).toHaveCount(0);
    await expect(page.locator("[data-idea-board-notes-table] th[scope='col']", { hasText: "Created By" })).toHaveCount(0);
    await expect(page.locator("[data-idea-board-notes-table] th[scope='col']", { hasText: "Created" })).toHaveCount(0);
    await expect(page.locator("[data-idea-board-notes-table] th[scope='col']", { hasText: "Updated" })).toHaveCount(0);
    await expect(page.locator("[data-idea-board-idea-row='sky-orchard'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Delete"]);

    const systemNote = page.locator("[data-idea-board-system-note]").first();
    await expect(systemNote.locator("[data-idea-board-note-action]")).toHaveText(["Edit"]);
    await expect(systemNote.locator("[data-idea-board-note-action='delete']")).toHaveCount(0);
    await systemNote.locator("[data-idea-board-note-action='edit']").click();
    await expect(page.locator("[data-idea-board-note-input-row] [data-idea-board-note-action]")).toHaveText(["Save", "Cancel"]);
    await page.locator("[data-idea-board-note-input]").fill("System note edited inline for Sky Orchard.");
    await page.locator("[data-idea-board-note-action='save']").click();
    await expect(page.locator("[data-idea-board-notes-table='sky-orchard']")).toContainText("System note edited inline for Sky Orchard.");
    await expect(page.locator("[data-idea-board-system-note] [data-idea-board-note-action='delete']")).toHaveCount(0);

    await page.locator("[data-idea-board-add-note='sky-orchard']").click();
    await expect(page.locator("[data-idea-board-note-input-row] [data-idea-board-note-action]")).toHaveText(["Save", "Cancel"]);
    await page.locator("[data-idea-board-note-input]").fill("Prototype the storm creature escalation table.");
    await page.locator("[data-idea-board-note-action='save']").click();
    await expect(page.locator("[data-idea-board-notes-table='sky-orchard']")).toContainText("Prototype the storm creature escalation table.");
    await expect(page.locator("[data-idea-board-idea-row='sky-orchard'] [data-idea-board-select-idea]")).toHaveText("3 Notes");

    await page.locator("[data-idea-board-notes-table='sky-orchard'] tbody tr").first().locator("[data-idea-board-note-action='edit']").click();
    await page.locator("[data-idea-board-note-input]").fill("Prototype storm escalation after core loop review.");
    await page.locator("[data-idea-board-note-action='save']").click();
    await expect(page.locator("[data-idea-board-notes-table='sky-orchard']")).toContainText("Prototype storm escalation after core loop review.");
    await page.locator("[data-idea-board-notes-table='sky-orchard'] tbody tr").first().locator("[data-idea-board-note-action='delete']").click();
    await expect(page.locator("[data-idea-board-notes-table='sky-orchard']")).not.toContainText("Prototype storm escalation after core loop review.");

    await page.locator("[data-idea-board-select-idea='clockwork-courier']").click();
    const clockRowOrder = await page.locator("[data-idea-board-ideas-body] > tr").evaluateAll((rows) => (
      rows.map((row) => row.getAttribute("data-idea-board-idea-row") || row.getAttribute("data-idea-board-expanded-row"))
    ));
    expect(clockRowOrder.slice(0, 3)).toEqual(["sky-orchard", "clockwork-courier", "clockwork-courier"]);
    await expect(page.locator("[data-idea-board-notes-table='clockwork-courier']")).toContainText("Check whether district routing stays readable after the first reset.");
    await expect(page.locator("[data-idea-board-notes-table='clockwork-courier']")).not.toContainText("System note edited inline for Sky Orchard.");

    await page.locator("[data-idea-board-add-idea]").click();
    await expect(page.locator("[data-idea-board-idea-input-row] [data-idea-board-idea-action]")).toHaveText(["Save", "Cancel"]);
    await expect(page.locator("[data-idea-board-idea-input-row] [data-idea-board-idea-status-input]")).toHaveCount(1);
    await page.locator("[data-idea-board-idea-title-input]").fill("Lantern Reef");
    await page.locator("[data-idea-board-idea-pitch-input]").fill("Guide light through a reef that rearranges at dusk.");
    await page.locator("[data-idea-board-idea-status-input]").selectOption("Parked");
    await page.locator("[data-idea-board-idea-action='save']").click();
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef']")).toBeVisible();
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-select-idea]")).toHaveText("0 Notes");
    await expect(page.locator("[data-idea-board-expanded-row='lantern-reef']")).toBeVisible();

    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='edit']").click();
    await expect(page.locator("[data-idea-board-idea-input-row] [data-idea-board-idea-action]")).toHaveText(["Save", "Cancel"]);
    await page.locator("[data-idea-board-idea-status-input]").selectOption("Ready to Shape");
    await page.locator("[data-idea-board-idea-action='save']").click();
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] td").nth(1)).toHaveText("Ready to Shape");
    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='delete']").click();
    await expect(page.locator("[data-idea-board-idea-row='lantern-reef']")).toHaveCount(0);

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
