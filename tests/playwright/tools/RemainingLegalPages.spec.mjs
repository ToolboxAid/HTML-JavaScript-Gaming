import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const LEGAL_PAGES = Object.freeze([
  Object.freeze({
    documentType: "community_guidelines",
    path: "legal/community-guidelines.html",
    route: "legal/community-guidelines.html",
    slug: "community",
    title: "Community Guidelines",
    unavailable: "Published Community Guidelines is unavailable.",
  }),
  Object.freeze({
    documentType: "cookies_policy",
    path: "legal/cookies-policy.html",
    route: "legal/cookies-policy.html",
    slug: "cookies",
    title: "Cookies Policy",
    unavailable: "Published Cookies Policy is unavailable.",
  }),
  Object.freeze({
    documentType: "copyright_policy",
    path: "legal/copyright-policy.html",
    route: "legal/copyright-policy.html",
    slug: "copyright",
    title: "Copyright Policy",
    unavailable: "Published Copyright Policy is unavailable.",
  }),
  Object.freeze({
    documentType: "dmca_policy",
    path: "legal/dmca-policy.html",
    route: "legal/dmca-policy.html",
    slug: "dmca",
    title: "DMCA Policy",
    unavailable: "Published DMCA Policy is unavailable.",
  }),
  Object.freeze({
    documentType: "privacy_policy",
    path: "legal/privacy-policy.html",
    route: "legal/privacy-policy.html",
    slug: "privacy",
    title: "Privacy Policy",
    unavailable: "Published Privacy Policy is unavailable.",
  }),
]);

const LEGAL_LINK_LABELS = Object.freeze([
  "Community Guidelines",
  "Cookies Policy",
  "Copyright Policy",
  "DMCA Policy",
  "Privacy Policy",
  "Terms of Service",
]);

const FOOTER_LEGAL_PATHS = Object.freeze([
  "/legal/community-guidelines.html",
  "/legal/cookies-policy.html",
  "/legal/copyright-policy.html",
  "/legal/dmca-policy.html",
  "/legal/privacy-policy.html",
  "/legal/terms.html",
]);

async function openLegalServerPage(page) {
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
  return {
    consoleErrors,
    failedRequests,
    pageErrors,
    server,
  };
}

async function gotoLegalPage(page, server, legalPage) {
  await page.goto(`${server.baseUrl}/${legalPage.path}`, { waitUntil: "networkidle" });
  await expect(page).toHaveTitle(new RegExp(`${legalPage.title} - GameFoundryStudio`));
  await expect(page.getByRole("heading", { name: legalPage.title })).toBeVisible();
}

async function expectLegalNavigation(page) {
  await expect(page.locator("aside.side-menu a")).toHaveText(LEGAL_LINK_LABELS);
  await expect(page.locator("footer.footer")).toBeVisible();
  const footerLinks = page.locator("footer.footer [aria-labelledby='footer-legal'] .footer__links a");
  await expect(footerLinks).toHaveText(LEGAL_LINK_LABELS);
  const footerPaths = await footerLinks.evaluateAll((links) =>
    links.map((link) => new URL(link.href).pathname),
  );
  expect(footerPaths).toEqual(FOOTER_LEGAL_PATHS);
}

async function closeLegalServerPage(page, context) {
  await workspaceV2CoverageReporter.stop(page);
  await context.server.close();
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("remaining legal pages show visible diagnostics when published content is missing", async ({ page }) => {
  const context = await openLegalServerPage(page);
  try {
    for (const legalPage of LEGAL_PAGES) {
      await gotoLegalPage(page, context.server, legalPage);
      await expect(page.locator("[data-legal-document-status]")).toContainText("WARN:");
      await expect(page.locator("[data-legal-document-status]")).toContainText("Owner must publish approved content");
      await expect(page.locator("[data-legal-document-effective]")).toHaveText(legalPage.unavailable);
      await expect(page.locator("[data-legal-document-body]")).toBeEmpty();
      await expect(page.getByText("Temporary placeholder legal copy")).toHaveCount(0);
      await expect(page.getByText("Privacy Commitments")).toHaveCount(0);
      await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
      await expectLegalNavigation(page);
    }
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await closeLegalServerPage(page, context);
  }
});

test("remaining legal pages render published content returned by the legal API", async ({ page }) => {
  await page.route("**/api/legal/document**", async (route) => {
    const requestUrl = new URL(route.request().url());
    const documentType = requestUrl.searchParams.get("documentType") || "";
    const legalPage = LEGAL_PAGES.find((entry) => entry.documentType === documentType);
    if (!legalPage) {
      await route.fulfill({
        body: JSON.stringify({ error: "Unsupported legal document fixture.", ok: false }),
        contentType: "application/json; charset=utf-8",
        status: 404,
      });
      return;
    }
    await route.fulfill({
      body: JSON.stringify({
        data: {
          available: true,
          bodyMarkdown: `${legalPage.title} published fixture.\n\nSecond published paragraph for ${legalPage.slug}.`,
          diagnostic: `Loaded published legal document ${legalPage.documentType}.`,
          documentType: legalPage.documentType,
          effectiveAt: "2026-06-18T12:00:00.000Z",
          publishedAt: "2026-06-18T12:00:00.000Z",
          route: legalPage.route,
          slug: legalPage.slug,
          status: "PASS",
          title: legalPage.title,
          version: "1",
        },
        ok: true,
      }),
      contentType: "application/json; charset=utf-8",
      status: 200,
    });
  });
  const context = await openLegalServerPage(page);
  try {
    for (const legalPage of LEGAL_PAGES) {
      await gotoLegalPage(page, context.server, legalPage);
      await expect(page.locator("[data-legal-document-status]")).toContainText("PASS:");
      await expect(page.locator("[data-legal-document-effective]")).toHaveText("Effective June 18, 2026.");
      await expect(page.locator("[data-legal-document-body]")).toContainText(`${legalPage.title} published fixture.`);
      await expect(page.locator("[data-legal-document-body]")).toContainText(`Second published paragraph for ${legalPage.slug}.`);
      await expect(page.getByText("Draft")).toHaveCount(0);
    }
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await closeLegalServerPage(page, context);
  }
});
