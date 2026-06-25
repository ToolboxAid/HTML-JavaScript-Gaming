import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const LEGAL_PAGES = Object.freeze([
  Object.freeze({
    bodyText: "This page links to the legal policies for Game Foundry Studio.",
    path: "legal/index.html",
    title: "Legal Overview",
  }),
  Object.freeze({
    bodyText: "These Terms of Service govern your access to and use of Game Foundry Studio",
    path: "legal/terms-of-service.html",
    title: "Terms of Service",
  }),
  Object.freeze({
    bodyText: "This Privacy Policy explains how Game Foundry Studio LLC collects, uses, stores, and shares information",
    path: "legal/privacy-policy.html",
    title: "Privacy Policy",
  }),
  Object.freeze({
    bodyText: "This Cookie Policy explains how Game Foundry Studio LLC uses cookies and similar technologies.",
    path: "legal/cookie-policy.html",
    title: "Cookie Policy",
  }),
  Object.freeze({
    bodyText: "Game Foundry Studio is built to help creators build, play, and share games.",
    path: "legal/community-guidelines.html",
    title: "Community Guidelines",
  }),
  Object.freeze({
    bodyText: "Game Foundry Studio respects intellectual property rights and expects users to do the same.",
    path: "legal/copyright-policy.html",
    title: "Copyright Policy",
  }),
  Object.freeze({
    bodyText: "Game Foundry Studio LLC responds to copyright notices under the Digital Millennium Copyright Act",
    path: "legal/dmca-policy.html",
    title: "DMCA Policy",
  }),
]);

const LEGAL_LINK_LABELS = Object.freeze([
  "Legal Overview",
  "Terms of Service",
  "Privacy Policy",
  "Cookie Policy",
  "Community Guidelines",
  "Copyright Policy",
  "DMCA Policy",
]);

const FOOTER_LEGAL_PATHS = Object.freeze([
  "/legal/index.html",
  "/legal/terms-of-service.html",
  "/legal/privacy-policy.html",
  "/legal/cookie-policy.html",
  "/legal/community-guidelines.html",
  "/legal/copyright-policy.html",
  "/legal/dmca-policy.html",
]);

async function openLegalServerPage(page) {
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const server = await startRepoServer();
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
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
    previousApiUrl,
    server,
  };
}

async function closeLegalServerPage(page, context) {
  await workspaceV2CoverageReporter.stop(page);
  await context.server.close();
  if (context.previousApiUrl === undefined) {
    delete process.env.GAMEFOUNDRY_API_URL;
  } else {
    process.env.GAMEFOUNDRY_API_URL = context.previousApiUrl;
  }
}

async function expectLegalNavigation(page, legalPage) {
  const links = page.locator("aside.side-menu a");
  await expect(links).toHaveText(LEGAL_LINK_LABELS);

  const activeLink = page.locator("aside.side-menu a[aria-current='page']");
  await expect(activeLink).toHaveText(legalPage.title);
  await expect(activeLink).toHaveClass(/active/);
  await expect(activeLink).toHaveClass(/is-current/);

  const footerLinks = page.locator("footer.footer [aria-labelledby='footer-legal'] .footer__links a");
  await expect(footerLinks).toHaveText(LEGAL_LINK_LABELS);
  const footerPaths = await footerLinks.evaluateAll((footerLinkNodes) =>
    footerLinkNodes.map((link) => new URL(link.href).pathname),
  );
  expect(footerPaths).toEqual(FOOTER_LEGAL_PATHS);
}

async function gotoLegalPage(page, server, legalPage) {
  await page.goto(`${server.baseUrl}/${legalPage.path}`, { waitUntil: "networkidle" });
  await expect(page).toHaveTitle(`${legalPage.title} - Game Foundry Studio`);
  await expect(page.getByRole("heading", { level: 1, name: legalPage.title })).toBeVisible();
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("legal pages render approved static content with shared navigation", async ({ page }) => {
  const context = await openLegalServerPage(page);
  try {
    for (const legalPage of LEGAL_PAGES) {
      await gotoLegalPage(page, context.server, legalPage);
      await expectLegalNavigation(page, legalPage);
      await expect(page.locator(".legal-document-body")).toContainText(legalPage.bodyText);
      await expect(page.getByText("Published legal document")).toHaveCount(0);
      await expect(page.getByText("is not available")).toHaveCount(0);
      await expect(page.getByText("Temporary placeholder legal copy")).toHaveCount(0);
      await expect(page.locator("[data-legal-document-page]")).toHaveCount(0);
      await expect(page.locator("[data-legal-document-type]")).toHaveCount(0);
      await expect(page.locator("script[src$='legal-document-page.js']")).toHaveCount(0);
      await expect(page.locator("aside.side-menu noscript")).toHaveCount(0);
    }
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await closeLegalServerPage(page, context);
  }
});
