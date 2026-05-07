import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter as coverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

async function openWorkspaceManagerV2(page) {
  const server = await startRepoServer();
  await coverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/workspace-manager-v2/index.html`, { waitUntil: "networkidle" });
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

  test("launches Asset Manager V2 through Workspace Manager V2 session context", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("body[data-tool-id='workspace-manager-v2']")).toBeVisible();
      await expect(page.locator("#launchAssetManagerV2Button")).toBeDisabled();
      await expect(page.locator("#activeGameSelect option")).toHaveText([
        "Select a game",
        "Asteroids",
        "Gravity Well",
        "Pong"
      ]);

      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expect(page.locator("#activeGameSummary")).toContainText("games/Asteroids/");
      await expect(page.locator("#activePaletteSummary")).toContainText("Asteroids Palette");
      await expect(page.locator("#activePaletteSummary")).toContainText("active colors");
      await expect(page.locator("#activeAssetRegistrySummary")).toHaveText("Schema-ready Asset Manager V2 registry context contains 0 managed assets.");
      await expect(page.locator("#launchContextSummary")).toHaveText("Session launch context is ready for Asteroids.");
      await expect(page.locator("#workspaceContextOutput")).toContainText('"gameRoot": "games/Asteroids/"');
      await expect(page.locator("#workspaceContextOutput")).toContainText('"assetsPath": "games/Asteroids/assets"');
      await expect(page.locator("#workspaceContextOutput")).toContainText('"owner": "workspace-manager-v2"');
      await expect(page.locator("#workspaceContextOutput")).not.toContainText("samples/");
      await expect(page.locator("#workspaceContextOutput")).not.toContainText("tools/");
      await expect(page.locator("#launchAssetManagerV2Button")).toBeEnabled();

      await page.locator("#launchAssetManagerV2Button").click();
      await expect(page).toHaveURL(/asset-manager-v2\/index\.html.*launch=workspace/);
      await expect(page).toHaveURL(/fromTool=workspace-manager-v2/);
      await expect(page).toHaveURL(/hostContextId=workspace-manager-v2-/);
      await expect(page).not.toHaveURL(/workspace=prod/i);
      await expect(page).not.toHaveURL(/workspace=UAT/i);
      await expect(page).not.toHaveURL(/gameId=Asteroids/);
      await expect(page.locator("#assetLaunchGuard")).toBeHidden();
      await expect(page.locator(".asset-manager-v2__tool__menu")).toBeHidden();
      await expect(page.locator(".asset-manager-v2__workspace__menu")).toBeVisible();
      await expect(page.locator("#statusLog")).toHaveValue(/Workspace mode loaded 0 validated assets from tools\.asset-browser\.assets/);
      await expect(page.locator("#statusLog")).toHaveValue(/Workspace mode loaded \d+ palette colors from tools\.palette-browser\.swatches/);

      const workspacePreviewContext = await page.evaluate(async () => {
        const { WorkspaceBridge } = await import("/tools/asset-manager-v2/js/services/WorkspaceBridge.js");
        return new WorkspaceBridge({ windowRef: window }).readWorkspacePreviewContext();
      });
      expect(workspacePreviewContext).toEqual({
        workspaceMode: true,
        workspaceGameId: "Asteroids",
        workspaceGameRoot: "games/Asteroids/"
      });
      expect(JSON.stringify(workspacePreviewContext)).not.toMatch(/samples|tools/i);

      const storedContext = await page.evaluate(() => {
        const url = new URL(window.location.href);
        const hostContextId = url.searchParams.get("hostContextId");
        return JSON.parse(sessionStorage.getItem(hostContextId));
      });
      expect(storedContext.version).toBe("workspace-manager-v2");
      expect(storedContext.gameRoot).toBe("games/Asteroids/");
      expect(storedContext.assetsPath).toBe("games/Asteroids/assets");
      expect(storedContext.workspaceManifest.tools["palette-browser"].swatches.length).toBeGreaterThan(0);
      expect(storedContext.workspaceManifest.tools["asset-browser"].assets).toEqual({});
      expect(JSON.stringify(storedContext)).not.toMatch(/samples\//i);
      expect(JSON.stringify(storedContext.workspaceManifest.workspaceMetadata)).not.toMatch(/tools\//i);
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
      await expect(page.locator("#assetLaunchGuardReason")).toContainText("Temporary workspace prod is not supported.");
      await expect(page.locator("body")).toHaveClass(/asset-manager-v2--launch-blocked/);
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });
});
