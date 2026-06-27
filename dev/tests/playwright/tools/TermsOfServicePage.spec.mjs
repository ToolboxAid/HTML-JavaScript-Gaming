import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

async function openTermsPage(page) {
  const server = await startRepoServer();
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];
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
  await page.goto(`${server.baseUrl}/legal/terms.html`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("Terms page shows visible diagnostics when published content is missing", async ({ page }) => {
  const context = await openTermsPage(page);
  try {
    await expect(page).toHaveTitle(/Terms of Service - GameFoundryStudio/);
    await expect(page.getByRole("heading", { name: "Terms of Service" })).toBeVisible();
    await expect(page.locator("[data-legal-document-status]")).toContainText("WARN:");
    await expect(page.locator("[data-legal-document-status]")).toContainText("Owner must publish approved content");
    await expect(page.locator("[data-legal-document-effective]")).toHaveText("Published Terms are unavailable.");
    await expect(page.locator("[data-legal-document-body]")).toBeEmpty();
    await expect(page.getByText("Temporary placeholder legal copy")).toHaveCount(0);
    await expect(page.getByText("Terms Overview")).toHaveCount(0);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await context.server.close();
  }
});

test("Terms page renders published Terms returned by the legal API", async ({ page }) => {
  await page.route("**/api/legal/document**", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: {
          available: true,
          bodyMarkdown: "Published Terms fixture.\n\nSecond published paragraph.",
          diagnostic: "Loaded published legal document terms_of_service.",
          documentType: "terms_of_service",
          effectiveAt: "2026-06-18T12:00:00.000Z",
          publishedAt: "2026-06-18T12:00:00.000Z",
          route: "legal/terms.html",
          slug: "terms",
          status: "PASS",
          title: "Terms of Service",
          version: "1",
        },
        ok: true,
      }),
      contentType: "application/json; charset=utf-8",
      status: 200,
    });
  });
  const context = await openTermsPage(page);
  try {
    await expect(page.locator("[data-legal-document-status]")).toContainText("PASS:");
    await expect(page.locator("[data-legal-document-effective]")).toHaveText("Effective June 18, 2026.");
    await expect(page.locator("[data-legal-document-body]")).toContainText("Published Terms fixture.");
    await expect(page.locator("[data-legal-document-body]")).toContainText("Second published paragraph.");
    await expect(page.getByText("Draft Terms")).toHaveCount(0);
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await context.server.close();
  }
});
