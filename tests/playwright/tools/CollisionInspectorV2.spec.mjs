import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter as coverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.afterAll(async () => {
  await coverageReporter.writeReport();
});

async function dragCanvasPoint(page, from, to) {
  await page.locator("#collisionCanvas").evaluate((canvas, points) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    const clientPoint = (point) => ({
      clientX: rect.left + point.x * scaleX,
      clientY: rect.top + point.y * scaleY
    });
    const pointerInit = {
      bubbles: true,
      button: 0,
      buttons: 1,
      cancelable: true,
      pointerId: 1,
      pointerType: "mouse"
    };
    canvas.dispatchEvent(new PointerEvent("pointerdown", { ...pointerInit, ...clientPoint(points.from) }));
    window.dispatchEvent(new PointerEvent("pointermove", { ...pointerInit, ...clientPoint(points.to) }));
    window.dispatchEvent(new PointerEvent("pointerup", { ...pointerInit, buttons: 0, ...clientPoint(points.to) }));
  }, { from, to });
}

async function readCollisionSummary(page) {
  return JSON.parse(await page.locator("#collisionSummary").textContent());
}

async function canvasSignature(page) {
  return page.locator("#collisionCanvas").evaluate((canvas) => {
    const context = canvas.getContext("2d");
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let signature = 0;
    for (let index = 0; index < data.length; index += 97) {
      signature = (signature * 31 + data[index] * 3 + data[index + 1] * 5 + data[index + 2] * 7 + data[index + 3]) >>> 0;
    }
    return signature;
  });
}

