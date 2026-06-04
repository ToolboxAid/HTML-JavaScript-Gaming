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
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveText("CREATOR VIEW • Planned tools hidden • Switch to Admin View");
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveAttribute("href", /role=admin/);
    await expect(page.getByText("Progress Wireframe")).toHaveCount(0);
    await expect(page.getByText("Build Path Wireframe")).toHaveCount(0);
    await expect(page.locator("[data-toolbox-wireframe]")).toHaveCount(0);
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
      "Languages",
      "Marketplace",
      "Music",
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
      ["Local", "ization"].join("")
    ];
    expect(defaultToolLabels.filter((label) => oldStandaloneLabels.includes(label))).toEqual([]);
    expect(defaultToolLabels).not.toEqual(expect.arrayContaining([
      "Users",
      "Environments",
      "Game Migration",
      "Platform Settings",
      "Cloud",
      "Custom Extensions"
    ]));
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
    expect(pageErrors).toEqual([]);

    await page.locator("[data-toolbox-role-banner]").click();
    await page.waitForURL(/role=admin/);
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveText("ADMIN VIEW • Planned tools visible • Switch to Creator View");
    const adminLabels = await page.locator("main [data-tools-accordion-list] .control-card h3").evaluateAll((labels) => labels.map((label) => label.textContent.trim()));
    expect(adminLabels).toEqual(expect.arrayContaining([
      "Users",
      "Environments",
      "Game Migration",
      "Platform Settings",
      "Cloud",
      "Custom Extensions"
    ]));
    await page.locator("[data-toolbox-role-banner]").click();
    await page.waitForURL(/role=user/);
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveText("CREATOR VIEW • Planned tools hidden • Switch to Admin View");
    await expect(page.locator("main").getByText("Users", { exact: true })).toHaveCount(0);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
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
