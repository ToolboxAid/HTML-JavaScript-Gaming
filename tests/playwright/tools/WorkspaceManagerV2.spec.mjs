import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter as coverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

async function openWorkspaceManagerV2(page, query = "") {
  const server = await startRepoServer();
  await installMockRepoPicker(page);
  await coverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/workspace-manager-v2/index.html${query}`, { waitUntil: "networkidle" });
  return server;
}

async function openAssetManagerV2(page, query = "") {
  const server = await startRepoServer();
  await coverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/asset-manager-v2/index.html${query}`, { waitUntil: "networkidle" });
  return server;
}

async function openToolsIndex(page) {
  const server = await startRepoServer();
  await coverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/index.html`, { waitUntil: "networkidle" });
  return server;
}

async function openSessionInspectorV2(page, query = "") {
  const server = await startRepoServer();
  await coverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/session-inspector-v2/index.html${query}`, { waitUntil: "networkidle" });
  return server;
}

function manifestRepoPath(server) {
  return server.repoRoot.replaceAll("\\", "/");
}

async function installMockRepoPicker(page) {
  await page.addInitScript(() => {
    const defaultManifestPaths = [
      "/games/Asteroids/game.manifest.json",
      "/games/GravityWell/game.manifest.json",
      "/games/Pong/game.manifest.json"
    ];

    function makeFileHandle(name, text) {
      return {
        kind: "file",
        name,
        async getFile() {
          return new File([text], name, { type: "application/json" });
        }
      };
    }

    function makeDirectoryHandle(name, children = {}) {
      return {
        kind: "directory",
        name,
        async getDirectoryHandle(childName) {
          const child = children[childName];
          if (child?.kind === "directory") {
            return child;
          }
          throw new DOMException(`${childName} was not found.`, "NotFoundError");
        },
        async getFileHandle(childName) {
          const child = children[childName];
          if (child?.kind === "file") {
            return child;
          }
          throw new DOMException(`${childName} was not found.`, "NotFoundError");
        },
        async *entries() {
          for (const entry of Object.entries(children)) {
            yield entry;
          }
        }
      };
    }

    async function fetchManifestText(path) {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`${path} returned ${response.status}`);
      }
      return await response.text();
    }

    async function makeMockRepoHandle(config = {}) {
      const repoName = config.repoName || "HTML-JavaScript-Gaming";
      if (config.missingGames) {
        return makeDirectoryHandle(repoName, {});
      }
      const games = {
        MissingManifest: makeDirectoryHandle("MissingManifest", {}),
        InvalidWorkspace: makeDirectoryHandle("InvalidWorkspace", {
          "game.manifest.json": makeFileHandle("game.manifest.json", JSON.stringify({
            schema: "html-js-gaming.project",
            version: 1,
            tools: {}
          }))
        })
      };
      for (const manifestPath of (config.manifestPaths || defaultManifestPaths)) {
        const parts = manifestPath.replace(/^\/+/, "").split("/");
        const gameFolder = parts[1];
        games[gameFolder] = makeDirectoryHandle(gameFolder, {
          "game.manifest.json": makeFileHandle("game.manifest.json", await fetchManifestText(manifestPath))
        });
      }
      return makeDirectoryHandle(repoName, {
        games: makeDirectoryHandle("games", games)
      });
    }

    window.__workspaceManagerV2MockRepoConfig = {};
    window.showDirectoryPicker = async () => {
      if (window.__workspaceManagerV2MockRepoConfig?.failPicker) {
        throw new DOMException("Mock picker canceled.", "AbortError");
      }
      return await makeMockRepoHandle(window.__workspaceManagerV2MockRepoConfig || {});
    };
  });
}

async function selectMockRepo(page, { repoName = "HTML-JavaScript-Gaming" } = {}) {
  await page.evaluate((nextRepoName) => {
    window.__workspaceManagerV2MockRepoConfig = { repoName: nextRepoName };
  }, repoName);
  await page.locator("#pickRepoBtn").click();
  await expect(page.locator("#repoSelectedValue")).toHaveText(repoName);
  await expect(page.locator("#activeGameSelect")).toBeEnabled();
  await expect(page.locator("#activeGameSelect")).toHaveValue("");
  await expect(page.locator("#activeGameSelect option")).toHaveText([
    "Select a game",
    "Asteroids",
    "Gravity Well",
    "Pong"
  ]);
  await expectWorkspaceToolsDisabled(page);
}

async function expectWorkspaceToolsDisabled(page) {
  await expect(page.locator("#workspaceToolTiles [data-workspace-tool-id]")).toHaveCount(5);
  expect(await page.locator("#workspaceToolTiles [data-workspace-tool-id]").evaluateAll((tiles) => tiles.every((tile) => tile.disabled))).toBe(true);
}

async function readWorkspaceSessionHydration(page) {
  return await page.evaluate(() => {
    const parseJson = (key) => {
      const value = window.sessionStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    };
    const keys = Array.from({ length: window.sessionStorage.length }, (_, index) => window.sessionStorage.key(index))
      .filter(Boolean)
      .sort();
    const toolKeys = keys.filter((key) => key.startsWith("workspace.tools."));
    const toolSessions = Object.fromEntries(toolKeys
      .filter((key) => !key.endsWith(".schema") && !key.endsWith(".state"))
      .map((key) => [key.slice("workspace.tools.".length), parseJson(key)]));
    return {
      repoReference: parseJson("workspace.repo.reference"),
      schemaByTool: Object.fromEntries(Object.entries(toolSessions)
        .map(([toolId, session]) => [toolId, session?.schema || null])),
      workspaceByTool: Object.fromEntries(Object.entries(toolSessions)
        .map(([toolId, session]) => [toolId, session?.workspace || null])),
      dataByTool: Object.fromEntries(Object.entries(toolSessions)
        .map(([toolId, session]) => [toolId, Object.hasOwn(session || {}, "data") ? session.data : undefined])),
      dirtyByTool: Object.fromEntries(Object.entries(toolSessions)
        .map(([toolId, session]) => [toolId, session?.dirty || null])),
      toolSessions,
      toolKeys
    };
  });
}

async function expectSessionInspectorV2AccordionToggles(page, contentId) {
  const header = page.locator(`.accordion-v2__header[aria-controls="${contentId}"]`);
  const content = page.locator(`#${contentId}`);
  const label = header.locator("span").first();
  const icon = header.locator(".accordion-v2__icon");
  await expect(header).toBeVisible();
  await expect(content).toBeVisible();
  await expect(header).toHaveAttribute("aria-expanded", "true");
  await label.click();
  await expect(content).toBeHidden();
  await expect(header).toHaveAttribute("aria-expanded", "false");
  await icon.click();
  await expect(content).toBeVisible();
  await expect(header).toHaveAttribute("aria-expanded", "true");
}

async function expectSessionInspectorV2FullscreenShell(page) {
  const summary = page.locator("[data-session-inspector-v2-summary]");
  await summary.click();
  const enteredFullscreen = await page.waitForFunction(() => document.body.classList.contains("tools-platform-fullscreen-active"), null, { timeout: 2500 })
    .then(() => true)
    .catch(() => false);
  if (!enteredFullscreen) {
    await page.evaluate(() => {
      document.querySelector(".is-collapsible").open = false;
      window.__sessionInspectorV2App.applyFullscreenState(true);
      window.__sessionInspectorV2App.updateSummary();
    });
  }
  await expect(page.locator("body")).toHaveClass(/tools-platform-fullscreen-active/);
  await expect(summary).toHaveAttribute("data-tools-platform-summary-mode", "fullscreen");

  const fullscreenLayout = await page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const root = document.querySelector(".tool-shell-common__fullscreen-root").getBoundingClientRect();
    const layout = document.querySelector(".tool-shell-common__fullscreen-layout").getBoundingClientRect();
    const left = document.querySelector(".tool-shell-common__fullscreen-panel-left").getBoundingClientRect();
    const center = document.querySelector(".tool-shell-common__fullscreen-center-panel").getBoundingClientRect();
    const right = document.querySelector(".tool-shell-common__fullscreen-panel-right").getBoundingClientRect();
    return {
      centerAfterLeft: center.left > left.right,
      leftAtSide: left.left < center.left,
      leftWidth: Math.round(left.width),
      layoutDisplay: getComputedStyle(document.querySelector(".tool-shell-common__fullscreen-layout")).display,
      rightAtSide: right.left > center.right,
      rightWithinRoot: right.right <= root.right + 1,
      rightWidth: Math.round(right.width),
      rootWidth: Math.round(root.width),
      viewportWidth
    };
  });
  expect(fullscreenLayout.layoutDisplay).toBe("grid");
  expect(fullscreenLayout.rootWidth).toBeGreaterThanOrEqual(fullscreenLayout.viewportWidth - 20);
  expect(fullscreenLayout.leftWidth).toBe(340);
  expect(fullscreenLayout.rightWidth).toBe(360);
  expect(fullscreenLayout.leftAtSide).toBe(true);
  expect(fullscreenLayout.centerAfterLeft).toBe(true);
  expect(fullscreenLayout.rightAtSide).toBe(true);
  expect(fullscreenLayout.rightWithinRoot).toBe(true);

  if (await page.evaluate(() => Boolean(document.fullscreenElement))) {
    await summary.click();
    await expect(page.locator("body")).not.toHaveClass(/tools-platform-fullscreen-active/);
  } else {
    await page.evaluate(() => {
      window.__sessionInspectorV2App.applyFullscreenState(false);
      document.querySelector(".is-collapsible").open = true;
      window.__sessionInspectorV2App.updateSummary();
    });
    await expect(page.locator("body")).not.toHaveClass(/tools-platform-fullscreen-active/);
  }
  await expect(summary).toHaveAttribute("data-tools-platform-summary-mode", "normal");
}

