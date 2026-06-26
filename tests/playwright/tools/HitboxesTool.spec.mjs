import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import {
  clearPlaywrightStorage,
  installPlaywrightStorageIsolation,
} from "../../helpers/playwrightStorageIsolation.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "hitboxes",
    surface: "Hitboxes testable MVP",
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

function collectPageFailures(page) {
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
    if (response.status() >= 400 && !response.url().includes("/api/storage/project-assets/read")) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    if (!request.url().includes("/api/storage/project-assets/read")) {
      failedRequests.push(`FAILED ${request.url()}`);
    }
  });

  return { consoleErrors, failedRequests, pageErrors };
}

async function openRepoPage(page, pathName) {
  const server = await startRepoServer();
  const failures = collectPageFailures(page);
  await page.addInitScript(({ apiUrl, siteUrl }) => {
    window.GameFoundryPublicConfig = {
      apiUrl,
      environmentLabel: "Development Environment",
      siteUrl,
    };
  }, { apiUrl: `${server.baseUrl}/api`, siteUrl: server.baseUrl });
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { ...failures, server };
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function signInFirstCreator(page) {
  await page.evaluate(async () => {
    const usersResponse = await fetch("/api/session/users");
    const usersBody = await usersResponse.json();
    const users = Array.isArray(usersBody?.data) ? usersBody.data : usersBody;
    const creator = users.find((user) => user.authenticated && user.roleSlugs?.includes("creator"));
    if (!creator?.userKey) {
      throw new Error("No creator test session user is available.");
    }
    await fetch("/api/session/user", {
      body: JSON.stringify({ userKey: creator.userKey }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
  });
}

test("Toolbox navigates to the Hitboxes tool", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html");

  try {
    await page.getByRole("link", { name: /hitboxes/i }).click();
    await expect(page).toHaveURL(/\/toolbox\/hitboxes\/index\.html/);
    await expect(page.locator("[data-hitboxes-canvas]")).toBeVisible();
    await expectNoPageFailures(failures);
  } finally {
    await failures.server.stop();
  }
});

test("Hitboxes supports DEV object source, rectangle editing, save, static collision, and swept motion", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/hitboxes/index.html");

  try {
    await signInFirstCreator(page);
    await page.reload({ waitUntil: "networkidle" });

    await expect(page.locator("[data-hitboxes-source-status]")).toContainText("DEV review/test data");
    await expect(page.locator("[data-hitboxes-object-a]")).toContainText("DEV Review Ball");
    await expect(page.locator("[data-hitboxes-object-b]")).toContainText("DEV Review Paddle");
    await expect(page.locator("[data-hitboxes-preview-summary]")).toContainText("DEV Review Ball Vector");
    await expect(page.locator("[data-hitboxes-canvas]")).toBeVisible();

    await page.locator("[data-hitboxes-add-rectangle]").click();
    await expect(page.locator("[data-hitboxes-list]")).toContainText("Hitbox 1");
    await expect(page.locator("[data-hitboxes-field='width']")).toHaveValue("10");
    await expect(page.locator("[data-hitboxes-field='height']")).toHaveValue("10");

    const canvas = page.locator("[data-hitboxes-canvas]");
    const box = await canvas.boundingBox();
    await page.mouse.move(box.x + 5, box.y + 5);
    await page.mouse.down();
    await page.mouse.move(box.x + 15, box.y + 18);
    await page.mouse.up();
    await expect(page.locator("[data-hitboxes-field='x']")).toHaveValue("10");
    await expect(page.locator("[data-hitboxes-field='y']")).toHaveValue("13");

    await page.mouse.move(box.x + 20, box.y + 23);
    await page.mouse.down();
    await page.mouse.move(box.x + 30, box.y + 35);
    await page.mouse.up();
    await expect(page.locator("[data-hitboxes-field='width']")).toHaveValue("20");
    await expect(page.locator("[data-hitboxes-field='height']")).toHaveValue("22");

    await page.locator("[data-hitboxes-field='x']").fill("0");
    await page.locator("[data-hitboxes-field='y']").fill("0");
    await page.locator("[data-hitboxes-field='width']").fill("10");
    await page.locator("[data-hitboxes-field='height']").fill("10");
    await page.locator("[data-hitboxes-save]").click();
    await expect(page.locator("[data-hitboxes-save-status]")).toContainText("Save: saved");

    await page.locator("[data-hitboxes-collision-field='objectBX']").fill("0");
    await page.locator("[data-hitboxes-collision-field='objectBY']").fill("10");
    await page.locator("[data-hitboxes-run-static]").click();
    await expect(page.locator("[data-hitboxes-static-output]")).toContainText("touching");

    await page.locator("[data-hitboxes-collision-field='objectBY']").fill("5");
    await page.locator("[data-hitboxes-run-static]").click();
    await expect(page.locator("[data-hitboxes-static-output]")).toContainText("overlapping");

    await page.locator("[data-hitboxes-reset-motion]").click();
    await page.locator("[data-hitboxes-run-motion-alt]").click();
    await expect(page.locator("[data-hitboxes-motion-output]")).toContainText("Collision detected before the next frame");
    await expect(page.locator("[data-hitboxes-motion-output]")).toContainText("Impact frame");
    await expectNoPageFailures(failures);
  } finally {
    await failures.server.stop();
  }
});

test("Guest save redirects to sign-in", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/hitboxes/index.html?guest=1");

  try {
    await page.locator("[data-hitboxes-add-rectangle]").click();
    await page.locator("[data-hitboxes-save]").click();
    await expect(page).toHaveURL(/\/account\/sign-in\.html/);
  } finally {
    await failures.server.stop();
  }
});
