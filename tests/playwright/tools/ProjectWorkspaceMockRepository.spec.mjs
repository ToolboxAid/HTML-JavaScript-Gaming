import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "project-workspace",
    surface: "game workspace mock repository"
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
  return { failedRequests, pageErrors, consoleErrors, server };
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

test("Game Workspace creates, opens, and deletes mock games", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-workspace/index.html");

  try {
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Create Game" })).toHaveClass("btn");
    await expect(page.getByRole("button", { name: "Delete Open Game" })).toHaveClass("btn");
    await expect(page.locator("[data-active-project-name]")).toHaveText("Demo Project");
    await expect(page.locator("[data-active-project-purpose]")).toHaveText("Game Project");
    await expect(page.locator("[data-current-user-role]")).toHaveText("Owner");
    await expect(page.locator("[data-project-list]")).toContainText("Demo Project");
    await expect(page.locator("[data-project-list]")).toContainText("Gravity Demo");
    await expect(page.locator("[data-project-list]")).toContainText("Collision Demo");
    await expect(page.locator("[data-project-list]")).toContainText("Camera Follow Demo");
    const demoProjectRow = page.locator("[data-project-row='demo-project']");
    await expect(demoProjectRow.locator("> .status")).toHaveCount(0);
    await expect(demoProjectRow.getByRole("button", { name: "Open Demo Project (Active)" })).toHaveClass(/primary/);
    await expect(demoProjectRow.getByRole("button", { name: "Open Demo Project (Active)" })).toHaveAttribute("aria-current", "true");

    await page.getByLabel("Game Name").fill("Launch Test Project");
    await page.getByRole("button", { name: "Create Game" }).click();
    await expect(page.locator("[data-active-project-name]")).toHaveText("Launch Test Project");
    await expect(page.locator("[data-project-list]")).toContainText("Launch Test Project");
    await expect(page.locator("[data-project-row='launch-test-project-1']").getByRole("button", { name: "Open Launch Test Project (Active)" })).toHaveClass(/primary/);
    await expect(page.locator("[data-game-workspace-log]")).toHaveText("Created and opened Launch Test Project.");

    await page.getByLabel("Game Name").fill("Archive Project");
    await page.getByRole("button", { name: "Create Game" }).click();
    await expect(page.locator("[data-active-project-name]")).toHaveText("Archive Project");

    await page.getByRole("button", { name: "Open Launch Test Project" }).click();
    await expect(page.locator("[data-active-project-name]")).toHaveText("Launch Test Project");
    await expect(page.locator("[data-project-row='launch-test-project-1']").getByRole("button", { name: "Open Launch Test Project (Active)" })).toHaveAttribute("data-project-active", "true");
    await expect(page.locator("[data-game-workspace-log]")).toHaveText("Opened Launch Test Project.");

    await page.getByRole("button", { name: "Delete Open Game" }).click();
    await expect(page.locator("[data-active-project-name]")).not.toHaveText("Launch Test Project");
    await expect(page.locator("[data-project-list]")).not.toContainText("Launch Test Project");
    await expect(page.locator("[data-game-workspace-log]")).toHaveText("Deleted Launch Test Project.");

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Workspace displays and edits game purpose and member role", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-workspace/index.html");

  try {
    await expect(page.locator("#projectPurposeInput option")).toHaveText([
      "Game Project",
      "Capability Demo",
      "Learning Project",
      "Template Project"
    ]);
    await expect(page.locator("#projectStatusInput option")).toHaveText([
      "Planning",
      "Under Construction",
      "Ready for Testing",
      "Ready for Publish"
    ]);
    await expect(page.locator("#currentUserRoleInput option")).toHaveText([
      "Owner",
      "Designer",
      "World Builder",
      "Artist",
      "Audio Creator",
      "Translator",
      "Tester",
      "Publisher",
      "Viewer"
    ]);
    await expect(page.getByLabel("Game Purpose")).toHaveValue("Game Project");
    await expect(page.getByLabel("Game Status")).toHaveValue("Under Construction");
    await expect(page.getByLabel("Current User Role")).toHaveValue("Owner");
    await expect(page.locator("[data-project-members-table]")).toContainText("Owner");

    await page.getByLabel("Game Purpose").selectOption("Learning Project");
    await expect(page.locator("[data-active-project-purpose]")).toHaveText("Learning Project");
    await expect(page.locator("[data-game-workspace-log]")).toHaveText("Updated Demo Project purpose to Learning Project.");

    await page.getByLabel("Game Status").selectOption("Ready for Testing");
    await expect(page.locator("[data-active-project-status]")).toHaveText("Ready for Testing");
    await expect(page.locator("[data-game-workspace-log]")).toHaveText("Updated Demo Project status to Ready for Testing.");

    await page.getByLabel("Current User Role").selectOption("Designer");
    await expect(page.locator("[data-current-user-role]")).toHaveText("Designer");
    await expect(page.locator("[data-project-members-table]")).toContainText("Designer");
    await expect(page.locator("[data-game-workspace-log]")).toHaveText("Updated current user role to Designer.");

    await page.getByLabel("Game Purpose").selectOption("Capability Demo");
    await page.getByLabel("Game Name").fill("Purpose Review Project");
    await page.getByRole("button", { name: "Create Game" }).click();
    await expect(page.locator("[data-active-project-name]")).toHaveText("Purpose Review Project");
    await expect(page.locator("[data-active-project-purpose]")).toHaveText("Capability Demo");
    await expect(page.locator("[data-current-user-role]")).toHaveText("Owner");
    await expect(page.locator("[data-project-list]")).toContainText("Purpose Review Project");

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Workspace progress panels update from mock game state", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-workspace/index.html");

  try {
    await expect(page.locator("[data-project-status]")).toHaveText("Under Construction");
    await expect(page.locator("[data-project-progress]")).toHaveText("Demo Project identity ready");
    await expect(page.locator("[data-publishing-progress]")).toHaveText("Publish blocked until configuration and required assets are ready");
    await expect(page.locator("[data-current-focus]")).toHaveText("Complete Game Configuration");
    await expect(page.locator("[data-recommended-next-tool]").first()).toHaveText("Game Configuration");
    await expect(page.locator("[data-project-progress-checklist]")).toContainText("Game identity: Complete");
    await expect(page.locator("[data-project-output-panels] summary")).toHaveText([
      "Readiness Output",
      "Repository Tables",
      "Team Members"
    ]);
    await expect(page.locator("aside.tool-column").last().getByText("Readiness Output")).toHaveCount(0);
    await expect(page.locator("aside.tool-column").last().getByText("Repository Tables")).toHaveCount(0);
    await expect(page.locator("aside.tool-column").last().getByText("Team Members")).toHaveCount(0);
    const panelOrderIsCorrect = await page.locator(".tool-center-panel").evaluate((panel) => {
      const staticOverlay = panel.querySelector("[data-game-workspace-foundation]");
      const outputPanels = panel.querySelector("[data-project-output-panels]");
      const missingRequirements = panel.querySelector("[data-missing-requirements]");
      return Boolean(
        staticOverlay &&
        outputPanels &&
        missingRequirements &&
        (staticOverlay.compareDocumentPosition(outputPanels) & Node.DOCUMENT_POSITION_FOLLOWING) &&
        (outputPanels.compareDocumentPosition(missingRequirements) & Node.DOCUMENT_POSITION_FOLLOWING)
      );
    });
    expect(panelOrderIsCorrect).toBe(true);

    await page.getByLabel("Game Name").fill("Progress Review Project");
    await page.getByRole("button", { name: "Create Game" }).click();
    await expect(page.locator("[data-project-status]")).toHaveText("Under Construction");
    await expect(page.locator("[data-project-progress]")).toHaveText("Progress Review Project identity ready");
    await expect(page.locator("[data-table-counts], [data-project-table-counts]")).toContainText("projects");
    await expect(page.locator("[data-project-table-counts]")).toContainText("5");
    await expect(page.locator("[data-project-members-table]")).toContainText("Owner");

    await page.getByRole("button", { name: "Delete Open Game" }).click();
    await expect(page.locator("[data-active-project-name]")).toHaveText("Demo Project");
    await expect(page.locator("[data-project-progress]")).toHaveText("Demo Project identity ready");

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Workspace uses the wide Theme V2 tool layout at desktop widths", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  const failures = await openRepoPage(page, "/toolbox/game-workspace/index.html");

  try {
    await expect(page.locator(".container--tool-wide")).toBeVisible();
    await expect(page.locator(".tool-workspace--wide")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    const desktopLayout = await page.locator(".tool-workspace--wide").evaluate((workspace) => {
      const container = workspace.closest(".container--tool-wide");
      const columns = getComputedStyle(workspace).gridTemplateColumns
        .split(" ")
        .map((value) => Number.parseFloat(value));
      const [left, center, right] = columns;
      return {
        center,
        containerWidth: container.getBoundingClientRect().width,
        left,
        right,
        viewportWidth: window.innerWidth
      };
    });
    expect(desktopLayout.containerWidth).toBeGreaterThan(1300);
    expect(desktopLayout.containerWidth / desktopLayout.viewportWidth).toBeGreaterThan(0.95);
    expect(Math.abs(desktopLayout.left - desktopLayout.right)).toBeLessThan(2);
    expect(desktopLayout.center).toBeGreaterThan(desktopLayout.left);

    await page.setViewportSize({ width: 1920, height: 1100 });
    await page.reload({ waitUntil: "networkidle" });
    const idealLayout = await page.locator(".tool-workspace--wide").evaluate((workspace) => {
      const container = workspace.closest(".container--tool-wide");
      const columns = getComputedStyle(workspace).gridTemplateColumns
        .split(" ")
        .map((value) => Number.parseFloat(value));
      const [left, center, right] = columns;
      return {
        center,
        containerWidth: container.getBoundingClientRect().width,
        left,
        right,
        viewportWidth: window.innerWidth
      };
    });
    expect(idealLayout.containerWidth).toBeGreaterThan(1800);
    expect(idealLayout.containerWidth / idealLayout.viewportWidth).toBeGreaterThan(0.95);
    expect(Math.abs(idealLayout.left - idealLayout.right)).toBeLessThan(2);
    expect(idealLayout.center).toBeGreaterThan(idealLayout.left);

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("representative Toolbox tool pages use the wide Theme V2 layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  const failures = await openRepoPage(page, "/toolbox/objects/index.html");
  const representativeToolPages = [
    { group: "Create", path: "/toolbox/objects/index.html" },
    { group: "Build", path: "/toolbox/game-design/index.html" },
    { group: "Content", path: "/toolbox/assets/index.html" },
    { group: "Media", path: "/toolbox/audio/index.html" },
    { group: "Test", path: "/toolbox/controls/index.html" },
    { group: "Share", path: "/toolbox/publish/index.html" },
    { group: "Account", path: "/toolbox/saved-data/index.html" }
  ];

  try {
    for (const toolPage of representativeToolPages) {
      await page.goto(`${failures.server.baseUrl}${toolPage.path}`, { waitUntil: "networkidle" });
      await expect(page.locator(".container--tool-wide")).toBeVisible();
      await expect(page.locator(".tool-workspace--wide")).toBeVisible();
      await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
      const layout = await page.locator(".tool-workspace--wide").evaluate((workspace) => {
        const container = workspace.closest(".container--tool-wide");
        const columns = getComputedStyle(workspace).gridTemplateColumns
          .split(" ")
          .map((value) => Number.parseFloat(value));
        const [left, center, right] = columns;
        return {
          center,
          containerWidth: container.getBoundingClientRect().width,
          left,
          right,
          viewportWidth: window.innerWidth
        };
      });
      expect(layout.containerWidth, `${toolPage.group} page uses wide container`).toBeGreaterThan(1300);
      expect(layout.containerWidth / layout.viewportWidth, `${toolPage.group} page reduces side margins`).toBeGreaterThan(0.95);
      expect(Math.abs(layout.left - layout.right), `${toolPage.group} side panels are balanced`).toBeLessThan(2);
      expect(layout.center, `${toolPage.group} center panel is dominant`).toBeGreaterThan(layout.left);
    }

    expect(failures.failedRequests.filter((request) => !request.includes("forge-bot-single.png"))).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors.filter((message) => !message.includes("404 (Not Found)"))).toEqual([]);
  } finally {
    await failures.server.close();
  }
});

test("Learn Getting Started documents screen and layout guidance", async ({ page }) => {
  const failures = await openRepoPage(page, "/learn/index.html");

  try {
    await expect(page.getByRole("heading", { name: "Getting Started" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Getting Started" })).toHaveAttribute("href", "getting-started/index.html");
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);

    await page.goto(`${failures.server.baseUrl}/learn/getting-started/index.html`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Getting Started" })).toBeVisible();
    await expect(page.getByText("Tools are built for 1440px and larger desktop workspaces.")).toBeVisible();
    await expect(page.getByText("1440px is the minimum comfortable desktop width")).toBeVisible();
    await expect(page.getByText("1920px is the ideal desktop width")).toBeVisible();
    await expect(page.getByText("Smaller screens may use stacked or collapsed panels later.")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Toolbox member-role filters focus tools without exposing admin-only controls", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html");

  try {
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 11/39");
    await expect(page.locator("[data-toolbox-role-focus]")).toHaveCount(0);
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Workspace$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Project Journey$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Design$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Configuration$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Assets$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Testing$/ }) })).toHaveCount(0);

    await page.goto(`${failures.server.baseUrl}/toolbox/index.html?memberRole=Designer`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-role-focus='Designer']")).toBeVisible();
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 7/39");
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Workspace$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Project Journey$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Design$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Configuration$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Assets$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Objects$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Audio$/ }) })).toHaveCount(0);
    await expect(page.getByText("Unavailable tools are hidden by role focus, not by security enforcement.")).toBeVisible();

    await page.goto(`${failures.server.baseUrl}/toolbox/index.html?memberRole=Audio%20Creator`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-role-focus='Audio Creator']")).toBeVisible();
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 1/39");
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Assets$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Audio$/ }) })).toHaveCount(0);
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^MIDI$/ }) })).toHaveCount(0);
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Design$/ }) })).toHaveCount(0);

    await page.goto(`${failures.server.baseUrl}/toolbox/index.html?memberRole=Viewer`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-role-focus='Viewer']")).toBeVisible();
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 9/39");
    await expect(page.getByText("Viewer focus shows preview-safe read-only tiles only.")).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Workspace$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Project Journey$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Design$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Configuration$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Assets$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Debug$/ }) })).toHaveCount(0);
    await page.goto(`${failures.server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 11/39");
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Cloud$/ }) })).toHaveCount(0);

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});
