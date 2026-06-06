import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "tool-center-fullscreen",
    surface: "Tool Center fullscreen accordion layout"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

async function openRepoPage(page, pathName) {
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

  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function expectToolCenterAccordionFlex(page) {
  const centerPanel = page.locator(".tool-center-panel");
  const accordions = centerPanel.locator("> details.vertical-accordion");
  await expect(accordions).toHaveCount(2);
  await page.getByLabel("Tool Display Mode").click();
  await expect(page.locator("body")).toHaveClass(/tool-focus-mode/);
  await expect(centerPanel).toHaveCSS("overflow-y", "hidden");

  await accordions.nth(1).locator("summary").click();
  await expect(accordions.nth(0)).toHaveAttribute("open", "");
  await expect(accordions.nth(1)).toHaveAttribute("open", "");
  const firstBox = await accordions.nth(0).boundingBox();
  const secondBox = await accordions.nth(1).boundingBox();
  expect(firstBox?.height || 0).toBeGreaterThan(160);
  expect(secondBox?.height || 0).toBeGreaterThan(160);
  expect(Math.abs((firstBox?.height || 0) - (secondBox?.height || 0))).toBeLessThan(12);

  const firstSummary = accordions.nth(0).locator("> summary");
  const firstBody = accordions.nth(0).locator("> .accordion-body");
  await expect(firstBody).toHaveCSS("overflow-y", "auto");
  await firstBody.evaluate((body) => {
    for (let index = 0; index < 24; index += 1) {
      const paragraph = document.createElement("p");
      paragraph.textContent = `Scrollable body validation row ${index + 1}`;
      body.append(paragraph);
    }
  });
  const bodyMetrics = await firstBody.evaluate((body) => ({
    clientHeight: body.clientHeight,
    scrollHeight: body.scrollHeight
  }));
  expect(bodyMetrics.scrollHeight).toBeGreaterThan(bodyMetrics.clientHeight);
  const summaryBefore = await firstSummary.boundingBox();
  await firstBody.evaluate((body) => {
    body.scrollTop = body.scrollHeight;
  });
  const summaryAfter = await firstSummary.boundingBox();
  expect(Math.abs((summaryBefore?.y || 0) - (summaryAfter?.y || 0))).toBeLessThan(2);

  await accordions.nth(1).locator("summary").click();
  await expect(accordions.nth(1)).not.toHaveAttribute("open", "");
  const firstOnlyBox = await accordions.nth(0).boundingBox();
  const collapsedSecondBox = await accordions.nth(1).boundingBox();
  expect(firstOnlyBox?.height || 0).toBeGreaterThan((firstBox?.height || 0) * 1.45);
  expect(collapsedSecondBox?.height || 0).toBeLessThan((secondBox?.height || 0) * 0.45);
}

test("Publish Tool Center fullscreen accordions share height and keep summaries fixed", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/publish/index.html?role=user");

  try {
    await expect(page.locator("body")).not.toHaveClass(/tool-focus-mode/);
    await expect(page.locator(".tool-center-panel > details.vertical-accordion")).toHaveCount(2);
    await expectToolCenterAccordionFlex(page);
    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});