test.describe("Workspace Manager V2 bootstrap", () => {
  test.afterAll(async () => {
    await coverageReporter.writeReport();
  });

  test("registers Workspace Manager V2 from the tools index", async ({ page }) => {
    const server = await openToolsIndex(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      const card = page.locator(".tools-platform-card", { has: page.locator("h3", { hasText: "Workspace Manager V2" }) });
      await expect(card).toBeVisible();
      await expect(card.locator("a", { hasText: "Workspace Manager V2" })).toHaveAttribute("href", "/tools/workspace-manager-v2/index.html");
      await expect(card).toContainText("First-Class Tool V2 workspace surface");
      await expect(card).toContainText("Workspace");
      const toolsIndexState = await page.evaluate(() => {
        const firstClassToolsSection = Array.from(document.querySelectorAll("section"))
          .find((section) => section.querySelector(":scope > h2")?.textContent?.trim() === "First-Class Tools");
        const workflowGrid = firstClassToolsSection?.querySelector("[data-active-tools-workflow-grid]");
        const utilitiesGrid = firstClassToolsSection?.querySelector("[data-active-tools-utilities-grid]");
        const viewersGrid = firstClassToolsSection?.querySelector("[data-active-tools-viewers-grid]");
        const workspaceCard = workflowGrid?.querySelector(".tools-platform-card");
        return {
          actionLabels: Array.from(firstClassToolsSection?.querySelectorAll(".tools-platform-card__action") || [])
            .map((action) => action.textContent.trim()),
          headings: Array.from(firstClassToolsSection?.querySelectorAll(":scope > h3") || [])
            .map((heading) => heading.textContent.trim()),
          sampleLabels: Array.from(firstClassToolsSection?.querySelectorAll(".tools-platform-card__action") || [])
            .map((action) => action.textContent.trim())
            .filter((label) => label.startsWith("Samples")),
          utilitiesCards: Array.from(utilitiesGrid?.querySelectorAll(".tools-platform-card h3") || [])
            .map((heading) => heading.textContent.trim()),
          viewersCards: Array.from(viewersGrid?.querySelectorAll(".tools-platform-card h3") || [])
            .map((heading) => heading.textContent.trim()),
          workflowCards: Array.from(workflowGrid?.querySelectorAll(".tools-platform-card h3") || [])
            .map((heading) => heading.textContent.trim()),
          workspaceActionLabels: Array.from(workspaceCard?.querySelectorAll(".tools-platform-card__action") || [])
            .map((action) => action.textContent.trim())
        };
      });
      expect(toolsIndexState.headings.slice(0, 4)).toEqual(["Workflow", "Editors", "Utilities", "Viewers"]);
      expect(toolsIndexState.workflowCards).toEqual(["Workspace Manager V2"]);
      expect(toolsIndexState.utilitiesCards).not.toContain("Workspace Manager V2");
      expect(toolsIndexState.viewersCards).toContain("Session Inspector V2");
      expect(toolsIndexState.viewersCards).not.toContain("Session Inspector");
      expect(toolsIndexState.workspaceActionLabels).toEqual(["How To Use", "Read Me"]);
      expect(toolsIndexState.actionLabels).not.toContain("README");
      expect(toolsIndexState.sampleLabels.every((label) => /^Samples \(\d+\)$/.test(label))).toBe(true);
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("uses First-Class Tool V2 theme contract", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("body")).toHaveClass(/tools-platform-tool-page/);
      await expect(page.locator("body")).toHaveClass(/tools-platform-surface/);
      await expect(page.locator("body")).toHaveClass(/hub-page-tools/);
      const themeContract = await page.evaluate(async () => {
        const stylesheetPaths = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
          .map((link) => new URL(link.href).pathname);
        const css = await fetch("/tools/workspace-manager-v2/styles/workspaceManagerV2.css", { cache: "no-store" }).then((response) => response.text());
        const probeStyle = (property, value) => {
          const probe = document.createElement("div");
          probe.style[property] = value;
          document.body.append(probe);
          const computed = getComputedStyle(probe)[property];
          probe.remove();
          return computed;
        };
        const bodyStyle = getComputedStyle(document.body);
        const shellStyle = getComputedStyle(document.querySelector(".workspace-manager-v2.app-shell"));
        const panelStyle = getComputedStyle(document.querySelector(".workspace-manager-v2__panel"));
        const summaryStyle = getComputedStyle(document.querySelector(".tools-platform-frame__accordion-summary"));
        const textareaStyle = getComputedStyle(document.querySelector("#statusLog"));
        return {
          bodyBackground: bodyStyle.backgroundImage,
          bodyColor: bodyStyle.color,
          cssHasHardcodedColors: /#[0-9a-f]{3,8}|rgba?\(|linear-gradient/i.test(css),
          cssUsesThemeTokens: [
            "--workspace-manager-v2-bg: var(--bg-gradient);",
            "--workspace-manager-v2-panel: var(--panel);",
            "--workspace-manager-v2-surface: var(--surface-inline);",
            "--workspace-manager-v2-line: var(--line);",
            "--workspace-manager-v2-text: var(--text);",
            "--workspace-manager-v2-muted: var(--muted);",
            "--workspace-manager-v2-accent: var(--accent);"
          ].every((snippet) => css.includes(snippet)),
          expectedBackground: probeStyle("backgroundImage", "var(--bg-gradient)"),
          expectedInputBackground: probeStyle("backgroundColor", "var(--surface-inline)"),
          expectedLine: probeStyle("borderColor", "var(--line)"),
          expectedPanel: probeStyle("backgroundColor", "var(--panel)"),
          expectedText: probeStyle("color", "var(--text)"),
          panelBackground: panelStyle.backgroundColor,
          shellBorder: shellStyle.borderTopColor,
          stylesheetPaths,
          summaryBackground: summaryStyle.backgroundColor,
          textareaBackground: textareaStyle.backgroundColor
        };
      });
      expect(themeContract.stylesheetPaths).toEqual([
        "/src/engine/theme/main.css",
        "/src/engine/ui/hubCommon.css",
        "/src/engine/theme/accordionV2/accordionV2.css",
        "/tools/workspace-manager-v2/styles/workspaceManagerV2.css"
      ]);
      expect(themeContract.cssHasHardcodedColors).toBe(false);
      expect(themeContract.cssUsesThemeTokens).toBe(true);
      expect(themeContract.bodyColor).toBe(themeContract.expectedText);
      expect(themeContract.bodyBackground).toBe(themeContract.expectedBackground);
      expect(themeContract.shellBorder).toBe(themeContract.expectedLine);
      expect(themeContract.panelBackground).toBe(themeContract.expectedPanel);
      expect(themeContract.summaryBackground).toBe(themeContract.expectedPanel);
      expect(themeContract.textareaBackground).toBe(themeContract.expectedInputBackground);
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("launches Session Inspector V2 with V2 labels, accordions, theme, and delete controls", async ({ page }) => {
    const pageErrors = [];
    await page.setViewportSize({ height: 900, width: 1440 });
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, "clipboard", {
        configurable: true,
        value: {
          async writeText(value) {
            window.__sessionInspectorV2ClipboardText = value;
          }
        }
      });
      window.sessionStorage.setItem("session-inspector-v2-alpha", "true");
      window.sessionStorage.setItem("session-inspector-v2-beta", "plain beta value");
      window.sessionStorage.setItem("session-inspector-v2-gamma", JSON.stringify({ index: 3, wraps: true }));
      window.sessionStorage.setItem("session-inspector-v2-delta", "delta value that is long enough to prove tile text clips inside a fixed tile");
      window.sessionStorage.setItem("session-inspector-v2-super-long-storage-key-name-that-must-wrap-inside-the-fixed-session-tile", "epsilon value");
      window.localStorage.setItem("session-inspector-v2-local", "local value");
    });
    const server = await openSessionInspectorV2(page, "?launch=workspace&fromTool=workspace-manager-v2&hostContextId=session-inspector-v2-test-context&workspaceMode=uat");

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("body[data-tool-id='session-inspector-v2']")).toBeVisible();
      await expect(page.locator("h1")).toHaveText("Session Inspector V2");
      await expect(page.locator("h1")).not.toHaveText("Session Inspector");
      await expect(page.locator('link[href="./styles/sessionInspectorV2.css"]')).toHaveCount(1);
      await expect(page.locator('link[href="./styles/sessionInspector.css"]')).toHaveCount(0);
      await expect(page.locator('link[href="../common/toolShellCommon.css"]')).toHaveCount(1);
      await expect(page.locator(".session-inspector-v2__menu")).toHaveCount(0);
      await expect(page.locator("#returnToWorkspaceButton")).toHaveCount(1);
      await expect(page.locator(".session-inspector-v2__workspace-menu")).toBeVisible();
      await expect(page.locator(".session-inspector-v2__workspace-menu")).toHaveAttribute("aria-label", "Workspace actions");
      await expect(page.locator(".session-inspector-v2__workspace-menu")).toHaveAttribute("data-launch-mode-nav", "workspace");
      await expect(page.locator(".session-inspector-v2__workspace-menu #returnToWorkspaceButton")).toHaveText("Return to Workspace");
      await expect(page.locator(".session-inspector-v2__local-shell-frame #returnToWorkspaceButton")).toHaveCount(0);
      await expect(page.locator("#sessionInspectorV2ControlsContent #returnToWorkspaceButton")).toHaveCount(0);
      await expect(page.locator("#refreshSessionInspectorV2Button")).toHaveText("Refresh");
      await expect(page.locator("#deleteAllSessionInspectorV2Button")).toHaveText("Delete All");
      await expect(page.locator("#clearSessionInspectorV2StatusButton")).toHaveText("Clear Status");
      await expect(page.locator("#sessionInspectorV2ControlsContent")).toContainText("Refresh");
      await expect(page.locator("#sessionInspectorV2ControlsContent")).toContainText("Delete All");
      await expect(page.locator("#sessionInspectorV2ControlsContent")).not.toContainText("Clear Status");
      await expect(page.locator(".session-inspector-v2__status-accordion-header")).toContainText("Status");
      await expect(page.locator(".session-inspector-v2__status-accordion-header #clearSessionInspectorV2StatusButton")).toHaveText("Clear Status");
      await expect(page.locator(".session-inspector-v2__json-accordion-header")).toContainText("JSON");
      await expect(page.locator(".session-inspector-v2__json-accordion-header")).not.toContainText("Details");
      await expect(page.locator(".session-inspector-v2__json-accordion-header #copySessionInspectorV2AllButton")).toHaveText("Copy All");
      await expect(page.locator(".session-inspector-v2__data-accordion-header")).toContainText("Data");
      await expect(page.locator(".session-inspector-v2__dirty-accordion-header")).toContainText("Dirty");
      await expect(page.locator(".session-inspector-v2__state-accordion-header")).toHaveCount(0);
      await expect(page.locator(".session-inspector-v2__schema-accordion-header")).toHaveCount(0);
      await expect(page.locator("#sessionInspectorV2StateOutput")).toHaveCount(0);
      await expect(page.locator("#sessionInspectorV2SchemaOutput")).toHaveCount(0);
      await expect(page.locator("body")).not.toContainText("State");
      await expect(page.locator("body")).not.toContainText("Schema");
      expect(await page.locator(".session-inspector-v2__panel--left > .accordion-v2 > .accordion-v2__header > span:first-child").evaluateAll((labels) => labels.map((label) => label.textContent.trim()))).toEqual([
        "Controls",
        "Filters"
      ]);
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id]")).toHaveCount(5);
      await expect(page.locator("#sessionInspectorV2Summary > span")).toHaveText([
        "(5) Entries shown.",
        "(5) SessionStorage.",
        "(0) LocalStorage."
      ]);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Session Inspector V2 ready\. Storage is read\/delete\./);
      const controlsLayout = await page.evaluate(() => {
        const rectFor = (selector) => {
          const element = document.querySelector(selector);
          const rect = element.getBoundingClientRect();
          return {
            bottom: Math.round(rect.bottom),
            clientWidth: element.clientWidth,
            height: Math.round(rect.height),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            scrollWidth: element.scrollWidth,
            top: Math.round(rect.top)
          };
        };
        const refresh = rectFor("#refreshSessionInspectorV2Button");
        const deleteAll = rectFor("#deleteAllSessionInspectorV2Button");
        const clearStatus = rectFor("#clearSessionInspectorV2StatusButton");
        const storageLabel = rectFor('label[for="storageScopeSelect"] span');
        const storageSelect = rectFor("#storageScopeSelect");
        const filterLabel = rectFor('label[for="sessionInspectorV2FilterInput"] span');
        const filterInput = rectFor("#sessionInspectorV2FilterInput");
        const jsonIcon = rectFor(".session-inspector-v2__json-accordion-header .accordion-v2__icon");
        const copyButton = rectFor("#copySessionInspectorV2AllButton");
        return {
          buttonsFit: [refresh, deleteAll, clearStatus].every((rect) => rect.scrollWidth <= rect.clientWidth + 1),
          clearStatusCompact: clearStatus.height <= 34,
          copyAfterCollapseIcon: copyButton.left >= jsonIcon.right,
          deleteAllRightOfRefresh: deleteAll.left > refresh.right,
          filterSameLine: filterInput.top <= filterLabel.bottom && filterInput.bottom >= filterLabel.top,
          refreshDeleteSameLine: refresh.top === deleteAll.top,
          storageSameLine: storageSelect.top <= storageLabel.bottom && storageSelect.bottom >= storageLabel.top
        };
      });
      expect(controlsLayout.buttonsFit).toBe(true);
      expect(controlsLayout.clearStatusCompact).toBe(true);
      expect(controlsLayout.refreshDeleteSameLine).toBe(true);
      expect(controlsLayout.deleteAllRightOfRefresh).toBe(true);
      expect(controlsLayout.storageSameLine).toBe(true);
      expect(controlsLayout.filterSameLine).toBe(true);
      expect(controlsLayout.copyAfterCollapseIcon).toBe(true);
      const tileText = (await page.locator(".session-inspector-v2__entry-card").allTextContents()).join("\n");
      expect(tileText).not.toContain("plain beta value");
      expect(tileText).not.toContain("delta value that is long enough");
      expect(tileText).not.toContain("epsilon value");
      expect(tileText).not.toContain("wraps");

      const themeState = await page.evaluate(async () => {
        const css = await fetch("/tools/session-inspector-v2/styles/sessionInspectorV2.css", { cache: "no-store" }).then((response) => response.text());
        const stylesheetPaths = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
          .map((link) => new URL(link.href).pathname);
        const bodyStyle = getComputedStyle(document.body);
        const shellStyle = getComputedStyle(document.querySelector(".session-inspector-v2.app-shell"));
        const layoutStyle = getComputedStyle(document.querySelector(".session-inspector-v2__layout"));
        const headerFrameStyle = getComputedStyle(document.querySelector(".session-inspector-v2__local-shell-frame"));
        const headerSummaryStyle = getComputedStyle(document.querySelector(".session-inspector-v2__local-shell-frame .tools-platform-frame__accordion-summary"));
        const panelStyle = getComputedStyle(document.querySelector(".session-inspector-v2__panel"));
        const inputStyle = getComputedStyle(document.querySelector("#sessionInspectorV2FilterInput"));
        const probeStyle = (property, value) => {
          const probe = document.createElement("div");
          probe.style[property] = value;
          document.body.append(probe);
          const computed = getComputedStyle(probe)[property];
          probe.remove();
          return computed;
        };
        return {
          bodyBackground: bodyStyle.backgroundImage,
          cssHasHardcodedColors: /#[0-9a-f]{3,8}|rgba?\(|linear-gradient/i.test(css),
          cssUsesThemeTokens: [
            "--session-inspector-v2-bg: var(--bg-gradient);",
            "--session-inspector-v2-panel: var(--panel);",
            "--session-inspector-v2-surface: var(--surface-inline);",
            "--session-inspector-v2-line: var(--line);",
            "--session-inspector-v2-text: var(--text);",
            "--session-inspector-v2-muted: var(--muted);",
            "--session-inspector-v2-accent: var(--accent);"
          ].every((snippet) => css.includes(snippet)),
          expectedBackground: probeStyle("backgroundImage", "var(--bg-gradient)"),
          expectedLine: probeStyle("borderColor", "var(--line)"),
          expectedPanel: probeStyle("backgroundColor", "var(--panel)"),
          expectedSurface: probeStyle("backgroundColor", "var(--surface-inline)"),
          headerBorder: headerFrameStyle.borderTopColor,
          headerRadius: headerFrameStyle.borderTopLeftRadius,
          headerSummaryBackground: headerSummaryStyle.backgroundColor,
          inputBackground: inputStyle.backgroundColor,
          layoutDisplay: layoutStyle.display,
          shellBorder: shellStyle.borderTopColor,
          shellDisplay: shellStyle.display,
          shellRadius: shellStyle.borderTopLeftRadius,
          stylesheetPaths,
          panelBackground: panelStyle.backgroundColor
        };
      });
      expect(themeState.stylesheetPaths).toEqual([
        "/src/engine/theme/main.css",
        "/src/engine/ui/hubCommon.css",
        "/src/engine/theme/accordionV2/accordionV2.css",
        "/tools/common/toolShellCommon.css",
        "/tools/session-inspector-v2/styles/sessionInspectorV2.css"
      ]);
      expect(themeState.cssHasHardcodedColors).toBe(false);
      expect(themeState.cssUsesThemeTokens).toBe(true);
      expect(themeState.bodyBackground).toBe(themeState.expectedBackground);
      expect(themeState.headerBorder).toBe(themeState.expectedLine);
      expect(themeState.headerRadius).toBe("18px");
      expect(themeState.headerSummaryBackground).toBe(themeState.expectedPanel);
      expect(themeState.shellBorder).toBe(themeState.expectedLine);
      expect(themeState.shellDisplay).toBe("flex");
      expect(themeState.shellRadius).toBe("20px");
      expect(themeState.layoutDisplay).toBe("grid");
      expect(themeState.panelBackground).toBe(themeState.expectedPanel);
      expect(themeState.inputBackground).toBe(themeState.expectedSurface);

      await expectSessionInspectorV2FullscreenShell(page);

      for (const contentId of [
        "sessionInspectorV2ControlsContent",
        "sessionInspectorV2FiltersContent",
        "sessionInspectorV2EntriesContent",
        "sessionInspectorV2JsonContent",
        "sessionInspectorV2DataContent",
        "sessionInspectorV2DirtyContent",
        "sessionInspectorV2StatusContent"
      ]) {
        await expectSessionInspectorV2AccordionToggles(page, contentId);
      }

      const tileState = await page.locator(".session-inspector-v2__entry-card").evaluateAll((cards) => {
        const rects = cards.map((card) => {
          const rect = card.getBoundingClientRect();
          const deleteButton = card.querySelector("[data-session-inspector-v2-delete-entry-id]");
          return {
            deleteInside: Boolean(deleteButton && card.contains(deleteButton)),
            height: Math.round(rect.height),
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            width: Math.round(rect.width)
          };
        });
        return {
          deleteButtonsInside: rects.every((rect) => rect.deleteInside),
          firstRowMovesLeftToRight: rects[1].top === rects[0].top && rects[1].left > rects[0].left,
          hasWrappedRows: new Set(rects.map((rect) => rect.top)).size > 1,
          metadataGap: Math.round(cards[0].querySelector(".session-inspector-v2__entry-value-size").getBoundingClientRect().top
            - cards[0].querySelector(".session-inspector-v2__entry-storage-type").getBoundingClientRect().bottom),
          sizes: rects.map(({ height, width }) => ({ height, width })),
          storageTypeText: cards[0].querySelector(".session-inspector-v2__entry-storage-type").textContent.trim(),
          valueSizeText: cards[0].querySelector(".session-inspector-v2__entry-value-size").textContent.trim()
        };
      });
      expect(tileState.sizes).toEqual([
        { height: 198, width: 234 },
        { height: 198, width: 234 },
        { height: 198, width: 234 },
        { height: 198, width: 234 },
        { height: 198, width: 234 }
      ]);
      expect(tileState.firstRowMovesLeftToRight).toBe(true);
      expect(tileState.hasWrappedRows).toBe(true);
      expect(tileState.deleteButtonsInside).toBe(true);
      expect(tileState.storageTypeText).toBe("sessionStorage");
      expect(tileState.valueSizeText).toBe("boolean | 4 bytes");
      expect(tileState.metadataGap).toBeGreaterThanOrEqual(8);
      const longKeyWrapState = await page.locator(".session-inspector-v2__entry-card", { hasText: "session-inspector-v2-super-long-storage-key-name-that-must-wrap-inside-the-fixed-session-tile" }).locator(".session-inspector-v2__entry-key").evaluate((keyNode) => {
        const keyRect = keyNode.getBoundingClientRect();
        const cardRect = keyNode.closest(".session-inspector-v2__entry-card").getBoundingClientRect();
        const lineHeight = Number.parseFloat(getComputedStyle(keyNode).lineHeight);
        return {
          height: keyRect.height,
          lineHeight,
          withinTile: keyRect.left >= cardRect.left && keyRect.right <= cardRect.right + 1
        };
      });
      expect(longKeyWrapState.height).toBeGreaterThan(longKeyWrapState.lineHeight * 1.5);
      expect(longKeyWrapState.withinTile).toBe(true);

      await page.locator('[data-session-inspector-v2-entry-id="sessionStorage:session-inspector-v2-alpha"]').click();
      await expect(page.locator("#sessionInspectorV2JsonOutput")).toHaveText("true");
      await expect(page.locator("#sessionInspectorV2DataOutput")).toContainText("No data section is present for sessionStorage:session-inspector-v2-alpha.");
      await expect(page.locator("#sessionInspectorV2DirtyOutput")).toContainText("No dirty section is present for sessionStorage:session-inspector-v2-alpha.");
      await page.locator("#copySessionInspectorV2AllButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Copied JSON, Data, and Dirty sections with empty-state text for missing Data and Dirty\./);
      const copiedValidationText = await page.evaluate(() => window.__sessionInspectorV2ClipboardText);
      expect(copiedValidationText).toContain("=== JSON ===\ntrue");
      expect(copiedValidationText).toContain("=== Data ===\nNo data section is present for sessionStorage:session-inspector-v2-alpha.");
      expect(copiedValidationText).toContain("=== Dirty ===\nNo dirty section is present for sessionStorage:session-inspector-v2-alpha.");
      await page.locator('[data-session-inspector-v2-delete-entry-id="sessionStorage:session-inspector-v2-alpha"]').click();
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id]")).toHaveCount(4);
      await expect(page.locator("#sessionInspectorV2JsonOutput")).toHaveText('"plain beta value"');
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted sessionStorage:session-inspector-v2-alpha\./);
      expect(await page.evaluate(() => window.sessionStorage.getItem("session-inspector-v2-alpha"))).toBeNull();

      await page.evaluate(() => {
        window.__sessionInspectorV2OriginalRemoveItem = Storage.prototype.removeItem;
        Storage.prototype.removeItem = function removeItemWithTestFailure(key) {
          if (key === "session-inspector-v2-beta") {
            throw new Error("blocked delete");
          }
          return window.__sessionInspectorV2OriginalRemoveItem.call(this, key);
        };
      });
      await page.locator('[data-session-inspector-v2-delete-entry-id="sessionStorage:session-inspector-v2-beta"]').click();
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id]")).toHaveCount(4);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Delete failed for sessionStorage:session-inspector-v2-beta: blocked delete/);

      await page.evaluate(() => {
        Storage.prototype.removeItem = window.__sessionInspectorV2OriginalRemoveItem;
      });
      await page.locator("#deleteAllSessionInspectorV2Button").click();
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id]")).toHaveCount(0);
      await expect(page.locator("#sessionInspectorV2EntryList")).toContainText("No matching storage entries.");
      await expect(page.locator("#sessionInspectorV2JsonOutput")).toHaveText("{}");
      await expect(page.locator("#sessionInspectorV2DataOutput")).toHaveText("Select a normalized tool entry with a top-level data section.");
      await expect(page.locator("#sessionInspectorV2DirtyOutput")).toHaveText("Select a normalized tool entry with a top-level dirty section.");
      await expect(page.locator("#sessionInspectorV2Summary > span")).toHaveText([
        "(0) Entries shown.",
        "(0) SessionStorage.",
        "(0) LocalStorage."
      ]);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted 4 shown storage entries\./);
      await page.locator("#copySessionInspectorV2AllButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Copy All failed: select a storage entry before copying JSON, Data, and Dirty\./);
      await page.locator("#deleteAllSessionInspectorV2Button").click();
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Delete All skipped: no matching storage entries are shown\./);
      expect(await page.evaluate(() => window.localStorage.getItem("session-inspector-v2-local"))).toBe("local value");
      expect(pageErrors).toEqual([]);
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=session-inspector-v2-test-context&workspace=uat/);
      await page.goto(`${server.baseUrl}/tools/session-inspector-v2/index.html`, { waitUntil: "networkidle" });
      await expect(page.locator(".session-inspector-v2__workspace-menu")).toBeHidden();
      await expect(page.locator("#returnToWorkspaceButton")).toBeHidden();
      await expect(page.locator("#returnToWorkspaceButton")).toHaveCount(1);
      await expect(page.locator(".session-inspector-v2__local-shell-frame #returnToWorkspaceButton")).toHaveCount(0);
      await expect(page.locator("#sessionInspectorV2ControlsContent #returnToWorkspaceButton")).toHaveCount(0);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("shows normalized workspace tool sessions as JSON, Data, and Dirty views", async ({ page }) => {
    const pageErrors = [];
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, "clipboard", {
        configurable: true,
        value: {
          async writeText(value) {
            window.__sessionInspectorV2ClipboardText = value;
          }
        }
      });
      window.sessionStorage.setItem("workspace.tools.preview-generator-v2", JSON.stringify({
        schema: {
          source: "workspace-manager-v2",
          toolId: "preview-generator-v2",
          schemaRole: "workspace-launch-context",
          schemaRef: "tools/schemas/workspace.manifest.schema.json"
        },
        workspace: {
          source: "workspace-manager-v2",
          toolId: "preview-generator-v2",
          toolName: "Preview Generator V2",
          gameId: "Asteroids",
          gameRoot: "games/Asteroids/",
          assetsPath: "games/Asteroids/assets",
          repoReferenceKey: "workspace.repo.reference"
        },
        data: null,
        dirty: {
          isDirty: false,
          reason: null,
          changedAt: null,
          changedKeys: []
        }
      }));
      window.sessionStorage.setItem("workspace.tools.asset-manager-v2", JSON.stringify({
        schema: {
          source: "workspace-manager-v2",
          toolId: "asset-manager-v2",
          schemaRole: "workspace-tool-payload",
          schemaRef: "tools/schemas/tools/asset-manager-v2.schema.json"
        },
        workspace: {
          source: "workspace-manager-v2",
          toolId: "asset-manager-v2",
          toolName: "Asset Manager V2",
          gameId: "Asteroids",
          gameRoot: "games/Asteroids/",
          assetsPath: "games/Asteroids/assets",
          repoReferenceKey: "workspace.repo.reference"
        },
        data: { assets: { "assets.image.preview.preview": { path: "assets/images/preview.png" } } },
        dirty: {
          isDirty: false,
          reason: null,
          changedAt: null,
          changedKeys: []
        }
      }));
      window.sessionStorage.setItem("workspace.tools.no-data-test", JSON.stringify({
        schema: {
          source: "workspace-manager-v2",
          toolId: "no-data-test",
          schemaRole: "workspace-launch-context",
          schemaRef: "tools/schemas/workspace.manifest.schema.json"
        },
        workspace: {
          source: "workspace-manager-v2",
          toolId: "no-data-test"
        },
        dirty: {
          isDirty: false,
          reason: null,
          changedAt: null,
          changedKeys: []
        }
      }));
      window.sessionStorage.setItem("workspace.tools.no-dirty-test", JSON.stringify({
        schema: {
          source: "workspace-manager-v2",
          toolId: "no-dirty-test",
          schemaRole: "workspace-launch-context",
          schemaRef: "tools/schemas/workspace.manifest.schema.json"
        },
        workspace: {
          source: "workspace-manager-v2",
          toolId: "no-dirty-test"
        },
        data: {
          note: "data without dirty"
        }
      }));
    });
    const server = await openSessionInspectorV2(page);

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id]")).toHaveCount(4);
      await expect(page.locator(".session-inspector-v2__json-accordion-header")).toContainText("JSON");
      await expect(page.locator(".session-inspector-v2__data-accordion-header")).toContainText("Data");
      await expect(page.locator(".session-inspector-v2__dirty-accordion-header")).toContainText("Dirty");
      await expect(page.locator(".session-inspector-v2__state-accordion-header")).toHaveCount(0);
      await expect(page.locator(".session-inspector-v2__schema-accordion-header")).toHaveCount(0);
      await expect(page.locator("#sessionInspectorV2StateOutput")).toHaveCount(0);
      await expect(page.locator("#sessionInspectorV2SchemaOutput")).toHaveCount(0);
      await expect(page.locator("body")).not.toContainText("State");
      await expect(page.locator("body")).not.toContainText("Schema");
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id='sessionStorage:workspace.tools.preview-generator-v2']")).toHaveCount(1);
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id='sessionStorage:workspace.tools.preview-generator-v2.schema']")).toHaveCount(0);
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id='sessionStorage:workspace.tools.preview-generator-v2.state']")).toHaveCount(0);

      await page.locator('[data-session-inspector-v2-entry-id="sessionStorage:workspace.tools.asset-manager-v2"]').click();
      await expect(page.locator("#sessionInspectorV2JsonOutput")).toContainText('"schema"');
      await expect(page.locator("#sessionInspectorV2JsonOutput")).toContainText('"workspace"');
      await expect(page.locator("#sessionInspectorV2JsonOutput")).toContainText('"data"');
      await expect(page.locator("#sessionInspectorV2JsonOutput")).toContainText('"dirty"');
      await expect(page.locator("#sessionInspectorV2JsonOutput")).toContainText('"repoReferenceKey": "workspace.repo.reference"');
      await expect(page.locator("#sessionInspectorV2JsonOutput")).not.toContainText('"state"');
      await expect(page.locator("#sessionInspectorV2DataOutput")).toContainText('"assets.image.preview.preview"');
      await expect(page.locator("#sessionInspectorV2DataOutput")).not.toContainText('"schema"');
      await expect(page.locator("#sessionInspectorV2DataOutput")).not.toContainText('"workspace"');
      await expect(page.locator("#sessionInspectorV2DataOutput")).not.toContainText('"dirty"');
      await expect(page.locator("#sessionInspectorV2DirtyOutput")).toContainText('"isDirty": false');
      await expect(page.locator("#sessionInspectorV2DirtyOutput")).toContainText('"reason": null');
      await expect(page.locator("#sessionInspectorV2DirtyOutput")).toContainText('"changedAt": null');
      await expect(page.locator("#sessionInspectorV2DirtyOutput")).toContainText('"changedKeys": []');
      await expect(page.locator("#sessionInspectorV2DirtyOutput")).not.toContainText('"data"');
      await expect(page.locator("#sessionInspectorV2DirtyOutput")).not.toContainText('"workspace"');
      await expect(page.locator("#sessionInspectorV2DirtyOutput")).not.toContainText('"schema"');
      await page.locator("#copySessionInspectorV2AllButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Copied JSON, Data, and Dirty sections to clipboard\./);
      const copiedToolPayload = await page.evaluate(() => window.__sessionInspectorV2ClipboardText);
      expect(copiedToolPayload).toContain("=== JSON ===");
      expect(copiedToolPayload).toContain("=== Data ===");
      expect(copiedToolPayload).toContain("=== Dirty ===");
      expect(copiedToolPayload).toContain('"workspace"');
      expect(copiedToolPayload).toContain('"data"');
      expect(copiedToolPayload).toContain('"dirty"');
      expect(copiedToolPayload).toContain('"assets.image.preview.preview"');
      expect(copiedToolPayload).toContain('"isDirty": false');

      await page.locator('[data-session-inspector-v2-entry-id="sessionStorage:workspace.tools.no-data-test"]').click();
      await expect(page.locator("#sessionInspectorV2DataOutput")).toContainText("No data section is present for sessionStorage:workspace.tools.no-data-test.");
      await page.locator('[data-session-inspector-v2-entry-id="sessionStorage:workspace.tools.no-dirty-test"]').click();
      await expect(page.locator("#sessionInspectorV2DirtyOutput")).toContainText("No dirty section is present for sessionStorage:workspace.tools.no-dirty-test.");

      await page.locator('[data-session-inspector-v2-delete-entry-id="sessionStorage:workspace.tools.preview-generator-v2"]').click();
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id]")).toHaveCount(3);
      expect(await page.evaluate(() => window.sessionStorage.getItem("workspace.tools.preview-generator-v2"))).toBeNull();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted sessionStorage:workspace\.tools\.preview-generator-v2\./);

      await page.locator("#deleteAllSessionInspectorV2Button").click();
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id]")).toHaveCount(0);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted 3 shown storage entries\./);
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("starts with no active game even when stale session hydration exists", async ({ page }) => {
    const staleGameManifest = JSON.parse(await readFile("games/Asteroids/game.manifest.json", "utf8"));
    const pageErrors = [];
    await page.addInitScript((manifest) => {
      window.sessionStorage.setItem("workspace-manager-v2-stale-context", JSON.stringify(manifest));
      window.sessionStorage.setItem("workspace-manager-v2-active-host-context-id", "workspace-manager-v2-stale-context");
      window.sessionStorage.setItem("workspace.repo.reference", JSON.stringify({ displayName: "StaleRepo" }));
      window.sessionStorage.setItem("workspace.tools.asset-manager-v2", JSON.stringify({
        schema: { toolId: "asset-manager-v2" },
        workspace: { toolId: "asset-manager-v2" },
        data: null,
        dirty: {
          isDirty: false,
          reason: null,
          changedAt: null,
          changedKeys: []
        }
      }));
    }, staleGameManifest.game.workspace);
    const server = await openWorkspaceManagerV2(page);

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#repoSelectedValue")).toHaveText("not selected");
      await expect(page.locator("#activeGameSelect")).toBeDisabled();
      await expect(page.locator("#activeGameSelect option")).toHaveCount(0);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue("{}");
      await expectWorkspaceToolsDisabled(page);
      await expect(page.locator("#statusLog")).not.toHaveValue(/Restored Asteroids workspace/);
      expect(await readWorkspaceSessionHydration(page)).toMatchObject({
        repoReference: null,
        toolKeys: []
      });
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("discovers Active Game options from selected repo manifests", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#activeGameSelect")).toBeDisabled();
      await expect(page.locator("#activeGameSelect option")).toHaveCount(0);
      await expect(page.locator("#activeGameSummary")).toHaveText("Pick a repo folder to discover schema-valid game manifests.");
      await expectWorkspaceToolsDisabled(page);
      expect(await readWorkspaceSessionHydration(page)).toMatchObject({
        repoReference: null,
        toolKeys: []
      });

      await selectMockRepo(page);
      expect(await readWorkspaceSessionHydration(page)).toMatchObject({
        repoReference: {
          source: "workspace-manager-v2",
          kind: "file-system-directory-handle-reference",
          storageKey: "workspace.repo.reference",
          handleKind: "directory",
          handleName: "HTML-JavaScript-Gaming",
          displayName: "HTML-JavaScript-Gaming"
        },
        toolKeys: []
      });
      await expect(page.locator("#activeGameSummary")).toHaveText("Discovered 3 schema-valid game manifests from HTML-JavaScript-Gaming.");
      await expect(page.locator("#statusLog")).toHaveValue(/INFO SKIP games\/InvalidWorkspace\/game\.manifest\.json: Game manifest failed schema validation: root\.game is required/);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO SKIP games\/MissingManifest\/game\.manifest\.json: game\.manifest\.json not found/);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Discovered 3 schema-valid game manifests\./);
      const asteroidsGameManifestShape = await page.evaluate(async () => {
        const manifest = await fetch("/games/Asteroids/game.manifest.json", { cache: "no-store" }).then((response) => response.json());
        const { WorkspaceManagerV2ContextService } = await import("/tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js");
        const service = new WorkspaceManagerV2ContextService();
        const invalidRuntimeWorkspaceManifest = structuredClone(manifest);
        invalidRuntimeWorkspaceManifest.game.gameData.workspace = {};
        return {
          gameManifestValidation: await service.validateGameManifest(manifest),
          hasGameData: Boolean(manifest.game?.gameData),
          hasRootTools: Boolean(manifest.tools),
          hasWorkspace: Boolean(manifest.game?.workspace),
          runtimeWorkspaceValidation: await service.validateGameManifest(invalidRuntimeWorkspaceManifest),
          rootDocumentKind: manifest.documentKind || "",
          schema: manifest.schema,
          workspaceDocumentKind: manifest.game?.workspace?.documentKind,
          workspaceValidation: await service.validateGeneratedManifest(manifest.game.workspace)
        };
      });
      expect(asteroidsGameManifestShape).toMatchObject({
        gameManifestValidation: { ok: true },
        hasGameData: true,
        hasRootTools: false,
        hasWorkspace: true,
        rootDocumentKind: "",
        schema: "html-js-gaming.game-manifest",
        workspaceDocumentKind: "workspace-manifest",
        workspaceValidation: { ok: true }
      });
      expect(asteroidsGameManifestShape.runtimeWorkspaceValidation.ok).toBe(false);
      expect(asteroidsGameManifestShape.runtimeWorkspaceValidation.message).toContain("runtime data must not depend on editor/tool workspace state");

      await page.evaluate(() => {
        window.__workspaceManagerV2MockRepoConfig = {
          missingGames: true,
          repoName: "BrokenRepo"
        };
      });
      await page.locator("#pickRepoBtn").click();
      await expect(page.locator("#repoSelectedValue")).toHaveText("not selected");
      await expect(page.locator("#activeGameSelect")).toBeDisabled();
      await expect(page.locator("#activeGameSelect option")).toHaveCount(0);
      await expectWorkspaceToolsDisabled(page);
      await expect(page.locator("#activeGameSummary")).toHaveText(/Selected repo is missing games\//);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Repo load failed: Selected repo is missing games\//);
      expect(await readWorkspaceSessionHydration(page)).toMatchObject({
        repoReference: null,
        toolKeys: []
      });

      await page.evaluate(() => {
        window.__workspaceManagerV2MockRepoConfig = {
          manifestPaths: [],
          repoName: "NoValidGamesRepo"
        };
      });
      await page.locator("#pickRepoBtn").click();
      await expect(page.locator("#repoSelectedValue")).toHaveText("NoValidGamesRepo");
      await expect(page.locator("#activeGameSelect")).toBeDisabled();
      await expect(page.locator("#activeGameSelect option")).toHaveCount(0);
      await expectWorkspaceToolsDisabled(page);
      await expect(page.locator("#activeGameSummary")).toHaveText("No schema-valid game manifests were found in NoValidGamesRepo.");
      await expect(page.locator("#statusLog")).toHaveValue(/INFO SKIP games\/InvalidWorkspace\/game\.manifest\.json: Game manifest failed schema validation: root\.game is required/);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Repo load failed: No schema-valid game\.manifest\.json files were found in NoValidGamesRepo\./);
      expect(await readWorkspaceSessionHydration(page)).toMatchObject({
        repoReference: {
          source: "workspace-manager-v2",
          kind: "file-system-directory-handle-reference",
          storageKey: "workspace.repo.reference",
          handleKind: "directory",
          handleName: "NoValidGamesRepo",
          displayName: "NoValidGamesRepo"
        },
        toolKeys: []
      });

      await selectMockRepo(page, { repoName: "SecondRepo" });
      await expect(page.locator("#activeGameSummary")).toHaveText("Discovered 3 schema-valid game manifests from SecondRepo.");
      await expect(page.locator("#workspaceContextOutput")).toHaveValue("{}");
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("exports manifests and launches tools from fixed Workspace Manager V2 tiles", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("body[data-tool-id='workspace-manager-v2']")).toBeVisible();
      await expect(page.locator("#importManifestButton")).toHaveText("Import Manifest");
      await expect(page.locator("#exportManifestButton")).toBeDisabled();
      await expect(page.locator("#seedUatManifestButton")).toBeHidden();
      await expect(page.locator("#loadAsteroidsButton")).toHaveCount(0);
      await expect(page.locator("#launchAssetManagerV2Button")).toHaveCount(0);
      await expect(page.locator("#workspaceToolsContent #workspaceToolTiles")).toBeVisible();
      await expect(page.locator("#workspaceContextContent")).toHaveCount(0);
      await expect(page.locator("#workspaceJsonContent #workspaceContextOutput")).toBeVisible();
      await expect(page.locator("#copyWorkspaceJsonButton")).toHaveText("copy");
      await expect(page.locator("#repoDestinationContent")).toBeVisible();
      await expect(page.locator(".workspace-manager-v2__panel--left > .accordion-v2").first().locator(".accordion-v2__header > span:first-child")).toHaveText("Repo Destination");
      await expect(page.locator("#pickRepoBtn")).toHaveText("Pick Repo Folder");
      await expect(page.locator("#repoSelectedValue")).toHaveText("not selected");
      await expect(page.locator("#activeGameSelect")).toBeDisabled();
      await expect(page.locator("#activeGameSelect option")).toHaveCount(0);
      const centerControlLabels = await page.locator(".workspace-manager-v2__panel--center > .accordion-v2 > .accordion-v2__header > span:first-child")
        .evaluateAll((labels) => labels.map((label) => label.textContent.trim()));
      expect(centerControlLabels).toEqual(["Tools", "Workspace JSON"]);
      await expect(page.locator(".workspace-manager-v2__status-accordion-header")).toContainText("Status");
      const statusHeaderOrder = await page.locator(".workspace-manager-v2__status-accordion-header").evaluate((header) => Array.from(header.querySelectorAll(":scope > span, :scope > div > span, :scope > div > button"), (element) => element.textContent.trim()));
      expect(statusHeaderOrder).toEqual(["Status", "+", "Clear"]);
      const statusHeader = page.locator('.workspace-manager-v2__status-accordion-header[aria-controls="statusLogContent"]');
      const statusContent = page.locator("#statusLogContent");
      await expect(statusHeader).toHaveAttribute("aria-expanded", "true");
      await expect(statusContent).toBeVisible();
      await page.locator("#clearStatusButton").click();
      await expect(page.locator("#statusLog")).toHaveValue("");
      await expect(statusHeader).toHaveAttribute("aria-expanded", "true");
      await expect(statusContent).toBeVisible();
      await expect(page.locator(".workspace-manager-v2__tool-group-title")).toHaveText(["Editors", "Utilities", "Viewers"]);
      await expect(page.locator("#workspaceToolTiles [data-workspace-tool-id]")).toHaveCount(5);
      await expect(page.locator('[data-workspace-tool-id="workspace-manager-v2"]')).toHaveCount(0);
      await expect(page.locator('[data-workspace-tool-id="session-inspector"]')).toHaveCount(0);
      const toolGroupMembership = await page.locator(".workspace-manager-v2__tool-group").evaluateAll((groups) => Object.fromEntries(groups.map((group) => [
        group.querySelector(".workspace-manager-v2__tool-group-title")?.textContent?.trim(),
        Array.from(group.querySelectorAll(".workspace-manager-v2__tool-tile-name"), (name) => name.textContent.trim())
      ])));
      expect(toolGroupMembership).toEqual({
        Editors: ["Asset Manager V2", "Palette Manager V2"],
        Utilities: ["Preview Generator V2"],
        Viewers: ["Tool Starter V2", "Session Inspector V2"]
      });
      expect(await page.locator("#workspaceToolTiles [data-workspace-tool-id]").evaluateAll((tiles) => tiles.every((tile) => tile.disabled))).toBe(true);
      expect(await page.locator("#workspaceToolTiles [data-workspace-tool-id]").evaluateAll((tiles) => (
        tiles.every((tile) => Array.from(tile.querySelectorAll(".workspace-manager-v2__tool-tile-action"), (action) => action.textContent.trim()).join("|") === "How To Use|Read Me")
      ))).toBe(true);
      await selectMockRepo(page);
      expect(await readWorkspaceSessionHydration(page)).toMatchObject({
        repoReference: {
          displayName: "HTML-JavaScript-Gaming",
          handleName: "HTML-JavaScript-Gaming",
          kind: "file-system-directory-handle-reference"
        },
        toolKeys: []
      });
      const compactCenterLayout = await page.evaluate(() => {
        const getRect = (selector) => {
          const element = document.querySelector(selector);
          return element ? element.getBoundingClientRect() : null;
        };
        const toolsRect = getRect(".workspace-manager-v2__accordion--tools");
        const toolGroupsRect = getRect("#workspaceToolTiles");
        const jsonRect = getRect(".workspace-manager-v2__accordion--json");
        return {
          jsonTop: Math.round(jsonRect.top),
          toolsBottom: Math.round(toolsRect.bottom),
          toolsExtraHeight: Math.round(toolsRect.height - toolGroupsRect.height),
          toolsHeight: Math.round(toolsRect.height)
        };
      });
      expect(compactCenterLayout.toolsExtraHeight).toBeLessThanOrEqual(90);
      expect(compactCenterLayout.jsonTop).toBeGreaterThan(compactCenterLayout.toolsBottom);

      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expect(page.locator("#activeGameSummary")).toContainText("games/Asteroids/");
      await expect(page.locator("#activePaletteSummary")).toHaveCount(0);
      await expect(page.locator("#activeAssetRegistrySummary")).toHaveCount(0);
      await expect(page.locator("#launchContextSummary")).toHaveCount(0);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"gameRoot": "games\/Asteroids\/"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"assetsPath": "games\/Asteroids\/assets"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"repoRoot": "HTML-JavaScript-Gaming"/);
      expect(JSON.parse(await page.locator("#workspaceContextOutput").inputValue()).repoPath).toBe(manifestRepoPath(server));
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"previewImagePath"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"assets.image.bezel.bezel"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"assets.image.preview.preview"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"role": "bezel"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"role": "preview"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"source": "manifest"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"asset-manager-v2"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"palette-manager-v2"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"vector-map-editor"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"vector.asteroids.ship"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"palette-browser"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"asset-browser"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"activePalette"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"toolId"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"workspaceManifest"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"workspaceMetadata"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/samples\//);
      const selectedGameHydration = await readWorkspaceSessionHydration(page);
      expect(selectedGameHydration.toolKeys).toEqual([
        "workspace.tools.asset-manager-v2",
        "workspace.tools.palette-manager-v2",
        "workspace.tools.preview-generator-v2",
        "workspace.tools.session-inspector-v2"
      ]);
      expect(selectedGameHydration.toolKeys).not.toContain("workspace.tools.templates-v2");
      expect(selectedGameHydration.toolKeys.some((key) => key.endsWith(".schema") || key.endsWith(".state"))).toBe(false);
      expect(Object.keys(selectedGameHydration.toolSessions).sort()).toEqual([
        "asset-manager-v2",
        "palette-manager-v2",
        "preview-generator-v2",
        "session-inspector-v2"
      ]);
      const selectedGameHydrationReport = await page.evaluate(() => window.__workspaceManagerV2App.activeSessionHydration.report);
      expect(selectedGameHydrationReport.hydratedTools.map((tool) => tool.toolId)).toEqual([
        "asset-manager-v2",
        "palette-manager-v2",
        "preview-generator-v2",
        "session-inspector-v2"
      ]);
      expect(selectedGameHydrationReport.skippedTools).toEqual([
        {
          reason: "starter/dev-only tool is not enabled by the selected game workspace config",
          toolId: "templates-v2",
          toolName: "Tool Starter V2"
        }
      ]);
      expect(Object.values(selectedGameHydration.toolSessions).every((session) => (
        JSON.stringify(Object.keys(session).sort()) === JSON.stringify(["data", "dirty", "schema", "workspace"])
      ))).toBe(true);
      expect(selectedGameHydration.schemaByTool["asset-manager-v2"]).toMatchObject({
        source: "workspace-manager-v2",
        toolId: "asset-manager-v2",
        schemaRole: "workspace-tool-payload",
        schemaRef: "tools/schemas/tools/asset-manager-v2.schema.json",
        workspaceSchemaRef: "tools/schemas/workspace.manifest.schema.json"
      });
      expect(selectedGameHydration.schemaByTool["preview-generator-v2"]).toMatchObject({
        source: "workspace-manager-v2",
        toolId: "preview-generator-v2",
        schemaRole: "workspace-launch-context",
        schemaRef: "tools/schemas/workspace.manifest.schema.json"
      });
      expect(selectedGameHydration.workspaceByTool["asset-manager-v2"]).toMatchObject({
        source: "workspace-manager-v2",
        toolId: "asset-manager-v2",
        workspaceManifestId: "workspace-manager-v2-Asteroids",
        gameId: "Asteroids",
        gameRoot: "games/Asteroids/",
        assetsPath: "games/Asteroids/assets",
        repoReferenceKey: "workspace.repo.reference"
      });
      expect(selectedGameHydration.toolSessions["asset-manager-v2"].state).toBeUndefined();
      expect(Object.keys(selectedGameHydration.dataByTool["asset-manager-v2"].assets)).toHaveLength(14);
      expect(selectedGameHydration.toolSessions["templates-v2"]).toBeUndefined();
      expect(Object.values(selectedGameHydration.dirtyByTool)).toEqual([
        { isDirty: false, reason: null, changedAt: null, changedKeys: [] },
        { isDirty: false, reason: null, changedAt: null, changedKeys: [] },
        { isDirty: false, reason: null, changedAt: null, changedKeys: [] },
        { isDirty: false, reason: null, changedAt: null, changedKeys: [] }
      ]);
      await page.evaluate(() => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: async (text) => {
              window.__workspaceJsonClipboard = text;
            }
          }
        });
      });
      const workspaceJsonValue = await page.locator("#workspaceContextOutput").inputValue();
      await page.locator("#copyWorkspaceJsonButton").click();
      await expect(page.locator("#workspaceJsonContent")).toBeVisible();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Copied Workspace JSON to clipboard \(\d+ characters\)\./);
      expect(await page.evaluate(() => window.__workspaceJsonClipboard)).toBe(workspaceJsonValue);
      await page.evaluate(() => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: undefined
        });
        document.execCommand = () => false;
      });
      await page.locator("#copyWorkspaceJsonButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Workspace JSON copy failed: Clipboard API is unavailable\./);
      await expect(page.locator("#exportManifestButton")).toBeEnabled();
      const templateTile = page.locator('[data-workspace-tool-id="templates-v2"]');
      const assetTile = page.locator('[data-workspace-tool-id="asset-manager-v2"]');
      const paletteTile = page.locator('[data-workspace-tool-id="palette-manager-v2"]');
      const previewTile = page.locator('[data-workspace-tool-id="preview-generator-v2"]');
      const sessionInspectorTile = page.locator('[data-workspace-tool-id="session-inspector-v2"]');
      await expect(templateTile).toBeDisabled();
      await expect(templateTile).toContainText("Tool Starter V2");
      await expect(templateTile).toContainText("Not enabled for game");
      await expect(templateTile).toContainText("Canonical V2 template");
      await expect(assetTile).toBeEnabled();
      await expect(assetTile).toContainText("Asset Manager V2");
      await expect(assetTile).toContainText("Ready to launch");
      await expect(assetTile).toContainText("14 managed assets");
      await expect(paletteTile).toContainText("11 palette swatches");
      await expect(previewTile).toContainText("Schema-valid manifest");
      await expect(sessionInspectorTile).toBeEnabled();
      await expect(sessionInspectorTile).toContainText("Session Inspector V2");
      await expect(sessionInspectorTile).not.toContainText("Session storage inspector");
      const tileLayout = await page.locator("#workspaceToolTiles [data-workspace-tool-id]").evaluateAll((tiles) => tiles.map((tile) => ({
        height: Math.round(tile.getBoundingClientRect().height),
        width: Math.round(tile.getBoundingClientRect().width)
      })));
      expect(tileLayout).toEqual([
        { height: 142, width: 180 },
        { height: 142, width: 180 },
        { height: 142, width: 180 },
        { height: 142, width: 180 },
        { height: 142, width: 180 }
      ]);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Boundary contract: game\.gameData is runtime data; game\.workspace is editor\/tool state\. Runtime ignores game\.workspace; tools may read game\.gameData, write game\.workspace, and update game\.gameData only through explicit validated apply\/build\/export actions\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Hydrated workspace session for asset-manager-v2, palette-manager-v2, preview-generator-v2, session-inspector-v2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Skipped workspace session hydration for templates-v2: starter\/dev-only tool is not enabled by the selected game workspace config\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded Asteroids from \/games\/Asteroids\/game\.manifest\.json with 11 active palette colors and 14 managed assets\./);

      await page.locator('[data-workspace-tool-id="session-inspector-v2"]').click();
      await expect(page).toHaveURL(/session-inspector-v2\/index\.html.*launch=workspace/);
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id='sessionStorage:workspace.tools.asset-manager-v2']")).toHaveCount(1);
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id='sessionStorage:workspace.tools.palette-manager-v2']")).toHaveCount(1);
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id='sessionStorage:workspace.tools.preview-generator-v2']")).toHaveCount(1);
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id='sessionStorage:workspace.tools.session-inspector-v2']")).toHaveCount(1);
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id='sessionStorage:workspace.tools.templates-v2']")).toHaveCount(0);
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);

      const downloadPromise = page.waitForEvent("download");
      await page.locator("#exportManifestButton").click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe("workspace-manager-v2-Asteroids.workspace.manifest.json");
      const savedManifest = JSON.parse(await readFile(await download.path(), "utf8"));
      const asteroidsManifest = await page.evaluate(async () => await fetch("/games/Asteroids/game.manifest.json", { cache: "no-store" }).then((response) => response.json()));
      expect(asteroidsManifest.documentKind).toBeUndefined();
      expect(asteroidsManifest.tools).toBeUndefined();
      expect(asteroidsManifest.game.gameData.launch.directPath).toBe("/games/Asteroids/index.html");
      expect(asteroidsManifest.game.workspace).toEqual(savedManifest);
      expect(savedManifest.documentKind).toBe("workspace-manifest");
      expect(Object.keys(savedManifest.tools).sort()).toEqual(["asset-manager-v2", "palette-manager-v2", "vector-map-editor"]);
      expect(savedManifest.repoRoot).toBe("HTML-JavaScript-Gaming");
      expect(savedManifest.repoPath).toBe(manifestRepoPath(server));
      expect(savedManifest.tools["palette-manager-v2"].swatches.length).toBeGreaterThan(0);
      expect(Object.keys(savedManifest.tools["asset-manager-v2"].assets)).toHaveLength(14);
      expect(savedManifest.tools["asset-manager-v2"].previewImagePath).toBeUndefined();
      expect(savedManifest.tools["asset-manager-v2"].assets["assets.image.background.deluxe"]).toEqual({
        path: "assets/images/deluxe.png",
        type: "image",
        kind: "png",
        role: "background",
        source: "manifest",
        stretchOverride: {
          uniformEdgeStretchPx: 0
        }
      });
      expect(savedManifest.tools["asset-manager-v2"].assets["assets.image.bezel.bezel"]).toEqual({
        path: "assets/images/bezel.png",
        type: "image",
        kind: "png",
        role: "bezel",
        source: "manifest",
        stretchOverride: {
          uniformEdgeStretchPx: 10
        }
      });
      expect(savedManifest.tools["asset-manager-v2"].assets["assets.image.preview.preview"]).toEqual({
        path: "assets/images/preview.png",
        type: "image",
        kind: "png",
        role: "preview",
        source: "manifest"
      });
      expect(savedManifest.tools["asset-manager-v2"].source).toBe("manifest");
      expect(savedManifest.tools["asset-manager-v2"].schema).toBe("html-js-gaming.asset-manager-v2");
      expect(savedManifest.tools["vector-map-editor"].vectorMapDocument.vectors.map((vector) => vector.id)).toContain("vector.asteroids.ship");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Exported schema-valid Workspace Manager V2 manifest workspace-manager-v2-Asteroids\./);

      await assetTile.click();
      await expect(page).toHaveURL(/asset-manager-v2\/index\.html.*launch=workspace/);
      await expect(page).toHaveURL(/fromTool=workspace-manager-v2/);
      await expect(page).toHaveURL(/hostContextId=workspace-manager-v2-/);
      await expect(page).not.toHaveURL(/workspace=prod/i);
      await expect(page).not.toHaveURL(/workspace=UAT/i);
      await expect(page).not.toHaveURL(/gameId=Asteroids/);
      await expect(page.locator("#assetLaunchGuard")).toBeHidden();
      await expect(page.locator(".asset-manager-v2__tool__menu")).toBeHidden();
      await expect(page.locator(".asset-manager-v2__workspace__menu")).toBeVisible();
      await expect(page.locator(".asset-manager-v2__workspace__menu button")).toHaveText(["Return to Workspace"]);
      await expect(page.locator("#statusLog")).toHaveValue(/Workspace Manager V2 loaded 14 validated assets from tools\.asset-manager-v2\.assets/);
      await expect(page.locator("#statusLog")).toHaveValue(/Workspace Manager V2 loaded \d+ palette colors from active palette context/);
      const assetStatusHeaderOrder = await page.locator(".asset-manager-v2__status-accordion-header").evaluate((header) => Array.from(header.querySelectorAll(":scope > span, :scope > div > span, :scope > div > button"), (element) => element.textContent.trim()));
      expect(assetStatusHeaderOrder).toEqual(["Status", "+", "Clear"]);

      const workspacePreviewContext = await page.evaluate(async () => {
        const { WorkspaceBridge } = await import("/tools/asset-manager-v2/js/services/WorkspaceBridge.js");
        return new WorkspaceBridge({ windowRef: window }).readWorkspacePreviewContext();
      });
      expect(workspacePreviewContext).toEqual({
        workspaceMode: true,
        workspaceAssetsPath: "games/Asteroids/assets",
        workspaceGameId: "Asteroids",
        workspaceGameRoot: "games/Asteroids/"
      });
      expect(JSON.stringify(workspacePreviewContext)).not.toMatch(/samples|tools/i);

      const storedContext = await page.evaluate(() => {
        const url = new URL(window.location.href);
        const hostContextId = url.searchParams.get("hostContextId");
        return JSON.parse(sessionStorage.getItem(hostContextId));
      });
      expect(storedContext.documentKind).toBe("workspace-manifest");
      expect(storedContext.toolId).toBeUndefined();
      expect(storedContext.activePalette).toBeUndefined();
      expect(storedContext.workspaceManifest).toBeUndefined();
      expect(storedContext.gameId).toBe("Asteroids");
      expect(storedContext.gameRoot).toBe("games/Asteroids/");
      expect(storedContext.assetsPath).toBe("games/Asteroids/assets");
      expect(storedContext.repoRoot).toBe("HTML-JavaScript-Gaming");
      expect(storedContext.repoPath).toBe(manifestRepoPath(server));
      expect(storedContext.tools["palette-manager-v2"].swatches.length).toBeGreaterThan(0);
      expect(Object.keys(storedContext.tools["asset-manager-v2"].assets)).toHaveLength(14);
      expect(storedContext.tools["asset-manager-v2"].previewImagePath).toBeUndefined();
      expect(storedContext.tools["asset-manager-v2"].assets["assets.image.background.deluxe"]).toEqual({
        path: "assets/images/deluxe.png",
        type: "image",
        kind: "png",
        role: "background",
        source: "manifest",
        stretchOverride: {
          uniformEdgeStretchPx: 0
        }
      });
      expect(storedContext.tools["asset-manager-v2"].assets["assets.image.bezel.bezel"]).toEqual({
        path: "assets/images/bezel.png",
        type: "image",
        kind: "png",
        role: "bezel",
        source: "manifest",
        stretchOverride: {
          uniformEdgeStretchPx: 10
        }
      });
      expect(storedContext.tools["asset-manager-v2"].assets["assets.image.preview.preview"]).toEqual({
        path: "assets/images/preview.png",
        type: "image",
        kind: "png",
        role: "preview",
        source: "manifest"
      });
      expect(storedContext.tools["vector-map-editor"].vectorMapDocument.vectors.map((vector) => vector.id)).toContain("vector.asteroids.ship");
      expect(storedContext.tools["asset-manager-v2"].assets["assets.font.ui.vector-battle"]).toEqual({
        path: "assets/fonts/vector_battle.ttf",
        type: "font",
        kind: "ttf",
        role: "ui",
        source: "manifest"
      });
      expect(storedContext.workspaceMetadata).toBeUndefined();
      expect(storedContext.tools["asset-browser"]).toBeUndefined();
      expect(storedContext.tools["palette-browser"]).toBeUndefined();
      expect(storedContext.tools["asset-manager-v2"].schema).toBe("html-js-gaming.asset-manager-v2");
      const schemaValidation = await page.evaluate(async () => {
        const [workspaceSchema, paletteSchema, assetSchema, vectorMapSchema] = await Promise.all([
          fetch("/tools/schemas/workspace.manifest.schema.json", { cache: "no-store" }).then((response) => response.json()),
          fetch("/tools/schemas/tools/palette-manager-v2.schema.json", { cache: "no-store" }).then((response) => response.json()),
          fetch("/tools/schemas/tools/asset-manager-v2.schema.json", { cache: "no-store" }).then((response) => response.json()),
          fetch("/tools/schemas/tools/vector-map-editor.schema.json", { cache: "no-store" }).then((response) => response.json())
        ]);
        const url = new URL(window.location.href);
        const manifest = JSON.parse(sessionStorage.getItem(url.searchParams.get("hostContextId")));
        const palettePayload = manifest.tools["palette-manager-v2"];
        const assetPayload = manifest.tools["asset-manager-v2"];
        const vectorPayload = manifest.tools["vector-map-editor"];
        const extraKeys = (value, schema) => Object.keys(value).filter((key) => !Object.hasOwn(schema.properties || {}, key));
        const missingKeys = (value, schema) => (schema.required || []).filter((key) => !Object.hasOwn(value, key));
        const swatchExtraKeys = palettePayload.swatches.flatMap((swatch, index) => (
          extraKeys(swatch, paletteSchema.$defs.swatch).map((key) => `${index}.${key}`)
        ));
        const swatchMissingKeys = palettePayload.swatches.flatMap((swatch, index) => (
          missingKeys(swatch, paletteSchema.$defs.swatch).map((key) => `${index}.${key}`)
        ));
        return {
          assetExtraKeys: extraKeys(assetPayload, assetSchema),
          assetMissingKeys: missingKeys(assetPayload, assetSchema),
          manifestExtraKeys: extraKeys(manifest, workspaceSchema),
          manifestMissingKeys: missingKeys(manifest, workspaceSchema),
          paletteExtraKeys: extraKeys(palettePayload, paletteSchema),
          paletteMissingKeys: missingKeys(palettePayload, paletteSchema),
          swatchExtraKeys,
          swatchMissingKeys,
          toolKeys: Object.keys(manifest.tools).sort(),
          unsupportedToolKeys: Object.keys(manifest.tools).filter((key) => !Object.hasOwn(workspaceSchema.properties.tools.properties, key)),
          vectorExtraKeys: extraKeys(vectorPayload, vectorMapSchema),
          vectorMissingKeys: missingKeys(vectorPayload, vectorMapSchema),
          vectorIds: vectorPayload.vectorMapDocument.vectors.map((vector) => vector.id)
        };
      });
      expect(schemaValidation).toEqual({
        assetExtraKeys: [],
        assetMissingKeys: [],
        manifestExtraKeys: [],
        manifestMissingKeys: [],
        paletteExtraKeys: [],
        paletteMissingKeys: [],
        swatchExtraKeys: [],
        swatchMissingKeys: [],
        toolKeys: ["asset-manager-v2", "palette-manager-v2", "vector-map-editor"],
        unsupportedToolKeys: [],
        vectorExtraKeys: [],
        vectorIds: [
          "vector.asteroids.ship",
          "vector.asteroids.asteroid.large",
          "vector.asteroids.asteroid.medium",
          "vector.asteroids.asteroid.small",
          "vector.asteroids.ui.title"
        ],
        vectorMissingKeys: []
      });
      expect(JSON.stringify(storedContext)).not.toMatch(/samples\//i);
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);
      await expect(page.locator("#activeGameSelect")).toHaveValue("Asteroids");
      await expect(page.locator("#activeAssetRegistrySummary")).toHaveCount(0);
      await expect(page.locator('[data-workspace-tool-id="asset-manager-v2"]')).toBeEnabled();
      await expect(page.locator("#exportManifestButton")).toBeEnabled();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Restored Asteroids workspace from session context workspace-manager-v2-/);

      await page.locator('[data-workspace-tool-id="palette-manager-v2"]').click();
      await expect(page).toHaveURL(/palette-manager-v2\/index\.html.*launch=workspace/);
      await expect(page.locator('[data-launch-mode-nav="tool"]')).toBeHidden();
      await expect(page.locator('[data-launch-mode-nav="workspace"]')).toBeVisible();
      await expect(page.locator('[data-launch-mode-nav="workspace"] button')).toHaveText(["Return to Workspace"]);
      await expect(page.locator("#userPaletteCount")).toHaveText("11 user swatches");
      await expect(page.locator('#userSwatchList [aria-label="Edit Space Black"]')).toBeVisible();
      await expect(page.locator('#userSwatchList [aria-label="Edit Space Black"]')).toHaveAttribute("title", /Name: Space Black/);
      await expect(page.locator("#paletteStatus")).toHaveText("Loaded active workspace palette Asteroids Palette.");
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);
      await expect(previewTile).toBeEnabled();
      await expect(previewTile).toContainText("Schema-valid manifest");
      await page.locator('[data-workspace-tool-id="preview-generator-v2"]').click();
      await expect(page).toHaveURL(/preview-generator-v2\/index\.html.*launch=workspace/);
      await expect(page.locator('[data-launch-mode-nav="tool"]')).toBeHidden();
      await expect(page.locator('[data-launch-mode-nav="workspace"]')).toBeVisible();
      await expect(page.locator('[data-launch-mode-nav="workspace"] button')).toHaveText(["Generate Image", "Return to Workspace"]);
      await expect(page.locator("#executeBtn")).toBeVisible();
      await expect(page.locator("#executeBtn")).toBeEnabled();
      await expect(page.locator("#repoSelectedValue")).toHaveText("HTML-JavaScript-Gaming");
      await expect(page.locator("#pickRepoBtn")).toBeHidden();
      await expect(page.locator("#workspaceContextValue")).toHaveCount(0);
      await expect(page.locator("#repoDestinationContent")).not.toContainText("Workspace launch");
      await expect(page.locator("#targetTypeGames")).toBeChecked();
      await expect(page.locator('label[for="targetTypeGames"]')).toBeVisible();
      await expect(page.locator('label[for="targetTypeSamples"]')).toBeHidden();
      await expect(page.locator('label[for="targetTypeTools"]')).toBeHidden();
      await expect(page.locator("#assetFolder")).toHaveValue("assets/images");
      await expect(page.locator("#baseUrl")).toHaveValue(server.baseUrl);
      await expect(page.locator("#sampleList")).toHaveValue("Asteroids");
      await expect(page.locator("#previewTargetValue")).toHaveText("games/Asteroids/assets/images/preview.svg");
      await expect(page.locator("#lastGeneratedImagePreview")).toBeVisible();
      await expect(page.locator("#lastGeneratedImageMeta")).toHaveText("Preview target: games/Asteroids/assets/images/preview.png");
      await expect(page.locator("#log")).toContainText("Raw workspace launch path field launchContext.repoRoot: HTML-JavaScript-Gaming");
      await expect(page.locator("#log")).toContainText("Raw workspace launch path field manifest.repoRoot: HTML-JavaScript-Gaming");
      await expect(page.locator("#log")).toContainText("OK Workspace launch context hydrated for Asteroids.");
      await expect(page.locator("#log")).toContainText("Workspace repoRoot display label available: HTML-JavaScript-Gaming.");
      await expect(page.locator("#log")).toContainText("OK Workspace repo session reference loaded from workspace.repo.reference for HTML-JavaScript-Gaming.");
      await expect(page.locator("#log")).toContainText("OK Workspace tool session workspace context loaded from workspace.tools.preview-generator-v2.");
      await expect(page.locator("#log")).toContainText("Workspace launch repo context resolved from session storage; independent repo selection is not required.");
      await expect(page.locator("#log")).not.toContainText("Direct preview write");
      await expect(page.locator("#log")).not.toContainText("Resolved repoPath");
      await expect(page.locator("#log")).not.toContainText("absolute preview output path");
      await expect(page.locator("#log")).not.toContainText("Unable to resolve absolute repoRoot");
      await expect(page.locator("#log")).not.toContainText("/__workspace-manager-v2/repo-root");
      await expect(page.locator("#log")).not.toContainText("/__workspace-manager-v2/write-preview");
      await expect(page.locator("#log")).toContainText("Asset folder: assets\\images");
      await expect(page.locator("#log")).toContainText("Manifest preview asset: assets.image.preview.preview (image/png)");
      await expect(page.locator("#log")).toContainText("Manifest preview source: games/Asteroids/assets/images/preview.png");
      await expect(page.locator("#log")).toContainText("Generated preview target: games/Asteroids/assets/images/preview.svg");
      await expect(page.locator("#log")).toContainText("Preview target: games/Asteroids/assets/images/preview.svg");
      await expect(page.locator("#log")).toContainText("Workspace background source: assets.image.background.deluxe -> games/Asteroids/assets/images/deluxe.png");
      await expect(page.locator("#log")).toContainText("Workspace background color: Space Black #020617 from palette-manager-v2 swatch.");
      await expect(page.locator("#log")).not.toContainText("FAIL Workspace background hydration");
      await expect(page.locator("#log")).toContainText("OK Workspace manifest preview source is valid at games/Asteroids/assets/images/preview.png.");
      const previewStatusHeaderOrder = await page.locator(".preview-generator-v2__status-accordion-header").evaluate((header) => Array.from(header.querySelectorAll(":scope > span, :scope > div > span, :scope > div > button"), (element) => element.textContent.trim()));
      expect(previewStatusHeaderOrder).toEqual(["Status", "+", "Clear"]);
      await page.locator("#executeBtn").click();
      await expect(page.locator("#log")).toContainText("Starting execution...", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("RUN  Asteroids", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("OUT  games\\Asteroids\\assets\\images\\preview.svg", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("OK   Asteroids", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("Done.", { timeout: 20000 });
      await expect(page.locator("#lastGeneratedImageMeta")).toHaveText("Last generated: Asteroids");
      const previewWrites = await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.repo.writes") || "[]"));
      expect(previewWrites).toHaveLength(1);
      expect(previewWrites[0].path).toBe("HTML-JavaScript-Gaming/games/Asteroids/assets/images/preview.svg");
      expect(previewWrites[0].contents).toContain("<svg");
      expect(previewWrites[0].contents).not.toContain("Capture timeout");
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("imports a schema-valid manifest and exports the imported session manifest", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];
    const importedManifest = JSON.parse(await readFile("games/Asteroids/game.manifest.json", "utf8"));
    importedManifest.game.workspace.id = "workspace-manager-v2-Asteroids-imported";
    importedManifest.game.workspace.name = "Imported Asteroids Workspace Manager V2 Context";

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await page.locator("#importManifestInput").setInputFiles({
        name: "asteroids-imported.game.manifest.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(importedManifest))
      });
      await expect(page.locator("#activeGameSelect")).toHaveValue("Asteroids");
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"id": "workspace-manager-v2-Asteroids-imported"/);
      await expect(page.locator("#activeAssetRegistrySummary")).toHaveCount(0);
      await expect(page.locator('[data-workspace-tool-id="asset-manager-v2"]')).toBeEnabled();
      const importedHydration = await readWorkspaceSessionHydration(page);
      expect(importedHydration.toolKeys).toContain("workspace.tools.asset-manager-v2");
      expect(importedHydration.toolKeys).not.toContain("workspace.tools.templates-v2");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Boundary contract: game\.gameData is runtime data; game\.workspace is editor\/tool state\. Runtime ignores game\.workspace; tools may read game\.gameData, write game\.workspace, and update game\.gameData only through explicit validated apply\/build\/export actions\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Hydrated workspace session for asset-manager-v2, palette-manager-v2, preview-generator-v2, session-inspector-v2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Skipped workspace session hydration for templates-v2: starter\/dev-only tool is not enabled by the selected game workspace config\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Imported schema-valid Workspace Manager V2 manifest workspace-manager-v2-Asteroids-imported\./);

      const downloadPromise = page.waitForEvent("download");
      await page.locator("#exportManifestButton").click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe("workspace-manager-v2-Asteroids-imported.workspace.manifest.json");
      const exportedManifest = JSON.parse(await readFile(await download.path(), "utf8"));
      expect(exportedManifest).toEqual(importedManifest.game.workspace);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Exported schema-valid Workspace Manager V2 manifest workspace-manager-v2-Asteroids-imported\./);
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("opens Preview Generator V2 workspace launch with actionable missing repo session status", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];
    const hostContextId = "workspace-manager-v2-display-root-context";
    const displayRootGameManifest = JSON.parse(await readFile("games/Asteroids/game.manifest.json", "utf8"));
    const displayRootManifest = displayRootGameManifest.game.workspace;
    displayRootManifest.repoRoot = "HTML-JavaScript-Gaming";
    delete displayRootManifest.repoPath;

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.addInitScript(({ contextId, manifest }) => {
      window.sessionStorage.setItem(contextId, JSON.stringify(manifest));
    }, { contextId: hostContextId, manifest: displayRootManifest });
    await coverageReporter.start(page);
    await page.goto(`${server.baseUrl}/tools/preview-generator-v2/index.html?launch=workspace&fromTool=workspace-manager-v2&hostContextId=${hostContextId}`, { waitUntil: "networkidle" });

    try {
      await expect(page.locator("#repoSelectedValue")).toHaveText("HTML-JavaScript-Gaming");
      await expect(page.locator("#pickRepoBtn")).toBeHidden();
      await expect(page.locator("#executeBtn")).toBeDisabled();
      await expect(page.locator("#previewTargetValue")).toHaveText("games/Asteroids/assets/images/preview.svg");
      await expect(page.locator("#log")).toContainText("Raw workspace launch path field launchContext.repoRoot: HTML-JavaScript-Gaming");
      await expect(page.locator("#log")).toContainText("Raw workspace launch path field manifest.repoRoot: HTML-JavaScript-Gaming");
      await expect(page.locator("#log")).toContainText("OK Workspace launch context hydrated for Asteroids.");
      await expect(page.locator("#log")).toContainText("Workspace repoRoot display label available: HTML-JavaScript-Gaming.");
      await expect(page.locator("#log")).toContainText("FAIL Workspace repo session hydration: workspace.repo.reference was not found in sessionStorage.");
      await expect(page.locator("#log")).toContainText("Preview Generator V2 requires Workspace Manager V2 repo session storage before image generation.");
      await expect(page.locator("#log")).not.toContainText("repoPath");
      await expect(page.locator("#log")).not.toContainText("Direct preview write");
      await expect(page.locator("#log")).not.toContainText("/__workspace-manager-v2/repo-root");
      await expect(page.locator("#log")).not.toContainText("/__workspace-manager-v2/write-preview");
      await expect(page.locator("#log")).not.toContainText("FAIL Workspace launch context hydration");
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("keeps Preview Generator V2 disabled for invalid workspace repo session state", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];
    const hostContextId = "workspace-manager-v2-invalid-repo-reference-context";
    const gameManifest = JSON.parse(await readFile("games/Asteroids/game.manifest.json", "utf8"));
    const manifest = gameManifest.game.workspace;
    manifest.repoRoot = "HTML-JavaScript-Gaming";

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.addInitScript(({ contextId, workspaceManifest }) => {
      window.sessionStorage.setItem(contextId, JSON.stringify(workspaceManifest));
      window.sessionStorage.setItem("workspace.repo.reference", JSON.stringify({
        source: "workspace-manager-v2",
        kind: "file-system-directory-handle-reference",
        displayName: "WrongRepo",
        handleName: "WrongRepo"
      }));
      window.sessionStorage.setItem("workspace.tools.preview-generator-v2", JSON.stringify({
        schema: {
          source: "workspace-manager-v2",
          toolId: "preview-generator-v2",
          schemaRole: "workspace-launch-context",
          schemaRef: "tools/schemas/workspace.manifest.schema.json"
        },
        workspace: {
          source: "workspace-manager-v2",
          toolId: "preview-generator-v2",
          gameId: workspaceManifest.gameId,
          gameRoot: workspaceManifest.gameRoot,
          assetsPath: workspaceManifest.assetsPath,
          repoReferenceKey: "workspace.repo.reference"
        },
        data: null,
        dirty: {
          isDirty: false,
          reason: null,
          changedAt: null,
          changedKeys: []
        }
      }));
    }, { contextId: hostContextId, workspaceManifest: manifest });
    await coverageReporter.start(page);
    await page.goto(`${server.baseUrl}/tools/preview-generator-v2/index.html?launch=workspace&fromTool=workspace-manager-v2&hostContextId=${hostContextId}`, { waitUntil: "networkidle" });

    try {
      await expect(page.locator("#pickRepoBtn")).toBeHidden();
      await expect(page.locator("#executeBtn")).toBeDisabled();
      await expect(page.locator("#repoSelectedValue")).toHaveText("HTML-JavaScript-Gaming");
      await expect(page.locator("#log")).toContainText("FAIL Workspace repo session hydration: workspace.repo.reference.displayName WrongRepo does not match manifest repoRoot HTML-JavaScript-Gaming.");
      await expect(page.locator("#log")).toContainText("Preview Generator V2 requires Workspace Manager V2 repo session storage before image generation.");
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("loads Gravity Well and Pong manifests as current Workspace Manager V2 manifests", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      const schemaValidation = await page.evaluate(async () => {
        const { WorkspaceManagerV2ContextService } = await import("/tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js");
        const service = new WorkspaceManagerV2ContextService();
        const manifests = {
          GravityWell: await fetch("/games/GravityWell/game.manifest.json", { cache: "no-store" }).then((response) => response.json()),
          Pong: await fetch("/games/Pong/game.manifest.json", { cache: "no-store" }).then((response) => response.json())
        };
        return Object.fromEntries(await Promise.all(Object.entries(manifests).map(async ([gameId, manifest]) => [
          gameId,
          {
            gameManifest: await service.validateGameManifest(manifest),
            workspace: await service.validateGeneratedManifest(manifest.game.workspace)
          }
        ])));
      });
      expect(schemaValidation).toEqual({
        GravityWell: {
          gameManifest: { ok: true },
          workspace: { ok: true }
        },
        Pong: {
          gameManifest: { ok: true },
          workspace: { ok: true }
        }
      });

      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("GravityWell");
      await expect(page.locator("#activeGameSummary")).toContainText("games/GravityWell/");
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"gameRoot": "games\/GravityWell\/"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"assetsPath": "games\/GravityWell\/assets"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"assets.image.preview.preview"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"assets.image.background.preview"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"asset-browser"|"palette-browser"|"vector-map-editor"/);
      await expect(page.locator('[data-workspace-tool-id="asset-manager-v2"]')).toContainText("1 managed assets");
      await expect(page.locator('[data-workspace-tool-id="palette-manager-v2"]')).toContainText("10 palette swatches");
      await expect(page.locator('[data-workspace-tool-id="preview-generator-v2"]')).toContainText("Schema-valid manifest");
      const gravityManifest = JSON.parse(await page.locator("#workspaceContextOutput").inputValue());
      expect(gravityManifest.repoPath).toBe(manifestRepoPath(server));
      expect(Object.keys(gravityManifest.tools).sort()).toEqual(["asset-manager-v2", "palette-manager-v2"]);
      expect(gravityManifest.tools["asset-manager-v2"].assets["assets.image.preview.preview"]).toEqual({
        path: "assets/images/preview.svg",
        type: "image",
        kind: "svg",
        role: "preview",
        source: "manifest"
      });
      expect(gravityManifest.tools["asset-manager-v2"].assets["assets.image.background.preview"]).toBeUndefined();

      await page.locator('[data-workspace-tool-id="preview-generator-v2"]').click();
      await expect(page).toHaveURL(/preview-generator-v2\/index\.html.*launch=workspace/);
      await expect(page.locator("#repoSelectedValue")).toHaveText("HTML-JavaScript-Gaming");
      await expect(page.locator("#pickRepoBtn")).toBeHidden();
      await expect(page.locator("#sampleList")).toHaveValue("GravityWell");
      await expect(page.locator("#previewTargetValue")).toHaveText("games/GravityWell/assets/images/preview.svg");
      await expect(page.locator("#executeBtn")).toBeEnabled();
      await expect(page.locator("#log")).toContainText("OK Workspace repo session reference loaded from workspace.repo.reference for HTML-JavaScript-Gaming.");
      await expect(page.locator("#log")).toContainText("Workspace launch repo context resolved from session storage; independent repo selection is not required.");
      await expect(page.locator("#log")).toContainText("Generated preview target: games/GravityWell/assets/images/preview.svg");
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);

      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Pong");
      await expect(page.locator("#activeGameSummary")).toContainText("games/Pong/");
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"gameRoot": "games\/Pong\/"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"assetsPath": "games\/Pong\/assets"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"assets.image.preview.preview"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"assets.image.background.preview"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"asset-browser"|"palette-browser"|"vector-map-editor"/);
      await expect(page.locator('[data-workspace-tool-id="asset-manager-v2"]')).toContainText("1 managed assets");
      await expect(page.locator('[data-workspace-tool-id="palette-manager-v2"]')).toContainText("8 palette swatches");
      await expect(page.locator('[data-workspace-tool-id="preview-generator-v2"]')).toContainText("Schema-valid manifest");
      const pongManifest = JSON.parse(await page.locator("#workspaceContextOutput").inputValue());
      expect(pongManifest.repoPath).toBe(manifestRepoPath(server));
      expect(Object.keys(pongManifest.tools).sort()).toEqual(["asset-manager-v2", "palette-manager-v2"]);
      expect(pongManifest.tools["asset-manager-v2"].assets["assets.image.preview.preview"]).toEqual({
        path: "assets/images/preview.svg",
        type: "image",
        kind: "svg",
        role: "preview",
        source: "manifest"
      });
      expect(pongManifest.tools["asset-manager-v2"].assets["assets.image.background.preview"]).toBeUndefined();

      await page.locator('[data-workspace-tool-id="preview-generator-v2"]').click();
      await expect(page).toHaveURL(/preview-generator-v2\/index\.html.*launch=workspace/);
      await expect(page.locator("#repoSelectedValue")).toHaveText("HTML-JavaScript-Gaming");
      await expect(page.locator("#pickRepoBtn")).toBeHidden();
      await expect(page.locator("#sampleList")).toHaveValue("Pong");
      await expect(page.locator("#previewTargetValue")).toHaveText("games/Pong/assets/images/preview.svg");
      await expect(page.locator("#executeBtn")).toBeEnabled();
      await expect(page.locator("#log")).toContainText("OK Workspace repo session reference loaded from workspace.repo.reference for HTML-JavaScript-Gaming.");
      await expect(page.locator("#log")).toContainText("Workspace launch repo context resolved from session storage; independent repo selection is not required.");
      await expect(page.locator("#log")).toContainText("Generated preview target: games/Pong/assets/images/preview.svg");
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);

      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("blocks Workspace Manager V2 export when the manifest fails schema validation", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expect(page.locator("#exportManifestButton")).toBeEnabled();
      await page.evaluate(() => {
        window.__workspaceManagerV2App.activeContext.tools["asset-manager-v2"].unexpected = true;
      });
      await page.locator("#exportManifestButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Export blocked: Generated Workspace Manager V2 manifest failed schema validation: root\.tools\.asset-manager-v2\.unexpected is not allowed/);
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("warns instead of injecting hardcoded Asteroids assets when manifest assets are empty", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];
    const asteroidsManifest = JSON.parse(await readFile("games/Asteroids/game.manifest.json", "utf8"));
    asteroidsManifest.game.workspace.tools["asset-manager-v2"].assets = {};

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.route("**/games/Asteroids/game.manifest.json", async (route) => {
      await route.fulfill({
        body: JSON.stringify(asteroidsManifest),
        contentType: "application/json",
        status: 200
      });
    });
    await installMockRepoPicker(page);
    await coverageReporter.start(page);
    await page.goto(`${server.baseUrl}/tools/workspace-manager-v2/index.html`, { waitUntil: "networkidle" });

    try {
      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expect(page.locator("#activeAssetRegistrySummary")).toHaveCount(0);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"assets": \{\}/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"vector-map-editor"/);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Warning: \/games\/Asteroids\/game\.manifest\.json has no Asteroids Asset Manager V2 assets; Workspace Manager V2 did not inject hardcoded assets\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded Asteroids from \/games\/Asteroids\/game\.manifest\.json with 11 active palette colors and 0 managed assets\./);
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("owns temporary UAT manifest seeding and launches Asset Manager V2 through session context", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page, "?workspace=uat");
    const pageErrors = [];
    const uatManifest = JSON.parse(await readFile("games/_template/workspace-manager-v2-UAT.manifest.json", "utf8"));

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#seedUatManifestButton")).toBeVisible();
      await expect(page.locator("#exportManifestButton")).toBeDisabled();
      await page.locator("#seedUatManifestButton").click();
      const uatManifestValidation = await page.evaluate(async (manifest) => {
        const { WorkspaceManagerV2ContextService } = await import("/tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js");
        return new WorkspaceManagerV2ContextService().validateGeneratedManifest(manifest);
      }, uatManifest);
      expect(uatManifestValidation).toEqual({ ok: true });
      await expect(page.locator("#activeGameSelect")).toHaveValue("_template");
      await expect(page.locator("#activeGameSelect option[value='_template']")).toHaveText("Template UAT");
      await expect(page.locator("#activePaletteSummary")).toHaveCount(0);
      await expect(page.locator("#activeAssetRegistrySummary")).toHaveCount(0);
      await expect(page.locator('[data-workspace-tool-id="templates-v2"]')).toContainText("Canonical V2 template");
      await expect(page.locator('[data-workspace-tool-id="asset-manager-v2"]')).toContainText("0 managed assets");
      await expect(page.locator('[data-workspace-tool-id="workspace-manager-v2"]')).toHaveCount(0);
      await expect(page.locator('[data-workspace-tool-id="palette-manager-v2"]')).toContainText("3 palette swatches");
      await expect(page.locator('[data-workspace-tool-id="preview-generator-v2"]')).toContainText("Schema-valid manifest");
      await expect(page.locator('[data-workspace-tool-id="session-inspector-v2"]')).toContainText("Session Inspector V2");
      await expect(page.locator('[data-workspace-tool-id="session-inspector-v2"]')).not.toContainText("Session storage inspector");
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"id": "workspace-manager-v2-UAT-template"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"gameRoot": "games\/_template\/"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"assetsPath": "games\/_template\/assets"/);
      expect(JSON.parse(await page.locator("#workspaceContextOutput").inputValue()).repoPath).toBe(manifestRepoPath(server));
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"sourceId": "games\/_template\/workspace-manager-v2-UAT.manifest.json"/);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded UAT Workspace Manager V2 manifest workspace-manager-v2-UAT-template from \/games\/_template\/workspace-manager-v2-UAT\.manifest\.json\./);

      await page.locator('[data-workspace-tool-id="asset-manager-v2"]').click();
      await expect(page).toHaveURL(/asset-manager-v2\/index\.html.*launch=workspace/);
      await expect(page).not.toHaveURL(/workspace=uat/i);
      await expect(page.locator("#assetLaunchGuard")).toBeHidden();
      await expect(page.locator(".asset-manager-v2__workspace__menu")).toBeVisible();
      await expect(page.locator("#statusLog")).toHaveValue(/Workspace Manager V2 loaded 0 validated assets from tools\.asset-manager-v2\.assets/);
      await expect(page.locator("#statusLog")).toHaveValue(/Workspace Manager V2 loaded 3 palette colors from active palette context/);
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html.*hostContextId=workspace-manager-v2-/);
      await expect(page).toHaveURL(/workspace=uat/);
      await expect(page.locator("#seedUatManifestButton")).toBeVisible();
      await expect(page.locator("#activeAssetRegistrySummary")).toHaveCount(0);
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("keeps direct Asset Manager V2 workspace prod launch blocked", async ({ page }) => {
    const server = await openAssetManagerV2(page, "?workspace=prod");
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#assetLaunchGuard")).toBeVisible();
      await expect(page.locator("#assetLaunchGuardMessage")).toHaveText("Asset Manager V2 is only available through Workspace Manager with a game workspace and palette.");
      await expect(page.locator("#assetLaunchGuardReason")).toContainText("Temporary workspace query launches are no longer supported; launch through Workspace Manager V2.");
      await expect(page.locator("#assetLaunchGuardReturnToToolsButton")).toHaveText("Return to Tools");
      await expect(page.locator("body")).toHaveClass(/asset-manager-v2--launch-blocked/);
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });
});
