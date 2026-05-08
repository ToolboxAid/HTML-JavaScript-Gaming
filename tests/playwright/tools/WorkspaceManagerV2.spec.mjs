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
  await expect(page.locator("#workspaceToolTiles [data-workspace-tool-id]")).toHaveCount(4);
  expect(await page.locator("#workspaceToolTiles [data-workspace-tool-id]").evaluateAll((tiles) => tiles.every((tile) => tile.disabled))).toBe(true);
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
          workflowCards: Array.from(workflowGrid?.querySelectorAll(".tools-platform-card h3") || [])
            .map((heading) => heading.textContent.trim()),
          workspaceActionLabels: Array.from(workspaceCard?.querySelectorAll(".tools-platform-card__action") || [])
            .map((action) => action.textContent.trim())
        };
      });
      expect(toolsIndexState.headings.slice(0, 4)).toEqual(["Workflow", "Editors", "Utilities", "Viewers"]);
      expect(toolsIndexState.workflowCards).toEqual(["Workspace Manager V2"]);
      expect(toolsIndexState.utilitiesCards).not.toContain("Workspace Manager V2");
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

  test("starts with no active game even when stale session state exists", async ({ page }) => {
    const staleGameManifest = JSON.parse(await readFile("games/Asteroids/game.manifest.json", "utf8"));
    const pageErrors = [];
    await page.addInitScript((manifest) => {
      window.sessionStorage.setItem("workspace-manager-v2-stale-context", JSON.stringify(manifest));
      window.sessionStorage.setItem("workspace-manager-v2-active-host-context-id", "workspace-manager-v2-stale-context");
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

      await selectMockRepo(page);
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
      await expect(page.locator("#workspaceToolTiles [data-workspace-tool-id]")).toHaveCount(4);
      await expect(page.locator('[data-workspace-tool-id="workspace-manager-v2"]')).toHaveCount(0);
      const toolGroupMembership = await page.locator(".workspace-manager-v2__tool-group").evaluateAll((groups) => Object.fromEntries(groups.map((group) => [
        group.querySelector(".workspace-manager-v2__tool-group-title")?.textContent?.trim(),
        Array.from(group.querySelectorAll(".workspace-manager-v2__tool-tile-name"), (name) => name.textContent.trim())
      ])));
      expect(toolGroupMembership).toEqual({
        Editors: ["Asset Manager V2", "Palette Manager V2"],
        Utilities: ["Preview Generator V2"],
        Viewers: ["Tool Starter V2"]
      });
      expect(await page.locator("#workspaceToolTiles [data-workspace-tool-id]").evaluateAll((tiles) => tiles.every((tile) => tile.disabled))).toBe(true);
      expect(await page.locator("#workspaceToolTiles [data-workspace-tool-id]").evaluateAll((tiles) => (
        tiles.every((tile) => Array.from(tile.querySelectorAll(".workspace-manager-v2__tool-tile-action"), (action) => action.textContent.trim()).join("|") === "How To Use|Read Me")
      ))).toBe(true);
      await selectMockRepo(page);
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
      await expect(templateTile).toBeEnabled();
      await expect(templateTile).toContainText("Tool Starter V2");
      await expect(templateTile).toContainText("Canonical V2 template");
      await expect(assetTile).toBeEnabled();
      await expect(assetTile).toContainText("Asset Manager V2");
      await expect(assetTile).toContainText("Ready to launch");
      await expect(assetTile).toContainText("14 managed assets");
      await expect(paletteTile).toContainText("11 palette swatches");
      await expect(previewTile).toContainText("Schema-valid manifest");
      const tileLayout = await page.locator("#workspaceToolTiles [data-workspace-tool-id]").evaluateAll((tiles) => tiles.map((tile) => ({
        height: Math.round(tile.getBoundingClientRect().height),
        width: Math.round(tile.getBoundingClientRect().width)
      })));
      expect(tileLayout).toEqual([
        { height: 142, width: 180 },
        { height: 142, width: 180 },
        { height: 142, width: 180 },
        { height: 142, width: 180 }
      ]);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Boundary contract: game\.gameData is runtime data; game\.workspace is editor\/tool state\. Runtime ignores game\.workspace; tools may read game\.gameData, write game\.workspace, and update game\.gameData only through explicit validated apply\/build\/export actions\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded Asteroids from \/games\/Asteroids\/game\.manifest\.json with 11 active palette colors and 14 managed assets\./);

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

      await page.locator('[data-workspace-tool-id="templates-v2"]').click();
      await expect(page).toHaveURL(/templates-v2\/index\.html.*launch=workspace/);
      await expect(page.locator('[data-launch-mode-nav="tool"]')).toBeHidden();
      await expect(page.locator('[data-launch-mode-nav="workspace"]')).toBeVisible();
      await expect(page.locator('[data-launch-mode-nav="workspace"]').getByRole("button")).toHaveText(["Return to Workspace"]);
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);
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
      await expect(page.locator("#executeBtn")).toBeDisabled();
      await expect(page.locator("#repoSelectedValue")).toHaveText("HTML-JavaScript-Gaming");
      await expect(page.locator("#pickRepoBtn")).toBeHidden();
      await expect(page.locator("#workspaceContextValue")).toHaveCount(0);
      await expect(page.locator("#repoDestinationContent")).not.toContainText("Workspace launch");
      await expect(page.locator("#targetTypeGames")).toBeChecked();
      await expect(page.locator('label[for="targetTypeGames"]')).toBeVisible();
      await expect(page.locator('label[for="targetTypeSamples"]')).toBeHidden();
      await expect(page.locator('label[for="targetTypeTools"]')).toBeHidden();
      await expect(page.locator("#assetFolder")).toHaveValue("assets/images");
      await expect(page.locator("#sampleList")).toHaveValue("Asteroids");
      await expect(page.locator("#previewTargetValue")).toHaveText("games/Asteroids/assets/images/preview.svg");
      await expect(page.locator("#lastGeneratedImagePreview")).toBeVisible();
      await expect(page.locator("#lastGeneratedImageMeta")).toHaveText("Preview target: games/Asteroids/assets/images/preview.png");
      await expect(page.locator("#log")).toContainText("Raw workspace launch path field launchContext.repoRoot: HTML-JavaScript-Gaming");
      await expect(page.locator("#log")).toContainText("Raw workspace launch path field manifest.repoRoot: HTML-JavaScript-Gaming");
      await expect(page.locator("#log")).toContainText("OK Workspace launch context hydrated for Asteroids.");
      await expect(page.locator("#log")).toContainText("Workspace repoRoot display label available: HTML-JavaScript-Gaming.");
      await expect(page.locator("#log")).toContainText("Workspace launch is display-only; preview writes require normal Preview Generator repo selection.");
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
      await page.locator("#baseUrl").fill(server.baseUrl);
      await expect(page.locator("#executeBtn")).toBeDisabled();
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
      await expect(page.locator("#statusLog")).toHaveValue(/OK Boundary contract: game\.gameData is runtime data; game\.workspace is editor\/tool state\. Runtime ignores game\.workspace; tools may read game\.gameData, write game\.workspace, and update game\.gameData only through explicit validated apply\/build\/export actions\./);
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

  test("opens Preview Generator V2 workspace launch with display-only repoRoot and actionable status", async ({ page }) => {
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
      await expect(page.locator("#log")).toContainText("Workspace launch is display-only; preview writes require normal Preview Generator repo selection.");
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
      await expect(page.locator("#executeBtn")).toBeDisabled();
      await expect(page.locator("#log")).toContainText("Workspace launch is display-only; preview writes require normal Preview Generator repo selection.");
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
      await expect(page.locator("#executeBtn")).toBeDisabled();
      await expect(page.locator("#log")).toContainText("Workspace launch is display-only; preview writes require normal Preview Generator repo selection.");
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