test.describe("Collision Inspector V2", () => {
  test("loads a game manifest and reports live vector, pixel, bounds, and hybrid collisions", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await coverageReporter.start(page);
    try {
      await page.goto(`${server.baseUrl}/tools/collision-inspector-v2/index.html?manifestPath=/games/Asteroids/game.manifest.json`, { waitUntil: "networkidle" });
      await expect(page.locator("body.tools-platform-tool-page[data-tool-id='collision-inspector-v2']")).toBeVisible();
      await expect(page.locator("link[href='../templates-v2/styles/toolStarter.css']")).toHaveCount(1);
      await expect(page.locator(".tool-starter__header[data-tool-starter-header]")).toBeVisible();
      await expect(page.locator("nav.tool-starter__menu.tool-starter__tool__menu")).toBeVisible();
      await expect(page.locator("nav.tool-starter__menu.tool-starter__workspace__menu")).toBeHidden();
      await expect(page.locator("main.tool-starter.collision-inspector-v2.app-shell")).toBeVisible();
      await expect(page.locator(".tool-starter__panel.tool-starter__panel--left.collision-inspector-v2__panel--left")).toBeVisible();
      await expect(page.locator(".tool-starter__panel.tool-starter__panel--center.collision-inspector-v2__panel--center")).toBeVisible();
      await expect(page.locator(".tool-starter__panel.tool-starter__panel--right.collision-inspector-v2__panel--right")).toBeVisible();
      await expect(page.locator(".tool-starter__accordion.collision-inspector-v2__accordion")).toHaveCount(6);
      await expect(page.locator("#collisionModeSelect option")).toHaveText(["Bounds", "Vector", "Pixel/Sprite", "Hybrid"]);
      await expect(page.locator("#loadAsteroidsManifestButton")).toHaveCount(0);
      await expect(page.locator("#collisionManifestInput")).toBeVisible();
      await expect(page.locator("label[for='objectARotationInput']")).toContainText("Object A Rotate");
      await expect(page.locator("label[for='objectBRotationInput']")).toContainText("Object B Rotate");
      const collisionCss = (await readFile(join(server.repoRoot, "tools", "collision-inspector-v2", "styles", "collisionInspectorV2.css"), "utf8")).replace(/\r\n/g, "\n");
      expect(collisionCss).not.toContain(":root {");
      expect(collisionCss).not.toMatch(/--tool-starter-[a-z-]+:/);
      expect(collisionCss).not.toMatch(/(^|\n)\s*body(?:\[|\.|\s|,|\{)/);
      expect(collisionCss).not.toMatch(/(^|\n)\s*button\s*(?:,|\{)/);
      expect(collisionCss).not.toMatch(/(^|\n)\s*input\s*(?:,|\{)/);
      expect(collisionCss).not.toMatch(/(^|\n)\s*select\s*(?:,|\{)/);
      expect(collisionCss).not.toMatch(/(^|\n)\s*textarea\s*(?:,|\{)/);
      expect(collisionCss).not.toMatch(/(^|\n)\s*\.tool-starter__(?:header|menu|panel|field|output)\b/);
      expect(collisionCss).not.toMatch(/(^|\n)\s*\.accordion-v2(?:[\s.#:{]|$)/);

      await expect(page.locator("#manifestSummary")).toContainText("Asteroids");
      await expect(page.locator("#manifestSummary")).toContainText("7 objects loaded");
      await expect(page.locator("#manifestSummary")).toContainText("screen 960x720");
      await expect(page.locator("#collisionCanvas")).toHaveAttribute("width", "960");
      await expect(page.locator("#collisionCanvas")).toHaveAttribute("height", "720");
      const aspectRatio = await page.locator("#collisionCanvas").evaluate((canvas) => {
        const rect = canvas.getBoundingClientRect();
        return rect.width / rect.height;
      });
      expect(Math.abs(aspectRatio - (960 / 720))).toBeLessThan(0.02);
      const canvasLayout = await page.evaluate(() => {
        const zoom = document.querySelector(".collision-inspector-v2__zoom-row").getBoundingClientRect();
        const canvas = document.querySelector("#collisionCanvas").getBoundingClientRect();
        return {
          canvasBelowZoom: canvas.top >= zoom.bottom,
          canvasHeight: canvas.height,
          canvasWidth: canvas.width
        };
      });
      expect(canvasLayout.canvasBelowZoom).toBe(true);
      expect(Math.abs(canvasLayout.canvasWidth - 960)).toBeLessThanOrEqual(1);
      expect(Math.abs(canvasLayout.canvasHeight - 720)).toBeLessThanOrEqual(1);
      const collisionInspectorScale = await page.locator("#collisionCanvas").evaluate((canvas) => {
        const rect = canvas.getBoundingClientRect();
        return {
          scaleX: rect.width / canvas.width,
          scaleY: rect.height / canvas.height
        };
      });
      expect(collisionInspectorScale.scaleX).toBeCloseTo(1, 2);
      expect(collisionInspectorScale.scaleY).toBeCloseTo(1, 2);
      const runtimeRenderSource = await readFile(join(server.repoRoot, "src", "engine", "rendering", "ObjectVectorRuntimeAssetService.js"), "utf8");
      const objectVectorStudioSource = await readFile(join(server.repoRoot, "tools", "object-vector-studio-v2", "js", "ToolStarterApp.js"), "utf8");
      expect(runtimeRenderSource).toContain("const scale = Number.isFinite(options.scale) ? options.scale : 1;");
      expect(runtimeRenderSource).toContain("context.scale(scale, scale);");
      expect(objectVectorStudioSource).toContain("const OBJECT_PREVIEW_DRAWING_SCALE = GRID_STEP;");
      expect(objectVectorStudioSource).toContain("point.x / OBJECT_PREVIEW_DRAWING_SCALE");
      const asteroidsPage = await page.context().newPage();
      try {
        await asteroidsPage.goto(`${server.baseUrl}/games/Asteroids/index.html`, { waitUntil: "domcontentloaded" });
        await expect(asteroidsPage.locator("#game")).toHaveAttribute("width", "960");
        await expect(asteroidsPage.locator("#game")).toHaveAttribute("height", "720");
        const asteroidsScale = await asteroidsPage.locator("#game").evaluate((canvas) => {
          const rect = canvas.getBoundingClientRect();
          return {
            scaleX: rect.width / canvas.width,
            scaleY: rect.height / canvas.height
          };
        });
        expect(asteroidsScale.scaleX).toBeCloseTo(1, 2);
        expect(asteroidsScale.scaleY).toBeCloseTo(1, 2);
      } finally {
        await asteroidsPage.close();
      }
      await expect(page.locator("#objectASelect")).toContainText("Asteroids Ship");
      await expect(page.locator("#objectBSelect")).toContainText("Large Asteroid");
      await page.locator("#objectASelect").selectOption("object.asteroids.ship");
      await page.locator("#objectBSelect").selectOption("object.asteroids.large-asteroid");
      await expect(page.locator("#collisionModeSelect")).toHaveValue("vector");
      await expect(page.locator("#collisionResultBadge")).toHaveText("No Collision");
      await expect(page.locator("#overlapState")).toHaveText("false");
      await expect(page.locator("#originState")).toHaveText("Origins:\nA 360.000,320.000\nB 500.000,320.000");
      await expect(page.locator("#rotationState")).toHaveText("A 0 / B 0");
      await expect(page.locator("#collisionSummary")).toContainText('"enginePath": "src/engine/collision/objectVector.js"');
      await expect(page.locator("#collisionSummary")).toContainText('"objectOrigins"');
      await expect(page.locator("#collisionSummary")).toContainText('"recommendedMode": "vector"');
      await expect(page.locator("#collisionSummary")).toContainText('"transformedPoints"');
      await expect(page.locator("#resultContent #collisionSummary")).toHaveCount(0);
      await expect(page.locator("#collisionSummaryContent #collisionSummary")).toBeVisible();
      await expect(page.locator("#resultContent")).not.toContainText("Mode");
      await expect(page.locator(".collision-inspector-v2__legend")).toContainText("Heading");
      await expect(page.locator(".collision-inspector-v2__legend span").nth(3)).toHaveAttribute("title", "Heading guide shows object rotation from its origin.");
      await expect(page.locator("#collisionCanvas")).toHaveAttribute("aria-describedby", "collisionGuideNote");
      await expect(page.locator("#collisionGuideNote")).toHaveText("Heading guides show each object's rotation from its origin.");
      const summaryOverflow = await page.locator("#collisionSummaryContent").evaluate((element) => getComputedStyle(element).overflowY);
      expect(["auto", "scroll"]).toContain(summaryOverflow);
      const resultOverflow = await page.locator("#resultContent").evaluate((element) => getComputedStyle(element).overflowY);
      expect(["auto", "scroll"]).toContain(resultOverflow);
      const outputLayout = await page.evaluate(() => {
        const manifest = document.querySelector(".collision-inspector-v2__panel--left .collision-inspector-v2__accordion:nth-of-type(1)").getBoundingClientRect();
        const pair = document.querySelector(".collision-inspector-v2__panel--left .collision-inspector-v2__accordion:nth-of-type(2)").getBoundingClientRect();
        const result = document.querySelector(".collision-inspector-v2__accordion--result").getBoundingClientRect();
        const summary = document.querySelector(".collision-inspector-v2__accordion--summary").getBoundingClientRect();
        const logs = document.querySelector(".collision-inspector-v2__accordion--logs").getBoundingClientRect();
        const heights = [result.height, summary.height, logs.height];
        return {
          logContentHeight: document.querySelector("#collisionLogContent").getBoundingClientRect().height,
          inputMaxDelta: Math.abs(manifest.height - pair.height),
          maxDelta: Math.max(...heights) - Math.min(...heights),
          resultContentHeight: document.querySelector("#resultContent").getBoundingClientRect().height,
          resultWidth: result.width,
          summaryContentHeight: document.querySelector("#collisionSummaryContent").getBoundingClientRect().height,
          summaryWidth: summary.width,
          logsWidth: logs.width
        };
      });
      expect(outputLayout.inputMaxDelta).toBeLessThanOrEqual(6);
      expect(outputLayout.maxDelta).toBeLessThanOrEqual(6);
      expect(outputLayout.resultContentHeight).toBeGreaterThan(80);
      expect(outputLayout.summaryContentHeight).toBeGreaterThan(80);
      expect(outputLayout.logContentHeight).toBeGreaterThan(80);
      expect(Math.abs(outputLayout.resultWidth - outputLayout.summaryWidth)).toBeLessThanOrEqual(1);
      expect(Math.abs(outputLayout.summaryWidth - outputLayout.logsWidth)).toBeLessThanOrEqual(1);
      await expect(page.locator("button[aria-controls='collisionLogContent']")).toBeVisible();
      await page.locator("button[aria-controls='collisionLogContent']").click();
      await expect(page.locator("#collisionLogContent")).toBeHidden();
      await page.locator("button[aria-controls='collisionLogContent']").click();
      await expect(page.locator("#collisionLogContent")).toBeVisible();

      const initialSummary = await readCollisionSummary(page);
      const initialSignature = await canvasSignature(page);
      await page.locator("#objectARotationInput").fill("45");
      await expect(page.locator("#rotationState")).toHaveText("A 45 / B 0");
      const rotatedASummary = await readCollisionSummary(page);
      expect(rotatedASummary.enginePath).toBe("src/engine/collision/objectVector.js");
      expect(rotatedASummary.rotation.objectA).toBe(45);
      expect(rotatedASummary.rotation.objectB).toBe(0);
      expect(rotatedASummary.transformedPoints.objectA).not.toEqual(initialSummary.transformedPoints.objectA);
      expect(await canvasSignature(page)).not.toBe(initialSignature);
      await page.locator("#objectBRotationInput").fill("180");
      await expect(page.locator("#rotationState")).toHaveText("A 45 / B 180");
      const rotatedBSummary = await readCollisionSummary(page);
      expect(rotatedBSummary.enginePath).toBe("src/engine/collision/objectVector.js");
      expect(rotatedBSummary.rotation.objectA).toBe(45);
      expect(rotatedBSummary.rotation.objectB).toBe(180);
      expect(rotatedBSummary.transformedPoints.objectB).not.toEqual(initialSummary.transformedPoints.objectB);
      await page.locator("#objectARotationInput").fill("0");
      await expect(page.locator("#rotationState")).toHaveText("A 0 / B 180");

      await dragCanvasPoint(page, { x: 500, y: 320 }, { x: 360, y: 320 });
      await expect(page.locator("#collisionResultBadge")).toHaveText("Collision");
      await expect(page.locator("#overlapState")).toHaveText("true");
      await expect(page.locator("#collisionSummary")).toContainText('"mode": "vector"');
      await expect(page.locator("#collisionLog")).toHaveValue(/Dragged Object B/);

      await page.locator("#collisionModeSelect").selectOption("pixel-sprite");
      await expect(page.locator("#collisionResultBadge")).toHaveText("Collision");
      await expect(page.locator("#collisionSummary")).toContainText('"manualModeOverride": true');
      await expect(page.locator("#collisionSummary")).toContainText('"mode": "pixel-sprite"');

      await page.locator("#collisionModeSelect").selectOption("bounds");
      await expect(page.locator("#boundsState")).toHaveText("overlap");
      await expect(page.locator("#collisionResultBadge")).toHaveText("Collision");

      await page.locator("#collisionModeSelect").selectOption("hybrid");
      await expect(page.locator("#collisionSummary")).toContainText('"mode": "hybrid"');
      await expect(page.locator("#collisionResultBadge")).toHaveText("Collision");

      await page.locator("#collisionZoomInput").fill("1.5");
      await expect(page.locator("#zoomState")).toHaveText("1.5x");
      await expect(page.locator("#collisionSummary")).toContainText('"zoom": 1.5');
      await expect(page.locator("#collisionZoomInput")).toHaveAttribute("max", "5");
      await page.locator("#collisionZoomInput").fill("5");
      await expect(page.locator("#zoomState")).toHaveText("5x");
      await expect(page.locator("#collisionSummary")).toContainText('"zoom": 5');
      const zoomAspectRatio = await page.locator("#collisionCanvas").evaluate((canvas) => {
        const rect = canvas.getBoundingClientRect();
        return rect.width / rect.height;
      });
      expect(Math.abs(zoomAspectRatio - (960 / 720))).toBeLessThan(0.02);
      await page.evaluate(() => window.__collisionInspectorV2App.setZoom(8));
      await expect(page.locator("#zoomState")).toHaveText("5x");
      await expect(page.locator("#collisionSummary")).toContainText('"zoom": 5');

      await page.locator("#resetSimulationButton").click();
      await expect(page.locator("#collisionResultBadge")).toHaveText("No Collision");
      await expect(page.locator("#collisionModeSelect")).toHaveValue("vector");
      await expect(page.locator("#rotationState")).toHaveText("A 0 / B 0");
      await page.evaluate(() => window.__collisionInspectorV2App.shell.applyFullscreenState(true));
      await expect(page.locator("body")).toHaveClass(/tools-platform-fullscreen-active/);
      const fullscreenLayout = await page.evaluate(() => {
        const root = document.querySelector(".collision-inspector-v2.app-shell").getBoundingClientRect();
        const left = document.querySelector(".collision-inspector-v2__panel--left").getBoundingClientRect();
        const center = document.querySelector(".collision-inspector-v2__panel--center").getBoundingClientRect();
        const right = document.querySelector(".collision-inspector-v2__panel--right").getBoundingClientRect();
        return {
          centerAfterLeft: center.left >= left.right,
          centerFills: center.width > 400,
          leftAtSide: left.left <= root.left + 10,
          rightAfterCenter: right.left >= center.right,
          rightAtSide: right.right >= root.right - 10,
          rootWidth: root.width,
          viewportWidth: window.innerWidth
        };
      });
      expect(fullscreenLayout.rootWidth).toBeGreaterThanOrEqual(fullscreenLayout.viewportWidth - 2);
      expect(fullscreenLayout.leftAtSide).toBe(true);
      expect(fullscreenLayout.centerAfterLeft).toBe(true);
      expect(fullscreenLayout.centerFills).toBe(true);
      expect(fullscreenLayout.rightAfterCenter).toBe(true);
      expect(fullscreenLayout.rightAtSide).toBe(true);
      await page.evaluate(() => window.__collisionInspectorV2App.shell.applyFullscreenState(false));
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("hard fails when manifest screen dimensions are missing", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await coverageReporter.start(page);
    try {
      await page.route((url) => url.pathname === "/missing-screen-manifest.json", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            game: { name: "Missing Screen Dimensions" },
            tools: {
              "object-vector-studio-v2": {
                objects: []
              }
            }
          })
        });
      });
      await page.goto(`${server.baseUrl}/tools/collision-inspector-v2/index.html?manifestPath=/missing-screen-manifest.json`, { waitUntil: "networkidle" });

      await expect(page.locator("#manifestSummary")).toContainText("root.screen.width");
      await expect(page.locator("#manifestSummary")).toContainText("root.screen.height");
      await expect(page.locator("#collisionResultBadge")).toHaveText("Manifest Error");
      await expect(page.locator("#collisionSummary")).toContainText('"required": "root.screen.width and root.screen.height"');
      await expect(page.locator("#collisionLog")).toHaveValue(/FAIL URL manifest path/);
      await expect(page.locator("#objectASelect option")).toHaveCount(0);
      await expect(page.locator("#objectBSelect option")).toHaveCount(0);
      await expect(page.locator("#collisionCanvas")).toHaveAttribute("width", "1");
      await expect(page.locator("#collisionCanvas")).toHaveAttribute("height", "1");
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("loads Asteroids Object Vector objects from a Workspace Manager V2 manifest context", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await coverageReporter.start(page);
    try {
      const gameManifest = JSON.parse(await readFile(join(server.repoRoot, "games", "Asteroids", "game.manifest.json"), "utf8"));
      const workspaceContext = {
        $schema: "tools/schemas/workspace.manifest.schema.json",
        documentKind: "workspace-manifest",
        schema: "html-js-gaming.project",
        version: 1,
        id: "workspace-manager-v2-Asteroids",
        gameId: "Asteroids",
        gameRoot: "games/Asteroids/",
        assetsPath: "games/Asteroids/assets",
        name: "Asteroids Workspace Manager V2 Context",
        screen: gameManifest.screen,
        tools: gameManifest.tools
      };
      await page.addInitScript((context) => {
        sessionStorage.setItem("workspace-manager-v2-collision-test", JSON.stringify(context));
        sessionStorage.setItem("workspace-manager-v2-return-history-context-id", "different-context");
      }, workspaceContext);
      await page.goto(`${server.baseUrl}/tools/collision-inspector-v2/index.html?launch=workspace&fromTool=workspace-manager-v2&hostContextId=workspace-manager-v2-collision-test`, { waitUntil: "networkidle" });

      await expect(page.locator("nav.tool-starter__workspace__menu[data-launch-mode-nav='workspace']")).toBeVisible();
      await expect(page.locator("nav.tool-starter__tool__menu[data-launch-mode-nav='tool']")).toBeHidden();
      await expect(page.locator("#collisionManifestInput")).toBeDisabled();
      await expect(page.locator("#manifestSummary")).toContainText("Asteroids Workspace Manager V2 Context");
      await expect(page.locator("#manifestSummary")).toContainText("screen 960x720");
      await expect(page.locator("#objectASelect")).toContainText("Asteroids Ship");
      await expect(page.locator("#objectBSelect")).toContainText("Large Asteroid");
      await page.locator("#objectASelect").selectOption("object.asteroids.large-ufo");
      await page.locator("#objectBSelect").selectOption("object.asteroids.small-ufo");
      await page.locator("#objectARotationInput").fill("180");
      await expect(page.locator("#rotationState")).toHaveText("A 180 / B 0");
      await expect(page.locator("#collisionSummary")).toContainText('"objectA": "Large UFO (object.asteroids.large-ufo)"');
      await expect(page.locator("#collisionSummary")).toContainText('"shapeRotationsA"');
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/\/tools\/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-collision-test/);
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });
});
