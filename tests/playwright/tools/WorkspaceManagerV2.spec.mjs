import { expect, test } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

async function openWorkspaceManagerV2(page, query = "") {
  const server = await startRepoServer();
  await installMockRepoPicker(page);
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/workspace-manager-v2/index.html${query}`, { waitUntil: "networkidle" });
  return server;
}

async function openAssetManagerV2(page, query = "") {
  const server = await startRepoServer();
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/asset-manager-v2/index.html${query}`, { waitUntil: "networkidle" });
  return server;
}

async function openPreviewGeneratorV2(page, query = "") {
  const server = await startRepoServer();
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/preview-generator-v2/index.html${query}`, { waitUntil: "networkidle" });
  return server;
}

async function openTextToSpeechTool(page, query = "", speechOptions = {}) {
  const server = await startRepoServer();
  await installMockSpeechSynthesis(page, speechOptions);
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/text2speech-V2/index.html${query}`, { waitUntil: "networkidle" });
  return server;
}

async function openTextToSpeechSample1903(page) {
  const server = await startRepoServer();
  await installMockSpeechSynthesis(page);
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/samples/phase-19/1903/index.html`, { waitUntil: "networkidle" });
  return server;
}

async function selectTextToSpeechTile(page, itemId) {
  await page.locator(`[data-speech-item-id="${itemId}"]`).click();
}

const TEXT_TO_SPEECH_SAMPLE_PRESET_PATH = "/samples/phase-19/1903/sample.1903.text2speech-V2.json";
const TEXT_TO_SPEECH_SAMPLE_QUERY = `?samplePresetPath=${encodeURIComponent(TEXT_TO_SPEECH_SAMPLE_PRESET_PATH)}`;
const TEXT_TO_SPEECH_SAMPLE_ITEM_IDS = ["narrator-welcome", "hero-ready", "alert-warning", "alert-warning-2"];
const DEFAULT_MOCK_GAME_OPTIONS = ["Select a game", "Asteroids", "Gravity Well", "Pong"];
const ALL_REPO_GAME_MANIFEST_PATHS = [
  "/games/AITargetDummy/game.manifest.json",
  "/games/Asteroids/game.manifest.json",
  "/games/Bouncing-ball/game.manifest.json",
  "/games/Breakout/game.manifest.json",
  "/games/GravityWell/game.manifest.json",
  "/games/Pacman/game.manifest.json",
  "/games/Pong/game.manifest.json",
  "/games/SolarSystem/game.manifest.json",
  "/games/SpaceDuel/game.manifest.json",
  "/games/SpaceInvaders/game.manifest.json",
  "/games/vector-arcade-sample/game.manifest.json"
];
const ALL_REPO_GAME_OPTIONS = [
  "Select a game",
  "AI Target Dummy",
  "Asteroids",
  "Bouncing Ball",
  "Breakout",
  "Gravity Well",
  "Pacman",
  "Pong",
  "Solar System",
  "Space Duel",
  "Space Invaders Next",
  "Vector Arcade Sample"
];

async function openToolsIndex(page) {
  const server = await startRepoServer();
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/index.html`, { waitUntil: "networkidle" });
  return server;
}

async function openStorageInspectorV2(page, query = "") {
  const server = await startRepoServer();
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/storage-inspector-v2/index.html${query}`, { waitUntil: "networkidle" });
  return server;
}

async function openInputMappingV2(page, query = "") {
  const server = await startRepoServer();
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/input-mapping-v2/index.html${query}`, { waitUntil: "networkidle" });
  return server;
}

function manifestRepoPath(server) {
  return server.repoRoot.replaceAll("\\", "/");
}

function displayRepoRootPath(server) {
  return server.repoRoot.replaceAll("/", "\\").replace(/\\+$/, "");
}

function displayAbsoluteOutputPath(server, relativePath) {
  return `${displayRepoRootPath(server)}\\${relativePath.replaceAll("/", "\\")}`;
}

async function objectVectorLogicalClientPoint(page, x, y) {
  return page.locator("#objectVectorStudioV2RenderSurface").evaluate((surface, point) => {
    const bounds = surface.getBoundingClientRect();
    const [viewX, viewY, viewWidth, viewHeight] = surface.getAttribute("viewBox").split(/\s+/).map(Number);
    const drawingX = point.x * 10;
    const drawingY = point.y * 10;
    return {
      x: bounds.left + ((drawingX - viewX) / viewWidth) * bounds.width,
      y: bounds.top + ((drawingY - viewY) / viewHeight) * bounds.height
    };
  }, { x, y });
}

async function clickObjectVectorLogicalPoint(page, x, y, options = {}) {
  const point = await objectVectorLogicalClientPoint(page, x, y);
  await page.evaluate(({ eventOptions, point }) => {
    const surface = document.querySelector("#objectVectorStudioV2RenderSurface");
    const pointerInit = {
      bubbles: true,
      button: eventOptions.button ?? 0,
      buttons: 1,
      cancelable: true,
      clientX: point.x,
      clientY: point.y,
      pointerId: 1,
      pointerType: "mouse"
    };
    surface.dispatchEvent(new PointerEvent("pointerdown", pointerInit));
    surface.dispatchEvent(new PointerEvent("pointerup", { ...pointerInit, buttons: 0 }));
  }, { eventOptions: options, point });
}

async function mouseClickObjectVectorLogicalPoint(page, x, y, options = {}) {
  const point = await objectVectorLogicalClientPoint(page, x, y);
  await page.mouse.click(point.x, point.y, options);
}

async function doubleClickObjectVectorLogicalPoint(page, x, y) {
  const point = await objectVectorLogicalClientPoint(page, x, y);
  await page.evaluate((clientPoint) => {
    const surface = document.querySelector("#objectVectorStudioV2RenderSurface");
    surface.dispatchEvent(new MouseEvent("dblclick", {
      bubbles: true,
      button: 0,
      cancelable: true,
      clientX: clientPoint.x,
      clientY: clientPoint.y
    }));
  }, point);
}

async function dragObjectVectorLogicalPoints(page, start, end) {
  const startPoint = await objectVectorLogicalClientPoint(page, start.x, start.y);
  const endPoint = await objectVectorLogicalClientPoint(page, end.x, end.y);
  await page.evaluate(({ endPoint, startPoint }) => {
    const surface = document.querySelector("#objectVectorStudioV2RenderSurface");
    const pointerInit = {
      bubbles: true,
      button: 0,
      buttons: 1,
      cancelable: true,
      pointerId: 1,
      pointerType: "mouse"
    };
    surface.dispatchEvent(new PointerEvent("pointerdown", { ...pointerInit, clientX: startPoint.x, clientY: startPoint.y }));
    window.dispatchEvent(new PointerEvent("pointermove", { ...pointerInit, clientX: endPoint.x, clientY: endPoint.y }));
    window.dispatchEvent(new PointerEvent("pointerup", { ...pointerInit, buttons: 0, clientX: endPoint.x, clientY: endPoint.y }));
  }, { endPoint, startPoint });
}

async function dragObjectVectorHandleToLogicalPoint(page, selector, start, end) {
  const startPoint = await objectVectorLogicalClientPoint(page, start.x, start.y);
  const endPoint = await objectVectorLogicalClientPoint(page, end.x, end.y);
  await page.evaluate(({ endPoint, selector, startPoint }) => {
    const handle = document.querySelector(selector);
    if (!handle) {
      throw new Error(`Missing Object Vector handle: ${selector}`);
    }
    const pointerInit = {
      bubbles: true,
      button: 0,
      buttons: 1,
      cancelable: true,
      pointerId: 1,
      pointerType: "mouse"
    };
    handle.dispatchEvent(new PointerEvent("pointerdown", { ...pointerInit, clientX: startPoint.x, clientY: startPoint.y }));
    window.dispatchEvent(new PointerEvent("pointermove", { ...pointerInit, clientX: endPoint.x, clientY: endPoint.y }));
    window.dispatchEvent(new PointerEvent("pointerup", { ...pointerInit, buttons: 0, clientX: endPoint.x, clientY: endPoint.y }));
  }, { endPoint, selector, startPoint });
}

async function mouseDragObjectVectorLogicalPoints(page, start, end) {
  const startPoint = await objectVectorLogicalClientPoint(page, start.x, start.y);
  const endPoint = await objectVectorLogicalClientPoint(page, end.x, end.y);
  await page.mouse.move(startPoint.x, startPoint.y);
  await page.mouse.down();
  await page.mouse.move(endPoint.x, endPoint.y, { steps: 4 });
  await page.mouse.up();
}

async function moveObjectVectorLogicalPoint(page, point) {
  const clientPoint = await objectVectorLogicalClientPoint(page, point.x, point.y);
  await page.evaluate((targetPoint) => {
    const pointerInit = {
      bubbles: true,
      button: 0,
      buttons: 0,
      cancelable: true,
      clientX: targetPoint.x,
      clientY: targetPoint.y,
      pointerId: 1,
      pointerType: "mouse"
    };
    window.dispatchEvent(new PointerEvent("pointermove", pointerInit));
  }, clientPoint);
}

async function drawObjectVectorShape(page, tool, points) {
  await page.locator(`[data-shape-tool="${tool}"]`).click();
  if (["line", "rectangle", "square", "circle", "ellipse", "arc", "text", "triangle"].includes(tool)) {
    const endPoint = points[1] || points[0];
    await clickObjectVectorLogicalPoint(page, points[0].x, points[0].y);
    await moveObjectVectorLogicalPoint(page, endPoint);
    await clickObjectVectorLogicalPoint(page, endPoint.x, endPoint.y);
    return;
  }
  if (tool === "polygon" || tool === "polyline") {
    for (const point of points) {
      await clickObjectVectorLogicalPoint(page, point.x, point.y);
    }
    await page.keyboard.press("Enter");
    return;
  }
}

async function drawDefaultObjectVectorShape(page, tool) {
  const defaults = {
    arc: [{ x: 0, y: 70 }, { x: 40, y: 70 }],
    circle: [{ x: 70, y: -10 }, { x: 100, y: -10 }],
    ellipse: [{ x: 20, y: 40 }, { x: 120, y: 100 }],
    line: [{ x: -100, y: 80 }, { x: 0, y: 30 }],
    polygon: [{ x: 0, y: -80 }, { x: 76, y: -25 }, { x: 47, y: 65 }, { x: -47, y: 65 }, { x: -76, y: -25 }],
    polyline: [{ x: -40, y: 0 }, { x: 0, y: -30 }, { x: 40, y: 0 }],
    rectangle: [{ x: -80, y: -30 }, { x: 0, y: 30 }],
    square: [{ x: -80, y: -30 }, { x: -20, y: 30 }],
    text: [{ x: -35, y: 35 }, { x: -30, y: 40 }],
    triangle: [{ x: -40, y: -80 }, { x: 40, y: -10 }]
  };
  await drawObjectVectorShape(page, tool, defaults[tool]);
}

const MOCK_TEXT2SPEECH_LANGUAGE_VALUES = [
  "de-DE",
  "en-GB",
  "en-US",
  "es-ES",
  "es-US",
  "fr-FR",
  "hi-IN",
  "id-ID",
  "it-IT",
  "ja-JP",
  "ko-KR",
  "nl-NL",
  "pl-PL",
  "pt-BR",
  "ru-RU",
  "zh-CN",
  "zh-HK",
  "zh-TW"
];

const MOCK_TEXT2SPEECH_EN_US_VOICE_VALUES = [
  "mock-google-us-english",
  "mock-microsoft-david",
  "mock-microsoft-mark",
  "mock-microsoft-zira"
];

const MOCK_TEXT2SPEECH_EN_US_DETAILS = [
  "4 voices match Any:",
  "- en-US: Google US English",
  "- en-US: Microsoft David - English (United States)",
  "- en-US: Microsoft Mark - English (United States)",
  "- en-US: Microsoft Zira - English (United States)"
].join("\n");

const MOCK_TEXT2SPEECH_GENDER_FILTER_VALUES = ["any", "male-preferred", "female-preferred", "neutral"];
const MOCK_TEXT2SPEECH_SCHEMA_GENDER_VALUES = ["any", "male-preferred", "female-preferred"];

const MOCK_TEXT2SPEECH_AGE_FILTER_VALUES = ["any", "adult", "child", "elderly", "teen"];

const MOCK_TEXT2SPEECH_FEMALE_LANGUAGE_VALUES = ["en-GB", "en-US"];

const MOCK_TEXT2SPEECH_MALE_LANGUAGE_VALUES = ["en-GB", "en-US", "es-ES"];

const REQUIRED_TEXT2SPEECH_OPTION_FIELDS = [
  "id",
  "name",
  "text",
  "gender",
  "language",
  "voice",
  "voiceAge",
  "volume",
  "rate",
  "pitch",
  "characterPreset",
  "ssmlLikePreset"
];

async function installMockRepoPicker(page) {
  await page.addInitScript(() => {
    const defaultManifestPaths = [
      "/games/Asteroids/game.manifest.json",
      "/games/GravityWell/game.manifest.json",
      "/games/Pong/game.manifest.json"
    ];

    function appendManifestWrite(path, contents) {
      const writes = JSON.parse(window.sessionStorage.getItem("workspace.repo.manifestWrites") || "[]");
      writes.push({ path, contents });
      window.sessionStorage.setItem("workspace.repo.manifestWrites", JSON.stringify(writes));
    }

    function appendPreviewWrite(path, contents, details = {}) {
      const writes = JSON.parse(window.sessionStorage.getItem("workspace.repo.writes") || "[]");
      writes.push({
        path,
        contents,
        lastModified: details.lastModified,
        size: details.size
      });
      window.sessionStorage.setItem("workspace.repo.writes", JSON.stringify(writes));
    }

    function makeFileHandle(name, text, path = name, options = {}) {
      let contents = text;
      let lastModified = Date.now();
      return {
        kind: "file",
        name,
        path,
        async createWritable() {
          let draft = "";
          return {
            async write(value) {
              if (typeof value === "string") {
                draft += value;
                return;
              }
              if (value instanceof Blob) {
                draft += await value.text();
                return;
              }
              draft += String(value ?? "");
            },
            async close() {
              contents = draft;
              lastModified += 1000;
              if (path.endsWith("/game.manifest.json")) {
                appendManifestWrite(path, contents);
              } else {
                appendPreviewWrite(path, contents, {
                  lastModified,
                  size: contents.length
                });
              }
            }
          };
        },
        async getFile() {
          if (options.failPreviewRead && path.endsWith("/preview.svg")) {
            throw new Error("Mock preview read failed.");
          }
          const type = path.endsWith(".svg") ? "image/svg+xml" : "application/json";
          return new File([contents], name, { lastModified, type });
        }
      };
    }

    function makeDirectoryHandle(name, children = {}, path = name, options = {}) {
      return {
        kind: "directory",
        name,
        path,
        repoPath: options.repoPath || "",
        async getDirectoryHandle(childName, handleOptions = {}) {
          const child = children[childName];
          if (child?.kind === "directory") {
            return child;
          }
          if (handleOptions.create) {
            const created = makeDirectoryHandle(childName, {}, `${path}/${childName}`, options);
            children[childName] = created;
            return created;
          }
          throw new DOMException(`${childName} was not found.`, "NotFoundError");
        },
        async getFileHandle(childName, handleOptions = {}) {
          const child = children[childName];
          if (child?.kind === "file") {
            return child;
          }
          if (handleOptions.create) {
            const created = makeFileHandle(childName, "", `${path}/${childName}`, options);
            children[childName] = created;
            return created;
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
        return makeDirectoryHandle(repoName, {}, repoName, config);
      }
      const games = {
        MissingManifest: makeDirectoryHandle("MissingManifest", {}, `${repoName}/games/MissingManifest`, config),
        InvalidWorkspace: makeDirectoryHandle("InvalidWorkspace", {
          "game.manifest.json": makeFileHandle("game.manifest.json", JSON.stringify({
            schema: "html-js-gaming.project",
            version: 1,
            tools: {}
          }), `${repoName}/games/InvalidWorkspace/game.manifest.json`, config)
        }, `${repoName}/games/InvalidWorkspace`, config)
      };
      for (const manifestPath of (config.manifestPaths || defaultManifestPaths)) {
        const parts = manifestPath.replace(/^\/+/, "").split("/");
        const gameFolder = parts[1];
        const gamePath = `${repoName}/games/${gameFolder}`;
        const imageChildren = {};
        const previewConfig = config.previewFiles?.[gameFolder];
        if (typeof previewConfig === "string") {
          imageChildren["preview.svg"] = makeFileHandle("preview.svg", previewConfig, `${gamePath}/assets/images/preview.svg`, config);
        } else if (previewConfig && typeof previewConfig === "object" && !Array.isArray(previewConfig)) {
          Object.entries(previewConfig).forEach(([previewFileName, contents]) => {
            imageChildren[previewFileName] = makeFileHandle(previewFileName, String(contents || ""), `${gamePath}/assets/images/${previewFileName}`, config);
          });
        }
        games[gameFolder] = makeDirectoryHandle(gameFolder, {
          assets: makeDirectoryHandle("assets", {
            images: makeDirectoryHandle("images", imageChildren, `${gamePath}/assets/images`, config)
          }, `${gamePath}/assets`, config),
          "game.manifest.json": makeFileHandle("game.manifest.json", await fetchManifestText(manifestPath), `${gamePath}/game.manifest.json`, config)
        }, gamePath, config);
      }
      return makeDirectoryHandle(repoName, {
        games: makeDirectoryHandle("games", games, `${repoName}/games`, config),
        tools: makeDirectoryHandle("tools", {}, `${repoName}/tools`, config)
      }, repoName, config);
    }

    window.__workspaceManagerV2MockRepoConfig = {};
    window.__workspaceManagerV2RepoHandleCache = {
      async save({ reference, repoHandle }) {
        const config = window.__workspaceManagerV2MockRepoConfig || {};
        window.sessionStorage.setItem("workspace-manager-v2-mock-repo-handle-cache", JSON.stringify({
          failPreviewRead: Boolean(config.failPreviewRead),
          repoName: reference?.displayName || repoHandle?.name || "HTML-JavaScript-Gaming",
          repoPath: repoHandle?.repoPath || config.repoPath || ""
        }));
      },
      async restore({ reference }) {
        const rawValue = window.sessionStorage.getItem("workspace-manager-v2-mock-repo-handle-cache");
        const cachedConfig = rawValue ? JSON.parse(rawValue) : {};
        return await makeMockRepoHandle({
          failPreviewRead: Boolean(cachedConfig.failPreviewRead),
          repoPath: cachedConfig.repoPath || "",
          repoName: cachedConfig.repoName || reference?.displayName || "HTML-JavaScript-Gaming"
        });
      }
    };
    window.showDirectoryPicker = async () => {
      if (window.__workspaceManagerV2MockRepoConfig?.failPicker) {
        throw new DOMException("Mock picker canceled.", "AbortError");
      }
      return await makeMockRepoHandle(window.__workspaceManagerV2MockRepoConfig || {});
    };
  });
}

async function installMockSpeechSynthesis(page, { includeAgeVoice = false, includeNeutralVoice = false, voicesInitiallyAvailable = true } = {}) {
  await page.addInitScript((config) => {
    const voiceListeners = new Set();
    const voiceOptions = [
      { lang: "en-US", name: "Microsoft David - English (United States)", voiceURI: "mock-microsoft-david" },
      { lang: "en-US", name: "Microsoft Mark - English (United States)", voiceURI: "mock-microsoft-mark" },
      { lang: "en-US", name: "Microsoft Zira - English (United States)", voiceURI: "mock-microsoft-zira" },
      { lang: "de-DE", name: "Google Deutsch", voiceURI: "mock-google-deutsch" },
      { lang: "en-US", name: "Google US English", voiceURI: "mock-google-us-english" },
      { lang: "en-GB", name: "Google UK English Female", voiceURI: "mock-google-uk-english-female" },
      { lang: "en-GB", name: "Google UK English Male", voiceURI: "mock-google-uk-english-male" },
      { lang: "es-ES", name: "Google espanol", voiceURI: "mock-google-espanol" },
      { lang: "es-US", name: "Google espanol de Estados Unidos", voiceURI: "mock-google-espanol-us" },
      { lang: "fr-FR", name: "Google francais", voiceURI: "mock-google-francais" },
      { lang: "hi-IN", name: "Google Hindi", voiceURI: "mock-google-hindi" },
      { lang: "id-ID", name: "Google Bahasa Indonesia", voiceURI: "mock-google-bahasa-indonesia" },
      { lang: "it-IT", name: "Google italiano", voiceURI: "mock-google-italiano" },
      { lang: "ja-JP", name: "Google Japanese", voiceURI: "mock-google-japanese" },
      { lang: "ko-KR", name: "Google Korean", voiceURI: "mock-google-korean" },
      { lang: "nl-NL", name: "Google Nederlands", voiceURI: "mock-google-nederlands" },
      { lang: "pl-PL", name: "Google polski", voiceURI: "mock-google-polski" },
      { lang: "pt-BR", name: "Google portugues do Brasil", voiceURI: "mock-google-portugues-brasil" },
      { lang: "ru-RU", name: "Google Russian", voiceURI: "mock-google-russian" },
      { lang: "zh-CN", name: "Google Mandarin China", voiceURI: "mock-google-mandarin-china" },
      { lang: "zh-HK", name: "Google Cantonese Hong Kong", voiceURI: "mock-google-cantonese-hong-kong" },
      { lang: "zh-TW", name: "Google Mandarin Taiwan", voiceURI: "mock-google-mandarin-taiwan" }
    ];
    if (config.includeNeutralVoice) {
      voiceOptions.push({ gender: "neutral", lang: "en-AU", name: "Studio Neutral English", voiceURI: "mock-studio-neutral-english" });
    }
    if (config.includeAgeVoice) {
      voiceOptions.push({ age: "child", lang: "en-AU", name: "Studio Child English", voiceURI: "mock-studio-child-english" });
    }
    let voicesAvailable = config.voicesInitiallyAvailable;
    window["__text2speech-V2Canceled"] = 0;
    window["__text2speech-V2Paused"] = 0;
    window["__text2speech-V2Resumed"] = 0;
    window["__text2speech-V2Spoken"] = [];
    window["__text2speech-V2LoadVoices"] = () => {
      voicesAvailable = true;
      const event = new Event("voiceschanged");
      voiceListeners.forEach((listener) => {
        listener(event);
      });
      if (typeof window.speechSynthesis.onvoiceschanged === "function") {
        window.speechSynthesis.onvoiceschanged(event);
      }
    };
    class MockSpeechSynthesisUtterance {
      constructor(text) {
        this.text = text;
        this.lang = "";
        this.pitch = 1;
        this.rate = 1;
        this.volume = 1;
        this.voice = null;
      }
    }
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: MockSpeechSynthesisUtterance
    });
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        onvoiceschanged: null,
        addEventListener(type, listener) {
          if (type === "voiceschanged" && typeof listener === "function") {
            voiceListeners.add(listener);
          }
        },
        cancel() {
          window["__text2speech-V2Canceled"] += 1;
        },
        getVoices() {
          return voicesAvailable ? voiceOptions : [];
        },
        pause() {
          window["__text2speech-V2Paused"] += 1;
        },
        removeEventListener(type, listener) {
          if (type === "voiceschanged") {
            voiceListeners.delete(listener);
          }
        },
        resume() {
          window["__text2speech-V2Resumed"] += 1;
        },
        speak(utterance) {
          window["__text2speech-V2Spoken"].push({
            lang: utterance.lang,
            pitch: utterance.pitch,
            rate: utterance.rate,
            text: utterance.text,
            voiceName: utterance.voice?.name || "",
            volume: utterance.volume
          });
        }
      }
    });
  }, { includeAgeVoice, includeNeutralVoice, voicesInitiallyAvailable });
}

async function selectMockRepo(page, { repoName = "HTML-JavaScript-Gaming", expectedGameOptions = DEFAULT_MOCK_GAME_OPTIONS, ...config } = {}) {
  await page.evaluate(({ nextConfig, nextRepoName }) => {
    window.__workspaceManagerV2MockRepoConfig = { ...nextConfig, repoName: nextRepoName };
  }, { nextConfig: { repoPath: process.cwd().replaceAll("\\", "/"), ...config }, nextRepoName: repoName });
  await page.locator("#pickRepoBtn").click();
  await expect(page.locator("#repoSelectedValue")).toHaveText(repoName);
  await expect(page.locator("#activeGameSelect")).toBeEnabled();
  await expect(page.locator("#activeGameSelect")).toHaveValue("");
  await expect(page.locator("#activeGameSelect option")).toHaveText(expectedGameOptions);
  await expectWorkspaceToolsDisabled(page);
}

async function expectWorkspaceToolsDisabled(page) {
  await expect(page.locator("#workspaceToolTiles [data-workspace-tool-id]")).toHaveCount(10);
  expect(await page.locator("#workspaceToolTiles [data-workspace-tool-id]").evaluateAll((tiles) => tiles.every((tile) => tile.disabled))).toBe(true);
}

async function expectWorkspaceReturnRehydrated(page, { gameId = "Asteroids", repoName = "HTML-JavaScript-Gaming" } = {}) {
  await expect(page.locator("#repoSelectedValue")).toHaveText(repoName);
  await expect(page.locator("#pickRepoBtn")).toBeDisabled();
  await expect(page.locator("#activeGameSelect")).toHaveValue(gameId);
  await expect(page.locator("#activeGameSelect")).toBeDisabled();
  await expect(page.locator('[data-workspace-tool-id="asset-manager-v2"]')).toBeEnabled();
  await expect(page.locator('[data-workspace-tool-id="collision-inspector-v2"]'))[gameId === "Asteroids" ? "toBeEnabled" : "toBeDisabled"]();
  await expect(page.locator('[data-workspace-tool-id="input-mapping-v2"]')).toBeEnabled();
  await expect(page.locator('[data-workspace-tool-id="object-vector-studio-v2"]'))[gameId === "Asteroids" ? "toBeEnabled" : "toBeDisabled"]();
  await expect(page.locator('[data-workspace-tool-id="palette-manager-v2"]')).toBeEnabled();
  await expect(page.locator('[data-workspace-tool-id="preview-generator-v2"]')).toBeEnabled();
  await expect(page.locator('[data-workspace-tool-id="storage-inspector-v2"]')).toBeEnabled();
  await expect(page.locator('[data-workspace-tool-id="text2speech-V2"]')).toBeEnabled();
  await expect(page.locator('[data-workspace-tool-id="world-vector-studio-v2"]')).toBeEnabled();
}

async function expectWorkspaceRestoreRequiresRepoRebind(page, { dirty = false, gameId = "Asteroids", repoName = "HTML-JavaScript-Gaming" } = {}) {
  await expect(page.locator("#repoSelectedValue")).toHaveText(repoName);
  await expect(page.locator("#pickRepoBtn")).toBeEnabled();
  await expect(page.locator("#activeGameSelect")).toHaveValue(gameId);
  await expect(page.locator("#activeGameSelect")).toBeDisabled();
  await expect(page.locator("#saveWorkspaceButton")).toBeDisabled();
  await expect(page.locator("#closeWorkspaceButton"))[dirty ? "toBeDisabled" : "toBeEnabled"]();
  await expect(page.locator("#cancelWorkspaceButton"))[dirty ? "toBeEnabled" : "toBeDisabled"]();
  await expect(page.locator('[data-workspace-tool-id="asset-manager-v2"]')).toBeDisabled();
  await expect(page.locator('[data-workspace-tool-id="collision-inspector-v2"]')).toBeDisabled();
  await expect(page.locator('[data-workspace-tool-id="input-mapping-v2"]')).toBeDisabled();
  await expect(page.locator('[data-workspace-tool-id="object-vector-studio-v2"]')).toBeDisabled();
  await expect(page.locator('[data-workspace-tool-id="palette-manager-v2"]')).toBeDisabled();
  await expect(page.locator('[data-workspace-tool-id="preview-generator-v2"]')).toBeDisabled();
  await expect(page.locator('[data-workspace-tool-id="storage-inspector-v2"]')).toBeDisabled();
  await expect(page.locator('[data-workspace-tool-id="text2speech-V2"]')).toBeDisabled();
  await expect(page.locator('[data-workspace-tool-id="preview-generator-v2"]')).toContainText("Repo folder required");
  await expect(page.locator("#activeGameSummary")).toHaveCount(0);
  await expect(page.locator("#statusLog")).toHaveValue(/INFO .* Pick Repo Folder to rebind game\.manifest\.json before Save or tool launch\./);
  await expect(page.locator("#statusLog")).toHaveValue(/WARN Restored .* as read-only toolState context: missing live repo folder handle\. Required action: Pick Repo Folder to rebind .*game\.manifest\.json before Save or tool launch\./);
}

async function rebindRestoredWorkspace(page, { dirty = false, gameId = "Asteroids", repoName = "HTML-JavaScript-Gaming" } = {}) {
  await page.evaluate(({ nextRepoName, repoPath }) => {
    window.__workspaceManagerV2MockRepoConfig = { repoName: nextRepoName, repoPath };
  }, { nextRepoName: repoName, repoPath: process.cwd().replaceAll("\\", "/") });
  await page.locator("#pickRepoBtn").click();
  await expectWorkspaceReturnRehydrated(page, { gameId, repoName });
  await expect(page.locator("#saveWorkspaceButton"))[dirty ? "toBeEnabled" : "toBeDisabled"]();
  await expect(page.locator("#closeWorkspaceButton"))[dirty ? "toBeDisabled" : "toBeEnabled"]();
  await expect(page.locator("#cancelWorkspaceButton"))[dirty ? "toBeEnabled" : "toBeDisabled"]();
  await expect(page.locator("#statusLog")).toHaveValue(new RegExp(`OK Rebound restored .* toolState to /games/${gameId}/game\\.manifest\\.json after repo folder selection\\.`));
}

async function expectWorkspaceReturnedFromTool(page, options = {}) {
  const {
    dirty = false,
    gameId = "Asteroids",
    gameName = "Asteroids",
    repoName = "HTML-JavaScript-Gaming"
  } = options;
  const enabledToolCount = options.enabledToolCount ?? (gameId === "Asteroids" ? 9 : 7);
  await expectWorkspaceReturnRehydrated(page, { gameId, repoName });
  await expect(page.locator("#saveWorkspaceButton"))[dirty ? "toBeEnabled" : "toBeDisabled"]();
  await expect(page.locator("#closeWorkspaceButton"))[dirty ? "toBeDisabled" : "toBeEnabled"]();
  await expect(page.locator("#cancelWorkspaceButton"))[dirty ? "toBeEnabled" : "toBeDisabled"]();
  await expect(page.locator("#statusLog")).toHaveValue(new RegExp(`OK Return from tool restore: repo selected: ${repoName}\\.`));
  await expect(page.locator("#statusLog")).toHaveValue(new RegExp(`OK Return from tool restore: game selected: ${gameName} \\(${gameId}\\)\\.`));
  await expect(page.locator("#statusLog")).toHaveValue(new RegExp(`OK Return from tool restore: source binding active: /games/${gameId}/game\\.manifest\\.json\\.`));
  await expect(page.locator("#statusLog")).toHaveValue(new RegExp(`OK Return from tool restore: enabled tool count: ${enabledToolCount}\\.`));
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

function expectRuntimeBindingMetadata(metadata, {
  bindingSource = "game.manifest.json",
  boundManifestPath = "/games/Asteroids/game.manifest.json",
  hasLiveRepoHandle = true,
  sourceBindingState = "bound"
} = {}) {
  expect(metadata).toMatchObject({
    bindingSource,
    boundManifestPath,
    hasLiveRepoHandle,
    sourceBindingState
  });
  expect(metadata.handle).toBeUndefined();
  expect(metadata.repoHandle).toBeUndefined();
  expect(metadata.fileSystemHandle).toBeUndefined();
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function workspaceContextFromGameManifest(gameManifest, { repoPath = "", repoRoot = "" } = {}) {
  const game = gameManifest.game || {};
  const gameRoot = `games/${game.folder}/`;
  const context = {
    schema: "html-js-gaming.project",
    version: 1,
    id: `workspace-manager-v2-${game.id}`,
    name: `${game.name} Workspace Manager V2 Context`,
    gameId: game.id,
    gameRoot,
    assetsPath: `${gameRoot}assets`,
    tools: cloneJson(gameManifest.tools || {})
  };
  if (gameManifest.screen) {
    context.screen = cloneJson(gameManifest.screen);
  }
  if (repoRoot) {
    context.repoRoot = repoRoot;
  }
  if (repoPath) {
    context.repoPath = repoPath;
  }
  return context;
}

async function dirtyPaletteToolState(page, swatch) {
  await page.evaluate((nextSwatch) => {
    const app = window.__workspaceManagerV2App;
    const session = JSON.parse(window.sessionStorage.getItem("workspace.tools.palette-manager-v2"));
    session.data.swatches.push({
      ...nextSwatch,
      source: "User Added"
    });
    session.dirty = {
      isDirty: true,
      reason: "palette-updated",
      changedAt: new Date().toISOString(),
      changedKeys: [
        "data.swatches",
        `data.swatches[${session.data.swatches.length - 1}]`
      ]
    };
    window.sessionStorage.setItem("workspace.tools.palette-manager-v2", JSON.stringify(session));
    const metrics = app.contextSummaryMetrics(app.activeContext);
    app.applyContextResult({
      assetCount: metrics.assetCount,
      context: app.activeContext,
      game: app.activeGame,
      hostContextId: app.activeHostContextId,
      paletteSwatches: app.activeContext.tools["palette-manager-v2"].swatches
    }, { requiresRepoHandle: app.activeToolStateRequiresRepoHandle });
  }, swatch);
}

async function readObjectVectorWorkspaceSession(page) {
  return await page.evaluate(() => {
    const session = JSON.parse(sessionStorage.getItem("workspace.tools.object-vector-studio-v2"));
    return {
      dataText: JSON.stringify(session.data),
      dirty: session.dirty,
      objectCount: Array.isArray(session.data?.objects) ? session.data.objects.length : 0,
      session
    };
  });
}

async function resetObjectVectorWorkspaceDirty(page) {
  await page.evaluate(() => {
    const session = JSON.parse(sessionStorage.getItem("workspace.tools.object-vector-studio-v2"));
    session.dirty = {
      isDirty: false,
      reason: null,
      changedAt: null,
      changedKeys: []
    };
    sessionStorage.setItem("workspace.tools.object-vector-studio-v2", JSON.stringify(session));
  });
}

async function installMissingGamePreviewRepoPicker(page) {
  await page.addInitScript(() => {
    function makeDirectoryHandle(name, children = {}, path = name) {
      return {
        absolutePath: path === name && window.__missingGameRepoAbsolutePath ? window.__missingGameRepoAbsolutePath : "",
        children,
        kind: "directory",
        name,
        path,
        async getDirectoryHandle(childName, options = {}) {
          const child = children[childName];
          if (child?.kind === "directory") {
            return child;
          }
          if (options.create) {
            const created = makeDirectoryHandle(childName, {}, `${path}/${childName}`);
            children[childName] = created;
            return created;
          }
          throw new Error(`Missing directory: ${path}/${childName}`);
        },
        async getFileHandle(childName, options = {}) {
          const child = children[childName];
          if (child?.kind === "file") {
            return child;
          }
          if (options.create) {
            const created = {
              kind: "file",
              name: childName,
              path: `${path}/${childName}`,
              async createWritable() {
                return {
                  async write() {},
                  async close() {}
                };
              }
            };
            children[childName] = created;
            return created;
          }
          throw new Error(`Missing file: ${path}/${childName}`);
        }
      };
    }

    window.showDirectoryPicker = async () => makeDirectoryHandle("HTML-JavaScript-Gaming", {
      games: makeDirectoryHandle("games", {}, "HTML-JavaScript-Gaming/games"),
      tools: makeDirectoryHandle("tools", {}, "HTML-JavaScript-Gaming/tools")
    });
  });
}

async function expectStorageInspectorV2AccordionToggles(page, contentId) {
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

async function expectStorageInspectorV2DetailAccordionsIndependent(page) {
  const contentIds = [
    "storageInspectorV2JsonContent",
    "storageInspectorV2DataContent",
    "storageInspectorV2DirtyContent",
    "storageInspectorV2StatusContent"
  ];
  for (const contentId of contentIds) {
    const header = page.locator(`.accordion-v2__header[aria-controls="${contentId}"]`);
    const content = page.locator(`#${contentId}`);
    await expect(header).toBeVisible();
    await expect(content).toBeVisible();
    await header.click();
    await expect(content).toBeHidden();
    for (const otherContentId of contentIds.filter((entry) => entry !== contentId)) {
      await expect(page.locator(`#${otherContentId}`)).toBeVisible();
    }
    await header.click();
    await expect(content).toBeVisible();
    for (const otherContentId of contentIds.filter((entry) => entry !== contentId)) {
      await expect(page.locator(`#${otherContentId}`)).toBeVisible();
    }
  }
}

const STORAGE_INSPECTOR_V2_DETAIL_SECTIONS = [
  {
    contentId: "storageInspectorV2JsonContent",
    outputSelector: "#storageInspectorV2JsonOutput"
  },
  {
    contentId: "storageInspectorV2DataContent",
    outputSelector: "#storageInspectorV2DataOutput"
  },
  {
    contentId: "storageInspectorV2DirtyContent",
    outputSelector: "#storageInspectorV2DirtyOutput"
  },
  {
    contentId: "storageInspectorV2StatusContent",
    outputSelector: "#statusLog"
  }
];

async function setStorageInspectorV2DetailSectionsOpen(page, openContentIds) {
  const openSet = new Set(openContentIds);
  for (const { contentId } of STORAGE_INSPECTOR_V2_DETAIL_SECTIONS) {
    const header = page.locator(`.accordion-v2__header[aria-controls="${contentId}"]`);
    const content = page.locator(`#${contentId}`);
    const isOpen = await content.evaluate((element) => !element.hidden);
    if (isOpen !== openSet.has(contentId)) {
      await header.click();
    }
    if (openSet.has(contentId)) {
      await expect(content).toBeVisible();
      await expect(header).toHaveAttribute("aria-expanded", "true");
    } else {
      await expect(content).toBeHidden();
      await expect(header).toHaveAttribute("aria-expanded", "false");
    }
  }
}

async function expectStorageInspectorV2SharedDetailSpace(page, openContentIds) {
  await setStorageInspectorV2DetailSectionsOpen(page, openContentIds);
  const state = await page.evaluate((sections) => {
    const rightPanel = document.querySelector(".storage-inspector-v2__panel--right");
    const rightRect = rightPanel.getBoundingClientRect();
    const details = sections.map((sectionInfo) => {
      const content = document.querySelector(`#${sectionInfo.contentId}`);
      const section = content.closest(".storage-inspector-v2__accordion");
      const header = section.querySelector(".storage-inspector-v2__accordion-header-row") || section.querySelector(".accordion-v2__header");
      const output = document.querySelector(sectionInfo.outputSelector);
      const outputStyle = getComputedStyle(output);
      const sectionRect = section.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const outputRect = output.getBoundingClientRect();
      const isOpen = !content.hidden;
      return {
        contentId: sectionInfo.contentId,
        closedHeaderOnly: isOpen || sectionRect.height <= headerRect.height + 5,
        headerReachable: headerRect.top >= rightRect.top - 1 && headerRect.bottom <= rightRect.bottom + 1,
        isOpen,
        noHorizontalScrollbar: output.scrollWidth <= output.clientWidth + 1,
        outputHeight: isOpen ? outputRect.height : 0,
        overflowY: outputStyle.overflowY,
        wrapsLongLines: outputStyle.whiteSpace === "pre-wrap" && outputStyle.overflowWrap === "anywhere"
      };
    });
    const openDetails = details.filter((detail) => detail.isOpen);
    const totalOpenOutputHeight = openDetails.reduce((total, detail) => total + detail.outputHeight, 0);
    const expectedOpenOutputHeight = totalOpenOutputHeight / Math.max(openDetails.length, 1);
    return {
      closedSectionsHeaderOnly: details.every((detail) => detail.closedHeaderOnly),
      headersReachable: details.every((detail) => detail.headerReachable),
      openContentIds: openDetails.map((detail) => detail.contentId),
      openCount: openDetails.length,
      openOutputHeight: expectedOpenOutputHeight,
      openOutputsSplitEvenly: openDetails.every((detail) => Math.abs(detail.outputHeight - expectedOpenOutputHeight) <= 1),
      openOutputsUseInternalVerticalScroll: openDetails.every((detail) => detail.overflowY === "auto"),
      outputsHaveNoHorizontalScrollbars: openDetails.every((detail) => detail.noHorizontalScrollbar),
      outputsWrapLongLines: openDetails.every((detail) => detail.wrapsLongLines)
    };
  }, STORAGE_INSPECTOR_V2_DETAIL_SECTIONS);

  expect(state.openContentIds).toEqual(openContentIds);
  expect(state.openCount).toBe(openContentIds.length);
  expect(state.openOutputsSplitEvenly).toBe(true);
  expect(state.openOutputsUseInternalVerticalScroll).toBe(true);
  expect(state.outputsHaveNoHorizontalScrollbars).toBe(true);
  expect(state.outputsWrapLongLines).toBe(true);
  expect(state.closedSectionsHeaderOnly).toBe(true);
  expect(state.headersReachable).toBe(true);
  return state.openOutputHeight;
}

async function expectStorageInspectorV2FullscreenShell(page) {
  const summary = page.locator("[data-storage-inspector-v2-summary]");
  await summary.click();
  const enteredFullscreen = await page.waitForFunction(() => document.body.classList.contains("tools-platform-fullscreen-active"), null, { timeout: 2500 })
    .then(() => true)
    .catch(() => false);
  if (!enteredFullscreen) {
    await page.evaluate(() => {
      document.querySelector(".is-collapsible").open = false;
      window.__storageInspectorV2App.applyFullscreenState(true);
      window.__storageInspectorV2App.updateSummary();
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
      window.__storageInspectorV2App.applyFullscreenState(false);
      document.querySelector(".is-collapsible").open = true;
      window.__storageInspectorV2App.updateSummary();
    });
    await expect(page.locator("body")).not.toHaveClass(/tools-platform-fullscreen-active/);
  }
  await expect(summary).toHaveAttribute("data-tools-platform-summary-mode", "normal");
}

async function expectTextToSpeechV2FullscreenShell(page) {
  const summary = page.locator('[data-tool-summary="text2speech-V2"]');
  await page.setViewportSize({ height: 900, width: 1440 });
  await summary.click();
  const enteredFullscreen = await page.waitForFunction(() => document.body.classList.contains("tools-platform-fullscreen-active"), null, { timeout: 2500 })
    .then(() => true)
    .catch(() => false);
  if (!enteredFullscreen) {
    await page.evaluate(() => {
      document.querySelector(".is-collapsible").open = false;
      window["__text2speech-V2App"].shell.applyFullscreenState(true);
      window["__text2speech-V2App"].shell.updateSummary();
    });
  }
  await expect(page.locator("body")).toHaveClass(/tools-platform-fullscreen-active/);
  await expect(summary).toHaveAttribute("data-tools-platform-summary-mode", "fullscreen");

  const fullscreenLayout = await page.evaluate(() => {
    const root = document.querySelector(".tool-shell-common__fullscreen-root").getBoundingClientRect();
    const left = document.querySelector(".tool-shell-common__fullscreen-panel-left").getBoundingClientRect();
    const center = document.querySelector(".tool-shell-common__fullscreen-center-panel").getBoundingClientRect();
    const right = document.querySelector(".tool-shell-common__fullscreen-panel-right").getBoundingClientRect();
    const textContent = document.querySelector("#text2speech-V2TextContent").getBoundingClientRect();
    const queueContent = document.querySelector("#text2speech-V2QueueContent").getBoundingClientRect();
    const summaryAccordion = document.querySelector(".text2speech-V2__summary-accordion").getBoundingClientRect();
    const statusAccordion = document.querySelector(".text2speech-V2__status-accordion").getBoundingClientRect();
    const summaryContent = document.querySelector("#text2speech-V2SpeechSummaryContent").getBoundingClientRect();
    const speechSummary = document.querySelector("#text2speech-V2SpeechSummary").getBoundingClientRect();
    const statusLog = document.querySelector("#text2speech-V2StatusLog").getBoundingClientRect();
    const rootStyle = getComputedStyle(document.querySelector(".tool-shell-common__fullscreen-root"));
    const gap = Number.parseFloat(rootStyle.columnGap || "0");
    const horizontalPadding = Number.parseFloat(rootStyle.paddingLeft || "0") + Number.parseFloat(rootStyle.paddingRight || "0");
    const queueContentStyle = getComputedStyle(document.querySelector("#text2speech-V2QueueContent"));
    const summaryContentStyle = getComputedStyle(document.querySelector("#text2speech-V2SpeechSummaryContent"));
    const summaryStyle = getComputedStyle(document.querySelector("#text2speech-V2SpeechSummary"));
    const statusStyle = getComputedStyle(document.querySelector("#text2speech-V2StatusLog"));
    return {
      centerAfterLeft: center.left > left.right,
      centerFillsRemaining: Math.abs(center.width - (root.width - horizontalPadding - left.width - right.width - (gap * 2))) <= 4,
      centerFitsViewport: center.bottom <= window.innerHeight + 1,
      centerWidth: Math.round(center.width),
      gridTemplateColumns: rootStyle.gridTemplateColumns,
      leftAtSide: left.left < center.left,
      leftFitsViewport: left.bottom <= window.innerHeight + 1,
      leftWidth: Math.round(left.width),
      layoutDisplay: rootStyle.display,
      queueContentBottomWithinCenter: queueContent.bottom <= center.bottom + 1,
      queueContentHeight: Math.round(queueContent.height),
      queueContentOverflowY: queueContentStyle.overflowY,
      rightAtSide: right.left > center.right,
      rightFitsViewport: right.bottom <= window.innerHeight + 1,
      rightWithinRoot: right.right <= root.right + 1,
      rightWidth: Math.round(right.width),
      rootWidth: Math.round(root.width),
      speechSummaryHeight: Math.round(speechSummary.height),
      summaryContentBottomWithinRight: summaryContent.bottom <= right.bottom + 1,
      summaryContentOverflowY: summaryContentStyle.overflowY,
      speechSummaryOverflowY: summaryStyle.overflowY,
      statusBelowSummary: statusAccordion.top >= summaryAccordion.bottom - 1,
      statusBottomWithinRight: statusAccordion.bottom <= right.bottom + 1,
      statusLogHeight: Math.round(statusLog.height),
      statusLogOverflowY: statusStyle.overflowY,
      summaryBottomWithinRight: summaryAccordion.bottom <= right.bottom + 1,
      textContentBottomWithinCenter: textContent.bottom <= center.bottom + 1,
      textContentHeight: Math.round(textContent.height),
      textContentVisible: textContent.height >= 220,
      viewportWidth: window.innerWidth
    };
  });
  expect(fullscreenLayout.layoutDisplay).toBe("grid");
  expect(fullscreenLayout.gridTemplateColumns).toContain("340px");
  expect(fullscreenLayout.gridTemplateColumns).toContain("360px");
  expect(fullscreenLayout.rootWidth).toBeGreaterThanOrEqual(fullscreenLayout.viewportWidth - 20);
  expect(fullscreenLayout.leftWidth).toBe(340);
  expect(fullscreenLayout.rightWidth).toBe(360);
  expect(fullscreenLayout.leftAtSide).toBe(true);
  expect(fullscreenLayout.centerAfterLeft).toBe(true);
  expect(fullscreenLayout.leftFitsViewport).toBe(true);
  expect(fullscreenLayout.centerFitsViewport).toBe(true);
  expect(fullscreenLayout.rightFitsViewport).toBe(true);
  expect(fullscreenLayout.rightAtSide).toBe(true);
  expect(fullscreenLayout.rightWithinRoot).toBe(true);
  expect(fullscreenLayout.centerFillsRemaining).toBe(true);
  expect(fullscreenLayout.centerWidth).toBeGreaterThan(500);
  expect(fullscreenLayout.textContentVisible).toBe(true);
  expect(fullscreenLayout.textContentBottomWithinCenter).toBe(true);
  expect(fullscreenLayout.queueContentHeight).toBeGreaterThan(120);
  expect(fullscreenLayout.queueContentBottomWithinCenter).toBe(true);
  expect(fullscreenLayout.queueContentOverflowY).toBe("auto");
  expect(fullscreenLayout.summaryBottomWithinRight).toBe(true);
  expect(fullscreenLayout.summaryContentBottomWithinRight).toBe(true);
  expect(fullscreenLayout.summaryContentOverflowY).toBe("auto");
  expect(fullscreenLayout.speechSummaryHeight).toBeGreaterThan(80);
  expect(fullscreenLayout.speechSummaryOverflowY).toBe("auto");
  expect(fullscreenLayout.statusBelowSummary).toBe(true);
  expect(fullscreenLayout.statusBottomWithinRight).toBe(true);
  expect(fullscreenLayout.statusLogHeight).toBeGreaterThan(120);
  expect(fullscreenLayout.statusLogOverflowY).toBe("auto");

  const textToSpeakHeader = page.locator('[aria-controls="text2speech-V2TextContent"]');
  await textToSpeakHeader.click();
  await expect(textToSpeakHeader).toHaveAttribute("aria-expanded", "false");
  const collapsedFullscreenText = await page.locator(".text2speech-V2__text-accordion").evaluate((panel) => {
    const header = panel.querySelector(".accordion-v2__header").getBoundingClientRect();
    const content = panel.querySelector(".accordion-v2__content");
    const rect = panel.getBoundingClientRect();
    return {
      contentHidden: content.hidden === true,
      panelHeight: Math.round(rect.height),
      headerHeight: Math.round(header.height)
    };
  });
  expect(collapsedFullscreenText.contentHidden).toBe(true);
  expect(collapsedFullscreenText.panelHeight).toBeLessThanOrEqual(collapsedFullscreenText.headerHeight + 24);
  await textToSpeakHeader.click();
  await expect(textToSpeakHeader).toHaveAttribute("aria-expanded", "true");

  const namedSentencesHeader = page.locator('[aria-controls="text2speech-V2QueueContent"]');
  await namedSentencesHeader.click();
  await expect(namedSentencesHeader).toHaveAttribute("aria-expanded", "false");
  const collapsedFullscreenQueue = await page.locator(".text2speech-V2__accordion--fill").evaluate((panel) => {
    const header = panel.querySelector(".accordion-v2__header").getBoundingClientRect();
    const content = panel.querySelector(".accordion-v2__content");
    const rect = panel.getBoundingClientRect();
    return {
      contentHidden: content.hidden === true,
      panelHeight: Math.round(rect.height),
      headerHeight: Math.round(header.height)
    };
  });
  expect(collapsedFullscreenQueue.contentHidden).toBe(true);
  expect(collapsedFullscreenQueue.panelHeight).toBeLessThanOrEqual(collapsedFullscreenQueue.headerHeight + 24);
  await namedSentencesHeader.click();
  await expect(namedSentencesHeader).toHaveAttribute("aria-expanded", "true");

  if (await page.evaluate(() => Boolean(document.fullscreenElement))) {
    await summary.click();
    await expect(page.locator("body")).not.toHaveClass(/tools-platform-fullscreen-active/);
  } else {
    await page.evaluate(() => {
      window["__text2speech-V2App"].shell.applyFullscreenState(false);
      document.querySelector(".is-collapsible").open = true;
      window["__text2speech-V2App"].shell.updateSummary();
    });
    await expect(page.locator("body")).not.toHaveClass(/tools-platform-fullscreen-active/);
  }
  await expect(summary).toHaveAttribute("data-tools-platform-summary-mode", "normal");
}

test.describe("Workspace Manager V2 bootstrap", () => {
  test.afterAll(async () => {
    await workspaceV2CoverageReporter.writeReport();
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
      const textToSpeechToolCard = page.locator(".tools-platform-card", { has: page.locator("h3", { hasText: "Text to Speech V2" }) });
      await expect(textToSpeechToolCard).toBeVisible();
      await expect(textToSpeechToolCard.locator("a", { hasText: "Text to Speech V2" })).toHaveAttribute("href", "/tools/text2speech-V2/index.html");
      await expect(textToSpeechToolCard).toContainText("First-Class Tool V2 for browser speech synthesis");
      const worldVectorStudioCard = page.locator(".tools-platform-card", { has: page.locator("h3", { hasText: "World Vector Studio V2" }) });
      await expect(worldVectorStudioCard).toBeVisible();
      await expect(worldVectorStudioCard.locator("a", { hasText: "World Vector Studio V2" })).toHaveAttribute("href", "/tools/world-vector-studio-v2/index.html");
      await expect(worldVectorStudioCard).toContainText("Place assets, maps, layers, parallax, and scene/world layout");
      const objectVectorStudioCard = page.locator(".tools-platform-card", { has: page.locator("h3", { hasText: "Object Vector Studio V2" }) });
      await expect(objectVectorStudioCard).toBeVisible();
      await expect(objectVectorStudioCard.locator("a", { hasText: "Object Vector Studio V2" })).toHaveAttribute("href", "/tools/object-vector-studio-v2/index.html");
      await expect(objectVectorStudioCard).toContainText("Build vector assets");
      const inputMappingCard = page.locator(".tools-platform-card", { has: page.locator("h3", { hasText: "Input Mapping V2" }) });
      await expect(inputMappingCard).toBeVisible();
      await expect(inputMappingCard.locator("a", { hasText: "Input Mapping V2" })).toHaveAttribute("href", "/tools/input-mapping-v2/index.html");
      await expect(inputMappingCard).toContainText("keyboard and gamepad inputs");
      const toolsIndexState = await page.evaluate(async () => {
        const registryModule = await import("/tools/toolRegistry.js");
        const launchModule = await import("/tools/shared/toolLaunchSSoTData.js");
        const assetUsageModule = await import("/tools/shared/assetUsageIntegration.js");
        const firstClassToolsSection = Array.from(document.querySelectorAll("section"))
          .find((section) => section.querySelector(":scope > h2")?.textContent?.trim() === "First-Class Tools");
        const workflowGrid = firstClassToolsSection?.querySelector("[data-active-tools-workflow-grid]");
        const utilitiesGrid = firstClassToolsSection?.querySelector("[data-active-tools-utilities-grid]");
        const viewersGrid = firstClassToolsSection?.querySelector("[data-active-tools-viewers-grid]");
        const workspaceCard = workflowGrid?.querySelector(".tools-platform-card");
        const cards = Array.from(firstClassToolsSection?.querySelectorAll(".tools-platform-card") || []);
        const actionClassesForCard = (title) => {
          const toolCard = cards.find((candidate) => candidate.querySelector("h3")?.textContent?.trim() === title);
          return Object.fromEntries(Array.from(toolCard?.querySelectorAll(".tools-platform-card__action") || [])
            .map((action) => [action.textContent.trim(), action.className.trim()]));
        };
        const plannedToolsGrid = document.querySelector("[data-planned-tools-grid]");
        return {
          actionLabels: Array.from(firstClassToolsSection?.querySelectorAll(".tools-platform-card__action") || [])
            .map((action) => action.textContent.trim()),
          allCards: cards.map((toolCard) => toolCard.querySelector("h3")?.textContent?.trim() || ""),
          headings: Array.from(firstClassToolsSection?.querySelectorAll(":scope > h3") || [])
            .map((heading) => heading.textContent.trim()),
          launchIds: launchModule.listToolLaunchIds(),
          paletteManagerActionClasses: actionClassesForCard("Palette Manager V2"),
          plannedCards: Array.from(plannedToolsGrid?.querySelectorAll(".card h3") || [])
            .map((heading) => heading.textContent.trim()),
          registryIds: registryModule.getToolRegistry().map((tool) => tool.id),
          studioLaunchDefinitions: {
            world: launchModule.getSampleToolLaunchDefinition("world-vector-studio-v2"),
            object: launchModule.getSampleToolLaunchDefinition("object-vector-studio-v2"),
            inputMapping: launchModule.getSampleToolLaunchDefinition("input-mapping-v2")
          },
          removedLaunchDefinitions: {
            assetBrowser: launchModule.getSampleToolLaunchDefinition("asset-browser"),
            svgAssetStudio: launchModule.getSampleToolLaunchDefinition("svg-asset-studio"),
            tileModelConverter: launchModule.getSampleToolLaunchDefinition("tile-model-converter"),
            vectorMapEditor: launchModule.getSampleToolLaunchDefinition("vector-map-editor")
          },
          removedToolLookup: {
            assetBrowser: registryModule.getToolById("asset-browser"),
            svgAssetStudio: registryModule.getToolById("svg-asset-studio"),
            tileModelConverter: registryModule.getToolById("tile-model-converter"),
            vectorMapEditor: registryModule.getToolById("vector-map-editor")
          },
          removedToolPathStatuses: await Promise.all([
            fetch("/tools/Asset%20Browser/index.html", { cache: "no-store" }).then((response) => response.status),
            fetch("/tools/SVG%20Asset%20Studio/index.html", { cache: "no-store" }).then((response) => response.status),
            fetch("/tools/Tile%20Model%20Converter/index.html", { cache: "no-store" }).then((response) => response.status),
            fetch("/tools/Vector%20Map%20Editor/index.html", { cache: "no-store" }).then((response) => response.status)
          ]),
          sampleLabels: Array.from(firstClassToolsSection?.querySelectorAll(".tools-platform-card__action") || [])
            .map((action) => action.textContent.trim())
            .filter((label) => label.startsWith("Samples")),
          storageInspectorActionClasses: actionClassesForCard("Storage Inspector V2"),
          sharedActionLabelKeys: Object.keys(assetUsageModule.SHARED_ACTION_LABELS),
          sharedActionLabels: Object.values(assetUsageModule.SHARED_ACTION_LABELS),
          sharedShellActions: assetUsageModule.getSharedShellActions("sprite-editor", "tool")
            .map((action) => ({ href: action.href, id: action.id, label: action.label })),
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
      expect(toolsIndexState.viewersCards).toContain("Collision Inspector V2");
      expect(toolsIndexState.utilitiesCards).toContain("Input Mapping V2");
      expect(toolsIndexState.utilitiesCards).toContain("Text to Speech V2");
      expect(toolsIndexState.allCards).toEqual(expect.arrayContaining(["World Vector Studio V2", "Object Vector Studio V2", "Collision Inspector V2", "Input Mapping V2"]));
      expect(toolsIndexState.registryIds).toEqual(expect.arrayContaining(["world-vector-studio-v2", "object-vector-studio-v2", "collision-inspector-v2", "input-mapping-v2"]));
      expect(toolsIndexState.launchIds).toEqual(expect.arrayContaining(["tool.world-vector-studio-v2", "tool.object-vector-studio-v2", "tool.collision-inspector-v2", "tool.input-mapping-v2"]));
      expect(toolsIndexState.studioLaunchDefinitions.world.launchDefinition.targetPath).toBe("/tools/world-vector-studio-v2/index.html");
      expect(toolsIndexState.studioLaunchDefinitions.object.launchDefinition.targetPath).toBe("/tools/object-vector-studio-v2/index.html");
      expect(toolsIndexState.studioLaunchDefinitions.inputMapping.launchDefinition.targetPath).toBe("/tools/input-mapping-v2/index.html");
      expect(toolsIndexState.allCards).not.toContain("Asset Browser / Import Hub");
      expect(toolsIndexState.allCards).not.toContain("Tile Model Converter");
      expect(toolsIndexState.registryIds).not.toContain("asset-browser");
      expect(toolsIndexState.registryIds).not.toContain("svg-asset-studio");
      expect(toolsIndexState.registryIds).not.toContain("tile-model-converter");
      expect(toolsIndexState.registryIds).not.toContain("vector-map-editor");
      expect(toolsIndexState.removedToolLookup).toEqual({
        assetBrowser: null,
        svgAssetStudio: null,
        tileModelConverter: null,
        vectorMapEditor: null
      });
      expect(toolsIndexState.launchIds).not.toContain("tool.asset-browser");
      expect(toolsIndexState.launchIds).not.toContain("tool.svg-asset-studio");
      expect(toolsIndexState.launchIds).not.toContain("tool.tile-model-converter");
      expect(toolsIndexState.launchIds).not.toContain("tool.vector-map-editor");
      expect(toolsIndexState.removedLaunchDefinitions.assetBrowser.launchDefinition).toBeNull();
      expect(toolsIndexState.removedLaunchDefinitions.svgAssetStudio.launchDefinition).toBeNull();
      expect(toolsIndexState.removedLaunchDefinitions.tileModelConverter.launchDefinition).toBeNull();
      expect(toolsIndexState.removedLaunchDefinitions.vectorMapEditor.launchDefinition).toBeNull();
      expect(toolsIndexState.removedToolPathStatuses).toEqual([404, 404, 404, 404]);
      expect(toolsIndexState.plannedCards).not.toContain("Asset Manager V2");
      expect(toolsIndexState.plannedCards).toContain("Piper WASM Backend");
      expect(toolsIndexState.plannedCards).toContain("Optional SSML Processing Layer");
      expect(toolsIndexState.plannedCards).not.toContain("Collision / Hitbox Editor");
      expect(toolsIndexState.plannedCards).not.toContain("Character Voice Presets");
      expect(toolsIndexState.plannedCards).not.toContain("Game Character Voice / Event Integration");
      expect(toolsIndexState.plannedCards).not.toContain("Input Mapper / Controller Tester");
      expect(toolsIndexState.plannedCards).not.toEqual(expect.arrayContaining([
        "Raspberry Pi Speech Deployment",
        "Queue-Based Speech Playback",
        "Offline / Local Speech Support",
        "Browser Speech Backend (speechSynthesis)",
        "eSpeak NG WASM Backend"
      ]));
      expect(toolsIndexState.viewersCards).toContain("Storage Inspector V2");
      expect(toolsIndexState.workspaceActionLabels).toEqual(["How To Use", "Read Me"]);
      expect(toolsIndexState.sharedActionLabelKeys).toEqual(["paletteManager"]);
      expect(toolsIndexState.sharedActionLabels).toEqual(["Palette Manager"]);
      expect(toolsIndexState.sharedShellActions).toEqual([{
        href: "../palette-manager-v2/index.html?sourceToolId=sprite-editor",
        id: "palette-manager",
        label: "Palette Manager"
      }]);
      expect(toolsIndexState.sharedActionLabels).not.toContain("Browse Palettes");
      expect(toolsIndexState.storageInspectorActionClasses["How To Use"]).toBe(toolsIndexState.paletteManagerActionClasses["How To Use"]);
      expect(toolsIndexState.storageInspectorActionClasses["Read Me"]).toBe(toolsIndexState.paletteManagerActionClasses["Read Me"]);
      expect(toolsIndexState.storageInspectorActionClasses["How To Use"]).toBe("tools-platform-card__action tools-platform-card__action--secondary");
      expect(toolsIndexState.actionLabels).not.toContain("README");
      expect(toolsIndexState.sampleLabels.every((label) => /^Samples \(\d+\)$/.test(label))).toBe(true);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("launches Input Mapping V2 and captures keyboard mappings", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 900 });
    const server = await openInputMappingV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("body[data-tool-id='input-mapping-v2']")).toBeVisible();
      await expect(page.locator("[data-tool-starter-summary]")).toBeVisible();
      await expect(page.locator(".tools-platform-frame__title[data-tool-id='input-mapping-v2']")).toHaveText("Input Mapping V2");
      await expect(page.locator(".tool-starter__tool__menu")).toBeVisible();
      await expect(page.locator(".tool-starter__workspace__menu")).toBeHidden();
      const fullscreenLayout = await page.locator(".input-mapping-v2.tool-starter.app-shell").evaluate((shell) => {
        const left = shell.querySelector(".tool-starter__panel--left").getBoundingClientRect();
        const center = shell.querySelector(".tool-starter__panel--center").getBoundingClientRect();
        const right = shell.querySelector(".tool-starter__panel--right").getBoundingClientRect();
        const shellBox = shell.getBoundingClientRect();
        const rightAccordionHeights = Array.from(shell.querySelectorAll(".tool-starter__panel--right > .tool-starter__accordion"))
          .map((accordion) => Math.round(accordion.getBoundingClientRect().height));
        return {
          centerWidth: Math.round(center.width),
          leftX: Math.round(left.x),
          rightGap: Math.round(window.innerWidth - right.right),
          rightAccordionHeights,
          shellWidth: Math.round(shellBox.width)
        };
      });
      expect(fullscreenLayout.shellWidth).toBeGreaterThan(1800);
      expect(fullscreenLayout.leftX).toBeLessThan(40);
      expect(fullscreenLayout.rightGap).toBeLessThan(40);
      expect(fullscreenLayout.centerWidth).toBeGreaterThan(1000);
      expect(Math.max(...fullscreenLayout.rightAccordionHeights) - Math.min(...fullscreenLayout.rightAccordionHeights)).toBeLessThanOrEqual(3);
      await expect(page.locator("#inputMappingV2SourceList")).toContainText("InputService + KeyboardState");
      await expect(page.locator("#inputMappingV2SourceList")).toContainText("InputService + MouseState");
      await expect(page.locator("#inputMappingV2SourceList")).toContainText("InputService + GamepadState + GamepadInputAdapter");
      await expect(page.locator("#inputMappingV2SourceList")).toContainText("GamepadInputAdapter");
      const actionOptions = await page.locator("#inputMappingV2ActionSelect option").allTextContents();
      expect(actionOptions).toEqual([...actionOptions].sort((left, right) => left.localeCompare(right)));
      expect(actionOptions).toEqual(expect.arrayContaining(["Move Left", "Confirm", "Cancel", "Fire", "Thrust", "Rotate Left", "Rotate Right", "Pause", "Select", "Start"]));
      await expect(page.locator("#previewOutput")).toContainText("No inputs captured yet.");
      await expect(page.locator(".input-mapping-v2__mapping-card")).toHaveCount(0);
      expect(await page.locator("#previewOutput").evaluate((node) => getComputedStyle(node).overflowY)).toBe("auto");
      expect(Math.round((await page.locator("#inputMappingV2CaptureKeyboardButton").boundingBox()).width)).toBe(150);
      await page.locator("#inputMappingV2ActionSelect").selectOption("moveLeft");
      await page.locator("#inputMappingV2CaptureKeyboardButton").click();
      await expect(page.locator("#inputMappingV2CaptureMessage")).toContainText("Press a keyboard key");
      await page.keyboard.press("KeyA");
      await expect(page.locator(".input-mapping-v2__mapping-card")).toHaveCount(1);
      const mappingTileBox = await page.locator(".input-mapping-v2__mapping-card").first().boundingBox();
      expect(Math.round(mappingTileBox.width)).toBe(175);
      expect(Math.round(mappingTileBox.height)).toBe(175);
      await expect(page.locator("#previewOutput")).toContainText("Move Left");
      await expect(page.locator("#previewOutput")).toContainText("Keyboard KeyA");
      await expect(page.locator("#inspectorOutput")).toContainText('"action": "moveLeft"');
      await expect(page.locator("#inspectorOutput")).toContainText('"binding": "KeyA"');
      await page.locator(".input-mapping-v2__input-token", { hasText: "Keyboard KeyA" }).click();
      await expect(page.locator(".input-mapping-v2__input-token", { hasText: "Keyboard KeyA" })).toHaveCount(0);
      await expect(page.locator("#previewOutput")).toContainText("No inputs captured yet.");
      const actionValues = await page.locator("#inputMappingV2ActionSelect option").evaluateAll((options) => options.map((option) => option.value));
      for (const actionValue of actionValues.slice(0, 16)) {
        await page.locator("#inputMappingV2ActionSelect").selectOption(actionValue);
        await page.locator("#inputMappingV2CaptureKeyboardButton").click();
        await page.keyboard.press("KeyA");
      }
      const mappingListScroll = await page.locator("#previewOutput").evaluate((node) => ({
        clientHeight: node.clientHeight,
        overflowY: getComputedStyle(node).overflowY,
        scrollHeight: node.scrollHeight
      }));
      expect(mappingListScroll.overflowY).toBe("auto");
      expect(mappingListScroll.scrollHeight).toBeGreaterThan(mappingListScroll.clientHeight);
      await page.locator("#inputMappingV2CaptureGamepadButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Gamepad capture unavailable:/);
      const asteroidsManifestInputMapping = await page.evaluate(async () => {
        const response = await fetch("/games/Asteroids/game.manifest.json");
        const manifest = await response.json();
        return manifest.tools?.["input-mapping-v2"];
      });
      expect(asteroidsManifestInputMapping).toMatchObject({
        $schema: "tools/schemas/tools/input-mapping-v2.schema.json",
        engineInputModel: "src/engine/input/InputMap",
        toolId: "input-mapping-v2",
        version: 1
      });
      expect(asteroidsManifestInputMapping.actions.map((action) => action.label)).toEqual(actionOptions);
      await page.evaluate(() => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: async (text) => {
              window.__inputMappingV2Clipboard = text;
            }
          }
        });
      });
      await page.locator("#toolCopyJsonButton").click();
      expect(await page.evaluate(() => window.__inputMappingV2Clipboard)).toContain('"toolId": "input-mapping-v2"');
      await expect(page.locator("#statusLog")).toHaveValue(/OK Mapping JSON copied\./);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("launches World Vector Studio V2 and Object Vector Studio V2 copied tool shells", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await workspaceV2CoverageReporter.start(page);
    try {
      for (const tool of [
        {
          description: "Place assets, maps, layers, parallax, and scene/world layout",
          id: "world-vector-studio-v2",
          name: "World Vector Studio V2",
          path: "world-vector-studio-v2"
        },
        {
          description: "Build vector assets",
          id: "object-vector-studio-v2",
          name: "Object Vector Studio V2",
          path: "object-vector-studio-v2"
        }
      ]) {
        await page.goto(`${server.baseUrl}/tools/${tool.path}/index.html`, { waitUntil: "networkidle" });
        await expect(page.locator(`body.tools-platform-tool-page[data-tool-id="${tool.id}"]`)).toBeVisible();
        await expect(page.locator("[data-tool-starter-header]")).toContainText(tool.name);
        await expect(page.locator("[data-tool-starter-header]")).toContainText(tool.description);
        await expect(page.locator(".tool-starter__tool__menu")).toBeVisible();
        await expect(page.locator(".tool-starter__workspace__menu")).toBeHidden();
        if (tool.id === "world-vector-studio-v2") {
          await expect(page.locator("#worldVectorStudioV2ObjectReferenceRule")).toContainText("Object Vector Studio V2 asset references are read-only");
          await expect(page.locator("#worldVectorStudioV2ObjectReferenceRule")).toContainText("must not mutate Object Vector Studio V2 source assets");
          await expect(page.locator("#worldVectorStudioV2ObjectReferenceRule")).toContainText("Duplicate As Local");
          await page.locator("#sourceInput").fill(`${tool.name} launch coverage`);
          await page.locator("#toolExportButton").click();
          await expect(page.locator("#inspectorOutput")).toContainText(`"toolId": "${tool.id}"`);
          await expect(page.locator("#statusLog")).toHaveValue(new RegExp(`Processed source value: ${tool.name} launch coverage`));
        } else {
          await expect(page.locator('[data-launch-mode-nav="tool"] button')).toHaveText(["Import", "Copy JSON", "Export", "Export SVG"]);
          await expect(page.locator("#statusLog")).toHaveValue(/INFO Schema-only loading is idle/);
          await expect(page.locator("#objectVectorStudioV2ObjectTiles")).toContainText("No objects loaded");
        }
      }
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("shows Object Vector Studio V2 layout shell and schema-only palette gate", async ({ page }, testInfo) => {
    const server = await startRepoServer();
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await workspaceV2CoverageReporter.start(page);
    try {
      await page.goto(`${server.baseUrl}/tools/object-vector-studio-v2/index.html`, { waitUntil: "networkidle" });
      await expect(page.locator("body.tools-platform-tool-page[data-tool-id='object-vector-studio-v2']")).toBeVisible();
      await expect(page.locator("[data-tool-starter-header]")).toContainText("Object Vector Studio V2");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Object Vector Studio V2 schema contract loaded from \/tools\/schemas\/tools\/object-vector-studio-v2\.schema\.json\./);
      const objectVectorSchemaDefaults = await page.evaluate(async () => {
        const toolSchema = window.__objectVectorStudioV2App.schemaService.schema;
        const gameSchema = await fetch("/tools/schemas/game.manifest.schema.json", { cache: "no-store" }).then((response) => response.json());
        return {
          gameHasLocalObjectStateDefinition: Object.prototype.hasOwnProperty.call(gameSchema.$defs, "objectVectorStudioState"),
          gameGeometryDefaultsRemoved: [
            "objectVectorStudioRectangleGeometry",
            "objectVectorStudioCircleGeometry",
            "objectVectorStudioEllipseGeometry",
            "objectVectorStudioLineGeometry",
            "objectVectorStudioTriangleGeometry",
            "objectVectorStudioPolygonGeometry",
            "objectVectorStudioPolylineGeometry",
            "objectVectorStudioArcGeometry",
            "objectVectorStudioTextGeometry"
          ].every((definitionName) => !Object.prototype.hasOwnProperty.call(gameSchema.$defs[definitionName], "default")),
          gameObjectDefaultOrigin: gameSchema.$defs.objectVectorStudioObject.default.objectOrigin,
          gameObjectOriginRef: gameSchema.$defs.objectVectorStudioObject.properties.objectOrigin.$ref,
          gameObjectDefaultTags: gameSchema.$defs.objectVectorStudioObject.default.tags,
          gameShapeCommonDefaultTool: gameSchema.$defs.objectVectorStudioShapeCommon.default.tool,
          gameStateSchemaRef: gameSchema.$defs.objectVectorStudioObject.properties.states.items.$ref,
          gameStateThrustMentionRemoved: !JSON.stringify(gameSchema).includes('"thrust"'),
          gameStyleDefaultPointStyles: {
            end: gameSchema.$defs.objectVectorStudioStyle.default.endPointStyle,
            point: gameSchema.$defs.objectVectorStudioStyle.default.pointStyle,
            start: gameSchema.$defs.objectVectorStudioStyle.default.startPointStyle
          },
          gameTransformDefaultHasShapeOrigin: Object.prototype.hasOwnProperty.call(gameSchema.$defs.objectVectorStudioTransform.default, "shapeOrigin"),
          toolGeometryDefaultsRemoved: [
            "rectangleGeometry",
            "circleGeometry",
            "ellipseGeometry",
            "lineGeometry",
            "triangleGeometry",
            "polygonGeometry",
            "polylineGeometry",
            "arcGeometry",
            "textGeometry"
          ].every((definitionName) => !Object.prototype.hasOwnProperty.call(toolSchema.$defs[definitionName], "default")),
          toolObjectDefaultOrigin: toolSchema.$defs.object.default.objectOrigin,
          toolObjectOriginRef: toolSchema.$defs.object.properties.objectOrigin.$ref,
          toolShapeCommonDefaultTool: toolSchema.$defs.shapeCommon.default.tool,
          toolStateEnum: toolSchema.$defs.objectState.properties.id.enum,
          toolStateThrustRemoved: !toolSchema.$defs.objectState.properties.id.enum.includes("thrust"),
          toolStyleDefaultPointStyles: {
            end: toolSchema.$defs.style.default.endPointStyle,
            point: toolSchema.$defs.style.default.pointStyle,
            start: toolSchema.$defs.style.default.startPointStyle
          },
          toolStyleDefaultStrokeWidth: toolSchema.$defs.style.default.strokeWidth,
          toolTransformDefaultHasShapeOrigin: Object.prototype.hasOwnProperty.call(toolSchema.$defs.transform.default, "shapeOrigin")
        };
      });
      expect(objectVectorSchemaDefaults).toEqual({
        gameHasLocalObjectStateDefinition: false,
        gameGeometryDefaultsRemoved: true,
        gameObjectDefaultOrigin: { x: 0, y: 0 },
        gameObjectOriginRef: "#/$defs/point2d",
        gameObjectDefaultTags: [],
        gameShapeCommonDefaultTool: "polygon",
        gameStateSchemaRef: "tools/object-vector-studio-v2.schema.json#/$defs/objectState",
        gameStateThrustMentionRemoved: true,
        gameStyleDefaultPointStyles: { end: "square", point: "square", start: "square" },
        gameTransformDefaultHasShapeOrigin: false,
        toolGeometryDefaultsRemoved: true,
        toolObjectDefaultOrigin: { x: 0, y: 0 },
        toolObjectOriginRef: "#/$defs/point2d",
        toolShapeCommonDefaultTool: "polygon",
        toolStateEnum: ["idle", "move", "active", "inactive", "damaged", "destroyed"],
        toolStateThrustRemoved: true,
        toolStyleDefaultPointStyles: { end: "square", point: "square", start: "square" },
        toolStyleDefaultStrokeWidth: 3,
        toolTransformDefaultHasShapeOrigin: false
      });
      await expect(page.locator('[data-launch-mode-nav="tool"]')).toBeVisible();
      await expect(page.locator('[data-launch-mode-nav="tool"] button')).toHaveText(["Import", "Copy JSON", "Export", "Export SVG"]);
      await expect(page.locator('[data-launch-mode-nav="workspace"]')).toBeHidden();
      await expect(page.locator("#objectVectorStudioV2CopyJsonButton")).toBeDisabled();
      await expect(page.locator("#objectVectorStudioV2ExportJsonButton")).toBeDisabled();
      await expect(page.locator("#objectVectorStudioV2ExportSvgButton")).toBeDisabled();

      await expect(page.locator(".tool-starter__panel--left > .accordion-v2 > .accordion-v2__header > span:first-child")).toHaveText(["Object", "Object Transform", "Objects (0 obj, states 0, 0 shapes)"]);
      await expect(page.locator(".tool-starter__panel--right > .accordion-v2 > .accordion-v2__header > span:first-child")).toHaveText(["Palette (0 swatches)", "Tools", "Shapes", "Shape Geometry", "Shape Transform", "JSON Details", "Dependency Details", "Status Log"]);
      await expect(page.locator(".tool-starter__panel--right > .accordion-v2").first().locator(".accordion-v2__header > span:first-child")).toHaveText("Palette (0 swatches)");
      await expect(page.locator(".tool-starter__panel--right > .accordion-v2").nth(1).locator(".accordion-v2__header > span:first-child")).toHaveText("Tools");
      await expect(page.locator("#objectVectorStudioV2JsonDetailsContent")).toBeHidden();
      await expect(page.locator("#objectVectorStudioV2DependencyGraphContent")).toBeHidden();
      await expect(page.locator("#statusLogContent")).toBeHidden();
      await expect(page.locator("#objectVectorStudioV2PaletteSwatchCount")).toHaveText("(0 swatches)");
      await expect(page.locator("#objectVectorStudioV2ObjectTiles")).toContainText("No objects loaded");
      await expect(page.locator("#objectVectorStudioV2ObjectsCount")).toHaveText("(0 obj, states 0, 0 shapes)");
      await expect(page.locator("#objectVectorStudioV2ObjectTransform")).toHaveText("No object selected.");
      await expect(page.locator("#objectVectorStudioV2ShapeTransform")).toHaveText("No shape selected.");
      await expect(page.locator("#objectVectorStudioV2RenameObjectButton")).toBeDisabled();
      await expect(page.locator("#objectVectorStudioV2RenameObjectButton")).toHaveAttribute("data-disabled-reason", "Disabled until a schema-valid object is selected.");
      await expect(page.locator("#objectVectorStudioV2DeleteObjectButton")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2FlattenObjectButton")).toHaveCount(0);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Disabled controls stay inactive until a schema-valid payload/);
      await expect(page.locator("[data-control-group='object-actions']")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2ObjectContent > .object-vector-studio-v2__object-actions button")).toHaveText(["Add", "Rename", "Dup"]);
      await expect(page.locator("#objectVectorStudioV2ObjectsContent > .object-vector-studio-v2__objects-actions")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2ObjectTypeInput")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2ObjectTypeSelect")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2TemplateSelect")).toHaveCount(0);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Object identity uses object\.game\.name ids\./);
      const objectPanelLayout = await page.locator("#objectVectorStudioV2ObjectContent").evaluate((element) => {
        const nameField = element.querySelector("label[for='objectVectorStudioV2ObjectNameInput']");
        const nameLabel = nameField.querySelector("span");
        const nameInput = element.querySelector("#objectVectorStudioV2ObjectNameInput");
        const tagEditor = element.querySelector(".object-vector-studio-v2__tag-editor");
        const tagInput = element.querySelector("#objectVectorStudioV2ObjectTagInput");
        const tagButton = element.querySelector("#objectVectorStudioV2AddTagButton");
        const actions = element.querySelector(".object-vector-studio-v2__object-actions");
        const addObjectButton = element.querySelector("#objectVectorStudioV2AddObjectButton");
        const actionButtons = Array.from(actions.querySelectorAll("button"));
        const actionButtonRects = actionButtons.map((button) => button.getBoundingClientRect());
        const tagInputRect = tagInput.getBoundingClientRect();
        const tagButtonRect = tagButton.getBoundingClientRect();
        return {
          actionButtonLabels: actionButtons.map((button) => button.textContent.trim()),
          actionButtonMaxHeight: Math.max(...actionButtonRects.map((rect) => Math.round(rect.height))),
          actionsAfterName: Boolean(nameField.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING),
          actionsBeforeTag: Boolean(actions.compareDocumentPosition(tagEditor) & Node.DOCUMENT_POSITION_FOLLOWING),
          actionsDirectlyUnderName: actions.getBoundingClientRect().top - nameField.getBoundingClientRect().bottom <= 8,
          actionsSingleLine: actionButtonRects.every((rect) => Math.abs(rect.top - actionButtonRects[0].top) < 2),
          nameInline: Math.abs((nameLabel.getBoundingClientRect().top + nameLabel.getBoundingClientRect().height / 2) - (nameInput.getBoundingClientRect().top + nameInput.getBoundingClientRect().height / 2)) < 4,
          noVisibleTagLabel: element.querySelector("label[for='objectVectorStudioV2ObjectTagInput']") === null,
          tagAddText: tagButton.textContent.trim(),
          tagAriaLabel: tagInput.getAttribute("aria-label"),
          tagButtonWidth: Math.round(tagButtonRect.width),
          tagIconMatchesAddObject: Math.round(Number.parseFloat(getComputedStyle(tagButton, "::before").fontSize)) === Math.round(Number.parseFloat(getComputedStyle(addObjectButton, "::before").fontSize)),
          tagInline: Math.abs((tagInputRect.top + tagInputRect.height / 2) - (tagButtonRect.top + tagButtonRect.height / 2)) < 4 && tagInputRect.right <= tagButtonRect.left
        };
      });
      expect(objectPanelLayout).toMatchObject({ actionButtonLabels: ["Add", "Rename", "Dup"], actionsAfterName: true, actionsBeforeTag: true, actionsDirectlyUnderName: true, actionsSingleLine: true, nameInline: true, noVisibleTagLabel: true, tagAddText: "Add", tagAriaLabel: "Object tag", tagButtonWidth: 77, tagIconMatchesAddObject: true, tagInline: true });
      expect(objectPanelLayout.actionButtonMaxHeight).toBeLessThanOrEqual(34);
      await page.locator("#objectVectorStudioV2ObjectNameInput").fill("Blocked Object");
      await page.locator("#objectVectorStudioV2AddObjectButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Add object blocked: load a schema-valid Object Vector Studio V2 payload before adding objects\./);
      const expectedShapeToolLabels = ["Select", "Annulus/Ring", "Arc", "Capsule/Stadium", "Circle", "Ellipse", "Kite", "Line", "Lune", "Parallelogram", "Polygon", "Polyline", "Rectangle", "Rhombus", "Sector", "Segment", "Square", "Squircle", "Star Polygon", "Trapezoid/Trapezium", "Triangle", "Text"];
      await expect(page.locator(".object-vector-studio-v2__tool-toggle")).toHaveText(expectedShapeToolLabels);
      expect(await page.locator("[data-future-shape]").evaluateAll((buttons) => buttons.map((button) => ({
        disabled: button.disabled,
        label: button.textContent.trim(),
        pressed: button.getAttribute("aria-pressed"),
        title: button.title
      })))).toEqual([
        { disabled: true, label: "Annulus/Ring", pressed: "false", title: "Future shape: Annulus/Ring is not creatable yet" },
        { disabled: true, label: "Capsule/Stadium", pressed: "false", title: "Future shape: Capsule/Stadium is not creatable yet" },
        { disabled: true, label: "Kite", pressed: "false", title: "Future shape: Kite is not creatable yet" },
        { disabled: true, label: "Lune", pressed: "false", title: "Future shape: Lune is not creatable yet" },
        { disabled: true, label: "Parallelogram", pressed: "false", title: "Future shape: Parallelogram is not creatable yet" },
        { disabled: true, label: "Rhombus", pressed: "false", title: "Future shape: Rhombus is not creatable yet" },
        { disabled: true, label: "Sector", pressed: "false", title: "Future shape: Sector is not creatable yet" },
        { disabled: true, label: "Segment", pressed: "false", title: "Future shape: Segment is not creatable yet" },
        { disabled: true, label: "Squircle", pressed: "false", title: "Future shape: Squircle is not creatable yet" },
        { disabled: true, label: "Star Polygon", pressed: "false", title: "Future shape: Star Polygon is not creatable yet" },
        { disabled: true, label: "Trapezoid/Trapezium", pressed: "false", title: "Future shape: Trapezoid/Trapezium is not creatable yet" }
      ]);
      const futureNotes = await readFile("tools/object-vector-studio-v2/possible.future.adds.txt", "utf8");
      expect(futureNotes).toContain("Object Vector Studio V2 should stay focused on reusable atomic vector objects.");
      expect(futureNotes).toContain("Future World Vector or Scene layers should instance Object Vector objects");
      expect(futureNotes).toContain("Keep Object Vector and World Vector separate");
      expect(futureNotes).toContain("Future 3D vector workflows can build from Object Vector concepts");
      expect(futureNotes).toContain("point3d");
      expect(futureNotes).toContain("camera");
      expect(futureNotes).toContain("projection");
      expect(futureNotes).toContain("mesh");
      expect(futureNotes).toContain("spline");
      await expect(page.locator(".object-vector-studio-v2__shape-icon--triangle")).toBeVisible();
      await expect(page.locator(".object-vector-studio-v2__shape-icon--arc")).toBeVisible();
      const iconStyleState = await page.evaluate(async () => {
        const fontResponse = await fetch("/src/assets/fonts/0xProtoNerdFont/0xProtoNerdFontMono-Regular.ttf", { cache: "no-store" });
        const toolCss = await (await fetch("/tools/object-vector-studio-v2/styles/toolStarter.css", { cache: "no-store" })).text();
        const icon = (selector) => {
          const element = document.querySelector(selector);
          const before = getComputedStyle(element, "::before");
          return {
            fontFamily: before.fontFamily,
            fontSize: Number.parseFloat(before.fontSize),
            glyphPresent: Boolean(element.dataset.ovsIcon),
            iconKey: element.dataset.ovsIconKey,
            iconName: element.dataset.ovsIconName,
            transform: before.transform
          };
        };
        const title = (selector) => document.querySelector(selector).title;
        const paletteSortButtons = Array.from(document.querySelectorAll(".object-vector-studio-v2__palette-sort button"));
        const paletteSortRects = paletteSortButtons.map((button) => button.getBoundingClientRect());
        const paletteSortButtonStyles = paletteSortButtons.map((button) => getComputedStyle(button));
        return {
          actionIcons: {
            add: icon("#objectVectorStudioV2AddObjectButton"),
            paint: icon("#objectVectorStudioV2PaintModeButton"),
            rename: icon("#objectVectorStudioV2RenameObjectButton"),
            stroke: icon("#objectVectorStudioV2StrokeModeButton")
          },
          fontAssetOk: fontResponse.ok,
          futureShapeIcons: {
            annulusRing: icon(".object-vector-studio-v2__shape-icon--annulus-ring"),
            capsuleStadium: icon(".object-vector-studio-v2__shape-icon--capsule-stadium"),
            kite: icon(".object-vector-studio-v2__shape-icon--kite"),
            lune: icon(".object-vector-studio-v2__shape-icon--lune"),
            parallelogram: icon(".object-vector-studio-v2__shape-icon--parallelogram"),
            rhombus: icon(".object-vector-studio-v2__shape-icon--rhombus"),
            sector: icon(".object-vector-studio-v2__shape-icon--sector"),
            segment: icon(".object-vector-studio-v2__shape-icon--segment"),
            squircle: icon(".object-vector-studio-v2__shape-icon--squircle"),
            starPolygon: icon(".object-vector-studio-v2__shape-icon--star-polygon"),
            trapezoidTrapezium: icon(".object-vector-studio-v2__shape-icon--trapezoid-trapezium")
          },
          oldCustomIconCssRemoved: !/object-vector-studio-v2__shape-icon--select::before|object-vector-studio-v2__z-icon--group::after|object-vector-studio-v2__tile-icon--delete::after|content:\s*"T"/u.test(toolCss),
          paletteSortIcons: {
            bri: icon("[data-palette-sort='bri']"),
            hue: icon("[data-palette-sort='hue']"),
            name: icon("[data-palette-sort='name']"),
            sat: icon("[data-palette-sort='sat']"),
            tag: icon("[data-palette-sort='tag']")
          },
          paletteSortLayout: {
            buttonFontSizes: paletteSortButtonStyles.map((style) => Number.parseFloat(style.fontSize)),
            iconFontSizes: paletteSortButtons.map((button) => Number.parseFloat(getComputedStyle(button, "::before").fontSize)),
            singleLine: paletteSortRects.every((rect) => Math.abs(rect.top - paletteSortRects[0].top) < 2)
          },
          palettePicker: {
            inPalette: Boolean(document.querySelector(".object-vector-studio-v2__palette-primary-row #objectVectorStudioV2PalettePickerButton")),
            inShapeTools: Boolean(document.querySelector("#objectVectorStudioV2ToolToggleGrid [data-shape-tool='picker']")),
            text: document.querySelector("#objectVectorStudioV2PalettePickerButton")?.textContent.trim() || "",
            title: document.querySelector("#objectVectorStudioV2PalettePickerButton")?.title || ""
          },
          gridIcons: {
            angle: icon("#objectVectorStudioV2AngleSnapButton"),
            render: icon("#objectVectorStudioV2GridRenderButton"),
            snap: icon("#objectVectorStudioV2SnapModeButton")
          },
          snapIconColors: {
            inactiveRectangleIcon: getComputedStyle(document.querySelector("[data-shape-tool='rectangle'] .object-vector-studio-v2__shape-icon")).color,
            snapAngleIcon: getComputedStyle(document.querySelector("#objectVectorStudioV2AngleSnapButton"), "::before").color,
            snapAngleText: getComputedStyle(document.querySelector("#objectVectorStudioV2AngleSnapButton")).color
          },
          modeButtons: {
            paint: {
              iconOrder: getComputedStyle(document.querySelector("#objectVectorStudioV2PaintModeButton"), "::before").order,
              swatchColor: document.querySelector("#objectVectorStudioV2PaintModeButton").dataset.paletteModeColor,
              swatchCount: document.querySelectorAll("#objectVectorStudioV2PaintModeButton [data-palette-mode-swatch='paint']").length,
              swatchOrder: getComputedStyle(document.querySelector("#objectVectorStudioV2PaintModeButton [data-palette-mode-swatch='paint']")).order
            },
            stroke: {
              iconOrder: getComputedStyle(document.querySelector("#objectVectorStudioV2StrokeModeButton"), "::before").order,
              swatchColor: document.querySelector("#objectVectorStudioV2StrokeModeButton").dataset.paletteModeColor,
              swatchCount: document.querySelectorAll("#objectVectorStudioV2StrokeModeButton [data-palette-mode-swatch='stroke']").length,
              swatchOrder: getComputedStyle(document.querySelector("#objectVectorStudioV2StrokeModeButton [data-palette-mode-swatch='stroke']")).order
            }
          },
          previewEditIcons: {
            copy: icon("#objectVectorStudioV2PreviewCopyButton"),
            paste: icon("#objectVectorStudioV2PreviewPasteButton"),
            redo: icon("#objectVectorStudioV2PreviewRedoButton"),
            undo: icon("#objectVectorStudioV2PreviewUndoButton")
          },
          previewEditToolbar: {
            disabledStates: Array.from(document.querySelectorAll(".object-vector-studio-v2__preview-edit-toolbar button")).map((button) => button.disabled),
            labels: Array.from(document.querySelectorAll(".object-vector-studio-v2__preview-edit-toolbar button")).map((button) => button.textContent.trim()),
            previousElementIsSeparator: document.querySelector(".object-vector-studio-v2__preview-edit-toolbar").previousElementSibling?.tagName === "HR",
            previousSiblingText: document.querySelector(".object-vector-studio-v2__preview-edit-toolbar").previousElementSibling?.previousElementSibling?.textContent.trim()
          },
          shapeIcons: {
            arc: icon(".object-vector-studio-v2__shape-icon--arc"),
            circle: icon(".object-vector-studio-v2__shape-icon--circle"),
            ellipse: icon(".object-vector-studio-v2__shape-icon--ellipse"),
            line: icon(".object-vector-studio-v2__shape-icon--line"),
            picker: icon(".object-vector-studio-v2__shape-icon--picker"),
            polygon: icon(".object-vector-studio-v2__shape-icon--polygon"),
            polyline: icon(".object-vector-studio-v2__shape-icon--polyline"),
            rectangle: icon(".object-vector-studio-v2__shape-icon--rectangle"),
            select: icon(".object-vector-studio-v2__shape-icon--select"),
            square: icon(".object-vector-studio-v2__shape-icon--square"),
            text: icon(".object-vector-studio-v2__shape-icon--text"),
            triangle: icon(".object-vector-studio-v2__shape-icon--triangle")
          },
          titles: {
            add: title("#objectVectorStudioV2AddObjectButton"),
            angle: title("#objectVectorStudioV2AngleSnapButton"),
            grid: title("#objectVectorStudioV2GridRenderButton"),
            polygon: title("[data-shape-tool='polygon']"),
            polyline: title("[data-shape-tool='polyline']"),
            rename: title("#objectVectorStudioV2RenameObjectButton"),
            shape: title("[data-shape-tool='rectangle']"),
            zoomIn: title("#objectVectorStudioV2ZoomInButton")
          },
          viewportIcons: {
            down: icon("#objectVectorStudioV2PanDownButton"),
            reset: icon("#objectVectorStudioV2ResetViewButton"),
            up: icon("#objectVectorStudioV2PanUpButton"),
            zoomIn: icon("#objectVectorStudioV2ZoomInButton"),
            zoomOut: icon("#objectVectorStudioV2ZoomOutButton")
          }
        };
      });
      expect(iconStyleState.fontAssetOk).toBe(true);
      expect(iconStyleState.oldCustomIconCssRemoved).toBe(true);
      [
        ...Object.values(iconStyleState.actionIcons),
        ...Object.values(iconStyleState.futureShapeIcons),
        ...Object.values(iconStyleState.gridIcons),
        ...Object.values(iconStyleState.previewEditIcons),
        ...Object.values(iconStyleState.shapeIcons),
        ...Object.values(iconStyleState.viewportIcons)
      ].forEach((icon) => {
        expect(icon.glyphPresent).toBe(true);
        expect(icon.fontFamily).toContain("0xProto Nerd Font");
        expect(icon.fontSize).toBeGreaterThanOrEqual(21);
      });
      Object.values(iconStyleState.paletteSortIcons).forEach((icon) => {
        expect(icon.glyphPresent).toBe(true);
        expect(icon.fontFamily).toContain("0xProto Nerd Font");
        expect(icon.fontSize).toBeGreaterThanOrEqual(10);
        expect(icon.fontSize).toBeLessThanOrEqual(16);
      });
      expect(iconStyleState.paletteSortLayout.singleLine).toBe(true);
      expect(Math.max(...iconStyleState.paletteSortLayout.buttonFontSizes)).toBeLessThanOrEqual(12);
      expect(Math.max(...iconStyleState.paletteSortLayout.iconFontSizes)).toBeLessThanOrEqual(16);
      expect(iconStyleState.palettePicker).toEqual({
        inPalette: true,
        inShapeTools: false,
        text: "",
        title: "Sample a shape style into Palette controls"
      });
      expect(iconStyleState.actionIcons.paint.iconName).toBe("nf-fa-paint_brush");
      expect(iconStyleState.actionIcons.stroke.iconName).toBe("nf-fa-pencil");
      expect(iconStyleState.modeButtons).toEqual({
        paint: { iconOrder: "2", swatchColor: "#ffffff", swatchCount: 1, swatchOrder: "1" },
        stroke: { iconOrder: "2", swatchColor: "#000000", swatchCount: 1, swatchOrder: "1" }
      });
      expect(iconStyleState.gridIcons).toMatchObject({
        angle: { iconKey: "angle", iconName: "nf-md-angle_acute" },
        render: { iconKey: "grid", iconName: "nf-md-grid" },
        snap: { iconKey: "snapGrid", iconName: "nf-md-grid_large" }
      });
      expect(iconStyleState.previewEditIcons).toMatchObject({
        copy: { iconKey: "copy", iconName: "nf-fa-copy" },
        paste: { iconKey: "paste", iconName: "nf-oct-paste" },
        redo: { iconKey: "redo", iconName: "nf-md-redo" },
        undo: { iconKey: "undo", iconName: "nf-md-undo" }
      });
      expect(iconStyleState.previewEditToolbar).toEqual({
        disabledStates: [true, true, true, true],
        labels: ["Undo", "Redo", "Copy", "Paste"],
        previousElementIsSeparator: true,
        previousSiblingText: "Object ID: none"
      });
      expect(iconStyleState.paletteSortIcons).toMatchObject({
        bri: { iconKey: "bri", iconName: "nf-fa-sun_o" },
        hue: { iconKey: "hue", iconName: "nf-fa-eyedropper" },
        name: { iconKey: "name", iconName: "nf-fa-font" },
        sat: { iconKey: "sat", iconName: "nf-fa-tint" },
        tag: { iconKey: "tag", iconName: "nf-fa-tag" }
      });
      expect(Object.fromEntries(Object.entries(iconStyleState.futureShapeIcons).map(([key, value]) => [key, value.iconKey]))).toEqual({
        annulusRing: "annulusRing",
        capsuleStadium: "capsuleStadium",
        kite: "kite",
        lune: "lune",
        parallelogram: "parallelogram",
        rhombus: "rhombus",
        sector: "sector",
        segment: "segment",
        squircle: "squircle",
        starPolygon: "starPolygon",
        trapezoidTrapezium: "trapezoidTrapezium"
      });
      expect(Object.fromEntries(Object.entries(iconStyleState.shapeIcons).map(([key, value]) => [key, value.iconKey]))).toEqual({
        arc: "arc",
        circle: "circle",
        ellipse: "ellipse",
        line: "line",
        picker: "picker",
        polygon: "polygon",
        polyline: "polyline",
        rectangle: "rectangle",
        select: "select",
        square: "square",
        text: "text",
        triangle: "triangle"
      });
      expect(iconStyleState.shapeIcons.arc.iconName).toBe("nf-md-vector_radius");
      expect(iconStyleState.shapeIcons.circle.iconName).toBe("nf-md-vector_circle_variant");
      expect(iconStyleState.shapeIcons.ellipse.iconName).toBe("nf-md-vector_ellipse");
      expect(iconStyleState.shapeIcons.picker.iconName).toBe("nf-fa-eye_dropper");
      expect(iconStyleState.shapeIcons.polygon.iconName).toBe("nf-md-vector_polygon");
      expect(iconStyleState.shapeIcons.polyline.iconName).toBe("nf-md-vector_polyline");
      expect(iconStyleState.shapeIcons.square.iconName).toBe("nf-fa-vector_square");
      expect(iconStyleState.shapeIcons.triangle.iconName).toBe("nf-md-vector_triangle");
      expect(iconStyleState.shapeIcons.select.iconName).toBe("nf-md-select");
      expect(iconStyleState.shapeIcons.line.iconName).toBe("nf-md-vector_line");
      expect(iconStyleState.shapeIcons.rectangle.iconName).toBe("nf-md-vector_rectangle");
      expect(Math.round(iconStyleState.shapeIcons.select.fontSize)).toBe(Math.round(iconStyleState.shapeIcons.circle.fontSize * 1.125));
      expect(Math.round(iconStyleState.shapeIcons.triangle.fontSize)).toBe(Math.round(iconStyleState.shapeIcons.circle.fontSize * 1.25));
      expect(Math.round(iconStyleState.shapeIcons.rectangle.fontSize)).toBe(Math.round(iconStyleState.shapeIcons.circle.fontSize * 1.25));
      expect(Object.fromEntries(Object.entries(iconStyleState.shapeIcons).map(([key, value]) => [key, value.transform]))).toEqual({
        arc: "none",
        circle: "none",
        ellipse: "none",
        line: "none",
        picker: "none",
        polygon: "none",
        polyline: "none",
        rectangle: "none",
        select: "none",
        square: "none",
        text: "none",
        triangle: "none"
      });
      expect(Object.fromEntries(Object.entries(iconStyleState.viewportIcons).map(([key, value]) => [key, value.iconKey]))).toEqual({
        down: "panDown",
        reset: "reset",
        up: "panUp",
        zoomIn: "zoomIn",
        zoomOut: "zoomOut"
      });
      expect(iconStyleState.viewportIcons.zoomIn.iconName).toBe("nf-oct-zoom_in");
      expect(iconStyleState.viewportIcons.zoomOut.iconName).toBe("nf-oct-zoom_out");
      expect(iconStyleState.titles).toEqual({
        add: "Add a schema-valid object to the loaded payload",
        angle: "Snap Angle switches Rotate to a constrained dropdown using the selected 15, 30, 45, or 90 degree step.",
        grid: "Show or hide the preview grid",
        polygon: "Create a polygon shape on the selected object. Click to add points.\n\nDouble-click to finish.",
        polyline: "Create a polyline shape on the selected object. Click to add points.\n\nDouble-click to finish.",
        rename: "Disabled until a schema-valid object is selected.",
        shape: "Create a rectangle shape on the selected object",
        zoomIn: "Zoom the work surface in"
      });
      expect(iconStyleState.snapIconColors.snapAngleIcon).not.toBe(iconStyleState.snapIconColors.snapAngleText);
      expect(iconStyleState.snapIconColors.inactiveRectangleIcon).not.toBe(iconStyleState.snapIconColors.snapAngleIcon);
      await expect(page.locator("#objectVectorStudioV2AngleSnapButton")).toHaveText("Snap Angle");
      await page.locator("#objectVectorStudioV2AngleSnapButton").click();
      await expect(page.locator("#objectVectorStudioV2AngleSnapButton")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Snap angle enabled: Rotate action uses dropdown values in 15 degree increments\./);
      await page.locator("#objectVectorStudioV2AngleSnapButton").click();
      await expect(page.locator("#objectVectorStudioV2AngleSnapButton")).toHaveAttribute("aria-pressed", "false");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Snap angle disabled: Rotate action uses raw numeric textbox values\./);

      await drawDefaultObjectVectorShape(page, "rectangle");
      await expect(page.locator('[data-shape-tool="rectangle"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Drawing mode selected: Rectangle\. Click once to start, move to preview, then click again to finish\. Select a schema-valid object before committing geometry\./);
      const shapeToolLayout = await page.locator('[data-shape-tool="rectangle"]').evaluate((button) => {
        const rect = button.getBoundingClientRect();
        const gridButton = document.querySelector("#objectVectorStudioV2GridRenderButton");
        const labelButton = document.querySelector("#objectVectorStudioV2ToolLabelModeButton");
        const toolsContent = document.querySelector("#objectVectorStudioV2ShapeToolsContent");
        const shapesContent = document.querySelector("#objectVectorStudioV2ShapesContent");
        const toolsContentRect = toolsContent.getBoundingClientRect();
        const toolsAccordion = toolsContent.closest(".accordion-v2").getBoundingClientRect();
        const shapesContentRect = shapesContent.getBoundingClientRect();
        const shapesAccordion = shapesContent.closest(".accordion-v2").getBoundingClientRect();
        const leftPanel = document.querySelector(".tool-starter__panel--left");
        const toolButtons = Array.from(document.querySelectorAll(".object-vector-studio-v2__tool-toggle"));
        const toolsButtonLabels = Array.from(toolsContent.querySelectorAll(":scope > .object-vector-studio-v2__snap-actions > button")).map((snapButton) => snapButton.textContent.trim());
        const shapesButtonLabels = toolButtons.map((toolButton) => toolButton.textContent.trim());
        const iconTopOffsets = toolButtons.map((toolButton) => {
          const buttonRect = toolButton.getBoundingClientRect();
          const iconRect = toolButton.querySelector(".object-vector-studio-v2__shape-icon").getBoundingClientRect();
          return Math.round(iconRect.top - buttonRect.top);
        });
        return {
          buttonCount: toolButtons.length,
          labelBesideGrid: gridButton.getBoundingClientRect().right <= labelButton.getBoundingClientRect().left,
          leftPanelOverflowY: getComputedStyle(leftPanel).overflowY,
          shapesButtonLabels,
          textButtonWider: Math.round(rect.width) > Math.round(rect.height),
          toolsButtonLabels,
          toolsContainsShapeButtons: Boolean(toolsContent.querySelector(".object-vector-studio-v2__tool-toggle")),
          toolsReachesBottom: Math.abs(toolsContentRect.bottom - toolsAccordion.bottom) <= 1,
          visibleIconTopOffsetRange: Math.max(...iconTopOffsets) - Math.min(...iconTopOffsets),
          shapesReachesBottom: Math.abs(shapesContentRect.bottom - shapesAccordion.bottom) <= 1,
          zOrderAbsentBeforeObjectSelection: !document.querySelector(".object-vector-studio-v2__z-order-actions"),
          zOrderAbsentFromShapeTools: !document.querySelector("#objectVectorStudioV2ShapeToolsContent .object-vector-studio-v2__z-order-actions")
        };
      });
      expect(shapeToolLayout).toEqual({
        buttonCount: 22,
        labelBesideGrid: true,
        leftPanelOverflowY: "auto",
        shapesButtonLabels: expectedShapeToolLabels,
        textButtonWider: true,
        toolsButtonLabels: ["Snap Grid", "Snap Angle", "Grid", "Icons"],
        toolsContainsShapeButtons: false,
        toolsReachesBottom: true,
        visibleIconTopOffsetRange: 0,
        shapesReachesBottom: true,
        zOrderAbsentBeforeObjectSelection: true,
        zOrderAbsentFromShapeTools: true
      });
      await page.locator("#objectVectorStudioV2ToolLabelModeButton").click();
      await expect(page.locator("#objectVectorStudioV2ToolLabelModeButton")).toHaveText("Words");
      await expect(page.locator("#objectVectorStudioV2ToolToggleGrid")).toHaveClass(/is-icon-only/);
      await expect(page.locator(".object-vector-studio-v2__z-order-actions")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2ResetViewButton")).not.toHaveClass(/is-icon-only/);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Tools display mode set to compact icons\./);
      const iconOnlyToolLayout = await page.locator("#objectVectorStudioV2ToolToggleGrid").evaluate((grid) => {
        const toolButtons = Array.from(grid.querySelectorAll(".object-vector-studio-v2__tool-toggle"));
        const measurements = toolButtons.map((toolButton) => {
          const buttonRect = toolButton.getBoundingClientRect();
          const iconRect = toolButton.querySelector(".object-vector-studio-v2__shape-icon").getBoundingClientRect();
          return {
            centerDeltaX: Math.abs((iconRect.left + iconRect.width / 2) - (buttonRect.left + buttonRect.width / 2)),
            centerDeltaY: Math.abs((iconRect.top + iconRect.height / 2) - (buttonRect.top + buttonRect.height / 2)),
            height: Math.round(buttonRect.height),
            width: Math.round(buttonRect.width)
          };
        });
        return {
          iconsCentered: measurements.every((entry) => entry.centerDeltaX < 1 && entry.centerDeltaY < 1),
          squareButtons: measurements.every((entry) => entry.width === entry.height)
        };
      });
      expect(iconOnlyToolLayout).toEqual({ iconsCentered: true, squareButtons: true });
      await page.reload({ waitUntil: "networkidle" });
      await expect(page.locator("#objectVectorStudioV2ToolToggleGrid")).toHaveClass(/is-icon-only/);
      await expect(page.locator(".object-vector-studio-v2__z-order-actions")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2ToolLabelModeButton")).toHaveText("Words");

      const invalidPayloadPath = testInfo.outputPath("object-vector-invalid.json");
      await writeFile(invalidPayloadPath, JSON.stringify({ objects: [] }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(invalidPayloadPath);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Object Vector Studio V2 schema validation failed from import:object-vector-invalid\.json: root\.version is required\./);
      await expect(page.locator("#objectVectorStudioV2ObjectTiles")).toContainText("No objects loaded");
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toHaveText("{}");

      const paletteDriftPayloadPath = testInfo.outputPath("object-vector-palette-drift.json");
      await writeFile(paletteDriftPayloadPath, JSON.stringify({
        name: "Palette Drift",
        objects: [],
        palette: {
          id: "arcade-primary",
          swatches: [
            { id: "white", value: "#ffffff" }
          ]
        },
        toolId: "object-vector-studio-v2",
        version: 1
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(paletteDriftPayloadPath);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Object Vector Studio V2 schema validation failed from import:object-vector-palette-drift\.json: root\.palette is not allowed\./);

      const legacyVectorMapsPayloadPath = testInfo.outputPath("object-vector-legacy-vector-maps.json");
      await writeFile(legacyVectorMapsPayloadPath, JSON.stringify({
        name: "Legacy Vector Maps",
        objects: [],
        toolId: "object-vector-studio-v2",
        vectorMaps: {
          name: "Legacy Vector Maps",
          shapes: []
        },
        version: 1
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(legacyVectorMapsPayloadPath);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Object Vector Studio V2 schema validation failed from import:object-vector-legacy-vector-maps\.json: root\.vectorMaps is deprecated legacy vector-map data\. Remove root\.vectorMaps and import Object Vector Studio V2 payloads with root\.objects\[\]\.tags and root\.objects\[\]\.shapes only\./);

      const unknownRootPayloadPath = testInfo.outputPath("object-vector-unknown-root.json");
      await writeFile(unknownRootPayloadPath, JSON.stringify({
        name: "Unknown Root",
        objects: [],
        toolId: "object-vector-studio-v2",
        version: 1,
        unexpected: true
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(unknownRootPayloadPath);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Object Vector Studio V2 schema validation failed from import:object-vector-unknown-root\.json: root\.unexpected is not allowed\./);
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toHaveText("{}");

      const categoryDriftPayloadPath = testInfo.outputPath("object-vector-category-drift.json");
      await writeFile(categoryDriftPayloadPath, JSON.stringify({
        name: "Category Drift",
        objects: [
          {
            category: "ship",
            id: "object.drift.category-drift",
            name: "Category Drift",
            shapes: [],
            tags: []
          }
        ],
        toolId: "object-vector-studio-v2",
        version: 1
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(categoryDriftPayloadPath);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Object Vector Studio V2 schema validation failed from import:object-vector-category-drift\.json: root\.objects\[0\]\.category is not allowed\./);

      const objectTypePayloadPath = testInfo.outputPath("object-vector-object-type-drift.json");
      await writeFile(objectTypePayloadPath, JSON.stringify({
        name: "Object Type Drift",
        objects: [
          {
            id: "object.drift.typed-object",
            name: "Typed Object",
            shapes: [],
            tags: [],
            type: "ship"
          }
        ],
        toolId: "object-vector-studio-v2",
        version: 1
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(objectTypePayloadPath);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Object Vector Studio V2 schema validation failed from import:object-vector-object-type-drift\.json: root\.objects\[0\]\.type is not allowed\./);

      const objectIdentityPayloadPath = testInfo.outputPath("object-vector-object-identity-drift.json");
      await writeFile(objectIdentityPayloadPath, JSON.stringify({
        name: "Object Identity Drift",
        objects: [
          {
            id: "typed-object",
            name: "Typed Object",
            shapes: [],
            tags: []
          }
        ],
        toolId: "object-vector-studio-v2",
        version: 1
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(objectIdentityPayloadPath);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Object Vector Studio V2 schema validation failed from import:object-vector-object-identity-drift\.json: root\.objects\[0\]\.id typed-object must follow object\.game\.name\./);

      const runtimeAliasPayloadPath = testInfo.outputPath("object-vector-runtime-alias-drift.json");
      await writeFile(runtimeAliasPayloadPath, JSON.stringify({
        assetLibrary: {
          assets: [
            {
              id: "asset.drift.typed-object",
              name: "Runtime Alias",
              objectId: "object.drift.typed-object",
              tags: ["alias"]
            }
          ]
        },
        name: "Runtime Alias Drift",
        objects: [
          {
            id: "object.drift.typed-object",
            name: "Typed Object",
            shapes: [],
            tags: []
          }
        ],
        toolId: "object-vector-studio-v2",
        version: 1
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(runtimeAliasPayloadPath);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Object Vector Studio V2 schema validation failed from import:object-vector-runtime-alias-drift\.json: root\.assetLibrary is not allowed\./);

      const assetRuntimeIdPayloadPath = testInfo.outputPath("object-vector-asset-runtime-id-drift.json");
      await writeFile(assetRuntimeIdPayloadPath, JSON.stringify({
        assetLibrary: {
          assets: [
            {
              id: "asset.drift.typed-object",
              name: "Runtime Alias",
              tags: ["alias"]
            }
          ]
        },
        name: "Asset Runtime ID Drift",
        objects: [
          {
            id: "object.drift.typed-object",
            name: "Typed Object",
            shapes: [],
            tags: []
          }
        ],
        toolId: "object-vector-studio-v2",
        version: 1
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(assetRuntimeIdPayloadPath);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Object Vector Studio V2 schema validation failed from import:object-vector-asset-runtime-id-drift\.json: root\.assetLibrary is not allowed\./);

      const startupStatePayloadPath = testInfo.outputPath("object-vector-startup-state.json");
      await writeFile(startupStatePayloadPath, JSON.stringify({
        export: { fileName: "object-vector-studio-v2.json", format: "json", includeSelection: true },
        name: "Startup State Drift",
        objects: [],
        selection: { multiSelect: false, selectedObjectId: "", selectedShapeIndex: -1, selectedShapeIndexes: [] },
        toolId: "object-vector-studio-v2",
        version: 1,
        viewport: { height: 220, width: 320, x: 0, y: 0, zoom: 1 }
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(startupStatePayloadPath);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Object Vector Studio V2 schema validation failed from import:object-vector-startup-state\.json: root\.export is not allowed\. root\.selection is not allowed\. root\.viewport is not allowed\./);

      const invalidShapePayloadPath = testInfo.outputPath("object-vector-invalid-shape.json");
      await writeFile(invalidShapePayloadPath, JSON.stringify({
        name: "Invalid Shape",
        objects: [
          {
            id: "object.invalid.bad-object",
            name: "Bad Object",
            shapes: [
              {
                geometry: {},
                tool: "triangle",
                locked: false,
                order: 1,
                style: { fill: "#ffffff", fillOpacity: 1, stroke: "#ffffff", strokeOpacity: 1, strokeWidth: 3 },
                transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                visible: true
              }
            ],
            tags: []
          }
        ],
        toolId: "object-vector-studio-v2",
        version: 1
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(invalidShapePayloadPath);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Object Vector Studio V2 schema validation failed from import:object-vector-invalid-shape\.json: root\.objects\[0\]\.shapes\[0\] must match exactly one Object Vector Studio V2 shape schema\./);
      await expect(page.locator("#objectVectorStudioV2ObjectTiles")).toContainText("No objects loaded");
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toHaveText("{}");

      const validPayload = {
        name: "Asteroids Object Set",
        objects: Array.from({ length: 18 }, (_, index) => ({
          id: `object.asteroids.object-${index + 1}`,
          name: index === 0 ? "Asteroids Ship" : `Object ${index + 1}`,
          shapes: [],
          tags: index === 0 ? ["bubba", "player"] : []
        })),
        toolId: "object-vector-studio-v2",
        version: 1
      };
      await page.evaluate(() => {
        sessionStorage.setItem("object-vector-studio-v2.runtimePalette", JSON.stringify({
          id: "arcade-primary",
          swatches: [
            { id: "white", tags: ["zeta"], value: "#ffffff" },
            { id: "cyan", tags: ["alpha"], value: "#6fd3ff" }
          ]
        }));
      });
      const validPayloadPath = testInfo.outputPath("object-vector-valid.json");
      await writeFile(validPayloadPath, JSON.stringify(validPayload, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(validPayloadPath);
      await expect(page.locator("#objectVectorStudioV2PaletteSwatchCount")).toHaveText("(2 swatches)");
      await page.locator('button[aria-controls="objectVectorStudioV2JsonDetailsContent"]').click();
      await page.locator('button[aria-controls="objectVectorStudioV2DependencyGraphContent"]').click();
      await page.locator(".tool-starter__status-accordion-header").click();
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Runtime palette is read-only session\/workspace data; Object Vector JSON remains palette-free\./);
      await expect(page.locator("#objectVectorStudioV2PaletteSummary")).not.toContainText(/^Palette/);
      await expect(page.locator("#objectVectorStudioV2StrokeWidth")).toHaveValue("2");
      await expect(page.locator("label[for='objectVectorStudioV2StrokeWidth'] span")).not.toHaveText("Stroke Width");
      await expect(page.locator("label[for='objectVectorStudioV2StrokeWidth'] span")).toHaveText("Width");
      const paletteControlLayout = await page.locator("#objectVectorStudioV2PaletteContent").evaluate((content) => {
        const primaryRow = content.querySelector(".object-vector-studio-v2__palette-primary-row");
        const opacityRow = content.querySelector(".object-vector-studio-v2__palette-opacity-row");
        const paintButton = content.querySelector("#objectVectorStudioV2PaintModeButton").getBoundingClientRect();
        const strokeButton = content.querySelector("#objectVectorStudioV2StrokeModeButton").getBoundingClientRect();
        const widthLabel = content.querySelector("label[for='objectVectorStudioV2StrokeWidth']").getBoundingClientRect();
        const widthInput = content.querySelector("#objectVectorStudioV2StrokeWidth").getBoundingClientRect();
        const pickerButton = content.querySelector("#objectVectorStudioV2PalettePickerButton").getBoundingClientRect();
        const fillOpacityLabel = content.querySelector("label[for='objectVectorStudioV2FillOpacity']").getBoundingClientRect();
        const strokeOpacityLabel = content.querySelector("label[for='objectVectorStudioV2StrokeOpacity']").getBoundingClientRect();
        const opacityHeading = content.querySelector(".object-vector-studio-v2__palette-opacity-heading").getBoundingClientRect();
        const opacityInputs = Array.from(opacityRow.querySelectorAll("input"));
        const opacityInputRects = opacityInputs.map((input) => input.getBoundingClientRect());
        return {
          opacityBelowPrimary: fillOpacityLabel.top >= Math.max(paintButton.bottom, strokeButton.bottom, widthLabel.bottom),
          opacityHeading: content.querySelector(".object-vector-studio-v2__palette-opacity-heading").textContent.trim(),
          opacityInline: [fillOpacityLabel, strokeOpacityLabel].every((rect) => Math.abs((opacityHeading.top + opacityHeading.height / 2) - (rect.top + rect.height / 2)) < 4),
          opacityInputFitsFourDigits: opacityInputRects.every((rect) => Math.round(rect.width) >= 54),
          opacityInputRanges: opacityInputs.map((input) => ({ max: input.max, min: input.min, step: input.step, value: input.value })),
          opacityLabels: Array.from(opacityRow.querySelectorAll("label > span")).map((label) => label.textContent.trim()),
          opacityOrder: Array.from(opacityRow.children).map((element) => element.textContent.trim().replace(/\s+/g, " ")),
          pickerIconOnly: content.querySelector("#objectVectorStudioV2PalettePickerButton").textContent.trim() === "",
          pickerBetweenPaintAndStroke: pickerButton.left >= paintButton.right && pickerButton.right <= strokeButton.left,
          primaryInline: [strokeButton, widthLabel, pickerButton].every((rect) => Math.abs((paintButton.top + paintButton.height / 2) - (rect.top + rect.height / 2)) < 4),
          primaryOrder: Array.from(primaryRow.children).map((element) => element.matches("label") ? element.querySelector("span").textContent.trim() : (element.getAttribute("aria-label") || element.textContent).trim()),
          widthInputFitsXxDotX: Math.round(widthInput.width) >= 58,
          widthIsRightOfStroke: widthLabel.left >= strokeButton.right
        };
      });
      expect(paletteControlLayout).toEqual({
        opacityBelowPrimary: true,
        opacityHeading: "Opacity",
        opacityInline: true,
        opacityInputFitsFourDigits: true,
        opacityInputRanges: [
          { max: "255", min: "0", step: "1", value: "255" },
          { max: "255", min: "0", step: "1", value: "255" }
        ],
        opacityLabels: ["Fill", "Stroke"],
        opacityOrder: ["Opacity", "Fill", "Stroke"],
        pickerIconOnly: true,
        pickerBetweenPaintAndStroke: true,
        primaryInline: true,
        primaryOrder: ["Paint", "Picker", "Stroke", "Width"],
        widthInputFitsXxDotX: true,
        widthIsRightOfStroke: true
      });
      await expect(page.locator(".object-vector-studio-v2__palette-sort")).not.toContainText("Sort");
      await expect(page.locator(".object-vector-studio-v2__palette-sort button")).toHaveText(["Hue◇", "Sat◇", "Bri◇", "Name▲", "Tag◇"]);
      await expect(page.locator("[data-palette-sort='name']")).toHaveAttribute("data-sort-direction", "asc");
      const swatchState = await page.locator(".object-vector-studio-v2__palette-swatch").evaluateAll((swatches) => swatches.map((swatch) => {
        const rect = swatch.getBoundingClientRect();
        return {
          ariaLabel: swatch.getAttribute("aria-label"),
          height: Math.round(rect.height),
          text: swatch.textContent.trim(),
          title: swatch.getAttribute("title"),
          width: Math.round(rect.width)
        };
      }));
      expect(swatchState).toEqual([
        { ariaLabel: "Palette swatch cyan #6fd3ff", height: 32, text: "", title: "cyan\n#6fd3ff", width: 32 },
        { ariaLabel: "Palette swatch white #ffffff", height: 32, text: "", title: "white\n#ffffff", width: 32 }
      ]);
      await page.locator("[data-palette-sort='name']").click();
      await expect(page.locator(".object-vector-studio-v2__palette-sort button")).toHaveText(["Hue◇", "Sat◇", "Bri◇", "Name▼", "Tag◇"]);
      await expect(page.locator(".object-vector-studio-v2__palette-swatch").first()).toHaveAttribute("data-palette-label", "white");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Palette sort set to name desc\./);
      await page.locator("[data-palette-sort='hue']").click();
      await expect(page.locator(".object-vector-studio-v2__palette-sort button")).toHaveText(["Hue▲", "Sat◇", "Bri◇", "Name◇", "Tag◇"]);
      await expect(page.locator("[data-palette-sort='hue']")).toHaveAttribute("data-sort-direction", "asc");
      await expect(page.locator(".object-vector-studio-v2__palette-swatch").first()).toHaveAttribute("data-palette-label", "white");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Palette sort set to hue asc\./);
      await page.locator("[data-palette-sort='tag']").click();
      await expect(page.locator(".object-vector-studio-v2__palette-sort button")).toHaveText(["Hue◇", "Sat◇", "Bri◇", "Name◇", "Tag▲"]);
      await expect(page.locator("[data-palette-sort='tag']")).toHaveAttribute("data-sort-direction", "asc");
      await expect(page.locator(".object-vector-studio-v2__palette-swatch").first()).toHaveAttribute("data-palette-tags", "alpha");
      await expect(page.locator(".object-vector-studio-v2__palette-swatch").first()).toHaveAttribute("data-palette-label", "cyan");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Palette sort set to tag asc\./);
      await page.locator("[data-palette-sort='tag']").click();
      await expect(page.locator(".object-vector-studio-v2__palette-sort button")).toHaveText(["Hue◇", "Sat◇", "Bri◇", "Name◇", "Tag▼"]);
      await expect(page.locator(".object-vector-studio-v2__palette-swatch").first()).toHaveAttribute("data-palette-tags", "zeta");
      await expect(page.locator(".object-vector-studio-v2__palette-swatch").first()).toHaveAttribute("data-palette-label", "white");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Palette sort set to tag desc\./);
      const compactAccordionLayout = await page.evaluate(() => {
        const previewAccordion = document.querySelector(".object-vector-studio-v2__preview-accordion");
        const previewContent = document.querySelector("#objectVectorStudioV2WorkAreaContent");
        const paletteAccordion = document.querySelector(".object-vector-studio-v2__palette-accordion");
        const paletteContent = document.querySelector("#objectVectorStudioV2PaletteContent");
        return {
          paletteContentHasNoFiller: paletteContent.clientHeight <= paletteContent.scrollHeight + 2,
          paletteFlexGrow: getComputedStyle(paletteAccordion).flexGrow,
          previewContentHasNoFiller: previewContent.clientHeight <= previewContent.scrollHeight + 2,
          previewFlexGrow: getComputedStyle(previewAccordion).flexGrow
        };
      });
      expect(compactAccordionLayout).toEqual({
        paletteContentHasNoFiller: true,
        paletteFlexGrow: "0",
        previewContentHasNoFiller: true,
        previewFlexGrow: "0"
      });
      await expect(page.locator("#objectVectorStudioV2ObjectTiles .object-vector-studio-v2__object-tile")).toHaveCount(18);
      await expect(page.locator("#objectVectorStudioV2ObjectsCount")).toHaveText(/\(18 obj, states \d+, 0 shapes\)/);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails")).toContainText("No shape selected");
      await expect(page.locator("#objectVectorStudioV2ObjectPreviewFooter")).toContainText("Object ID: object.asteroids.object-1");
      await expect(page.locator("#objectVectorStudioV2ObjectTagList [data-object-tag]")).toHaveText(["bubba", "player"]);
      const tagChipLayout = await page.locator("#objectVectorStudioV2ObjectContent").evaluate((element) => {
        const tagInput = element.querySelector("#objectVectorStudioV2ObjectTagInput").getBoundingClientRect();
        const addButton = element.querySelector("#objectVectorStudioV2AddTagButton").getBoundingClientRect();
        const chips = Array.from(element.querySelectorAll("#objectVectorStudioV2ObjectTagList [data-object-tag]"));
        const chipRects = chips.map((chip) => chip.getBoundingClientRect());
        return {
          addButtonWidth: Math.round(addButton.width),
          chipTexts: chips.map((chip) => chip.textContent.trim()),
          chipWidths: chipRects.map((rect) => Math.round(rect.width)),
          chipsBelowAddRow: chipRects.every((rect) => rect.top >= addButton.bottom),
          chipsSameRow: chipRects.every((rect) => Math.abs(rect.top - chipRects[0].top) <= 2),
          inputAndAddInline: Math.abs((tagInput.top + tagInput.height / 2) - (addButton.top + addButton.height / 2)) < 4 && tagInput.right <= addButton.left
        };
      });
      expect(tagChipLayout).toEqual({
        addButtonWidth: 77,
        chipTexts: ["bubba", "player"],
        chipWidths: [77, 77],
        chipsBelowAddRow: true,
        chipsSameRow: true,
        inputAndAddInline: true
      });
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-1600 -1100 3200 2200");
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-center-origin='0,0']")).toHaveCount(1);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-center-origin='0,0']")).toHaveAttribute("r", "9");
      await expect(page.locator("#objectVectorStudioV2ViewportControls button")).toHaveText(["Out", "In", "Up", "Down", "Left", "Right", "View", "Center"]);
      await expect(page.locator("#objectVectorStudioV2CenterDotButton")).toHaveAttribute("aria-pressed", "true");
      await page.locator("#objectVectorStudioV2PanRightButton").click();
      await page.locator("#objectVectorStudioV2PanDownButton").click();
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toHaveText("Origin: 2, 2 | Canvas origin -2,-2 from center | Zoom 100%");
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-1580 -1080 3200 2200");
      await page.locator("#objectVectorStudioV2RenderSurface").hover({ position: { x: 12, y: 12 } });
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toContainText("Pointer");
      await page.locator("#objectVectorStudioV2CenterDotButton").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-1580 -1080 3200 2200");
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toContainText("Canvas origin -2,-2 from center | Zoom 100%");
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-center-origin='0,0']")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2CenterDotButton")).toHaveAttribute("aria-pressed", "false");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Center dot hidden\./);
      await page.locator("#objectVectorStudioV2ResetViewButton").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-1600 -1100 3200 2200");
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toHaveText("Origin: 0, 0 | Canvas origin 0,0 centered | Zoom 100%");
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-center-origin='0,0']")).toHaveCount(0);
      const dragPanState = await page.locator("#objectVectorStudioV2RenderSurface").evaluate((surface) => {
        const app = window.__objectVectorStudioV2App;
        const rect = surface.getBoundingClientRect();
        const start = {
          clientX: rect.left + rect.width * 0.5,
          clientY: rect.top + rect.height * 0.5
        };
        const end = {
          clientX: start.clientX + 72,
          clientY: start.clientY + 36
        };
        const pointerInit = {
          bubbles: true,
          button: 0,
          buttons: 1,
          cancelable: true,
          pointerId: 41,
          pointerType: "mouse"
        };
        const before = { ...app.viewport };
        surface.dispatchEvent(new PointerEvent("pointerdown", { ...pointerInit, ...start }));
        window.dispatchEvent(new PointerEvent("pointermove", { ...pointerInit, ...end }));
        const panningClassDuringDrag = surface.classList.contains("is-canvas-panning");
        window.dispatchEvent(new PointerEvent("pointerup", { ...pointerInit, buttons: 0, ...end }));
        return {
          after: { ...app.viewport },
          before,
          panningClassDuringDrag,
          viewBox: surface.getAttribute("viewBox")
        };
      });
      expect(dragPanState.panningClassDuringDrag).toBe(true);
      expect(dragPanState.after.x).toBeLessThan(dragPanState.before.x);
      expect(dragPanState.after.y).toBeLessThan(dragPanState.before.y);
      expect(dragPanState.viewBox).not.toBe("-1600 -1100 3200 2200");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Viewport drag-pan set to/);
      await page.locator("#objectVectorStudioV2ResetViewButton").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-1600 -1100 3200 2200");
      await page.locator("#objectVectorStudioV2CenterDotButton").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-center-origin='0,0']")).toHaveCount(1);
      await expect(page.locator("#objectVectorStudioV2CenterDotButton")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Center dot visible\./);
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"name": "Asteroids Ship"');
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"selectedShape": null');
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).not.toContainText('"palette"');
      await expect(page.locator("#objectVectorStudioV2CopyJsonButton")).toBeEnabled();
      await expect(page.locator("#objectVectorStudioV2ExportJsonButton")).toBeEnabled();
      await expect(page.locator("#objectVectorStudioV2ExportSvgButton")).toBeEnabled();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded Object Vector Studio V2 schema payload from import:object-vector-valid\.json: 18 objects\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Render mode svg-work-surface: rendered Asteroids Ship with 0 visible shapes; capture mode none\./);

      await drawDefaultObjectVectorShape(page, "rectangle");
      await expect(page.locator("#objectVectorStudioV2ObjectsCount")).toHaveText(/\(18 obj, states \d+, 1 shape\)/);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']")).toHaveClass(/is-selected/);
      await expect(page.locator("[data-palette-color='#ffffff']")).toHaveClass(/is-selected/);
      await expect(page.locator("#objectVectorStudioV2ShapeList")).toHaveCount(0);
      await expect(page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index='0']")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"selectedShape"');
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"tool": "rectangle"');
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).not.toContainText('"type": "rectangle"');
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails")).not.toContainText("Editable fields below are limited to schema-valid geometry");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails")).not.toContainText("Selected Shape");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails")).not.toContainText("Fill Color");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails")).not.toContainText("Shaperectangle-1 (rectangle)");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometrySummary")).toHaveText("");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryName")).toHaveText("");
      await expect(page.locator('button[aria-controls="objectVectorStudioV2ShapeGeometryContent"]')).toContainText("Shape Geometry");
      await expect(page.locator('button[aria-controls="objectVectorStudioV2ShapeGeometryContent"]')).not.toContainText("rectangle-1");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails")).not.toContainText("Transform");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails #objectVectorStudioV2MoveShapeButton")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2ObjectTransform")).not.toContainText("Selected Shape:");
      await expect(page.locator("#objectVectorStudioV2ObjectTransform #objectVectorStudioV2ObjectMoveButton")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2ObjectTransform #objectVectorStudioV2MoveShapeButton")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2ShapeTransform .object-vector-studio-v2__transform-summary")).toHaveText("x 0, y 0, rot 0, scale 1");
      await expect(page.locator("#objectVectorStudioV2ShapeTransform #objectVectorStudioV2MoveShapeButton")).toHaveCount(1);
      const transformSummaryLayout = await page.locator("#objectVectorStudioV2ShapeTransform").evaluate((panel) => {
        const originRow = panel.querySelector(".object-vector-studio-v2__transform-control-row--origin");
        const rotateRow = panel.querySelector(".object-vector-studio-v2__transform-control-row--rotate");
        const scaleRow = panel.querySelector(".object-vector-studio-v2__scale-control-row");
        const summary = panel.querySelector(".object-vector-studio-v2__transform-summary");
        const summaryStyle = getComputedStyle(summary);
        return {
          hasShapeOriginControls: Boolean(originRow || panel.querySelector("#objectVectorStudioV2ApplyOriginButton") || panel.querySelector("#objectVectorStudioV2AutoOriginButton")),
          rotateBeforeScale: Boolean(rotateRow && scaleRow && (rotateRow.compareDocumentPosition(scaleRow) & Node.DOCUMENT_POSITION_FOLLOWING)),
          summaryAfterScale: Boolean(scaleRow && summary && (scaleRow.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING)),
          summaryCentered: summaryStyle.textAlign === "center",
          summaryStartsWithoutTransform: !summary.textContent.trim().startsWith("Transform"),
          summaryTopAtBottom: summary.getBoundingClientRect().top >= scaleRow.getBoundingClientRect().bottom
        };
      });
      expect(transformSummaryLayout).toEqual({
        hasShapeOriginControls: false,
        rotateBeforeScale: true,
        summaryAfterScale: true,
        summaryCentered: true,
        summaryStartsWithoutTransform: true,
        summaryTopAtBottom: true
      });
      const transformIconState = await page.locator("#objectVectorStudioV2ShapeTransform").evaluate((panel) => ({
        shapeOriginControlsRemoved: panel.querySelector("#objectVectorStudioV2ApplyOriginButton") === null
          && panel.querySelector("#objectVectorStudioV2AutoOriginButton") === null,
        resize: {
          iconKey: panel.querySelector("#objectVectorStudioV2ResizeShapeButton").dataset.ovsIconKey,
          iconName: panel.querySelector("#objectVectorStudioV2ResizeShapeButton").dataset.ovsIconName,
          title: panel.querySelector("#objectVectorStudioV2ResizeShapeButton").title
        },
        scaleActionRemoved: panel.querySelector("#objectVectorStudioV2ScaleShapeButton") === null
      }));
      expect(transformIconState).toEqual({
        shapeOriginControlsRemoved: true,
        resize: { iconKey: "resize", iconName: "nf-md-resize", title: "Resize Geometry" },
        scaleActionRemoved: true
      });
      const objectOriginIconState = await page.locator("#objectVectorStudioV2ObjectTransform").evaluate((panel) => ({
        applyOrigin: {
          hasIcon: panel.querySelector("#objectVectorStudioV2ObjectApplyOriginButton").classList.contains("object-vector-studio-v2__nerd-icon"),
          iconKey: panel.querySelector("#objectVectorStudioV2ObjectApplyOriginButton").dataset.ovsIconKey,
          iconName: panel.querySelector("#objectVectorStudioV2ObjectApplyOriginButton").dataset.ovsIconName,
          title: panel.querySelector("#objectVectorStudioV2ObjectApplyOriginButton").title
        },
        autoOrigin: {
          hasIcon: panel.querySelector("#objectVectorStudioV2ObjectAutoOriginButton").classList.contains("object-vector-studio-v2__nerd-icon"),
          iconKey: panel.querySelector("#objectVectorStudioV2ObjectAutoOriginButton").dataset.ovsIconKey,
          iconName: panel.querySelector("#objectVectorStudioV2ObjectAutoOriginButton").dataset.ovsIconName,
          title: panel.querySelector("#objectVectorStudioV2ObjectAutoOriginButton").title
        }
      }));
      expect(objectOriginIconState).toEqual({
        applyOrigin: { hasIcon: false, iconKey: undefined, iconName: undefined, title: "Apply Object Origin" },
        autoOrigin: { hasIcon: false, iconKey: undefined, iconName: undefined, title: "Auto Origin" }
      });
      const scaleControlLayout = await page.locator("#objectVectorStudioV2ShapeTransform .object-vector-studio-v2__scale-control-row").evaluate((row) => {
        const children = Array.from(row.children);
        const centers = children.map((child) => {
          const rect = child.getBoundingClientRect();
          return Math.round(rect.top + rect.height / 2);
        });
        const scaleInput = row.querySelector("#objectVectorStudioV2ScaleInput");
        const scaleInputStyle = getComputedStyle(scaleInput);
        const spinnerCssRuleExists = Array.from(document.styleSheets).some((sheet) => (
          Array.from(sheet.cssRules || []).some((rule) => (
            rule.selectorText?.includes(".object-vector-studio-v2__scale-input::-webkit-inner-spin-button")
              && rule.cssText.toLowerCase().includes("appearance: none")
          ))
        ));
        return {
          allOneLine: centers.every((center) => Math.abs(center - centers[0]) <= 2),
          appearance: scaleInputStyle.appearance,
          order: children.map((child) => child.tagName === "INPUT" ? child.value : child.textContent.trim()),
          resetTitle: row.querySelector("#objectVectorStudioV2ResetShapeScaleButton").title,
          scaleInputFitsNegativeThreeDecimals: (() => {
            const priorValue = scaleInput.value;
            scaleInput.value = "-12.345";
            const fits = scaleInput.scrollWidth <= scaleInput.clientWidth + 1;
            scaleInput.value = priorValue;
            return fits;
          })(),
          resizeTitle: row.querySelector("#objectVectorStudioV2ResizeShapeButton").title,
          spinnerCssRuleExists
        };
      });
      expect(scaleControlLayout).toEqual({
        allOneLine: true,
        appearance: "textfield",
        order: ["Scale", "--", "-", "1", "+", "++", "Resize", "X"],
        resetTitle: "Reset Scale to 1.0",
        scaleInputFitsNegativeThreeDecimals: true,
        resizeTitle: "Resize Geometry",
        spinnerCssRuleExists: true
      });
      const shapeGeometryOrder = await page.locator("#objectVectorStudioV2ShapeGeometryDetails").evaluate((details) => {
        return {
          noApplyButton: !details.querySelector("#objectVectorStudioV2ApplyGeometryButton"),
          noHelperText: !details.textContent.includes("Editable fields below"),
          noSelectedShapeText: !details.textContent.includes("Selected Shape"),
          noPointStyleDropdowns: details.querySelectorAll("[data-shape-point-style-field]").length === 0,
          noPointStyleHeading: !details.textContent.includes("Point Style:"),
          summaryItems: Array.from(details.querySelectorAll("h4, .object-vector-studio-v2__detail-label, .object-vector-studio-v2__detail-value"))
            .map((element) => element.textContent.trim()),
        };
      });
      expect(shapeGeometryOrder.noApplyButton).toBe(true);
      expect(shapeGeometryOrder.noHelperText).toBe(true);
      expect(shapeGeometryOrder.noSelectedShapeText).toBe(true);
      expect(shapeGeometryOrder.noPointStyleDropdowns).toBe(true);
      expect(shapeGeometryOrder.noPointStyleHeading).toBe(true);
      expect(shapeGeometryOrder.summaryItems).toEqual([
        "Rectangle Geometry",
        "Point Rounding",
        "Group",
        "None"
      ]);
      const rectanglePointStyleRender = await page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']").evaluate((shape) => ({
        pointStyle: shape.dataset.pointStyle,
        strokeLinejoin: shape.getAttribute("stroke-linejoin")
      }));
      expect(rectanglePointStyleRender).toEqual({ pointStyle: "square", strokeLinejoin: "miter" });
      const roundingRadiusInput = page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-shape-rounding-radius='true']");
      await expect(roundingRadiusInput).toBeVisible();
      await expect(roundingRadiusInput).toHaveValue("4");
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__point-rounding-list [data-polygon-point-round='true'][data-polygon-point-index='0']").check();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Updated point 1 rounding to round for shape row 0\./);
      const roundedRectangleBeforeRadius = await page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']").evaluate((shape) => ({
        d: shape.getAttribute("d"),
        pointRounding: window.__objectVectorStudioV2App.selectedShape().style.pointRounding,
        roundedPointRender: shape.dataset.roundedPointRender,
        tag: shape.tagName.toLowerCase()
      }));
      expect(roundedRectangleBeforeRadius).toEqual({
        d: expect.stringContaining("Q"),
        pointRounding: [true, false, false, false],
        roundedPointRender: "path",
        tag: "path"
      });
      await roundingRadiusInput.fill("8");
      await roundingRadiusInput.dispatchEvent("change");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Updated rounding radius to 8 for shape row 0\./);
      const roundedRectangleAfterRadius = await page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']").evaluate((shape) => ({
        d: shape.getAttribute("d"),
        roundingRadius: window.__objectVectorStudioV2App.selectedShape().style.roundingRadius
      }));
      expect(roundedRectangleAfterRadius.roundingRadius).toBe(8);
      expect(roundedRectangleAfterRadius.d).not.toBe(roundedRectangleBeforeRadius.d);
      await roundingRadiusInput.fill("-1");
      await roundingRadiusInput.dispatchEvent("change");
      await expect(roundingRadiusInput).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Invalid rounding radius rejected for shape row 0: Rounding Radius must be a finite number greater than or equal to 0\./);
      await expect.poll(() => page.evaluate(() => window.__objectVectorStudioV2App.selectedShape().style.roundingRadius)).toBe(8);
      await roundingRadiusInput.fill("8");
      await roundingRadiusInput.dispatchEvent("change");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Updated rounding radius to 8 for shape row 0\./);
      const transformControlLayout = await page.locator("#objectVectorStudioV2ShapeTransform").evaluate((panel) => (
        Array.from(panel.querySelectorAll(".object-vector-studio-v2__transform-control-row")).map((row) => {
          const children = Array.from(row.children).filter((child) => child.getClientRects().length > 0);
          const rects = children.map((child) => child.getBoundingClientRect());
          const rowHeight = Math.max(...rects.map((rect) => rect.bottom)) - Math.min(...rects.map((rect) => rect.top));
          const maxChildHeight = Math.max(...rects.map((rect) => rect.height));
          const button = row.querySelector("button");
          const buttons = Array.from(row.querySelectorAll("button"));
          const visible = (element) => element.getClientRects().length > 0;
          return {
            allOneLine: rowHeight <= maxChildHeight + 4,
            axisLabels: Array.from(row.querySelectorAll(".object-vector-studio-v2__transform-axis-field > span")).map((element) => element.textContent.trim()),
            buttonId: button?.id || "",
            buttonIds: buttons.map((candidate) => candidate.id),
            buttonText: button?.textContent.trim() || "",
            buttonTexts: buttons.map((candidate) => candidate.textContent.trim()),
            buttonTitle: button?.title || "",
            buttonTitles: buttons.map((candidate) => candidate.title),
            inputIds: Array.from(row.querySelectorAll("input")).map((input) => input.id),
            label: row.querySelector(".object-vector-studio-v2__transform-control-label")?.textContent.trim() || "",
            rowType: row.dataset.transformControlRow,
            selectIds: Array.from(row.querySelectorAll("select")).map((select) => select.id),
            visibleInputIds: Array.from(row.querySelectorAll("input")).filter(visible).map((input) => input.id),
            visibleSelectIds: Array.from(row.querySelectorAll("select")).filter(visible).map((select) => select.id)
          };
        })
      ));
      expect(transformControlLayout).toEqual([
        {
          allOneLine: true,
          axisLabels: ["X", "Y"],
          buttonId: "objectVectorStudioV2MoveShapeButton",
          buttonIds: ["objectVectorStudioV2MoveShapeButton"],
          buttonText: "Move",
          buttonTexts: ["Move"],
          buttonTitle: "",
          buttonTitles: [""],
          inputIds: ["objectVectorStudioV2MoveXInput", "objectVectorStudioV2MoveYInput"],
          label: "Move",
          rowType: "move",
          selectIds: [],
          visibleInputIds: ["objectVectorStudioV2MoveXInput", "objectVectorStudioV2MoveYInput"],
          visibleSelectIds: []
        },
        {
          allOneLine: true,
          axisLabels: [],
          buttonId: "objectVectorStudioV2RotateShapeButton",
          buttonIds: ["objectVectorStudioV2RotateShapeButton"],
          buttonText: "Rotate",
          buttonTexts: ["Rotate"],
          buttonTitle: "",
          buttonTitles: [""],
          inputIds: ["objectVectorStudioV2RotateInput"],
          label: "Rotate",
          rowType: "rotate",
          selectIds: ["objectVectorStudioV2RotateSnapSelect", "objectVectorStudioV2SnapAngleStepSelect"],
          visibleInputIds: ["objectVectorStudioV2RotateInput"],
          visibleSelectIds: []
        }
      ]);
      await expect(page.locator("#objectVectorStudioV2RotateInput")).toHaveAttribute("min", "-359");
      await expect(page.locator("#objectVectorStudioV2RotateInput")).toHaveAttribute("max", "359");
      await expect(page.locator("#objectVectorStudioV2RotateInput")).toBeEnabled();
      await expect(page.locator("#objectVectorStudioV2RotateInput")).toBeVisible();
      await expect(page.locator("#objectVectorStudioV2RotateSnapSelect")).toBeDisabled();
      await expect(page.locator("#objectVectorStudioV2RotateSnapSelect")).toBeHidden();
      await expect(page.locator("#objectVectorStudioV2SnapAngleStepSelect")).toBeDisabled();
      await expect(page.locator("#objectVectorStudioV2SnapAngleStepSelect")).toBeHidden();
      const transformBeforeInvalid = await page.evaluate(() => window.__objectVectorStudioV2App.selectedShape().transform);
      await page.locator("#objectVectorStudioV2MoveXInput").fill("");
      await page.locator("#objectVectorStudioV2MoveYInput").fill("7");
      await page.locator("#objectVectorStudioV2MoveShapeButton").click();
      await expect(page.locator("#objectVectorStudioV2MoveXInput")).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Invalid transform rejected for shape row 0: Move X must be a finite number\./);
      const transformAfterInvalid = await page.evaluate(() => window.__objectVectorStudioV2App.selectedShape().transform);
      expect(transformAfterInvalid).toEqual(transformBeforeInvalid);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetailsActions")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2ShapeVisibilityButton")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2ShapeLockButton")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2DuplicateShapeButton")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2DeleteShapeButton")).toHaveCount(0);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Created rectangle shape on Asteroids Ship from canvas click\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Render mode svg-work-surface: rendered Asteroids Ship with 1 visible shapes; capture mode none\./);
      const createdRectangleSchemaDefaults = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const schema = app.schemaService.schema;
        const shape = app.selectedShape();
        return {
          geometry: shape.geometry,
          locked: shape.locked,
          schemaGeometry: schema.$defs.rectangleGeometry.default,
          schemaShapeCommon: schema.$defs.shapeCommon.default,
          schemaStyle: schema.$defs.style.default,
          schemaTransform: schema.$defs.transform.default,
          style: shape.style,
          tool: shape.tool,
          transform: shape.transform,
          visible: shape.visible
        };
      });
      expect(createdRectangleSchemaDefaults).toMatchObject({
        geometry: { height: 60, width: 80, x: -80, y: -30 },
        locked: createdRectangleSchemaDefaults.schemaShapeCommon.locked,
        schemaGeometry: undefined,
        style: {
          fill: "#00000000",
          fillOpacity: createdRectangleSchemaDefaults.schemaStyle.fillOpacity,
          stroke: "#ffffff",
          strokeOpacity: createdRectangleSchemaDefaults.schemaStyle.strokeOpacity,
          strokeWidth: 2
        },
        tool: "rectangle",
        transform: {
          rotation: createdRectangleSchemaDefaults.schemaTransform.rotation,
          scaleX: createdRectangleSchemaDefaults.schemaTransform.scaleX,
          scaleY: createdRectangleSchemaDefaults.schemaTransform.scaleY,
          x: createdRectangleSchemaDefaults.schemaTransform.x,
          y: createdRectangleSchemaDefaults.schemaTransform.y
        },
        visible: createdRectangleSchemaDefaults.schemaShapeCommon.visible
      });

      await drawDefaultObjectVectorShape(page, "circle");
      await expect(page.locator("#objectVectorStudioV2ObjectsCount")).toHaveText(/\(18 obj, states \d+, 2 shapes\)/);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='1']")).toHaveClass(/is-selected/);
      await expect(page.locator("[data-palette-color='#ffffff']")).toHaveClass(/is-selected/);
      await expect(page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1']")).toHaveClass(/is-selected/);
      const objectOneShapeButtons = page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index]");
      await expect(objectOneShapeButtons).toHaveCount(2);
      await expect(objectOneShapeButtons.first()).toHaveAttribute("data-object-tile-shape-index", "1");
      await expect(objectOneShapeButtons.last()).toHaveAttribute("data-object-tile-shape-index", "0");
      await expect(page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index] .object-vector-studio-v2__shape-select-label")).toHaveText(["1. Circle", "0. Rectangle"]);
      await expect(page.locator(".object-vector-studio-v2__object-tile-shape-row.is-selected [data-object-tile-shape-index='1']")).toHaveCount(1);
      const shapeTileActionLayout = await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes .object-vector-studio-v2__object-tile-shape-row").first().evaluate((row) => {
        const visibility = row.querySelector("[data-shape-visibility-index]");
        const deleteButton = row.querySelector("[data-shape-delete-index]");
        const visibilityRect = visibility.getBoundingClientRect();
        const deleteRect = deleteButton.getBoundingClientRect();
        return {
          adjacent: Math.abs(visibilityRect.right - deleteRect.left) <= 4,
          deleteTitle: deleteButton.title,
          visibilityBeforeDelete: visibilityRect.left < deleteRect.left,
          visibilityTitle: visibility.title
        };
      });
      expect(shapeTileActionLayout).toEqual({
        adjacent: true,
        deleteTitle: "Delete this base shape from every state",
        visibilityBeforeDelete: true,
        visibilityTitle: "Toggle state/frame shape visibility"
      });
      const shapeHierarchyDensity = await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes").evaluate((panel) => {
        const shapeList = panel;
        const shapeRow = panel.querySelector(".object-vector-studio-v2__object-tile-shape-row");
        const shapeButton = panel.querySelector("[data-object-tile-shape-index]");
        const shapeLabel = panel.querySelector(".object-vector-studio-v2__shape-select-label");
        return {
          fontSize: Number.parseFloat(getComputedStyle(shapeRow).fontSize),
          gap: Number.parseFloat(getComputedStyle(shapeList).gap),
          labelLineHeight: Number.parseFloat(getComputedStyle(shapeLabel).lineHeight),
          rowHeight: Math.round(shapeButton.getBoundingClientRect().height)
        };
      });
      expect(shapeHierarchyDensity.fontSize).toBeLessThanOrEqual(12);
      expect(shapeHierarchyDensity.gap).toBeLessThanOrEqual(3);
      expect(shapeHierarchyDensity.labelLineHeight).toBeLessThanOrEqual(14);
      expect(shapeHierarchyDensity.rowHeight).toBeLessThanOrEqual(28);
      const gridObjectScale = await page.locator("#objectVectorStudioV2RenderSurface").evaluate((surface) => {
        const rectangle = surface.querySelector("[data-shape-index='0']");
        const workArea = document.querySelector(".object-vector-studio-v2__work-area");
        const workAreaStyle = getComputedStyle(workArea);
        const availableWidth = workArea.clientWidth - Number.parseFloat(workAreaStyle.paddingLeft) - Number.parseFloat(workAreaStyle.paddingRight);
        const verticalLines = Array.from(surface.querySelectorAll("[data-grid-rendered='true'] line"))
          .filter((line) => line.getAttribute("x1") === line.getAttribute("x2"))
          .map((line) => Number(line.getAttribute("x1")));
        const horizontalLines = Array.from(surface.querySelectorAll("[data-grid-rendered='true'] line"))
          .filter((line) => line.getAttribute("y1") === line.getAttribute("y2"))
          .map((line) => Number(line.getAttribute("y1")));
        const viewBox = surface.getAttribute("viewBox").split(/\s+/).map(Number);
        const surfaceRect = surface.getBoundingClientRect();
        return {
          aspectRatioMatchesViewBox: Math.abs((surfaceRect.width / surfaceRect.height) - (viewBox[2] / viewBox[3])) < 0.02,
          canvasFillsAvailableWidth: Math.abs(surfaceRect.width - availableWidth) <= 2,
          gridStepRestored: Math.min(...verticalLines.filter((x) => x > 0)) === 10 && Math.min(...horizontalLines.filter((y) => y > 0)) === 10,
          rectangle: {
            height: Number(rectangle.getAttribute("height")),
            width: Number(rectangle.getAttribute("width")),
            x: Number(rectangle.getAttribute("x")),
            y: Number(rectangle.getAttribute("y"))
          },
          rectangleUsesPreviewDrawingScale: Number(rectangle.getAttribute("x")) === -800
            && Number(rectangle.getAttribute("y")) === -300
            && Number(rectangle.getAttribute("width")) === 800
            && Number(rectangle.getAttribute("height")) === 600,
          unitGridSpacingRemoved: !verticalLines.includes(-79) && !horizontalLines.includes(-29)
        };
      });
      expect(gridObjectScale).toEqual({
        aspectRatioMatchesViewBox: true,
        canvasFillsAvailableWidth: true,
        gridStepRestored: true,
        rectangle: { height: 600, width: 800, x: -800, y: -300 },
        rectangleUsesPreviewDrawingScale: true,
        unitGridSpacingRemoved: true
      });
      const objectTileActionLayout = await page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1']").evaluate((tile) => {
        const controls = Array.from(tile.querySelectorAll("[data-object-control]"));
        const rects = controls.map((control) => control.getBoundingClientRect());
        const deleteButton = tile.querySelector("[data-object-control='delete']");
        const deleteRect = deleteButton.getBoundingClientRect();
        const tileRect = tile.getBoundingClientRect();
        return {
          allTextEmpty: controls.every((control) => control.textContent.trim() === ""),
          controlOrder: controls.map((control) => control.dataset.objectControl),
          deleteAtFarRight: Math.abs(tileRect.right - deleteRect.right) <= 12,
          deleteTitle: deleteButton.title,
          iconFontsUseNerd: controls.every((control) => getComputedStyle(control.querySelector("[data-ovs-icon]"), "::before").fontFamily.includes("0xProto Nerd Font")),
          iconKeys: controls.map((control) => control.querySelector("[data-ovs-icon]")?.dataset.ovsIconKey),
          iconNames: controls.map((control) => control.querySelector("[data-ovs-icon]")?.dataset.ovsIconName),
          iconGlyphSizes: controls.map((control) => Number.parseFloat(getComputedStyle(control.querySelector("[data-ovs-icon]"), "::before").fontSize)),
          iconSizes: rects.map((rect) => Math.round(Math.max(rect.width, rect.height))),
          stacked: rects.every((rect, index) => index === 0
            || (Math.abs(rect.left - rects[index - 1].left) <= 1 && rect.top > rects[index - 1].top))
        };
      });
      expect(objectTileActionLayout).toMatchObject({
        allTextEmpty: true,
        controlOrder: ["visibility", "lock", "delete"],
        deleteAtFarRight: true,
        deleteTitle: "Delete this object",
        iconFontsUseNerd: true,
        iconKeys: ["eye", "unlock", "delete"],
        iconNames: ["nf-fa-eye", "nf-fa-unlock", "nf-md-trash_can_outline"],
        iconSizes: [26, 26, 26],
        stacked: true
      });
      expect(objectTileActionLayout.iconGlyphSizes.every((size) => size >= 22)).toBe(true);
      await expect(page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1'] [data-object-control='visibility']")).toHaveText("");
      await expect(page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1'] [data-object-control='lock']")).toHaveText("");
      await expect(page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1'] [data-object-control='delete']")).toHaveText("");
      await expect(page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1'] [data-object-control='visibility'] .object-vector-studio-v2__tile-icon--eye")).toHaveCount(1);
      await expect(page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1'] [data-object-control='lock'] .object-vector-studio-v2__tile-icon--lock")).toHaveCount(1);
      await expect(page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1'] [data-object-control='delete'] .object-vector-studio-v2__tile-icon--delete")).toHaveCount(1);
      await page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1'] [data-object-control='visibility']").click();
      await expect(page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1']")).toHaveClass(/is-hidden/);
      await expect(page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1'] [data-object-control='visibility'] [data-ovs-icon-key='eyeOff']")).toHaveCount(1);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index]")).toHaveCount(0);
      await page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1'] [data-object-control='visibility']").click();
      await expect(page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1'] [data-object-control='visibility'] [data-ovs-icon-key='eye']")).toHaveCount(1);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index]")).toHaveCount(2);
      await page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1'] [data-object-control='lock']").click();
      await expect(page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1']")).toHaveClass(/is-locked/);
      await expect(page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1'] [data-object-control='lock'] [data-ovs-icon-key='lock']")).toHaveCount(1);
      await expect(page.locator("#objectVectorStudioV2RenameObjectButton")).toBeDisabled();
      await expect(page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1'] [data-object-control='delete']")).toBeDisabled();
      await drawDefaultObjectVectorShape(page, "line");
      await expect(page.locator("#objectVectorStudioV2ObjectsCount")).toHaveText(/\(18 obj, states \d+, 2 shapes\)/);
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Create line blocked: object Asteroids Ship is locked for this runtime session\./);
      await page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1'] [data-object-control='lock']").click();
      await expect(page.locator("#objectVectorStudioV2RenameObjectButton")).toBeEnabled();
      await expect(page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1'] [data-object-control='delete']")).toBeEnabled();

      const forceLeftPanelScroll = async () => page.evaluate(() => {
        const leftPanel = document.querySelector(".tool-starter__panel--left");
        const objectsContent = document.querySelector("#objectVectorStudioV2ObjectsContent");
        if (!leftPanel.dataset.scrollPersistenceStylesCaptured) {
          leftPanel.dataset.scrollPersistenceStylesCaptured = "true";
          leftPanel.dataset.scrollPersistenceHeight = leftPanel.style.height;
          leftPanel.dataset.scrollPersistenceMaxHeight = leftPanel.style.maxHeight;
          leftPanel.dataset.scrollPersistenceOverflowY = leftPanel.style.overflowY;
        }
        leftPanel.style.height = "150px";
        leftPanel.style.maxHeight = "150px";
        leftPanel.style.overflowY = "auto";
        leftPanel.scrollTop = 24;
        objectsContent.scrollTop = 32;
        return {
          leftPanelScrollTop: leftPanel.scrollTop,
          objectsScrollTop: objectsContent.scrollTop
        };
      });
      const readLeftPanelScroll = async () => page.evaluate(() => {
        const leftPanel = document.querySelector(".tool-starter__panel--left");
        const objectsContent = document.querySelector("#objectVectorStudioV2ObjectsContent");
        return {
          leftPanelScrollTop: leftPanel.scrollTop,
          objectsScrollTop: objectsContent.scrollTop
        };
      });
      const restoreLeftPanelStyle = async () => page.evaluate(() => {
        const leftPanel = document.querySelector(".tool-starter__panel--left");
        leftPanel.style.height = leftPanel.dataset.scrollPersistenceHeight || "";
        leftPanel.style.maxHeight = leftPanel.dataset.scrollPersistenceMaxHeight || "";
        leftPanel.style.overflowY = leftPanel.dataset.scrollPersistenceOverflowY || "";
        delete leftPanel.dataset.scrollPersistenceStylesCaptured;
        delete leftPanel.dataset.scrollPersistenceHeight;
        delete leftPanel.dataset.scrollPersistenceMaxHeight;
        delete leftPanel.dataset.scrollPersistenceOverflowY;
      });
      const clickPreviewShape = async (shapeIndex, eventInit = {}) => {
        await page.locator(`#objectVectorStudioV2RenderSurface [data-shape-index='${shapeIndex}']`).dispatchEvent("click", {
          bubbles: true,
          cancelable: true,
          ...eventInit
        });
      };
      const rightClickPreviewShape = async (shapeIndex) => {
        const locator = page.locator(`#objectVectorStudioV2RenderSurface [data-shape-index='${shapeIndex}']`);
        const box = await locator.boundingBox();
        expect(box).not.toBeNull();
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: "right" });
      };

      const leftPanelObjectScrollBefore = await forceLeftPanelScroll();
      expect(leftPanelObjectScrollBefore.leftPanelScrollTop).toBeGreaterThan(0);
      await page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-2']").evaluate((tile) => tile.click());
      await expect.poll(readLeftPanelScroll).toEqual(leftPanelObjectScrollBefore);
      await expect(page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-2']")).toHaveClass(/is-selected/);
      await page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1']").evaluate((tile) => tile.click());
      await expect.poll(readLeftPanelScroll).toEqual(leftPanelObjectScrollBefore);
      await expect(page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.asteroids.object-1']")).toHaveClass(/is-selected/);

      const shapeScrollBefore = await forceLeftPanelScroll();
      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index='0']").evaluate((button) => button.click());
      await expect.poll(readLeftPanelScroll).toEqual(shapeScrollBefore);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']")).toHaveClass(/is-selected/);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected shape from object tile shape list: row 0 \(rectangle\)\./);
      await restoreLeftPanelStyle();

      const shapeZeroStyleBeforePaintMode = await page.evaluate(() => ({ ...window.__objectVectorStudioV2App.selectedShape().style }));
      await page.locator("#objectVectorStudioV2PaintModeButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Palette target set to Paint\./);
      const shapeZeroStyleAfterPaintMode = await page.evaluate(() => ({ ...window.__objectVectorStudioV2App.selectedShape().style }));
      expect(shapeZeroStyleAfterPaintMode).toEqual(shapeZeroStyleBeforePaintMode);
      await page.locator("[data-palette-color='#6fd3ff']").click();
      await expect(page.locator("[data-palette-color='#6fd3ff']")).toHaveClass(/is-selected/);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected paint color #6fd3ff from cyan\./);
      const shapeZeroStyleAfterPaintSwatch = await page.evaluate(() => ({ ...window.__objectVectorStudioV2App.selectedShape().style }));
      expect(shapeZeroStyleAfterPaintSwatch).toEqual(shapeZeroStyleBeforePaintMode);
      await clickPreviewShape(0);
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"fill": "#6fd3ff"');
      await expect(page.locator("#statusLog")).toHaveValue(/OK Applied palette color #6fd3ff from cyan to shape row 0 by render surface click\. Target: paint opacity 1\./);
      await page.locator('[data-shape-tool="select"]').click();
      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index='1']").click();
      await expect(page.locator("[data-palette-color='#ffffff']")).toHaveClass(/is-selected/);
      await expect(page.locator("#objectVectorStudioV2StrokeModeButton")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#objectVectorStudioV2PaintModeButton")).toHaveAttribute("aria-pressed", "false");
      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index='0']").click();
      const shapeZeroStyleAfterReselect = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        return {
          activeTool: app.activeTool,
          paletteTarget: app.paletteTarget,
          style: { ...app.selectedShape().style }
        };
      });
      expect(shapeZeroStyleAfterReselect).toEqual({
        activeTool: "select",
        paletteTarget: "stroke",
        style: {
          ...shapeZeroStyleBeforePaintMode,
          fill: "#6fd3ff"
        }
      });
      await expect(page.locator("#objectVectorStudioV2StrokeModeButton")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#objectVectorStudioV2PaintModeButton")).toHaveAttribute("aria-pressed", "false");

      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-shape-visibility-index='0']").click();
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"visible": false');
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']")).toHaveCount(0);
      await expect(page.locator("#statusLog")).toHaveValue(/OK (State .* frame .* shape row 0|Shape row 0) visibility set to hidden\./);

      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-shape-visibility-index='0']").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']")).toHaveCount(1);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-selection-bounds='0']")).toHaveCount(1);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-resize-handle]")).toHaveCount(4);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-pivot-origin='0']")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-object-origin='object.asteroids.object-1']")).toHaveCount(1);
      const selectionChrome = await page.locator("#objectVectorStudioV2RenderSurface").evaluate((surface) => {
        const selectionBox = surface.querySelector("[data-selection-bounds='0']");
        const handle = surface.querySelector("[data-resize-handle]");
        const [objectHorizontal, objectVertical] = Array.from(surface.querySelector("[data-object-origin='object.asteroids.object-1']").querySelectorAll("line"));
        return {
          handleHeight: Number(handle.getAttribute("height")),
          handleWidth: Number(handle.getAttribute("width")),
          objectHorizontalSpan: Math.abs(Number(objectHorizontal.getAttribute("x2")) - Number(objectHorizontal.getAttribute("x1"))),
          objectVerticalSpan: Math.abs(Number(objectVertical.getAttribute("y2")) - Number(objectVertical.getAttribute("y1"))),
          selectionStrokeWidth: getComputedStyle(selectionBox).strokeWidth
        };
      });
      expect(selectionChrome).toEqual({
        handleHeight: 3,
        handleWidth: 3,
        objectHorizontalSpan: 16,
        objectVerticalSpan: 16,
        selectionStrokeWidth: "0.75px"
      });

      await clickPreviewShape(1, { shiftKey: true });
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']")).toHaveClass(/is-selected/);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='1']")).toHaveClass(/is-selected/);
      await expect(page.locator("[data-palette-color='#ffffff']")).toHaveClass(/is-selected/);
      await expect(page.locator("#statusLog")).toHaveValue(/Multi-select count: 2/);
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"selectedShapeIndexes"');
      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index='0']").click();
      await expect(page.locator("#objectVectorStudioV2StrokeModeButton")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#objectVectorStudioV2PaintModeButton")).toHaveAttribute("aria-pressed", "false");
      await expect.poll(async () => page.evaluate(() => window.__objectVectorStudioV2App.selectedShape().style.fill)).toBe("#6fd3ff");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails")).toContainText("Rectangle Geometry");
      await expect(page.locator("#objectVectorStudioV2ShapeTransform")).not.toContainText("Shape Transform");
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-shape-geometry-field='x']").fill("-70");
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-shape-geometry-field='x']").dispatchEvent("change");
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"x": -70');
      await expect(page.locator("#statusLog")).toHaveValue(/OK Auto-applied geometry edits to shape row 0\./);
      await page.locator('button[aria-controls="objectVectorStudioV2ObjectTransformContent"]').click();
      await expect(page.locator("#objectVectorStudioV2ObjectTransformContent")).toBeHidden();
      await page.locator('button[aria-controls="objectVectorStudioV2ObjectTransformContent"]').click();
      await expect(page.locator("#objectVectorStudioV2ObjectTransformContent")).toBeVisible();
      const reviewLayoutState = await page.evaluate(() => {
        const jsonContent = document.querySelector("#objectVectorStudioV2JsonDetailsContent");
        const statusSection = document.querySelector("#statusLogContent").closest(".accordion-v2");
        const rightPanel = document.querySelector(".tool-starter__panel--right");
        const rightSections = Array.from(rightPanel.querySelectorAll(":scope > .accordion-v2"));
        return {
          jsonScrollable: getComputedStyle(jsonContent).overflowY === "auto" || getComputedStyle(jsonContent).overflowY === "scroll",
          statusIsBottomRight: rightSections.at(-1) === statusSection,
          statusScrollable: getComputedStyle(document.querySelector("#statusLog")).overflowY === "auto" || getComputedStyle(document.querySelector("#statusLog")).overflowY === "scroll"
        };
      });
      expect(reviewLayoutState).toEqual({
        jsonScrollable: true,
        statusIsBottomRight: true,
        statusScrollable: true
      });

      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-grid-rendered='true']")).toHaveCount(1);
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveClass(/is-grid-visible/);
      await page.locator("#objectVectorStudioV2GridRenderButton").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).not.toHaveClass(/is-grid-visible/);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-grid-rendered='true']")).toHaveCount(0);
      await page.locator("#objectVectorStudioV2GridRenderButton").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveClass(/is-grid-visible/);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-grid-rendered='true']")).toHaveCount(1);

      await expect(page.locator("#objectVectorStudioV2SnapModeButton")).toHaveText("Snap Grid");
      await expect(page.locator("#objectVectorStudioV2SnapModeButton")).toHaveAttribute("data-snap-mode", "grid");
      await expect(page.locator("#objectVectorStudioV2SnapModeButton")).toHaveAttribute("aria-pressed", "true");
      await page.locator("#objectVectorStudioV2MoveXInput").fill("13");
      await page.locator("#objectVectorStudioV2MoveYInput").fill("7");
      await page.locator("#objectVectorStudioV2MoveShapeButton").click();
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"x": 13');
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"y": 7');
      await expect(page.locator("#objectVectorStudioV2MoveXInput")).toHaveValue("13");
      await expect(page.locator("#objectVectorStudioV2MoveYInput")).toHaveValue("7");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Moved shape row 0 by 13, 7\./);

      await page.locator("#objectVectorStudioV2AngleSnapButton").click();
      await expect(page.locator("#objectVectorStudioV2RotateInput")).toBeDisabled();
      await expect(page.locator("#objectVectorStudioV2RotateInput")).toBeHidden();
      await expect(page.locator("#objectVectorStudioV2RotateSnapSelect")).toBeEnabled();
      await expect(page.locator("#objectVectorStudioV2RotateSnapSelect")).toBeVisible();
      await expect(page.locator("#objectVectorStudioV2SnapAngleStepSelect")).toBeEnabled();
      await expect(page.locator("#objectVectorStudioV2SnapAngleStepSelect")).toBeVisible();
      await expect(page.locator("#objectVectorStudioV2SnapAngleStepSelect")).toHaveValue("15");
      await expect.poll(() => page.locator("#objectVectorStudioV2RotateSnapSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual([
        "0", "15", "30", "45", "60", "75", "90", "105", "120", "135", "150", "165", "180", "195", "210", "225", "240", "255", "270", "285", "300", "315", "330", "345"
      ]);
      await page.locator("#objectVectorStudioV2SnapAngleStepSelect").selectOption("45");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Snap angle step set to 45 degrees\./);
      await expect.poll(() => page.locator("#objectVectorStudioV2RotateSnapSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual([
        "0", "45", "90", "135", "180", "225", "270", "315"
      ]);
      await page.locator("#objectVectorStudioV2RotateSnapSelect").selectOption("45");
      const shapeGeometryBeforeSnapRotate = await page.evaluate(() => JSON.stringify(window.__objectVectorStudioV2App.selectedShape().geometry));
      await page.evaluate((geometryText) => {
        window.__shapeGeometryBeforeSnapRotate = geometryText;
      }, shapeGeometryBeforeSnapRotate);
      await page.locator("#objectVectorStudioV2RotateShapeButton").click();
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).not.toContainText('"rotation": 45');
      await expect(page.locator("#objectVectorStudioV2RotateSnapSelect")).toHaveValue("45");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Rotated shape row 0 geometry by 45 degrees around object origin .* Snap Angle active: 45 -> 45\./);
      const snapAngleRotateVerification = await page.evaluate(() => {
        const shape = window.__objectVectorStudioV2App.selectedShape();
        const statusLines = document.querySelector("#statusLog").value.trim().split("\n");
        return {
          angleSnapEnabled: window.__objectVectorStudioV2App.angleSnapEnabled,
          geometryChanged: JSON.stringify(shape.geometry) !== window.__shapeGeometryBeforeSnapRotate,
          numericDisabled: document.querySelector("#objectVectorStudioV2RotateInput").disabled,
          numericVisible: document.querySelector("#objectVectorStudioV2RotateInput").getClientRects().length > 0,
          rotation: shape.transform.rotation,
          snapSelectDisabled: document.querySelector("#objectVectorStudioV2RotateSnapSelect").disabled,
          snapSelectVisible: document.querySelector("#objectVectorStudioV2RotateSnapSelect").getClientRects().length > 0,
          snapSelectValue: document.querySelector("#objectVectorStudioV2RotateSnapSelect").value,
          step: document.querySelector("#objectVectorStudioV2SnapAngleStepSelect").value,
          status: statusLines[statusLines.length - 1].replace(/^\[[^\]]+\]\s*/, "")
        };
      });
      expect(snapAngleRotateVerification).toEqual({
        angleSnapEnabled: true,
        geometryChanged: true,
        numericDisabled: true,
        numericVisible: false,
        rotation: 0,
        snapSelectDisabled: false,
        snapSelectVisible: true,
        snapSelectValue: "45",
        step: "45",
        status: expect.stringMatching(/^OK Rotated shape row 0 geometry by 45 degrees around object origin .* Snap Angle active: 45 -> 45\.$/)
      });
      await page.locator("#objectVectorStudioV2AngleSnapButton").click();
      await expect(page.locator("#objectVectorStudioV2RotateInput")).toBeEnabled();
      await expect(page.locator("#objectVectorStudioV2RotateInput")).toBeVisible();
      await expect(page.locator("#objectVectorStudioV2RotateSnapSelect")).toBeDisabled();
      await expect(page.locator("#objectVectorStudioV2RotateSnapSelect")).toBeHidden();
      await expect(page.locator("#objectVectorStudioV2SnapAngleStepSelect")).toBeDisabled();
      await expect(page.locator("#objectVectorStudioV2SnapAngleStepSelect")).toBeHidden();
      await page.locator("#objectVectorStudioV2RotateInput").fill("-30");
      await expect(page.locator("#objectVectorStudioV2RotateInput")).toHaveValue("-30");
      await page.locator("#objectVectorStudioV2RotateShapeButton").click();
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).not.toContainText('"rotation": 15');
      await expect(page.locator("#objectVectorStudioV2RotateInput")).toHaveValue("-30");
      await expect(page.locator("#objectVectorStudioV2ShapeTransform .object-vector-studio-v2__transform-summary")).toHaveText("x 13, y 7, rot 0, scale 1");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Rotated shape row 0 geometry by -30 degrees around object origin .* Snap Angle disabled: raw rotation applied\./);
      const wrappedLargeRotationSummary = await page.evaluate(() => window.__objectVectorStudioV2App.formatTransformSummary({
        rotation: 2233,
        scaleX: 0.77,
        scaleY: 0.77,
        x: 0,
        y: 0
      }));
      expect(wrappedLargeRotationSummary).toBe("x 0, y 0, rot 73, scale 0.77");
      await expect(page.locator("#objectVectorStudioV2OriginXInput")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2OriginYInput")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2ApplyOriginButton")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2AutoOriginButton")).toHaveCount(0);

      await page.locator("#objectVectorStudioV2ScaleInput").fill("0");
      await expect(page.locator("#objectVectorStudioV2ScaleInput")).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Invalid transform rejected for shape row 0: scale must be greater than 0\./);
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).not.toContainText('"scaleX": 0');
      await page.locator("#objectVectorStudioV2ScaleInput").fill("1.2");
      await expect(page.locator("#objectVectorStudioV2ScaleInput")).not.toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Scale preview set to 1\.2 for shape row 0\./);
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"scaleX": 1.2');
      await expect(page.locator("#objectVectorStudioV2ShapeTransform .object-vector-studio-v2__transform-summary")).toHaveText("x 13, y 7, rot 0, scale 1.2");
      const selectionBeforeScaleStep = await page.locator("#objectVectorStudioV2RenderSurface [data-selection-bounds='0']").evaluate((box) => ({
        height: Number(box.getAttribute("height")),
        width: Number(box.getAttribute("width"))
      }));
      await page.locator("#objectVectorStudioV2ScaleDownSmallButton").click();
      await expect(page.locator("#objectVectorStudioV2ScaleInput")).toHaveValue("1.19");
      await page.locator("#objectVectorStudioV2ScaleDownLargeButton").click();
      await expect(page.locator("#objectVectorStudioV2ScaleInput")).toHaveValue("1.09");
      await page.locator("#objectVectorStudioV2ScaleUpSmallButton").click();
      await expect(page.locator("#objectVectorStudioV2ScaleInput")).toHaveValue("1.1");
      await page.locator("#objectVectorStudioV2ScaleUpLargeButton").click();
      await expect(page.locator("#objectVectorStudioV2ScaleInput")).toHaveValue("1.2");
      const selectionAfterScaleStep = await page.locator("#objectVectorStudioV2RenderSurface [data-selection-bounds='0']").evaluate((box) => ({
        height: Number(box.getAttribute("height")),
        width: Number(box.getAttribute("width"))
      }));
      expect(selectionAfterScaleStep.width).toBeCloseTo(selectionBeforeScaleStep.width, 1);
      expect(selectionAfterScaleStep.height).toBeCloseTo(selectionBeforeScaleStep.height, 1);
      const rectangleBeforeResizeGeometry = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const shape = window.__objectVectorStudioV2App.selectedShape();
        return {
          geometry: { ...shape.geometry },
          objectOrigin: app.objectTransformOrigin(app.selectedObject()),
          transform: { ...shape.transform }
        };
      });
      await page.locator("#objectVectorStudioV2ResizeShapeButton").click();
      const rectangleAfterResizeGeometry = await page.evaluate(() => {
        const shape = window.__objectVectorStudioV2App.selectedShape();
        return {
          geometry: { ...shape.geometry },
          schemaOk: window.__objectVectorStudioV2App.schemaService.validatePayload(window.__objectVectorStudioV2App.currentPayload).ok,
          transform: { ...shape.transform }
        };
      });
      expect(rectangleAfterResizeGeometry).toMatchObject({
        geometry: {
          height: Number((rectangleBeforeResizeGeometry.geometry.height * 1.2).toFixed(3)),
          width: Number((rectangleBeforeResizeGeometry.geometry.width * 1.2).toFixed(3)),
          x: Number((rectangleBeforeResizeGeometry.objectOrigin.x + (rectangleBeforeResizeGeometry.geometry.x - rectangleBeforeResizeGeometry.objectOrigin.x) * 1.2).toFixed(3)),
          y: Number((rectangleBeforeResizeGeometry.objectOrigin.y + (rectangleBeforeResizeGeometry.geometry.y - rectangleBeforeResizeGeometry.objectOrigin.y) * 1.2).toFixed(3))
        },
        schemaOk: true,
        transform: {
          rotation: rectangleBeforeResizeGeometry.transform.rotation,
          scaleX: 1,
          scaleY: 1,
          x: rectangleBeforeResizeGeometry.transform.x,
          y: rectangleBeforeResizeGeometry.transform.y
        }
      });
      await expect(page.locator("#objectVectorStudioV2ScaleInput")).toHaveValue("1");
      await expect(page.locator("#objectVectorStudioV2ShapeTransform .object-vector-studio-v2__transform-summary")).toHaveText("x 13, y 7, rot 0, scale 1");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Resize Geometry applied scale 1\.2 to shape row 0; transform scale reset to 1\./);

      const selectedShapeActions = page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes .object-vector-studio-v2__shape-list-actions");
      await expect(selectedShapeActions.locator("[data-shape-list-action]")).toHaveCount(6);
      await expect(selectedShapeActions.locator("[data-shape-list-action] .object-vector-studio-v2__z-label")).toHaveText(["Send To Back", "Move Backward", "Move Forward", "Bring To Front", "Group", "Ungroup"]);
      const selectedShapeActionLayout = await selectedShapeActions.evaluate((actions) => {
        const shapeList = actions.closest(".object-vector-studio-v2__object-tile-shapes");
        const buttons = Array.from(actions.querySelectorAll("[data-shape-list-action]"));
        const buttonRects = buttons.map((button) => button.getBoundingClientRect());
        return {
          iconKeys: buttons.map((button) => button.querySelector("[data-ovs-icon]")?.dataset.ovsIconKey),
          iconOnly: actions.classList.contains("is-icon-only"),
          labelsHidden: buttons.every((button) => {
            const label = button.querySelector(".object-vector-studio-v2__z-label").getBoundingClientRect();
            return Math.round(label.width) <= 1 && Math.round(label.height) <= 1;
          }),
          parentIsShapeList: actions.parentElement === shapeList,
          squareButtons: buttonRects.every((rect) => Math.round(rect.width) === Math.round(rect.height))
        };
      });
      expect(selectedShapeActionLayout).toEqual({
        iconKeys: ["sendBack", "sendBackward", "bringForward", "bringFront", "group", "ungroup"],
        iconOnly: true,
        labelsHidden: true,
        parentIsShapeList: true,
        squareButtons: true
      });

      await selectedShapeActions.locator("[data-shape-list-action='bring-to-front']").click();
      await expect(objectOneShapeButtons.first()).toHaveAttribute("data-object-tile-shape-index", "1");
      await expect(objectOneShapeButtons.first()).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Shape row 0 z-order front\./);
      await selectedShapeActions.locator("[data-shape-list-action='send-to-back']").click();
      await expect(objectOneShapeButtons.first()).toHaveAttribute("data-object-tile-shape-index", "1");
      await expect(objectOneShapeButtons.last()).toHaveAttribute("data-object-tile-shape-index", "0");
      await expect(objectOneShapeButtons.last()).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Shape row 1 z-order back\./);
      await selectedShapeActions.locator("[data-shape-list-action='move-forward']").click();
      await expect(objectOneShapeButtons.first()).toHaveAttribute("data-object-tile-shape-index", "1");
      await expect(objectOneShapeButtons.first()).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Shape row 0 z-order forward\./);
      await selectedShapeActions.locator("[data-shape-list-action='move-backward']").click();
      await expect(objectOneShapeButtons.last()).toHaveAttribute("data-object-tile-shape-index", "0");
      await expect(objectOneShapeButtons.last()).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Shape row 1 z-order backward\./);

      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index='0']").click();
      await expect(selectedShapeActions.locator("[data-shape-list-action='group']")).toBeDisabled();
      await expect(selectedShapeActions.locator("[data-shape-list-action='group']")).toHaveAttribute("data-disabled-reason", /Shift-click shapes/);
      await expect(selectedShapeActions.locator("[data-shape-list-action='ungroup']")).toBeDisabled();
      await expect(selectedShapeActions.locator("[data-shape-list-action='ungroup']")).toHaveAttribute("data-disabled-reason", /belongs to a group/);
      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index='1']").click({ modifiers: ["Shift"] });
      await expect(selectedShapeActions.locator("[data-shape-list-action='group']")).toBeEnabled();
      await expect(selectedShapeActions.locator("[data-shape-list-action='group']")).toHaveAttribute("title", /Shift-click shapes to select more than one/);
      await selectedShapeActions.locator("[data-shape-list-action='group']").click();
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"groupId": "group-1"');
      await expect(page.locator("#statusLog")).toHaveValue(/OK Grouped 2 shapes into group-1\./);
      await expect(selectedShapeActions.locator("[data-shape-list-action='ungroup']")).toBeEnabled();
      await expect(page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-shape-group-id='group-1']")).toHaveCount(2);
      const groupIconColors = await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-shape-group-id='group-1'] .object-vector-studio-v2__shape-group-indicator").evaluateAll((icons) => icons.map((icon) => getComputedStyle(icon).color));
      expect(new Set(groupIconColors).size).toBe(1);
      expect(groupIconColors[0]).not.toBe("");
      const geometryGroupIconColor = await page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__shape-group-summary .object-vector-studio-v2__shape-group-indicator").evaluate((icon) => getComputedStyle(icon).color);
      expect(geometryGroupIconColor).toBe(groupIconColors[0]);
      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index='0']").click();
      await expect(page.locator("#objectVectorStudioV2ShapeTransform .object-vector-studio-v2__shape-panel")).not.toHaveClass(/is-disabled/);
      if (await page.locator("#objectVectorStudioV2AngleSnapButton").getAttribute("aria-pressed") === "true") {
        await page.locator("#objectVectorStudioV2AngleSnapButton").click();
      }
      const groupedSingleRotateBefore = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        return {
          geometryText: JSON.stringify(app.selectedShape().geometry),
          rotations: app.selectedObject().shapes.map((shape) => shape.transform.rotation),
          selectedCount: app.selectedShapeIndexes.size
        };
      });
      expect(groupedSingleRotateBefore.selectedCount).toBe(1);
      await page.locator("#objectVectorStudioV2RotateInput").fill("10");
      await page.locator("#objectVectorStudioV2RotateShapeButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Rotated shape row 0 geometry by 10 degrees around object origin .* Snap Angle disabled: raw rotation applied\./);
      const groupedSingleRotateAfter = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        return {
          geometryText: JSON.stringify(app.selectedShape().geometry),
          rotations: app.selectedObject().shapes.map((shape) => shape.transform.rotation),
          selectedCount: app.selectedShapeIndexes.size
        };
      });
      expect(groupedSingleRotateAfter.selectedCount).toBe(1);
      expect(groupedSingleRotateAfter.geometryText).not.toBe(groupedSingleRotateBefore.geometryText);
      expect(groupedSingleRotateAfter.rotations[0]).toBe(groupedSingleRotateBefore.rotations[0]);
      expect(groupedSingleRotateAfter.rotations[1]).toBe(groupedSingleRotateBefore.rotations[1]);
      const groupIconLayout = await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes .object-vector-studio-v2__object-tile-shape-row").first().evaluate((row) => {
        const label = row.querySelector(".object-vector-studio-v2__shape-select-label");
        const visibility = row.querySelector("[data-shape-visibility-index]");
        const deleteButton = row.querySelector("[data-shape-delete-index]");
        const groupButton = row.querySelector("[data-shape-group-id='group-1']");
        const rowRect = row.getBoundingClientRect();
        const labelRect = label.getBoundingClientRect();
        const visibilityRect = visibility.getBoundingClientRect();
        const deleteRect = deleteButton.getBoundingClientRect();
        const groupRect = groupButton.getBoundingClientRect();
        return {
          actionButtonOrder: Array.from(row.querySelectorAll(".object-vector-studio-v2__shape-inline-actions > button")).map((button) => {
            if (button.matches("[data-shape-group-id]")) return "group";
            if (button.matches("[data-shape-visibility-index]")) return "eye";
            if (button.matches("[data-shape-delete-index]")) return "trash";
            return "unknown";
          }),
          groupAfterLabel: groupRect.left > labelRect.right,
          groupButtonTag: groupButton.tagName.toLowerCase(),
          groupBeforeEye: groupRect.right < visibilityRect.left,
          labelStartsLeft: labelRect.left < deleteRect.left,
          labelText: label.textContent.trim(),
          nestedButtons: row.querySelectorAll(".object-vector-studio-v2__shape-select button").length,
          trashAtFarRight: Math.abs(rowRect.right - deleteRect.right) <= 4
        };
      });
      expect(groupIconLayout).toEqual({
        actionButtonOrder: ["group", "eye", "trash"],
        groupAfterLabel: true,
        groupButtonTag: "button",
        groupBeforeEye: true,
        labelStartsLeft: true,
        labelText: "1. Circle",
        nestedButtons: 0,
        trashAtFarRight: true
      });
      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index='0']").click();
      await expect(page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index='0']")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index='1']")).toHaveAttribute("aria-pressed", "false");
      await expect(page.locator("#statusLog")).toHaveValue(/Multi-select count: 1/);
      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes .object-vector-studio-v2__object-tile-shape-row:has([data-object-tile-shape-index='1']) [data-shape-group-id='group-1']").click();
      await expect(page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index='0']")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index='1']")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected group group-1 from shape group icon: 2 shapes\./);
      await expect.poll(async () => page.evaluate(() => window.__objectVectorStudioV2App.selectedShapeIndex)).toBe(1);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__object-detail-stack")).toHaveClass(/is-disabled/);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails input").first()).toBeDisabled();
      await expect(page.locator("#objectVectorStudioV2ShapeTransform .object-vector-studio-v2__shape-panel")).toHaveClass(/is-disabled/);
      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-shape-visibility-index='1']").click();
      await expect.poll(async () => page.evaluate(() => window.__objectVectorStudioV2App.selectedShapeIndex)).toBe(1);
      await expect(page.locator("#statusLog")).toHaveValue(/[Ss]hape row 1 visibility set to hidden/);
      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-shape-visibility-index='1']").click();
      await expect.poll(async () => page.evaluate(() => window.__objectVectorStudioV2App.selectedShapeIndex)).toBe(1);
      await expect(page.locator("#statusLog")).toHaveValue(/[Ss]hape row 1 visibility set to visible/);
      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index='1']").click();
      await expect.poll(async () => page.evaluate(() => window.__objectVectorStudioV2App.selectedShapeIndex)).toBe(1);
      await selectedShapeActions.locator("[data-shape-list-action='ungroup']").click();
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).not.toContainText('"groupId": "group-1"');
      await expect(page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-shape-group-id='group-1']")).toHaveCount(0);
      await expect(selectedShapeActions.locator("[data-shape-list-action='ungroup']")).toBeDisabled();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Ungrouped 1 selected shapes from group-1\./);
      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index='0']").click();

      await page.locator('[data-shape-tool="select"]').click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index].is-selected")).toHaveCount(0);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Select tool cleared selected shape row 0\./);

      await page.keyboard.press("F");
      await page.locator("[data-palette-color='#6fd3ff']").click();
      await clickPreviewShape(1);
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"fill": "#6fd3ff"');
      await expect(page.locator("#statusLog")).toHaveValue(/OK Applied palette color #6fd3ff from cyan to shape row 1 by render surface click\. Target: paint opacity 1\./);
      await page.locator("#objectVectorStudioV2FillOpacity").fill("-1");
      await page.locator("#objectVectorStudioV2FillOpacity").dispatchEvent("change");
      await expect(page.locator("#objectVectorStudioV2FillOpacity")).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).not.toContainText('"fillOpacity": 0.502');
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Palette fill opacity rejected: Fill opacity must be a whole number between 0 and 255\./);
      await page.locator("#objectVectorStudioV2FillOpacity").fill("128");
      await page.locator("#objectVectorStudioV2FillOpacity").dispatchEvent("change");
      await expect(page.locator("#objectVectorStudioV2FillOpacity")).not.toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#objectVectorStudioV2FillOpacity")).toHaveValue("128");
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).not.toContainText('"fillOpacity": 0.502');
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='1']")).toHaveAttribute("fill-opacity", "1");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected fill opacity 0\.502\./);
      const shapeOneStyleAfterFillOpacityInput = await page.evaluate(() => ({ ...window.__objectVectorStudioV2App.selectedShape().style }));
      expect(shapeOneStyleAfterFillOpacityInput.fillOpacity).toBe(1);
      await clickPreviewShape(1);
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"fillOpacity": 0.502');
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='1']")).toHaveAttribute("fill-opacity", "0.502");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Applied palette color #6fd3ff from cyan to shape row 1 by render surface click\. Target: paint opacity 0\.502\./);
      const shapeOneStyleBeforeStrokeMode = await page.evaluate(() => ({ ...window.__objectVectorStudioV2App.selectedShape().style }));
      await page.locator("#objectVectorStudioV2StrokeModeButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Palette target set to Stroke\./);
      const shapeOneStyleAfterStrokeMode = await page.evaluate(() => ({ ...window.__objectVectorStudioV2App.selectedShape().style }));
      expect(shapeOneStyleAfterStrokeMode).toEqual(shapeOneStyleBeforeStrokeMode);
      await page.locator("[data-palette-color='#6fd3ff']").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected stroke color #6fd3ff from cyan\./);
      const shapeOneStyleAfterStrokeSwatch = await page.evaluate(() => ({ ...window.__objectVectorStudioV2App.selectedShape().style }));
      expect(shapeOneStyleAfterStrokeSwatch).toEqual(shapeOneStyleBeforeStrokeMode);
      await clickPreviewShape(1);
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"stroke": "#6fd3ff"');
      await expect(page.locator("#statusLog")).toHaveValue(/OK Applied palette color #6fd3ff from cyan to shape row 1 by render surface click\. Target: stroke width 2, opacity 1\./);
      await page.locator("#objectVectorStudioV2StrokeOpacity").fill("256");
      await page.locator("#objectVectorStudioV2StrokeOpacity").dispatchEvent("change");
      await expect(page.locator("#objectVectorStudioV2StrokeOpacity")).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).not.toContainText('"strokeOpacity": 0.651');
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Palette stroke opacity rejected: Stroke opacity must be a whole number between 0 and 255\./);
      await page.locator("#objectVectorStudioV2StrokeOpacity").fill("166");
      await page.locator("#objectVectorStudioV2StrokeOpacity").dispatchEvent("change");
      await expect(page.locator("#objectVectorStudioV2StrokeOpacity")).not.toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#objectVectorStudioV2StrokeOpacity")).toHaveValue("166");
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).not.toContainText('"strokeOpacity": 0.651');
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='1']")).toHaveAttribute("stroke-opacity", "1");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected stroke opacity 0\.651\./);
      const shapeOneStyleAfterStrokeOpacityInput = await page.evaluate(() => ({ ...window.__objectVectorStudioV2App.selectedShape().style }));
      expect(shapeOneStyleAfterStrokeOpacityInput.strokeOpacity).toBe(1);
      await clickPreviewShape(1);
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"strokeOpacity": 0.651');
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='1']")).toHaveAttribute("stroke-opacity", "0.651");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Applied palette color #6fd3ff from cyan to shape row 1 by render surface click\. Target: stroke width 2, opacity 0\.651\./);
      const shapeOneStyleAfterStrokeApply = await page.evaluate(() => ({ ...window.__objectVectorStudioV2App.selectedShape().style }));
      expect(shapeOneStyleAfterStrokeApply.fillOpacity).toBe(0.502);
      expect(shapeOneStyleAfterStrokeApply.strokeOpacity).toBe(0.651);
      await expect(page.locator("#objectVectorStudioV2FillOpacity")).toHaveValue("128");
      await expect(page.locator("#objectVectorStudioV2StrokeOpacity")).toHaveValue("166");

      await page.evaluate(() => {
        window.__objectVectorStudioV2ContextMenuPrevented = false;
        document.querySelector("#objectVectorStudioV2RenderSurface").addEventListener("contextmenu", (event) => {
          window.__objectVectorStudioV2ContextMenuPrevented = event.defaultPrevented;
        }, { once: true });
      });
      await page.locator("#objectVectorStudioV2PaintModeButton").click();
      await rightClickPreviewShape(1);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Applied transparent fill to shape row 1 by right-click\./);
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"fill": "#00000000"');
      const shapeOneStyleAfterTransparentFill = await page.evaluate(() => ({
        contextMenuPrevented: window.__objectVectorStudioV2ContextMenuPrevented,
        style: { ...window.__objectVectorStudioV2App.selectedShape().style }
      }));
      expect(shapeOneStyleAfterTransparentFill).toEqual({
        contextMenuPrevented: true,
        style: {
          ...shapeOneStyleAfterStrokeApply,
          fill: "#00000000"
        }
      });
      await expect(page.locator("#objectVectorStudioV2FillOpacity")).toHaveValue("128");
      await expect(page.locator("#objectVectorStudioV2StrokeOpacity")).toHaveValue("166");

      await page.evaluate(() => {
        window.__objectVectorStudioV2ContextMenuPrevented = false;
        document.querySelector("#objectVectorStudioV2RenderSurface").addEventListener("contextmenu", (event) => {
          window.__objectVectorStudioV2ContextMenuPrevented = event.defaultPrevented;
        }, { once: true });
      });
      await page.locator("#objectVectorStudioV2StrokeModeButton").click();
      await rightClickPreviewShape(1);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Applied transparent fill to shape row 1 by right-click\./);
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).not.toContainText('"stroke": "#00000000"');
      const shapeOneStyleAfterSecondRightClick = await page.evaluate(() => ({
        contextMenuPrevented: window.__objectVectorStudioV2ContextMenuPrevented,
        style: { ...window.__objectVectorStudioV2App.selectedShape().style }
      }));
      expect(shapeOneStyleAfterSecondRightClick).toEqual({
        contextMenuPrevented: true,
        style: shapeOneStyleAfterTransparentFill.style
      });
      await expect(page.locator("#objectVectorStudioV2FillOpacity")).toHaveValue("128");
      await expect(page.locator("#objectVectorStudioV2StrokeOpacity")).toHaveValue("166");

      const shapeOneStyleBeforePicker = await page.evaluate(() => ({ ...window.__objectVectorStudioV2App.selectedShape().style }));
      await page.keyboard.press("I");
      await expect(page.locator('[data-shape-tool="picker"]')).toHaveAttribute("aria-pressed", "true");
      await clickPreviewShape(1);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Picker sampled shape row 1: fill #00000000, stroke #6fd3ff, fill opacity 0\.502, stroke opacity 0\.651, stroke width 2\./);
      const pickerState = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        return {
          activeTool: app.activeTool,
          fillInput: app.elements.fillOpacity.value,
          paletteTarget: app.paletteTarget,
          selectedFillColor: app.selectedFillColor,
          selectedFillOpacity: app.selectedFillOpacity,
          selectedStrokeColor: app.selectedStrokeColor,
          selectedStrokeOpacity: app.selectedStrokeOpacity,
          shapeStyle: { ...app.selectedShape().style },
          strokeInput: app.elements.strokeOpacity.value,
          strokeWidth: app.elements.strokeWidth.value
        };
      });
      expect(pickerState).toEqual({
        activeTool: "picker",
        fillInput: "128",
        paletteTarget: "stroke",
        selectedFillColor: "#00000000",
        selectedFillOpacity: 0.502,
        selectedStrokeColor: "#6fd3ff",
        selectedStrokeOpacity: 0.651,
        shapeStyle: shapeOneStyleBeforePicker,
        strokeInput: "166",
        strokeWidth: "2"
      });

      await page.evaluate(() => {
        window.__objectVectorStudioV2App.selectedStrokeColor = "#123456";
        window.__objectVectorStudioV2App.selectedStrokeLabel = "manual rogue";
        window.__objectVectorStudioV2App.activeTool = "stroke";
      });
      await clickPreviewShape(1);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Palette color application rejected: #123456 is not in the loaded palette\./);
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).not.toContainText("#123456");
      await page.keyboard.press("X");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Swapped fill and stroke colors/);
      await page.keyboard.press("D");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Restored default paint\/stroke colors from loaded palette: fill #ffffff, stroke #6fd3ff\./);
      await page.keyboard.press("V");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Tools mode selected from keyboard: select\./);

      const zoomSource = await readFile("tools/object-vector-studio-v2/js/ToolStarterApp.js", "utf8");
      expect(zoomSource).toContain("const DEFAULT_VIEWPORT = Object.freeze({ height: 2200, width: 3200, x: 0, y: 0, zoom: 1.0 });");
      expect(zoomSource).not.toContain("VIEWPORT_ZOOM_VIEWBOX_SCALE");
      expect(zoomSource).not.toContain("viewBoxZoom");
      expect(zoomSource).toContain("const MAX_ZOOM = 10.0;");
      expect(zoomSource).toContain("const MIN_ZOOM = 0.1;");
      expect(zoomSource).toContain("const ZOOM_STEP = 0.1;");
      expect(zoomSource).not.toContain("transformWithObjectScaleAroundPivot");
      expect(zoomSource).not.toContain("objectScalePreviewValues");
      expect(zoomSource).not.toContain("transformWithRelativeScaleAroundPivot");
      expect(zoomSource).toMatch(/formatZoomPercentage\(\) \{\s+return Math\.round\(this\.viewport\.zoom \* 100\);\s+\}/);
      expect(zoomSource).not.toContain("formatZoomPercentage() * 10");
      expect(zoomSource).not.toMatch(/viewport\.zoom\s*\*\s*100\s*\*\s*GRID_STEP|const MAX_ZOOM = 2/);

      await page.locator("#objectVectorStudioV2ZoomInButton").click();
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toContainText("Zoom 110%");
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-1454.545 -1000 2909.091 2000");
      await page.locator("#objectVectorStudioV2PanRightButton").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-1434.545 -1000 2909.091 2000");
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toHaveText("Origin: 2, 0 | Canvas origin -2,0 from center | Zoom 110%");
      await page.locator("#objectVectorStudioV2ResetViewButton").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-1600 -1100 3200 2200");
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toHaveText("Origin: 0, 0 | Canvas origin 0,0 centered | Zoom 100%");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Viewport reset to 100% at origin 0,0\./);
      await page.evaluate(() => {
        window.__objectVectorStudioV2App.viewport.zoom = 0.095;
        window.__objectVectorStudioV2App.updateViewport();
      });
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toHaveText("Origin: 0, 0 | Canvas origin 0,0 centered | Zoom 10%");
      await page.evaluate(() => {
        window.__objectVectorStudioV2App.zoomViewport(2.5);
      });
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toHaveText("Origin: 0, 0 | Canvas origin 0,0 centered | Zoom 250%");
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-640 -440 1280 880");
      await page.evaluate(() => {
        window.__objectVectorStudioV2App.zoomViewport(0);
      });
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toHaveText("Origin: 0, 0 | Canvas origin 0,0 centered | Zoom 10%");
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-16000 -11000 32000 22000");
      await page.locator("#objectVectorStudioV2ResetViewButton").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-1600 -1100 3200 2200");
      const wheelAnchor = await page.locator("#objectVectorStudioV2RenderSurface").evaluate((surface) => {
        const rect = surface.getBoundingClientRect();
        const clientX = Math.round(rect.left + rect.width * 0.75);
        const clientY = Math.round(rect.top + rect.height * 0.35);
        return {
          before: window.__objectVectorStudioV2App.viewportPointFromClient(clientX, clientY),
          clientX,
          clientY
        };
      });
      await page.mouse.move(wheelAnchor.clientX, wheelAnchor.clientY);
      await page.mouse.wheel(0, -240);
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toContainText("Zoom 110%");
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-grid-rendered='true']")).toHaveCount(1);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-center-origin='0,0']")).toHaveCount(1);
      const zoomedGridState = await page.locator("#objectVectorStudioV2RenderSurface").evaluate((surface, anchor) => {
        const app = window.__objectVectorStudioV2App;
        const after = app.viewportPointFromClient(anchor.clientX, anchor.clientY);
        return {
          backgroundImage: getComputedStyle(surface).backgroundImage,
          gridLineCount: surface.querySelectorAll("[data-grid-rendered='true'] line").length,
          pointerDelta: {
            x: Math.abs(after.x - anchor.before.x),
            y: Math.abs(after.y - anchor.before.y)
          },
          viewport: { ...app.viewport },
          viewBox: surface.getAttribute("viewBox")
        };
      }, wheelAnchor);
      expect(zoomedGridState.backgroundImage).toBe("none");
      expect(zoomedGridState.gridLineCount).toBeGreaterThan(0);
      expect(zoomedGridState.pointerDelta.x).toBeLessThan(0.001);
      expect(zoomedGridState.pointerDelta.y).toBeLessThan(0.001);
      expect(Math.abs(zoomedGridState.viewport.x)).toBeGreaterThan(1);
      expect(Math.abs(zoomedGridState.viewport.y)).toBeGreaterThan(1);
      expect(zoomedGridState.viewBox).not.toBe("-1454.545 -1000 2909.091 2000");
      await page.mouse.wheel(0, 240);
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toContainText("Zoom 100%");
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-1600 -1100 3200 2200");
      await page.evaluate(() => {
        window.__objectVectorStudioV2App.zoomViewport(2.5);
      });
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toContainText("Zoom 250%");
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-640 -440 1280 880");
      await page.locator("#objectVectorStudioV2ResetViewButton").click();

      await page.evaluate(() => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            async writeText(text) {
              sessionStorage.setItem("object-vector-studio-v2.copied-json", text);
            }
          }
        });
      });
      await page.locator("#objectVectorStudioV2CopyJsonButton").click();
      const copiedPayload = await page.evaluate(() => JSON.parse(sessionStorage.getItem("object-vector-studio-v2.copied-json")));
      expect(copiedPayload).toMatchObject({
        name: "Asteroids Object Set",
        toolId: "object-vector-studio-v2",
        version: 1
      });
      expect(copiedPayload.palette).toBeUndefined();
      expect(copiedPayload.selection).toBeUndefined();
      expect(copiedPayload.viewport).toBeUndefined();
      expect(copiedPayload.export).toBeUndefined();
      const copiedSchemaValidation = await page.evaluate((payload) => window.__objectVectorStudioV2App.schemaService.validatePayload(payload), copiedPayload);
      expect(copiedSchemaValidation).toEqual({ errors: [], ok: true, payload: copiedPayload });
      const jsonAccordionOpenBeforeCopy = await page.locator("#objectVectorStudioV2JsonDetailsContent").evaluate((content) => content.closest(".accordion-v2").classList.contains("is-open"));
      await page.locator("#objectVectorStudioV2CopyJsonDetailsButton").click();
      const jsonAccordionOpenAfterCopy = await page.locator("#objectVectorStudioV2JsonDetailsContent").evaluate((content) => content.closest(".accordion-v2").classList.contains("is-open"));
      expect(jsonAccordionOpenBeforeCopy).toBe(true);
      expect(jsonAccordionOpenAfterCopy).toBe(true);

      const downloadPromise = page.waitForEvent("download");
      await page.locator("#objectVectorStudioV2ExportJsonButton").click();
      const download = await downloadPromise;
      const exportPath = testInfo.outputPath("object-vector-export.json");
      await download.saveAs(exportPath);
      const exportedPayload = JSON.parse(await readFile(exportPath, "utf8"));
      expect(exportedPayload.palette).toBeUndefined();
      expect(exportedPayload.selection).toBeUndefined();
      expect(exportedPayload.viewport).toBeUndefined();
      expect(exportedPayload.export).toBeUndefined();
      const exportedSchemaValidation = await page.evaluate((payload) => window.__objectVectorStudioV2App.schemaService.validatePayload(payload), exportedPayload);
      expect(exportedSchemaValidation).toEqual({ errors: [], ok: true, payload: exportedPayload });

      const objectScrollBefore = await page.locator("#objectVectorStudioV2ObjectsContent").evaluate((element) => {
        element.scrollTop = 120;
        return element.scrollTop;
      });
      await page.locator('.object-vector-studio-v2__object-tile[data-object-id="object.asteroids.object-2"]').evaluate((button) => button.click());
      await expect.poll(async () => page.locator("#objectVectorStudioV2ObjectsContent").evaluate((element) => element.scrollTop)).toBe(objectScrollBefore);
      await expect(page.locator('[data-object-id="object.asteroids.object-2"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#objectVectorStudioV2ObjectNameInput")).toHaveValue("Object 2");
      await expect(page.locator("#objectVectorStudioV2ObjectPreviewFooter")).toContainText("Object ID: object.asteroids.object-2");

      await page.locator("#objectVectorStudioV2ObjectNameInput").fill("Object 2 Renamed");
      await expect(page.locator("#objectVectorStudioV2ObjectPreviewFooter")).toContainText("Object ID: object.asteroids.object-2-renamed");
      await page.locator("#objectVectorStudioV2RenameObjectButton").click();
      await expect(page.locator('[data-object-id="object.asteroids.object-2"]')).toHaveCount(0);
      await expect(page.locator('[data-object-id="object.asteroids.object-2-renamed"]')).toContainText("Object 2 Renamed");
      await expect(page.locator("#objectVectorStudioV2ObjectPreviewFooter")).toContainText("Object ID: object.asteroids.object-2-renamed");
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"id": "object.asteroids.object-2-renamed"');
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"name": "Object 2 Renamed"');
      await expect(page.locator("#statusLog")).toHaveValue(/OK Renamed object object.asteroids.object-2 to Object 2 Renamed and updated object\/game\/name id to object.asteroids.object-2-renamed\./);

      await page.locator("#objectVectorStudioV2DuplicateObjectButton").click();
      await expect(page.locator("#objectVectorStudioV2ObjectsCount")).toHaveText(/\(19 obj, states \d+, 0 shapes\)/);
      await expect(page.locator('[data-object-id="object.asteroids.object-2-renamed-copy"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Duplicated object Object 2 Renamed as Object 2 Renamed Copy\./);
      await page.locator('[data-object-id="object.asteroids.object-2-renamed-copy"] [data-object-control="delete"]').click();
      await expect(page.locator("#objectVectorStudioV2ObjectsCount")).toHaveText(/\(18 obj, states \d+, 2 shapes\)/);
      await expect(page.locator('[data-object-id="object.asteroids.object-2-renamed-copy"]')).toHaveCount(0);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted object Object 2 Renamed Copy from object tile delete\./);

      await page.locator('[data-object-id="object.asteroids.object-3"]').click();
      await page.locator("#objectVectorStudioV2ObjectNameInput").fill("Medium Asteroid");
      await expect(page.locator("#objectVectorStudioV2ObjectPreviewFooter")).toContainText("Object ID: object.asteroids.medium-asteroid");
      await page.locator("#objectVectorStudioV2RenameObjectButton").click();
      await expect(page.locator('[data-object-id="object.asteroids.medium-asteroid"]')).toContainText("Medium Asteroid");

      await page.locator('[data-object-id="object.asteroids.object-4"]').click();
      await page.locator("#objectVectorStudioV2ObjectNameInput").fill("Medium Asteroid");
      await expect(page.locator("#objectVectorStudioV2ObjectPreviewFooter")).toContainText("Object ID: object.asteroids.medium-asteroid-2");
      await page.locator("#objectVectorStudioV2RenameObjectButton").click();
      await expect(page.locator('[data-object-id="object.asteroids.medium-asteroid-2"]')).toContainText("Medium Asteroid");
      await expect(page.locator('[data-object-id="object.asteroids.medium-asteroid-1"]')).toHaveCount(0);

      await page.locator('[data-object-id="object.asteroids.object-5"]').click();
      await page.locator("#objectVectorStudioV2ObjectNameInput").fill("Large Asteroid");
      await expect(page.locator("#objectVectorStudioV2ObjectPreviewFooter")).toContainText("Object ID: object.asteroids.large-asteroid");
      await page.locator("#objectVectorStudioV2RenameObjectButton").click();
      await page.locator("#objectVectorStudioV2DuplicateObjectButton").click();
      await expect(page.locator('[data-object-id="object.asteroids.large-asteroid-copy"]')).toHaveAttribute("aria-pressed", "true");
      await page.locator("#objectVectorStudioV2ObjectNameInput").fill("Medium Asteroid");
      await expect(page.locator("#objectVectorStudioV2ObjectPreviewFooter")).toContainText("Object ID: object.asteroids.medium-asteroid-3");
      await page.locator("#objectVectorStudioV2RenameObjectButton").click();
      await expect(page.locator('[data-object-id="object.asteroids.medium-asteroid-3"]')).toHaveAttribute("aria-pressed", "true");
      await page.locator('[data-object-id="object.asteroids.medium-asteroid-3"] [data-object-control="delete"]').click();
      await expect(page.locator('[data-object-id="object.asteroids.medium-asteroid-3"]')).toHaveCount(0);

      await page.locator("#objectVectorStudioV2ObjectNameInput").fill("Shield Pickup");
      await page.locator("#objectVectorStudioV2AddObjectButton").click();
      await expect(page.locator("#objectVectorStudioV2ObjectsCount")).toHaveText(/\(19 obj, states \d+, 0 shapes\)/);
      await expect(page.locator('[data-object-id="object.asteroids.shield-pickup"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator('[data-object-id="object.asteroids.shield-pickup"]')).toContainText("Shield Pickup");
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"id": "object.asteroids.shield-pickup"');
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).not.toContainText('"type": "pickup"');
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"shapes": []');
      await expect(page.locator("#statusLog")).toHaveValue(/OK Added object Shield Pickup with object\/game\/name id object\.asteroids\.shield-pickup\./);

      await page.locator('[data-object-id="object.asteroids.shield-pickup"] [data-object-control="delete"]').click();
      await expect(page.locator("#objectVectorStudioV2ObjectsCount")).toHaveText(/\(18 obj, states \d+, 2 shapes\)/);
      await expect(page.locator('[data-object-id="object.asteroids.shield-pickup"]')).toHaveCount(0);
      await expect(page.locator('[data-object-id="object.asteroids.object-1"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted object Shield Pickup from object tile delete\./);

      const leftAccordionLayout = await page.locator(".tool-starter__panel--left > .accordion-v2").evaluateAll((sections) => (
        sections.map((section) => {
          const content = section.querySelector(".accordion-v2__content");
          const sectionRect = section.getBoundingClientRect();
          const contentRect = content?.getBoundingClientRect();
          const style = getComputedStyle(section);
          return {
            bottomGap: content ? Math.round(sectionRect.bottom - contentRect.bottom) : 0,
            contentReachesSectionBottom: !content || content.hidden || Math.abs(contentRect.bottom - sectionRect.bottom) <= 2,
            flexGrow: style.flexGrow,
            isOpen: section.classList.contains("is-open"),
            title: section.querySelector(".accordion-v2__header > span:first-child")?.textContent.trim() || ""
          };
        })
      ));
      expect(leftAccordionLayout[1].title.startsWith("Object Transform")).toBe(true);
      const leftAccordionTitles = leftAccordionLayout.map((entry, index) => index === 1 ? "Object Transform" : entry.title);
      expect(leftAccordionTitles.slice(0, 2)).toEqual(["Object", "Object Transform"]);
      expect(leftAccordionTitles[2]).toMatch(/^Objects \(18 obj, states \d+, 2 shapes\)$/);
      expect(leftAccordionLayout.slice(0, 2).every((entry) => entry.isOpen && entry.contentReachesSectionBottom && entry.flexGrow === "0")).toBe(true);
      await expect(page.locator(".tool-starter__panel--right > .accordion-v2 > .accordion-v2__header > span:first-child").nth(1)).toHaveText("Tools");
      await expect(page.locator(".tool-starter__panel--right > .accordion-v2 > .accordion-v2__header > span:first-child").nth(2)).toHaveText("Shapes");
      await expect(page.locator(".tool-starter__panel--right > .accordion-v2 > .accordion-v2__header > span:first-child").nth(3)).toHaveText("Shape Geometry");
      await expect(page.locator(".tool-starter__panel--right > .accordion-v2 > .accordion-v2__header > span:first-child").nth(4)).toHaveText("Shape Transform");
      const objectAccordionSpacing = await page.locator(".tool-starter__panel--left").evaluate((panel) => {
        const header = panel.querySelector(".accordion-v2__header");
        const content = panel.querySelector(".accordion-v2__content");
        const panelStyle = getComputedStyle(panel);
        const headerStyle = getComputedStyle(header);
        const contentStyle = getComputedStyle(content);
        return {
          contentPaddingTop: Number.parseFloat(contentStyle.paddingTop),
          headerMinHeight: Number.parseFloat(headerStyle.minHeight),
          headerPaddingTop: Number.parseFloat(headerStyle.paddingTop),
          panelGap: Number.parseFloat(panelStyle.gap)
        };
      });
      expect(objectAccordionSpacing).toEqual({ contentPaddingTop: 8, headerMinHeight: 36, headerPaddingTop: 6, panelGap: 5 });

      const tileScrollState = await page.locator("#objectVectorStudioV2ObjectsContent").evaluate((element) => ({
        actionsInsideObjects: element.querySelector(":scope > .object-vector-studio-v2__objects-actions") !== null,
        clientHeight: Math.round(element.clientHeight),
        objectTilesOverflowY: getComputedStyle(element.querySelector("#objectVectorStudioV2ObjectTiles")).overflowY,
        overflowY: getComputedStyle(element).overflowY,
        scrollHeight: Math.round(element.scrollHeight),
        searchInline: Math.abs(
          (element.querySelector("label[for='objectVectorStudioV2SearchFilter'] span").getBoundingClientRect().top + element.querySelector("label[for='objectVectorStudioV2SearchFilter'] span").getBoundingClientRect().height / 2)
          - (element.querySelector("#objectVectorStudioV2SearchFilter").getBoundingClientRect().top + element.querySelector("#objectVectorStudioV2SearchFilter").getBoundingClientRect().height / 2)
        ) < 4,
        tagFilterInline: Math.abs(
          (element.querySelector("label[for='objectVectorStudioV2TagFilter'] span").getBoundingClientRect().top + element.querySelector("label[for='objectVectorStudioV2TagFilter'] span").getBoundingClientRect().height / 2)
          - (element.querySelector("#objectVectorStudioV2TagFilter").getBoundingClientRect().top + element.querySelector("#objectVectorStudioV2TagFilter").getBoundingClientRect().height / 2)
        ) < 4
      }));
      expect(tileScrollState.actionsInsideObjects).toBe(false);
      expect(tileScrollState.objectTilesOverflowY).toBe("visible");
      expect(tileScrollState.overflowY).toBe("auto");
      expect(tileScrollState.searchInline).toBe(true);
      expect(tileScrollState.scrollHeight).toBeGreaterThan(tileScrollState.clientHeight);
      expect(tileScrollState.tagFilterInline).toBe(true);

      await page.locator('button[aria-controls="objectVectorStudioV2ShapeToolsContent"]').click();
      await expect(page.locator("#objectVectorStudioV2ShapeToolsContent")).toBeHidden();
      const collapsedLayout = await page.locator(".tool-starter__panel--right .accordion-v2").evaluateAll((sections) => (
        sections.map((section) => {
          const content = section.querySelector(".accordion-v2__content");
          const sectionRect = section.getBoundingClientRect();
          const contentRect = content?.getBoundingClientRect();
          return {
            contentReachesSectionBottom: !content || content.hidden || Math.abs(contentRect.bottom - sectionRect.bottom) <= 2,
            contentScrollHeight: content ? Math.round(content.scrollHeight) : 0,
            isOpen: section.classList.contains("is-open"),
            height: Math.round(sectionRect.height),
            title: section.querySelector(".accordion-v2__header > span:first-child")?.textContent.trim() || ""
          };
        })
      ));
      const collapsedHeight = collapsedLayout.find((entry) => !entry.isOpen)?.height || 0;
      expect(collapsedHeight).toBeLessThan(64);
      const remainingOpenSections = collapsedLayout.filter((entry) => entry.isOpen);
      expect(remainingOpenSections.filter((entry) => !entry.title.startsWith("Palette")).every((entry) => entry.contentReachesSectionBottom)).toBe(true);
      expect(remainingOpenSections.every((entry) => entry.height >= 44)).toBe(true);
      expect(collapsedLayout.find((entry) => entry.title.startsWith("Palette"))?.height).toBeLessThanOrEqual(320);
      await expect(page.locator(".tool-starter__panel--right")).toHaveCSS("overflow-y", "auto");
      const maxZoomState = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        app.zoomViewport(20);
        return {
          display: document.querySelector("#objectVectorStudioV2CoordinateDisplay").textContent,
          zoom: app.viewport.zoom
        };
      });
      expect(maxZoomState.zoom).toBe(10);
      expect(maxZoomState.display).toContain("Zoom 1000%");
      await page.locator("#objectVectorStudioV2ResetViewButton").click();

      const summary = page.locator("[data-tool-starter-summary]");
      await summary.click();
      await expect(page.locator(".is-collapsible")).not.toHaveAttribute("open", "");
      const fullscreenActive = await page.locator("body").evaluate((body) => body.classList.contains("tools-platform-fullscreen-active"));
      if (!fullscreenActive) {
        await page.evaluate(() => {
          window.__objectVectorStudioV2App.shell.applyFullscreenState(true);
          window.__objectVectorStudioV2App.shell.updateSummary();
        });
      }
      await expect(page.locator("body")).toHaveClass(/tools-platform-fullscreen-active/);
      const fullscreenLayout = await page.evaluate(() => {
        const left = document.querySelector(".tool-starter__panel--left").getBoundingClientRect();
        const center = document.querySelector(".tool-starter__panel--center").getBoundingClientRect();
        const right = document.querySelector(".tool-starter__panel--right").getBoundingClientRect();
        const rightPanel = document.querySelector(".tool-starter__panel--right");
        return {
          centerHeight: Math.round(center.height),
          centerWidth: Math.round(center.width),
          leftBeforeCenter: left.right <= center.left,
          rightAfterCenter: right.left >= center.right,
          rightBottomWithinViewport: right.bottom <= window.innerHeight + 1,
          rightOverflowY: getComputedStyle(rightPanel).overflowY,
          rightScrollable: rightPanel.scrollHeight >= rightPanel.clientHeight
        };
      });
      expect(fullscreenLayout.leftBeforeCenter).toBe(true);
      expect(fullscreenLayout.rightAfterCenter).toBe(true);
      expect(fullscreenLayout.rightBottomWithinViewport).toBe(true);
      expect(fullscreenLayout.rightOverflowY).toBe("auto");
      expect(fullscreenLayout.rightScrollable).toBe(true);
      expect(fullscreenLayout.centerWidth).toBeGreaterThan(300);
      expect(fullscreenLayout.centerHeight).toBeGreaterThan(300);

      await page.evaluate(() => {
        sessionStorage.removeItem("object-vector-studio-v2.runtimePalette");
        sessionStorage.removeItem("workspace.tools.palette-manager-v2");
        sessionStorage.setItem("workspace.tools.object-vector-studio-v2", JSON.stringify({
          name: "Workspace Object Set",
          objects: [],
          toolId: "object-vector-studio-v2",
          version: 1
        }));
      });
      await page.goto(`${server.baseUrl}/tools/object-vector-studio-v2/index.html?launch=workspace&fromTool=workspace-manager-v2&hostContextId=object-vector-v2-missing-palette&workspaceMode=uat`, { waitUntil: "networkidle" });
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Render blocked: runtime palette is required separately from Object Vector Studio V2 JSON\./);
      await page.evaluate(() => {
        sessionStorage.removeItem("workspace.tools.object-vector-studio-v2");
      });
      await page.goto(`${server.baseUrl}/tools/object-vector-studio-v2/index.html?launch=workspace&fromTool=workspace-manager-v2&hostContextId=object-vector-v2-shell&workspaceMode=uat`, { waitUntil: "networkidle" });
      await expect(page.locator('[data-launch-mode-nav="tool"]')).toBeHidden();
      await expect(page.locator('[data-launch-mode-nav="workspace"] button')).toHaveText(["Return to Workspace"]);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Workspace toolState loading blocked: workspace\.tools\.object-vector-studio-v2 is missing/);
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html.*hostContextId=object-vector-v2-shell/);
      await expect(page).toHaveURL(/workspace=uat/);

      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("creates Object Vector Studio V2 square shapes with one size control", async ({ page }) => {
    const server = await startRepoServer();
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

    await workspaceV2CoverageReporter.start(page);
    try {
      await page.goto(`${server.baseUrl}/tools/object-vector-studio-v2/index.html`, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        sessionStorage.setItem("object-vector-studio-v2.runtimePalette", JSON.stringify({
          id: "square-tool-palette",
          swatches: [
            { id: "white", value: "#ffffff" }
          ]
        }));
      });
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles({
        buffer: Buffer.from(JSON.stringify({
          name: "Square Tool Check",
          objects: [
            {
              id: "object.square.tool-check",
              name: "Square Tool Check",
              shapes: [],
              tags: []
            }
          ],
          toolId: "object-vector-studio-v2",
          version: 1
        }, null, 2)),
        mimeType: "application/json",
        name: "square-tool-check.object-vector.json"
      });

      await drawDefaultObjectVectorShape(page, "square");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Created square shape on Square Tool Check from canvas click\./);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails")).toContainText("Square Geometry");
      await expect(page.locator(".object-vector-studio-v2__shape-select-label")).toHaveText("0. Square");
      const createdSquare = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const fields = Array.from(document.querySelectorAll("#objectVectorStudioV2ShapeGeometryDetails [data-shape-geometry-field]")).map((input) => ({
          key: input.dataset.shapeGeometryField,
          label: input.closest("label").querySelector("span").textContent.trim(),
          value: input.value
        }));
        const shape = app.selectedShape();
        return {
          fields,
          geometry: shape.geometry,
          schemaOk: app.schemaService.validatePayload(app.currentPayload).ok,
          style: shape.style,
          tool: shape.tool
        };
      });
      expect(createdSquare).toEqual({
        fields: [
          { key: "x", label: "x", value: "-80" },
          { key: "y", label: "y", value: "-30" },
          { key: "size", label: "Size", value: "60" }
        ],
        geometry: { height: 60, width: 60, x: -80, y: -30 },
        schemaOk: true,
        style: { fill: "#00000000", fillOpacity: 1, stroke: "#ffffff", strokeOpacity: 1, strokeWidth: 2 },
        tool: "square"
      });

      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-shape-geometry-field='size']").fill("42");
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-shape-geometry-field='size']").dispatchEvent("change");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Auto-applied geometry edits to shape row 0\./);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']")).toHaveAttribute("width", "420");
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']")).toHaveAttribute("height", "420");
      const resizedSquare = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        return {
          geometry: app.selectedShape().geometry,
          schemaOk: app.schemaService.validatePayload(app.currentPayload).ok
        };
      });
      expect(resizedSquare).toEqual({
        geometry: { height: 42, width: 42, x: -80, y: -30 },
        schemaOk: true
      });

      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("creates Object Vector Studio V2 shapes with canvas drawing and snap modes", async ({ page }) => {
    const server = await startRepoServer();
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

    await workspaceV2CoverageReporter.start(page);
    try {
      await page.goto(`${server.baseUrl}/tools/object-vector-studio-v2/index.html`, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        sessionStorage.setItem("object-vector-studio-v2.runtimePalette", JSON.stringify({
          id: "drawing-flow-palette",
          swatches: [
            { id: "white", value: "#ffffff" },
            { id: "cyan", value: "#6fd3ff" }
          ]
        }));
      });
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles({
        buffer: Buffer.from(JSON.stringify({
          name: "Drawing Flow Check",
          objects: [
            {
              id: "object.drawing.flow",
              name: "Drawing Flow",
              shapes: [],
              tags: []
            }
          ],
          toolId: "object-vector-studio-v2",
          version: 1
        }, null, 2)),
        mimeType: "application/json",
        name: "drawing-flow-check.object-vector.json"
      });
      await page.locator("#objectVectorStudioV2StrokeModeButton").click();
      await page.locator("[data-palette-color='#6fd3ff']").click();
      await page.locator("#objectVectorStudioV2StrokeWidth").fill("4.5");
      await page.locator("#objectVectorStudioV2StrokeWidth").dispatchEvent("change");

      await page.locator('[data-shape-tool="polygon"]').click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Drawing mode selected: Polygon\. Click to add points\.\n\nDouble-click to finish\./);
      await moveObjectVectorLogicalPoint(page, { x: -30, y: -20 });
      await expect(page.locator("#objectVectorStudioV2WorkArea .object-vector-studio-v2__drawing-hint")).toHaveText("Double-click / Enter to complete");
      const polygonHintState = await page.locator("#objectVectorStudioV2WorkArea .object-vector-studio-v2__drawing-hint").evaluate((hint) => {
        const app = window.__objectVectorStudioV2App;
        const rect = hint.getBoundingClientRect();
        return {
          fontSize: getComputedStyle(hint).fontSize,
          height: Math.round(rect.height),
          hintX: Math.round(rect.left),
          hintY: Math.round(rect.top),
          pointerEvents: getComputedStyle(hint).pointerEvents,
          pointerX: Math.round(app.drawingHintClientPoint.x),
          pointerY: Math.round(app.drawingHintClientPoint.y)
        };
      });
      expect(polygonHintState.pointerEvents).toBe("none");
      expect(polygonHintState.hintX).toBeGreaterThan(polygonHintState.pointerX);
      expect(polygonHintState.hintY).toBeGreaterThan(polygonHintState.pointerY);
      await moveObjectVectorLogicalPoint(page, { x: -25, y: -15 });
      const movedPolygonHint = await page.locator("#objectVectorStudioV2WorkArea .object-vector-studio-v2__drawing-hint").evaluate((hint) => ({
        x: Math.round(hint.getBoundingClientRect().left),
        y: Math.round(hint.getBoundingClientRect().top)
      }));
      expect(movedPolygonHint.x).toBeGreaterThan(polygonHintState.hintX);
      expect(movedPolygonHint.y).toBeGreaterThan(polygonHintState.hintY);
      await clickObjectVectorLogicalPoint(page, -20, -10);
      await clickObjectVectorLogicalPoint(page, 0, -20);
      await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        app.activeDrawing.style.pointRounding = [false, true, false];
        app.activeDrawing.style.roundingRadius = 5;
      });
      await moveObjectVectorLogicalPoint(page, { x: 20, y: -10 });
      const roundedSnapLine = await page.locator("#objectVectorStudioV2RenderSurface .object-vector-studio-v2__snap-line").evaluate((line) => ({
        d: line.getAttribute("d"),
        mode: line.dataset.snapLineMode,
        stroke: getComputedStyle(line).stroke,
        tagName: line.tagName.toLowerCase()
      }));
      expect(roundedSnapLine).toEqual({
        d: expect.stringContaining("Q"),
        mode: "grid",
        stroke: expect.any(String),
        tagName: "path"
      });
      const zoomHintStates = await page.locator("#objectVectorStudioV2WorkArea .object-vector-studio-v2__drawing-hint").evaluate((hint) => {
        const app = window.__objectVectorStudioV2App;
        const collect = (zoom) => {
          app.viewport.zoom = zoom;
          app.updateViewport();
          app.renderWorkSurface();
          const nextHint = document.querySelector("#objectVectorStudioV2WorkArea .object-vector-studio-v2__drawing-hint");
          const rect = nextHint.getBoundingClientRect();
          return {
            fontSize: getComputedStyle(nextHint).fontSize,
            height: Math.round(rect.height),
            zoom
          };
        };
        const states = [collect(1), collect(3), collect(0.5)];
        app.viewport.zoom = 1;
        app.updateViewport();
        app.renderWorkSurface();
        return states;
      });
      expect(zoomHintStates.map((state) => state.fontSize)).toEqual(["12px", "12px", "12px"]);
      expect(new Set(zoomHintStates.map((state) => state.height)).size).toBe(1);
      await page.locator('[data-shape-tool="polyline"]').click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Drawing mode selected: Polyline\. Click to add points\.\n\nDouble-click to finish\./);
      await page.locator('[data-shape-tool="rectangle"]').click();
      await expect(page.locator('[data-shape-tool="rectangle"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveClass(/is-drawing-mode/);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index]")).toHaveCount(0);
      await clickObjectVectorLogicalPoint(page, -80, -30);
      await moveObjectVectorLogicalPoint(page, { x: -20, y: 30 });
      await expect(page.locator("#objectVectorStudioV2RenderSurface .object-vector-studio-v2__drawing-preview")).toHaveCount(1);
      await page.keyboard.press("Escape");
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveClass(/is-drawing-mode/);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index]")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2RenderSurface .object-vector-studio-v2__drawing-preview")).toHaveCount(1);
      await page.locator('[data-shape-tool="select"]').click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).not.toHaveClass(/is-drawing-mode/);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index]")).toHaveCount(0);

      await drawObjectVectorShape(page, "line", [{ x: -10, y: 0 }, { x: 10, y: 0 }]);
      await drawObjectVectorShape(page, "polygon", [{ x: -10, y: -10 }, { x: 10, y: -10 }, { x: 10, y: 10 }, { x: -10, y: 10 }]);
      await drawObjectVectorShape(page, "polyline", [{ x: -20, y: 20 }, { x: 0, y: 0 }, { x: 20, y: 20 }]);
      await expect(page.locator("#objectVectorStudioV2RenderSurface polyline[data-shape-index='2']")).toHaveCount(1);
      const pointDrawnShapes = await page.evaluate(() => window.__objectVectorStudioV2App.selectedObject().shapes.map((shape) => ({
        fill: shape.style.fill,
        geometry: shape.geometry,
        stroke: shape.style.stroke,
        strokeOpacity: shape.style.strokeOpacity,
        strokeWidth: shape.style.strokeWidth,
        tool: shape.tool
      })));
      expect(pointDrawnShapes).toMatchObject([
        { fill: "#00000000", geometry: { point1: { x: -10, y: 0 }, point2: { x: 10, y: 0 } }, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 4.5, tool: "line" },
        { fill: "#00000000", geometry: { points: [{ x: -10, y: -10 }, { x: 10, y: -10 }, { x: 10, y: 10 }, { x: -10, y: 10 }] }, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 4.5, tool: "polygon" },
        { fill: "#00000000", geometry: { points: [{ x: -20, y: 20 }, { x: 0, y: 0 }, { x: 20, y: 20 }] }, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 4.5, tool: "polyline" }
      ]);
      const strokeOnlyPolygonBeforeSelection = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const polygon = app.selectedObject().shapes[1];
        polygon.style.fill = "none";
        polygon.transform = { ...app.shapeTransform(polygon), x: 30 };
        const override = app.activeFrame()?.shapeOverrides?.find((entry) => entry.shapeIndex === 1);
        if (override) {
          override.transform = { ...polygon.transform };
        }
        app.renderPayload();
        app.selectShape(2, "test setup");
        return JSON.parse(JSON.stringify(polygon.style));
      });
      await page.locator('[data-shape-tool="select"]').click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).not.toHaveClass(/is-drawing-mode/);
      await mouseClickObjectVectorLogicalPoint(page, 30, -5);
      await expect.poll(async () => page.evaluate(() => window.__objectVectorStudioV2App.selectedShapeIndex)).toBe(1);
      await expect(page.locator("#objectVectorStudioV2StrokeModeButton")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#objectVectorStudioV2PaintModeButton")).toHaveAttribute("aria-pressed", "false");
      const strokeOnlyPolygonAfterSelection = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        return {
          activeTool: app.activeTool,
          paletteTarget: app.paletteTarget,
          style: JSON.parse(JSON.stringify(app.selectedShape().style))
        };
      });
      expect(strokeOnlyPolygonAfterSelection).toEqual({
        activeTool: "select",
        paletteTarget: "stroke",
        style: strokeOnlyPolygonBeforeSelection
      });
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected shape from render surface: row 1 \(polygon\)\. Multi-select count: 1\./);
      await mouseClickObjectVectorLogicalPoint(page, -140, -100);
      await expect.poll(async () => page.evaluate(() => window.__objectVectorStudioV2App.selectedShapeIndex)).toBe(-1);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails")).toContainText("No shape selected");
      await expect.poll(async () => page.evaluate(() => window.__objectVectorStudioV2App.selectedObject().shapes.map((shape) => shape.style.stroke))).toEqual(["#6fd3ff", "#6fd3ff", "#6fd3ff"]);
      await mouseClickObjectVectorLogicalPoint(page, 30, -5);
      await expect.poll(async () => page.evaluate(() => window.__objectVectorStudioV2App.selectedShapeIndex)).toBe(1);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails")).toContainText("Polygon Geometry");

      await page.locator('[data-shape-tool="polygon"]').click();
      await clickObjectVectorLogicalPoint(page, 30, 30);
      await clickObjectVectorLogicalPoint(page, 35, 30);
      await page.keyboard.press("Escape");
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index]")).toHaveCount(3);
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveClass(/is-drawing-mode/);
      await page.locator('[data-shape-tool="select"]').click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).not.toHaveClass(/is-drawing-mode/);

      await expect(page.locator("#objectVectorStudioV2SnapModeButton")).toHaveText("Snap Grid");
      await drawObjectVectorShape(page, "line", [{ x: 1.2, y: 1.6 }, { x: 3.7, y: 4.2 }]);
      const gridSnappedLine = await page.evaluate(() => window.__objectVectorStudioV2App.selectedShape().geometry);
      expect(gridSnappedLine).toEqual({ point1: { x: 1, y: 2 }, point2: { x: 4, y: 4 } });

      await page.locator("#objectVectorStudioV2SnapModeButton").click();
      await expect(page.locator("#objectVectorStudioV2SnapModeButton")).toHaveText("Snap Point");
      await expect(page.locator("#objectVectorStudioV2SnapModeButton")).toHaveAttribute("data-snap-mode", "point");
      await expect(page.locator("#objectVectorStudioV2SnapModeButton")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#objectVectorStudioV2RenderSurface .object-vector-studio-v2__snap-target")).not.toHaveCount(0);
      const snapPointColorState = await page.evaluate(() => ({
        buttonIconColor: getComputedStyle(document.querySelector("#objectVectorStudioV2SnapModeButton"), "::before").color,
        buttonTextColor: getComputedStyle(document.querySelector("#objectVectorStudioV2SnapModeButton")).color,
        targetStroke: getComputedStyle(document.querySelector("#objectVectorStudioV2RenderSurface .object-vector-studio-v2__snap-target")).stroke
      }));
      expect(snapPointColorState.buttonIconColor).toBe(snapPointColorState.targetStroke);
      expect(snapPointColorState.buttonTextColor).not.toBe(snapPointColorState.targetStroke);
      await drawObjectVectorShape(page, "line", [{ x: 1.3, y: 2.2 }, { x: 4.2, y: 4.1 }]);
      const pointSnappedLine = await page.evaluate(() => window.__objectVectorStudioV2App.selectedShape().geometry);
      expect(pointSnappedLine).toEqual({ point1: { x: 1, y: 2 }, point2: { x: 4, y: 4 } });

      await page.locator("#objectVectorStudioV2SnapModeButton").click();
      await expect(page.locator("#objectVectorStudioV2SnapModeButton")).toHaveText("Snap None");
      await expect(page.locator("#objectVectorStudioV2SnapModeButton")).toHaveAttribute("data-snap-mode", "none");
      await expect(page.locator("#objectVectorStudioV2SnapModeButton")).toHaveAttribute("aria-pressed", "false");
      const snapNoneColorState = await page.evaluate(() => ({
        disabledIconColor: getComputedStyle(document.querySelector("#objectVectorStudioV2AngleSnapButton"), "::before").color,
        snapNoneIconColor: getComputedStyle(document.querySelector("#objectVectorStudioV2SnapModeButton"), "::before").color,
        snapNoneTextColor: getComputedStyle(document.querySelector("#objectVectorStudioV2SnapModeButton")).color
      }));
      expect(snapNoneColorState.snapNoneIconColor).toBe(snapNoneColorState.disabledIconColor);
      expect(snapNoneColorState.snapNoneTextColor).not.toBe(snapNoneColorState.disabledIconColor);
      await drawObjectVectorShape(page, "line", [{ x: 5.25, y: 6.5 }, { x: 7.75, y: 8.25 }]);
      const unsnappedLine = await page.evaluate(() => window.__objectVectorStudioV2App.selectedShape().geometry);
      expect(unsnappedLine).toEqual({ point1: { x: 5.25, y: 6.5 }, point2: { x: 7.75, y: 8.25 } });
      await drawObjectVectorShape(page, "line", [{ x: 5.1234, y: 6.5678 }, { x: 7.9876, y: 8.5432 }]);
      const snapNoneFormattedLine = await page.evaluate(() => {
        const geometry = window.__objectVectorStudioV2App.selectedShape().geometry;
        const decimalLength = (value) => {
          const [, decimals = ""] = String(value).split(".");
          return decimals.length;
        };
        return {
          geometry,
          maxDecimals: Math.max(
            decimalLength(geometry.point1.x),
            decimalLength(geometry.point1.y),
            decimalLength(geometry.point2.x),
            decimalLength(geometry.point2.y)
          )
        };
      });
      expect(snapNoneFormattedLine.geometry.point1.x).toBeCloseTo(5.123, 3);
      expect(snapNoneFormattedLine.geometry.point1.y).toBeCloseTo(6.568, 3);
      expect(snapNoneFormattedLine.geometry.point2.x).toBeCloseTo(7.988, 3);
      expect(snapNoneFormattedLine.geometry.point2.y).toBeCloseTo(8.543, 3);
      expect(snapNoneFormattedLine.maxDecimals).toBeLessThanOrEqual(3);

      await page.locator("#objectVectorStudioV2AngleSnapButton").click();
      await expect(page.locator("#objectVectorStudioV2AngleSnapButton")).toHaveAttribute("aria-pressed", "true");
      await page.locator("#objectVectorStudioV2SnapAngleStepSelect").selectOption("45");
      await drawObjectVectorShape(page, "line", [{ x: 0, y: 0 }, { x: 10, y: 3 }]);
      await drawObjectVectorShape(page, "polyline", [{ x: 20, y: 0 }, { x: 30, y: 3 }, { x: 38, y: 10 }]);
      await drawObjectVectorShape(page, "polygon", [{ x: -30, y: 0 }, { x: -20, y: 3 }, { x: -12, y: 11 }, { x: -30, y: 14 }]);
      const angleSnappedDrawing = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const shapeByTool = (tool) => [...app.selectedObject().shapes].reverse().find((shape) => shape.tool === tool);
        const pointsForShape = (shape) => shape.tool === "line" ? [shape.geometry.point1, shape.geometry.point2] : shape.geometry.points;
        const decimalLength = (value) => {
          const [, decimals = ""] = String(value).split(".");
          return decimals.length;
        };
        const segmentSnapsToStep = (start, end, step) => {
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const degrees = ((Math.atan2(dy, dx) * 180 / Math.PI) % 360 + 360) % 360;
          const nearest = Math.round(degrees / step) * step;
          const wrappedDelta = Math.abs(((degrees - nearest + 540) % 360) - 180);
          return wrappedDelta < 0.05;
        };
        const collect = (tool) => {
          const shape = shapeByTool(tool);
          const points = pointsForShape(shape);
          const coordinates = points.flatMap((point) => [point.x, point.y]);
          return {
            geometry: shape.geometry,
            maxDecimals: Math.max(...coordinates.map(decimalLength)),
            segmentAnglesSnapped: points.slice(1).map((point, index) => segmentSnapsToStep(points[index], point, 45))
          };
        };
        return {
          angleStep: app.angleSnapStep,
          line: collect("line"),
          polygon: collect("polygon"),
          polyline: collect("polyline")
        };
      });
      expect(angleSnappedDrawing.angleStep).toBe(45);
      expect(angleSnappedDrawing.line.segmentAnglesSnapped).toEqual([true]);
      expect(angleSnappedDrawing.polyline.segmentAnglesSnapped).toEqual([true, true]);
      expect(angleSnappedDrawing.polygon.segmentAnglesSnapped).toEqual([true, true, true]);
      expect(angleSnappedDrawing.line.maxDecimals).toBeLessThanOrEqual(3);
      expect(angleSnappedDrawing.polyline.maxDecimals).toBeLessThanOrEqual(3);
      expect(angleSnappedDrawing.polygon.maxDecimals).toBeLessThanOrEqual(3);
      await page.locator("#objectVectorStudioV2AngleSnapButton").click();
      await expect(page.locator("#objectVectorStudioV2AngleSnapButton")).toHaveAttribute("aria-pressed", "false");

      await page.locator("#objectVectorStudioV2SnapModeButton").click();
      await expect(page.locator("#objectVectorStudioV2SnapModeButton")).toHaveText("Snap Grid");
      await expect(page.locator("#objectVectorStudioV2SnapModeButton")).toHaveAttribute("data-snap-mode", "grid");

      await drawObjectVectorShape(page, "rectangle", [{ x: -80, y: -30 }, { x: -20, y: 30 }]);
      await drawObjectVectorShape(page, "square", [{ x: -60, y: -30 }, { x: -10, y: 20 }]);
      await drawObjectVectorShape(page, "circle", [{ x: 20, y: -20 }, { x: 45, y: -20 }]);
      await drawObjectVectorShape(page, "ellipse", [{ x: 60, y: -30 }, { x: 95, y: -5 }]);
      await drawObjectVectorShape(page, "triangle", [{ x: -30, y: 50 }, { x: 10, y: 80 }]);
      await drawObjectVectorShape(page, "text", [{ x: 50, y: 50 }, { x: 60, y: 62 }]);
      const strokeOnlyCreatedShapes = await page.evaluate(() => {
        const createdTools = ["rectangle", "square", "circle", "ellipse", "triangle", "text"];
        return window.__objectVectorStudioV2App.selectedObject().shapes
          .filter((shape) => createdTools.includes(shape.tool))
          .map((shape) => ({
            fill: shape.style.fill,
            fillOpacity: shape.style.fillOpacity,
            stroke: shape.style.stroke,
            strokeOpacity: shape.style.strokeOpacity,
            strokeWidth: shape.style.strokeWidth,
            tool: shape.tool
          }));
      });
      expect(strokeOnlyCreatedShapes).toEqual([
        { fill: "#00000000", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 4.5, tool: "rectangle" },
        { fill: "#00000000", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 4.5, tool: "square" },
        { fill: "#00000000", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 4.5, tool: "circle" },
        { fill: "#00000000", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 4.5, tool: "ellipse" },
        { fill: "#00000000", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 4.5, tool: "triangle" },
        { fill: "#00000000", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 4.5, tool: "text" }
      ]);
      await page.locator('[data-shape-tool="select"]').click();
      const squareShapeIndex = await page.evaluate(() => window.__objectVectorStudioV2App.selectedObject().shapes.findIndex((shape) => shape.tool === "square"));
      expect(squareShapeIndex).toBeGreaterThanOrEqual(0);
      await page.evaluate((shapeIndex) => window.__objectVectorStudioV2App.selectShape(shapeIndex, "square rounding test"), squareShapeIndex);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails h4").first()).toHaveText("Square Geometry");
      const squareRadiusInput = page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-shape-rounding-radius='true']");
      await expect(squareRadiusInput).toBeVisible();
      await page.evaluate((shapeIndex) => {
        const app = window.__objectVectorStudioV2App;
        const nextPayload = app.cloneCurrentPayload();
        const shape = app.findShapeInPayload(nextPayload, shapeIndex);
        shape.style = {
          ...shape.style,
          pointRounding: [false, true, false, false],
          roundingRadius: 9
        };
        app.commitPayloadUpdate(nextPayload, app.selectedObjectId, shapeIndex, `OK Updated square rounding test style for shape row ${shapeIndex}.`, "Square rounding test failed schema validation");
      }, squareShapeIndex);
      await expect(page.locator("#statusLog")).toHaveValue(new RegExp(`OK Updated square rounding test style for shape row ${squareShapeIndex}\\.`));
      const roundedSquareState = await page.locator(`#objectVectorStudioV2RenderSurface [data-shape-index='${squareShapeIndex}']`).evaluate((shape) => {
        const selected = window.__objectVectorStudioV2App.selectedShape();
        return {
          d: shape.getAttribute("d"),
          geometry: selected.geometry,
          pointRounding: selected.style.pointRounding,
          roundedPointRender: shape.dataset.roundedPointRender,
          roundingRadius: selected.style.roundingRadius,
          tag: shape.tagName.toLowerCase(),
          tool: selected.tool
        };
      });
      expect(roundedSquareState).toMatchObject({
        d: expect.stringContaining("Q"),
        geometry: { height: 50, width: 50 },
        pointRounding: [false, true, false, false],
        roundedPointRender: "path",
        roundingRadius: 9,
        tag: "path",
        tool: "square"
      });

      await page.locator("#objectVectorStudioV2StrokeWidth").fill("20");
      await page.locator("#objectVectorStudioV2StrokeWidth").dispatchEvent("change");
      await page.locator('[data-shape-tool="line"]').click();
      await clickObjectVectorLogicalPoint(page, -40, -50);
      await moveObjectVectorLogicalPoint(page, { x: -10, y: -30 });
      const wideStrokePreview = await page.locator("#objectVectorStudioV2RenderSurface .object-vector-studio-v2__drawing-preview").evaluate((preview) => ({
        dash: preview.style.strokeDasharray,
        strokeLinecap: preview.style.strokeLinecap,
        strokeLinejoin: preview.style.strokeLinejoin,
        strokeWidth: Number(preview.getAttribute("stroke-width")),
        tool: preview.dataset.drawingPreviewTool
      }));
      const wideStrokeDash = wideStrokePreview.dash.match(/[\d.]+/g).map(Number);
      expect(wideStrokePreview).toMatchObject({ strokeLinecap: "square", strokeLinejoin: "miter", strokeWidth: 20, tool: "line" });
      expect(wideStrokeDash[0]).toBeGreaterThan(5);
      expect(wideStrokeDash[0]).toBeLessThan(220);
      expect(wideStrokeDash[1]).toBeGreaterThan(4);
      await clickObjectVectorLogicalPoint(page, -10, -30);
      const wideStrokeLine = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        return {
          index: app.selectedShapeIndex,
          style: JSON.parse(JSON.stringify(app.selectedShape().style))
        };
      });
      expect(wideStrokeLine.style).toMatchObject({
        fill: "#00000000",
        stroke: "#6fd3ff",
        strokeOpacity: 1,
        strokeWidth: 20
      });
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-shape-point-style-field]")).toHaveCount(0);
      const committedWideLine = await page.locator(`#objectVectorStudioV2RenderSurface [data-shape-index="${wideStrokeLine.index}"]`).evaluate((shape) => ({
        dash: getComputedStyle(shape).strokeDasharray,
        endPointStyle: shape.dataset.endPointStyle,
        isPreview: shape.classList.contains("object-vector-studio-v2__drawing-preview"),
        startPointStyle: shape.dataset.startPointStyle,
        strokeLinecap: shape.getAttribute("stroke-linecap"),
        strokeLinejoin: shape.getAttribute("stroke-linejoin"),
        strokeWidth: Number(shape.getAttribute("stroke-width"))
      }));
      expect(committedWideLine).toEqual({ dash: "none", endPointStyle: "square", isPreview: false, startPointStyle: "square", strokeLinecap: "square", strokeLinejoin: "miter", strokeWidth: 20 });
      await expect(page.locator(`#objectVectorStudioV2RenderSurface [data-point-style-caps='line'] [data-point-style-cap]`)).toHaveCount(0);

      await page.locator('[data-shape-tool="polyline"]').click();
      await clickObjectVectorLogicalPoint(page, 10, -40);
      await clickObjectVectorLogicalPoint(page, 20, -20);
      await clickObjectVectorLogicalPoint(page, 40, -40);
      await clickObjectVectorLogicalPoint(page, 55, -20);
      await page.keyboard.press("Enter");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-shape-point-style-field]")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-round='true']")).toHaveCount(4);
      await expect.poll(() => page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-round='true']").evaluateAll((checkboxes) => checkboxes.map((checkbox) => checkbox.checked))).toEqual([false, false, false, false]);
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-round='true'][data-polygon-point-index='1']").check();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Updated point 2 rounding to round for shape row \d+\./);
      const polylineIndex = await page.evaluate(() => window.__objectVectorStudioV2App.selectedShapeIndex);
      const polylineJoinStyle = await page.locator(`#objectVectorStudioV2RenderSurface [data-shape-index="${polylineIndex}"]`).evaluate((shape) => {
        const markers = Array.from(document.querySelectorAll("#objectVectorStudioV2RenderSurface [data-point-style-caps='polyline'] [data-point-style-cap]")).map((marker) => ({
          id: marker.dataset.pointStyleCap,
          pointStyle: marker.dataset.pointStyle,
          tag: marker.tagName.toLowerCase()
        }));
        return {
          d: shape.getAttribute("d"),
          jointStyle: shape.dataset.pointStyle || "",
          markers,
          pointRounding: window.__objectVectorStudioV2App.selectedShape().style.pointRounding,
          roundedPointRender: shape.dataset.roundedPointRender,
          strokeLinejoin: shape.getAttribute("stroke-linejoin"),
          tag: shape.tagName.toLowerCase()
        };
      });
      expect(polylineJoinStyle).toEqual({
        d: expect.stringContaining("Q"),
        jointStyle: "square",
        markers: [{ id: "point-1", pointStyle: "round", tag: "circle" }],
        pointRounding: [false, true, false, false],
        roundedPointRender: "path",
        strokeLinejoin: "miter",
        tag: "path"
      });
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-round='true'][data-polygon-point-index='2']").check();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Updated point 3 rounding to round for shape row \d+\./);
      const polylineTwoRoundedJoints = await page.locator(`#objectVectorStudioV2RenderSurface [data-shape-index="${polylineIndex}"]`).evaluate((shape) => {
        const markers = Array.from(document.querySelectorAll("#objectVectorStudioV2RenderSurface [data-point-style-caps='polyline'] [data-point-style-cap]")).map((marker) => marker.dataset.pointStyleCap);
        return {
          d: shape.getAttribute("d"),
          jointStyle: shape.dataset.pointStyle || "",
          markers,
          pointRounding: window.__objectVectorStudioV2App.selectedShape().style.pointRounding,
          roundedPointRender: shape.dataset.roundedPointRender,
          strokeLinejoin: shape.getAttribute("stroke-linejoin"),
          tag: shape.tagName.toLowerCase()
        };
      });
      expect(polylineTwoRoundedJoints).toEqual({
        d: expect.stringMatching(/Q .* Q /),
        jointStyle: "square",
        markers: ["point-1", "point-2"],
        pointRounding: [false, true, true, false],
        roundedPointRender: "path",
        strokeLinejoin: "miter",
        tag: "path"
      });
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-round='true'][data-polygon-point-index='1']").uncheck();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Updated point 2 rounding to square for shape row \d+\./);
      const polylineIndependentJoint = await page.locator(`#objectVectorStudioV2RenderSurface [data-shape-index="${polylineIndex}"]`).evaluate((shape) => {
        const markers = Array.from(document.querySelectorAll("#objectVectorStudioV2RenderSurface [data-point-style-caps='polyline'] [data-point-style-cap]")).map((marker) => marker.dataset.pointStyleCap);
        return {
          d: shape.getAttribute("d"),
          jointStyle: shape.dataset.pointStyle || "",
          markers,
          pointRounding: window.__objectVectorStudioV2App.selectedShape().style.pointRounding,
          roundedPointRender: shape.dataset.roundedPointRender,
          strokeLinejoin: shape.getAttribute("stroke-linejoin"),
          tag: shape.tagName.toLowerCase()
        };
      });
      expect(polylineIndependentJoint).toEqual({
        d: expect.stringContaining("Q"),
        jointStyle: "square",
        markers: ["point-2"],
        pointRounding: [false, false, true, false],
        roundedPointRender: "path",
        strokeLinejoin: "miter",
        tag: "path"
      });

      await page.locator('[data-shape-tool="text"]').click();
      await clickObjectVectorLogicalPoint(page, 70, 60);
      await moveObjectVectorLogicalPoint(page, { x: 76, y: 66 });
      const textPreview = await page.locator("#objectVectorStudioV2RenderSurface text.object-vector-studio-v2__drawing-preview").evaluate((preview) => ({
        dash: preview.style.strokeDasharray,
        fill: preview.getAttribute("fill"),
        fontSize: Number(preview.getAttribute("font-size")),
        stroke: preview.getAttribute("stroke"),
        strokeWidth: Number(preview.getAttribute("stroke-width")),
        text: preview.textContent.trim(),
        tool: preview.dataset.drawingPreviewTool
      }));
      expect(textPreview).toEqual({
        dash: "none",
        fill: "#00000000",
        fontSize: 60,
        stroke: "#6fd3ff",
        strokeWidth: 20,
        text: "Text",
        tool: "text"
      });
      await clickObjectVectorLogicalPoint(page, 76, 66);
      const committedText = await page.evaluate(() => ({
        geometry: { ...window.__objectVectorStudioV2App.selectedShape().geometry },
        shapeCount: window.__objectVectorStudioV2App.selectedObject().shapes.length,
        style: { ...window.__objectVectorStudioV2App.selectedShape().style }
      }));
      expect(committedText.geometry).toEqual({ fontSize: 6, text: "Text", x: 70, y: 66 });
      expect(committedText.style).toMatchObject({
        fill: "#00000000",
        stroke: "#6fd3ff",
        strokeOpacity: 1,
        strokeWidth: 20
      });
      await expect(page.locator("#objectVectorStudioV2RenderSurface .object-vector-studio-v2__pivot-origin")).toHaveCount(0);
      const previewToolbarAfterText = await page.evaluate(() => Array.from(document.querySelectorAll(".object-vector-studio-v2__preview-edit-toolbar button")).map((button) => ({
        disabled: button.disabled,
        label: button.textContent.trim()
      })));
      expect(previewToolbarAfterText).toEqual([
        { disabled: false, label: "Undo" },
        { disabled: true, label: "Redo" },
        { disabled: false, label: "Copy" },
        { disabled: true, label: "Paste" }
      ]);
      await page.locator("#objectVectorStudioV2PreviewCopyButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Copied shape row \d+ to Object Preview clipboard\./);
      await expect(page.locator("#objectVectorStudioV2PreviewPasteButton")).toBeEnabled();
      await page.locator("#objectVectorStudioV2PreviewPasteButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Pasted copied shape into Drawing Flow\./);
      await expect.poll(async () => page.evaluate(() => window.__objectVectorStudioV2App.selectedObject().shapes.length)).toBe(committedText.shapeCount + 1);
      await expect(page.locator("#objectVectorStudioV2PreviewUndoButton")).toBeEnabled();
      await page.locator("#objectVectorStudioV2PreviewUndoButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Undo applied to Object Preview edits\./);
      await expect.poll(async () => page.evaluate(() => window.__objectVectorStudioV2App.selectedObject().shapes.length)).toBe(committedText.shapeCount);
      await expect(page.locator("#objectVectorStudioV2PreviewRedoButton")).toBeEnabled();
      await page.locator("#objectVectorStudioV2PreviewRedoButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Redo applied to Object Preview edits\./);
      await expect.poll(async () => page.evaluate(() => window.__objectVectorStudioV2App.selectedObject().shapes.length)).toBe(committedText.shapeCount + 1);

      const shapeCountBeforeDoubleClick = await page.evaluate(() => window.__objectVectorStudioV2App.selectedObject().shapes.length);
      await page.locator('[data-shape-tool="polygon"]').click();
      await clickObjectVectorLogicalPoint(page, 80, -40);
      await clickObjectVectorLogicalPoint(page, 95, -40);
      await clickObjectVectorLogicalPoint(page, 95, -25);
      await clickObjectVectorLogicalPoint(page, 80, -25);
      await doubleClickObjectVectorLogicalPoint(page, 80, -25);
      await expect.poll(async () => page.evaluate(() => window.__objectVectorStudioV2App.selectedObject().shapes.length)).toBe(shapeCountBeforeDoubleClick + 1);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Created polygon shape on Drawing Flow from double-click\./);

      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("maps Object Vector Studio V2 preview coordinates directly to visible grid lines", async ({ page }) => {
    const server = await startRepoServer();
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

    await workspaceV2CoverageReporter.start(page);
    try {
      await page.goto(`${server.baseUrl}/tools/object-vector-studio-v2/index.html`, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        sessionStorage.setItem("object-vector-studio-v2.runtimePalette", JSON.stringify({
          id: "asteroids-ship-grid",
          swatches: [
            { id: "white", value: "#ffffff" },
            { id: "cyan", value: "#6fd3ff" }
          ]
        }));
      });
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles({
        buffer: Buffer.from(JSON.stringify({
          name: "Asteroids Ship Grid Check",
          objects: [
            {
              id: "object.asteroids.ship-grid",
              name: "Asteroids Ship Grid Check",
              shapes: [
                {
                  geometry: {
                    points: [
                      { x: 0, y: -18 },
                      { x: 14, y: 16 },
                      { x: 0, y: 8 },
                      { x: -14, y: 16 }
                    ]
                  },
                  tool: "polygon",
                  locked: false,
                  order: 1,
                  style: { fill: "#ffffff", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 1 },
                  transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                  visible: true
                }
              ],
              tags: []
            }
          ],
          toolId: "object-vector-studio-v2",
          version: 1
        }, null, 2)),
        mimeType: "application/json",
        name: "asteroids-ship-grid.object-vector.json"
      });
      await expect(page.locator("#statusLog")).toHaveValue(/OK Render mode svg-work-surface: rendered Asteroids Ship Grid Check with 1 visible shapes; capture mode none\./);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails")).toContainText("Polygon Geometry");
      await expect.poll(() => page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__polygon-point-field").evaluateAll((rows) => rows.map((row) => ({
        label: row.querySelector(".object-vector-studio-v2__polygon-point-label").textContent.trim(),
        rounded: row.querySelector("[data-polygon-point-round='true']").checked,
        x: row.querySelector("[data-polygon-point-axis='x']").value,
        y: row.querySelector("[data-polygon-point-axis='y']").value
      })))).toEqual([
        { label: "Point 1", rounded: false, x: "0.000", y: "-18.000" },
        { label: "Point 2", rounded: false, x: "14.000", y: "16.000" },
        { label: "Point 3", rounded: false, x: "0.000", y: "8.000" },
        { label: "Point 4", rounded: false, x: "-14.000", y: "16.000" }
      ]);
      const polygonPointListLayout = await page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__polygon-point-list").evaluate((list) => ({
        headingMarginBottom: Number.parseFloat(getComputedStyle(list.previousElementSibling).marginBottom),
        headingMarginTop: Number.parseFloat(getComputedStyle(list.previousElementSibling).marginTop),
        listGap: Number.parseFloat(getComputedStyle(list).gap),
        maxHeight: getComputedStyle(list).maxHeight,
        overflowY: getComputedStyle(list).overflowY,
        sectionGap: Number.parseFloat(getComputedStyle(list.closest(".object-vector-studio-v2__edit-panel--polygon")).gap)
      }));
      expect(polygonPointListLayout).toEqual({ headingMarginBottom: 0, headingMarginTop: 0, listGap: 5, maxHeight: "none", overflowY: "visible", sectionGap: 5 });
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-side-action]")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails")).not.toContainText("Delete Point(s)");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-round='true']")).toHaveCount(4);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-add='true']")).toHaveCount(4);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-delete='true']")).toHaveCount(4);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-select='true']")).toHaveCount(0);
      await expect.poll(() => page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__polygon-point-field").evaluateAll((rows) => rows.map((row) => row.querySelectorAll("input[type='checkbox']").length))).toEqual([1, 1, 1, 1]);
      const polygonPointRowLayoutState = await page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__polygon-point-field").first().evaluate((row) => {
        const header = row.parentElement.querySelector(".object-vector-studio-v2__polygon-point-header");
        const headerCells = Array.from(header.children, (cell) => cell.textContent.trim());
        const children = Array.from(row.children).filter((child) => child.getClientRects().length > 0);
        const rects = children.map((child) => child.getBoundingClientRect());
        const rowHeight = Math.max(...rects.map((rect) => rect.bottom)) - Math.min(...rects.map((rect) => rect.top));
        const maxChildHeight = Math.max(...rects.map((rect) => rect.height));
        const xInput = row.querySelector("[data-polygon-point-axis='x']");
        const priorXValue = xInput.value;
        xInput.value = "-12.345";
        const xInputFitsThreeDecimals = xInput.scrollWidth <= xInput.clientWidth + 1;
        xInput.value = priorXValue;
        return {
          addAfterRound: row.children[4]?.matches("[data-polygon-point-add='true']") === true,
          allOneLine: rowHeight <= maxChildHeight + 4,
          columnCount: getComputedStyle(row).gridTemplateColumns.split(" ").length,
          deleteAfterAdd: row.children[5]?.matches("[data-polygon-point-delete='true']") === true,
          headerCells,
          roundCheckboxColumn: row.children[3]?.querySelector("[data-polygon-point-round='true']") !== null,
          roundCheckboxes: row.querySelectorAll("[data-polygon-point-round='true']").length,
          xInputFitsThreeDecimals
        };
      });
      expect(polygonPointRowLayoutState).toEqual({
        addAfterRound: true,
        allOneLine: true,
        columnCount: 6,
        deleteAfterAdd: true,
        headerCells: ["", "", "", "Round", "", ""],
        roundCheckboxColumn: true,
        roundCheckboxes: 1,
        xInputFitsThreeDecimals: true
      });
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-round='true'][data-polygon-point-index='1']").check();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Updated point 2 rounding to round for shape row 0\./);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__polygon-point-field")).toHaveCount(4);
      const roundedPointRender = await page.locator("#objectVectorStudioV2RenderSurface").evaluate((surface) => {
        const shape = surface.querySelector("[data-shape-index='0']");
        const marker = surface.querySelector("[data-point-style-caps='polygon'] [data-point-style-cap='point-1']");
        return {
          d: shape.getAttribute("d"),
          pointRounding: window.__objectVectorStudioV2App.selectedShape().style.pointRounding,
          markerStyle: marker?.dataset.pointStyle || "",
          markerTag: marker?.tagName.toLowerCase() || "",
          roundedPointRender: shape.dataset.roundedPointRender,
          strokeLinejoin: shape.getAttribute("stroke-linejoin"),
          tag: shape.tagName.toLowerCase()
        };
      });
      expect(roundedPointRender).toEqual({
        d: expect.stringContaining("Q"),
        markerStyle: "round",
        markerTag: "circle",
        pointRounding: [false, true, false, false],
        roundedPointRender: "path",
        strokeLinejoin: "miter",
        tag: "path"
      });
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-round='true'][data-polygon-point-index='2']").check();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Updated point 3 rounding to round for shape row 0\./);
      const twoInteriorPointsRounded = await page.locator("#objectVectorStudioV2RenderSurface").evaluate((surface) => {
        const shape = surface.querySelector("[data-shape-index='0']");
        const markers = Array.from(surface.querySelectorAll("[data-point-style-caps='polygon'] [data-point-style-cap]")).map((marker) => marker.dataset.pointStyleCap);
        return {
          d: shape.getAttribute("d"),
          markers,
          pointRounding: window.__objectVectorStudioV2App.selectedShape().style.pointRounding,
          roundedPointRender: shape.dataset.roundedPointRender,
          strokeLinejoin: shape.getAttribute("stroke-linejoin"),
          tag: shape.tagName.toLowerCase()
        };
      });
      expect(twoInteriorPointsRounded).toEqual({
        d: expect.stringMatching(/Q .* Q /),
        markers: ["point-1", "point-2"],
        pointRounding: [false, true, true, false],
        roundedPointRender: "path",
        strokeLinejoin: "miter",
        tag: "path"
      });
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-round='true'][data-polygon-point-index='1']").uncheck();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Updated point 2 rounding to square for shape row 0\./);
      const independentInteriorPoint = await page.locator("#objectVectorStudioV2RenderSurface").evaluate((surface) => {
        const shape = surface.querySelector("[data-shape-index='0']");
        const markers = Array.from(surface.querySelectorAll("[data-point-style-caps='polygon'] [data-point-style-cap]")).map((marker) => marker.dataset.pointStyleCap);
        return {
          d: shape.getAttribute("d"),
          markers,
          pointRounding: window.__objectVectorStudioV2App.selectedShape().style.pointRounding,
          roundedPointRender: shape.dataset.roundedPointRender,
          strokeLinejoin: shape.getAttribute("stroke-linejoin"),
          tag: shape.tagName.toLowerCase()
        };
      });
      expect(independentInteriorPoint).toEqual({
        d: expect.stringContaining("Q"),
        markers: ["point-2"],
        pointRounding: [false, false, true, false],
        roundedPointRender: "path",
        strokeLinejoin: "miter",
        tag: "path"
      });
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-round='true'][data-polygon-point-index='1']").check();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Updated point 2 rounding to round for shape row 0\./);
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-round='true'][data-polygon-point-index='2']").uncheck();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Updated point 3 rounding to square for shape row 0\./);
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-add='true'][data-polygon-point-index='1']").click();
      await expect.poll(() => page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__polygon-point-field").evaluateAll((rows) => rows.map((row) => ({
        label: row.querySelector(".object-vector-studio-v2__polygon-point-label").textContent.trim(),
        rounded: row.querySelector("[data-polygon-point-round='true']").checked,
        x: row.querySelector("[data-polygon-point-axis='x']").value,
        y: row.querySelector("[data-polygon-point-axis='y']").value,
        selected: row.dataset.polygonPointActionSelected === "true"
      })))).toEqual([
        { label: "Point 1", rounded: false, x: "0.000", y: "-18.000", selected: false },
        { label: "Point 2", rounded: true, x: "14.000", y: "16.000", selected: false },
        { label: "Point 3", rounded: true, x: "14.000", y: "16.000", selected: false },
        { label: "Point 4", rounded: false, x: "0.000", y: "8.000", selected: false },
        { label: "Point 5", rounded: false, x: "-14.000", y: "16.000", selected: false }
      ]);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Added copied point after point 2 for shape row 0\./);
      await expect.poll(() => page.evaluate(() => window.__objectVectorStudioV2App.selectedShape().geometry.points.length)).toBe(5);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-add='true']")).toHaveCount(5);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-delete='true']")).toHaveCount(5);
      await expect.poll(() => page.evaluate(() => window.__objectVectorStudioV2App.schemaService.validatePayload(window.__objectVectorStudioV2App.currentPayload).ok)).toBe(true);
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-delete='true'][data-polygon-point-index='2']").click();
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__polygon-point-field")).toHaveCount(4);
      await expect.poll(() => page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__polygon-point-field").evaluateAll((rows) => rows.map((row) => ({
        label: row.querySelector(".object-vector-studio-v2__polygon-point-label").textContent.trim(),
        rounded: row.querySelector("[data-polygon-point-round='true']").checked,
        x: row.querySelector("[data-polygon-point-axis='x']").value,
        y: row.querySelector("[data-polygon-point-axis='y']").value,
        selected: row.dataset.polygonPointActionSelected === "true"
      })))).toEqual([
        { label: "Point 1", rounded: false, x: "0.000", y: "-18.000", selected: false },
        { label: "Point 2", rounded: true, x: "14.000", y: "16.000", selected: false },
        { label: "Point 3", rounded: false, x: "0.000", y: "8.000", selected: false },
        { label: "Point 4", rounded: false, x: "-14.000", y: "16.000", selected: false }
      ]);
      await expect.poll(() => page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__polygon-point-field").evaluateAll((rows) => rows.every((row) => row.dataset.polygonPointActionSelected !== "true"))).toBe(true);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted point 3 from shape row 0\./);
      await expect.poll(() => page.evaluate(() => window.__objectVectorStudioV2App.selectedShape().geometry.points.length)).toBe(4);
      await expect.poll(() => page.evaluate(() => window.__objectVectorStudioV2App.selectedShape().style.pointRounding)).toEqual([false, true, false, false]);
      await expect.poll(() => page.evaluate(() => window.__objectVectorStudioV2App.schemaService.validatePayload(window.__objectVectorStudioV2App.currentPayload).ok)).toBe(true);
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-index='1'][data-polygon-point-axis='y']").fill("17");
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-index='1'][data-polygon-point-axis='y']").dispatchEvent("change");
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']")).toHaveAttribute("points", "0,-180 140,170 0,80 -140,160");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Auto-applied geometry edits to shape row 0\./);
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-index='1'][data-polygon-point-axis='y']").fill("bad");
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-index='1'][data-polygon-point-axis='y']").dispatchEvent("change");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-index='1'][data-polygon-point-axis='y']")).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-index='1'][data-polygon-point-axis='y']")).toHaveValue("bad");
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']")).toHaveAttribute("points", "0,-180 140,170 0,80 -140,160");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Invalid geometry rejected for shape row 0: Point 2 Y must be a finite number\./);
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-index='1'][data-polygon-point-axis='y']").fill("16");
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-index='1'][data-polygon-point-axis='y']").dispatchEvent("change");
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']")).toHaveAttribute("points", "0,-180 140,160 0,80 -140,160");
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-1600 -1100 3200 2200");
      await page.evaluate(() => {
        window.__objectVectorStudioV2App.zoomViewport(2.5);
      });
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toContainText("Zoom 250%");
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-640 -440 1280 880");

      const readPreviewScale = async () => page.locator("#objectVectorStudioV2RenderSurface").evaluate((surface) => {
        const workArea = document.querySelector(".object-vector-studio-v2__work-area");
        const workAreaStyle = getComputedStyle(workArea);
        const availableWidth = workArea.clientWidth - Number.parseFloat(workAreaStyle.paddingLeft) - Number.parseFloat(workAreaStyle.paddingRight);
        const surfaceRect = surface.getBoundingClientRect();
        const viewBox = surface.getAttribute("viewBox").split(/\s+/).map(Number);
        const horizontalLines = Array.from(surface.querySelectorAll("[data-grid-rendered='true'] line"))
          .filter((line) => line.getAttribute("y1") === line.getAttribute("y2"))
          .map((line) => Number(line.getAttribute("y1")));
        const verticalLines = Array.from(surface.querySelectorAll("[data-grid-rendered='true'] line"))
          .filter((line) => line.getAttribute("x1") === line.getAttribute("x2"))
          .map((line) => Number(line.getAttribute("x1")));
        const screenPoint = (x, y) => {
          const point = surface.createSVGPoint();
          point.x = x;
          point.y = y;
          const transformed = point.matrixTransform(surface.getScreenCTM());
          return { x: transformed.x, y: transformed.y };
        };
        const sourceShipPoints = [
          { x: 0, y: -18 },
          { x: 14, y: 16 },
          { x: 0, y: 8 },
          { x: -14, y: 16 }
        ];
        const shipPoints = sourceShipPoints.map((point) => ({ x: point.x * 10, y: point.y * 10 }));
        const drawnPoints = surface.querySelector("[data-shape-index='0']").getAttribute("points")
          .split(/\s+/)
          .map((entry) => {
            const [x, y] = entry.split(",").map(Number);
            return { x, y };
          });
        const pointScreens = shipPoints.map((point) => screenPoint(point.x, point.y));
        const lineScreens = {
          bottom: screenPoint(0, 160).y,
          origin: screenPoint(0, 0).y,
          top: screenPoint(0, -180).y
        };
        return {
          aspectRatioStable: Math.abs((surfaceRect.width / surfaceRect.height) - (viewBox[2] / viewBox[3])) < 0.02,
          canvasFillsAvailableWidth: Math.abs(surfaceRect.width - availableWidth) <= 2,
          drawnPoints,
          gridLinesAboveOrigin: horizontalLines.filter((y) => y < 0 && y >= -180).length,
          gridLinesBelowOrigin: horizontalLines.filter((y) => y > 0 && y <= 160).length,
          gridStepRestored: Math.min(...verticalLines.filter((x) => x > 0)) === 10 && Math.min(...horizontalLines.filter((y) => y > 0)) === 10,
          originCentered: Math.abs(lineScreens.origin - (surfaceRect.top + surfaceRect.height / 2)) <= 1,
          pointsOnVisibleGridLines: shipPoints.every((point) => horizontalLines.includes(point.y) && verticalLines.includes(point.x)),
          pointScreensMatchGrid: Math.abs(pointScreens[0].y - lineScreens.top) <= 0.01
            && Math.abs(pointScreens[1].y - lineScreens.bottom) <= 0.01
            && Math.abs(pointScreens[3].y - lineScreens.bottom) <= 0.01,
          unitGridSpacingRemoved: !horizontalLines.includes(-18) && !horizontalLines.includes(-17) && !horizontalLines.includes(15) && !horizontalLines.includes(16),
          viewBox: surface.getAttribute("viewBox")
        };
      });

      const initialPreviewScale = await readPreviewScale();
      expect(initialPreviewScale).toEqual({
        aspectRatioStable: true,
        canvasFillsAvailableWidth: true,
        drawnPoints: [
          { x: 0, y: -180 },
          { x: 140, y: 160 },
          { x: 0, y: 80 },
          { x: -140, y: 160 }
        ],
        gridLinesAboveOrigin: 18,
        gridLinesBelowOrigin: 16,
        gridStepRestored: true,
        originCentered: true,
        pointsOnVisibleGridLines: true,
        pointScreensMatchGrid: true,
        unitGridSpacingRemoved: true,
        viewBox: "-640 -440 1280 880"
      });

      const beforePanShapeState = await page.evaluate(() => {
        const shape = window.__objectVectorStudioV2App.selectedShape();
        return {
          geometry: JSON.stringify(shape.geometry),
          transform: JSON.stringify(shape.transform || null)
        };
      });
      await page.locator("#objectVectorStudioV2PanRightButton").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-620 -440 1280 880");
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toHaveText("Origin: 2, 0 | Canvas origin -2,0 from center | Zoom 250%");
      await page.locator("#objectVectorStudioV2PanLeftButton").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-640 -440 1280 880");
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toHaveText("Origin: 0, 0 | Canvas origin 0,0 centered | Zoom 250%");
      await page.locator("#objectVectorStudioV2PanUpButton").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-640 -460 1280 880");
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toHaveText("Origin: 0, -2 | Canvas origin 0,2 from center | Zoom 250%");
      await page.locator("#objectVectorStudioV2PanDownButton").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-640 -440 1280 880");
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toHaveText("Origin: 0, 0 | Canvas origin 0,0 centered | Zoom 250%");
      const afterPanShapeState = await page.evaluate(() => {
        const shape = window.__objectVectorStudioV2App.selectedShape();
        return {
          geometry: JSON.stringify(shape.geometry),
          transform: JSON.stringify(shape.transform || null)
        };
      });
      expect(afterPanShapeState).toEqual(beforePanShapeState);
      const examplePointerScreen = await page.locator("#objectVectorStudioV2RenderSurface").evaluate((surface) => {
        const point = surface.createSVGPoint();
        point.x = -140;
        point.y = -160;
        const transformed = point.matrixTransform(surface.getScreenCTM());
        return { x: transformed.x, y: transformed.y };
      });
      await page.locator("#objectVectorStudioV2RenderSurface").dispatchEvent("mousemove", {
        bubbles: true,
        clientX: examplePointerScreen.x,
        clientY: examplePointerScreen.y
      });
      await expect(page.locator("#objectVectorStudioV2CoordinateDisplay")).toHaveText("Pointer -14, -16 | Canvas origin 0,0 centered | Zoom 250%");
      await page.setViewportSize({ width: 1040, height: 720 });
      const resizedPreviewScale = await readPreviewScale();
      expect(resizedPreviewScale.aspectRatioStable).toBe(true);
      expect(resizedPreviewScale.canvasFillsAvailableWidth).toBe(true);
      expect(resizedPreviewScale.gridLinesAboveOrigin).toBe(18);
      expect(resizedPreviewScale.gridLinesBelowOrigin).toBe(16);
      expect(resizedPreviewScale.gridStepRestored).toBe(true);
      expect(resizedPreviewScale.pointsOnVisibleGridLines).toBe(true);
      await page.locator("#objectVectorStudioV2ResetViewButton").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("viewBox", "-1600 -1100 3200 2200");
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-delete='true'][data-polygon-point-index='0']").click();
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__polygon-point-field")).toHaveCount(4);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-delete='true'][data-polygon-point-index='0']")).toHaveAttribute("aria-invalid", "true");
      await expect.poll(() => page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__polygon-point-field").evaluateAll((rows) => rows.every((row) => row.dataset.polygonPointActionSelected !== "true"))).toBe(true);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Delete point rejected for shape row 0: polygon must keep at least 4 points\./);

      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("compacts Object Vector Studio V2 geometry layouts and selected palette state", async ({ page }) => {
    const server = await startRepoServer();
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

    const shape = (_id, tool, order, geometry, style = { fill: "#020617", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 2 }) => ({
      geometry,
      locked: false,
      order,
      style,
      transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
      tool,
      visible: true
    });
    const geometryLayout = async () => page.locator("#objectVectorStudioV2ShapeGeometryDetails").evaluate((details) => {
      const panel = details.querySelector(".object-vector-studio-v2__edit-panel--geometry");
      const grid = panel?.querySelector(".object-vector-studio-v2__edit-grid");
      const shapePanel = details.querySelector(".object-vector-studio-v2__edit-panel--geometry + .object-vector-studio-v2__shape-panel");
      const panelStyle = panel ? getComputedStyle(panel) : null;
      const gridStyle = grid ? getComputedStyle(grid) : null;
      const shapePanelStyle = shapePanel ? getComputedStyle(shapePanel) : null;
      const fields = Array.from(panel?.querySelectorAll(".object-vector-studio-v2__edit-field") || []).map((field) => {
        const input = field.querySelector("input");
        const label = field.querySelector("span");
        const inputRect = input.getBoundingClientRect();
        const labelRect = label.getBoundingClientRect();
        return {
          inline: Math.abs((labelRect.top + labelRect.height / 2) - (inputRect.top + inputRect.height / 2)) < 4 && labelRect.right <= inputRect.left,
          key: input.dataset.shapeGeometryField,
          paddingTop: Number.parseFloat(getComputedStyle(input).paddingTop),
          top: Math.round(inputRect.top),
          wide: field.classList.contains("object-vector-studio-v2__edit-field--wide")
        };
      });
      return {
        fieldOrder: fields.map((field) => field.key),
        fillColorRemoved: !details.textContent.includes("Fill Color"),
        heading: panel?.querySelector("h4")?.textContent.trim(),
        inlineFields: fields.every((field) => field.inline),
        inputPaddingTopMax: Math.max(...fields.map((field) => field.paddingTop)),
        panelGap: Number.parseFloat(panelStyle?.gap || "0"),
        rowGap: Number.parseFloat(gridStyle?.rowGap || "0"),
        shapePanelPaddingTop: Number.parseFloat(shapePanelStyle?.paddingTop || "0"),
        tops: Object.fromEntries(fields.map((field) => [field.key, field.top])),
        wideFields: fields.filter((field) => field.wide).map((field) => field.key)
      };
    });
    const expectGeometryLayout = async ({ heading, order, pairs, shapeIndex, wideFields = [] }) => {
      if (Number.isInteger(shapeIndex)) {
        await page.locator(`[data-object-tile-shape-index="${shapeIndex}"]`).click();
      }
      const layout = await geometryLayout();
      expect(layout.heading).toBe(heading);
      expect(layout.fieldOrder).toEqual(order);
      expect(layout.fillColorRemoved).toBe(true);
      expect(layout.inlineFields).toBe(true);
      expect(layout.inputPaddingTopMax).toBeLessThanOrEqual(4);
      expect(layout.panelGap).toBeLessThanOrEqual(5);
      expect(layout.rowGap).toBeLessThanOrEqual(4);
      expect(layout.shapePanelPaddingTop).toBeLessThanOrEqual(6);
      expect(layout.wideFields).toEqual(wideFields);
      pairs.forEach(([left, right]) => {
        expect(Math.abs(layout.tops[left] - layout.tops[right])).toBeLessThanOrEqual(3);
      });
    };
    const setRightAccordionOpen = async (contentId, open) => {
      const header = page.locator(`.tool-starter__panel--right [aria-controls="${contentId}"]`).first();
      const expanded = await header.getAttribute("aria-expanded");
      if ((expanded === "true") !== open) {
        await header.click();
      }
      await expect(header).toHaveAttribute("aria-expanded", String(open));
    };

    await workspaceV2CoverageReporter.start(page);
    try {
      await page.setViewportSize({ width: 1366, height: 1000 });
      await page.goto(`${server.baseUrl}/tools/object-vector-studio-v2/index.html`, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        sessionStorage.setItem("object-vector-studio-v2.runtimePalette", JSON.stringify({
          id: "geometry-layout-palette",
          swatches: [
            { id: "space-black", name: "Space Black", value: "#020617" },
            { id: "cyan", name: "Cyan", value: "#6fd3ff" }
          ]
        }));
      });
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles({
        buffer: Buffer.from(JSON.stringify({
          name: "Geometry Layout Object Set",
          objects: [
            {
              id: "object.layout.geometry",
              name: "Geometry Layout",
              shapes: [
                shape("rectangle-1", "rectangle", 1, { height: 18, width: 24, x: -12, y: -9 }),
                shape("circle-2", "circle", 2, { cx: 18, cy: 12, r: 8 }),
                shape("ellipse-3", "ellipse", 3, { cx: -18, cy: 14, rx: 16, ry: 9 }),
                shape("line-4", "line", 4, { point1: { x: -22, y: 24 }, point2: { x: 22, y: 8 } }, { fill: "none", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 2 }),
                shape("arc-5", "arc", 5, { cx: 0, cy: 26, endAngle: 150, r: 16, startAngle: -120 }, { fill: "none", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 2 }),
                shape("text-6", "text", 6, { fontSize: 12, text: "Label", x: -20, y: 34 })
              ],
              tags: []
            }
          ],
          toolId: "object-vector-studio-v2",
          version: 1
        }, null, 2)),
        mimeType: "application/json",
        name: "object-vector-geometry-layout.json"
      });

      await expectGeometryLayout({
        heading: "Rectangle Geometry",
        order: ["x", "y", "width", "height"],
        pairs: [["x", "y"], ["width", "height"]]
      });
      const selectedPaletteState = await page.locator("[data-palette-color='#020617']").evaluate((swatch) => {
        const style = getComputedStyle(swatch);
        const before = getComputedStyle(swatch, "::before");
        return {
          beforeDisplay: before.display,
          boxShadow: style.boxShadow,
          isSelected: swatch.classList.contains("is-selected"),
          outlineWidth: Number.parseFloat(style.outlineWidth)
        };
      });
      expect(selectedPaletteState.isSelected).toBe(true);
      expect(selectedPaletteState.beforeDisplay).toBe("block");
      expect(selectedPaletteState.boxShadow).not.toBe("none");
      expect(selectedPaletteState.outlineWidth).toBeGreaterThanOrEqual(3);

      await expectGeometryLayout({
        heading: "Circle Geometry",
        order: ["cx", "cy", "r"],
        pairs: [["cx", "cy"]],
        shapeIndex: 1,
        wideFields: ["r"]
      });
      await expectGeometryLayout({
        heading: "Ellipse Geometry",
        order: ["cx", "cy", "rx", "ry"],
        pairs: [["cx", "cy"], ["rx", "ry"]],
        shapeIndex: 2
      });
      await expectGeometryLayout({
        heading: "Line Geometry",
        order: ["point1.x", "point1.y", "point2.x", "point2.y"],
        pairs: [["point1.x", "point1.y"], ["point2.x", "point2.y"]],
        shapeIndex: 3
      });
      await expectGeometryLayout({
        heading: "Arc Geometry",
        order: ["cx", "cy", "r", "startAngle", "endAngle"],
        pairs: [["cx", "cy"], ["startAngle", "endAngle"]],
        shapeIndex: 4,
        wideFields: ["r"]
      });
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__point-rounding-list [data-polygon-point-round='true']")).toHaveCount(2);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__point-rounding-list [data-polygon-point-add='true']")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__point-rounding-list [data-polygon-point-delete='true']")).toHaveCount(0);
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__point-rounding-list [data-polygon-point-round='true'][data-polygon-point-index='0']").check();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Updated point 1 rounding to round for shape row 4\./);
      const arcStartRoundedState = await page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='4']").evaluate((shape) => {
        const markers = Array.from(document.querySelectorAll("#objectVectorStudioV2RenderSurface [data-point-style-caps='arc'] [data-point-style-cap]")).map((marker) => ({
          id: marker.dataset.pointStyleCap,
          style: marker.dataset.pointStyle
        }));
        return {
          end: shape.dataset.endPointStyle,
          markers,
          pointRounding: window.__objectVectorStudioV2App.selectedShape().style.pointRounding,
          start: shape.dataset.startPointStyle,
          strokeLinecap: shape.getAttribute("stroke-linecap")
        };
      });
      expect(arcStartRoundedState).toEqual({
        end: "square",
        markers: [
          { id: "start", style: "round" },
          { id: "end", style: "square" }
        ],
        pointRounding: [true, false],
        start: "round",
        strokeLinecap: "butt"
      });
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__point-rounding-list [data-polygon-point-round='true'][data-polygon-point-index='1']").check();
      await page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__point-rounding-list [data-polygon-point-round='true'][data-polygon-point-index='0']").uncheck();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Updated point 1 rounding to square for shape row 4\./);
      const arcEndRoundedState = await page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='4']").evaluate((shape) => ({
        end: shape.dataset.endPointStyle,
        pointRounding: window.__objectVectorStudioV2App.selectedShape().style.pointRounding,
        start: shape.dataset.startPointStyle,
        strokeLinecap: shape.getAttribute("stroke-linecap")
      }));
      expect(arcEndRoundedState).toEqual({
        end: "round",
        pointRounding: [false, true],
        start: "square",
        strokeLinecap: "butt"
      });
      await expectGeometryLayout({
        heading: "Text Geometry",
        order: ["x", "y", "fontSize", "text"],
        pairs: [["x", "y"]],
        shapeIndex: 5,
        wideFields: ["fontSize", "text"]
      });

      await drawDefaultObjectVectorShape(page, "triangle");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails h4")).toHaveText("Triangle Geometry");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails h4")).not.toHaveText("Polygon Geometry");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometrySummary")).toHaveText("");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryName")).toHaveText("");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails")).not.toContainText(/Shape\s*polygon-\d+ \(triangle\)/);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-side-action]")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-select='true']")).toHaveCount(0);
      await expect.poll(() => page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__polygon-point-field").evaluateAll((rows) => rows.map((row) => row.querySelectorAll("input[type='checkbox']").length))).toEqual([1, 1, 1]);
      await setRightAccordionOpen("objectVectorStudioV2PaletteContent", false);
      await setRightAccordionOpen("objectVectorStudioV2ShapeToolsContent", false);
      await setRightAccordionOpen("objectVectorStudioV2ShapesContent", false);
      await setRightAccordionOpen("objectVectorStudioV2ShapeTransformContent", false);
      const expandedShapeGeometryLayout = await page.locator("#objectVectorStudioV2ShapeGeometryDetails").evaluate((details) => {
        const content = document.querySelector("#objectVectorStudioV2ShapeGeometryContent");
        const accordion = document.querySelector(".object-vector-studio-v2__shape-geometry-accordion");
        const contentRect = content.getBoundingClientRect();
        const detailsRect = details.getBoundingClientRect();
        const contentStyle = getComputedStyle(content);
        const accordionStyle = getComputedStyle(accordion);
        return {
          accordionFlexGrow: Number.parseFloat(accordionStyle.flexGrow),
          accordionHasLayoutClass: accordion.classList.contains("object-vector-studio-v2__shape-geometry-accordion"),
          contentFlexGrow: Number.parseFloat(contentStyle.flexGrow),
          contentHeight: Math.round(contentRect.height),
          contentMaxHeight: contentStyle.maxHeight,
          detailsHeight: Math.round(detailsRect.height),
          paletteExpanded: document.querySelector('[aria-controls="objectVectorStudioV2PaletteContent"]').getAttribute("aria-expanded"),
          shapeToolOptionsExpanded: document.querySelector('[aria-controls="objectVectorStudioV2ShapeToolsContent"]').getAttribute("aria-expanded"),
          shapeToolsExpanded: document.querySelector('[aria-controls="objectVectorStudioV2ShapesContent"]').getAttribute("aria-expanded"),
          transformExpanded: document.querySelector('[aria-controls="objectVectorStudioV2ShapeTransformContent"]').getAttribute("aria-expanded")
        };
      });
      expect(expandedShapeGeometryLayout).toMatchObject({
        accordionHasLayoutClass: true,
        contentMaxHeight: "none",
        paletteExpanded: "false",
        shapeToolOptionsExpanded: "false",
        shapeToolsExpanded: "false",
        transformExpanded: "false"
      });
      expect(expandedShapeGeometryLayout.accordionFlexGrow).toBeGreaterThanOrEqual(1);
      expect(expandedShapeGeometryLayout.contentFlexGrow).toBeGreaterThanOrEqual(1);
      expect(expandedShapeGeometryLayout.contentHeight).toBeGreaterThan(260);
      expect(expandedShapeGeometryLayout.detailsHeight).toBeGreaterThan(240);

      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("edits Object Vector Studio V2 preview shapes with mouse actions and tile delete controls", async ({ page }) => {
    const server = await startRepoServer();
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

    const dragLocator = async (selector, deltaX, deltaY) => {
      const target = page.locator(selector);
      await target.scrollIntoViewIfNeeded();
      const box = await target.boundingBox();
      expect(box).not.toBeNull();
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + deltaX, y + deltaY, { steps: 4 });
      await page.mouse.up();
    };
    const shapeSnapshot = async (shapeIndex) => page.evaluate((index) => (
      JSON.parse(JSON.stringify(window.__objectVectorStudioV2App.selectedObject().shapes[index] || null))
    ), shapeIndex);

    await workspaceV2CoverageReporter.start(page);
    try {
      await page.setViewportSize({ width: 1366, height: 1000 });
      await page.goto(`${server.baseUrl}/tools/object-vector-studio-v2/index.html`, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        sessionStorage.setItem("object-vector-studio-v2.runtimePalette", JSON.stringify({
          id: "mouse-edit-palette",
          swatches: [
            { id: "white", value: "#ffffff" },
            { id: "cyan", value: "#6fd3ff" }
          ]
        }));
      });
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles({
        buffer: Buffer.from(JSON.stringify({
          name: "Mouse Edit Object Set",
          objects: [
            {
              id: "object.mouse.editor",
              name: "Mouse Editor",
              shapes: [
                {
                  geometry: { height: 30, width: 40, x: -40, y: -20 },
                  tool: "rectangle",
                  locked: false,
                  order: 1,
                  style: { fill: "#ffffff", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 1 },
                  transform: { shapeOrigin: { x: -20, y: -5 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                  visible: true
                },
                {
                  geometry: { point1: { x: -60, y: 50 }, point2: { x: -10, y: 30 } },
                  tool: "line",
                  locked: false,
                  order: 2,
                  style: { fill: "none", fillOpacity: 1, stroke: "#ffffff", strokeOpacity: 1, strokeWidth: 1 },
                  transform: { shapeOrigin: { x: -35, y: 40 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                  visible: true
                },
                {
                  geometry: {
                    points: [
                      { x: 10, y: 10 },
                      { x: 42, y: 12 },
                      { x: 36, y: 42 },
                      { x: 8, y: 36 }
                    ]
                  },
                  tool: "polygon",
                  locked: false,
                  order: 3,
                  style: { fill: "#ffffff", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 1 },
                  transform: { shapeOrigin: { x: 25, y: 25 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                  visible: true
                },
                {
                  geometry: { cx: 80, cy: 20, r: 12 },
                  tool: "circle",
                  locked: false,
                  order: 4,
                  style: { fill: "#ffffff", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 1 },
                  transform: { shapeOrigin: { x: 80, y: 20 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                  visible: true
                }
              ],
              tags: []
            }
          ],
          toolId: "object-vector-studio-v2",
          version: 1
        }, null, 2)),
        mimeType: "application/json",
        name: "object-vector-mouse-edit.json"
      });
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']")).toHaveClass(/is-selected/);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-geometry-point-kind='rectangle-corner']")).toHaveCount(4);

      const rectangleBeforeDrag = await shapeSnapshot(0);
      const undoStackBeforeDrag = await page.evaluate(() => window.__objectVectorStudioV2App.previewUndoStack.length);
      await dragLocator("#objectVectorStudioV2RenderSurface [data-shape-index='0']", 44, 24);
      const rectangleAfterDrag = await shapeSnapshot(0);
      expect(rectangleAfterDrag.transform.x).not.toBe(rectangleBeforeDrag.transform.x);
      expect(rectangleAfterDrag.transform.y).not.toBe(rectangleBeforeDrag.transform.y);
      await expect.poll(async () => page.evaluate(() => window.__objectVectorStudioV2App.previewUndoStack.length)).toBe(undoStackBeforeDrag + 1);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Dragged shape row 0 by/);
      await page.locator("#objectVectorStudioV2PreviewUndoButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Undo applied to Object Preview edits\./);
      await expect.poll(async () => shapeSnapshot(0)).toEqual(rectangleBeforeDrag);
      await page.locator("#objectVectorStudioV2PreviewRedoButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Redo applied to Object Preview edits\./);
      await expect.poll(async () => shapeSnapshot(0)).toEqual(rectangleAfterDrag);

      const rectangleBeforeNegativeDrag = await shapeSnapshot(0);
      await dragLocator("#objectVectorStudioV2RenderSurface [data-shape-index='0']", -36, -24);
      const rectangleAfterNegativeDrag = await shapeSnapshot(0);
      expect(rectangleAfterNegativeDrag.transform.x).toBeLessThan(rectangleBeforeNegativeDrag.transform.x);
      expect(rectangleAfterNegativeDrag.transform.y).toBeLessThan(rectangleBeforeNegativeDrag.transform.y);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Dragged shape row 0 by/);

      const rectangleBeforeResize = await shapeSnapshot(0);
      await dragLocator("#objectVectorStudioV2RenderSurface [data-geometry-point-handle='rectangle-se']", 28, 20);
      const rectangleAfterResize = await shapeSnapshot(0);
      expect(rectangleAfterResize.geometry.width).toBeGreaterThan(rectangleBeforeResize.geometry.width);
      expect(rectangleAfterResize.geometry.height).toBeGreaterThan(rectangleBeforeResize.geometry.height);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Resized shape row 0 with se handle\./);

      await page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='1']").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-line-endpoint='end']")).toHaveCount(1);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-geometry-point-handle='line-end']")).toHaveCount(1);
      const lineBeforeEndpoint = await shapeSnapshot(1);
      await dragLocator("#objectVectorStudioV2RenderSurface [data-line-endpoint='end']", 36, -18);
      const lineAfterEndpoint = await shapeSnapshot(1);
      expect(lineAfterEndpoint.geometry.point2.x).not.toBe(lineBeforeEndpoint.geometry.point2.x);
      expect(lineAfterEndpoint.geometry.point2.y).not.toBe(lineBeforeEndpoint.geometry.point2.y);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Moved line end for shape row 1\./);

      const scaledLineStart = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const line = app.selectedObject().shapes[1];
        line.geometry.point2 = { x: -10.4, y: 30.4 };
        line.transform = { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 2, scaleY: 2, x: 0, y: 0 };
        app.setSnapMode("grid", "Snap Grid");
        app.selectShape(1, "scaled snap drag validation");
        return app.transformedPoint(line.geometry.point2, line.transform);
      });
      await dragObjectVectorHandleToLogicalPoint(page, "#objectVectorStudioV2RenderSurface [data-line-endpoint='end']", scaledLineStart, { x: -15.2, y: 55.8 });
      const scaledLineSnapDrag = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const line = app.selectedObject().shapes[1];
        return {
          geometryPoint: line.geometry.point2,
          renderedPoint: app.transformedPoint(line.geometry.point2, line.transform)
        };
      });
      expect(scaledLineSnapDrag).toEqual({
        geometryPoint: { x: -7.5, y: 28 },
        renderedPoint: { x: -15, y: 56 }
      });

      await page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='2']").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-geometry-point-kind='polygon-point']")).toHaveCount(4);
      await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const polygon = app.selectedObject().shapes[2];
        polygon.geometry.points[1] = { x: 42.4, y: 12.4 };
        app.setSnapMode("grid", "Snap Grid");
        app.selectShape(2, "off-grid point snap validation");
      });
      await dragObjectVectorHandleToLogicalPoint(page, "#objectVectorStudioV2RenderSurface [data-geometry-point-handle='polygon-1']", { x: 42.4, y: 12.4 }, { x: 47.2, y: 9.7 });
      const polygonSnapDrag = await shapeSnapshot(2);
      expect(polygonSnapDrag.geometry.points[1]).toEqual({ x: 47, y: 10 });
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-index='1'][data-polygon-point-axis='x']")).toHaveValue("47.000");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-index='1'][data-polygon-point-axis='y']")).toHaveValue("10.000");
      const polygonBeforePointDrag = await shapeSnapshot(2);
      await dragLocator("#objectVectorStudioV2RenderSurface [data-geometry-point-handle='polygon-1']", 24, -16);
      const polygonAfterPointDrag = await shapeSnapshot(2);
      expect(polygonAfterPointDrag.geometry.points[1].x).not.toBe(polygonBeforePointDrag.geometry.points[1].x);
      expect(polygonAfterPointDrag.geometry.points[1].y).not.toBe(polygonBeforePointDrag.geometry.points[1].y);
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-index='1'][data-polygon-point-axis='x']")).toHaveValue(polygonAfterPointDrag.geometry.points[1].x.toFixed(3));
      await expect(page.locator("#statusLog")).toHaveValue(/OK Moved geometry point 2 for shape row 2\./);
      const polygonBeforeBoundsDrag = await shapeSnapshot(2);
      await dragLocator("#objectVectorStudioV2RenderSurface [data-resize-handle='se']", 18, 14);
      const polygonAfterBoundsDrag = await shapeSnapshot(2);
      expect(polygonAfterBoundsDrag.geometry.points[2].x).toBeGreaterThan(polygonBeforeBoundsDrag.geometry.points[2].x);
      expect(polygonAfterBoundsDrag.geometry.points[2].y).toBeGreaterThan(polygonBeforeBoundsDrag.geometry.points[2].y);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Resized shape row 2 with se handle\./);
      await page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='3']").click();
      const circleHandleSize = await page.locator("#objectVectorStudioV2RenderSurface [data-resize-handle='se']").evaluate((handle) => ({
        height: Number(handle.getAttribute("height")),
        width: Number(handle.getAttribute("width"))
      }));
      expect(circleHandleSize).toEqual({ height: 5, width: 5 });
      const circleBeforeResize = await shapeSnapshot(3);
      await dragLocator("#objectVectorStudioV2RenderSurface [data-resize-handle='se']", 28, 28);
      const circleAfterResize = await shapeSnapshot(3);
      expect(circleAfterResize.geometry.r).toBeGreaterThan(circleBeforeResize.geometry.r);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Resized shape row 3 with se handle\./);
      await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const object = app.selectedObject();
        object.states = [
          {
            frames: [
              {
                durationFrames: 1,
                id: "frame-1",
                order: 1,
                shapeOverrides: [
                  {
                    shapeIndex: 0,
                    transform: { ...object.shapes[0].transform },
                    visible: true
                  },
                  {
                    shapeIndex: 1,
                    transform: { ...object.shapes[1].transform },
                    visible: true
                  },
                  {
                    shapeIndex: 2,
                    transform: { ...object.shapes[2].transform },
                    visible: true
                  }
                ]
              }
            ],
            id: "active",
            name: "Active"
          }
        ];
        app.renderSelectedObject();
      });

      const shapeDeleteIconState = await page.locator("[data-shape-delete-index='2']").evaluate((button) => {
        const icon = button.querySelector("[data-ovs-icon]");
        return {
          objectId: button.dataset.shapeDeleteObjectId,
          title: button.title,
          iconKey: icon?.dataset.ovsIconKey,
          iconName: icon?.dataset.ovsIconName
        };
      });
      expect(shapeDeleteIconState).toEqual({
        objectId: "object.mouse.editor",
        title: "Delete this base shape from every state",
        iconKey: "delete",
        iconName: "nf-md-trash_can_outline"
      });
      await page.evaluate(() => window.__objectVectorStudioV2App.selectShape(0, "trash click selection guard"));
      await expect.poll(async () => page.evaluate(() => window.__objectVectorStudioV2App.selectedShapeIndex)).toBe(0);
      await page.locator("[data-shape-delete-index='2']").click();
      await expect.poll(async () => page.evaluate(() => window.__objectVectorStudioV2App.selectedShapeIndex)).toBe(0);
      await expect(page.locator("[data-object-tile-shape-index='2']")).toHaveCount(1);
      await expect(page.locator("[data-object-tile-shape-index='1']")).toHaveCount(1);
      await expect(page.locator("[data-object-tile-shape-index='0']")).toHaveCount(1);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='2']")).toHaveCount(1);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='1']")).toHaveCount(1);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']")).toHaveCount(1);
      const shapeReferenceCleanup = await page.evaluate(() => {
        const payload = window.__objectVectorStudioV2App.currentPayload;
        const object = payload.objects.find((candidate) => candidate.id === "object.mouse.editor");
        return {
          schemaOk: window.__objectVectorStudioV2App.schemaService.validatePayload(payload).ok,
          shapeOverrideIndexes: object.states[0].frames[0].shapeOverrides.map((override) => override.shapeIndex),
          tools: object.shapes.map((shape) => shape.tool)
        };
      });
      expect(shapeReferenceCleanup).toEqual({ schemaOk: true, shapeOverrideIndexes: [0, 1], tools: ["rectangle", "line", "circle"] });
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted shape row 2 from object tile shape delete\./);

      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("aligns Object Vector Studio V2 selection bounds to transformed preview geometry", async ({ page }) => {
    const server = await startRepoServer();
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

    await workspaceV2CoverageReporter.start(page);
    try {
      await page.setViewportSize({ width: 1366, height: 1000 });
      await page.goto(`${server.baseUrl}/tools/object-vector-studio-v2/index.html`, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        sessionStorage.setItem("object-vector-studio-v2.runtimePalette", JSON.stringify({
          id: "transform-bounds-palette",
          swatches: [
            { id: "white", value: "#ffffff" },
            { id: "blue", value: "#60a5fa" }
          ]
        }));
      });
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles({
        buffer: Buffer.from(JSON.stringify({
          name: "Transform Bounds Object Set",
          objects: [
            {
              id: "object.bounds.transformed-rectangle",
              name: "Transformed Rectangle",
              objectOrigin: { x: -10, y: 5 },
              shapes: [
                {
                  geometry: { height: 40, width: 80, x: -40, y: -20 },
                  locked: false,
                  order: 1,
                  style: { fill: "#ffffff", fillOpacity: 1, stroke: "#60a5fa", strokeOpacity: 1, strokeWidth: 1 },
                  tool: "rectangle",
                  transform: { shapeOrigin: { x: -10, y: 5 }, rotation: 30, scaleX: 0.5, scaleY: 0.5, x: 60, y: 10 },
                  visible: true
                }
              ],
              tags: []
            }
          ],
          toolId: "object-vector-studio-v2",
          version: 1
        }, null, 2)),
        mimeType: "application/json",
        name: "object-vector-transform-bounds.json"
      });
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']")).toHaveClass(/is-selected/);

      const metrics = await page.locator("#objectVectorStudioV2RenderSurface").evaluate((surface) => {
        const drawingScale = 10;
        const app = window.__objectVectorStudioV2App;
        const shape = app.selectedShape();
        const transform = shape.transform;
        const geometry = shape.geometry;
        const origin = app.objectTransformOrigin(app.selectedObject());
        const transformPoint = (point) => {
          const radians = transform.rotation * Math.PI / 180;
          const relativeX = (point.x - origin.x) * transform.scaleX;
          const relativeY = (point.y - origin.y) * transform.scaleY;
          const rotatedX = relativeX * Math.cos(radians) - relativeY * Math.sin(radians);
          const rotatedY = relativeX * Math.sin(radians) + relativeY * Math.cos(radians);
          return {
            x: (transform.x + origin.x + rotatedX) * drawingScale,
            y: (transform.y + origin.y + rotatedY) * drawingScale
          };
        };
        const corners = [
          { x: geometry.x, y: geometry.y },
          { x: geometry.x + geometry.width, y: geometry.y },
          { x: geometry.x + geometry.width, y: geometry.y + geometry.height },
          { x: geometry.x, y: geometry.y + geometry.height }
        ].map(transformPoint);
        const xValues = corners.map((point) => point.x);
        const yValues = corners.map((point) => point.y);
        const expected = {
          center: transformPoint({ x: geometry.x + geometry.width / 2, y: geometry.y + geometry.height / 2 }),
          height: Math.max(...yValues) - Math.min(...yValues),
          width: Math.max(...xValues) - Math.min(...xValues),
          x: Math.min(...xValues),
          y: Math.min(...yValues)
        };
        const selectionBox = surface.querySelector("[data-selection-bounds='0']");
        const handles = Object.fromEntries(Array.from(surface.querySelectorAll("[data-resize-handle]")).map((handle) => [
          handle.dataset.resizeHandle,
          {
            cx: Number(handle.getAttribute("x")) + Number(handle.getAttribute("width")) / 2,
            cy: Number(handle.getAttribute("y")) + Number(handle.getAttribute("height")) / 2
          }
        ]));
        const raw = {
          height: geometry.height * drawingScale,
          width: geometry.width * drawingScale,
          x: geometry.x * drawingScale,
          y: geometry.y * drawingScale
        };
        const svgPoint = surface.createSVGPoint();
        svgPoint.x = expected.center.x;
        svgPoint.y = expected.center.y;
        const screenCenter = svgPoint.matrixTransform(surface.getScreenCTM());
        const topHit = document.elementFromPoint(screenCenter.x, screenCenter.y);
        if (topHit?.classList?.contains("object-vector-studio-v2__selection-drag-area")) {
          topHit.style.pointerEvents = "none";
        }
        const hitShape = document.elementFromPoint(screenCenter.x, screenCenter.y)?.closest("[data-shape-index]");
        if (topHit?.classList?.contains("object-vector-studio-v2__selection-drag-area")) {
          topHit.style.pointerEvents = "";
        }

        return {
          expected,
          handles,
          hitShapeIndex: hitShape?.dataset.shapeIndex || null,
          raw,
          rawContainsTransformedCenter: expected.center.x >= raw.x
            && expected.center.x <= raw.x + raw.width
            && expected.center.y >= raw.y
            && expected.center.y <= raw.y + raw.height,
          screenCenter: { x: screenCenter.x, y: screenCenter.y },
          selection: {
            height: Number(selectionBox.getAttribute("height")),
            width: Number(selectionBox.getAttribute("width")),
            x: Number(selectionBox.getAttribute("x")),
            y: Number(selectionBox.getAttribute("y"))
          }
        };
      });

      expect(metrics.rawContainsTransformedCenter).toBe(false);
      expect(metrics.hitShapeIndex).toBe("0");
      expect(metrics.selection.x).toBeCloseTo(metrics.expected.x - 4, 3);
      expect(metrics.selection.y).toBeCloseTo(metrics.expected.y - 4, 3);
      expect(metrics.selection.width).toBeCloseTo(metrics.expected.width + 8, 3);
      expect(metrics.selection.height).toBeCloseTo(metrics.expected.height + 8, 3);
      expect(metrics.selection.width).toBeLessThan(metrics.raw.width);

      const expectedHandleCenters = {
        ne: { x: metrics.expected.x + metrics.expected.width + 4, y: metrics.expected.y - 4 },
        nw: { x: metrics.expected.x - 4, y: metrics.expected.y - 4 },
        se: { x: metrics.expected.x + metrics.expected.width + 4, y: metrics.expected.y + metrics.expected.height + 4 },
        sw: { x: metrics.expected.x - 4, y: metrics.expected.y + metrics.expected.height + 4 }
      };
      for (const [handle, expectedCenter] of Object.entries(expectedHandleCenters)) {
        expect(metrics.handles[handle].cx).toBeCloseTo(expectedCenter.x, 3);
        expect(metrics.handles[handle].cy).toBeCloseTo(expectedCenter.y, 3);
      }

      const transformBeforeDrag = await page.evaluate(() => ({ ...window.__objectVectorStudioV2App.selectedShape().transform }));
      await page.mouse.move(metrics.screenCenter.x, metrics.screenCenter.y);
      await page.mouse.down();
      await page.mouse.move(metrics.screenCenter.x + 40, metrics.screenCenter.y + 24, { steps: 4 });
      await page.mouse.up();
      const transformAfterDrag = await page.evaluate(() => ({ ...window.__objectVectorStudioV2App.selectedShape().transform }));
      expect(transformAfterDrag.x).not.toBe(transformBeforeDrag.x);
      expect(transformAfterDrag.y).not.toBe(transformBeforeDrag.y);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Dragged shape row 0 by/);

      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("applies Object Vector Studio V2 Resize Geometry across supported shape tools", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];
    const consoleErrors = [];
    const scaledTransform = { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1.5, scaleY: 1.5, x: 0, y: 0 };
    const style = { fill: "#ffffff", fillOpacity: 1, stroke: "#60a5fa", strokeOpacity: 1, strokeWidth: 1 };

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await workspaceV2CoverageReporter.start(page);
    try {
      await page.setViewportSize({ width: 1366, height: 1000 });
      await page.goto(`${server.baseUrl}/tools/object-vector-studio-v2/index.html`, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        sessionStorage.setItem("object-vector-studio-v2.runtimePalette", JSON.stringify({
          id: "resize-geometry-palette",
          swatches: [
            { id: "white", value: "#ffffff" },
            { id: "blue", value: "#60a5fa" }
          ]
        }));
      });
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles({
        buffer: Buffer.from(JSON.stringify({
          name: "Resize Geometry Object Set",
          objects: [
            {
              id: "object.resize.geometry-probe",
              name: "Resize Geometry Probe",
              shapes: [
                { geometry: { points: [{ x: 0, y: -10 }, { x: 10, y: 0 }, { x: 0, y: 10 }, { x: -10, y: 0 }] }, locked: false, order: 1, style, tool: "polygon", transform: scaledTransform, visible: true },
                { geometry: { points: [{ x: 0, y: -8 }, { x: 8, y: 8 }, { x: -8, y: 8 }] }, locked: false, order: 2, style, tool: "triangle", transform: scaledTransform, visible: true },
                { geometry: { point1: { x: -10, y: -5 }, point2: { x: 10, y: 5 } }, locked: false, order: 3, style: { ...style, fill: "none" }, tool: "line", transform: scaledTransform, visible: true },
                { geometry: { height: 10, width: 20, x: -10, y: -5 }, locked: false, order: 4, style, tool: "rectangle", transform: scaledTransform, visible: true },
                { geometry: { cx: 5, cy: -5, r: 10 }, locked: false, order: 5, style, tool: "circle", transform: scaledTransform, visible: true },
                { geometry: { cx: 4, cy: -6, rx: 8, ry: 12 }, locked: false, order: 6, style, tool: "ellipse", transform: scaledTransform, visible: true },
                { geometry: { cx: 2, cy: -4, r: 9, startAngle: -90, endAngle: 90 }, locked: false, order: 7, style: { ...style, fill: "none" }, tool: "arc", transform: scaledTransform, visible: true },
                { geometry: { fontSize: 12, text: "Hi", x: 6, y: -6 }, locked: false, order: 8, style, tool: "text", transform: scaledTransform, visible: true }
              ],
              tags: []
            }
          ],
          toolId: "object-vector-studio-v2",
          version: 1
        }, null, 2)),
        mimeType: "application/json",
        name: "object-vector-resize-geometry.json"
      });

      for (let shapeIndex = 0; shapeIndex < 8; shapeIndex += 1) {
        await page.locator(`[data-object-tile-shape-index='${shapeIndex}']`).click();
        await expect(page.locator("#objectVectorStudioV2ScaleInput")).toHaveValue("1.5");
        await page.locator("#objectVectorStudioV2ResizeShapeButton").click();
        await expect(page.locator("#statusLog")).toHaveValue(new RegExp(`OK Resize Geometry applied scale 1\\.5 to shape row ${shapeIndex}; transform scale reset to 1\\.`));
      }

      const resizeResult = await page.evaluate(() => {
        const payload = window.__objectVectorStudioV2App.currentPayload;
        const shapes = payload.objects[0].shapes;
        return {
          geometries: shapes.map((shape) => shape.geometry),
          schemaOk: window.__objectVectorStudioV2App.schemaService.validatePayload(payload).ok,
          scales: shapes.map((shape) => ({ scaleX: shape.transform.scaleX, scaleY: shape.transform.scaleY }))
        };
      });
      expect(resizeResult.schemaOk).toBe(true);
      expect(resizeResult.scales.every((scale) => scale.scaleX === 1 && scale.scaleY === 1)).toBe(true);
      expect(resizeResult.geometries).toEqual([
        { points: [{ x: 0, y: -15 }, { x: 15, y: 0 }, { x: 0, y: 15 }, { x: -15, y: 0 }] },
        { points: [{ x: 0, y: -12 }, { x: 12, y: 12 }, { x: -12, y: 12 }] },
        { point1: { x: -15, y: -7.5 }, point2: { x: 15, y: 7.5 } },
        { height: 15, width: 30, x: -15, y: -7.5 },
        { cx: 7.5, cy: -7.5, r: 15 },
        { cx: 6, cy: -9, rx: 12, ry: 18 },
        { cx: 3, cy: -6, r: 13.5, startAngle: -90, endAngle: 90 },
        { fontSize: 18, text: "Hi", x: 9, y: -9 }
      ]);

      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("expands Object Vector Studio V2 asset authoring controls", async ({ page }, testInfo) => {
    const server = await startRepoServer();
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await workspaceV2CoverageReporter.start(page);
    try {
      await page.goto(`${server.baseUrl}/tools/object-vector-studio-v2/index.html`, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        sessionStorage.setItem("object-vector-studio-v2.runtimePalette", JSON.stringify({
          id: "authoring-palette",
          swatches: [
            { id: "cyan", value: "#6fd3ff" },
            { id: "amber", value: "#fbbf24" }
          ]
        }));
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            async writeText(text) {
              sessionStorage.setItem("object-vector-studio-v2.authoring-copied-json", text);
            }
          }
        });
      });

      const payloadPath = testInfo.outputPath("object-vector-authoring.json");
      await writeFile(payloadPath, JSON.stringify({
        name: "Authoring Payload",
        objects: [],
        toolId: "object-vector-studio-v2",
        version: 1
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(payloadPath);

      await page.locator("#objectVectorStudioV2ObjectNameInput").fill("UFO Template");
      await page.locator("#objectVectorStudioV2ObjectTagInput").fill("enemy");
      await page.locator("#objectVectorStudioV2AddObjectButton").click();
      await expect(page.locator("#objectVectorStudioV2ObjectTagList [data-object-tag]")).toHaveText(["enemy"]);
      await page.locator("#objectVectorStudioV2ObjectTagInput").fill("enemy");
      await page.locator("#objectVectorStudioV2AddTagButton").click();
      await expect(page.locator("#objectVectorStudioV2ObjectTagList [data-object-tag]")).toHaveText(["enemy", "enemy-2"]);
      await expect(page.locator("#objectVectorStudioV2ObjectTagList")).not.toContainText("enemy x");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Added tag enemy-2 to UFO Template\./);
      await drawDefaultObjectVectorShape(page, "ellipse");
      await drawObjectVectorShape(page, "ellipse", [{ x: -60, y: -20 }, { x: 20, y: 40 }]);
      await expect(page.locator("#objectVectorStudioV2ObjectsCount")).toHaveText(/\(1 obj, states \d+, 2 shapes\)/);
      await expect(page.locator('[data-object-id="object.authoring.ufo-template"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator('[data-object-thumbnail="object.authoring.ufo-template"] .object-vector-studio-v2__object-thumbnail-shape')).toHaveCount(2);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-object-bounds='object.authoring.ufo-template']")).toHaveCount(1);
      await expect(page.locator('.object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index]')).toHaveCount(2);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Created ellipse shape on UFO Template from canvas click\./);
      const ellipseGeometryLayout = await page.locator("#objectVectorStudioV2ShapeGeometryDetails .object-vector-studio-v2__edit-grid--ellipse").evaluate((grid) => {
        const fields = Array.from(grid.querySelectorAll(".object-vector-studio-v2__edit-field"));
        const fieldRects = fields.map((field) => field.getBoundingClientRect());
        const inlineFields = fields.map((field) => {
          const label = field.querySelector("span").getBoundingClientRect();
          const input = field.querySelector("input").getBoundingClientRect();
          return Math.abs((label.top + label.height / 2) - (input.top + input.height / 2)) <= 2 && label.right <= input.left;
        });
        return {
          labels: fields.map((field) => field.querySelector("span").textContent.trim()),
          inlineFields,
          rowLabels: [
            fields.filter((field, index) => Math.abs(fieldRects[index].top - fieldRects[0].top) <= 2).map((field) => field.querySelector("span").textContent.trim()),
            fields.filter((field, index) => Math.abs(fieldRects[index].top - fieldRects[2].top) <= 2).map((field) => field.querySelector("span").textContent.trim())
          ]
        };
      });
      expect(ellipseGeometryLayout).toEqual({
        inlineFields: [true, true, true, true],
        labels: ["Cx", "Cy", "Rx", "Ry"],
        rowLabels: [["Cx", "Cy"], ["Rx", "Ry"]]
      });

      await page.locator("#objectVectorStudioV2TagFilter").selectOption("enemy");
      await expect(page.locator("#objectVectorStudioV2ObjectTiles .object-vector-studio-v2__object-tile")).toHaveCount(1);
      await page.locator("#objectVectorStudioV2SearchFilter").fill("ufo");
      await expect(page.locator("#objectVectorStudioV2ObjectTiles")).toContainText("UFO Template");

      await expect(page.locator("#objectVectorStudioV2GridRenderButton")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveClass(/is-grid-visible/);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-grid-rendered='true']")).toHaveCount(1);
      await page.locator("#objectVectorStudioV2GridRenderButton").click();
      await expect(page.locator("#objectVectorStudioV2GridRenderButton")).toHaveAttribute("aria-pressed", "false");
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).not.toHaveClass(/is-grid-visible/);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-grid-rendered='true']")).toHaveCount(0);
      const gridOffIconColorState = await page.evaluate(() => ({
        gridIcon: getComputedStyle(document.querySelector("#objectVectorStudioV2GridRenderButton"), "::before").color,
        gridIconKey: document.querySelector("#objectVectorStudioV2GridRenderButton").dataset.ovsIconKey,
        gridIconName: document.querySelector("#objectVectorStudioV2GridRenderButton").dataset.ovsIconName,
        gridText: getComputedStyle(document.querySelector("#objectVectorStudioV2GridRenderButton")).color,
        snapAngleDisabledIcon: getComputedStyle(document.querySelector("#objectVectorStudioV2AngleSnapButton"), "::before").color
      }));
      expect(gridOffIconColorState.gridIcon).toBe(gridOffIconColorState.snapAngleDisabledIcon);
      expect(gridOffIconColorState.gridIconKey).toBe("gridOff");
      expect(gridOffIconColorState.gridIconName).toBe("nf-md-grid_off");
      expect(gridOffIconColorState.gridText).not.toBe(gridOffIconColorState.snapAngleDisabledIcon);

      await page.evaluate(() => window.__objectVectorStudioV2App.selectShape(0, "test shape list", { additive: true }));
      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes .object-vector-studio-v2__shape-list-actions [data-shape-list-action='group']").click();
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"groupId": "group-1"');
      await expect(page.locator("#statusLog")).toHaveValue(/OK Grouped 2 shapes into group-1\./);

      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-shape-group-id='group-1']").first().click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected group group-1 from shape group icon: 2 shapes\./);
      await page.evaluate(() => window.__objectVectorStudioV2App.activateToolMode("select", "group drag verification"));
      const groupedDragBefore = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        return app.selectedObject().shapes.map((shape, shapeIndex) => {
          const transform = app.effectiveShapeForFrame(shape, frame, shapeIndex).transform;
          return { x: transform.x, y: transform.y };
        });
      });
      const groupedShapeBox = await page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']").boundingBox();
      expect(groupedShapeBox).toBeTruthy();
      const groupedShapeDragStart = {
        x: groupedShapeBox.x + groupedShapeBox.width * 0.62,
        y: groupedShapeBox.y + groupedShapeBox.height * 0.58
      };
      await page.mouse.move(groupedShapeDragStart.x, groupedShapeDragStart.y);
      await page.mouse.down();
      await page.mouse.move(groupedShapeDragStart.x + 42, groupedShapeDragStart.y + 18, { steps: 4 });
      await page.mouse.up();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Dragged group group-1 \(2 shapes\) by/);
      const groupedDragAfter = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        return {
          selectedCount: app.selectedShapeIndexes.size,
          transforms: app.selectedObject().shapes.map((shape, shapeIndex) => {
            const transform = app.effectiveShapeForFrame(shape, frame, shapeIndex).transform;
            return { x: transform.x, y: transform.y };
          })
        };
      });
      expect(groupedDragAfter.selectedCount).toBe(2);
      const groupDragDelta = {
        x: Number((groupedDragAfter.transforms[0].x - groupedDragBefore[0].x).toFixed(3)),
        y: Number((groupedDragAfter.transforms[0].y - groupedDragBefore[0].y).toFixed(3))
      };
      expect(Math.abs(groupDragDelta.x) + Math.abs(groupDragDelta.y)).toBeGreaterThan(0);
      expect(Number((groupedDragAfter.transforms[1].x - groupedDragBefore[1].x).toFixed(3))).toBeCloseTo(groupDragDelta.x, 3);
      expect(Number((groupedDragAfter.transforms[1].y - groupedDragBefore[1].y).toFixed(3))).toBeCloseTo(groupDragDelta.y, 3);

      await expect(page.locator("#objectVectorStudioV2SnapModeButton")).toHaveText("Snap Grid");
      await expect(page.locator("#objectVectorStudioV2ObjectMoveButton")).toHaveCount(0);
      await page.locator("#objectVectorStudioV2ObjectRotateInput").fill("30");
      await page.locator("#objectVectorStudioV2ObjectRotateButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Rotated object .* \(2 shapes\) by 30 degrees around origin/);
      await expect(page.locator("#objectVectorStudioV2ObjectTransform .object-vector-studio-v2__transform-summary")).toHaveText("origin 0, 0, rot 30, scale 1");
      const groupedRotateForwardTransforms = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        return app.selectedObject().shapes.map((shape, shapeIndex) => {
          const transform = app.effectiveShapeForFrame(shape, frame, shapeIndex).transform;
          return { rotation: transform.rotation };
        });
      });
      expect(groupedRotateForwardTransforms).toEqual([{ rotation: 30 }, { rotation: 30 }]);
      await page.locator("#objectVectorStudioV2ObjectRotateInput").fill("-15");
      await page.locator("#objectVectorStudioV2ObjectRotateButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Rotated object .* \(2 shapes\) by -15 degrees around origin/);
      await expect(page.locator("#objectVectorStudioV2ObjectTransform .object-vector-studio-v2__transform-summary")).toHaveText("origin 0, 0, rot 15, scale 1");
      const groupedRotateBackTransforms = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        return app.selectedObject().shapes.map((shape, shapeIndex) => {
          const transform = app.effectiveShapeForFrame(shape, frame, shapeIndex).transform;
          return { rotation: transform.rotation };
        });
      });
      expect(groupedRotateBackTransforms).toEqual([{ rotation: 15 }, { rotation: 15 }]);

      const objectScaleTransformsBefore = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        return app.selectedObject().shapes.map((shape, shapeIndex) => {
          const transform = app.effectiveShapeForFrame(shape, frame, shapeIndex).transform;
          return { scaleX: transform.scaleX, scaleY: transform.scaleY };
        });
      });
      const objectBoundsBeforeScalePreview = await page.locator("#objectVectorStudioV2RenderSurface .object-vector-studio-v2__object-bounds").evaluate((box) => ({
        height: Number(box.getAttribute("height")),
        width: Number(box.getAttribute("width"))
      }));
      await page.locator("#objectVectorStudioV2ObjectScaleUpLargeButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Object resize scale set to 1\.1 for UFO Template; object transform scale remains 1 until Resize rewrites geometry\./);
      await expect(page.locator("#objectVectorStudioV2ObjectScaleInput")).toHaveValue("1.1");
      await expect(page.locator("#objectVectorStudioV2ObjectTransform .object-vector-studio-v2__transform-summary")).toHaveText("origin 0, 0, rot 15, scale 1.1");
      const objectScaleAfterLargeStep = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        return app.selectedObject().shapes.map((shape, shapeIndex) => {
          const transform = app.effectiveShapeForFrame(shape, frame, shapeIndex).transform;
          return { scaleX: transform.scaleX, scaleY: transform.scaleY };
        });
      });
      expect(objectScaleAfterLargeStep).toEqual(objectScaleTransformsBefore);
      const objectBoundsAfterScalePreview = await page.locator("#objectVectorStudioV2RenderSurface .object-vector-studio-v2__object-bounds").evaluate((box) => ({
        height: Number(box.getAttribute("height")),
        width: Number(box.getAttribute("width"))
      }));
      expect(objectBoundsAfterScalePreview.width).toBeGreaterThan(objectBoundsBeforeScalePreview.width);
      expect(objectBoundsAfterScalePreview.height).toBeGreaterThan(objectBoundsBeforeScalePreview.height);
      await page.locator("#objectVectorStudioV2ObjectResetScaleButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Object resize scale reset to 1 for UFO Template; object transform scale remains 1 until Resize rewrites geometry\./);
      await expect(page.locator("#objectVectorStudioV2ObjectScaleInput")).toHaveValue("1");
      await expect(page.locator("#objectVectorStudioV2ObjectTransform .object-vector-studio-v2__transform-summary")).toHaveText("origin 0, 0, rot 15, scale 1");
      const objectBoundsAfterScaleReset = await page.locator("#objectVectorStudioV2RenderSurface .object-vector-studio-v2__object-bounds").evaluate((box) => ({
        height: Number(box.getAttribute("height")),
        width: Number(box.getAttribute("width"))
      }));
      expect(objectBoundsAfterScaleReset.width).toBeCloseTo(objectBoundsBeforeScalePreview.width, 1);
      expect(objectBoundsAfterScaleReset.height).toBeCloseTo(objectBoundsBeforeScalePreview.height, 1);
      await page.locator("#objectVectorStudioV2ObjectScaleDownSmallButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Object resize scale set to 0\.99 for UFO Template; object transform scale remains 1 until Resize rewrites geometry\./);
      const objectScaleAfterSmallStep = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        return app.selectedObject().shapes.map((shape, shapeIndex) => {
          const transform = app.effectiveShapeForFrame(shape, frame, shapeIndex).transform;
          return { scaleX: transform.scaleX, scaleY: transform.scaleY };
        });
      });
      expect(objectScaleAfterSmallStep).toEqual(objectScaleTransformsBefore);
      await page.locator("#objectVectorStudioV2ObjectResetScaleButton").click();
      await expect(page.locator("#objectVectorStudioV2ObjectScaleInput")).toHaveValue("1");

      await page.evaluate(() => window.__objectVectorStudioV2App.selectShape(0, "shape transform single-shape verification"));
      await expect(page.locator("#objectVectorStudioV2ShapeTransform #objectVectorStudioV2ScaleDownSmallButton")).toBeEnabled();
      await page.locator("#objectVectorStudioV2ScaleDownSmallButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Scale preview set to 0\.99 for shape row 0\./);
      const shapeScaleAfterSingleStep = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        return app.selectedObject().shapes.map((shape, shapeIndex) => {
          const transform = app.effectiveShapeForFrame(shape, frame, shapeIndex).transform;
          return { scaleX: transform.scaleX, scaleY: transform.scaleY };
        });
      });
      expect(shapeScaleAfterSingleStep).toEqual([{ scaleX: 0.99, scaleY: 0.99 }, objectScaleTransformsBefore[1]]);
      await page.locator("#objectVectorStudioV2ResetShapeScaleButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Scale reset to 1 for shape row 0\./);
      await expect(page.locator("#objectVectorStudioV2ScaleInput")).toHaveValue("1");

      await page.locator("#objectVectorStudioV2CopyJsonButton").click();
      const copiedPayload = await page.evaluate(() => JSON.parse(sessionStorage.getItem("object-vector-studio-v2.authoring-copied-json")));
      expect(copiedPayload.palette).toBeUndefined();
      expect(copiedPayload.objects[0].shapes[0]).toHaveProperty("groupId", "group-1");
      const copiedSchemaValidation = await page.evaluate((payload) => window.__objectVectorStudioV2App.schemaService.validatePayload(payload), copiedPayload);
      expect(copiedSchemaValidation).toEqual({ errors: [], ok: true, payload: copiedPayload });

      const jsonDownloadPromise = page.waitForEvent("download");
      await page.locator("#objectVectorStudioV2ExportJsonButton").click();
      const jsonDownload = await jsonDownloadPromise;
      const jsonExportPath = testInfo.outputPath("object-vector-authoring-export.json");
      await jsonDownload.saveAs(jsonExportPath);
      const exportedPayload = JSON.parse(await readFile(jsonExportPath, "utf8"));
      expect(exportedPayload.objects[0].name).toBe("UFO Template");
      expect(exportedPayload.palette).toBeUndefined();

      const svgDownloadPromise = page.waitForEvent("download");
      await page.locator("#objectVectorStudioV2ExportSvgButton").click();
      const svgDownload = await svgDownloadPromise;
      const svgExportPath = testInfo.outputPath("object-vector-ufo.svg");
      await svgDownload.saveAs(svgExportPath);
      const exportedSvg = await readFile(svgExportPath, "utf8");
      expect(exportedSvg).toContain("<svg");
      expect(exportedSvg).toContain("ellipse");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Export SVG generated for UFO Template: 2 visible shapes\./);

      const invalidPayloadPath = testInfo.outputPath("object-vector-authoring-invalid.json");
      await writeFile(invalidPayloadPath, JSON.stringify({
        name: "Invalid Authoring Payload",
        objects: [],
        toolId: "object-vector-studio-v2",
        version: 1,
        unexpected: "blocked"
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(invalidPayloadPath);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Object Vector Studio V2 schema validation failed from import:object-vector-authoring-invalid\.json: root\.unexpected is not allowed\./);

      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("supports Object Vector Studio V2 animation states and frame timeline foundation", async ({ page }, testInfo) => {
    const server = await startRepoServer();
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await workspaceV2CoverageReporter.start(page);
    try {
      await page.goto(`${server.baseUrl}/tools/object-vector-studio-v2/index.html`, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        sessionStorage.setItem("object-vector-studio-v2.runtimePalette", JSON.stringify({
          id: "animation-palette",
          swatches: [
            { id: "white", value: "#ffffff" },
            { id: "cyan", value: "#6fd3ff" }
          ]
        }));
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            async writeText(text) {
              sessionStorage.setItem("object-vector-studio-v2.animation-copied-json", text);
            }
          }
        });
      });

      const payloadPath = testInfo.outputPath("object-vector-animation.json");
      await writeFile(payloadPath, JSON.stringify({
        name: "Animation Payload",
        objects: [
          {
            id: "object.animation.ship-template",
            name: "Ship Template",
            shapes: [
              {
                geometry: { points: [{ x: 0, y: -64 }, { x: 48, y: 48 }, { x: 0, y: 24 }, { x: -48, y: 48 }] },
                tool: "polygon",
                locked: false,
                order: 1,
                style: { fill: "#ffffff", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 3 },
                transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                visible: true
              }
            ],
            states: [
              {
                frames: [
                  {
                    durationFrames: 1,
                    id: "frame-1",
                    order: 1,
                    shapeOverrides: [
                      {
                        shapeIndex: 0,
                        transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                        visible: true
                      }
                    ]
                  }
                ],
                id: "idle",
                name: "Idle"
              },
              {
                frames: [
                  {
                    durationFrames: 1,
                    id: "frame-1",
                    order: 1,
                    shapeOverrides: [
                      {
                        shapeIndex: 0,
                        transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                        visible: true
                      }
                    ]
                  }
                ],
                id: "move",
                name: "Move"
              }
            ],
            tags: []
          }
        ],
        toolId: "object-vector-studio-v2",
        version: 1
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(payloadPath);

      await expect(page.locator('[data-object-id="object.animation.ship-template"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-state-id='idle']")).toHaveCount(1);
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-frame-id='frame-1']")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-frame-state-select]")).toHaveCount(0);
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-frame-state-help]")).toHaveCount(0);
      const selectedObjectStatePanel = page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.animation.ship-template'] .object-vector-studio-v2__object-state-panel");
      await expect(selectedObjectStatePanel.locator(".object-vector-studio-v2__object-state-controls button")).toHaveText(["Add", "Delete", "?"]);
      const stateControlLayout = await selectedObjectStatePanel.locator(".object-vector-studio-v2__object-state-controls").evaluate((controls) => Array.from(controls.children).map((element) => {
        if (element.tagName.toLowerCase() === "select") {
          return `select:${element.dataset.objectStateSelect}`;
        }
        return `${element.dataset.objectStateAction || element.dataset.objectStateHelp}:${element.textContent.trim()}`;
      }));
      expect(stateControlLayout).toEqual(["select:object.animation.ship-template", "add:Add", "delete:Delete", "all:?"]);
      await expect(selectedObjectStatePanel.locator("[data-object-state-select='object.animation.ship-template']")).toHaveValue("idle");
      await expect(selectedObjectStatePanel.locator("[data-object-state-action='add']")).toBeDisabled();
      await expect(selectedObjectStatePanel.locator("[data-object-state-action='delete']")).toBeEnabled();
      await expect(selectedObjectStatePanel.locator("[data-object-state-help='all']")).toHaveAttribute("title", /idle\nDefault stationary state\.\nNo movement or action animation active\.\n\nmove\nMovement\/action state\.\nUsed for thrusting, walking, flying, or active movement visuals\./);
      await expect(selectedObjectStatePanel.locator("[data-object-state-tile]")).toHaveText(["idle", "move"]);
      await expect(selectedObjectStatePanel.locator("[data-object-state-tile='idle']")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"id": "idle"');
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails")).not.toContainText("Selected Shape");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails")).not.toContainText("ship-template-hull");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometrySummary")).toHaveText("");
      await expect(page.locator("#objectVectorStudioV2ShapeGeometryName")).toHaveText("");
      await expect(page.locator("[aria-label='Frame controls'] button")).toHaveText(["Left", "Frame Earlier", "Duplicate Frame", "Frame Later", "Right", "Delete Frame"]);
      await expect(page.locator("#objectVectorStudioV2DeleteFrameButton")).toBeDisabled();

      await page.setViewportSize({ width: 1440, height: 900 });
      await page.evaluate(() => {
        document.querySelector(".is-collapsible").open = false;
        window.__objectVectorStudioV2App.shell.applyFullscreenState(true);
        window.__objectVectorStudioV2App.shell.updateSummary();
      });
      await expect(page.locator("body")).toHaveClass(/tools-platform-fullscreen-active/);
      const fullscreenFrameControls = await page.evaluate(() => {
        const center = document.querySelector(".tool-starter__panel--center");
        const frameControls = document.querySelector('[aria-label="Frame controls"]');
        const timeline = document.querySelector("#objectVectorStudioV2FrameTimeline");
        const duplicateButton = document.querySelector("#objectVectorStudioV2DuplicateFrameButton");
        const centerRect = center.getBoundingClientRect();
        const controlsRect = frameControls.getBoundingClientRect();
        const timelineRect = timeline.getBoundingClientRect();
        const duplicateRect = duplicateButton.getBoundingClientRect();
        return {
          centerOverflowY: getComputedStyle(center).overflowY,
          controlsVisible: controlsRect.width > 0 && controlsRect.height > 0,
          controlsWithinViewport: controlsRect.top >= 0 && controlsRect.bottom <= window.innerHeight + 1,
          duplicateButtonEnabled: !duplicateButton.disabled,
          duplicateButtonVisible: duplicateRect.width > 0 && duplicateRect.height > 0,
          timelineVisible: timelineRect.width > 0 && timelineRect.height > 0,
          timelineWithinCenter: timelineRect.top >= centerRect.top - 1 && timelineRect.bottom <= centerRect.bottom + 1
        };
      });
      expect(fullscreenFrameControls).toEqual({
        centerOverflowY: "auto",
        controlsVisible: true,
        controlsWithinViewport: true,
        duplicateButtonEnabled: true,
        duplicateButtonVisible: true,
        timelineVisible: true,
        timelineWithinCenter: true
      });
      await page.locator("#objectVectorStudioV2DuplicateFrameButton").click();
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-state-id='idle']")).toHaveCount(2);
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-frame-id='frame-2']")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#objectVectorStudioV2DeleteFrameButton")).toBeEnabled();
      await page.evaluate(() => {
        window.__objectVectorStudioV2App.shell.applyFullscreenState(false);
        document.querySelector(".is-collapsible").open = true;
        window.__objectVectorStudioV2App.shell.updateSummary();
      });
      await expect(page.locator("body")).not.toHaveClass(/tools-platform-fullscreen-active/);
      await page.locator("#objectVectorStudioV2DeleteFrameButton").click();
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-frame-id]")).toHaveCount(1);
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-frame-id='frame-1']")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted frame frame-2 from Idle\./);
      await page.locator("#objectVectorStudioV2DuplicateFrameButton").click();
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-frame-id='frame-2']")).toHaveAttribute("aria-pressed", "true");
      await page.locator("#objectVectorStudioV2FrameLeftButton").click();
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-frame-id]").first()).toHaveAttribute("data-frame-id", "frame-2");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Moved frame frame-2 left\./);
      await page.locator("#objectVectorStudioV2FrameRightButton").click();
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-frame-id]").last()).toHaveAttribute("data-frame-id", "frame-2");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Moved frame frame-2 right\./);
      await page.locator("#objectVectorStudioV2FrameEarlierButton").click();
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-frame-id]").first()).toHaveAttribute("data-frame-id", "frame-2");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Moved frame frame-2 earlier\./);
      await page.locator("#objectVectorStudioV2FrameLaterButton").click();
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-frame-id]").last()).toHaveAttribute("data-frame-id", "frame-2");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Moved frame frame-2 later\./);
      await page.locator("#objectVectorStudioV2FrameEarlierButton").click();
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-frame-id]").first()).toHaveAttribute("data-frame-id", "frame-2");
      await page.locator("#objectVectorStudioV2FrameTimeline [data-frame-id='frame-1']").click();

      await page.locator("#objectVectorStudioV2MoveXInput").fill("12");
      await page.locator("#objectVectorStudioV2MoveYInput").fill("6");
      await page.locator("#objectVectorStudioV2MoveShapeButton").click();
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"shapeOverrides"');
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"x": 12');
      await expect(page.locator("#statusLog")).toHaveValue(/OK Moved shape row 0 by 12, 6\./);

      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-shape-visibility-index='0']").click();
      const stateVisibilityAfterHide = await page.evaluate(() => {
        const object = window.__objectVectorStudioV2App.currentPayload.objects[0];
        const idleFrame = object.states.find((state) => state.id === "idle").frames.find((frame) => frame.id === "frame-1");
        return {
          baseShapeCount: object.shapes.length,
          baseVisible: object.shapes[0].visible,
          overrideVisible: idleFrame.shapeOverrides.find((override) => override.shapeIndex === 0).visible
        };
      });
      expect(stateVisibilityAfterHide).toEqual({ baseShapeCount: 1, baseVisible: true, overrideVisible: false });
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']")).toHaveCount(0);
      await expect(page.locator("#statusLog")).toHaveValue(/OK State idle frame frame-1 shape row 0 visibility set to hidden\./);
      await page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-shape-visibility-index='0']").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']")).toHaveCount(1);
      await expect(page.locator("#statusLog")).toHaveValue(/OK State idle frame frame-1 shape row 0 visibility set to visible\./);

      await page.locator("#objectVectorStudioV2OnionSkinToggle").check();
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-onion-skin-frame='frame-2']")).toHaveCount(1);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Onion-skin preview enabled\./);

      await selectedObjectStatePanel.locator("[data-object-state-select='object.animation.ship-template']").selectOption("move");
      await expect(page.locator('[data-object-id="object.animation.ship-template"]')).toHaveAttribute("aria-pressed", "true");
      await expect(selectedObjectStatePanel.locator("[data-object-state-select='object.animation.ship-template']")).toHaveValue("move");
      await expect(selectedObjectStatePanel.locator("[data-object-state-action='add']")).toBeDisabled();
      await expect(selectedObjectStatePanel.locator("[data-object-state-help='all']")).toHaveAttribute("title", /active\nObject is enabled and participating in gameplay\.\nTypically the default active runtime state\./);
      await expect(selectedObjectStatePanel.locator("[data-object-state-tile='move']")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-state-id='move']")).toHaveCount(1);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected state Move from state dropdown; active object remains Ship Template\./);
      await selectedObjectStatePanel.locator("[data-object-state-tile='idle']").click();
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-state-id='idle']")).toHaveCount(2);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected state Idle from state tile; active object remains Ship Template\./);

      await page.locator("#objectVectorStudioV2LoopToggle").check();
      await page.locator("#objectVectorStudioV2FpsInput").fill("24");
      await page.locator("#objectVectorStudioV2PlayButton").click();
      await expect(page.locator("#objectVectorStudioV2PauseButton")).toBeEnabled();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Playback started for state Idle at 24 FPS\./);
      await page.waitForTimeout(120);
      await page.locator("#objectVectorStudioV2PauseButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Playback paused at frame/);
      await page.locator("#objectVectorStudioV2StopButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Playback stopped\./);

      await page.locator("#objectVectorStudioV2RuntimePreviewButton").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("data-runtime-preview", "true");
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("data-runtime-preview-state", "idle");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Object Vector runtime asset load from Object Vector Studio V2 runtime preview: 1 objects\./);
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("data-runtime-preview-frame", "frame-2");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Object Vector runtime SVG preview generated for object\.animation\.ship-template state=idle frame=frame-2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Runtime preview launched for Ship Template state idle frame frame-2\. Runtime palette source object-vector-studio-v2\.runtimePalette; object JSON remains palette-free\./);

      await page.locator("#objectVectorStudioV2CopyJsonButton").click();
      const copiedPayload = await page.evaluate(() => JSON.parse(sessionStorage.getItem("object-vector-studio-v2.animation-copied-json")));
      expect(copiedPayload.objects[0].states.map((state) => state.id)).toEqual(expect.arrayContaining(["idle", "move"]));
      expect(copiedPayload.objects[0].states.find((state) => state.id === "idle").frames).toHaveLength(2);

      const svgDownloadPromise = page.waitForEvent("download");
      await page.locator("#objectVectorStudioV2ExportSvgButton").click();
      const svgDownload = await svgDownloadPromise;
      const svgExportPath = testInfo.outputPath("object-vector-animation.svg");
      await svgDownload.saveAs(svgExportPath);
      const exportedSvg = await readFile(svgExportPath, "utf8");
      expect(exportedSvg).toContain('data-object-state="idle"');
      expect(exportedSvg).toContain('"frameId"');

      const legacyPayloadPath = testInfo.outputPath("object-vector-legacy-frame-id.json");
      const legacyPayload = JSON.parse(JSON.stringify(copiedPayload));
      legacyPayload.objects[0].states.find((state) => state.id === "idle").frames = [
        {
          durationFrames: 1,
          id: "idle-frame-1",
          order: 1,
          shapeOverrides: [
            {
              shapeIndex: 0,
              transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 12, y: 6 },
              visible: true
            }
          ]
        }
      ];
      await writeFile(legacyPayloadPath, JSON.stringify(legacyPayload, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(legacyPayloadPath);
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-frame-id='idle-frame-1']")).toHaveAttribute("aria-pressed", "true");
      await page.locator("#objectVectorStudioV2DuplicateFrameButton").click();
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-frame-id='frame-1']")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Duplicated frame idle-frame-1 as frame-1\./);

      const invalidPayloadPath = testInfo.outputPath("object-vector-invalid-animation.json");
      await writeFile(invalidPayloadPath, JSON.stringify({
        name: "Invalid Animation Payload",
        objects: [
          {
            id: "object.animation.bad-animation",
            name: "Bad Animation",
            shapes: [],
            tags: [],
            states: [
              {
                frames: [],
                id: "flying",
                name: "Flying"
              }
            ]
          }
        ],
        toolId: "object-vector-studio-v2",
        version: 1
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(invalidPayloadPath);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Object Vector Studio V2 schema validation failed from import:object-vector-invalid-animation\.json: root\.objects\[0\]\.states\[0\]\.id must be one of idle, move, active, inactive, damaged, destroyed\./);

      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("cleans Object Vector Studio V2 single-member groups and adds selected object states", async ({ page }, testInfo) => {
    const server = await startRepoServer();
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await workspaceV2CoverageReporter.start(page);
    try {
      await page.goto(`${server.baseUrl}/tools/object-vector-studio-v2/index.html`, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        sessionStorage.setItem("object-vector-studio-v2.runtimePalette", JSON.stringify({
          id: "group-cleanup-palette",
          swatches: [
            { id: "white", value: "#ffffff" },
            { id: "cyan", value: "#6fd3ff" }
          ]
        }));
      });

      const payloadPath = testInfo.outputPath("object-vector-group-state.json");
      await writeFile(payloadPath, JSON.stringify({
        name: "Group Cleanup Payload",
        objects: [
          {
            id: "object.test.group-state",
            name: "Group State",
            shapes: [
              {
                geometry: { x: -20, y: -20, width: 16, height: 16 },
                groupId: "group-1",
                locked: false,
                order: 1,
                style: { fill: "#ffffff", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 2 },
                tool: "rectangle",
                transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                visible: true
              },
              {
                geometry: { x: 8, y: -20, width: 16, height: 16 },
                groupId: "group-1",
                locked: false,
                order: 2,
                style: { fill: "#ffffff", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 2 },
                tool: "rectangle",
                transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                visible: true
              },
              {
                geometry: { x: 36, y: -20, width: 16, height: 16 },
                locked: false,
                order: 3,
                style: { fill: "#ffffff", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 2 },
                tool: "rectangle",
                transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 30, y: 0 },
                visible: true
              },
              {
                geometry: { x: 64, y: -20, width: 16, height: 16 },
                locked: false,
                order: 4,
                style: { fill: "#ffffff", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 2 },
                tool: "rectangle",
                transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                visible: true
              }
            ],
            states: [
              {
                frames: [
                  { durationFrames: 1, id: "frame-1", order: 1, shapeOverrides: [] }
                ],
                id: "idle",
                name: "Idle"
              }
            ],
            tags: []
          }
        ],
        toolId: "object-vector-studio-v2",
        version: 1
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(payloadPath);

      const objectTile = page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.test.group-state']");
      const statePanel = objectTile.locator(".object-vector-studio-v2__object-state-panel");
      const addStateButton = statePanel.locator("[data-object-state-action='add']");
      const deleteStateButton = statePanel.locator("[data-object-state-action='delete']");
      const stateSelect = statePanel.locator("[data-object-state-select='object.test.group-state']");
      const stateControlLayout = await statePanel.locator(".object-vector-studio-v2__object-state-controls").evaluate((controls) => Array.from(controls.children).map((element) => {
        if (element.tagName.toLowerCase() === "select") {
          return "select";
        }
        return element.dataset.objectStateAction || element.dataset.objectStateHelp;
      }));
      expect(stateControlLayout).toEqual(["select", "add", "delete", "all"]);
      await expect(addStateButton).toBeDisabled();
      await expect(deleteStateButton).toBeDisabled();
      await expect(statePanel.locator("[data-object-state-tile]")).toHaveText(["idle"]);

      await stateSelect.selectOption("move");
      await expect(page.locator("#statusLog")).toHaveValue(/INFO State move is ready to add for Group State\./);
      await expect(addStateButton).toBeEnabled();
      await addStateButton.click();
      await expect(statePanel.locator("[data-object-state-tile]")).toHaveText(["idle", "move"]);
      await expect(statePanel.locator("[data-object-state-tile='move']")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-state-id='move']")).toHaveCount(1);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Created state Move with frame frame-1\./);
      await expect(addStateButton).toBeDisabled();
      await expect(deleteStateButton).toBeEnabled();
      await expect(statePanel.locator("[data-object-state-tile='move']")).toHaveCount(1);
      await deleteStateButton.click();
      await expect(statePanel.locator("[data-object-state-tile]")).toHaveText(["idle"]);
      await expect(statePanel.locator("[data-object-state-tile='idle']")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#objectVectorStudioV2FrameTimeline [data-state-id='idle']")).toHaveCount(1);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted state move from Group State\./);
      await expect(deleteStateButton).toBeDisabled();

      const shapePanel = page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes");
      await expect(shapePanel.locator("[data-shape-group-id='group-1']")).toHaveCount(2);
      await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        app.selectShape(0, "regroup existing shape");
        app.selectShape(2, "regroup ungrouped shape", { additive: true });
      });
      const selectedShapeActions = shapePanel.locator(".object-vector-studio-v2__shape-list-actions");
      await expect(selectedShapeActions.locator("[data-shape-list-action='group']")).toBeEnabled();
      await selectedShapeActions.locator("[data-shape-list-action='group']").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Grouped 2 shapes into group-2\./);
      const groupsAfterRegroup = await page.evaluate(() => window.__objectVectorStudioV2App.selectedObject().shapes.map((shape) => shape.groupId || ""));
      expect(groupsAfterRegroup).toEqual(["group-2", "", "group-2", ""]);
      await expect(shapePanel.locator("[data-shape-group-id='group-1']")).toHaveCount(0);
      await expect(shapePanel.locator("[data-shape-group-id='group-2']")).toHaveCount(2);

      await page.evaluate(() => window.__objectVectorStudioV2App.selectShape(0, "group move probe"));
      await expect(page.locator("#objectVectorStudioV2ObjectMoveButton")).toHaveCount(0);
      await page.locator("#objectVectorStudioV2MoveXInput").fill("5");
      await page.locator("#objectVectorStudioV2MoveYInput").fill("5");
      await page.locator("#objectVectorStudioV2MoveShapeButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Moved group group-2 \(2 shapes\) by 5, 5\./);
      const transformsAfterGroupMove = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        return app.selectedObject().shapes.map((shape, shapeIndex) => {
          const transform = app.effectiveShapeForFrame(shape, frame, shapeIndex).transform;
          return { x: transform.x, y: transform.y };
        });
      });
      expect(transformsAfterGroupMove).toEqual([{ x: 5, y: 5 }, { x: 0, y: 0 }, { x: 35, y: 5 }, { x: 0, y: 0 }]);

      const selectionBoundsBeforeGroupRotate = await page.locator("#objectVectorStudioV2RenderSurface [data-selection-bounds='0']").evaluate((box) => ({
        height: Number(box.getAttribute("height")),
        width: Number(box.getAttribute("width")),
        x: Number(box.getAttribute("x")),
        y: Number(box.getAttribute("y"))
      }));
      await page.locator("#objectVectorStudioV2ObjectRotateInput").fill("90");
      await page.locator("#objectVectorStudioV2ObjectRotateButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Rotated object Group State \(4 shapes\) by 90 degrees/);
      const transformsAfterObjectRotate = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        return app.selectedObject().shapes.map((shape, shapeIndex) => {
          const transform = app.effectiveShapeForFrame(shape, frame, shapeIndex).transform;
          return { rotation: transform.rotation, x: transform.x, y: transform.y };
        });
      });
      expect(transformsAfterObjectRotate.every((transform) => transform.rotation === 90)).toBe(true);
      const objectRotateOriginDistance = Math.hypot(
        transformsAfterObjectRotate[2].x - transformsAfterObjectRotate[0].x,
        transformsAfterObjectRotate[2].y - transformsAfterObjectRotate[0].y
      );
      expect(objectRotateOriginDistance).toBeCloseTo(30, 3);
      const selectionBoundsAfterGroupRotate = await page.locator("#objectVectorStudioV2RenderSurface [data-selection-bounds='0']").evaluate((box) => ({
        height: Number(box.getAttribute("height")),
        width: Number(box.getAttribute("width")),
        x: Number(box.getAttribute("x")),
        y: Number(box.getAttribute("y"))
      }));
      expect(selectionBoundsAfterGroupRotate).not.toEqual(selectionBoundsBeforeGroupRotate);
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-resize-handle]")).toHaveCount(4);

      await page.evaluate(() => window.__objectVectorStudioV2App.selectShape(1, "single move probe"));
      const transformBeforeSingleMove = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const transform = app.effectiveShapeForFrame(app.selectedObject().shapes[1], app.activeFrame(), 1).transform;
        return { rotation: transform.rotation, x: transform.x, y: transform.y };
      });
      await page.locator("#objectVectorStudioV2MoveXInput").fill("-2");
      await page.locator("#objectVectorStudioV2MoveYInput").fill("-3");
      await page.locator("#objectVectorStudioV2MoveShapeButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Moved shape row 1 by -2, -3\./);
      const transformsAfterSingleMove = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        return app.selectedObject().shapes.map((shape, shapeIndex) => {
          const transform = app.effectiveShapeForFrame(shape, frame, shapeIndex).transform;
          return { x: transform.x, y: transform.y };
        });
      });
      expect(transformsAfterSingleMove[1]).toEqual({
        x: Number((transformBeforeSingleMove.x - 2).toFixed(3)),
        y: Number((transformBeforeSingleMove.y - 3).toFixed(3))
      });

      await page.locator("#objectVectorStudioV2RotateInput").fill("45");
      const shapeGeometryBeforeSingleRotate = await page.evaluate(() => JSON.stringify(window.__objectVectorStudioV2App.selectedShape().geometry));
      await page.locator("#objectVectorStudioV2RotateShapeButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Rotated shape row 1 geometry by 45 degrees around object origin/);
      const transformsAfterSingleRotate = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        return app.selectedObject().shapes.map((shape, shapeIndex) => {
          const transform = app.effectiveShapeForFrame(shape, frame, shapeIndex).transform;
          return { rotation: transform.rotation, x: transform.x, y: transform.y };
        });
      });
      const shapeGeometryAfterSingleRotate = await page.evaluate(() => JSON.stringify(window.__objectVectorStudioV2App.selectedShape().geometry));
      expect(shapeGeometryAfterSingleRotate).not.toBe(shapeGeometryBeforeSingleRotate);
      expect(transformsAfterSingleRotate[1]).toEqual({
        rotation: transformBeforeSingleMove.rotation,
        x: Number((transformBeforeSingleMove.x - 2).toFixed(3)),
        y: Number((transformBeforeSingleMove.y - 3).toFixed(3))
      });

      const selectedSetRotateBefore = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const indexes = app.selectedObject().shapes.map((shape, shapeIndex) => shapeIndex);
        app.selectedShapeIndex = 0;
        app.selectedShapeIndexes = new Set(indexes);
        app.directSelectedShapeIndexes = new Set(indexes);
        app.renderPayload();
        const frame = app.activeFrame();
        const bounds = app.shapeSetBounds(app.selectedObject(), indexes, { includeInvisible: false });
        const origin = app.objectTransformOrigin(app.selectedObject());
        return {
          bounds,
          origins: indexes.map((shapeIndex) => {
            const shape = app.effectiveShapeForFrame(app.selectedObject().shapes[shapeIndex], frame, shapeIndex);
            const transform = app.ensureShapeTransform(shape);
            return {
              index: shapeIndex,
              point: {
                x: Number((origin.x + transform.x).toFixed(3)),
                y: Number((origin.y + transform.y).toFixed(3))
              },
              rotation: transform.rotation
            };
          }),
          pivot: origin
        };
      });
      const selectionBoundsBeforeSelectedSetRotate = await page.locator("#objectVectorStudioV2RenderSurface [data-selection-bounds='0']").evaluate((box) => ({
        height: Number(box.getAttribute("height")),
        width: Number(box.getAttribute("width")),
        x: Number(box.getAttribute("x")),
        y: Number(box.getAttribute("y"))
      }));
      await expect(page.locator("#objectVectorStudioV2ShapeTransform #objectVectorStudioV2RotateShapeButton")).toBeDisabled();
      await page.locator("#objectVectorStudioV2ObjectRotateInput").fill("90");
      await page.locator("#objectVectorStudioV2ObjectRotateButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Rotated object Group State \(4 shapes\) by 90 degrees/);
      const selectedSetRotateAfter = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        const origin = app.objectTransformOrigin(app.selectedObject());
        return app.selectedObject().shapes.map((shape, shapeIndex) => {
          const effectiveShape = app.effectiveShapeForFrame(shape, frame, shapeIndex);
          const transform = app.ensureShapeTransform(effectiveShape);
          return {
            index: shapeIndex,
            point: {
              x: Number((origin.x + transform.x).toFixed(3)),
              y: Number((origin.y + transform.y).toFixed(3))
            },
            rotation: transform.rotation
          };
        });
      });
      const rotatePointAround = (point, pivot, degrees) => {
        const radians = (degrees * Math.PI) / 180;
        const relativeX = point.x - pivot.x;
        const relativeY = point.y - pivot.y;
        return {
          x: pivot.x + relativeX * Math.cos(radians) - relativeY * Math.sin(radians),
          y: pivot.y + relativeX * Math.sin(radians) + relativeY * Math.cos(radians)
        };
      };
      selectedSetRotateBefore.origins.forEach((before) => {
        const after = selectedSetRotateAfter.find((entry) => entry.index === before.index);
        const expectedPoint = rotatePointAround(before.point, selectedSetRotateBefore.pivot, 90);
        expect(after.point.x).toBeCloseTo(expectedPoint.x, 3);
        expect(after.point.y).toBeCloseTo(expectedPoint.y, 3);
        expect(after.rotation).toBe((before.rotation + 90) % 360);
      });
      const selectionBoundsAfterSelectedSetRotate = await page.locator("#objectVectorStudioV2RenderSurface [data-selection-bounds='0']").evaluate((box) => ({
        height: Number(box.getAttribute("height")),
        width: Number(box.getAttribute("width")),
        x: Number(box.getAttribute("x")),
        y: Number(box.getAttribute("y"))
      }));
      expect(selectionBoundsAfterSelectedSetRotate).not.toEqual(selectionBoundsBeforeSelectedSetRotate);

      await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        app.selectedShapeIndex = 0;
        app.selectedShapeIndexes = new Set([0]);
        app.directSelectedShapeIndexes = new Set([0]);
        app.renderPayload();
      });
      await expect(selectedShapeActions.locator("[data-shape-list-action='ungroup']")).toBeEnabled();
      await selectedShapeActions.locator("[data-shape-list-action='ungroup']").click();
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).not.toContainText('"groupId": "group-2"');
      await expect(shapePanel.locator("[data-shape-group-id='group-2']")).toHaveCount(0);
      await expect(selectedShapeActions.locator("[data-shape-list-action='ungroup']")).toBeDisabled();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Ungrouped 1 selected shapes from group-2\./);

      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("drags selected Object Vector Studio V2 shapes from preview selection bounds", async ({ page }, testInfo) => {
    const server = await startRepoServer();
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await workspaceV2CoverageReporter.start(page);
    try {
      await page.goto(`${server.baseUrl}/tools/object-vector-studio-v2/index.html`, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        sessionStorage.setItem("object-vector-studio-v2.runtimePalette", JSON.stringify({
          id: "drag-selection-palette",
          swatches: [
            { id: "white", value: "#ffffff" },
            { id: "cyan", value: "#6fd3ff" }
          ]
        }));
      });

      const payloadPath = testInfo.outputPath("object-vector-preview-drag-selection.json");
      await writeFile(payloadPath, JSON.stringify({
        name: "Preview Drag Selection Payload",
        objects: [
          {
            id: "object.test.preview-drag-selection",
            name: "Preview Drag Selection",
            shapes: [
              {
                geometry: { x: -20, y: -20, width: 16, height: 16 },
                groupId: "group-1",
                locked: false,
                order: 1,
                style: { fill: "#ffffff", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 2 },
                tool: "rectangle",
                transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                visible: true
              },
              {
                geometry: { x: 8, y: 24, width: 16, height: 16 },
                locked: false,
                order: 2,
                style: { fill: "#ffffff", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 2 },
                tool: "rectangle",
                transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                visible: true
              },
              {
                geometry: { x: 36, y: -20, width: 16, height: 16 },
                groupId: "group-1",
                locked: false,
                order: 3,
                style: { fill: "#ffffff", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 2 },
                tool: "rectangle",
                transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                visible: true
              },
              {
                geometry: { x: 64, y: 24, width: 16, height: 16 },
                locked: false,
                order: 4,
                style: { fill: "#ffffff", fillOpacity: 1, stroke: "#6fd3ff", strokeOpacity: 1, strokeWidth: 2 },
                tool: "rectangle",
                transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                visible: true
              }
            ],
            states: [
              {
                frames: [
                  { durationFrames: 1, id: "frame-1", order: 1, shapeOverrides: [] }
                ],
                id: "idle",
                name: "Idle"
              }
            ],
            tags: []
          }
        ],
        toolId: "object-vector-studio-v2",
        version: 1
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(payloadPath);

      const shapePanel = page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes");
      await shapePanel.locator("[data-object-tile-shape-index='1']").click();
      await shapePanel.locator("[data-object-tile-shape-index='3']").click({ modifiers: ["Shift"] });
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-selection-drag-bounds='1,3']")).toHaveCount(1);

      const selectedSetBefore = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const indexes = Array.from(app.selectedShapeIndexes).sort((left, right) => left - right);
        const frame = app.activeFrame();
        const transforms = indexes.map((shapeIndex) => {
          const transform = app.effectiveShapeForFrame(app.selectedObject().shapes[shapeIndex], frame, shapeIndex).transform;
          return { index: shapeIndex, x: transform.x, y: transform.y };
        });
        return {
          bounds: app.shapeSetBounds(app.selectedObject(), indexes, { includeInvisible: false }),
          indexes,
          transforms
        };
      });
      expect(selectedSetBefore.indexes).toEqual([1, 3]);

      const tinyDragPoint = await objectVectorLogicalClientPoint(page, selectedSetBefore.bounds.x + selectedSetBefore.bounds.width / 2, selectedSetBefore.bounds.y + selectedSetBefore.bounds.height / 2);
      await page.mouse.move(tinyDragPoint.x, tinyDragPoint.y);
      await page.mouse.down();
      await page.mouse.move(tinyDragPoint.x + 2, tinyDragPoint.y + 2);
      await page.mouse.up();
      const selectedSetAfterTinyDrag = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        const indexes = Array.from(app.selectedShapeIndexes).sort((left, right) => left - right);
        return {
          indexes,
          transforms: indexes.map((shapeIndex) => {
            const transform = app.effectiveShapeForFrame(app.selectedObject().shapes[shapeIndex], frame, shapeIndex).transform;
            return { index: shapeIndex, x: transform.x, y: transform.y };
          })
        };
      });
      expect(selectedSetAfterTinyDrag.indexes).toEqual([1, 3]);
      expect(selectedSetAfterTinyDrag.transforms).toEqual(selectedSetBefore.transforms);

      await page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='1']").first().click();
      const selectedSetAfterRepeatedClick = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        return {
          indexes: Array.from(app.selectedShapeIndexes).sort((left, right) => left - right),
          selectedShapeIndex: app.selectedShapeIndex
        };
      });
      expect(selectedSetAfterRepeatedClick.indexes).toEqual([1, 3]);
      expect(selectedSetAfterRepeatedClick.selectedShapeIndex).toBe(1);

      await mouseDragObjectVectorLogicalPoints(page, {
        x: selectedSetBefore.bounds.x + selectedSetBefore.bounds.width / 2,
        y: selectedSetBefore.bounds.y + selectedSetBefore.bounds.height / 2
      }, {
        x: selectedSetBefore.bounds.x + selectedSetBefore.bounds.width / 2 + 6,
        y: selectedSetBefore.bounds.y + selectedSetBefore.bounds.height / 2 - 4
      });
      await expect(page.locator("#statusLog")).toHaveValue(/OK Dragged selected shapes \(2 shapes\) by 6, -4\./);
      const selectedSetAfter = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        return {
          indexes: Array.from(app.selectedShapeIndexes).sort((left, right) => left - right),
          transforms: app.selectedObject().shapes.map((shape, shapeIndex) => {
            const transform = app.effectiveShapeForFrame(shape, frame, shapeIndex).transform;
            return { x: transform.x, y: transform.y };
          })
        };
      });
      expect(selectedSetAfter.indexes).toEqual([1, 3]);
      expect(selectedSetAfter.transforms[1]).toEqual({ x: 6, y: -4 });
      expect(selectedSetAfter.transforms[3]).toEqual({ x: 6, y: -4 });
      expect(selectedSetAfter.transforms[0]).toEqual({ x: 0, y: 0 });
      expect(selectedSetAfter.transforms[2]).toEqual({ x: 0, y: 0 });

      await shapePanel.locator("[data-shape-group-id='group-1']").first().click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface [data-selection-drag-bounds='0,2']")).toHaveCount(1);
      const groupSetBefore = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const indexes = Array.from(app.selectedShapeIndexes).sort((left, right) => left - right);
        return {
          bounds: app.shapeSetBounds(app.selectedObject(), indexes, { includeInvisible: false }),
          indexes
        };
      });
      expect(groupSetBefore.indexes).toEqual([0, 2]);
      await mouseDragObjectVectorLogicalPoints(page, {
        x: groupSetBefore.bounds.x + groupSetBefore.bounds.width / 2,
        y: groupSetBefore.bounds.y + groupSetBefore.bounds.height / 2
      }, {
        x: groupSetBefore.bounds.x + groupSetBefore.bounds.width / 2 - 4,
        y: groupSetBefore.bounds.y + groupSetBefore.bounds.height / 2 + 5
      });
      await expect(page.locator("#statusLog")).toHaveValue(/OK Dragged group group-1 \(2 shapes\) by -4, 5\./);
      const groupSetAfter = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        return {
          indexes: Array.from(app.selectedShapeIndexes).sort((left, right) => left - right),
          transforms: app.selectedObject().shapes.map((shape, shapeIndex) => {
            const transform = app.effectiveShapeForFrame(shape, frame, shapeIndex).transform;
            return { x: transform.x, y: transform.y };
          })
        };
      });
      expect(groupSetAfter.indexes).toEqual([0, 2]);
      expect(groupSetAfter.transforms[0]).toEqual({ x: -4, y: 5 });
      expect(groupSetAfter.transforms[2]).toEqual({ x: -4, y: 5 });
      expect(groupSetAfter.transforms[1]).toEqual({ x: 6, y: -4 });
      expect(groupSetAfter.transforms[3]).toEqual({ x: 6, y: -4 });

      const transformsBeforeOutsideDrag = groupSetAfter.transforms;
      await mouseDragObjectVectorLogicalPoints(page, { x: -80, y: 60 }, { x: -60, y: 70 });
      const outsideDragResult = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        return {
          selectedCount: app.selectedShapeIndexes.size,
          selectedShapeIndex: app.selectedShapeIndex,
          transforms: app.selectedObject().shapes.map((shape, shapeIndex) => {
            const transform = app.effectiveShapeForFrame(shape, frame, shapeIndex).transform;
            return { x: transform.x, y: transform.y };
          })
        };
      });
      expect(outsideDragResult.transforms).toEqual(transformsBeforeOutsideDrag);
      expect(outsideDragResult.selectedCount).toBe(0);
      expect(outsideDragResult.selectedShapeIndex).toBe(-1);

      const emptyCanvasCursor = await page.locator("#objectVectorStudioV2RenderSurface").evaluate((surface) => ({
        classList: Array.from(surface.classList),
        cursor: getComputedStyle(surface).cursor
      }));
      expect(emptyCanvasCursor.classList).toContain("is-empty-canvas-object-drag-ready");
      expect(emptyCanvasCursor.cursor).toBe("grab");
      await mouseDragObjectVectorLogicalPoints(page, { x: -80, y: 60 }, { x: -60, y: 70 });
      await expect(page.locator("#statusLog")).toHaveValue(/OK Dragged object Preview Drag Selection by 20, 10\./);
      const objectDragResult = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const frame = app.activeFrame();
        return {
          cursorReady: app.elements.renderSurface.classList.contains("is-empty-canvas-object-drag-ready"),
          selectedCount: app.selectedShapeIndexes.size,
          selectedShapeIndex: app.selectedShapeIndex,
          transforms: app.selectedObject().shapes.map((shape, shapeIndex) => {
            const transform = app.effectiveShapeForFrame(shape, frame, shapeIndex).transform;
            return { x: transform.x, y: transform.y };
          })
        };
      });
      expect(objectDragResult.cursorReady).toBe(true);
      expect(objectDragResult.selectedCount).toBe(0);
      expect(objectDragResult.selectedShapeIndex).toBe(-1);
      expect(objectDragResult.transforms).toEqual(transformsBeforeOutsideDrag.map((transform) => ({
        x: Number((transform.x + 20).toFixed(3)),
        y: Number((transform.y + 10).toFixed(3))
      })));

      await shapePanel.locator("[data-object-tile-shape-index='1']").click();
      const liveDragStart = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const surface = document.querySelector("#objectVectorStudioV2RenderSurface");
        const selectionBox = surface.querySelector("[data-selection-bounds='1']");
        const handle = surface.querySelector("[data-resize-handle='nw']");
        const effectiveShape = app.effectiveShape(app.selectedObject().shapes[1], 1);
        const bounds = app.transformedBounds(effectiveShape);
        const transform = effectiveShape.transform;
        return {
          bounds: {
            height: Number(selectionBox.getAttribute("height")),
            width: Number(selectionBox.getAttribute("width")),
            x: Number(selectionBox.getAttribute("x")),
            y: Number(selectionBox.getAttribute("y"))
          },
          handle: {
            x: Number(handle.getAttribute("x")),
            y: Number(handle.getAttribute("y"))
          },
          logicalCenter: {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2
          },
          transform: { x: transform.x, y: transform.y }
        };
      });
      const liveDragClientStart = await objectVectorLogicalClientPoint(page, liveDragStart.logicalCenter.x, liveDragStart.logicalCenter.y);
      const liveDragClientEnd = await objectVectorLogicalClientPoint(page, liveDragStart.logicalCenter.x + 5.1234, liveDragStart.logicalCenter.y + 2.9876);
      await page.mouse.move(liveDragClientStart.x, liveDragClientStart.y);
      await page.mouse.down();
      await page.mouse.move(liveDragClientEnd.x, liveDragClientEnd.y, { steps: 4 });
      const liveDragDuring = await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const surface = document.querySelector("#objectVectorStudioV2RenderSurface");
        const selectionBox = surface.querySelector("[data-selection-bounds='1']");
        const handle = surface.querySelector("[data-resize-handle='nw']");
        const transform = app.effectiveShapeForFrame(app.selectedObject().shapes[1], app.activeFrame(), 1).transform;
        return {
          bounds: {
            x: Number(selectionBox.getAttribute("x")),
            y: Number(selectionBox.getAttribute("y"))
          },
          handle: {
            x: Number(handle.getAttribute("x")),
            y: Number(handle.getAttribute("y"))
          },
          transform: { x: transform.x, y: transform.y }
        };
      });
      expect(liveDragDuring.bounds.x).not.toBe(liveDragStart.bounds.x);
      expect(liveDragDuring.bounds.y).not.toBe(liveDragStart.bounds.y);
      expect(liveDragDuring.handle.x).not.toBe(liveDragStart.handle.x);
      expect(liveDragDuring.handle.y).not.toBe(liveDragStart.handle.y);
      expect(String(liveDragDuring.transform.x).split(".")[1]?.length || 0).toBeLessThanOrEqual(3);
      expect(String(liveDragDuring.transform.y).split(".")[1]?.length || 0).toBeLessThanOrEqual(3);
      await page.mouse.up();

      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("supports Object Vector Studio V2 asset library inheritance foundation", async ({ page }, testInfo) => {
    const server = await startRepoServer();
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await workspaceV2CoverageReporter.start(page);
    try {
      await page.goto(`${server.baseUrl}/tools/object-vector-studio-v2/index.html`, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        sessionStorage.setItem("object-vector-studio-v2.runtimePalette", JSON.stringify({
          id: "library-palette",
          swatches: [
            { id: "white", value: "#ffffff" },
            { id: "gold", value: "#fbbf24" }
          ]
        }));
      });

      const rectangleShape = {
        geometry: { height: 36, width: 52, x: -26, y: -18 },
        tool: "rectangle",
        locked: false,
        order: 1,
        style: { fill: "transparent", fillOpacity: 1, stroke: "#ffffff", strokeOpacity: 1, strokeWidth: 3 },
        transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
        visible: true
      };
      const activeState = {
        frames: [
          {
            durationFrames: 1,
            id: "frame-1",
            order: 1,
            shapeOverrides: [
              {
                shapeIndex: 0,
                transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                visible: true
              }
            ]
          }
        ],
        id: "active",
        name: "Active"
      };
      const inheritedPayloadPath = testInfo.outputPath("object-vector-inherited-library.json");
      await writeFile(inheritedPayloadPath, JSON.stringify({
        name: "Inherited Library Payload",
        objects: [
          {
            id: "object.library.base-ship",
            name: "Base Ship",
            shapes: [rectangleShape],
            states: [activeState],
            tags: ["base", "shared"]
          },
          {
            baseObjectId: "object.library.base-ship",
            id: "object.library.derived-ship",
            name: "Derived Ship",
            shapes: [
              {
                ...rectangleShape,
                style: { fill: "transparent", fillOpacity: 1, stroke: "#fbbf24", strokeOpacity: 1, strokeWidth: 4 }
              }
            ],
            states: [
              {
                ...activeState,
                frames: [
                  {
                    ...activeState.frames[0],
                    shapeOverrides: [
                      {
                        shapeIndex: 0,
                        transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 8, scaleX: 1.1, scaleY: 1.1, x: 4, y: 0 },
                        visible: true
                      }
                    ]
                  }
                ]
              }
            ],
            tags: ["derived", "override"]
          }
        ],
        toolId: "object-vector-studio-v2",
        version: 1
      }, null, 2), "utf8");

      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(inheritedPayloadPath);
      await expect(page.locator("#objectVectorStudioV2ObjectsCount")).toHaveText(/\(2 obj, states \d+, 1 shape\)/);
      await page.locator('button[aria-controls="objectVectorStudioV2DependencyGraphContent"]').click();
      await expect(page.locator("#objectVectorStudioV2DependencyGraph")).toContainText("object.library.derived-ship inherits object.library.base-ship");
      await expect(page.locator("#objectVectorStudioV2DependencyGraph")).toContainText("Object tags:");
      await expect(page.locator("#objectVectorStudioV2DependencyGraph")).toContainText("object.library.derived-ship: Derived Ship [derived, override]");

      await page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.library.derived-ship']").click();
      await expect(page.locator('[data-object-id="object.library.derived-ship"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#objectVectorStudioV2ObjectPreviewFooter")).toContainText("Object ID: object.library.derived-ship");
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Disabled controls stay inactive until a schema-valid payload, runtime palette, selected object, or active frame is available\./);

      await page.locator("#objectVectorStudioV2RuntimePreviewButton").click();
      await expect(page.locator("#objectVectorStudioV2RenderSurface")).toHaveAttribute("data-runtime-preview", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Object Vector runtime cache miss for object\.library\.derived-ship; cached resolved object\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Object Vector runtime inheritance resolved for object\.library\.derived-ship from object\.library\.base-ship; cached inherited render payload\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Runtime preview launched for Derived Ship state active frame frame-1\./);
      await page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.library.base-ship'] [data-object-control='delete']").click();
      await expect(page.locator(".object-vector-studio-v2__object-tile[data-object-id='object.library.base-ship']")).toHaveCount(0);
      const objectReferenceCleanup = await page.evaluate(() => {
        const payload = window.__objectVectorStudioV2App.currentPayload;
        return {
          baseObjectIds: payload.objects.map((object) => object.baseObjectId || ""),
          objectIds: payload.objects.map((object) => object.id),
          objectTags: payload.objects.map((object) => object.tags || []),
          hasAssetLibrary: Object.hasOwn(payload, "assetLibrary"),
          schemaOk: window.__objectVectorStudioV2App.schemaService.validatePayload(payload).ok
        };
      });
      expect(objectReferenceCleanup).toEqual({
        baseObjectIds: [""],
        hasAssetLibrary: false,
        objectIds: ["object.library.derived-ship"],
        objectTags: [["derived", "override"]],
        schemaOk: true
      });
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted object Base Ship from object tile delete\./);

      const circularPayloadPath = testInfo.outputPath("object-vector-circular-inheritance.json");
      await writeFile(circularPayloadPath, JSON.stringify({
        name: "Circular Payload",
        objects: [
          {
            baseObjectId: "object.library.derived-circular",
            id: "object.library.base-circular",
            name: "Base Circular",
            shapes: [rectangleShape],
            tags: []
          },
          {
            baseObjectId: "object.library.base-circular",
            id: "object.library.derived-circular",
            name: "Derived Circular",
            shapes: [rectangleShape],
            tags: []
          }
        ],
        toolId: "object-vector-studio-v2",
        version: 1
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(circularPayloadPath);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Object Vector Studio V2 schema validation failed from import:object-vector-circular-inheritance\.json: root\.objects\[0\]\.baseObjectId creates a circular inheritance chain at object\.library\.base-circular\./);

      const missingDependencyPayloadPath = testInfo.outputPath("object-vector-missing-dependency.json");
      await writeFile(missingDependencyPayloadPath, JSON.stringify({
        name: "Missing Dependency Payload",
        objects: [
          {
            baseObjectId: "object.library.missing-base",
            id: "object.library.derived-missing",
            name: "Derived Missing",
            shapes: [rectangleShape],
            tags: []
          }
        ],
        toolId: "object-vector-studio-v2",
        version: 1
      }, null, 2), "utf8");
      await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(missingDependencyPayloadPath);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Object Vector Studio V2 schema validation failed from import:object-vector-missing-dependency\.json: root\.objects\[0\]\.baseObjectId object\.library\.missing-base must reference an existing base object\./);

      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("resolves asset-manager-v2 manifest audio paths and plays Asteroids sounds", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];

    await page.route("**/synthetic-audio-game.manifest.json", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          game: {
            folder: "Synthetic"
          },
          tools: {
            "asset-manager-v2": {
              assets: {
                "assets.audio.music.theme": {
                  kind: "mp3",
                  path: "assets/audio/theme.mp3",
                  role: "music",
                  source: "manifest",
                  type: "audio"
                },
                "assets.audio.sound.click": {
                  kind: "wav",
                  path: "assets/audio/click.wav",
                  role: "sound",
                  source: "manifest",
                  type: "audio"
                }
              }
            }
          },
          schema: "html-js-gaming.game-manifest",
          version: 1
        }),
        contentType: "application/json",
        status: 200
      });
    });

    await page.addInitScript(() => {
      window.__audioPlayCalls = [];
      class MockAudio {
        constructor(src) {
          this.src = new URL(src, window.location.href).pathname;
          this.currentTime = 0;
          this.duration = 1;
          this.loop = false;
          this.paused = true;
          this.preload = "";
          this.volume = 1;
        }

        play() {
          this.paused = false;
          window.__audioPlayCalls.push(this.src);
          return Promise.resolve();
        }

        pause() {
          this.paused = true;
        }
      }

      class MockAudioContext {
        constructor() {
          this.currentTime = 0;
          this.destination = {};
        }

        resume() {
          return Promise.resolve();
        }

        decodeAudioData() {
          return Promise.resolve({ duration: 0.1 });
        }

        createBufferSource() {
          return {
            connect() {},
            start() {},
            stop() {},
            set buffer(value) {
              this._buffer = value;
            }
          };
        }

        createGain() {
          return {
            connect() {},
            gain: {
              linearRampToValueAtTime() {},
              setValueAtTime() {}
            }
          };
        }
      }

      window.Audio = MockAudio;
      window.AudioContext = MockAudioContext;
      window.webkitAudioContext = MockAudioContext;
    });

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await workspaceV2CoverageReporter.start(page);
    try {
      await page.goto(`${server.baseUrl}/tools/index.html`, { waitUntil: "networkidle" });
      const result = await page.evaluate(async () => {
        const manifestAssets = await import("/games/shared/gameManifestAssets.js");
        await manifestAssets.preloadGameManifestAssets("SyntheticAudio", { manifestPath: "/synthetic-audio-game.manifest.json" });
        await manifestAssets.preloadGameManifestAssets("Asteroids", { manifestPath: "/games/Asteroids/game.manifest.json" });
        const { default: AsteroidsAudio } = await import("/games/Asteroids/systems/AsteroidsAudio.js");
        const audioWarnings = [];
        const audio = new AsteroidsAudio({
          logger: {
            warn(message) {
              audioWarnings.push(message);
            }
          }
        });
        const mediaPlayed = await audio.play("fire");
        const loopPlayed = await audio.loopPlayer.play("extraShip", { loopCount: 1 });
        audio.stopAll();
        return {
          audioWarnings,
          asteroidsExtraShip: manifestAssets.resolveGameManifestAssetPath("Asteroids", "assets.audio.sound.extra-ship"),
          asteroidsFire: manifestAssets.resolveGameManifestAssetPath("Asteroids", "assets.audio.sound.fire"),
          asteroidsMusic: manifestAssets.resolveGameManifestAssetPath("Asteroids", "assets.audio.music.beat-1"),
          fireState: audio.media.getState("fire"),
          loopPlayed,
          mediaPlayed,
          playCalls: window.__audioPlayCalls,
          syntheticMp3: manifestAssets.resolveGameManifestAssetPath("SyntheticAudio", "assets.audio.music.theme"),
          syntheticWav: manifestAssets.resolveGameManifestAssetPath("SyntheticAudio", "assets.audio.sound.click")
        };
      });

      expect(result.syntheticMp3).toBe("/games/Synthetic/assets/audio/theme.mp3");
      expect(result.syntheticWav).toBe("/games/Synthetic/assets/audio/click.wav");
      expect(result.asteroidsFire).toBe("/games/Asteroids/assets/audio/fire.wav");
      expect(result.asteroidsMusic).toBe("/games/Asteroids/assets/audio/beat1.wav");
      expect(result.asteroidsExtraShip).toBe("/games/Asteroids/assets/audio/extraShip.wav");
      expect(result.mediaPlayed).toBe(true);
      expect(result.loopPlayed).toBe(true);
      expect(result.fireState).toMatchObject({
        paused: false,
        src: "/games/Asteroids/assets/audio/fire.wav",
        volume: 0.55
      });
      expect(result.playCalls).toEqual(expect.arrayContaining(["/games/Asteroids/assets/audio/fire.wav"]));
      expect(result.audioWarnings).toEqual([]);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("fits the game canvas inside the fullscreen play area and restores layout on exit", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];

    await page.addInitScript(() => {
      let currentFullscreenElement = null;
      const fullscreenStyleSnapshots = new WeakMap();
      window.__gameFullscreenRequests = [];

      Object.defineProperty(document, "fullscreenEnabled", {
        configurable: true,
        get() {
          return true;
        }
      });
      Object.defineProperty(document, "fullscreenElement", {
        configurable: true,
        get() {
          return currentFullscreenElement;
        }
      });
      Object.defineProperty(document, "exitFullscreen", {
        configurable: true,
        value: async () => {
          const element = currentFullscreenElement;
          currentFullscreenElement = null;
          if (element) {
            const snapshot = fullscreenStyleSnapshots.get(element);
            if (snapshot) {
              element.style.width = snapshot.width;
              element.style.height = snapshot.height;
              element.style.position = snapshot.position;
              element.style.display = snapshot.display;
              element.style.background = snapshot.background;
            }
            element.removeAttribute("data-test-fullscreen-active");
          }
          document.dispatchEvent(new Event("fullscreenchange"));
        }
      });
      Element.prototype.requestFullscreen = async function requestFullscreen() {
        currentFullscreenElement = this;
        fullscreenStyleSnapshots.set(this, {
          background: this.style.background,
          display: this.style.display,
          height: this.style.height,
          position: this.style.position,
          width: this.style.width
        });
        this.setAttribute("data-test-fullscreen-active", "1");
        this.style.display = "block";
        this.style.position = "relative";
        this.style.width = "1200px";
        this.style.height = "900px";
        this.style.background = "#000";
        window.__gameFullscreenRequests.push({
          containsCanvas: this.contains(document.getElementById("game")),
          hostKind: this.getAttribute("data-runtime-fullscreen-host") || "",
          tagName: this.tagName
        });
        document.dispatchEvent(new Event("fullscreenchange"));
      };
    });

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await workspaceV2CoverageReporter.start(page);
    try {
      await page.goto(`${server.baseUrl}/games/Asteroids/index.html`, { waitUntil: "networkidle" });
      await page.waitForFunction(() => window.__asteroidsNewBootStage === "boot-complete");
      await page.waitForFunction(() => {
        const engine = window.__asteroidsNewEngine;
        const bezelState = engine?.fullscreenBezelLayer?.getState?.();
        return !document.fullscreenElement
          && bezelState?.visible === false
          && bezelState?.canvasLayoutMode === "normal";
      });
      const normalLayout = await page.evaluate(() => {
        const canvas = document.getElementById("game");
        const header = document.getElementById("shared-theme-header");
        const host = canvas.parentElement;
        const bezel = document.querySelector('[data-runtime-overlay="fullscreenBezel"]');
        const canvasRect = canvas.getBoundingClientRect();
        const bezelRect = bezel?.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();
        const bezelState = window.__asteroidsNewEngine?.fullscreenBezelLayer?.getState?.() || null;
        return {
          bezelDisplay: bezel ? getComputedStyle(bezel).display : "",
          bezelInHost: bezel?.parentElement === host,
          bezelRectHeight: Math.round(bezelRect?.height || 0),
          bezelRectWidth: Math.round(bezelRect?.width || 0),
          bezelState,
          canvasInlineHeight: canvas.style.height,
          canvasInlinePosition: canvas.style.position,
          canvasInlineWidth: canvas.style.width,
          canvasRectHeight: Math.round(canvasRect.height),
          canvasRectWidth: Math.round(canvasRect.width),
          headerHeight: Math.round(headerRect.height),
          hostKind: host.getAttribute("data-runtime-fullscreen-host") || ""
        };
      });
      expect(normalLayout.bezelState).toMatchObject({
        canvasLayoutMode: "normal",
        path: "/games/Asteroids/assets/images/bezel.png",
        visible: false
      });
      expect(normalLayout.bezelDisplay).toBe("none");
      expect(normalLayout.bezelInHost).toBe(true);
      expect(normalLayout.bezelRectWidth).toBe(0);
      expect(normalLayout.bezelRectHeight).toBe(0);
      expect(normalLayout.hostKind).toBe("canvas");
      expect(normalLayout.canvasInlineHeight).toBe("");
      expect(normalLayout.canvasInlinePosition).toBe("");
      expect(normalLayout.canvasInlineWidth).toBe("");
      expect(normalLayout.canvasRectWidth).toBeGreaterThan(900);
      expect(normalLayout.headerHeight).toBeGreaterThan(0);

      await page.locator("#game").click({ position: { x: 20, y: 20 } });
      await page.waitForFunction(() => document.fullscreenElement?.getAttribute("data-runtime-fullscreen-host") === "canvas");
      await page.waitForFunction(() => {
        const canvas = document.getElementById("game");
        const engine = window.__asteroidsNewEngine;
        const bezelState = engine?.fullscreenBezelLayer?.getState?.();
        return canvas.style.position === "absolute"
          && canvas.style.width !== ""
          && canvas.style.height !== ""
          && bezelState?.visible === true
          && bezelState?.canvasLayoutMode === "transparent-window-fit";
      });

      const fullscreenLayout = await page.evaluate(() => {
        const canvas = document.getElementById("game");
        const fullscreenElement = document.fullscreenElement;
        const bezel = document.querySelector('[data-runtime-overlay="fullscreenBezel"]');
        const canvasRect = canvas.getBoundingClientRect();
        const bezelRect = bezel?.getBoundingClientRect();
        const hostRect = fullscreenElement.getBoundingClientRect();
        const bezelState = window.__asteroidsNewEngine?.fullscreenBezelLayer?.getState?.() || null;
        return {
          bezelDisplay: bezel ? getComputedStyle(bezel).display : "",
          bezelInHost: bezel?.parentElement === fullscreenElement,
          bezelRectHeight: Math.round(bezelRect?.height || 0),
          bezelRectWidth: Math.round(bezelRect?.width || 0),
          canvasHeight: Math.round(canvasRect.height),
          canvasInsideHost: canvasRect.left >= hostRect.left
            && canvasRect.top >= hostRect.top
            && canvasRect.right <= hostRect.right
            && canvasRect.bottom <= hostRect.bottom,
          canvasInlineHeight: canvas.style.height,
          canvasInlineLeft: canvas.style.left,
          canvasInlineTop: canvas.style.top,
          canvasInlineWidth: canvas.style.width,
          canvasWidth: Math.round(canvasRect.width),
          fullscreenIsBody: fullscreenElement === document.body,
          fullscreenIsDocumentElement: fullscreenElement === document.documentElement,
          hostHeight: Math.round(hostRect.height),
          hostKind: fullscreenElement.getAttribute("data-runtime-fullscreen-host") || "",
          hostWidth: Math.round(hostRect.width),
          bezelState,
          requests: window.__gameFullscreenRequests
        };
      });
      expect(fullscreenLayout.hostKind).toBe("canvas");
      expect(fullscreenLayout.fullscreenIsBody).toBe(false);
      expect(fullscreenLayout.fullscreenIsDocumentElement).toBe(false);
      expect(fullscreenLayout.hostWidth).toBe(1200);
      expect(fullscreenLayout.hostHeight).toBe(900);
      expect(fullscreenLayout.canvasWidth).toBeGreaterThan(600);
      expect(fullscreenLayout.canvasWidth).toBeLessThan(fullscreenLayout.hostWidth);
      expect(fullscreenLayout.canvasHeight).toBeGreaterThan(400);
      expect(fullscreenLayout.canvasHeight).toBeLessThan(fullscreenLayout.hostHeight);
      expect(fullscreenLayout.canvasInsideHost).toBe(true);
      expect(fullscreenLayout.canvasInlineLeft).not.toBe("");
      expect(fullscreenLayout.canvasInlineTop).not.toBe("");
      expect(fullscreenLayout.bezelState).toMatchObject({
        canvasLayoutMode: "transparent-window-fit",
        path: "/games/Asteroids/assets/images/bezel.png",
        visible: true
      });
      expect(fullscreenLayout.bezelDisplay).toBe("block");
      expect(fullscreenLayout.bezelInHost).toBe(true);
      expect(fullscreenLayout.bezelRectWidth).toBe(fullscreenLayout.hostWidth);
      expect(fullscreenLayout.bezelRectHeight).toBe(fullscreenLayout.hostHeight);
      expect(fullscreenLayout.requests).toEqual([
        { containsCanvas: true, hostKind: "canvas", tagName: "DIV" }
      ]);

      await page.evaluate(() => document.exitFullscreen());
      await page.waitForFunction(() => !document.fullscreenElement);
      await page.waitForFunction(() => {
        const canvas = document.getElementById("game");
        return canvas.style.width === "" && canvas.style.height === "" && canvas.style.position === "";
      });
      const restoredLayout = await page.evaluate(() => {
        const canvas = document.getElementById("game");
        const header = document.getElementById("shared-theme-header");
        const canvasRect = canvas.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();
        return {
          canvasInlineHeight: canvas.style.height,
          canvasInlinePosition: canvas.style.position,
          canvasInlineWidth: canvas.style.width,
          canvasRectHeight: Math.round(canvasRect.height),
          canvasRectWidth: Math.round(canvasRect.width),
          headerHeight: Math.round(headerRect.height)
        };
      });
      expect(restoredLayout.canvasInlineHeight).toBe(normalLayout.canvasInlineHeight);
      expect(restoredLayout.canvasInlinePosition).toBe(normalLayout.canvasInlinePosition);
      expect(restoredLayout.canvasInlineWidth).toBe(normalLayout.canvasInlineWidth);
      expect(restoredLayout.canvasRectWidth).toBe(normalLayout.canvasRectWidth);
      expect(restoredLayout.canvasRectHeight).toBe(normalLayout.canvasRectHeight);
      expect(restoredLayout.headerHeight).toBe(normalLayout.headerHeight);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("loads Object Vector Studio V2 runtime assets into Asteroids gameplay rendering", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await workspaceV2CoverageReporter.start(page);
    try {
      await page.goto(`${server.baseUrl}/games/Asteroids/index.html`, { waitUntil: "networkidle" });
      await page.waitForFunction(() => window.__asteroidsNewBootStage === "boot-complete");
      await page.waitForFunction(() => window.__asteroidsObjectVectorRuntime?.loaded === true);
      await page.waitForFunction(() => {
        const engine = window.__asteroidsNewEngine;
        return engine?.backgroundColorLayer?.getState?.().manifestResolved === true
          && engine?.backgroundImageLayer?.getState?.().manifestResolved === true
          && engine?.fullscreenBezelLayer?.getState?.().manifestResolved === true
          && engine?.fullscreenBezelLayer?.getState?.().canvasLayoutMode === "normal";
      });
      const chromeAssetState = await page.evaluate(() => {
        const engine = window.__asteroidsNewEngine;
        return {
          backgroundColor: engine.backgroundColorLayer.getState(),
          background: engine.backgroundImageLayer.getState(),
          bezel: engine.fullscreenBezelLayer.getState()
        };
      });
      expect(chromeAssetState.backgroundColor).toMatchObject({
        assetId: "assets.color.background.game",
        hex: "#020617",
        name: "Space Black",
        status: "ready"
      });
      expect(chromeAssetState.background).toMatchObject({
        path: "/games/Asteroids/assets/images/deluxe.png"
      });
      expect(["idle", "loading", "ready", "missing"]).toContain(chromeAssetState.background.status);
      const backgroundRenderOrder = await page.evaluate(() => {
        const engine = window.__asteroidsNewEngine;
        const scene = engine.scene;
        const order = [];
        let starfieldDraws = 0;
        const renderer = {
          clear() {
            order.push("clear");
          },
          getCanvasSize() {
            return { width: 960, height: 720 };
          },
          drawRect(_x, _y, _width, _height, color) {
            if (color === "#020617" && !order.includes("background-color")) {
              order.push("background-color");
            } else if (color === "#94a3b8") {
              starfieldDraws += 1;
              if (!order.includes("custom-background")) {
                order.push("custom-background");
              }
            }
          },
          drawImageFrame() {
            order.push("background-image");
          }
        };
        const originalRenderer = engine.renderer;
        const originalLayer = { ...engine.backgroundImageLayer.layer };
        const originalMode = scene.session.mode;
        const originalRender = scene.render;
        const originalFullscreenBezelLayer = engine.fullscreenBezelLayer;
        engine.renderer = renderer;
        engine.fullscreenBezelLayer = {
          sync() {
            order.push("overlay");
            return { visible: false };
          }
        };
        scene.session.mode = "playing";
        scene.render = () => {
          order.push("game-objects");
        };
        try {
          engine.backgroundImageLayer.layer = {
            ...engine.backgroundImageLayer.layer,
            image: { width: 960, height: 720 },
            status: "ready"
          };
          engine.renderFrame();
        } finally {
          engine.renderer = originalRenderer;
          engine.fullscreenBezelLayer = originalFullscreenBezelLayer;
          engine.backgroundImageLayer.layer = originalLayer;
          scene.session.mode = originalMode;
          scene.render = originalRender;
        }
        return {
          callbackType: typeof scene.customBackgroundCallback,
          order,
          starfieldDraws
        };
      });
      expect(backgroundRenderOrder.callbackType).toBe("function");
      expect(backgroundRenderOrder.starfieldDraws).toBeGreaterThan(0);
      expect(backgroundRenderOrder.order).toEqual([
        "clear",
        "background-color",
        "custom-background",
        "overlay",
        "background-image",
        "game-objects"
      ]);
      expect(chromeAssetState.bezel).toMatchObject({
        canvasLayoutMode: "normal",
        path: "/games/Asteroids/assets/images/bezel.png",
        visible: false,
        uniformEdgeStretchPx: 10
      });
      expect(chromeAssetState.bezel.stretchConfigPath).toContain("games/Asteroids/game.manifest.json");
      const vectorBattleFontState = await page.evaluate(async () => {
        const obsoletePath = ["/games", "Asteroids", "assets", "fonts", "vector_battle.ttf"].join("/");
        const cssText = await (await fetch("/games/shared/styles/vectorBattleFont.css", { cache: "no-store" })).text();
        const fontResponse = await fetch("/src/assets/fonts/vector_battle/vector_battle.ttf", { cache: "no-store" });
        const oldFontResponse = await fetch(obsoletePath, { cache: "no-store" });
        await document.fonts.load('16px "Vector Battle"');
        return {
          cssUsesNewPath: cssText.includes("/src/assets/fonts/vector_battle/vector_battle.ttf"),
          cssUsesOldPath: cssText.includes(obsoletePath),
          fontReady: document.fonts.check('16px "Vector Battle"'),
          fontResponseOk: fontResponse.ok,
          oldFontResponseOk: oldFontResponse.ok
        };
      });
      expect(vectorBattleFontState).toEqual({
        cssUsesNewPath: true,
        cssUsesOldPath: false,
        fontReady: true,
        fontResponseOk: true,
        oldFontResponseOk: false
      });

      const invalidRuntimeAssetResult = await page.evaluate(async () => {
        const { default: ObjectVectorRuntimeAssetService } = await import("/src/engine/rendering/ObjectVectorRuntimeAssetService.js");
        const messages = [];
        const service = new ObjectVectorRuntimeAssetService({
          logger: {
            write(message) {
              messages.push(message);
            }
          }
        });
        const assetSet = await service.loadPayload({
          name: "Invalid Runtime Payload",
          objects: [
            {
              id: "object.runtime.invalid",
              name: "Runtime Invalid",
              shapes: [
                {
                  geometry: {},
                  tool: "triangle",
                  locked: false,
                  order: 0,
                  style: { fill: "#ffffff", fillOpacity: 1, stroke: "#ffffff", strokeOpacity: 1, strokeWidth: 1 },
                  transform: { shapeOrigin: { x: 0, y: 0 }, rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
                  visible: true
                }
              ],
              tags: []
            }
          ],
          toolId: "object-vector-studio-v2",
          version: 1
        }, { sourceLabel: "playwright invalid runtime asset" });
        return {
          assetSetLoaded: Boolean(assetSet),
          messages
        };
      });
      expect(invalidRuntimeAssetResult.assetSetLoaded).toBe(false);
      expect(invalidRuntimeAssetResult.messages.join("\n")).toContain("FAIL Object Vector runtime asset validation failed from playwright invalid runtime asset: root.objects[0].shapes[0] must match exactly one Object Vector Studio V2 shape schema.");

      await page.evaluate(() => {
        const scene = window.__asteroidsNewEngine.scene;
        scene.session.mode = "menu";
        scene.attractController.active = true;
        scene.attractAdapter.enter();
        scene.attractAdapter.setPhase("title");
      });
      await page.waitForFunction(() => {
        const counts = window.__asteroidsObjectVectorRuntime?.renderCounts || {};
        return counts.ship > 0
          && counts.asteroids > 0;
      });
      await page.evaluate(() => {
        const scene = window.__asteroidsNewEngine.scene;
        scene.attractAdapter.setPhase("demo");
        scene.attractAdapter.startDemo();
      });
      await page.waitForFunction(() => {
        const messages = (window.__asteroidsObjectVectorRuntime?.events || [])
          .map((entry) => entry.message)
          .join("\n");
        return messages.includes("Object Vector runtime cache miss for object.asteroids.large-asteroid; cached resolved object.")
          && messages.includes("Object Vector runtime cache miss for object.asteroids.medium-asteroid; cached resolved object.")
          && messages.includes("Object Vector runtime cache miss for object.asteroids.small-asteroid; cached resolved object.");
      });
      await page.waitForFunction(() => {
        const counts = window.__asteroidsObjectVectorRuntime?.renderCounts || {};
        return counts.ufo > 0;
      });

      await page.evaluate(() => {
        const scene = window.__asteroidsNewEngine.scene;
        scene.session.start(1);
        scene.world.ufo = scene.world.createUfoEntity("small", scene.world.wave);
        scene.world.bullets = [scene.world.createBulletFromState({
          x: 480,
          y: 360,
          vx: 0,
          vy: 0,
          life: 1
        })];
      });
      await page.waitForFunction(() => {
        const counts = window.__asteroidsObjectVectorRuntime?.renderCounts || {};
        return counts.asteroids > 0 && counts.ship > 0 && counts.ufo > 0
          && counts.bullet > 0;
      });

      const diagnostics = await page.evaluate(() => window.__asteroidsObjectVectorRuntime);
      const runtimeObjectValidation = await page.evaluate(() => window.__asteroidsNewEngine.scene.objectVectorRuntimeObjectValidation);
      const missingRuntimeObjectValidation = await page.evaluate(async () => {
        const { ASTEROIDS_OBJECT_GEOMETRY_IDS, validateAsteroidsRuntimeObjectIds } = await import("/games/Asteroids/game/asteroidsObjectGeometryManifest.js");
        const scene = window.__asteroidsNewEngine.scene;
        const objectsById = new Map(scene.objectVectorAssets.payload.objects
          .filter((object) => object.id !== ASTEROIDS_OBJECT_GEOMETRY_IDS.asteroidMedium)
          .map((object) => [object.id, object]));
        return validateAsteroidsRuntimeObjectIds(objectsById);
      });
      expect(diagnostics.loaded).toBe(true);
      expect(diagnostics.assetCount).toBe(7);
      expect(diagnostics.objectCount).toBe(7);
      expect(diagnostics.runtimeObjectsValid).toBe(true);
      expect(runtimeObjectValidation.ok).toBe(true);
      expect(runtimeObjectValidation.objectIds).toContain("object.asteroids.medium-asteroid");
      expect(runtimeObjectValidation.warnings).toEqual([]);
      const runtimeRounding = await page.evaluate(() => {
        const scene = window.__asteroidsNewEngine.scene;
        const runtime = scene.objectVectorRuntime;
        const assetSet = scene.objectVectorAssets;
        const svgResult = runtime.createSvgString(assetSet, {
          objectId: "object.asteroids.ship",
          stateId: "idle"
        });
        const commands = [];
        const context = {
          save() {},
          restore() {},
          translate() {},
          rotate() {},
          scale() {},
          beginPath() {
            commands.push({ type: "beginPath" });
          },
          moveTo(x, y) {
            commands.push({ type: "moveTo", x, y });
          },
          lineTo(x, y) {
            commands.push({ type: "lineTo", x, y });
          },
          quadraticCurveTo(cx, cy, x, y) {
            commands.push({ type: "quadraticCurveTo", cx, cy, x, y });
          },
          closePath() {
            commands.push({ type: "closePath" });
          },
          rect() {},
          arc() {},
          ellipse() {},
          fill() {},
          stroke() {},
          fillText() {}
        };
        const renderResult = runtime.renderObject({ ctx: context }, assetSet, {
          objectId: "object.asteroids.ship",
          stateId: "idle"
        });
        return {
          renderResult,
          roundedCanvasCommandCount: commands.filter((command) => command.type === "quadraticCurveTo").length,
          roundedSvgPath: svgResult.svg.includes('data-runtime-rounded-point-render="path"'),
          svgHasQuadraticCurve: /\bQ\b/.test(svgResult.svg),
          svgOk: svgResult.ok
        };
      });
      expect(runtimeRounding).toMatchObject({
        roundedSvgPath: false,
        svgHasQuadraticCurve: false,
        svgOk: true
      });
      expect(runtimeRounding.renderResult.ok).toBe(true);
      expect(runtimeRounding.roundedCanvasCommandCount).toBe(0);
      expect(missingRuntimeObjectValidation.ok).toBe(false);
      expect(missingRuntimeObjectValidation.errors.some((entry) => entry.message.includes("object.asteroids.medium-asteroid"))).toBe(true);
      expect(diagnostics.renderCounts.asteroids).toBeGreaterThan(0);
      expect(diagnostics.renderCounts.bullet).toBeGreaterThan(0);
      expect(diagnostics.renderCounts.ship).toBeGreaterThan(0);
      expect(diagnostics.renderCounts.ufo).toBeGreaterThan(0);
      expect(diagnostics.renderCounts.attractAsteroid).toBeUndefined();
      expect(diagnostics.renderCounts.attractShip).toBeUndefined();
      expect(diagnostics.renderCounts.attractUfo).toBeUndefined();
      expect(diagnostics.objectVectorObjectIds).toEqual(expect.arrayContaining([
        "object.asteroids.bullet",
        "object.asteroids.large-asteroid",
        "object.asteroids.medium-asteroid",
        "object.asteroids.small-asteroid",
        "object.asteroids.large-ufo",
        "object.asteroids.small-ufo",
        "object.asteroids.ship"
      ]));
      const eventMessages = diagnostics.events.map((entry) => entry.message).join("\n");
      expect(eventMessages).toContain("Object Vector runtime asset load from Asteroids game.manifest.json:tools.object-vector-studio-v2: 7 objects.");
      expect(eventMessages).toContain("Object Vector runtime cache miss for object.asteroids.large-asteroid; cached resolved object.");
      expect(eventMessages).toContain("Object Vector runtime cache miss for object.asteroids.medium-asteroid; cached resolved object.");
      expect(eventMessages).toContain("Object Vector runtime cache miss for object.asteroids.small-asteroid; cached resolved object.");
      expect(eventMessages).toContain("Object Vector runtime cache miss for object.asteroids.ship; cached resolved object.");
      expect(eventMessages).toContain("Object Vector runtime cache miss for object.asteroids.large-ufo; cached resolved object.");
      expect(eventMessages).toContain("Object Vector runtime cache miss for object.asteroids.small-ufo; cached resolved object.");
      expect(eventMessages).toContain("Object Vector runtime frame resolved: object.asteroids.ship idle/frame-1.");
      expect(eventMessages).toContain("Object Vector runtime rendered object.asteroids.ship: 1 shapes state=idle frame=frame-1.");
      expect(eventMessages).toContain("Object Vector runtime rendered object.asteroids.small-ufo: 2 shapes state=active frame=frame-1.");
      expect(eventMessages).not.toContain("matched multiple objects by tags");
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
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
        const sectionProbeA = document.createElement("section");
        const sectionProbeB = document.createElement("section");
        sectionProbeA.style.cssText = "position:absolute;left:-10000px;top:-10000px;visibility:hidden;";
        sectionProbeB.style.cssText = "position:absolute;left:-10000px;top:-10000px;visibility:hidden;";
        document.body.append(sectionProbeA, sectionProbeB);
        const hubSectionMarginTop = Number.parseFloat(getComputedStyle(sectionProbeB).marginTop);
        sectionProbeA.remove();
        sectionProbeB.remove();
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
          hubSectionMarginTop,
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
      expect(themeContract.hubSectionMarginTop).toBe(12);
      expect(themeContract.shellBorder).toBe(themeContract.expectedLine);
      expect(themeContract.panelBackground).toBe(themeContract.expectedPanel);
      expect(themeContract.summaryBackground).toBe(themeContract.expectedPanel);
      expect(themeContract.textareaBackground).toBe(themeContract.expectedInputBackground);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("shows safe empty Text to Speech V2 state when no JSON source is provided", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1100 });
    const server = await openTextToSpeechTool(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("body[data-tool-id='text2speech-V2']")).toBeVisible();
      await expect(page.locator('.palette-manager-v2__menu-sample[data-launch-mode-nav="tool"]')).toBeVisible();
      await expect(page.locator('.palette-manager-v2__menu-sample[data-launch-mode-nav="tool"]')).toHaveAttribute("aria-label", "menuSample");
      await expect(page.locator('.palette-manager-v2__menu-sample[data-launch-mode-nav="tool"] button')).toHaveText(["Import JSON", "Copy JSON", "Export JSON"]);
      await expect(page.locator('.palette-manager-v2__menu-sample[data-launch-mode-nav="workspace"]')).toBeHidden();
      await expect(page.locator(".text2speech-V2__tool__menu")).toHaveCount(0);
      await expect(page.locator(".text2speech-V2__workspace-menu")).toHaveCount(0);
      await expect(page.locator(".text2speech-V2__menu")).toHaveCount(0);
      const fittedPageScrollState = await page.evaluate(() => ({
        bodyOverflowY: getComputedStyle(document.body).overflowY,
        hasPageScrollbar: document.documentElement.scrollHeight > document.documentElement.clientHeight
      }));
      expect(fittedPageScrollState).toEqual({
        bodyOverflowY: "auto",
        hasPageScrollbar: false
      });
      const forcedPageScrollState = await page.evaluate(() => {
        const spacer = document.createElement("div");
        spacer.id = "text2speech-V2ScrollbarProbe";
        spacer.style.height = "1200px";
        spacer.style.flex = "0 0 auto";
        document.body.append(spacer);
        return {
          bodyOverflowY: getComputedStyle(document.body).overflowY,
          hasPageScrollbar: document.documentElement.scrollHeight > document.documentElement.clientHeight
        };
      });
      expect(forcedPageScrollState).toEqual({
        bodyOverflowY: "auto",
        hasPageScrollbar: true
      });
      await page.locator("#text2speech-V2ScrollbarProbe").evaluate((element) => element.remove());
      await expect(page.locator("#text2speech-V2QueueTiles [data-speech-item-id]")).toHaveCount(0);
      await expect(page.locator("#text2speech-V2SpeechText")).toHaveValue("");
      await expect(page.locator("#text2speech-V2SpeechItemName")).toHaveValue("");
      await expect(page.locator("#text2speech-V2SpeakButton")).toBeDisabled();
      await expect(page.locator("#text2speech-V2PauseButton")).toBeDisabled();
      await expect(page.locator("#text2speech-V2ResumeButton")).toBeDisabled();
      await expect(page.locator("#text2speech-V2StopButton")).toBeDisabled();
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Text to Speech V2 empty launch: no samplePresetPath URL JSON source, workspace payload, or imported JSON is loaded\. Use Import JSON or open a sample JSON source to load named speech items\./);
      await expect(page.locator("#text2speech-V2StatusLog")).not.toHaveValue(/Text to Speech V2 default queue|Loaded 3 schema-complete/);
      const statusLogLayout = await page.locator("#text2speech-V2StatusLogContent").evaluate((content) => {
        const log = content.querySelector("#text2speech-V2StatusLog");
        const contentRect = content.getBoundingClientRect();
        const logRect = log.getBoundingClientRect();
        const contentStyle = getComputedStyle(content);
        const logStyle = getComputedStyle(log);
        const paddingBottom = Number.parseFloat(contentStyle.paddingBottom || "0");
        const paddingTop = Number.parseFloat(contentStyle.paddingTop || "0");
        const innerHeight = content.clientHeight - paddingTop - paddingBottom;
        return {
          contentOverflowY: contentStyle.overflowY,
          logFlexGrow: logStyle.flexGrow,
          logHeight: Math.round(logRect.height),
          logOverflowY: logStyle.overflowY,
          logResize: logStyle.resize,
          statusContentInnerHeight: Math.round(innerHeight),
          unusedBottomSpace: Math.round(contentRect.bottom - logRect.bottom - paddingBottom)
        };
      });
      expect(statusLogLayout).toMatchObject({
        contentOverflowY: "hidden",
        logFlexGrow: "1",
        logOverflowY: "auto",
        logResize: "none"
      });
      expect(statusLogLayout.logHeight).toBeGreaterThanOrEqual(statusLogLayout.statusContentInnerHeight - 2);
      expect(statusLogLayout.unusedBottomSpace).toBeLessThanOrEqual(2);
      const statusLogScrollState = await page.locator("#text2speech-V2StatusLog").evaluate((log) => {
        const pageHadScrollbarBefore = document.documentElement.scrollHeight > document.documentElement.clientHeight;
        log.value = Array.from({ length: 80 }, (_, index) => `OK Status log overflow probe ${index + 1}`).join("\n");
        log.scrollTop = log.scrollHeight;
        return {
          internalScrollHeight: log.scrollHeight,
          pageHasScrollbarAfter: document.documentElement.scrollHeight > document.documentElement.clientHeight,
          pageHadScrollbarBefore,
          statusHasInternalScrollbar: log.scrollHeight > log.clientHeight,
          statusScrolledInternally: log.scrollTop > 0
        };
      });
      expect(statusLogScrollState.statusHasInternalScrollbar).toBe(true);
      expect(statusLogScrollState.statusScrolledInternally).toBe(true);
      expect(statusLogScrollState.pageHadScrollbarBefore).toBe(false);
      expect(statusLogScrollState.pageHasScrollbarAfter).toBe(false);
      await page.locator("#text2speech-V2ClearStatusButton").click();
      const emptySummary = JSON.parse(await page.locator("#text2speech-V2SpeechSummary").textContent());
      expect(emptySummary).toEqual([]);
      await page.locator("#text2speech-V2AddItemButton").click();
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/FAIL Text to Speech V2 Add blocked: Name is required before creating a named speech item\./);
      await expect(page.locator("#text2speech-V2QueueTiles [data-speech-item-id]")).toHaveCount(0);
      await page.locator("#text2speech-V2SpeechItemName").fill("Draft empty state line");
      await expect(page.locator("#text2speech-V2StatusLog")).not.toHaveValue(/FAIL Text to Speech V2 name update failed: no named speech item is selected\./);
      await page.locator("#text2speech-V2AddItemButton").click();
      await expect(page.locator("#text2speech-V2QueueTiles [data-speech-item-id]")).toHaveCount(1);
      await expect(page.locator('[data-speech-item-id="draft-empty-state-line"] .text2speech-V2__queue-tile-name')).toHaveText("Draft empty state line");
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("generates Palette Manager V2 harmony schemes and adds non-duplicate colors", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await workspaceV2CoverageReporter.start(page);
      await page.goto(`${server.baseUrl}/tools/palette-manager-v2/index.html`, { waitUntil: "networkidle" });
      await expect(page.locator(".palette-manager-v2.app-shell")).toBeVisible();
      await expect(page.locator("#harmonyColorList")).toContainText("Select a user or source swatch.");
      await expect(page.locator("#addSelectedHarmonyButton")).toBeDisabled();
      await expect(page.locator("#addAllHarmonyButton")).toBeDisabled();
      const selectedPreviewBox = await page.locator("#selectedSwatchPreview").boundingBox();
      expect(Math.round(selectedPreviewBox.width)).toBe(30);
      expect(Math.round(selectedPreviewBox.height)).toBe(30);

      await page.locator("#swatchSymbolInput").fill("R");
      await page.locator("#swatchHexInput").fill("#FF0000");
      await page.locator("#swatchNameInput").fill("Harmony Base Red");
      await page.locator("#addSwatchButton").click();
      await expect(page.locator("#userPaletteCount")).toHaveText("1 user swatches");
      await expect(page.locator("#harmonySchemeSelect")).toHaveValue("achromatic");

      await page.locator("#harmonyMatchSourceSelect").selectOption("calculated");
      await page.locator("#harmonySchemeSelect").selectOption("complementary");
      const calculatedHarmonyTile = page.locator("#harmonyColorList [data-harmony-index='0']");
      await expect(calculatedHarmonyTile).toHaveAttribute("data-harmony-hex", "#00FFFF");
      await expect(calculatedHarmonyTile).toHaveAttribute("data-harmony-label", "Complementary - +180 deg");
      await expect(calculatedHarmonyTile).toHaveAttribute("title", /Name: Complementary - \+180 deg[\s\S]*Hex: #00FFFF/);
      await expect(calculatedHarmonyTile).toHaveText("");
      const calculatedHarmonyTileBox = await calculatedHarmonyTile.boundingBox();
      expect(Math.round(calculatedHarmonyTileBox.width)).toBe(40);
      expect(Math.round(calculatedHarmonyTileBox.height)).toBe(40);
      await page.locator("#addSelectedHarmonyButton").click();
      await expect(page.locator("#userPaletteCount")).toHaveText("2 user swatches");
      await expect(page.locator("#paletteStatus")).toHaveText(/OK Added selected harmony color/);
      await expect.poll(async () => {
        return page.evaluate(() => window.paletteManagerV2App.getPaletteValue().swatches.at(-1).name);
      }).toBe("Complementary - +180 deg");

      await page.locator('#userSwatchList [aria-label="Edit Harmony Base Red"]').click();
      await expect(page.locator("#harmonyColorList [data-harmony-index='0']")).toHaveAttribute("data-harmony-hex", "#00FFFF");
      await page.locator("#addSelectedHarmonyButton").click();
      await expect(page.locator("#userPaletteCount")).toHaveText("2 user swatches");
      await expect(page.locator("#paletteStatus")).toHaveText(/WARN Harmony color already exists/);

      await page.locator("#harmonySchemeSelect").selectOption("triadic");
      await page.locator("#addAllHarmonyButton").click();
      await expect(page.locator("#userPaletteCount")).toHaveText("4 user swatches");
      await expect(page.locator("#paletteStatus")).toHaveText(/OK Added 2 harmony colors\. Skipped 0 duplicates\./);
      const paletteHexes = await page.evaluate(() => window.paletteManagerV2App.getPaletteValue().swatches.map((swatch) => swatch.hex));
      expect(new Set(paletteHexes).size).toBe(paletteHexes.length);
      expect(paletteHexes).toEqual(expect.arrayContaining(["#FF0000", "#00FFFF", "#00FF00", "#0000FF"]));

      await page.locator('#userSwatchList [aria-label="Edit Harmony Base Red"]').click();
      await page.locator("#harmonySchemeSelect").selectOption("complementary");
      await page.locator("#harmonyMatchSourceSelect").selectOption("source-palette");
      const sourceMatchState = await page.evaluate(() => {
        const formatPaletteName = (value) => String(value || "").trim().replace(/^([a-z])/, (letter) => letter.toUpperCase());
        const sourceId = document.querySelector("#sourcePaletteSelect").value;
        const harmonyButton = document.querySelector("#harmonyColorList [data-harmony-index='0']");
        const harmonyHex = harmonyButton.dataset.harmonyHex;
        const paletteName = harmonyButton.dataset.harmonyPalette;
        const swatchName = harmonyButton.dataset.harmonySwatchName;
        const label = harmonyButton.dataset.harmonyLabel;
        const readout = harmonyButton.getAttribute("title");
        const ariaLabel = harmonyButton.getAttribute("aria-label");
        const textContent = harmonyButton.textContent;
        const expectedPaletteName = formatPaletteName(window.paletteList.SOURCE_PALETTE_LABELS[sourceId] || sourceId);
        const sourceMatch = (window.paletteList.SOURCE_PALETTES[sourceId] || [])
          .find((swatch) => swatch.hex.toUpperCase() === harmonyHex && swatch.name === swatchName);
        return { ariaLabel, expectedPaletteName, harmonyHex, isFromCurrentSource: Boolean(sourceMatch), label, paletteName, readout, swatchName, textContent };
      });
      expect(sourceMatchState.isFromCurrentSource).toBe(true);
      expect(sourceMatchState.paletteName).toBe(sourceMatchState.expectedPaletteName);
      expect(sourceMatchState.label).toBe(`${sourceMatchState.expectedPaletteName} - ${sourceMatchState.swatchName}`);
      expect(sourceMatchState.label).not.toContain("Closest");
      expect(sourceMatchState.textContent).toBe("");
      expect(sourceMatchState.readout).toContain(`Palette: ${sourceMatchState.expectedPaletteName}`);
      expect(sourceMatchState.readout).toContain(`Name: ${sourceMatchState.swatchName}`);
      expect(sourceMatchState.readout).toContain(`Hex: ${sourceMatchState.harmonyHex}`);
      expect(sourceMatchState.ariaLabel).toContain(sourceMatchState.harmonyHex);

      await page.locator("#harmonyMatchSourceSelect").selectOption("all-palettes");
      const allMatchState = await page.evaluate(() => {
        const formatPaletteName = (value) => String(value || "").trim().replace(/^([a-z])/, (letter) => letter.toUpperCase());
        const harmonyButton = document.querySelector("#harmonyColorList [data-harmony-index='0']");
        const harmonyHex = harmonyButton.dataset.harmonyHex;
        const paletteName = harmonyButton.dataset.harmonyPalette;
        const swatchName = harmonyButton.dataset.harmonySwatchName;
        const label = harmonyButton.dataset.harmonyLabel;
        const readout = harmonyButton.getAttribute("title");
        const textContent = harmonyButton.textContent;
        const allMatch = Object.entries(window.paletteList.SOURCE_PALETTES)
          .flatMap(([sourceId, swatches]) => swatches.map((swatch) => ({ sourceId, swatch })))
          .find(({ sourceId, swatch }) => {
            return swatch.hex.toUpperCase() === harmonyHex
              && swatch.name === swatchName
              && formatPaletteName(window.paletteList.SOURCE_PALETTE_LABELS[sourceId] || sourceId) === paletteName;
          });
        return { harmonyHex, isFromAnySource: Boolean(allMatch), label, paletteName, readout, swatchName, textContent };
      });
      expect(allMatchState.isFromAnySource).toBe(true);
      expect(allMatchState.label).toBe(`${allMatchState.paletteName} - ${allMatchState.swatchName}`);
      expect(allMatchState.label).not.toContain("Closest");
      expect(allMatchState.textContent).toBe("");
      expect(allMatchState.readout).toContain(`Palette: ${allMatchState.paletteName}`);
      expect(allMatchState.readout).toContain(`Name: ${allMatchState.swatchName}`);
      expect(allMatchState.readout).toContain(`Hex: ${allMatchState.harmonyHex}`);

      await page.locator('#userSwatchList [aria-label="Edit Harmony Base Red"]').click();
      await page.locator("#harmonyMatchSourceSelect").selectOption("source-palette");
      await page.locator("#harmonySchemeSelect").selectOption("achromatic");
      const matchedBlackTile = page.locator("#harmonyColorList [data-harmony-index='1']");
      await expect(matchedBlackTile).toHaveAttribute("data-harmony-swatch-name", "Black");
      await expect(matchedBlackTile).toHaveText("");
      await expect(matchedBlackTile).toHaveAttribute("aria-label", /Palette: .*Name: Black.*Hex:/);
      const matchedBlackTileBox = await matchedBlackTile.boundingBox();
      expect(Math.round(matchedBlackTileBox.width)).toBe(40);
      expect(Math.round(matchedBlackTileBox.height)).toBe(40);
      await matchedBlackTile.focus();
      await expect(matchedBlackTile).toBeFocused();
      await matchedBlackTile.click();
      const matchedBlackState = await matchedBlackTile.evaluate((button) => ({
        hex: button.dataset.harmonyHex,
        label: button.dataset.harmonyLabel,
        paletteName: button.dataset.harmonyPalette,
        swatchName: button.dataset.harmonySwatchName
      }));
      await page.locator("#addSelectedHarmonyButton").click();
      await expect(page.locator("#userPaletteCount")).toHaveText("5 user swatches");
      const addedBlackSwatch = await page.evaluate(() => window.paletteManagerV2App.getPaletteValue().swatches.at(-1));
      expect(addedBlackSwatch.hex).toBe(matchedBlackState.hex);
      expect(addedBlackSwatch.name).toBe("Black");
      expect(addedBlackSwatch.name).toBe(matchedBlackState.swatchName);
      expect(addedBlackSwatch.name).not.toContain(matchedBlackState.paletteName);
      expect(matchedBlackState.label).toBe(`${matchedBlackState.paletteName} - Black`);

      await page.locator('#userSwatchList [aria-label="Edit Harmony Base Red"]').click();
      await page.locator("#harmonyMatchSourceSelect").selectOption("source-palette");
      await page.locator("#harmonySchemeSelect").selectOption("achromatic");
      const sourceAchromaticMatches = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("#harmonyColorList [data-harmony-index]"))
          .map((button) => ({
            hex: button.dataset.harmonyHex,
            paletteName: button.dataset.harmonyPalette,
            swatchName: button.dataset.harmonySwatchName
          }));
      });
      const beforeAddAllCount = await page.evaluate(() => window.paletteManagerV2App.getPaletteValue().swatches.length);
      await page.locator("#addAllHarmonyButton").click();
      await expect(page.locator("#paletteStatus")).toHaveText(/OK Added \d+ harmony colors\. Skipped \d+ duplicates\./);
      const addAllNamingState = await page.evaluate((beforeCount) => {
        return window.paletteManagerV2App.getPaletteValue().swatches.slice(beforeCount);
      }, beforeAddAllCount);
      expect(addAllNamingState.length).toBeGreaterThan(0);
      addAllNamingState.forEach((swatch) => {
        const match = sourceAchromaticMatches.find((candidate) => candidate.hex === swatch.hex);
        expect(match).toBeTruthy();
        expect(swatch.name).toBe(match.swatchName);
        expect(swatch.name).not.toContain(match.paletteName);
      });
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("does not redirect legacy Text to Speech V2 path, sample, or schema references", async ({ page }) => {
    const server = await startRepoServer();
    await workspaceV2CoverageReporter.start(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      const legacyResponse = await page.goto(`${server.baseUrl}/tools/text2speach-V2/index.html`, { waitUntil: "networkidle" });
      expect(legacyResponse?.status()).toBe(404);
      await expect(page).not.toHaveURL(/tools\/text2speech-V2\/index\.html/);
      const legacyStatuses = await page.evaluate(async () => ({
        sample: await fetch("/samples/phase-19/1903/sample.1903.text2speach-V2.json", { cache: "no-store" }).then((response) => response.status),
        schema: await fetch("/tools/schemas/tools/text2speach-V2.schema.json", { cache: "no-store" }).then((response) => response.status)
      }));
      expect(legacyStatuses).toEqual({ sample: 404, schema: 404 });
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("loads sample 1903 JSON into Text to Speech V2 through sample wiring", async ({ page }) => {
    const server = await openTextToSpeechSample1903(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page).toHaveURL(/tools\/text2speech-V2\/index\.html/);
      await expect(page).toHaveURL(/samplePresetPath=%2Fsamples%2Fphase-19%2F1903%2Fsample\.1903\.text2speech-V2\.json/);
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Loaded Text to Speech V2 payload source: \/samples\/phase-19\/1903\/sample\.1903\.text2speech-V2\.json\./);
      await expect(page.locator("#text2speech-V2QueueTiles [data-speech-item-id]")).toHaveCount(TEXT_TO_SPEECH_SAMPLE_ITEM_IDS.length);
      const sampleSummary = JSON.parse(await page.locator("#text2speech-V2SpeechSummary").textContent());
      expect(Array.isArray(sampleSummary)).toBe(true);
      expect(sampleSummary.map((item) => item.id)).toEqual(TEXT_TO_SPEECH_SAMPLE_ITEM_IDS);
      expect(JSON.stringify(sampleSummary)).not.toMatch(/queuedSpeechItems|selectedQueueItem|status|\"queue\"/);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("loads Text to Speech V2 from URL JSON with full options, schema-complete queue, and speech actions", async ({ page }) => {
    const server = await openTextToSpeechTool(page, TEXT_TO_SPEECH_SAMPLE_QUERY);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("body[data-tool-id='text2speech-V2']")).toBeVisible();
      await expect(page).toHaveTitle("Text to Speech V2");
      await expect(page.locator("h1")).toHaveText("Text to Speech V2");
      await expect(page.locator(".tool-shell-common__header-frame")).toHaveCount(0);
      await expect(page.locator("[data-text2speech-v2-header] .tools-platform-frame__eyebrow")).toHaveText("Browser speech synthesis");
      await expect(page.locator("[data-text2speech-v2-header] .tools-platform-frame__meta")).toHaveText("Configure voices, helper filters, presets, named sentences, and runtime playback.");
      await expect(page.locator("[data-text2speech-v2-header] .tools-platform-frame__description")).toHaveText("Preview speech lines for narration, prompts, and menu feedback with schema-valid named sentence options.");
      const textToSpeechHeaderLayout = await page.locator("[data-text2speech-v2-header]").evaluate((header) => {
        const frame = header.querySelector(".tools-platform-frame");
        const summary = header.querySelector(".tools-platform-frame__accordion-summary");
        return {
          frameClass: frame?.className || "",
          summaryDisplay: summary ? getComputedStyle(summary).display : "",
          summaryJustify: summary ? getComputedStyle(summary).justifyContent : ""
        };
      });
      expect(textToSpeechHeaderLayout.frameClass).toContain("text2speech-V2__local-shell-frame");
      expect(textToSpeechHeaderLayout.summaryDisplay).toBe("flex");
      expect(textToSpeechHeaderLayout.summaryJustify).toBe("space-between");
      await expect(page.locator('[aria-controls="text2speech-V2TextContent"] > span:first-child')).toHaveText("Text to Speak");
      await expect(page.locator("#text2speech-V2TextContent")).not.toContainText("Speech text");
      await expect(page.locator('[aria-controls="text2speech-V2QueueContent"] > span:first-child')).toHaveText("Named Sentences");
      await expect(page.locator("#text2speech-V2SpeechActions")).toBeVisible();
      await expect(page.locator("#text2speech-V2TextContent > #text2speech-V2SpeechActions")).toBeVisible();
      await expect(page.locator("#text2speech-V2QueueContent > #text2speech-V2SpeechActions")).toHaveCount(0);
      await expect(page.locator('.palette-manager-v2__menu-sample[data-launch-mode-nav="tool"]')).toBeVisible();
      await expect(page.locator('.palette-manager-v2__menu-sample[data-launch-mode-nav="tool"]')).toHaveAttribute("aria-label", "menuSample");
      await expect(page.locator('.palette-manager-v2__menu-sample[data-launch-mode-nav="tool"] button')).toHaveText(["Import JSON", "Copy JSON", "Export JSON"]);
      await expect(page.locator('.palette-manager-v2__menu-sample[data-launch-mode-nav="workspace"]')).toBeHidden();
      await expect(page.locator(".text2speech-V2__tool__menu")).toHaveCount(0);
      await expect(page.locator(".text2speech-V2__workspace-menu")).toHaveCount(0);
      await expect(page.locator(".text2speech-V2__menu")).toHaveCount(0);
      const pageScrollState = await page.evaluate(() => {
        const probe = document.createElement("div");
        probe.style.cssText = "height: 1200px; width: 1px; flex: 0 0 auto;";
        document.body.append(probe);
        window.scrollTo(0, 200);
        const bodyStyle = getComputedStyle(document.body);
        const htmlStyle = getComputedStyle(document.documentElement);
        const state = {
          bodyOverflowY: bodyStyle.overflowY,
          clientHeight: document.documentElement.clientHeight,
          htmlOverflowY: htmlStyle.overflowY,
          scrollHeight: document.documentElement.scrollHeight,
          scrollY: window.scrollY
        };
        probe.remove();
        window.scrollTo(0, 0);
        return state;
      });
      expect(pageScrollState.bodyOverflowY).toBe("auto");
      expect(pageScrollState.htmlOverflowY).not.toBe("hidden");
      expect(pageScrollState.scrollHeight).toBeGreaterThan(pageScrollState.clientHeight);
      expect(pageScrollState.scrollY).toBeGreaterThan(0);
      await expect(page.locator("#text2speech-V2SpeechPreview")).toHaveCount(0);
      await expect(page.locator("#text2speech-V2SpeechText")).toHaveValue("Welcome to Toolbox Aid. This is the default Text to Speech V2 sample line for previewing narration, prompts, and menu feedback.");
      await expect(page.locator("#text2speech-V2SpeakButton")).toBeEnabled();
      await expect(page.locator("#text2speech-V2PauseButton")).toBeEnabled();
      await expect(page.locator("#text2speech-V2ResumeButton")).toBeEnabled();
      await expect(page.locator("#text2speech-V2StopButton")).toBeEnabled();
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(new RegExp(`OK Loaded ${TEXT_TO_SPEECH_SAMPLE_ITEM_IDS.length} schema-complete Text to Speech V2 queue items\\.`));
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(new RegExp(`OK Loaded Text to Speech V2 payload source: ${TEXT_TO_SPEECH_SAMPLE_PRESET_PATH.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.`));
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(new RegExp(`OK Text to Speech V2 schema validation result: tools\\/schemas\\/tools\\/text2speech-V2\\.schema\\.json valid; queue=${TEXT_TO_SPEECH_SAMPLE_ITEM_IDS.length}\\.`));
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Loaded 4 matching SpeechSynthesis voices for Text to Speech V2 \(22 voices; 18 languages; gender=Any; age=Any; language=en-US\)\./);
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Text to Speech V2 ready\. SpeechSynthesis is available\./);
      await expect(page.locator("#text2speech-V2QueueSelect")).toHaveCount(0);
      expect(await page.locator("#text2speech-V2QueueTiles [data-speech-item-id]").evaluateAll((tiles) => tiles.map((tile) => tile.dataset.speechItemId))).toEqual(TEXT_TO_SPEECH_SAMPLE_ITEM_IDS);
      expect(await page.locator("#text2speech-V2SpeechOptionsContent label").evaluateAll((labels) => labels.map((label) => label.getAttribute("for")))).toEqual([
        "text2speech-V2GenderFilterSelect",
        "text2speech-V2LanguageSelect",
        "text2speech-V2VoiceSelect",
        "text2speech-V2AgeFilterSelect",
        "text2speech-V2CharacterPresetSelect",
        "text2speech-V2SsmlLikePresetSelect",
        "text2speech-V2VolumeSlider",
        "text2speech-V2RateSlider",
        "text2speech-V2PitchSlider",
        "text2speech-V2SpeechItemName"
      ]);
      expect(await page.locator("#text2speech-V2SpeechActions button").evaluateAll((buttons) => buttons.map((button) => button.id))).toEqual([
        "text2speech-V2SpeakButton",
        "text2speech-V2PauseButton",
        "text2speech-V2ResumeButton",
        "text2speech-V2StopButton"
      ]);
      const textAccordionLayout = await page.locator("#text2speech-V2TextContent").evaluate((content) => {
        const textarea = content.querySelector("#text2speech-V2SpeechText");
        const actions = content.querySelector("#text2speech-V2SpeechActions");
        const contentRect = content.getBoundingClientRect();
        const textareaRect = textarea.getBoundingClientRect();
        const fieldRect = textarea.closest(".text2speech-V2__field").getBoundingClientRect();
        const actionsRect = actions.getBoundingClientRect();
        const contentStyle = getComputedStyle(content);
        const actionsStyle = getComputedStyle(actions);
        const rowGap = Number.parseFloat(contentStyle.rowGap || contentStyle.gap || "0");
        const paddingTop = Number.parseFloat(contentStyle.paddingTop || "0");
        const paddingBottom = Number.parseFloat(contentStyle.paddingBottom || "0");
        const expectedContentHeight = fieldRect.height + actionsRect.height + rowGap + paddingTop + paddingBottom;
        return {
          actionsAreBottomControl: content.lastElementChild?.id === "text2speech-V2SpeechActions",
          actionsBelowText: actionsRect.top >= textareaRect.bottom,
          actionsBottomPadding: Math.round(contentRect.bottom - actionsRect.bottom),
          actionsJustify: actionsStyle.justifyContent,
          actionsPaddingBottom: actionsStyle.paddingBottom,
          contentHeight: Math.round(contentRect.height),
          contentOverflowY: contentStyle.overflowY,
          contentExcessHeight: Math.round(contentRect.height - expectedContentHeight),
          contentDisplay: contentStyle.display,
          contentFlexDirection: contentStyle.flexDirection,
          contentJustify: contentStyle.justifyContent,
          fieldMarginBottom: getComputedStyle(textarea.closest(".text2speech-V2__field")).marginBottom,
          fieldFlexGrow: getComputedStyle(textarea.closest(".text2speech-V2__field")).flexGrow,
          textareaFillsField: Math.abs(Math.round(textareaRect.height) - Math.round(fieldRect.height)) <= 2,
          textareaHeight: Math.round(textareaRect.height),
          textareaResize: getComputedStyle(textarea).resize
        };
      });
      expect(textAccordionLayout).toMatchObject({
        actionsAreBottomControl: true,
        actionsBelowText: true,
        actionsBottomPadding: 0,
        actionsJustify: "center",
        actionsPaddingBottom: "12px",
        contentDisplay: "flex",
        contentFlexDirection: "column",
        contentJustify: "flex-end",
        contentOverflowY: "auto",
        fieldMarginBottom: "0px",
        fieldFlexGrow: "1",
        textareaFillsField: true,
        textareaResize: "none"
      });
      expect(textAccordionLayout.contentHeight).toBeGreaterThan(120);
      expect(textAccordionLayout.textareaHeight).toBeGreaterThan(120);
      const namedSentenceTopControls = await page.locator("#text2speech-V2QueueContent").evaluate((content) => {
        const firstElement = Array.from(content.children).find((child) => child.nodeType === Node.ELEMENT_NODE);
        return firstElement?.id || "";
      });
      expect(namedSentenceTopControls).toBe("text2speech-V2QueueTiles");
      const namedSentenceLayout = await page.locator("#text2speech-V2QueueContent").evaluate((content) => {
        const tiles = content.querySelector("#text2speech-V2QueueTiles");
        const contentRect = content.getBoundingClientRect();
        const tilesRect = tiles.getBoundingClientRect();
        const contentStyle = getComputedStyle(content);
        const paddingTop = Number.parseFloat(contentStyle.paddingTop || "0");
        const paddingBottom = Number.parseFloat(contentStyle.paddingBottom || "0");
        return {
          contentOverflowY: contentStyle.overflowY,
          contentExcessHeight: Math.round(contentRect.height - tilesRect.height - paddingTop - paddingBottom),
          unusedBottomSpace: Math.round(contentRect.bottom - tilesRect.bottom - paddingBottom)
        };
      });
      expect(namedSentenceLayout.contentOverflowY).toBe("auto");
      expect(namedSentenceLayout.contentExcessHeight).toBeGreaterThanOrEqual(0);
      expect(namedSentenceLayout.unusedBottomSpace).toBeGreaterThanOrEqual(0);
      expect(await page.locator("#text2speech-V2SpeechOptionsContent .text2speech-V2__item-actions button").evaluateAll((buttons) => buttons.map((button) => button.textContent.trim()))).toEqual(["Add", "Duplicate", "Delete"]);
      expect(await page.locator("#text2speech-V2SpeechOptionsContent .text2speech-V2__item-actions").evaluate((actions) => getComputedStyle(actions).justifyContent)).toBe("center");
      const statusHeaderOrder = await page.locator(".text2speech-V2__status-accordion-header").evaluate((header) => Array.from(header.querySelectorAll(":scope > span, :scope > div > span, :scope > div > button"), (element) => element.textContent.trim()));
      expect(statusHeaderOrder).toEqual(["Status", "+", "Clear"]);
      expect(await page.locator("#text2speech-V2GenderFilterSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEECH_GENDER_FILTER_VALUES);
      expect(await page.locator("#text2speech-V2AgeFilterSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEECH_AGE_FILTER_VALUES);
      expect(await page.locator("#text2speech-V2LanguageSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEECH_LANGUAGE_VALUES);
      expect(await page.locator("#text2speech-V2VoiceSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEECH_EN_US_VOICE_VALUES);
      await expect(page.locator("#text2speech-V2VoiceDetails")).toHaveText(MOCK_TEXT2SPEECH_EN_US_DETAILS);
      await expect(page.locator("#text2speech-V2QueueModeSelect")).toHaveCount(0);
      await expect(page.locator("#text2speech-V2SpeechOptionsContent")).not.toContainText("Queue mode");
      expect(await page.locator("#text2speech-V2SpeechOptionsContent").evaluate((content) => getComputedStyle(content).overflowY)).toBe("auto");
      await expect(page.locator("#text2speech-V2RepeatCountSelect")).toHaveCount(0);
      await expect(page.locator("#text2speech-V2DelayBetweenRepeatsMsSlider")).toHaveCount(0);
      expect(await page.locator("#text2speech-V2CharacterPresetSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(["manual", "alert", "calm", "dnd-dungeon-master", "dramatic", "narrator", "robot"]);
      await expect(page.locator("#text2speech-V2CharacterPresetSelect option[value='dnd-dungeon-master']")).toHaveText("D&D Dungeon Master");
      expect(await page.locator("#text2speech-V2SsmlLikePresetSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(["normal", "slow", "whisper-ish"]);
      await expect(page.locator("#text2speech-V2CharacterPresetSelect")).toHaveValue("narrator");
      await expect(page.locator("#text2speech-V2SsmlLikePresetSelect")).toHaveValue("normal");
      await expect(page.locator("#text2speech-V2AutoSpeakCheckbox")).toHaveCount(0);
      await expect(page.locator("body")).not.toContainText(/multi[- ]?thread|threaded|parallel speech|at the same time/i);
      await expect(page.locator("#text2speech-V2VolumeSlider")).toHaveAttribute("min", "0");
      await expect(page.locator("#text2speech-V2VolumeSlider")).toHaveAttribute("max", "1");
      await expect(page.locator("#text2speech-V2VolumeSlider")).toHaveAttribute("step", "0.01");
      await expect(page.locator("#text2speech-V2VolumeSlider")).toHaveValue("1");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveAttribute("min", "0.1");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveAttribute("max", "2");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveAttribute("step", "0.1");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("1");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveAttribute("min", "0.1");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveAttribute("max", "2");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveAttribute("step", "0.1");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("1");
      const pitchHelperScale = page.locator("#text2speech-V2PitchHelperScale");
      await expect(page.locator("#text2speech-V2PitchSlider + #text2speech-V2PitchHelperScale")).toBeVisible();
      await expect(pitchHelperScale).toHaveText("Male < Neutral > Female");
      expect(await pitchHelperScale.evaluate((node) => getComputedStyle(node).textAlign)).toBe("center");
      const pitchSliderBox = await page.locator("#text2speech-V2PitchSlider").boundingBox();
      const pitchHelperBox = await pitchHelperScale.boundingBox();
      expect(pitchSliderBox).not.toBeNull();
      expect(pitchHelperBox).not.toBeNull();
      expect(pitchHelperBox.y).toBeGreaterThan(pitchSliderBox.y);
      await expect(page.locator("#text2speech-V2SpeechItemName")).toHaveValue("Narrator welcome");
      const schemaRequiredFields = await page.evaluate(async () => {
        const [schema, assetSchema, paletteSchema] = await Promise.all([
          fetch("/tools/schemas/tools/text2speech-V2.schema.json", { cache: "no-store" }).then((response) => response.json()),
          fetch("/tools/schemas/tools/asset-manager-v2.schema.json", { cache: "no-store" }).then((response) => response.json()),
          fetch("/tools/schemas/tools/palette-manager-v2.schema.json", { cache: "no-store" }).then((response) => response.json())
        ]);
        return {
          assetManagerSchemaType: assetSchema.type,
          characterPresetEnum: schema.$defs.speechQueueItem.properties.characterPreset.enum,
          genderEnum: schema.$defs.speechQueueItem.properties.gender.enum,
          hasAutoSpeak: Object.hasOwn(schema.$defs.speechQueueItem.properties, "autoSpeak"),
          hasDelayBetweenRepeats: Object.hasOwn(schema.$defs.speechQueueItem.properties, "delayBetweenRepeats"),
          hasDelayBetweenRepeatsMs: Object.hasOwn(schema.$defs.speechQueueItem.properties, "delayBetweenRepeatsMs"),
          hasRepeatCount: Object.hasOwn(schema.$defs.speechQueueItem.properties, "repeatCount"),
          itemAdditionalProperties: schema.$defs.speechQueueItem.additionalProperties,
          languagePattern: schema.$defs.speechQueueItem.properties.language.pattern,
          rootItemsRef: schema.items?.$ref,
          rootMinItems: schema.minItems,
          rootType: schema.type,
          pitchMinimum: schema.$defs.speechQueueItem.properties.pitch.minimum,
          hasQueueMode: Object.hasOwn(schema.$defs.speechQueueItem.properties, "queueMode"),
          paletteManagerSchemaType: paletteSchema.type,
          rateMaximum: schema.$defs.speechQueueItem.properties.rate.maximum,
          required: schema.$defs.speechQueueItem.required,
          ssmlLikePresetEnum: schema.$defs.speechQueueItem.properties.ssmlLikePreset.enum,
          volumeMaximum: schema.$defs.speechQueueItem.properties.volume.maximum,
          voiceAgeEnum: schema.$defs.speechQueueItem.properties.voiceAge.enum
        };
      });
      expect(schemaRequiredFields.required).toEqual(REQUIRED_TEXT2SPEECH_OPTION_FIELDS);
      expect(schemaRequiredFields.rootType).toBe("array");
      expect(schemaRequiredFields.rootMinItems).toBeUndefined();
      expect(schemaRequiredFields.rootItemsRef).toBe("#/$defs/speechQueueItem");
      expect(schemaRequiredFields.assetManagerSchemaType).toBe("object");
      expect(schemaRequiredFields.paletteManagerSchemaType).toBe("object");
      expect(schemaRequiredFields.itemAdditionalProperties).toBe(false);
      expect(schemaRequiredFields.characterPresetEnum).toEqual(["manual", "alert", "calm", "dnd-dungeon-master", "dramatic", "narrator", "robot"]);
      expect(schemaRequiredFields.genderEnum).toEqual(MOCK_TEXT2SPEECH_SCHEMA_GENDER_VALUES);
      expect(schemaRequiredFields.languagePattern).toBe("^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$");
      expect(schemaRequiredFields.hasQueueMode).toBe(false);
      expect(schemaRequiredFields.pitchMinimum).toBe(0.1);
      expect(schemaRequiredFields.rateMaximum).toBe(2);
      expect(schemaRequiredFields.volumeMaximum).toBe(1);
      expect(schemaRequiredFields.hasAutoSpeak).toBe(false);
      expect(schemaRequiredFields.hasRepeatCount).toBe(false);
      expect(schemaRequiredFields.hasDelayBetweenRepeats).toBe(false);
      expect(schemaRequiredFields.hasDelayBetweenRepeatsMs).toBe(false);
      expect(schemaRequiredFields.ssmlLikePresetEnum).toEqual(["normal", "slow", "whisper-ish"]);
      expect(schemaRequiredFields.voiceAgeEnum).toEqual(MOCK_TEXT2SPEECH_AGE_FILTER_VALUES);
      const sampleJsonValidation = await page.evaluate(async (samplePresetPath) => {
        const payload = await fetch(samplePresetPath, { cache: "no-store" }).then((response) => response.json());
        const validation = window["__text2speech-V2App"].validatePayload(payload, samplePresetPath);
        return {
          firstItemKeys: Object.keys(payload[0] || {}).sort(),
          hasRootQueue: Object.hasOwn(payload, "queue"),
          isArray: Array.isArray(payload),
          length: Array.isArray(payload) ? payload.length : 0,
          validation
        };
      }, TEXT_TO_SPEECH_SAMPLE_PRESET_PATH);
      expect(sampleJsonValidation).toEqual({
        firstItemKeys: [...REQUIRED_TEXT2SPEECH_OPTION_FIELDS].sort(),
        hasRootQueue: false,
        isArray: true,
        length: TEXT_TO_SPEECH_SAMPLE_ITEM_IDS.length,
        validation: { ok: true }
      });
      expect(await page.evaluate(() => window["__text2speech-V2App"].validatePayload([], "empty Text to Speech V2 root array"))).toEqual({ ok: true });
      const validationSourceCleanup = await page.evaluate(async () => {
        const source = await fetch("/tools/text2speech-V2/js/TextToSpeechToolApp.js", { cache: "no-store" }).then((response) => response.text());
        return {
          hasStaleObjectPayloadFields: source.includes("STALE_OBJECT_PAYLOAD_FIELDS"),
          hasStaleObjectPayloadMessage: source.includes("staleObjectPayloadMessage"),
          hasValidateQueue: source.includes("validateQueue(")
        };
      });
      expect(validationSourceCleanup).toEqual({
        hasStaleObjectPayloadFields: false,
        hasStaleObjectPayloadMessage: false,
        hasValidateQueue: false
      });
      const readySummary = JSON.parse(await page.locator("#text2speech-V2SpeechSummary").textContent());
      expect(readySummary).toHaveLength(TEXT_TO_SPEECH_SAMPLE_ITEM_IDS.length);
      expect(readySummary.queue).toBeUndefined();
      readySummary.forEach((item) => {
        expect(REQUIRED_TEXT2SPEECH_OPTION_FIELDS.every((field) => Object.hasOwn(item, field))).toBe(true);
        expect(Object.hasOwn(item, "queueMode")).toBe(false);
      });
      expect(JSON.stringify(readySummary)).not.toMatch(/queuedSpeechItems|selectedQueueItem|status/);
      const normalAccordionShare = await page.locator(".text2speech-V2__panel--center").evaluate((panel) => {
        const [textPanel, queuePanel] = Array.from(panel.querySelectorAll(".text2speech-V2__accordion"));
        const textRect = textPanel.getBoundingClientRect();
        const queueRect = queuePanel.getBoundingClientRect();
        return {
          heightDelta: Math.abs(Math.round(textRect.height) - Math.round(queueRect.height)),
          queueHeight: Math.round(queueRect.height),
          textHeight: Math.round(textRect.height)
        };
      });
      expect(normalAccordionShare.heightDelta).toBeLessThanOrEqual(4);
      await page.locator('[aria-controls="text2speech-V2TextContent"]').click();
      const collapsedNormalAccordion = await page.locator(".text2speech-V2__panel--center").evaluate((panel) => {
        const [textPanel, queuePanel] = Array.from(panel.querySelectorAll(".text2speech-V2__accordion"));
        const textHeader = textPanel.querySelector(".accordion-v2__header").getBoundingClientRect();
        const textRect = textPanel.getBoundingClientRect();
        const queueRect = queuePanel.getBoundingClientRect();
        const textContent = textPanel.querySelector(".accordion-v2__content");
        return {
          queueHeight: Math.round(queueRect.height),
          textHeight: Math.round(textRect.height),
          textHeaderHeight: Math.round(textHeader.height),
          textCollapsedToHeader: textRect.height <= textHeader.height + 4,
          textContentHidden: textContent.hidden === true
        };
      });
      expect(collapsedNormalAccordion.textContentHidden).toBe(true);
      expect(collapsedNormalAccordion.textHeight).toBeLessThan(normalAccordionShare.textHeight);
      expect(collapsedNormalAccordion.textHeight).toBeLessThanOrEqual(collapsedNormalAccordion.textHeaderHeight + 24);
      expect(collapsedNormalAccordion.queueHeight).toBeGreaterThan(normalAccordionShare.queueHeight);
      await page.locator('[aria-controls="text2speech-V2TextContent"]').click();
      await expectTextToSpeechV2FullscreenShell(page);
      await selectTextToSpeechTile(page, "alert-warning");
      await expect(page.locator("#text2speech-V2SpeechItemName")).toHaveValue("Alert warning");
      await page.locator("#text2speech-V2SpeechItemName").fill("Alert danger");
      await expect(page.locator('[data-speech-item-id="alert-warning"] .text2speech-V2__queue-tile-name')).toHaveText("Alert danger");
      await expect(page.locator("#text2speech-V2SpeechSummary")).toContainText('"name": "Alert danger"');
      await page.locator("#text2speech-V2SpeechItemName").fill("");
      await page.locator("#text2speech-V2AddItemButton").click();
      await expect(page.locator("#text2speech-V2QueueTiles [data-speech-item-id]")).toHaveCount(TEXT_TO_SPEECH_SAMPLE_ITEM_IDS.length);
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/FAIL Text to Speech V2 Add blocked: Name is required before creating a named speech item\./);
      await page.locator("#text2speech-V2SpeechItemName").fill("Alert warning");
      await expect(page.locator("#text2speech-V2SpeechText")).toHaveValue("Warning. Incoming hazard detected. Please confirm the next action.");
      await expect(page.locator("#text2speech-V2GenderFilterSelect")).toHaveValue("any");
      await expect(page.locator("#text2speech-V2LanguageSelect")).toHaveValue("ja-JP");
      await expect(page.locator("#text2speech-V2VoiceSelect")).toHaveValue("mock-google-japanese");
      await expect(page.locator("#text2speech-V2AgeFilterSelect")).toHaveValue("adult");
      await expect(page.locator("#text2speech-V2CharacterPresetSelect")).toHaveValue("alert");
      await expect(page.locator("#text2speech-V2SsmlLikePresetSelect")).toHaveValue("normal");
      await expect(page.locator("#text2speech-V2VolumeSlider")).toHaveValue("0.9");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("1.3");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("0.9");
      await expect(page.locator("#text2speech-V2VoiceDetails")).toHaveText([
        "1 voices match Any:",
        "- ja-JP: Google Japanese"
      ].join("\n"));
      const alertSummary = JSON.parse(await page.locator("#text2speech-V2SpeechSummary").textContent());
      expect(alertSummary).toHaveLength(TEXT_TO_SPEECH_SAMPLE_ITEM_IDS.length);
      expect(alertSummary.find((item) => item.id === "alert-warning")).toMatchObject({
        characterPreset: "alert",
        gender: "any",
        id: "alert-warning",
        language: "ja-JP",
        name: "Alert warning",
        pitch: 0.9,
        rate: 1.3,
        ssmlLikePreset: "normal",
        text: "Warning. Incoming hazard detected. Please confirm the next action.",
        voiceAge: "adult",
        volume: 0.9
      });
      await selectTextToSpeechTile(page, "narrator-welcome");
      await expect(page.locator("#text2speech-V2SpeechText")).toHaveValue("Welcome to Toolbox Aid. This is the default Text to Speech V2 sample line for previewing narration, prompts, and menu feedback.");
      await expect(page.locator("#text2speech-V2GenderFilterSelect")).toHaveValue("any");
      await expect(page.locator("#text2speech-V2LanguageSelect")).toHaveValue("en-US");
      await expect(page.locator("#text2speech-V2VoiceSelect")).toHaveValue("mock-google-us-english");
      await expect(page.locator("#text2speech-V2AgeFilterSelect")).toHaveValue("any");
      await expect(page.locator("#text2speech-V2CharacterPresetSelect")).toHaveValue("narrator");
      await expect(page.locator("#text2speech-V2SpeechItemName")).toHaveValue("Narrator welcome");
      await expect(page.locator("#text2speech-V2VolumeSlider")).toHaveValue("1");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("1");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("1");
      await page.locator("#text2speech-V2SpeakButton").click();
      await expect.poll(async () => (await page.evaluate(() => window["__text2speech-V2Spoken"])).length).toBe(1);
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Speech queued: Narrator welcome; en-US; voice=Google US English; rate=1; pitch=1; volume=1; queuedItems=1\./);
      await page.evaluate(() => {
        window["__text2speech-V2Canceled"] = 0;
        window["__text2speech-V2Paused"] = 0;
        window["__text2speech-V2Resumed"] = 0;
        window["__text2speech-V2Spoken"] = [];
        window["__text2speech-V2App"].engine.resetQueuedSpeechItems();
      });
      await page.locator("#text2speech-V2SpeechText").fill("");
      await expect(page.locator("#text2speech-V2SpeakButton")).toBeDisabled();
      await expect(page.locator("#text2speech-V2PauseButton")).toBeDisabled();
      await expect(page.locator("#text2speech-V2ResumeButton")).toBeDisabled();
      await expect(page.locator("#text2speech-V2StopButton")).toBeDisabled();
      await selectTextToSpeechTile(page, "hero-ready");
      await expect(page.locator("#text2speech-V2SpeechText")).toHaveValue("Systems ready. The hero prompt is queued for an upbeat menu confirmation.");
      await expect(page.locator("#text2speech-V2GenderFilterSelect")).toHaveValue("male-preferred");
      await expect(page.locator("#text2speech-V2LanguageSelect")).toHaveValue("en-GB");
      await expect(page.locator("#text2speech-V2VoiceSelect")).toHaveValue("mock-google-uk-english-male");
      await expect(page.locator("#text2speech-V2AgeFilterSelect")).toHaveValue("teen");
      await expect(page.locator("#text2speech-V2CharacterPresetSelect")).toHaveValue("dramatic");
      await expect(page.locator("#text2speech-V2SpeechItemName")).toHaveValue("Hero ready");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("1.2");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("1.4");
      await page.locator("#text2speech-V2SpeechText").fill("Mission control confirms launch readiness.");
      await expect(page.locator("#text2speech-V2SpeakButton")).toBeEnabled();
      await page.locator("#text2speech-V2AgeFilterSelect").selectOption("child");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("1.3");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("1.6");
      expect(await page.locator("#text2speech-V2LanguageSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEECH_MALE_LANGUAGE_VALUES);
      expect(await page.locator("#text2speech-V2VoiceSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(["mock-google-uk-english-male"]);
      await expect(page.locator("#text2speech-V2VoiceSelect")).toHaveValue("mock-google-uk-english-male");
      await expect(page.locator("#text2speech-V2VoiceDetails")).toHaveText("1 voices match Male:\n- en-GB: Google UK English Male");
      await expect(page.locator("#text2speech-V2SpeakButton")).toBeEnabled();
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Voice Age shaping applied: Child; rate=1\.3; pitch=1\.6\./);
      await page.locator("#text2speech-V2AgeFilterSelect").selectOption("any");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("1.1");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("1.2");
      await expect(page.locator("#text2speech-V2VoiceSelect")).toHaveValue("mock-google-uk-english-male");
      await expect(page.locator("#text2speech-V2SpeakButton")).toBeEnabled();
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Voice Age shaping applied: Any; rate=1\.1; pitch=1\.2\./);
      await page.locator("#text2speech-V2AgeFilterSelect").selectOption("teen");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("1.2");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("1.4");
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Voice Age shaping applied: Teen; rate=1\.2; pitch=1\.4\./);
      await page.locator("#text2speech-V2AgeFilterSelect").selectOption("adult");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("1.1");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("1.2");
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Voice Age shaping applied: Adult; rate=1\.1; pitch=1\.2\./);
      await page.locator("#text2speech-V2AgeFilterSelect").selectOption("elderly");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("0.9");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("1");
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Voice Age shaping applied: Elderly; rate=0\.9; pitch=1\./);
      await page.locator("#text2speech-V2AgeFilterSelect").selectOption("any");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("1.1");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("1.2");
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Voice Age shaping applied: Any; rate=1\.1; pitch=1\.2\./);
      await page.locator("#text2speech-V2GenderFilterSelect").selectOption("any");
      await page.locator("#text2speech-V2LanguageSelect").selectOption("en-US");
      expect(await page.locator("#text2speech-V2VoiceSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEECH_EN_US_VOICE_VALUES);
      await page.locator("#text2speech-V2VoiceSelect").selectOption("mock-microsoft-zira");
      await page.locator("#text2speech-V2GenderFilterSelect").selectOption("male-preferred");
      expect(await page.locator("#text2speech-V2LanguageSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEECH_MALE_LANGUAGE_VALUES);
      expect(await page.locator("#text2speech-V2VoiceSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(["mock-microsoft-david", "mock-microsoft-mark"]);
      await expect(page.locator("#text2speech-V2VoiceSelect")).toHaveValue("mock-microsoft-david");
      await expect(page.locator("#text2speech-V2VoiceDetails")).toHaveText([
        "2 voices match Male:",
        "- en-US: Microsoft David - English (United States)",
        "- en-US: Microsoft Mark - English (United States)"
      ].join("\n"));
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Filtered 2 matching SpeechSynthesis voices for Text to Speech V2 \(4 Male voices from 22 total; 3 languages; gender=Male; age=Any; language=en-US\)\./);
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Filter counts: available languages=3; available voices=4; selected voice=Microsoft David - English \(United States\) \(en-US\); gender is a helper filter only, not a voice transformation\./);
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Voice selection adjusted for Male \/ en-US: Microsoft David - English \(United States\) \(en-US\)\./);
      await page.locator("#text2speech-V2LanguageSelect").selectOption("es-ES");
      await expect(page.locator("#text2speech-V2VoiceSelect option")).toHaveText(["Google espanol (es-ES)"]);
      await expect(page.locator("#text2speech-V2VoiceSelect")).toHaveValue("mock-google-espanol");
      await expect(page.locator("#text2speech-V2VoiceDetails")).toHaveText("1 voices match Male:\n- es-ES: Google espanol");
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Filter counts: available languages=3; available voices=4; selected voice=Google espanol \(es-ES\); gender is a helper filter only, not a voice transformation\./);
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Voice selection adjusted for Male \/ es-ES: Google espanol \(es-ES\)\./);
      await page.locator("#text2speech-V2LanguageSelect").selectOption("en-GB");
      await expect(page.locator("#text2speech-V2VoiceSelect option")).toHaveText(["Google UK English Male (en-GB)"]);
      await expect(page.locator("#text2speech-V2VoiceSelect")).toHaveValue("mock-google-uk-english-male");
      await expect(page.locator("#text2speech-V2VoiceDetails")).toHaveText("1 voices match Male:\n- en-GB: Google UK English Male");
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Voice selection adjusted for Male \/ en-GB: Google UK English Male \(en-GB\)\./);
      await page.locator("#text2speech-V2GenderFilterSelect").selectOption("female-preferred");
      expect(await page.locator("#text2speech-V2LanguageSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEECH_FEMALE_LANGUAGE_VALUES);
      await expect(page.locator("#text2speech-V2VoiceSelect option")).toHaveText(["Google UK English Female (en-GB)"]);
      await expect(page.locator("#text2speech-V2VoiceSelect")).toHaveValue("mock-google-uk-english-female");
      await expect(page.locator("#text2speech-V2VoiceDetails")).toHaveText("1 voices match Female:\n- en-GB: Google UK English Female");
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Filter counts: available languages=2; available voices=2; selected voice=Google UK English Female \(en-GB\); gender is a helper filter only, not a voice transformation\./);
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Voice selection adjusted for Female \/ en-GB: Google UK English Female \(en-GB\)\./);
      await page.locator("#text2speech-V2LanguageSelect").selectOption("en-US");
      await expect(page.locator("#text2speech-V2VoiceSelect option")).toHaveText(["Microsoft Zira - English (United States) (en-US)"]);
      await expect(page.locator("#text2speech-V2VoiceSelect")).toHaveValue("mock-microsoft-zira");
      await expect(page.locator("#text2speech-V2VoiceDetails")).toHaveText("1 voices match Female:\n- en-US: Microsoft Zira - English (United States)");
      await page.locator("#text2speech-V2GenderFilterSelect").selectOption("any");
      await page.locator("#text2speech-V2LanguageSelect").selectOption("en-GB");
      await expect(page.locator("#text2speech-V2VoiceSelect")).toHaveValue("mock-google-uk-english-female");
      await expect(page.locator("#text2speech-V2SpeakButton")).toBeEnabled();
      await page.locator("#text2speech-V2CharacterPresetSelect").selectOption("calm");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("0.8");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("1");
      await expect(page.locator("#text2speech-V2SsmlLikePresetSelect")).toHaveValue("normal");
      await page.locator("#text2speech-V2CharacterPresetSelect").selectOption("dnd-dungeon-master");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("0.8");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("0.5");
      await expect(page.locator("#text2speech-V2SsmlLikePresetSelect")).toHaveValue("normal");
      await page.locator("#text2speech-V2CharacterPresetSelect").selectOption("dramatic");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("1.1");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("1.2");
      await expect(page.locator("#text2speech-V2SsmlLikePresetSelect")).toHaveValue("normal");
      await page.locator("#text2speech-V2CharacterPresetSelect").selectOption("alert");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("1.3");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("0.9");
      await expect(page.locator("#text2speech-V2SsmlLikePresetSelect")).toHaveValue("normal");
      await page.locator("#text2speech-V2CharacterPresetSelect").selectOption("robot");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("0.9");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("0.8");
      await expect(page.locator("#text2speech-V2SsmlLikePresetSelect")).toHaveValue("normal");
      await page.locator("#text2speech-V2CharacterPresetSelect").selectOption("manual");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("1");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("1");
      await expect(page.locator("#text2speech-V2VolumeSlider")).toHaveValue("1");
      await expect(page.locator("#text2speech-V2SsmlLikePresetSelect")).toHaveValue("normal");
      await page.locator("#text2speech-V2CharacterPresetSelect").selectOption("dramatic");
      await page.locator("#text2speech-V2SsmlLikePresetSelect").selectOption("slow");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("0.8");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("1.1");
      await expect(page.locator("#text2speech-V2VolumeSlider")).toHaveValue("0.95");
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK SSML-like preset applied: slow; rate=0\.8; pitch=1\.1; volume=0\.95\./);
      await page.locator("#text2speech-V2RateSlider").fill("1.5");
      await page.locator("#text2speech-V2PitchSlider").fill("1.2");
      await page.locator("#text2speech-V2VolumeSlider").fill("0.8");
      await page.locator("#text2speech-V2AgeFilterSelect").selectOption("child");
      await expect(page.locator("#text2speech-V2RateOutput")).toHaveText("1.5");
      await expect(page.locator("#text2speech-V2PitchOutput")).toHaveText("1.2");
      await expect(page.locator("#text2speech-V2VolumeOutput")).toHaveText("0.8");
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Voice Age shaping applied: Child; rate=1\.5; pitch=1\.2\./);
      await expect(page.locator("#text2speech-V2SpeechSummary")).toContainText('"ssmlLikePreset": "slow"');
      await page.locator("#text2speech-V2SpeakButton").click();
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Speech queued: Hero ready; en-GB; voice=Google UK English Female; rate=1\.5; pitch=1\.2; volume=0\.8; queuedItems=1\./);
      await expect(page.locator("#text2speech-V2SpeechSummary")).not.toContainText('"status"');
      await selectTextToSpeechTile(page, "narrator-welcome");
      await expect(page.locator("#text2speech-V2SpeechText")).toHaveValue("");
      await page.locator("#text2speech-V2SpeechText").fill("Narrator replay line after empty text edit.");
      await expect(page.locator("#text2speech-V2SpeakButton")).toBeEnabled();
      await page.locator("#text2speech-V2SpeakButton").click();
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Speech queued: Narrator welcome; en-US; voice=Google US English; rate=1; pitch=1; volume=1; queuedItems=2\./);
      const spoken = await page.evaluate(() => window["__text2speech-V2Spoken"]);
      expect(spoken).toHaveLength(2);
      expect(spoken[0]).toMatchObject({
        lang: "en-GB",
        pitch: 1.2,
        rate: 1.5,
        text: "Mission control confirms launch readiness.",
        voiceName: "Google UK English Female",
        volume: 0.8
      });
      expect(spoken[1]).toMatchObject({
        lang: "en-US",
        pitch: 1,
        rate: 1,
        text: "Narrator replay line after empty text edit.",
        voiceName: "Google US English",
        volume: 1
      });
      expect(await page.evaluate(() => window["__text2speech-V2Canceled"])).toBe(0);
      const queuedSummary = JSON.parse(await page.locator("#text2speech-V2SpeechSummary").textContent());
      expect(queuedSummary).toHaveLength(TEXT_TO_SPEECH_SAMPLE_ITEM_IDS.length);
      expect(queuedSummary.queue).toBeUndefined();
      expect(await page.evaluate(() => window["__text2speech-V2App"].engine.queuedSpeechItemList())).toHaveLength(2);
      await page.locator("#text2speech-V2PauseButton").click();
      await page.locator("#text2speech-V2ResumeButton").click();
      await page.locator("#text2speech-V2StopButton").click();
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Speech paused\./);
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Speech resumed\./);
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Speech queue stopped: 2 queued item\(s\) cleared\./);
      expect(await page.evaluate(() => window["__text2speech-V2Paused"])).toBe(1);
      expect(await page.evaluate(() => window["__text2speech-V2Resumed"])).toBe(1);
      expect(await page.evaluate(() => window["__text2speech-V2Canceled"])).toBe(1);
      await selectTextToSpeechTile(page, "alert-warning");
      await page.locator("#text2speech-V2SpeakButton").click();
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Speech queued: Alert warning; ja-JP; voice=Google Japanese; rate=1\.3; pitch=0\.9; volume=0\.9; queuedItems=1\./);
      expect(await page.evaluate(() => window["__text2speech-V2Canceled"])).toBe(1);
      await expect(page.locator(".text2speech-V2__status-accordion-header")).toHaveAttribute("aria-expanded", "true");
      await page.locator("#text2speech-V2ClearStatusButton").click();
      await expect(page.locator(".text2speech-V2__status-accordion-header")).toHaveAttribute("aria-expanded", "true");
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue("");
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("deletes the last named sentence into a safe empty runtime state", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.__text2speechV2CopiedJson = text;
          }
        }
      });
    });
    const server = await openTextToSpeechTool(page, TEXT_TO_SPEECH_SAMPLE_QUERY);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#text2speech-V2QueueTiles [data-speech-item-id]")).toHaveCount(TEXT_TO_SPEECH_SAMPLE_ITEM_IDS.length);
      for (let index = 0; index < TEXT_TO_SPEECH_SAMPLE_ITEM_IDS.length; index += 1) {
        await page.locator("#text2speech-V2DeleteItemButton").click();
      }
      await expect(page.locator("#text2speech-V2QueueTiles [data-speech-item-id]")).toHaveCount(0);
      await expect(page.locator("#text2speech-V2SpeechItemName")).toHaveValue("");
      await expect(page.locator("#text2speech-V2SpeechText")).toHaveValue("");
      await expect(page.locator("#text2speech-V2SpeakButton")).toBeDisabled();
      await expect(page.locator("#text2speech-V2PauseButton")).toBeDisabled();
      await expect(page.locator("#text2speech-V2ResumeButton")).toBeDisabled();
      await expect(page.locator("#text2speech-V2StopButton")).toBeDisabled();
      expect(JSON.parse(await page.locator("#text2speech-V2SpeechSummary").textContent())).toEqual([]);
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Text to Speech V2 empty state: 0 named speech items\. Add a Name and click Add to create a new item\./);
      await expect(page.locator("#text2speech-V2StatusLog")).not.toHaveValue(/must contain at least 1 item|before playback, export, copy, or workspace save|name update failed/);
      await page.locator("#text2speech-V2CopyJsonButton").click();
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Copied Text to Speech V2 JSON root array to clipboard \(0 items\)\./);
      expect(await page.evaluate(() => JSON.parse(window.__text2speechV2CopiedJson))).toEqual([]);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("imports, copies, and exports standalone Text to Speech V2 root-array JSON", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.__text2speechV2CopiedJson = text;
          }
        }
      });
    });
    const server = await openTextToSpeechTool(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator('.palette-manager-v2__menu-sample[data-launch-mode-nav="tool"]')).toBeVisible();
      await expect(page.locator('.palette-manager-v2__menu-sample[data-launch-mode-nav="tool"]')).toHaveAttribute("aria-label", "menuSample");
      await expect(page.locator('.palette-manager-v2__menu-sample[data-launch-mode-nav="workspace"]')).toBeHidden();
      await expect(page.locator('[data-launch-mode-nav="tool"] button')).toHaveText(["Import JSON", "Copy JSON", "Export JSON"]);
      await expect(page.locator(".text2speech-V2__tool__menu")).toHaveCount(0);
      await expect(page.locator(".text2speech-V2__menu")).toHaveCount(0);

      const importedPayload = [{
        characterPreset: "calm",
        gender: "any",
        id: "imported-root-array-line",
        language: "en-US",
        name: "Imported root array line",
        pitch: 1,
        rate: 0.8,
        ssmlLikePreset: "normal",
        text: "Imported root array text.",
        voice: "mock-google-us-english",
        voiceAge: "adult",
        volume: 0.75
      }];
      await page.locator("#text2speech-V2ImportJsonInput").setInputFiles({
        buffer: Buffer.from(JSON.stringify(importedPayload)),
        mimeType: "application/json",
        name: "text-to-speech-root-array.json"
      });
      await expect(page.locator("#text2speech-V2QueueTiles [data-speech-item-id]")).toHaveCount(1);
      await expect(page.locator("#text2speech-V2SpeechItemName")).toHaveValue("Imported root array line");
      await expect(page.locator("#text2speech-V2SpeechText")).toHaveValue("Imported root array text.");
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Imported 1 Text to Speech V2 item from text-to-speech-root-array\.json; schema validation result: tools\/schemas\/tools\/text2speech-V2\.schema\.json valid\./);
      expect(JSON.parse(await page.locator("#text2speech-V2SpeechSummary").textContent())).toEqual(importedPayload);

      const oldWrappedPayload = {
        queue: importedPayload,
        queuedSpeechItems: [],
        selectedQueueItemId: "imported-root-array-line",
        selectedQueueItemName: "Imported root array line",
        status: "runtime-only"
      };
      await page.locator("#text2speech-V2ImportJsonInput").setInputFiles({
        buffer: Buffer.from(JSON.stringify(oldWrappedPayload)),
        mimeType: "application/json",
        name: "old-wrapped-text-to-speech.json"
      });
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/FAIL Import JSON blocked: Text to Speech V2 payload from old-wrapped-text-to-speech\.json failed tools\/schemas\/tools\/text2speech-V2\.schema\.json validation: root: expected array/);
      await expect(page.locator("#text2speech-V2QueueTiles [data-speech-item-id]")).toHaveCount(1);
      await expect(page.locator("#text2speech-V2SpeechItemName")).toHaveValue("Imported root array line");
      expect(JSON.parse(await page.locator("#text2speech-V2SpeechSummary").textContent())).toEqual(importedPayload);

      const payloadWithQueueMode = [{ ...importedPayload[0], queueMode: "replace" }];
      await page.locator("#text2speech-V2ImportJsonInput").setInputFiles({
        buffer: Buffer.from(JSON.stringify(payloadWithQueueMode)),
        mimeType: "application/json",
        name: "queue-mode-text-to-speech.json"
      });
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/FAIL Import JSON blocked: Text to Speech V2 payload from queue-mode-text-to-speech\.json failed tools\/schemas\/tools\/text2speech-V2\.schema\.json validation: root\[0\]\.queueMode is not allowed/);
      await expect(page.locator("#text2speech-V2QueueTiles [data-speech-item-id]")).toHaveCount(1);
      expect(JSON.parse(await page.locator("#text2speech-V2SpeechSummary").textContent())).toEqual(importedPayload);

      await page.locator("#text2speech-V2CopyJsonButton").click();
      const copiedPayload = await page.evaluate(() => JSON.parse(window.__text2speechV2CopiedJson));
      expect(Array.isArray(copiedPayload)).toBe(true);
      expect(copiedPayload).toEqual(importedPayload);
      expect(copiedPayload.queue).toBeUndefined();
      expect(copiedPayload.status).toBeUndefined();
      expect(copiedPayload.selectedQueueItemId).toBeUndefined();
      expect(JSON.stringify(copiedPayload)).not.toMatch(/queueMode|queuedSpeechItems|selectedQueueItemName|status/);

      const downloadPromise = page.waitForEvent("download");
      await page.locator("#text2speech-V2ExportJsonButton").click();
      const download = await downloadPromise;
      const exportPath = await download.path();
      expect(exportPath).toBeTruthy();
      const exportedPayload = JSON.parse(await readFile(exportPath, "utf8"));
      expect(Array.isArray(exportedPayload)).toBe(true);
      expect(exportedPayload).toEqual(importedPayload);
      expect(exportedPayload.queue).toBeUndefined();
      expect(exportedPayload.status).toBeUndefined();
      expect(exportedPayload.selectedQueueItemId).toBeUndefined();
      expect(JSON.stringify(exportedPayload)).not.toMatch(/queueMode|queuedSpeechItems|selectedQueueItemName|status/);
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Exported Text to Speech V2 JSON root array \(1 item\)\./);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("populates text2speech-V2 voice dropdown when SpeechSynthesis voices arrive after load", async ({ page }) => {
    const server = await openTextToSpeechTool(page, TEXT_TO_SPEECH_SAMPLE_QUERY, { voicesInitiallyAvailable: false });
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#text2speech-V2VoiceSelect option")).toHaveText(["No SpeechSynthesis voices available"]);
      await expect(page.locator("#text2speech-V2VoiceSelect")).toHaveValue("");
      await expect(page.locator("#text2speech-V2SpeakButton")).toBeDisabled();
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/FAIL Text to Speech V2 voice dropdown has no SpeechSynthesis voices; waiting for voiceschanged\. Speak is disabled\./);
      await page.evaluate(() => window["__text2speech-V2LoadVoices"]());
      expect(await page.locator("#text2speech-V2GenderFilterSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEECH_GENDER_FILTER_VALUES);
      expect(await page.locator("#text2speech-V2LanguageSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEECH_LANGUAGE_VALUES);
      await expect(page.locator("#text2speech-V2VoiceSelect option")).toHaveCount(4);
      expect(await page.locator("#text2speech-V2VoiceSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEECH_EN_US_VOICE_VALUES);
      await expect(page.locator("#text2speech-V2VoiceSelect")).toHaveValue("mock-google-us-english");
      await expect(page.locator("#text2speech-V2VoiceDetails")).toHaveText(MOCK_TEXT2SPEECH_EN_US_DETAILS);
      await expect(page.locator("#text2speech-V2SpeakButton")).toBeEnabled();
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Updated 4 matching SpeechSynthesis voices for Text to Speech V2 \(22 voices; 18 languages; gender=Any; age=Any; language=en-US\)\./);
      const summary = JSON.parse(await page.locator("#text2speech-V2SpeechSummary").textContent());
      expect(Array.isArray(summary)).toBe(true);
      expect(summary.find((item) => item.id === "narrator-welcome").voice).toBe("mock-google-us-english");
      expect(JSON.stringify(summary)).not.toMatch(/queuedSpeechItems|selectedQueueItem|status/);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("filters text2speech-V2 voices by Any, Male, Female, and Neutral gender helpers", async ({ page }) => {
    const server = await openTextToSpeechTool(page, TEXT_TO_SPEECH_SAMPLE_QUERY, { includeNeutralVoice: true });
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      expect(await page.locator("#text2speech-V2GenderFilterSelect option").evaluateAll((options) => options.map((option) => option.textContent.trim()))).toEqual(["Any", "Male", "Female", "Neutral"]);
      await page.locator("#text2speech-V2GenderFilterSelect").selectOption("any");
      expect(await page.locator("#text2speech-V2LanguageSelect option").evaluateAll((options) => options.map((option) => option.value))).toContain("en-AU");
      await page.locator("#text2speech-V2GenderFilterSelect").selectOption("male-preferred");
      expect(await page.locator("#text2speech-V2LanguageSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEECH_MALE_LANGUAGE_VALUES);
      await expect(page.locator("#text2speech-V2VoiceDetails")).toHaveText("2 voices match Male:\n- en-US: Microsoft David - English (United States)\n- en-US: Microsoft Mark - English (United States)");
      await page.locator("#text2speech-V2GenderFilterSelect").selectOption("female-preferred");
      expect(await page.locator("#text2speech-V2LanguageSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEECH_FEMALE_LANGUAGE_VALUES);
      await expect(page.locator("#text2speech-V2VoiceDetails")).toHaveText("1 voices match Female:\n- en-US: Microsoft Zira - English (United States)");
      await page.locator("#text2speech-V2GenderFilterSelect").selectOption("neutral");
      expect(await page.locator("#text2speech-V2LanguageSelect option").evaluateAll((options) => options.map((option) => option.value))).toContain("en-AU");
      await page.locator("#text2speech-V2LanguageSelect").selectOption("en-AU");
      await expect(page.locator("#text2speech-V2LanguageSelect")).toHaveValue("en-AU");
      await expect(page.locator("#text2speech-V2VoiceSelect option")).toHaveText(["Studio Neutral English (en-AU)"]);
      await expect(page.locator("#text2speech-V2VoiceSelect")).toHaveValue("mock-studio-neutral-english");
      await expect(page.locator("#text2speech-V2VoiceDetails")).toHaveText("1 voices match Neutral:\n- en-AU: Studio Neutral English");
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Filtered 1 matching SpeechSynthesis voices for Text to Speech V2 \(17 Neutral voices from 23 total; 17 languages; gender=Neutral; age=Any; language=en-AU\)\./);
      await expect(page.locator("#text2speech-V2SpeakButton")).toBeEnabled();
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("shapes text2speech-V2 Voice Age without filtering selected voices", async ({ page }) => {
    const server = await openTextToSpeechTool(page, TEXT_TO_SPEECH_SAMPLE_QUERY, { includeAgeVoice: true });
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await page.locator("#text2speech-V2AgeFilterSelect").selectOption("child");
      await expect(page.locator("#text2speech-V2RateSlider")).toHaveValue("1.2");
      await expect(page.locator("#text2speech-V2PitchSlider")).toHaveValue("1.4");
      expect(await page.locator("#text2speech-V2LanguageSelect option").evaluateAll((options) => options.map((option) => option.value))).toContain("en-AU");
      await expect(page.locator("#text2speech-V2LanguageSelect")).toHaveValue("en-US");
      expect(await page.locator("#text2speech-V2VoiceSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEECH_EN_US_VOICE_VALUES);
      await expect(page.locator("#text2speech-V2VoiceSelect")).toHaveValue("mock-google-us-english");
      await expect(page.locator("#text2speech-V2VoiceDetails")).toHaveText(MOCK_TEXT2SPEECH_EN_US_DETAILS);
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Voice Age shaping applied: Child; rate=1\.2; pitch=1\.4\./);
      await expect(page.locator("#text2speech-V2SpeakButton")).toBeEnabled();
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("rejects Text to Speech V2 workspace payload drift before render or save", async ({ page }) => {
    const server = await openTextToSpeechTool(page, "?launch=workspace&fromTool=workspace-manager-v2&hostContextId=text2speech-v2-invalid-payload");
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      const invalidPayload = {
        $schema: "tools/schemas/tools/text2speech-V2.schema.json",
        schema: "html-js-gaming.text2speech-V2",
        version: 1,
        name: "Invalid Text to Speech V2 queue",
        selectedQueueItemId: "invalid-tts",
        selectedQueueItemName: "Invalid TTS",
        status: "runtime-only",
        queuedSpeechItems: [],
        text: "This root text must not render.",
        queue: [{
          autoSpeak: true,
          characterPreset: "narrator",
          delayBetweenRepeats: 250,
          gender: "any",
          id: "invalid-tts",
          language: "en-US",
          name: "Invalid TTS",
          pitch: 2.5,
          rate: 3,
          repeatCount: 2,
          ssmlLikePreset: "normal",
          text: "This payload must not render.",
          voice: "mock-google-us-english",
          voiceAge: "any",
          volume: 1.5
        }]
      };
      await page.evaluate((payload) => {
        sessionStorage.setItem("workspace.tools.text2speech-V2", JSON.stringify({
          schema: {
            source: "workspace-manager-v2",
            toolId: "text2speech-V2",
            schemaRef: "tools/schemas/tools/text2speech-V2.schema.json"
          },
          workspace: {
            source: "workspace-manager-v2",
            toolId: "text2speech-V2",
            workspaceManifestId: "workspace-manager-v2-Asteroids",
            gameId: "Asteroids",
            gameRoot: "games/Asteroids/",
            assetsPath: "games/Asteroids/assets",
            gameManifestPath: "/games/Asteroids/game.manifest.json",
            repoReferenceKey: "workspace.repo.reference"
          },
          data: payload,
          dirty: {
            isDirty: true,
            reason: "schema-drift-test",
            changedAt: new Date().toISOString(),
            changedKeys: ["queue.invalid-tts"]
          }
        }));
        location.reload();
      }, invalidPayload);
      await expect(page.locator('.palette-manager-v2__menu-sample[data-launch-mode-nav="workspace"]')).toBeVisible();
      await expect(page.locator('.palette-manager-v2__menu-sample[data-launch-mode-nav="workspace"] #returnToWorkspaceButton')).toHaveText("Return to Workspace");
      await expect(page.locator('.palette-manager-v2__menu-sample[data-launch-mode-nav="tool"]')).toBeHidden();
      await expect(page.locator(".text2speech-V2__workspace-menu")).toHaveCount(0);
      await expect(page.locator(".text2speech-V2__menu")).toHaveCount(0);
      await expect(page.locator("#text2speech-V2QueueTiles [data-speech-item-id]")).toHaveCount(0);
      await expect(page.locator("#text2speech-V2SpeechText")).toHaveValue("");
      await expect(page.locator("#text2speech-V2SpeakButton")).toBeDisabled();
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/FAIL Text to Speech V2 payload from \/games\/Asteroids\/game\.manifest\.json failed tools\/schemas\/tools\/text2speech-V2\.schema\.json validation: root: expected array/);
      expect(JSON.parse(await page.locator("#text2speech-V2SpeechSummary").textContent())).toEqual([]);
      await expect(page.locator("#text2speech-V2SpeechSummary")).not.toContainText("This payload must not render.");
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=text2speech-v2-invalid-payload/);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("validates optional Text to Speech V2 schema contract through Workspace Manager V2 toolState", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await installMockSpeechSynthesis(page);
      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expectWorkspaceReturnRehydrated(page);
      const schemaContract = await page.evaluate(async () => {
        const schema = await fetch("/tools/schemas/tools/text2speech-V2.schema.json", { cache: "no-store" }).then((response) => response.json());
        return {
          hasAutoSpeak: Object.hasOwn(schema.$defs.speechQueueItem.properties, "autoSpeak"),
          hasDelayBetweenRepeats: Object.hasOwn(schema.$defs.speechQueueItem.properties, "delayBetweenRepeats"),
          hasQueueMode: Object.hasOwn(schema.$defs.speechQueueItem.properties, "queueMode"),
          hasRepeatCount: Object.hasOwn(schema.$defs.speechQueueItem.properties, "repeatCount"),
          itemAdditionalProperties: schema.$defs.speechQueueItem.additionalProperties,
          rootItemsRef: schema.items?.$ref,
          rootMinItems: schema.minItems,
          rootType: schema.type,
          required: schema.$defs.speechQueueItem.required,
        };
      });
      expect(schemaContract.rootType).toBe("array");
      expect(schemaContract.rootMinItems).toBeUndefined();
      expect(schemaContract.rootItemsRef).toBe("#/$defs/speechQueueItem");
      expect(schemaContract.itemAdditionalProperties).toBe(false);
      expect(schemaContract.required).toEqual(REQUIRED_TEXT2SPEECH_OPTION_FIELDS);
      expect(schemaContract.hasAutoSpeak).toBe(false);
      expect(schemaContract.hasQueueMode).toBe(false);
      expect(schemaContract.hasRepeatCount).toBe(false);
      expect(schemaContract.hasDelayBetweenRepeats).toBe(false);

      const validationMessages = await page.evaluate(async (samplePresetPath) => {
        const app = window.__workspaceManagerV2App;
        const samplePayload = await fetch(samplePresetPath, { cache: "no-store" }).then((response) => response.json());
        const context = structuredClone(app.activeContext);
        context.tools["text2speech-V2"] = samplePayload;
        const cases = [];
        const validate = async (label, mutate) => {
          const nextContext = structuredClone(context);
          mutate(nextContext.tools["text2speech-V2"][0]);
          const result = await app.contextService.validateGeneratedManifest(nextContext);
          cases.push({ label, ok: result.ok, message: result.message });
        };
        await validate("removed-fields", (item) => {
          item.autoSpeak = true;
          item.queueMode = "replace";
          item.repeatCount = 2;
          item.delayBetweenRepeats = 250;
        });
        await validate("required-field", (item) => {
          delete item.voiceAge;
        });
        await validate("enum-field", (item) => {
          item.characterPreset = "parallel";
        });
        await validate("range-field", (item) => {
          item.volume = 1.5;
          item.rate = 3;
          item.pitch = 2.5;
        });
        const oldRootObjectContext = structuredClone(context);
        oldRootObjectContext.tools["text2speech-V2"] = {
          gender: "any",
          queue: samplePayload,
          selectedQueueItemId: "narrator-welcome",
          selectedQueueItemName: "Narrator welcome",
          status: "runtime-only"
        };
        const oldRootObjectResult = await app.contextService.validateGeneratedManifest(oldRootObjectContext);
        cases.push({ label: "old-root-object", ok: oldRootObjectResult.ok, message: oldRootObjectResult.message });
        const emptyArrayContext = structuredClone(context);
        emptyArrayContext.tools["text2speech-V2"] = [];
        const emptyArrayResult = await app.contextService.validateGeneratedManifest(emptyArrayContext);
        cases.push({ label: "empty-array", ok: emptyArrayResult.ok, message: emptyArrayResult.message });
        await validate("valid-base", () => {});
        return cases;
      }, TEXT_TO_SPEECH_SAMPLE_PRESET_PATH);
      expect(validationMessages.find((entry) => entry.label === "valid-base")).toMatchObject({ ok: true });
      expect(validationMessages.find((entry) => entry.label === "empty-array")).toMatchObject({ ok: true });
      expect(validationMessages.find((entry) => entry.label === "old-root-object").message).toMatch(/root\.tools\.text2speech-V2: expected array/);
      expect(validationMessages.find((entry) => entry.label === "removed-fields").message).toMatch(/root\.tools\.text2speech-V2\[0\]\.autoSpeak is not allowed/);
      expect(validationMessages.find((entry) => entry.label === "removed-fields").message).toMatch(/root\.tools\.text2speech-V2\[0\]\.queueMode is not allowed/);
      expect(validationMessages.find((entry) => entry.label === "removed-fields").message).toMatch(/root\.tools\.text2speech-V2\[0\]\.repeatCount is not allowed/);
      expect(validationMessages.find((entry) => entry.label === "removed-fields").message).toMatch(/root\.tools\.text2speech-V2\[0\]\.delayBetweenRepeats is not allowed/);
      expect(validationMessages.find((entry) => entry.label === "required-field").message).toMatch(/root\.tools\.text2speech-V2\[0\]\.voiceAge is required/);
      expect(validationMessages.find((entry) => entry.label === "enum-field").message).toMatch(/root\.tools\.text2speech-V2\[0\]\.characterPreset: expected one of "manual", "alert", "calm", "dnd-dungeon-master", "dramatic", "narrator", "robot"/);
      expect(validationMessages.find((entry) => entry.label === "range-field").message).toMatch(/root\.tools\.text2speech-V2\[0\]\.volume: must be less than or equal to 1/);
      expect(validationMessages.find((entry) => entry.label === "range-field").message).toMatch(/root\.tools\.text2speech-V2\[0\]\.rate: must be less than or equal to 2/);
      expect(validationMessages.find((entry) => entry.label === "range-field").message).toMatch(/root\.tools\.text2speech-V2\[0\]\.pitch: must be less than or equal to 2/);

      expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.repo.manifestWrites") || "[]"))).toEqual([]);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("launches Storage Inspector V2 with V2 labels, accordions, theme, and delete controls", async ({ page }) => {
    const pageErrors = [];
    await page.setViewportSize({ height: 900, width: 1440 });
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, "clipboard", {
        configurable: true,
        value: {
          async writeText(value) {
            window.__storageInspectorV2ClipboardText = value;
          }
        }
      });
      window.sessionStorage.setItem("storage-inspector-v2-alpha", "true");
      window.sessionStorage.setItem("storage-inspector-v2-beta", "plain beta value");
      window.sessionStorage.setItem("storage-inspector-v2-gamma", JSON.stringify({ index: 3, wraps: true }));
      window.sessionStorage.setItem("storage-inspector-v2-delta", "delta value that is long enough to prove tile text clips inside a fixed tile");
      window.sessionStorage.setItem("storage-inspector-v2-super-long-storage-key-name-that-must-wrap-inside-the-fixed-session-tile", "epsilon value");
      window.localStorage.setItem("storage-inspector-v2-local", "local value");
      document.cookie = "storage-inspector-v2-cookie=cookie%20value; path=/";
    });
    const server = await openStorageInspectorV2(page, "?launch=workspace&fromTool=workspace-manager-v2&hostContextId=storage-inspector-v2-test-context&workspaceMode=uat");

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("body[data-tool-id='storage-inspector-v2']")).toBeVisible();
      await expect(page.locator("h1")).toHaveText("Storage Inspector V2");
      await expect(page.locator('link[href="./styles/storageInspectorV2.css"]')).toHaveCount(1);
      await expect(page.locator('link[href="../common/toolShellCommon.css"]')).toHaveCount(1);
      await expect(page.locator(".storage-inspector-v2__menu")).toHaveCount(0);
      await expect(page.locator("#returnToWorkspaceButton")).toHaveCount(1);
      await expect(page.locator(".storage-inspector-v2__workspace-menu")).toBeVisible();
      await expect(page.locator(".storage-inspector-v2__workspace-menu")).toHaveAttribute("aria-label", "Workspace actions");
      await expect(page.locator(".storage-inspector-v2__workspace-menu")).toHaveAttribute("data-launch-mode-nav", "workspace");
      await expect(page.locator(".storage-inspector-v2__workspace-menu #returnToWorkspaceButton")).toHaveText("Return to Workspace");
      await expect(page.locator(".storage-inspector-v2__local-shell-frame #returnToWorkspaceButton")).toHaveCount(0);
      await expect(page.locator("#storageInspectorV2ControlsContent #returnToWorkspaceButton")).toHaveCount(0);
      await expect(page.locator("#refreshStorageInspectorV2Button")).toHaveText("Refresh");
      await expect(page.locator("#clearSessionStorageInspectorV2Button")).toHaveText("Clear Session");
      await expect(page.locator("#clearLocalStorageInspectorV2Button")).toHaveText("Clear Local");
      await expect(page.locator("#clearToolStateStorageInspectorV2Button")).toHaveText("Clear Tool State");
      await expect(page.locator("#clearAllStorageInspectorV2Button")).toHaveText("Clear All");
      await expect(page.locator("#clearStorageInspectorV2StatusButton")).toHaveText("Clear Status");
      await expect(page.locator("#storageInspectorV2ControlsContent")).toContainText("Refresh");
      await expect(page.locator("#storageInspectorV2ControlsContent")).toContainText("Clear Session");
      await expect(page.locator("#storageInspectorV2ControlsContent")).toContainText("Clear Local");
      await expect(page.locator("#storageInspectorV2ControlsContent")).toContainText("Clear Tool State");
      await expect(page.locator("#storageInspectorV2ControlsContent")).toContainText("Clear All");
      await expect(page.locator("#storageInspectorV2ControlsContent")).not.toContainText("Clear Status");
      await expect(page.locator(".storage-inspector-v2__status-accordion-header")).toContainText("Status");
      await expect(page.locator(".storage-inspector-v2__status-accordion-header #clearStorageInspectorV2StatusButton")).toHaveText("Clear Status");
      await expect(page.locator(".storage-inspector-v2__json-accordion-header")).toContainText("JSON");
      await expect(page.locator(".storage-inspector-v2__json-accordion-header")).not.toContainText("Details");
      await expect(page.locator(".storage-inspector-v2__json-accordion-header #copyStorageInspectorV2AllButton")).toHaveText("Copy All");
      await expect(page.locator(".storage-inspector-v2__data-accordion-header")).toContainText("Data");
      await expect(page.locator(".storage-inspector-v2__dirty-accordion-header")).toContainText("Dirty");
      await expect(page.locator("#storageInspectorV2DirtyHeaderValue")).toHaveText("Dirty: unknown");
      await expect(page.locator(".storage-inspector-v2__state-accordion-header")).toHaveCount(0);
      await expect(page.locator(".storage-inspector-v2__schema-accordion-header")).toHaveCount(0);
      await expect(page.locator("#storageInspectorV2StateOutput")).toHaveCount(0);
      await expect(page.locator("#storageInspectorV2SchemaOutput")).toHaveCount(0);
      expect(await page.locator(".storage-inspector-v2__panel--left > .accordion-v2 > .accordion-v2__header > span:first-child").evaluateAll((labels) => labels.map((label) => label.textContent.trim()))).toEqual([
        "Controls",
        "Filters"
      ]);
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id]")).toHaveCount(7);
      await expect(page.locator("#storageInspectorV2Summary > span")).toHaveText([
        "(7) Entries shown.",
        "(5) SessionStorage.",
        "(1) LocalStorage.",
        "(1) Cookies."
      ]);
      await expect(page.locator(".storage-inspector-v2__filter-notes > span")).toHaveText([
        "sessionStorage survives refresh, not tab close.",
        "localStorage survives refresh/browser restart.",
        "cookies survive based on cookie expiration/session rules."
      ]);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Storage Inspector V2 ready\. Storage is read\/delete\./);
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
        const refresh = rectFor("#refreshStorageInspectorV2Button");
        const clearSession = rectFor("#clearSessionStorageInspectorV2Button");
        const clearLocal = rectFor("#clearLocalStorageInspectorV2Button");
        const clearToolState = rectFor("#clearToolStateStorageInspectorV2Button");
        const clearAll = rectFor("#clearAllStorageInspectorV2Button");
        const clearStatus = rectFor("#clearStorageInspectorV2StatusButton");
        const storageLabel = rectFor('label[for="storageScopeSelect"] span');
        const storageSelect = rectFor("#storageScopeSelect");
        const filterLabel = rectFor('label[for="storageInspectorV2FilterInput"] span');
        const filterInput = rectFor("#storageInspectorV2FilterInput");
        const jsonIcon = rectFor(".storage-inspector-v2__json-accordion-header .accordion-v2__icon");
        const copyButton = rectFor("#copyStorageInspectorV2AllButton");
        return {
          buttonsFit: [refresh, clearSession, clearLocal, clearToolState, clearAll, clearStatus].every((rect) => rect.scrollWidth <= rect.clientWidth + 1),
          clearStatusCompact: clearStatus.height <= 34,
          copyAfterCollapseIcon: copyButton.left >= jsonIcon.right,
          filterSameLine: filterInput.top <= filterLabel.bottom && filterInput.bottom >= filterLabel.top,
          storageSameLine: storageSelect.top <= storageLabel.bottom && storageSelect.bottom >= storageLabel.top
        };
      });
      expect(controlsLayout.buttonsFit).toBe(true);
      expect(controlsLayout.clearStatusCompact).toBe(true);
      expect(controlsLayout.storageSameLine).toBe(true);
      expect(controlsLayout.filterSameLine).toBe(true);
      expect(controlsLayout.copyAfterCollapseIcon).toBe(true);
      const tileText = (await page.locator(".storage-inspector-v2__entry-card").allTextContents()).join("\n");
      expect(tileText).not.toContain("plain beta value");
      expect(tileText).not.toContain("delta value that is long enough");
      expect(tileText).not.toContain("epsilon value");
      expect(tileText).not.toContain("wraps");

      const themeState = await page.evaluate(async () => {
        const css = await fetch("/tools/storage-inspector-v2/styles/storageInspectorV2.css", { cache: "no-store" }).then((response) => response.text());
        const stylesheetPaths = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
          .map((link) => new URL(link.href).pathname);
        const bodyStyle = getComputedStyle(document.body);
        const shellStyle = getComputedStyle(document.querySelector(".storage-inspector-v2.app-shell"));
        const layoutStyle = getComputedStyle(document.querySelector(".storage-inspector-v2__layout"));
        const headerFrameStyle = getComputedStyle(document.querySelector(".storage-inspector-v2__local-shell-frame"));
        const headerSummaryStyle = getComputedStyle(document.querySelector(".storage-inspector-v2__local-shell-frame .tools-platform-frame__accordion-summary"));
        const panelStyle = getComputedStyle(document.querySelector(".storage-inspector-v2__panel"));
        const inputStyle = getComputedStyle(document.querySelector("#storageInspectorV2FilterInput"));
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
            "--storage-inspector-v2-bg: var(--bg-gradient);",
            "--storage-inspector-v2-panel: var(--panel);",
            "--storage-inspector-v2-surface: var(--surface-inline);",
            "--storage-inspector-v2-line: var(--line);",
            "--storage-inspector-v2-text: var(--text);",
            "--storage-inspector-v2-muted: var(--muted);",
            "--storage-inspector-v2-accent: var(--accent);"
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
        "/tools/storage-inspector-v2/styles/storageInspectorV2.css"
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

      await expectStorageInspectorV2FullscreenShell(page);

      for (const contentId of [
        "storageInspectorV2ControlsContent",
        "storageInspectorV2FiltersContent",
        "storageInspectorV2EntriesContent",
        "storageInspectorV2JsonContent",
        "storageInspectorV2DataContent",
        "storageInspectorV2DirtyContent",
        "storageInspectorV2StatusContent"
      ]) {
        await expectStorageInspectorV2AccordionToggles(page, contentId);
      }
      await expectStorageInspectorV2DetailAccordionsIndependent(page);

      const tileState = await page.locator(".storage-inspector-v2__entry-card").evaluateAll((cards) => {
        const rects = cards.map((card) => {
          const rect = card.getBoundingClientRect();
          const deleteButton = card.querySelector("[data-storage-inspector-v2-delete-entry-id]");
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
          metadataGap: Math.round(cards[0].querySelector(".storage-inspector-v2__entry-value-size").getBoundingClientRect().top
            - cards[0].querySelector(".storage-inspector-v2__entry-storage-type").getBoundingClientRect().bottom),
          sizes: rects.map(({ height, width }) => ({ height, width })),
          storageTypeText: cards[0].querySelector(".storage-inspector-v2__entry-storage-type").textContent.trim(),
          valueSizeText: cards[0].querySelector(".storage-inspector-v2__entry-value-size").textContent.trim()
        };
      });
      expect(tileState.sizes).toEqual([
        { height: 198, width: 234 },
        { height: 198, width: 234 },
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
      const longKeyWrapState = await page.locator(".storage-inspector-v2__entry-card", { hasText: "storage-inspector-v2-super-long-storage-key-name-that-must-wrap-inside-the-fixed-session-tile" }).locator(".storage-inspector-v2__entry-key").evaluate((keyNode) => {
        const keyRect = keyNode.getBoundingClientRect();
        const cardRect = keyNode.closest(".storage-inspector-v2__entry-card").getBoundingClientRect();
        const lineHeight = Number.parseFloat(getComputedStyle(keyNode).lineHeight);
        return {
          height: keyRect.height,
          lineHeight,
          withinTile: keyRect.left >= cardRect.left && keyRect.right <= cardRect.right + 1
        };
      });
      expect(longKeyWrapState.height).toBeGreaterThan(longKeyWrapState.lineHeight * 1.5);
      expect(longKeyWrapState.withinTile).toBe(true);

      await page.locator("#storageInspectorV2FilterInput").fill("storage-inspector-v2-*local");
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id]")).toHaveCount(1);
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id='localStorage:storage-inspector-v2-local']")).toHaveCount(1);
      await expect(page.locator("#storageInspectorV2Summary > span")).toHaveText([
        "(1) Entries shown.",
        "(0) SessionStorage.",
        "(1) LocalStorage.",
        "(0) Cookies."
      ]);
      await page.locator("#storageInspectorV2FilterInput").fill("*gamma");
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id]")).toHaveCount(1);
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id='sessionStorage:storage-inspector-v2-gamma']")).toHaveCount(1);
      await page.locator("#storageInspectorV2FilterInput").fill("");
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id]")).toHaveCount(7);

      await page.locator('[data-storage-inspector-v2-entry-id="sessionStorage:storage-inspector-v2-alpha"]').click();
      await expect(page.locator("#storageInspectorV2JsonOutput")).toHaveText("true");
      await expect(page.locator("#storageInspectorV2DataOutput")).toContainText("No data section is present for sessionStorage:storage-inspector-v2-alpha.");
      await expect(page.locator("#storageInspectorV2DirtyOutput")).toContainText("No dirty section is present for sessionStorage:storage-inspector-v2-alpha.");
      await expect(page.locator("#storageInspectorV2DirtyHeaderValue")).toHaveText("Dirty: unknown");
      await page.locator("#copyStorageInspectorV2AllButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Copied JSON, Data, and Dirty sections with empty-state text for missing Data and Dirty\./);
      const copiedValidationText = await page.evaluate(() => window.__storageInspectorV2ClipboardText);
      expect(copiedValidationText).toContain("=== JSON ===\nStorage: sessionStorage:storage-inspector-v2-alpha\ntrue");
      expect(copiedValidationText).toContain("=== Data ===\nStorage: sessionStorage:storage-inspector-v2-alpha\nNo data section is present for sessionStorage:storage-inspector-v2-alpha.");
      expect(copiedValidationText).toContain("=== Dirty ===\nStorage: sessionStorage:storage-inspector-v2-alpha\nNo dirty section is present for sessionStorage:storage-inspector-v2-alpha.");
      await page.locator("#clearStorageInspectorV2StatusButton").click();
      await expect(page.locator("#statusLog")).toHaveValue("");
      await page.locator('[data-storage-inspector-v2-delete-entry-id="sessionStorage:storage-inspector-v2-alpha"]').click();
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id]")).toHaveCount(6);
      await expect(page.locator("#storageInspectorV2JsonOutput")).toHaveText('"plain beta value"');
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted sessionStorage:storage-inspector-v2-alpha\./);
      expect(await page.evaluate(() => window.sessionStorage.getItem("storage-inspector-v2-alpha"))).toBeNull();

      await page.evaluate(() => {
        window.__storageInspectorV2OriginalRemoveItem = Storage.prototype.removeItem;
        Storage.prototype.removeItem = function removeItemWithTestFailure(key) {
          if (key === "storage-inspector-v2-beta") {
            throw new Error("blocked delete");
          }
          return window.__storageInspectorV2OriginalRemoveItem.call(this, key);
        };
      });
      await page.locator('[data-storage-inspector-v2-delete-entry-id="sessionStorage:storage-inspector-v2-beta"]').click();
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id]")).toHaveCount(6);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Delete failed for sessionStorage:storage-inspector-v2-beta: blocked delete/);

      await page.evaluate(() => {
        Storage.prototype.removeItem = window.__storageInspectorV2OriginalRemoveItem;
      });
      await page.locator("#clearLocalStorageInspectorV2Button").click();
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id]")).toHaveCount(5);
      await expect(page.locator("#storageInspectorV2Summary > span")).toHaveText([
        "(5) Entries shown.",
        "(4) SessionStorage.",
        "(0) LocalStorage.",
        "(1) Cookies."
      ]);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Cleared 1 local storage entry\./);
      expect(await page.evaluate(() => window.localStorage.getItem("storage-inspector-v2-local"))).toBeNull();

      await page.locator("#storageScopeSelect").selectOption("cookies");
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id]")).toHaveCount(1);
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id='cookies:storage-inspector-v2-cookie']")).toHaveCount(1);
      await page.locator('[data-storage-inspector-v2-delete-entry-id="cookies:storage-inspector-v2-cookie"]').click();
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id]")).toHaveCount(0);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted cookies:storage-inspector-v2-cookie\./);
      expect(await page.evaluate(() => document.cookie.includes("storage-inspector-v2-cookie"))).toBe(false);
      await page.locator("#storageScopeSelect").selectOption("all");
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id]")).toHaveCount(4);

      await page.locator("#clearSessionStorageInspectorV2Button").click();
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id]")).toHaveCount(0);
      await expect(page.locator("#storageInspectorV2EntryList")).toContainText("No matching storage entries.");
      await expect(page.locator("#storageInspectorV2JsonOutput")).toHaveText("{}");
      await expect(page.locator("#storageInspectorV2DataOutput")).toHaveText("Select a normalized tool entry with a top-level data section.");
      await expect(page.locator("#storageInspectorV2DirtyOutput")).toHaveText("Select a normalized tool entry with a top-level dirty section.");
      await expect(page.locator("#storageInspectorV2Summary > span")).toHaveText([
        "(0) Entries shown.",
        "(0) SessionStorage.",
        "(0) LocalStorage.",
        "(0) Cookies."
      ]);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Cleared 4 session storage entries\./);
      await page.locator("#copyStorageInspectorV2AllButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Copy All failed: select a storage entry before copying JSON, Data, and Dirty\./);
      await page.evaluate(() => {
        window.sessionStorage.setItem("storage-inspector-v2-clear-all-session", "session");
        window.localStorage.setItem("storage-inspector-v2-clear-all-local", "local");
      });
      await page.locator("#refreshStorageInspectorV2Button").click();
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id]")).toHaveCount(2);
      await page.locator("#clearAllStorageInspectorV2Button").click();
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id]")).toHaveCount(0);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Cleared 2 all storage entries\./);
      await page.locator("#clearAllStorageInspectorV2Button").click();
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Clear all skipped: no matching storage entries were found\./);
      expect(pageErrors).toEqual([]);
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=storage-inspector-v2-test-context&workspace=uat/);
      await page.goto(`${server.baseUrl}/tools/storage-inspector-v2/index.html`, { waitUntil: "networkidle" });
      await expect(page.locator(".storage-inspector-v2__workspace-menu")).toBeHidden();
      await expect(page.locator("#returnToWorkspaceButton")).toBeHidden();
      await expect(page.locator("#returnToWorkspaceButton")).toHaveCount(1);
      await expect(page.locator(".storage-inspector-v2__local-shell-frame #returnToWorkspaceButton")).toHaveCount(0);
      await expect(page.locator("#storageInspectorV2ControlsContent #returnToWorkspaceButton")).toHaveCount(0);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
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
            window.__storageInspectorV2ClipboardText = value;
          }
        }
      });
      const longAssetMap = Object.fromEntries(Array.from({ length: 90 }, (_, index) => {
        const paddedIndex = String(index).padStart(2, "0");
        return [`assets.image.long.${paddedIndex}`, {
          path: `assets/images/long-${paddedIndex}.png`,
          type: "image",
          kind: "png",
          role: "preview",
          source: "test-fixture"
        }];
      }));
      const longHorizontalToken = "storage-inspector-v2-horizontal-scroll-probe".repeat(8);
      window.sessionStorage.setItem("workspace.tools.preview-generator-v2", JSON.stringify({
        schema: {
          source: "workspace-manager-v2",
          toolId: "preview-generator-v2",
          schemaRole: "workspace-launch-context"
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
        data: {
          assets: { "assets.image.preview.preview": { path: "assets/images/preview.png" }, ...longAssetMap },
          horizontalProbe: longHorizontalToken
        },
        dirty: {
          isDirty: false,
          reason: null,
          changedAt: null,
          changedKeys: []
        }
      }));
      window.sessionStorage.setItem("workspace.tools.dirty-test", JSON.stringify({
        schema: {
          source: "workspace-manager-v2",
          toolId: "dirty-test",
          schemaRole: "workspace-launch-context"
        },
        workspace: {
          source: "workspace-manager-v2",
          toolId: "dirty-test"
        },
        data: {
          note: "dirty fixture"
        },
        dirty: {
          isDirty: true,
          reason: longHorizontalToken,
          changedAt: "2026-05-08T12:00:00.000Z",
          changedKeys: Array.from({ length: 70 }, (_, index) => `${longHorizontalToken}.${index}`)
        }
      }));
      window.sessionStorage.setItem("workspace.tools.no-data-test", JSON.stringify({
        schema: {
          source: "workspace-manager-v2",
          toolId: "no-data-test",
          schemaRole: "workspace-launch-context"
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
          schemaRole: "workspace-launch-context"
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
    const server = await openStorageInspectorV2(page);

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id]")).toHaveCount(5);
      await expect(page.locator(".storage-inspector-v2__json-accordion-header")).toContainText("JSON");
      await expect(page.locator(".storage-inspector-v2__data-accordion-header")).toContainText("Data");
      await expect(page.locator(".storage-inspector-v2__dirty-accordion-header")).toContainText("Dirty");
      await expect(page.locator(".storage-inspector-v2__state-accordion-header")).toHaveCount(0);
      await expect(page.locator(".storage-inspector-v2__schema-accordion-header")).toHaveCount(0);
      await expect(page.locator("#storageInspectorV2StateOutput")).toHaveCount(0);
      await expect(page.locator("#storageInspectorV2SchemaOutput")).toHaveCount(0);
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id='sessionStorage:workspace.tools.preview-generator-v2']")).toHaveCount(1);
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id='sessionStorage:workspace.tools.preview-generator-v2.schema']")).toHaveCount(0);
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id='sessionStorage:workspace.tools.preview-generator-v2.state']")).toHaveCount(0);

      await page.locator('[data-storage-inspector-v2-entry-id="sessionStorage:workspace.tools.asset-manager-v2"]').click();
      await expect(page.locator("#storageInspectorV2JsonOutput")).toContainText('"schema"');
      await expect(page.locator("#storageInspectorV2JsonOutput")).toContainText('"workspace"');
      await expect(page.locator("#storageInspectorV2JsonOutput")).toContainText('"data"');
      await expect(page.locator("#storageInspectorV2JsonOutput")).toContainText('"dirty"');
      await expect(page.locator("#storageInspectorV2JsonOutput")).toContainText('"repoReferenceKey": "workspace.repo.reference"');
      await expect(page.locator("#storageInspectorV2JsonOutput")).not.toContainText('"state"');
      await expect(page.locator("#storageInspectorV2DataOutput")).toContainText('"assets.image.preview.preview"');
      await expect(page.locator("#storageInspectorV2DataOutput")).not.toContainText('"schema"');
      await expect(page.locator("#storageInspectorV2DataOutput")).not.toContainText('"workspace"');
      await expect(page.locator("#storageInspectorV2DataOutput")).not.toContainText('"dirty"');
      await expect(page.locator("#storageInspectorV2DirtyOutput")).toContainText('"isDirty": false');
      await expect(page.locator("#storageInspectorV2DirtyOutput")).toContainText('"reason": null');
      await expect(page.locator("#storageInspectorV2DirtyOutput")).toContainText('"changedAt": null');
      await expect(page.locator("#storageInspectorV2DirtyOutput")).toContainText('"changedKeys": []');
      await expect(page.locator("#storageInspectorV2DirtyOutput")).not.toContainText('"data"');
      await expect(page.locator("#storageInspectorV2DirtyOutput")).not.toContainText('"workspace"');
      await expect(page.locator("#storageInspectorV2DirtyOutput")).not.toContainText('"schema"');
      await expect(page.locator("#storageInspectorV2DirtyHeaderValue")).toHaveText("Dirty: false");
      const allDetailContentIds = STORAGE_INSPECTOR_V2_DETAIL_SECTIONS.map((section) => section.contentId);
      const fourOpenOutputHeight = await expectStorageInspectorV2SharedDetailSpace(page, allDetailContentIds);
      const threeOpenOutputHeight = await expectStorageInspectorV2SharedDetailSpace(page, allDetailContentIds.slice(0, 3));
      const twoOpenOutputHeight = await expectStorageInspectorV2SharedDetailSpace(page, allDetailContentIds.slice(0, 2));
      const oneOpenOutputHeight = await expectStorageInspectorV2SharedDetailSpace(page, allDetailContentIds.slice(0, 1));
      expect(oneOpenOutputHeight).toBeGreaterThan(twoOpenOutputHeight);
      expect(twoOpenOutputHeight).toBeGreaterThan(threeOpenOutputHeight);
      expect(threeOpenOutputHeight).toBeGreaterThan(fourOpenOutputHeight);
      await setStorageInspectorV2DetailSectionsOpen(page, allDetailContentIds);
      const detailPanelState = await page.evaluate(() => {
        const jsonOutput = document.querySelector("#storageInspectorV2JsonOutput");
        const dataOutput = document.querySelector("#storageInspectorV2DataOutput");
        return {
          dataOutputScrollsVertically: dataOutput.scrollHeight > dataOutput.clientHeight + 1,
          jsonOutputScrollsVertically: jsonOutput.scrollHeight > jsonOutput.clientHeight + 1
        };
      });
      expect(detailPanelState).toEqual({
        dataOutputScrollsVertically: true,
        jsonOutputScrollsVertically: true
      });
      await page.locator("#copyStorageInspectorV2AllButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Copied JSON, Data, and Dirty sections to clipboard\./);
      const copiedToolPayload = await page.evaluate(() => window.__storageInspectorV2ClipboardText);
      expect(copiedToolPayload).toContain("=== JSON ===");
      expect(copiedToolPayload).toContain("=== JSON ===\nStorage: sessionStorage:workspace.tools.asset-manager-v2\n");
      expect(copiedToolPayload).toContain("=== Data ===");
      expect(copiedToolPayload).toContain("=== Data ===\nStorage: sessionStorage:workspace.tools.asset-manager-v2\n");
      expect(copiedToolPayload).toContain("=== Dirty ===");
      expect(copiedToolPayload).toContain("=== Dirty ===\nStorage: sessionStorage:workspace.tools.asset-manager-v2\n");
      expect(copiedToolPayload).toContain('"workspace"');
      expect(copiedToolPayload).toContain('"data"');
      expect(copiedToolPayload).toContain('"dirty"');
      expect(copiedToolPayload).toContain('"assets.image.preview.preview"');
      expect(copiedToolPayload).toContain('"isDirty": false');

      await page.locator('[data-storage-inspector-v2-entry-id="sessionStorage:workspace.tools.dirty-test"]').click();
      await expect(page.locator("#storageInspectorV2DirtyHeaderValue")).toHaveText("Dirty: true");
      await expect(page.locator("#storageInspectorV2DirtyOutput")).toContainText('"isDirty": true');
      const dirtyOutputScrollState = await page.evaluate(() => {
        const dirtyContent = document.querySelector("#storageInspectorV2DirtyContent");
        const dirtyOutput = document.querySelector("#storageInspectorV2DirtyOutput");
        const statusOutput = document.querySelector("#statusLog");
        const dirtyContentStyle = getComputedStyle(dirtyContent);
        const dirtyOutputStyle = getComputedStyle(dirtyOutput);
        const rect = dirtyOutput.getBoundingClientRect();
        const statusOutputHeight = Math.round(statusOutput.getBoundingClientRect().height);
        return {
          dirtyContentDoesNotOwnScrollbar: dirtyContentStyle.overflowY === "hidden" && dirtyContentStyle.overflowX === "hidden",
          dirtyOutputHasNoHorizontalScrollbar: dirtyOutput.scrollWidth <= dirtyOutput.clientWidth + 1,
          dirtyOutputScrollsVertically: dirtyOutput.scrollHeight > dirtyOutput.clientHeight + 1,
          dirtyOutputHeightMatchesStatus: Math.abs(Math.round(rect.height) - statusOutputHeight) <= 1,
          dirtyOutputWrapsLongLines: dirtyOutputStyle.whiteSpace === "pre-wrap" && dirtyOutputStyle.overflowWrap === "anywhere"
        };
      });
      expect(dirtyOutputScrollState).toEqual({
        dirtyContentDoesNotOwnScrollbar: true,
        dirtyOutputHasNoHorizontalScrollbar: true,
        dirtyOutputScrollsVertically: true,
        dirtyOutputHeightMatchesStatus: true,
        dirtyOutputWrapsLongLines: true
      });
      await page.locator('[data-storage-inspector-v2-entry-id="sessionStorage:workspace.tools.no-data-test"]').click();
      await expect(page.locator("#storageInspectorV2DataOutput")).toContainText("No data section is present for sessionStorage:workspace.tools.no-data-test.");
      await page.locator('[data-storage-inspector-v2-entry-id="sessionStorage:workspace.tools.no-dirty-test"]').click();
      await expect(page.locator("#storageInspectorV2DirtyHeaderValue")).toHaveText("Dirty: unknown");
      await expect(page.locator("#storageInspectorV2DirtyOutput")).toContainText("No dirty section is present for sessionStorage:workspace.tools.no-dirty-test.");

      await page.locator('[data-storage-inspector-v2-delete-entry-id="sessionStorage:workspace.tools.preview-generator-v2"]').click();
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id]")).toHaveCount(4);
      expect(await page.evaluate(() => window.sessionStorage.getItem("workspace.tools.preview-generator-v2"))).toBeNull();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted sessionStorage:workspace\.tools\.preview-generator-v2\./);

      await page.locator("#clearToolStateStorageInspectorV2Button").click();
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id]")).toHaveCount(0);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted sessionStorage:workspace\.tools\.asset-manager-v2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted sessionStorage:workspace\.tools\.dirty-test\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Cleared 4 workspace tool state storage entries\./);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("starts with no active game even when stale session hydration exists", async ({ page }) => {
    const staleGameManifest = JSON.parse(await readFile("games/Asteroids/game.manifest.json", "utf8"));
    const staleWorkspaceContext = workspaceContextFromGameManifest(staleGameManifest, {
      repoPath: process.cwd().replaceAll("\\", "/"),
      repoRoot: "HTML-JavaScript-Gaming"
    });
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
    }, staleWorkspaceContext);
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
        repoReference: {
          displayName: "StaleRepo"
        },
        toolKeys: ["workspace.tools.asset-manager-v2"]
      });
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
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
      await expect(page.locator("#activeGameSummary")).toHaveCount(0);
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
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Discovered 3 schema-valid game manifests from HTML-JavaScript-Gaming\./);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO SKIP games\/InvalidWorkspace\/game\.manifest\.json: Game manifest failed schema validation: root\.game is required/);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO SKIP games\/MissingManifest\/game\.manifest\.json: game\.manifest\.json not found/);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Discovered 3 schema-valid game manifests\./);
      const asteroidsGameManifestShape = await page.evaluate(async () => {
        const manifest = await fetch("/games/Asteroids/game.manifest.json", { cache: "no-store" }).then((response) => response.json());
        const { WorkspaceManagerV2ContextService } = await import("/tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js");
        const service = new WorkspaceManagerV2ContextService();
        const invalidRuntimeWorkspaceManifest = structuredClone(manifest);
        invalidRuntimeWorkspaceManifest.game.gameData = { workspace: {} };
        const invalidEmbeddedWorkspaceManifest = structuredClone(manifest);
        invalidEmbeddedWorkspaceManifest.game["workspace"] = { schema: "html-js-gaming.project" };
        const invalidObjectVectorRuntimeManifest = structuredClone(manifest);
        invalidObjectVectorRuntimeManifest.objectVectorRuntime = {
          objectIds: {
            ship: "object.asteroids.ship"
          }
        };
        const invalidUnknownGameDataManifest = structuredClone(manifest);
        invalidUnknownGameDataManifest.game.gameData = { debugUnknown: true };
        const workspaceManifest = service.workspaceManifestFromGameManifest({
          id: manifest.game.id,
          manifest,
          manifestKind: "game-manifest",
          manifestPath: "/games/Asteroids/game.manifest.json",
          name: manifest.game.name,
          repoRoot: "HTML-JavaScript-Gaming"
        });
        const invalidUnknownWorkspaceManifest = structuredClone(workspaceManifest);
        invalidUnknownWorkspaceManifest.debugUnknown = true;
        return {
          gameManifestValidation: await service.validateGameManifest(manifest),
          hasGameData: Boolean(manifest.game?.gameData),
          hasRootTools: Boolean(manifest.tools),
          hasWorkspace: Boolean(manifest.game?.["workspace"]),
          embeddedWorkspaceValidation: await service.validateGameManifest(invalidEmbeddedWorkspaceManifest),
          objectVectorRuntimeValidation: await service.validateGameManifest(invalidObjectVectorRuntimeManifest),
          runtimeWorkspaceValidation: await service.validateGameManifest(invalidRuntimeWorkspaceManifest),
          schema: manifest.schema,
          unknownGameDataValidation: await service.validateGameManifest(invalidUnknownGameDataManifest),
          unknownWorkspaceValidation: await service.validateGeneratedManifest(invalidUnknownWorkspaceManifest),
          workspaceValidation: await service.validateGeneratedManifest(workspaceManifest)
        };
      });
      expect(asteroidsGameManifestShape).toMatchObject({
        embeddedWorkspaceValidation: { ok: false },
        gameManifestValidation: { ok: true },
        hasGameData: false,
        hasRootTools: true,
        hasWorkspace: false,
        objectVectorRuntimeValidation: { ok: false },
        schema: "html-js-gaming.game-manifest",
        unknownGameDataValidation: { ok: false },
        unknownWorkspaceValidation: { ok: false },
        workspaceValidation: { ok: true }
      });
      expect(asteroidsGameManifestShape.embeddedWorkspaceValidation.message).toContain("Embedded workspace data under root.game is not allowed");
      expect(asteroidsGameManifestShape.objectVectorRuntimeValidation.message).toContain("root.objectVectorRuntime is not allowed");
      expect(asteroidsGameManifestShape.unknownGameDataValidation.message).toContain("root.game.gameData is not allowed");
      expect(asteroidsGameManifestShape.unknownWorkspaceValidation.message).toContain("root.debugUnknown is not allowed");
      expect(asteroidsGameManifestShape.runtimeWorkspaceValidation.ok).toBe(false);
      expect(asteroidsGameManifestShape.runtimeWorkspaceValidation.message).toContain("root.game.gameData is not allowed");

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
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Selected repo is missing games\//);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Repo load failed: Selected repo is missing games\//);
      expect(await readWorkspaceSessionHydration(page)).toMatchObject({
        repoReference: {
          displayName: "HTML-JavaScript-Gaming"
        },
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
      await expect(page.locator("#statusLog")).toHaveValue(/INFO No schema-valid game manifests were found in NoValidGamesRepo\./);
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
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Discovered 3 schema-valid game manifests from SecondRepo\./);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue("{}");
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("resolves game manifest schema refs from the game schema during repo discovery", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await selectMockRepo(page, {
        expectedGameOptions: ALL_REPO_GAME_OPTIONS,
        manifestPaths: ALL_REPO_GAME_MANIFEST_PATHS
      });
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Discovered 11 schema-valid game manifests from HTML-JavaScript-Gaming\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Discovered 11 schema-valid game manifests\./);
      await expect(page.locator("#statusLog")).not.toHaveValue(/unresolved schema reference tools\/asset-manager-v2\.schema\.json/);
      await expect(page.locator("#statusLog")).not.toHaveValue(/unresolved schema reference tools\/palette-manager-v2\.schema\.json/);
      await expect(page.locator("#statusLog")).not.toHaveValue(/SKIP games\/Asteroids\/game\.manifest\.json/);
      await expect(page.locator("#statusLog")).not.toHaveValue(/SKIP games\/AITargetDummy\/game\.manifest\.json/);

      const discoveredGameIds = await page.locator("#activeGameSelect option").evaluateAll((options) => (
        options.map((option) => option.value).filter(Boolean)
      ));
      expect(discoveredGameIds).toEqual([
        "AITargetDummy",
        "Asteroids",
        "Bouncing-ball",
        "Breakout",
        "GravityWell",
        "Pacman",
        "Pong",
        "SolarSystem",
        "SpaceDuel",
        "SpaceInvaders",
        "vector-arcade-sample"
      ]);

      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"gameId": "Asteroids"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"asset-manager-v2"/);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("validates workspace manifest tool payloads without a separate validation contract", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"gameId": "Asteroids"/);

      const validation = await page.evaluate(async () => {
        const app = window.__workspaceManagerV2App;
        const validWorkspace = await app.contextService.validateGeneratedManifest(app.activeContext);
        const invalidAssetWorkspace = structuredClone(app.activeContext);
        invalidAssetWorkspace.tools["asset-manager-v2"].schemaRefProbe = true;
        const invalidPaletteWorkspace = structuredClone(app.activeContext);
        invalidPaletteWorkspace.tools["palette-manager-v2"].schemaRefProbe = true;
        return {
          asset: await app.contextService.validateGeneratedManifest(invalidAssetWorkspace),
          palette: await app.contextService.validateGeneratedManifest(invalidPaletteWorkspace),
          valid: validWorkspace
        };
      });

      expect(validation.valid, validation.valid.message).toMatchObject({ ok: true });
      expect(validation.asset.ok).toBe(false);
      expect(validation.asset.message).toMatch(/root\.tools\.asset-manager-v2\.schemaRefProbe is not allowed/);
      expect(validation.asset.message).not.toMatch(/unresolved schema reference/);
      expect(validation.palette.ok).toBe(false);
      expect(validation.palette.message).toMatch(/root\.tools\.palette-manager-v2\.schemaRefProbe is not allowed/);
      expect(validation.palette.message).not.toMatch(/unresolved schema reference/);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("uses header lifecycle controls and launches tools from fixed Workspace Manager V2 tiles", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("body[data-tool-id='workspace-manager-v2']")).toBeVisible();
      await expect(page.locator("#importManifestButton")).toHaveCount(0);
      await expect(page.locator("#exportManifestButton")).toHaveCount(0);
      const headerActionLabels = await page.locator(".workspace-manager-v2__menu > button:not([hidden])")
        .evaluateAll((buttons) => buttons.map((button) => button.textContent.trim()));
      expect(headerActionLabels).toEqual(["Save", "Close", "Cancel"]);
      await expect(page.locator("#saveWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#closeWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#cancelWorkspaceButton")).toBeDisabled();
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
      await expect(page.locator("#workspaceToolTiles [data-workspace-tool-id]")).toHaveCount(10);
      await expect(page.locator('[data-workspace-tool-id="workspace-manager-v2"]')).toHaveCount(0);
      await expect(page.locator('[data-workspace-tool-id="asset-browser"]')).toHaveCount(0);
      await expect(page.locator('[data-workspace-tool-id="tile-model-converter"]')).toHaveCount(0);
      const toolGroupMembership = await page.locator(".workspace-manager-v2__tool-group").evaluateAll((groups) => Object.fromEntries(groups.map((group) => [
        group.querySelector(".workspace-manager-v2__tool-group-title")?.textContent?.trim(),
        Array.from(group.querySelectorAll(".workspace-manager-v2__tool-tile-name"), (name) => name.textContent.trim())
      ])));
      expect(toolGroupMembership).toEqual({
        Editors: ["Asset Manager V2", "Palette Manager V2", "Object Vector Studio V2", "World Vector Studio V2"],
        Utilities: ["Input Mapping V2", "Preview Generator V2", "Text to Speech V2"],
        Viewers: ["Tool Starter V2", "Collision Inspector V2", "Storage Inspector V2"]
      });
      expect(await page.locator("#workspaceToolTiles [data-workspace-tool-id]").evaluateAll((tiles) => tiles.every((tile) => tile.disabled))).toBe(true);
      expect(await page.locator("#workspaceToolTiles [data-workspace-tool-id]").evaluateAll((tiles) => (
        tiles.every((tile) => Array.from(tile.querySelectorAll(".workspace-manager-v2__tool-tile-action"), (action) => action.textContent.trim()).join("|") === "How To Use|Read Me")
      ))).toBe(true);
      await selectMockRepo(page);
      const selectedRepoHydration = await readWorkspaceSessionHydration(page);
      expect(selectedRepoHydration).toMatchObject({
        repoReference: {
          displayName: "HTML-JavaScript-Gaming",
          handleName: "HTML-JavaScript-Gaming",
          kind: "file-system-directory-handle-reference"
        },
        toolKeys: []
      });
      expectRuntimeBindingMetadata(selectedRepoHydration.repoReference, {
        bindingSource: "showDirectoryPicker",
        boundManifestPath: "",
        hasLiveRepoHandle: true,
        sourceBindingState: "repo-handle-acquired"
      });
      const compactCenterLayout = await page.evaluate(() => {
        const getRect = (selector) => {
          const element = document.querySelector(selector);
          return element ? element.getBoundingClientRect() : null;
        };
        const toolsRect = getRect(".workspace-manager-v2__accordion--tools");
        const toolGroupsRect = getRect("#workspaceToolTiles");
        const jsonRect = getRect(".workspace-manager-v2__accordion--json");
        const jsonOutputRect = getRect("#workspaceContextOutput");
        const activeGameRect = getRect(".workspace-manager-v2__accordion--active-game");
        const activeGameSelectRect = getRect("#activeGameSelect");
        return {
          activeGameExtraHeight: Math.round(activeGameRect.height - activeGameSelectRect.height),
          activeGameHeight: Math.round(activeGameRect.height),
          jsonOutputHeight: Math.round(jsonOutputRect.height),
          jsonTop: Math.round(jsonRect.top),
          toolsBottom: Math.round(toolsRect.bottom),
          toolsExtraHeight: Math.round(toolsRect.height - toolGroupsRect.height),
          toolsHeight: Math.round(toolsRect.height)
        };
      });
      expect(compactCenterLayout.toolsExtraHeight).toBeLessThanOrEqual(90);
      expect(compactCenterLayout.jsonTop).toBeGreaterThan(compactCenterLayout.toolsBottom);
      expect(compactCenterLayout.activeGameExtraHeight).toBeLessThanOrEqual(104);
      expect(compactCenterLayout.activeGameHeight).toBeLessThanOrEqual(142);
      expect(compactCenterLayout.jsonOutputHeight).toBe(240);

      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Asteroids context uses games\/Asteroids\/ and games\/Asteroids\/assets\./);
      await expect(page.locator("#activePaletteSummary")).toHaveCount(0);
      await expect(page.locator("#activeAssetRegistrySummary")).toHaveCount(0);
      await expect(page.locator("#launchContextSummary")).toHaveCount(0);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"gameRoot": "games\/Asteroids\/"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"assetsPath": "games\/Asteroids\/assets"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"screen": \{\s+"width": 960,\s+"height": 720\s+\}/);
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
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"object-vector-studio-v2"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"vector-map-editor"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"object\.asteroids\.ship"/);
      const activeWorkspaceOutput = JSON.parse(await page.locator("#workspaceContextOutput").inputValue());
      const activeObjectVectorPayload = activeWorkspaceOutput.tools["object-vector-studio-v2"];
      expect(Object.keys(activeObjectVectorPayload).sort()).toEqual(["name", "objects", "toolId", "version"]);
      expect(activeObjectVectorPayload.vectorMaps).toBeUndefined();
      expect(activeObjectVectorPayload.objects.every((object) => Array.isArray(object.tags) && Array.isArray(object.shapes))).toBe(true);
      if (Object.hasOwn(activeWorkspaceOutput.tools, "text2speech-V2")) {
        expect(activeWorkspaceOutput.tools["text2speech-V2"]).toEqual(expect.any(Array));
      }
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"vectorMaps"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(new RegExp('"vector' + "\\.asteroids"));
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"palette-browser"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"asset-browser"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"activePalette"/);
      expect(activeWorkspaceOutput.toolId).toBeUndefined();
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"workspaceManifest"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"workspaceMetadata"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"hasLiveRepoHandle"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"sourceBindingState"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/samples\//);
      await expect(page.locator("#pickRepoBtn")).toBeDisabled();
      await expect(page.locator("#activeGameSelect")).toBeDisabled();
      await expect(page.locator("#saveWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#closeWorkspaceButton")).toBeEnabled();
      await expect(page.locator("#cancelWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#activeGameContent button")).toHaveCount(0);
      const selectedGameHydration = await readWorkspaceSessionHydration(page);
      expectRuntimeBindingMetadata(selectedGameHydration.repoReference);
      expect(selectedGameHydration.toolKeys).toEqual([
        "workspace.tools.asset-manager-v2",
        "workspace.tools.collision-inspector-v2",
        "workspace.tools.input-mapping-v2",
        "workspace.tools.object-vector-studio-v2",
        "workspace.tools.palette-manager-v2",
        "workspace.tools.preview-generator-v2",
        "workspace.tools.storage-inspector-v2",
        "workspace.tools.text2speech-V2",
        "workspace.tools.world-vector-studio-v2"
      ]);
      expect(selectedGameHydration.toolKeys).not.toContain("workspace.tools.templates-v2");
      expect(selectedGameHydration.toolKeys.some((key) => key.endsWith(".schema") || key.endsWith(".state"))).toBe(false);
      expect(Object.keys(selectedGameHydration.toolSessions).sort()).toEqual([
        "asset-manager-v2",
        "collision-inspector-v2",
        "input-mapping-v2",
        "object-vector-studio-v2",
        "palette-manager-v2",
        "preview-generator-v2",
        "storage-inspector-v2",
        "text2speech-V2",
        "world-vector-studio-v2"
      ]);
      const selectedGameHydrationReport = await page.evaluate(() => window.__workspaceManagerV2App.activeToolStateHydration.report);
      expect(selectedGameHydrationReport.hydratedTools.map((tool) => tool.toolId)).toEqual([
        "asset-manager-v2",
        "palette-manager-v2",
        "object-vector-studio-v2",
        "world-vector-studio-v2",
        "collision-inspector-v2",
        "input-mapping-v2",
        "preview-generator-v2",
        "text2speech-V2",
        "storage-inspector-v2"
      ]);
      expect(selectedGameHydrationReport.skippedTools).toEqual([
        {
          reason: "starter/dev-only tool is not enabled by the selected game manifest",
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
        schemaRef: "tools/schemas/tools/asset-manager-v2.schema.json"
      });
      expect(selectedGameHydration.schemaByTool["collision-inspector-v2"]).toMatchObject({
        source: "workspace-manager-v2",
        toolId: "collision-inspector-v2",
        schemaRole: "workspace-tool-payload",
        schemaRef: "tools/schemas/tools/collision-inspector-v2.schema.json"
      });
      expect(selectedGameHydration.schemaByTool["preview-generator-v2"]).toMatchObject({
        source: "workspace-manager-v2",
        toolId: "preview-generator-v2",
        schemaRole: "workspace-launch-context"
      });
      expect(selectedGameHydration.schemaByTool["input-mapping-v2"]).toMatchObject({
        source: "workspace-manager-v2",
        toolId: "input-mapping-v2",
        schemaRole: "workspace-tool-payload",
        schemaRef: "tools/schemas/tools/input-mapping-v2.schema.json"
      });
      expect(selectedGameHydration.schemaByTool["preview-generator-v2"].schemaRef).toBeUndefined();
      expect(selectedGameHydration.workspaceByTool["asset-manager-v2"]).toMatchObject({
        source: "workspace-manager-v2",
        toolId: "asset-manager-v2",
        workspaceManifestId: "workspace-manager-v2-Asteroids",
        gameId: "Asteroids",
        gameRoot: "games/Asteroids/",
        assetsPath: "games/Asteroids/assets",
        repoReferenceKey: "workspace.repo.reference"
      });
      expectRuntimeBindingMetadata(selectedGameHydration.workspaceByTool["asset-manager-v2"]);
      expectRuntimeBindingMetadata(selectedGameHydration.workspaceByTool["collision-inspector-v2"]);
      expectRuntimeBindingMetadata(selectedGameHydration.workspaceByTool["input-mapping-v2"]);
      expectRuntimeBindingMetadata(selectedGameHydration.workspaceByTool["object-vector-studio-v2"]);
      expectRuntimeBindingMetadata(selectedGameHydration.workspaceByTool["palette-manager-v2"]);
      expectRuntimeBindingMetadata(selectedGameHydration.workspaceByTool["preview-generator-v2"]);
      expectRuntimeBindingMetadata(selectedGameHydration.workspaceByTool["storage-inspector-v2"]);
      expectRuntimeBindingMetadata(selectedGameHydration.workspaceByTool["text2speech-V2"]);
      expect(selectedGameHydration.toolSessions["asset-manager-v2"].state).toBeUndefined();
      expect(JSON.stringify(selectedGameHydration.toolSessions)).not.toMatch(/getDirectoryHandle|createWritable|FileSystemDirectoryHandle/);
      expect(Object.keys(selectedGameHydration.dataByTool["asset-manager-v2"].assets)).toHaveLength(15);
      expect(selectedGameHydration.dataByTool["input-mapping-v2"]).toMatchObject({
        engineInputModel: "src/engine/input/InputMap",
        toolId: "input-mapping-v2",
        version: 1
      });
      expect(selectedGameHydration.dataByTool["input-mapping-v2"].actions.map((action) => action.label)).toEqual([
        "Cancel",
        "Confirm",
        "Fire",
        "Interact",
        "Jump",
        "Menu",
        "Move Down",
        "Move Left",
        "Move Right",
        "Move Up",
        "Pause",
        "Primary Action",
        "Rotate Left",
        "Rotate Right",
        "Secondary Action",
        "Select",
        "Start",
        "Thrust"
      ]);
      expect(selectedGameHydration.dataByTool["object-vector-studio-v2"].objects.map((object) => object.id)).toEqual(expect.arrayContaining([
        "object.asteroids.bullet",
        "object.asteroids.ship",
        "object.asteroids.large-asteroid",
        "object.asteroids.medium-asteroid",
        "object.asteroids.small-asteroid",
        "object.asteroids.large-ufo",
        "object.asteroids.small-ufo"
      ]));
      expect(selectedGameHydration.dataByTool["object-vector-studio-v2"].objects.map((object) => object.id)).toEqual(expect.arrayContaining([
        "object.asteroids.bullet",
        "object.asteroids.ship",
        "object.asteroids.large-asteroid",
        "object.asteroids.medium-asteroid",
        "object.asteroids.small-asteroid",
        "object.asteroids.large-ufo",
        "object.asteroids.small-ufo"
      ]));
      expect(Object.keys(selectedGameHydration.dataByTool["object-vector-studio-v2"]).sort()).toEqual(["name", "objects", "toolId", "version"]);
      expect(selectedGameHydration.dataByTool["object-vector-studio-v2"].vectorMaps).toBeUndefined();
      expect(selectedGameHydration.dataByTool["object-vector-studio-v2"].assetLibrary).toBeUndefined();
      expect(selectedGameHydration.dataByTool["object-vector-studio-v2"].objects.every((object) => object.id.startsWith("object.") && !Object.hasOwn(object, "objectId"))).toBe(true);
      expect(selectedGameHydration.dataByTool["object-vector-studio-v2"].objects.every((object) => /^object\.[a-z0-9-]+\.[a-z0-9][a-z0-9-]*$/.test(object.id))).toBe(true);
      expect(selectedGameHydration.dataByTool["object-vector-studio-v2"].objects.map((object) => object.id)).not.toEqual(expect.arrayContaining([
        "object.asteroids.asteroid.large",
        "object.asteroids.asteroid.medium",
        "object.asteroids.asteroid.small",
        "object.asteroids.medium-asteroid-1",
        "object.asteroids.ufo.large",
        "object.asteroids.ufo.small"
      ]));
      expect(selectedGameHydration.dataByTool["object-vector-studio-v2"].palette).toBeUndefined();
      expect(
        selectedGameHydration.dataByTool["text2speech-V2"] === null
          || Array.isArray(selectedGameHydration.dataByTool["text2speech-V2"])
      ).toBe(true);
      expect(selectedGameHydration.toolSessions["templates-v2"]).toBeUndefined();
      expect(Object.values(selectedGameHydration.dirtyByTool)).toHaveLength(9);
      expect(Object.values(selectedGameHydration.dirtyByTool).every((dirty) => JSON.stringify(dirty) === JSON.stringify({
        isDirty: false,
        reason: null,
        changedAt: null,
        changedKeys: []
      }))).toBe(true);
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
      const templateTile = page.locator('[data-workspace-tool-id="templates-v2"]');
      const assetTile = page.locator('[data-workspace-tool-id="asset-manager-v2"]');
      const collisionInspectorTile = page.locator('[data-workspace-tool-id="collision-inspector-v2"]');
      const inputMappingTile = page.locator('[data-workspace-tool-id="input-mapping-v2"]');
      const objectVectorTile = page.locator('[data-workspace-tool-id="object-vector-studio-v2"]');
      const paletteTile = page.locator('[data-workspace-tool-id="palette-manager-v2"]');
      const previewTile = page.locator('[data-workspace-tool-id="preview-generator-v2"]');
      const textToSpeechToolTile = page.locator('[data-workspace-tool-id="text2speech-V2"]');
      const storageInspectorTile = page.locator('[data-workspace-tool-id="storage-inspector-v2"]');
      await expect(templateTile).toBeDisabled();
      await expect(templateTile).toContainText("Tool Starter V2");
      await expect(templateTile).toContainText("Not enabled for game");
      await expect(templateTile).toContainText("Canonical V2 template");
      await expect(assetTile).toBeEnabled();
      await expect(assetTile).toContainText("Asset Manager V2");
      await expect(assetTile).toContainText("Ready to launch");
      await expect(assetTile).toContainText("15 managed assets");
      await expect(paletteTile).toContainText("10 palette swatches");
      await expect(objectVectorTile).toBeEnabled();
      await expect(objectVectorTile).toContainText("Object Vector Studio V2");
      await expect(objectVectorTile).toContainText("Ready to launch");
      await expect(objectVectorTile).toContainText("7 object vector assets");
      await expect(collisionInspectorTile).toBeEnabled();
      await expect(collisionInspectorTile).toContainText("Collision Inspector V2");
      await expect(collisionInspectorTile).toContainText("Ready to launch");
      await expect(collisionInspectorTile).toContainText("7 inspectable objects");
      await expect(inputMappingTile).toBeEnabled();
      await expect(inputMappingTile).toContainText("Input Mapping V2");
      await expect(inputMappingTile).toContainText("Ready to launch");
      await expect(inputMappingTile).toContainText("Keyboard/gamepad mappings");
      await expect(previewTile).toContainText("Preview Not Found");
      await expect(previewTile).not.toContainText("Waiting for manifest");
      await expect(textToSpeechToolTile).toBeEnabled();
      await expect(textToSpeechToolTile).toContainText("Text to Speech V2");
      await expect(textToSpeechToolTile).toContainText("Ready to launch");
      await expect(textToSpeechToolTile).toContainText("0 text to speech");
      await expect(textToSpeechToolTile).not.toContainText("Speech synthesis ready");
      await expect(storageInspectorTile).toBeEnabled();
      await expect(storageInspectorTile).toContainText("Storage Inspector V2");
      const tileLayout = await page.locator("#workspaceToolTiles [data-workspace-tool-id]").evaluateAll((tiles) => tiles.map((tile) => ({
        height: Math.round(tile.getBoundingClientRect().height),
        width: Math.round(tile.getBoundingClientRect().width)
      })));
      const tileActionLayout = await page.locator("#workspaceToolTiles [data-workspace-tool-id]").evaluateAll((tiles) => tiles.map((tile) => {
        const tileRect = tile.getBoundingClientRect();
        const actions = tile.querySelector(".workspace-manager-v2__tool-tile-actions");
        const actionRect = actions.getBoundingClientRect();
        return {
          actionBottomGap: Math.round(tileRect.bottom - actionRect.bottom),
          actionHeight: Math.round(actionRect.height),
          chipHeights: Array.from(actions.querySelectorAll(".workspace-manager-v2__tool-tile-action"), (action) => Math.round(action.getBoundingClientRect().height))
        };
      }));
      expect(tileLayout).toEqual([
        { height: 142, width: 180 },
        { height: 142, width: 180 },
        { height: 142, width: 180 },
        { height: 142, width: 180 },
        { height: 142, width: 180 },
        { height: 142, width: 180 },
        { height: 142, width: 180 },
        { height: 142, width: 180 },
        { height: 142, width: 180 },
        { height: 142, width: 180 }
      ]);
      expect([...new Set(tileActionLayout.map((entry) => entry.actionBottomGap))]).toHaveLength(1);
      expect(tileActionLayout.every((entry) => entry.actionHeight === 24)).toBe(true);
      expect(tileActionLayout.every((entry) => entry.chipHeights.every((height) => height === 22))).toBe(true);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Boundary contract: game\.manifest\.json is game-only data\. Workspace Manager uses root\.tools to create standalone workspace sessions and saves validated tool data back to root\.tools\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Hydrated workspace session for asset-manager-v2, palette-manager-v2, object-vector-studio-v2, world-vector-studio-v2, collision-inspector-v2, input-mapping-v2, preview-generator-v2, text2speech-V2, storage-inspector-v2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Skipped workspace session hydration for templates-v2: starter\/dev-only tool is not enabled by the selected game manifest\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded Asteroids from \/games\/Asteroids\/game\.manifest\.json with 10 active palette colors and 15 managed assets\./);

      await page.locator('[data-workspace-tool-id="storage-inspector-v2"]').click();
      await expect(page).toHaveURL(/storage-inspector-v2\/index\.html.*launch=workspace/);
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id='sessionStorage:workspace.tools.asset-manager-v2']")).toHaveCount(1);
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id='sessionStorage:workspace.tools.collision-inspector-v2']")).toHaveCount(1);
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id='sessionStorage:workspace.tools.input-mapping-v2']")).toHaveCount(1);
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id='sessionStorage:workspace.tools.object-vector-studio-v2']")).toHaveCount(1);
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id='sessionStorage:workspace.tools.palette-manager-v2']")).toHaveCount(1);
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id='sessionStorage:workspace.tools.preview-generator-v2']")).toHaveCount(1);
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id='sessionStorage:workspace.tools.text2speech-V2']")).toHaveCount(1);
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id='sessionStorage:workspace.tools.storage-inspector-v2']")).toHaveCount(1);
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id='sessionStorage:workspace.tools.world-vector-studio-v2']")).toHaveCount(1);
      await expect(page.locator("#storageInspectorV2EntryList [data-storage-inspector-v2-entry-id='sessionStorage:workspace.tools.templates-v2']")).toHaveCount(0);
      await page.locator('[data-storage-inspector-v2-entry-id="sessionStorage:workspace.tools.asset-manager-v2"]').click();
      await expect(page.locator("#storageInspectorV2JsonOutput")).toContainText('"hasLiveRepoHandle": true');
      await expect(page.locator("#storageInspectorV2JsonOutput")).toContainText('"sourceBindingState": "bound"');
      await expect(page.locator("#storageInspectorV2JsonOutput")).toContainText('"boundManifestPath": "/games/Asteroids/game.manifest.json"');
      await expect(page.locator("#storageInspectorV2JsonOutput")).toContainText('"bindingSource": "game.manifest.json"');
      await expect(page.locator("#storageInspectorV2JsonOutput")).not.toContainText('"handle":');
      await expect(page.locator("#storageInspectorV2JsonOutput")).not.toContainText('"repoHandle":');
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Runtime binding status for sessionStorage:workspace\.tools\.asset-manager-v2: hasLiveRepoHandle=true; sourceBindingState=bound; boundManifestPath=\/games\/Asteroids\/game\.manifest\.json; bindingSource=game\.manifest\.json\./);
      await page.locator('[data-storage-inspector-v2-entry-id="sessionStorage:workspace.repo.reference"]').click();
      await expect(page.locator("#storageInspectorV2JsonOutput")).toContainText('"hasLiveRepoHandle": true');
      await expect(page.locator("#storageInspectorV2JsonOutput")).toContainText('"sourceBindingState": "bound"');
      await expect(page.locator("#storageInspectorV2JsonOutput")).toContainText('"boundManifestPath": "/games/Asteroids/game.manifest.json"');
      await expect(page.locator("#storageInspectorV2JsonOutput")).toContainText('"bindingSource": "game.manifest.json"');
      await expect(page.locator("#storageInspectorV2JsonOutput")).not.toContainText('"handle":');
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Runtime binding status for sessionStorage:workspace\.repo\.reference: hasLiveRepoHandle=true; sourceBindingState=bound; boundManifestPath=\/games\/Asteroids\/game\.manifest\.json; bindingSource=game\.manifest\.json\./);
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);
      await expectWorkspaceReturnedFromTool(page);
      const asteroidsManifest = await page.evaluate(async () => await fetch("/games/Asteroids/game.manifest.json", { cache: "no-store" }).then((response) => response.json()));
      expect(asteroidsManifest.documentKind).toBeUndefined();
      expect(asteroidsManifest.game["workspace"]).toBeUndefined();
      expect(asteroidsManifest.game.gameData).toBeUndefined();
      expect(asteroidsManifest.launch.directPath).toBe("/games/Asteroids/index.html");
      expect(asteroidsManifest.objectVectorRuntime).toBeUndefined();
      expect(Object.keys(asteroidsManifest.tools).sort()).toEqual(expect.arrayContaining(["asset-manager-v2", "object-vector-studio-v2", "palette-manager-v2"]));
      expect(asteroidsManifest.tools["vector-map-editor"]).toBeUndefined();
      expect(asteroidsManifest.tools["object-vector-studio-v2"].vectorMaps).toBeUndefined();
      expect(asteroidsManifest.tools["palette-manager-v2"].swatches.length).toBeGreaterThan(0);
      expect(asteroidsManifest.tools["object-vector-studio-v2"].palette).toBeUndefined();
      expect(asteroidsManifest.tools["object-vector-studio-v2"].objects.map((object) => object.id)).toEqual(expect.arrayContaining([
        "object.asteroids.bullet",
        "object.asteroids.ship",
        "object.asteroids.large-asteroid",
        "object.asteroids.medium-asteroid",
        "object.asteroids.small-asteroid",
        "object.asteroids.large-ufo",
        "object.asteroids.small-ufo"
      ]));
      expect(asteroidsManifest.tools["object-vector-studio-v2"].objects.map((object) => object.id)).toEqual(expect.arrayContaining([
        "object.asteroids.bullet",
        "object.asteroids.ship",
        "object.asteroids.large-asteroid",
        "object.asteroids.medium-asteroid",
        "object.asteroids.small-asteroid",
        "object.asteroids.large-ufo",
        "object.asteroids.small-ufo"
      ]));
      expect(asteroidsManifest.tools["object-vector-studio-v2"].assetLibrary).toBeUndefined();
      expect(asteroidsManifest.tools["object-vector-studio-v2"].objects.every((object) => object.id.startsWith("object.") && !Object.hasOwn(object, "objectId"))).toBe(true);
      expect(asteroidsManifest.tools["object-vector-studio-v2"].objects.every((object) => /^object\.[a-z0-9-]+\.[a-z0-9][a-z0-9-]*$/.test(object.id))).toBe(true);
      expect(asteroidsManifest.tools["object-vector-studio-v2"].objects.map((object) => object.id)).not.toEqual(expect.arrayContaining([
        "object.asteroids.asteroid.large",
        "object.asteroids.asteroid.medium",
        "object.asteroids.asteroid.small",
        "object.asteroids.medium-asteroid-1",
        "object.asteroids.ufo.large",
        "object.asteroids.ufo.small"
      ]));
      if (Object.hasOwn(asteroidsManifest.tools, "text2speech-V2")) {
        expect(asteroidsManifest.tools["text2speech-V2"]).toEqual(expect.any(Array));
      }
      expect(Object.keys(asteroidsManifest.tools["asset-manager-v2"].assets)).toHaveLength(15);
      expect(asteroidsManifest.tools["asset-manager-v2"].previewImagePath).toBeUndefined();
      expect(asteroidsManifest.tools["asset-manager-v2"].assets["assets.color.background.game"]).toEqual({
        path: "palette://workspace/space-black",
        type: "color",
        kind: "hex",
        role: "background",
        source: "manifest",
        color: {
          hex: "#020617",
          name: "Space Black",
          symbol: "!",
          source: "manifest"
        }
      });
      expect(asteroidsManifest.tools["asset-manager-v2"].assets["assets.image.background.deluxe"]).toEqual({
        path: "assets/images/deluxe.png",
        type: "image",
        kind: "png",
        role: "background",
        source: "manifest",
        stretchOverride: {
          uniformEdgeStretchPx: 0
        }
      });
      expect(asteroidsManifest.tools["asset-manager-v2"].assets["assets.image.bezel.bezel"]).toEqual({
        path: "assets/images/bezel.png",
        type: "image",
        kind: "png",
        role: "bezel",
        source: "manifest",
        stretchOverride: {
          uniformEdgeStretchPx: 10
        }
      });
      expect(asteroidsManifest.tools["asset-manager-v2"].assets["assets.image.preview.preview"]).toEqual({
        path: "assets/images/preview.png",
        type: "image",
        kind: "png",
        role: "preview",
        source: "manifest"
      });
      expect(asteroidsManifest.tools["asset-manager-v2"].source).toBe("manifest");
      expect(asteroidsManifest.tools["asset-manager-v2"].schema).toBe("html-js-gaming.asset-manager-v2");

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
      await expect(page.locator("#statusLog")).toHaveValue(/Workspace Manager V2 loaded 15 validated assets from tools\.asset-manager-v2\.assets/);
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
      expect(storedContext.documentKind).toBeUndefined();
      expect(storedContext.toolId).toBeUndefined();
      expect(storedContext.activePalette).toBeUndefined();
      expect(storedContext.workspaceManifest).toBeUndefined();
      expect(storedContext.hasLiveRepoHandle).toBeUndefined();
      expect(storedContext.sourceBindingState).toBeUndefined();
      expect(storedContext.gameId).toBe("Asteroids");
      expect(storedContext.gameRoot).toBe("games/Asteroids/");
      expect(storedContext.assetsPath).toBe("games/Asteroids/assets");
      expect(storedContext.screen).toEqual({ width: 960, height: 720 });
      expect(storedContext.repoRoot).toBe("HTML-JavaScript-Gaming");
      expect(storedContext.repoPath).toBe(manifestRepoPath(server));
      expect(storedContext.tools["palette-manager-v2"].swatches.length).toBeGreaterThan(0);
      expect(storedContext.tools["object-vector-studio-v2"].palette).toBeUndefined();
      expect(Object.keys(storedContext.tools["object-vector-studio-v2"]).sort()).toEqual(["name", "objects", "toolId", "version"]);
      expect(storedContext.tools["object-vector-studio-v2"].objects.map((object) => object.name)).toEqual(expect.arrayContaining([
        "Asteroids Ship",
        "Large Asteroid",
        "Medium Asteroid",
        "Small Asteroid",
        "Large UFO",
        "Small UFO"
      ]));
      expect(Object.keys(storedContext.tools["asset-manager-v2"].assets)).toHaveLength(15);
      expect(storedContext.tools["asset-manager-v2"].previewImagePath).toBeUndefined();
      expect(storedContext.tools["asset-manager-v2"].assets["assets.color.background.game"]).toEqual({
        path: "palette://workspace/space-black",
        type: "color",
        kind: "hex",
        role: "background",
        source: "manifest",
        color: {
          hex: "#020617",
          name: "Space Black",
          symbol: "!",
          source: "manifest"
        }
      });
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
      expect(storedContext.tools["vector-map-editor"]).toBeUndefined();
      expect(storedContext.tools["object-vector-studio-v2"].vectorMaps).toBeUndefined();
      expect(storedContext.tools["asset-manager-v2"].assets["assets.font.ui.vector-battle"]).toEqual({
        path: "src/assets/fonts/vector_battle/vector_battle.ttf",
        type: "font",
        kind: "ttf",
        role: "ui",
        source: "manifest"
      });
      if (Object.hasOwn(storedContext.tools, "text2speech-V2")) {
        expect(storedContext.tools["text2speech-V2"]).toEqual(expect.any(Array));
      }
      expect(storedContext.workspaceMetadata).toBeUndefined();
      expect(storedContext.tools["asset-browser"]).toBeUndefined();
      expect(storedContext.tools["palette-browser"]).toBeUndefined();
      expect(storedContext.tools["asset-manager-v2"].schema).toBe("html-js-gaming.asset-manager-v2");
      const schemaValidation = await page.evaluate(async () => {
        const [paletteSchema, assetSchema, inputMappingSchema, objectVectorSchema] = await Promise.all([
          fetch("/tools/schemas/tools/palette-manager-v2.schema.json", { cache: "no-store" }).then((response) => response.json()),
          fetch("/tools/schemas/tools/asset-manager-v2.schema.json", { cache: "no-store" }).then((response) => response.json()),
          fetch("/tools/schemas/tools/input-mapping-v2.schema.json", { cache: "no-store" }).then((response) => response.json()),
          fetch("/tools/schemas/tools/object-vector-studio-v2.schema.json", { cache: "no-store" }).then((response) => response.json())
        ]);
        const url = new URL(window.location.href);
        const manifest = JSON.parse(sessionStorage.getItem(url.searchParams.get("hostContextId")));
        const allowedManifestKeys = new Set(["schema", "version", "id", "name", "gameId", "gameRoot", "assetsPath", "screen", "repoRoot", "repoPath", "tools"]);
        const requiredManifestKeys = ["schema", "version", "id", "name", "gameId", "gameRoot", "assetsPath", "tools"];
        const allowedToolKeys = new Set(["palette-manager-v2", "asset-manager-v2", "input-mapping-v2", "object-vector-studio-v2", "collision-inspector-v2", "text2speech-V2"]);
        const palettePayload = manifest.tools["palette-manager-v2"];
        const assetPayload = manifest.tools["asset-manager-v2"];
        const inputMappingPayload = manifest.tools["input-mapping-v2"];
        const objectVectorPayload = manifest.tools["object-vector-studio-v2"];
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
          inputMappingActionLabels: inputMappingPayload.actions.map((action) => action.label),
          inputMappingExtraKeys: extraKeys(inputMappingPayload, inputMappingSchema),
          inputMappingMissingKeys: missingKeys(inputMappingPayload, inputMappingSchema),
          manifestExtraKeys: Object.keys(manifest).filter((key) => !allowedManifestKeys.has(key)),
          manifestMissingKeys: requiredManifestKeys.filter((key) => !Object.hasOwn(manifest, key)),
          objectVectorObjectTags: objectVectorPayload.objects.flatMap((object) => object.tags || []),
          objectVectorExtraKeys: extraKeys(objectVectorPayload, objectVectorSchema),
          objectVectorMissingKeys: missingKeys(objectVectorPayload, objectVectorSchema),
          objectVectorNames: objectVectorPayload.objects.map((object) => object.name),
          objectVectorPalette: objectVectorPayload.palette,
          paletteExtraKeys: extraKeys(palettePayload, paletteSchema),
          paletteMissingKeys: missingKeys(palettePayload, paletteSchema),
          swatchExtraKeys,
          swatchMissingKeys,
          textToSpeechPayload: manifest.tools["text2speech-V2"],
          toolKeys: Object.keys(manifest.tools).sort(),
          unsupportedToolKeys: Object.keys(manifest.tools).filter((key) => !allowedToolKeys.has(key))
        };
      });
      expect(schemaValidation).toMatchObject({
        assetExtraKeys: [],
        assetMissingKeys: [],
          inputMappingActionLabels: [
            "Cancel",
            "Confirm",
            "Fire",
            "Interact",
            "Jump",
            "Menu",
            "Move Down",
            "Move Left",
            "Move Right",
            "Move Up",
            "Pause",
            "Primary Action",
            "Rotate Left",
            "Rotate Right",
            "Secondary Action",
            "Select",
            "Start",
            "Thrust"
          ],
          inputMappingExtraKeys: [],
          inputMappingMissingKeys: [],
          manifestExtraKeys: [],
          manifestMissingKeys: [],
          objectVectorExtraKeys: [],
          objectVectorMissingKeys: [],
          objectVectorNames: expect.arrayContaining([
            "Bullet",
            "Asteroids Ship",
            "Large Asteroid",
            "Medium Asteroid",
            "Small Asteroid",
            "Large UFO",
            "Small UFO"
          ]),
          paletteExtraKeys: [],
        paletteMissingKeys: [],
        swatchExtraKeys: [],
        swatchMissingKeys: [],
        unsupportedToolKeys: []
      });
      expect(schemaValidation.objectVectorPalette).toBeUndefined();
      expect(schemaValidation.objectVectorObjectTags).not.toContain("asteroids");
      expect(schemaValidation.toolKeys).toEqual(expect.arrayContaining(["asset-manager-v2", "input-mapping-v2", "object-vector-studio-v2", "palette-manager-v2"]));
      expect(schemaValidation.toolKeys).not.toContain("vector-map-editor");
      if (schemaValidation.textToSpeechPayload !== undefined) {
        expect(schemaValidation.textToSpeechPayload).toEqual(expect.any(Array));
      }
      expect(JSON.stringify(storedContext)).not.toMatch(/samples\//i);
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);
      await expectWorkspaceReturnedFromTool(page, { dirty: true });
      await expect(page.locator("#activeGameSelect")).toHaveValue("Asteroids");
      await expect(page.locator("#activeAssetRegistrySummary")).toHaveCount(0);
      await expect(page.locator('[data-workspace-tool-id="asset-manager-v2"]')).toBeEnabled();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Restored repo destination from workspace\.repo\.reference for HTML-JavaScript-Gaming\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Restored Asteroids workspace from session context workspace-manager-v2-/);

      await expect(objectVectorTile).toBeEnabled();
      await objectVectorTile.click();
      await expect(page).toHaveURL(/object-vector-studio-v2\/index\.html.*launch=workspace/);
      await expect(page).toHaveURL(/fromTool=workspace-manager-v2/);
      await expect(page).toHaveURL(/hostContextId=workspace-manager-v2-/);
      await expect(page.locator(".tool-starter__workspace__menu")).toBeVisible();
      await expect(page.locator(".tool-starter__workspace__menu button")).toHaveText(["Return to Workspace"]);
      await expect(page.locator(".tool-starter__tool__menu")).toBeHidden();
      await expect(page.locator("#objectVectorStudioV2PaletteSwatchCount")).toHaveText("(10 swatches)");
      await expect(page.locator("#objectVectorStudioV2PaletteSummary [data-palette-color]")).toHaveCount(10);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Runtime palette is read-only session\/workspace data; Object Vector JSON remains palette-free\./);
      await expect(page.locator("#objectVectorStudioV2ObjectsCount")).toHaveText(/\(7 obj, states \d+, \d+ shapes?\)/);
      await expect(page.locator("#objectVectorStudioV2ObjectTiles")).toContainText("Asteroids Ship");
      await expect(page.locator("#objectVectorStudioV2ObjectTiles")).toContainText("Large Asteroid");
      await expect(page.locator("#objectVectorStudioV2ObjectTiles")).toContainText("Large UFO");
      const smallUfoTile = page.locator('.object-vector-studio-v2__object-tile[data-object-id="object.asteroids.small-ufo"]');
      await smallUfoTile.scrollIntoViewIfNeeded();
      await smallUfoTile.click();
      await expect(smallUfoTile).toContainText("object > asteroids > Small UFO");
      await expect(page.locator(".object-vector-studio-v2__object-tile.is-selected .object-vector-studio-v2__object-tile-shapes [data-object-tile-shape-index] .object-vector-studio-v2__shape-select-label")).toHaveText(["1. Line", "0. Polyline"]);
      await page.locator('button[aria-controls="objectVectorStudioV2DependencyGraphContent"]').click();
      await expect(page.locator("#objectVectorStudioV2DependencyGraph")).toContainText("Object tags:");
      await expect(page.locator("#objectVectorStudioV2DependencyGraph")).toContainText("object.asteroids.ship: Asteroids Ship");
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).not.toContainText('"palette"');
      await expect(page.locator("#objectVectorStudioV2JsonDetails")).not.toContainText('"vectorMaps"');
      await expect(page.locator("#statusLog")).toHaveValue(/OK Runtime palette loaded from workspace\.tools\.palette-manager-v2\.data: 10 swatches\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded Object Vector Studio V2 schema payload from workspace\.tools\.object-vector-studio-v2: 7 objects\./);
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);
      await expectWorkspaceReturnedFromTool(page, { dirty: true });

      await page.locator('[data-workspace-tool-id="palette-manager-v2"]').click();
      await expect(page).toHaveURL(/palette-manager-v2\/index\.html.*launch=workspace/);
      await expect(page.locator('[data-launch-mode-nav="tool"]')).toBeHidden();
      await expect(page.locator('[data-launch-mode-nav="workspace"]')).toBeVisible();
      await expect(page.locator('[data-launch-mode-nav="workspace"] button')).toHaveText(["Return to Workspace"]);
      await expect(page.locator("#userPaletteCount")).toHaveText("10 user swatches");
      await expect(page.locator('#userSwatchList [aria-label="Edit Space Black"]')).toBeVisible();
      await expect(page.locator('#userSwatchList [aria-label="Edit Space Black"]')).toHaveAttribute("title", /Name: Space Black/);
      await expect(page.locator("#paletteStatus")).toHaveText("Loaded active workspace palette Asteroids Palette.");
      await page.locator("#swatchSymbolInput").fill("@");
      await page.locator("#swatchHexInput").fill("#123456");
      await page.locator("#swatchNameInput").fill("Workspace Session Purple");
      await page.locator("#addSwatchButton").click();
      await expect(page.locator("#userPaletteCount")).toHaveText("11 user swatches");
      await expect(page.locator('#userSwatchList [aria-label="Edit Workspace Session Purple"]')).toBeVisible();
      await expect(page.locator("#paletteStatus")).toHaveText("Added Workspace Session Purple.");
      const editedPaletteSession = await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.tools.palette-manager-v2")));
      expect(editedPaletteSession.data.swatches).toHaveLength(11);
      expect(editedPaletteSession.data.swatches.at(-1)).toMatchObject({
        hex: "#123456",
        name: "Workspace Session Purple",
        source: "User Added",
        symbol: "@"
      });
      expect(editedPaletteSession.dirty).toMatchObject({
        isDirty: true,
        reason: "palette-updated"
      });
      expect(Date.parse(editedPaletteSession.dirty.changedAt)).not.toBeNaN();
      expect(editedPaletteSession.dirty.changedKeys).toEqual(expect.arrayContaining([
        "data.swatches",
        "data.swatches[10]"
      ]));
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);
      await expectWorkspaceReturnedFromTool(page, { dirty: true });
      const returnedPaletteSession = await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.tools.palette-manager-v2")));
      expect(returnedPaletteSession.data.swatches).toHaveLength(11);
      expect(returnedPaletteSession.data.swatches.at(-1)).toMatchObject({
        hex: "#123456",
        name: "Workspace Session Purple",
        source: "User Added",
        symbol: "@"
      });
      expect(returnedPaletteSession.dirty).toMatchObject({
        isDirty: true,
        reason: "palette-updated"
      });
      await expect(paletteTile).toContainText("11 palette swatches");
      await expect(paletteTile).toHaveAttribute("data-workspace-tool-dirty", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Refreshed palette-manager-v2 from workspace\.tools\.palette-manager-v2\.data: 11 palette swatches; Dirty: true\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Restored repo destination from workspace\.repo\.reference for HTML-JavaScript-Gaming\./);
      await expect(previewTile).toBeEnabled();
      await expect(previewTile).toContainText("Preview Not Found");
      await page.locator('[data-workspace-tool-id="palette-manager-v2"]').click();
      await expect(page).toHaveURL(/palette-manager-v2\/index\.html.*launch=workspace/);
      await expect(page.locator("#userPaletteCount")).toHaveText("11 user swatches");
      await expect(page.locator('#userSwatchList [aria-label="Edit Workspace Session Purple"]')).toBeVisible();
      await expect(page.locator("#paletteStatus")).toHaveText("Loaded active workspace palette Asteroids Palette.");
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);
      await expectWorkspaceReturnedFromTool(page, { dirty: true });
      await expect(paletteTile).toContainText("11 palette swatches");
      await expect(paletteTile).toHaveAttribute("data-workspace-tool-dirty", "true");

      await assetTile.click();
      await expect(page).toHaveURL(/asset-manager-v2\/index\.html.*launch=workspace/);
      await expect(page.locator("#statusLog")).toHaveValue(/Workspace Manager V2 loaded 15 validated assets from tools\.asset-manager-v2\.assets/);
      await expect(page.locator("#statusLog")).toHaveValue(/Workspace Manager V2 loaded 11 palette colors from active palette context/);
      await page.locator("#assetKindColor").check();
      const sessionPurpleSwatch = page.locator('#assetColorSwatchList button[aria-label*="Workspace Session Purple"]');
      await expect(sessionPurpleSwatch).toBeVisible();
      await sessionPurpleSwatch.click();
      await page.locator("#assetUsageInput").fill("session");
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.color.hud.session");
      await page.locator("#addAssetButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Added assets\.color\.hud\.session\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK workspace\.tools\.asset-manager-v2 now has 16 validated assets\./);
      const editedAssetSession = await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.tools.asset-manager-v2")));
      expect(Object.keys(editedAssetSession.data.assets)).toHaveLength(16);
      expect(editedAssetSession.data.assets["assets.color.hud.session"]).toMatchObject({
        color: {
          hex: "#123456",
          name: "Workspace Session Purple",
          source: "User Added",
          symbol: "@"
        },
        kind: "hex",
        path: "palette://workspace/workspace-session-purple",
        role: "hud",
        type: "color"
      });
      expect(editedAssetSession.dirty).toMatchObject({
        isDirty: true,
        reason: "asset-updated"
      });
      expect(Date.parse(editedAssetSession.dirty.changedAt)).not.toBeNaN();
      expect(editedAssetSession.dirty.changedKeys).toEqual(expect.arrayContaining([
        "data.assets",
        'data.assets["assets.color.hud.session"]'
      ]));
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);
      await expectWorkspaceReturnedFromTool(page, { dirty: true });
      await expect(assetTile).toContainText("16 managed assets");
      await expect(assetTile).toHaveAttribute("data-workspace-tool-dirty", "true");
      await expect(paletteTile).toContainText("11 palette swatches");
      await expect(paletteTile).toHaveAttribute("data-workspace-tool-dirty", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Refreshed asset-manager-v2 from workspace\.tools\.asset-manager-v2\.data: 16 managed assets; Dirty: true\./);
      await page.locator('[data-workspace-tool-id="preview-generator-v2"]').click();
      await expect(page).toHaveURL(/preview-generator-v2\/index\.html.*launch=workspace/);
      await expect(page.locator('[data-launch-mode-nav="tool"]')).toBeHidden();
      await expect(page.locator('[data-launch-mode-nav="workspace"]')).toBeVisible();
      await expect(page.locator('[data-launch-mode-nav="workspace"] button')).toHaveText(["Generate Image", "Return to Workspace"]);
      await expect(page.locator("#executeBtn")).toBeVisible();
      await expect(page.locator("#executeBtn")).toBeEnabled();
      await expect(page.locator("#repoDestinationSection")).toBeHidden();
      await expect(page.locator("#workspaceContextValue")).toHaveCount(0);
      await expect(page.locator("#targetTypeGames")).toBeChecked();
      await expect(page.locator("#targetTypeGames")).toBeDisabled();
      await expect(page.locator('label[for="targetTypeGames"]')).toBeVisible();
      await expect(page.locator('label[for="targetTypeSamples"]')).toBeHidden();
      await expect(page.locator('label[for="targetTypeTools"]')).toBeHidden();
      await expect(page.locator("#assetFolder")).toHaveValue("assets/images");
      await expect(page.locator("#baseUrl")).toHaveValue(server.baseUrl);
      await expect(page.locator("#sampleList")).toHaveValue("Asteroids");
      await expect(page.locator("#sampleList")).toBeDisabled();
      await expect(page.locator("#previewTargetValue")).toHaveText("games/Asteroids/assets/images/preview.svg");
      await expect(page.locator("#lastGeneratedImagePreview")).toBeVisible();
      await expect(page.locator("#lastGeneratedImageMeta")).toHaveText("Preview target: games/Asteroids/assets/images/preview.png");
      await expect(page.locator("#log")).toContainText("Raw workspace launch path field launchContext.repoRoot: HTML-JavaScript-Gaming");
      await expect(page.locator("#log")).toContainText("Raw workspace launch path field manifest.repoRoot: HTML-JavaScript-Gaming");
      await expect(page.locator("#log")).toContainText("OK Workspace launch context hydrated for Asteroids.");
      await expect(page.locator("#log")).toContainText("Workspace repoRoot display label available: HTML-JavaScript-Gaming.");
      await expect(page.locator("#log")).toContainText("OK Workspace repo session reference loaded from workspace.repo.reference for HTML-JavaScript-Gaming.");
      await expect(page.locator("#log")).toContainText("OK Workspace tool session workspace context loaded from workspace.tools.preview-generator-v2.");
      await expect(page.locator("#log")).toContainText("Workspace launch repo handle restored from workspace-manager-v2 runtime repo handle cache using workspace.repo.reference; independent repo selection is not required.");
      await expect(page.locator("#log")).toContainText("Workspace Manager V2 live repo handle was restored from runtime handle cache; no handle object was read from toolState JSON.");
      await expect(page.locator("#log")).toContainText("Repo display label: HTML-JavaScript-Gaming");
      await expect(page.locator("#log")).toContainText(`Repo root path string: ${displayRepoRootPath(server)}`);
      await expect(page.locator("#log")).toContainText("Repo FileSystemDirectoryHandle present: true");
      await expect(page.locator("#log")).toContainText("Verified handle root name: HTML-JavaScript-Gaming");
      await expect(page.locator("#log")).toContainText("OK Repo handle resolved folder games/Asteroids/assets/images.");
      await expect(page.locator("#log")).not.toContainText("Direct preview write");
      await expect(page.locator("#log")).not.toContainText("Resolved repoPath");
      await expect(page.locator("#log")).not.toContainText("Unable to resolve absolute repoRoot");
      await expect(page.locator("#log")).not.toContainText("/__workspace-manager-v2/repo-root");
      await expect(page.locator("#log")).not.toContainText("/__workspace-manager-v2/write-preview");
      await expect(page.locator("#log")).toContainText("Asset folder: assets\\images");
      await expect(page.locator("#log")).toContainText("Manifest preview asset: assets.image.preview.preview (image/png)");
      await expect(page.locator("#log")).toContainText("Manifest preview source: games/Asteroids/assets/images/preview.png");
      await expect(page.locator("#log")).toContainText("Generated preview target: games/Asteroids/assets/images/preview.svg");
      await expect(page.locator("#log")).toContainText("Preview target: games/Asteroids/assets/images/preview.svg");
      await expect(page.locator("#log")).toContainText("Workspace background source: assets.image.background.deluxe -> games/Asteroids/assets/images/deluxe.png");
      await expect(page.locator("#log")).toContainText("Workspace background color: Space Black #020617 from assets.color.background.game asset.");
      await expect(page.locator("#log")).not.toContainText("FAIL Workspace background hydration");
      await expect(page.locator("#log")).toContainText("OK Workspace manifest preview source is valid at games/Asteroids/assets/images/preview.png.");
      const previewStatusHeaderOrder = await page.locator(".preview-generator-v2__status-accordion-header").evaluate((header) => Array.from(header.querySelectorAll(":scope > span, :scope > div > span, :scope > div > button"), (element) => element.textContent.trim()));
      expect(previewStatusHeaderOrder).toEqual(["Status", "+", "Copy", "Clear"]);
      await expect(page.locator(".preview-generator-v2__status-header-actions #copyLogBtn")).toBeVisible();
      await expect(page.locator(".preview-generator-v2__status-header-actions #clearLogBtn")).toBeVisible();
      await page.evaluate(() => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: async (text) => {
              window.__previewGeneratorV2CopiedLog = text;
            }
          }
        });
      });
      const previewLogBeforeCopy = await page.locator("#log").textContent();
      await page.locator("#copyLogBtn").click();
      expect(await page.evaluate(() => window.__previewGeneratorV2CopiedLog)).toBe(previewLogBeforeCopy);
      await expect(page.locator("#log")).toContainText("OK Copied Preview Generator V2 status log to clipboard");
      await page.evaluate(() => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: undefined
        });
      });
      await page.locator("#copyLogBtn").click();
      await expect(page.locator("#log")).toContainText("FAIL Copy status log failed: Clipboard API is unavailable.");
      await page.locator("#executeBtn").click();
      await expect(page.locator("#log")).toContainText("Starting execution...", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText(`Repo root: ${displayRepoRootPath(server)}`, { timeout: 20000 });
      await expect(page.locator("#log")).toContainText(`CHK  ${displayAbsoluteOutputPath(server, "games/Asteroids/assets/images/preview.svg")}`, { timeout: 20000 });
      await expect(page.locator("#log")).toContainText(`MISSING ${displayAbsoluteOutputPath(server, "games/Asteroids/assets/images/preview.svg")}`, { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("RUN  Asteroids", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("OUT  games\\Asteroids\\assets\\images\\preview.svg", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText(`Write verification passed: file exists at ${displayAbsoluteOutputPath(server, "games/Asteroids/assets/images/preview.svg")}.`, { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("Write verification file exists: true.", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("Write verification file size:", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("Write verification modified timestamp:", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("Write verification content starts as SVG: true.", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText(`Write verification output path: ${displayAbsoluteOutputPath(server, "games/Asteroids/assets/images/preview.svg")}.`, { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("Write verification handle-relative path: games/Asteroids/assets/images/preview.svg.", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("OK WRITE Asteroids", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("Repo display label: HTML-JavaScript-Gaming", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText(`Repo root path string: ${displayRepoRootPath(server)}`, { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("Handle root name: HTML-JavaScript-Gaming", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("Handle-relative output path: games/Asteroids/assets/images/preview.svg", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText(`Absolute display path: ${displayAbsoluteOutputPath(server, "games/Asteroids/assets/images/preview.svg")}`, { timeout: 20000 });
      await expect(page.locator("#log")).not.toContainText("WARN Path resolution mismatch:");
      await expect(page.locator("#log")).toContainText("Source resolution context: workspace.tools.preview-generator-v2.data; selected game: Asteroids; resolved assets/images target: assets/images; target type: games", { timeout: 20000 });
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
      await expectWorkspaceReturnedFromTool(page, { dirty: true });
      await expect(page.locator("#statusLog")).toHaveValue(/OK Restored repo destination from workspace\.repo\.reference for HTML-JavaScript-Gaming\./);
      await inputMappingTile.click();
      await expect(page).toHaveURL(/input-mapping-v2\/index\.html.*launch=workspace/);
      await expect(page.locator(".tool-starter__workspace__menu")).toBeVisible();
      await expect(page.locator("#inputMappingV2CaptureKeyboardButton")).toBeVisible();
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?.*hostContextId=workspace-manager-v2-/);
      await expectWorkspaceReturnedFromTool(page, { dirty: true });
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("enables Text to Speech V2 after repo and game selection and preserves workspace return nav", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await installMockSpeechSynthesis(page);
      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expectWorkspaceReturnRehydrated(page);
      const textToSpeechToolTile = page.locator('[data-workspace-tool-id="text2speech-V2"]');
      await expect(textToSpeechToolTile).toBeEnabled();
      await expect(textToSpeechToolTile).toContainText("Text to Speech V2");
      await expect(textToSpeechToolTile).toContainText("Ready to launch");
      await expect(textToSpeechToolTile).toContainText("0 text to speech");
      await expect(textToSpeechToolTile).not.toContainText("Speech synthesis ready");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Hydrated workspace session for asset-manager-v2, palette-manager-v2, object-vector-studio-v2, world-vector-studio-v2, collision-inspector-v2, input-mapping-v2, preview-generator-v2, text2speech-V2, storage-inspector-v2\./);
      const textToSpeechSessionData = await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.tools.text2speech-V2")).data);
      const activeContextHasTextToSpeechPayload = await page.evaluate(() => Object.hasOwn(window.__workspaceManagerV2App.activeContext.tools, "text2speech-V2"));
      expect(textToSpeechSessionData === null || Array.isArray(textToSpeechSessionData)).toBe(true);
      expect(activeContextHasTextToSpeechPayload).toBe(textToSpeechSessionData !== null);
      await textToSpeechToolTile.click();
      await expect(page).toHaveURL(/text2speech-V2\/index\.html.*launch=workspace/);
      const hostContextId = new URL(page.url()).searchParams.get("hostContextId");
      expect(hostContextId).toMatch(/^workspace-manager-v2-/);
      await expect(page.locator('.palette-manager-v2__menu-sample[data-launch-mode-nav="workspace"]')).toBeVisible();
      await expect(page.locator('.palette-manager-v2__menu-sample[data-launch-mode-nav="workspace"] #returnToWorkspaceButton')).toHaveText("Return to Workspace");
      await expect(page.locator('.palette-manager-v2__menu-sample[data-launch-mode-nav="tool"]')).toBeHidden();
      await expect(page.locator(".text2speech-V2__workspace-menu")).toHaveCount(0);
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(new RegExp(`workspace-manager-v2/index\\.html\\?hostContextId=${hostContextId}`));
      await expectWorkspaceReturnedFromTool(page);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("shows Preview Generator tile status from manifest preview asset existence", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      const previewTile = page.locator('[data-workspace-tool-id="preview-generator-v2"]');
      await expect(previewTile).toContainText("Preview Not Found");
      await expect(previewTile).not.toContainText("Waiting for manifest");

      await selectMockRepo(page, {
        previewFiles: {
          Asteroids: {
            "preview.png": "mock asteroids preview"
          }
        }
      });
      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expect(previewTile).toContainText("Preview Found");
      await expect(previewTile).not.toContainText("Waiting for manifest");

      await page.locator("#closeWorkspaceButton").click();
      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Pong");
      await expect(previewTile).toContainText("Preview Not Found");
      await expect(previewTile).not.toContainText("Waiting for manifest");
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("saves empty Text to Speech V2 arrays through workspace return and manifest write-back", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await installMockSpeechSynthesis(page);
      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expectWorkspaceReturnRehydrated(page);
      const seededWorkspace = await page.evaluate(async (samplePresetPath) => {
        const app = window.__workspaceManagerV2App;
        const samplePayload = await fetch(samplePresetPath, { cache: "no-store" }).then((response) => response.json());
        const payload = [structuredClone(samplePayload[0])];
        const context = structuredClone(app.activeContext);
        context.tools["text2speech-V2"] = payload;
        const validation = await app.contextService.validateGeneratedManifest(context);
        const hostContextId = app.contextService.writePersistedContext(app.activeHostContextId, context);
        const session = JSON.parse(sessionStorage.getItem("workspace.tools.text2speech-V2"));
        sessionStorage.setItem("workspace.tools.text2speech-V2", JSON.stringify({
          ...session,
          data: payload,
          dirty: {
            isDirty: false,
            reason: null,
            changedAt: null,
            changedKeys: []
          }
        }));
        const metrics = app.contextSummaryMetrics(context);
        app.applyContextResult({
          assetCount: metrics.assetCount,
          context,
          game: app.activeGame,
          hostContextId,
          paletteSwatches: metrics.paletteSwatches
        }, { requiresRepoHandle: app.activeToolStateRequiresRepoHandle });
        return { hostContextId, validation };
      }, TEXT_TO_SPEECH_SAMPLE_PRESET_PATH);
      expect(seededWorkspace.validation).toEqual({ ok: true });
      await expect(page.locator('[data-workspace-tool-id="text2speech-V2"]')).toContainText("1 text to speech");
      await expect(page.locator('[data-workspace-tool-id="text2speech-V2"]')).not.toContainText("Speech synthesis ready");
      expect(await page.evaluate(async () => {
        const app = window.__workspaceManagerV2App;
        const context = structuredClone(app.activeContext);
        context.tools["text2speech-V2"] = [];
        return await app.contextService.validateGeneratedManifest(context);
      })).toEqual({ ok: true });

      await page.locator('[data-workspace-tool-id="text2speech-V2"]').click();
      await expect(page).toHaveURL(/text2speech-V2\/index\.html.*launch=workspace/);
      await expect(page.locator("#text2speech-V2QueueTiles [data-speech-item-id]")).toHaveCount(1);
      await page.locator("#text2speech-V2DeleteItemButton").click();
      await expect(page.locator("#text2speech-V2QueueTiles [data-speech-item-id]")).toHaveCount(0);
      expect(JSON.parse(await page.locator("#text2speech-V2SpeechSummary").textContent())).toEqual([]);
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Text to Speech V2 empty state: 0 named speech items\. Add a Name and click Add to create a new item\./);
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Text to Speech V2 dirty state: true; reason=speech-item-deleted; changedKeys=queue; queue=0\./);
      await expect(page.locator("#text2speech-V2StatusLog")).not.toHaveValue(/schema requires at least one named speech item|name update failed/);

      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(new RegExp(`workspace-manager-v2/index\\.html\\?hostContextId=${seededWorkspace.hostContextId}`));
      await expectWorkspaceReturnedFromTool(page, { dirty: true });
      await expect(page.locator('[data-workspace-tool-id="text2speech-V2"]')).toContainText("0 text to speech");
      await expect(page.locator('[data-workspace-tool-id="text2speech-V2"]')).not.toContainText("Speech synthesis ready");
      const returnedState = await page.evaluate(() => {
        const session = JSON.parse(sessionStorage.getItem("workspace.tools.text2speech-V2"));
        const outputContext = JSON.parse(document.querySelector("#workspaceContextOutput").value);
        return {
          activePayload: window.__workspaceManagerV2App.activeContext.tools["text2speech-V2"],
          outputPayload: outputContext.tools["text2speech-V2"],
          sessionData: session.data,
          sessionDirty: session.dirty
        };
      });
      expect(returnedState.activePayload).toEqual([]);
      expect(returnedState.outputPayload).toEqual([]);
      expect(returnedState.sessionData).toEqual([]);
      expect(returnedState.sessionDirty).toMatchObject({
        isDirty: true,
        reason: "speech-item-deleted",
        changedKeys: ["queue"]
      });

      await page.locator("#saveWorkspaceButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Saved and marked clean: workspace\.tools\.text2speech-V2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Saved Text to Speech V2 payload count: 0\./);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Saved toolState items: 5 \(asset-manager-v2 assets=15; input-mapping-v2 actions=18 inputs=0; object-vector-studio-v2 objects=7; palette-manager-v2 swatches=10; text2speech-V2 queue=0\)\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save validation result: game manifest valid; root\.tools toolState valid; saved context matched re-read file\./);
      const savedState = await page.evaluate((hostContextId) => {
        const writes = JSON.parse(sessionStorage.getItem("workspace.repo.manifestWrites") || "[]");
        return {
          activePayload: window.__workspaceManagerV2App.activeContext.tools["text2speech-V2"],
          manifest: JSON.parse(writes.at(-1).contents),
          savedContext: JSON.parse(sessionStorage.getItem(hostContextId)),
          session: JSON.parse(sessionStorage.getItem("workspace.tools.text2speech-V2")),
          writePath: writes.at(-1).path
        };
      }, seededWorkspace.hostContextId);
      expect(savedState.writePath).toBe("HTML-JavaScript-Gaming/games/Asteroids/game.manifest.json");
      expect(savedState.activePayload).toEqual([]);
      expect(savedState.savedContext.tools["text2speech-V2"]).toEqual([]);
      expect(savedState.session.data).toEqual([]);
      expect(savedState.session.dirty).toEqual({
        isDirty: false,
        reason: null,
        changedAt: null,
        changedKeys: []
      });
      expect(savedState.manifest.tools["text2speech-V2"]).toEqual([]);

      await page.locator('[data-workspace-tool-id="text2speech-V2"]').click();
      await expect(page).toHaveURL(/text2speech-V2\/index\.html.*launch=workspace/);
      await expect(page.locator("#text2speech-V2QueueTiles [data-speech-item-id]")).toHaveCount(0);
      await expect(page.locator("#text2speech-V2SpeakButton")).toBeDisabled();
      expect(JSON.parse(await page.locator("#text2speech-V2SpeechSummary").textContent())).toEqual([]);
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Text to Speech V2 schema validation result: tools\/schemas\/tools\/text2speech-V2\.schema\.json valid; queue=0\./);
      await expect(page.locator("#text2speech-V2StatusLog")).toHaveValue(/OK Loaded 0 schema-complete Text to Speech V2 queue items\./);
      await expect(page.locator("#text2speech-V2StatusLog")).not.toHaveValue(/queue selection failed|schema requires at least one named speech item/);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("keeps Preview Generator V2 repo writer after Asset Manager V2 deletes the preview asset entry", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expectWorkspaceReturnRehydrated(page);
      await page.locator('[data-workspace-tool-id="asset-manager-v2"]').click();
      await expect(page).toHaveURL(/asset-manager-v2\/index\.html.*launch=workspace/);
      await expect(page.locator("#statusLog")).toHaveValue(/Workspace Manager V2 loaded 15 validated assets from tools\.asset-manager-v2\.assets/);
      await page.locator('[data-delete-asset-id="assets.image.preview.preview"]').click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted assets\.image\.preview\.preview\./);
      const editedAssetSession = await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.tools.asset-manager-v2")));
      expect(editedAssetSession.data.assets["assets.image.preview.preview"]).toBeUndefined();
      expect(Object.keys(editedAssetSession.data.assets)).toHaveLength(14);
      expect(editedAssetSession.dirty).toMatchObject({
        isDirty: true,
        reason: "asset-updated"
      });
      await page.evaluate(() => {
        sessionStorage.setItem("workspace.repo.writes", JSON.stringify([{
          contents: "<svg>stale cached prior preview</svg>",
          path: "HTML-JavaScript-Gaming/games/Asteroids/assets/images/preview.svg"
        }]));
      });
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);
      await expectWorkspaceReturnedFromTool(page, { dirty: true });
      await expect(page.locator('[data-workspace-tool-id="asset-manager-v2"]')).toContainText("14 managed assets");
      await expect(page.locator('[data-workspace-tool-id="asset-manager-v2"]')).toHaveAttribute("data-workspace-tool-dirty", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Refreshed asset-manager-v2 from workspace\.tools\.asset-manager-v2\.data: 14 managed assets; Dirty: true\./);
      await page.locator('[data-workspace-tool-id="preview-generator-v2"]').click();
      await expect(page).toHaveURL(/preview-generator-v2\/index\.html.*launch=workspace/);
      await expect(page.locator("#repoDestinationSection")).toBeHidden();
      await expect(page.locator("#executeBtn")).toBeEnabled();
      await expect(page.locator("#previewTargetValue")).toHaveText("games/Asteroids/assets/images/preview.svg");
      await expect(page.locator("#log")).toContainText("WARN Workspace manifest preview asset is missing from Asset Manager V2 data; generated preview output will target games/Asteroids/assets/images/preview.svg.");
      await expect(page.locator("#log")).toContainText("OK Workspace repo session reference loaded from workspace.repo.reference for HTML-JavaScript-Gaming.");
      await expect(page.locator("#log")).toContainText("Workspace launch repo handle restored from workspace-manager-v2 runtime repo handle cache using workspace.repo.reference; independent repo selection is not required.");
      await expect(page.locator("#log")).toContainText("Repo FileSystemDirectoryHandle present: true");
      await expect(page.locator("#log")).toContainText("Verified handle root name: HTML-JavaScript-Gaming");
      await expect(page.locator("#log")).toContainText("OK Repo handle resolved folder games/Asteroids/assets/images.");
      await expect(page.locator("#log")).not.toContainText("Repo selected: not selected");
      await page.locator("#executeBtn").click();
      const log = page.locator("#log");
      await expect(log).toContainText(`CHK  ${displayAbsoluteOutputPath(server, "games/Asteroids/assets/images/preview.svg")}`, { timeout: 20000 });
      await expect(log).toContainText(`MISSING ${displayAbsoluteOutputPath(server, "games/Asteroids/assets/images/preview.svg")}`, { timeout: 20000 });
      await expect(log).toContainText("RUN  Asteroids", { timeout: 20000 });
      await expect(log).toContainText(`Write verification passed: file exists at ${displayAbsoluteOutputPath(server, "games/Asteroids/assets/images/preview.svg")}.`, { timeout: 20000 });
      await expect(log).toContainText("OK WRITE Asteroids", { timeout: 20000 });
      await expect(log).toContainText("Handle-relative output path: games/Asteroids/assets/images/preview.svg", { timeout: 20000 });
      await expect(log).not.toContainText("WARN Path resolution mismatch:");
      await expect(log).toContainText("Written: 1", { timeout: 20000 });
      await expect(log).toContainText("Failed: 0", { timeout: 20000 });
      await expect(log).not.toContainText("SKIP Asteroids");
      const previewWrites = await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.repo.writes") || "[]"));
      expect(previewWrites).toHaveLength(2);
      expect(previewWrites.at(-1).path).toBe("HTML-JavaScript-Gaming/games/Asteroids/assets/images/preview.svg");
      expect(previewWrites.at(-1).contents).toContain("<svg");
      expect(previewWrites.at(-1).contents).not.toContain("stale cached prior preview");
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("fails Preview Generator V2 without OK WRITE when live handle read-back verification fails", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expectWorkspaceReturnRehydrated(page);
      await page.evaluate(() => {
        const rawValue = sessionStorage.getItem("workspace-manager-v2-mock-repo-handle-cache");
        const cachedConfig = rawValue ? JSON.parse(rawValue) : {};
        sessionStorage.setItem("workspace-manager-v2-mock-repo-handle-cache", JSON.stringify({
          ...cachedConfig,
          failPreviewRead: true,
          repoName: cachedConfig.repoName || "HTML-JavaScript-Gaming"
        }));
      });
      await page.locator('[data-workspace-tool-id="preview-generator-v2"]').click();
      await expect(page).toHaveURL(/preview-generator-v2\/index\.html.*launch=workspace/);
      await expect(page.locator("#executeBtn")).toBeEnabled();
      await expect(page.locator("#log")).toContainText("Workspace launch repo handle restored from workspace-manager-v2 runtime repo handle cache using workspace.repo.reference; independent repo selection is not required.");
      await page.locator("#executeBtn").click();
      const log = page.locator("#log");
      const expectedOutputPath = displayAbsoluteOutputPath(server, "games/Asteroids/assets/images/preview.svg");
      await expect(log).toContainText(`FAIL Asteroids  (Write verification failed for ${expectedOutputPath}: Mock preview read failed.; expected full absolute path: ${expectedOutputPath})`, { timeout: 20000 });
      await expect(log).toContainText("Written: 0", { timeout: 20000 });
      await expect(log).toContainText("Failed: 1", { timeout: 20000 });
      await expect(log).not.toContainText("OK WRITE Asteroids");
      await expect(log).not.toContainText("Write verification passed: file exists");
      const previewWrites = await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.repo.writes") || "[]"));
      expect(previewWrites).toHaveLength(1);
      expect(previewWrites[0].path).toBe("HTML-JavaScript-Gaming/games/Asteroids/assets/images/preview.svg");
      expect(previewWrites[0].contents).toContain("<svg");
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("tracks Object Vector Studio V2 dirty state through persisted edits and save outcomes", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expectWorkspaceReturnRehydrated(page);
      await expect(page.locator("#saveWorkspaceButton")).toBeDisabled();
      const generatedObjectVectorPayload = JSON.parse(await page.locator("#workspaceContextOutput").inputValue()).tools["object-vector-studio-v2"];
      expect(generatedObjectVectorPayload.assetLibrary).toBeUndefined();
      expect(generatedObjectVectorPayload.objects.every((object) => Array.isArray(object.tags))).toBe(true);
      expect(generatedObjectVectorPayload.objects.find((object) => object.id === "object.asteroids.small-asteroid").tags).toEqual(["asteroid", "small"]);

      await page.locator('[data-workspace-tool-id="object-vector-studio-v2"]').click();
      await expect(page).toHaveURL(/object-vector-studio-v2\/index\.html.*launch=workspace/);
      await expect(page.locator("#objectVectorStudioV2ObjectsCount")).toHaveText(/\(7 obj, states \d+, \d+ shapes?\)/);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded Object Vector Studio V2 schema payload from workspace\.tools\.object-vector-studio-v2: 7 objects\./);

      let objectVectorSession = await readObjectVectorWorkspaceSession(page);
      expect(objectVectorSession.dirty).toEqual({
        isDirty: false,
        reason: null,
        changedAt: null,
        changedKeys: []
      });
      let lastDataText = objectVectorSession.dataText;

      async function expectObjectVectorDirtyAfter(label, action, { resetDirty = true } = {}) {
        await action();
        await expect.poll(async () => {
          const session = await readObjectVectorWorkspaceSession(page);
          return session.dirty.isDirty === true && session.dataText !== lastDataText;
        }, { message: `${label} should mark Object Vector Studio V2 workspace data dirty` }).toBe(true);
        const dirtySession = await readObjectVectorWorkspaceSession(page);
        expect(dirtySession.dirty).toMatchObject({
          isDirty: true,
          reason: "object-vector-updated"
        });
        expect(Date.parse(dirtySession.dirty.changedAt)).not.toBeNaN();
        expect(dirtySession.dirty.changedKeys).toEqual(expect.arrayContaining(["data.objects"]));
        lastDataText = dirtySession.dataText;
        if (resetDirty) {
          await resetObjectVectorWorkspaceDirty(page);
        }
        return dirtySession;
      }
      async function dragPreviewLocator(selector, deltaX, deltaY) {
        const target = page.locator(selector);
        await target.scrollIntoViewIfNeeded();
        const box = await target.boundingBox();
        expect(box).not.toBeNull();
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(x + deltaX, y + deltaY, { steps: 4 });
        await page.mouse.up();
      }

      await page.locator('.object-vector-studio-v2__object-tile[data-object-id="object.asteroids.large-asteroid"] .object-vector-studio-v2__object-select').click();
      await page.locator("#objectVectorStudioV2ZoomInButton").click();
      await page.locator("#objectVectorStudioV2PanDownButton").click();
      await page.locator("#objectVectorStudioV2GridRenderButton").click();
      objectVectorSession = await readObjectVectorWorkspaceSession(page);
      expect(objectVectorSession.dataText).toBe(lastDataText);
      expect(objectVectorSession.dirty.isDirty).toBe(false);

      await expectObjectVectorDirtyAfter("object tag edit", async () => {
        await page.locator("#objectVectorStudioV2ObjectTagInput").fill("dirty-state");
        await page.locator("#objectVectorStudioV2AddTagButton").click();
      });
      await expectObjectVectorDirtyAfter("object state add edit", async () => {
        const selectedObjectId = await page.evaluate(() => window.__objectVectorStudioV2App.selectedObjectId);
        const stateId = await page.evaluate(() => {
          const app = window.__objectVectorStudioV2App;
          const existing = new Set(app.objectStates(app.selectedObject()).map((state) => state.id));
          return ["idle", "move", "active", "inactive", "damaged", "destroyed"].find((candidate) => !existing.has(candidate)) || "";
        });
        expect(stateId).toBeTruthy();
        const selectedObjectTile = page.locator(`.object-vector-studio-v2__object-tile[data-object-id="${selectedObjectId}"]`);
        await selectedObjectTile.locator(`[data-object-state-select="${selectedObjectId}"]`).selectOption(stateId);
        await expect(selectedObjectTile.locator("[data-object-state-action='add']")).toBeEnabled();
        await selectedObjectTile.locator("[data-object-state-action='add']").click();
      });
      await expectObjectVectorDirtyAfter("object state delete edit", async () => {
        const selectedObjectId = await page.evaluate(() => window.__objectVectorStudioV2App.selectedObjectId);
        const selectedObjectTile = page.locator(`.object-vector-studio-v2__object-tile[data-object-id="${selectedObjectId}"]`);
        await expect(selectedObjectTile.locator("[data-object-state-action='delete']")).toBeEnabled();
        await selectedObjectTile.locator("[data-object-state-action='delete']").click();
      });
      await expectObjectVectorDirtyAfter("object geometry edit", async () => {
        await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-shape-geometry-field='points'][data-polygon-point-index='0'][data-polygon-point-axis='x']").fill("11");
        await page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-shape-geometry-field='points'][data-polygon-point-index='0'][data-polygon-point-axis='x']").dispatchEvent("change");
      });
      await expectObjectVectorDirtyAfter("object geometry point handle drag edit", async () => {
        const handle = page.locator("#objectVectorStudioV2RenderSurface [data-geometry-point-handle='polygon-0']");
        await expect(handle).toHaveCount(1);
        const pointBefore = await page.evaluate(() => ({ ...window.__objectVectorStudioV2App.selectedShape().geometry.points[0] }));
        const pointsBefore = await page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']").getAttribute("points");
        const handleBoxBefore = await handle.boundingBox();
        expect(handleBoxBefore).not.toBeNull();
        const x = handleBoxBefore.x + handleBoxBefore.width / 2;
        const y = handleBoxBefore.y + handleBoxBefore.height / 2;
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(x + 18, y + 12, { steps: 4 });
        await expect.poll(async () => page.evaluate(() => ({ ...window.__objectVectorStudioV2App.selectedShape().geometry.points[0] }))).not.toEqual(pointBefore);
        const livePoint = await page.evaluate(() => ({ ...window.__objectVectorStudioV2App.selectedShape().geometry.points[0] }));
        await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-index='0'][data-polygon-point-axis='x']")).toHaveValue(livePoint.x.toFixed(3));
        await expect(page.locator("#objectVectorStudioV2ShapeGeometryDetails [data-polygon-point-index='0'][data-polygon-point-axis='y']")).toHaveValue(livePoint.y.toFixed(3));
        await expect.poll(async () => page.locator("#objectVectorStudioV2RenderSurface [data-shape-index='0']").getAttribute("points")).not.toBe(pointsBefore);
        await expect.poll(async () => {
          const box = await handle.boundingBox();
          return box ? { x: Math.round(box.x), y: Math.round(box.y) } : null;
        }).not.toEqual({ x: Math.round(handleBoxBefore.x), y: Math.round(handleBoxBefore.y) });
        const dirtyWhileDragging = await readObjectVectorWorkspaceSession(page);
        expect(dirtyWhileDragging.dirty.isDirty).toBe(true);
        await page.mouse.up();
        const pointAfter = await page.evaluate(() => ({ ...window.__objectVectorStudioV2App.selectedShape().geometry.points[0] }));
        expect(pointAfter).not.toEqual(pointBefore);
      });
      await expectObjectVectorDirtyAfter("object transform edit", async () => {
        await page.locator("#objectVectorStudioV2MoveXInput").fill("5");
        await page.locator("#objectVectorStudioV2MoveYInput").fill("-5");
        await page.locator("#objectVectorStudioV2MoveShapeButton").click();
      });
      await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        const nextPayload = app.cloneCurrentPayload();
        const object = nextPayload.objects.find((candidate) => candidate.id === "object.asteroids.ship");
        if (!object) {
          throw new Error("Asteroids ship object is missing for auto origin dirty test.");
        }
        object.objectOrigin = { x: 999, y: 999 };
        const validation = app.schemaService.validatePayload(nextPayload);
        if (!validation.ok) {
          throw new Error(validation.errors.join(" "));
        }
        app.currentPayload = validation.payload;
        app.syncWorkspaceToolSessionPayload(validation.payload, {
          changedKeys: ["data.objects"],
          reason: "object-vector-auto-origin-test-baseline"
        });
        app.selectObject("object.asteroids.ship", "auto origin dirty baseline");
        app.selectShape(0, "auto origin dirty baseline");
      });
      objectVectorSession = await readObjectVectorWorkspaceSession(page);
      lastDataText = objectVectorSession.dataText;
      await resetObjectVectorWorkspaceDirty(page);
      await expectObjectVectorDirtyAfter("object auto origin edit", async () => {
        await page.evaluate(() => {
          const app = window.__objectVectorStudioV2App;
          app.selectObject("object.asteroids.ship", "auto origin dirty test");
          app.selectShape(0, "auto origin dirty test");
          const shape = app.selectedShape();
          const frame = app.activeFrame();
          const override = frame?.shapeOverrides?.find((entry) => entry.shapeIndex === app.selectedShapeIndex) || null;
          const target = override || shape;
          target.transform = app.ensureShapeTransform(app.effectiveShape(shape));
          app.renderPayload({ syncPaletteSelection: false });
        });
        const autoOriginBefore = await page.evaluate(() => {
          const app = window.__objectVectorStudioV2App;
          const object = app.selectedObject();
          const shape = app.selectedShape();
          const bounds = app.rawVisibleObjectGeometryBounds(app.selectedObject());
          return {
            bounds,
            center: {
              x: Number((bounds.x + bounds.width / 2).toFixed(3)),
              y: Number((bounds.y + bounds.height / 2).toFixed(3))
            },
            geometryText: JSON.stringify(shape.geometry),
            objectOrigin: { ...object.objectOrigin }
          };
        });
        await page.evaluate(() => window.__objectVectorStudioV2App.autoOriginSelectedObjectPivot());
        await expect(page.locator("#statusLog")).toHaveValue(/OK Auto Origin updated object Asteroids Ship origin\/pivot from raw visible geometry bounds/);
        const autoOriginAfter = await page.evaluate(() => {
          const app = window.__objectVectorStudioV2App;
          const object = app.selectedObject();
          const shape = app.selectedShape();
          return {
            bounds: app.objectBounds(app.selectedObject(), { includeInvisible: false }),
            geometryText: JSON.stringify(shape.geometry),
            objectOrigin: { ...object.objectOrigin }
          };
        });
        expect(autoOriginAfter.geometryText).toBe(autoOriginBefore.geometryText);
        ["x", "y", "width", "height"].forEach((key) => {
        expect(autoOriginAfter.bounds[key]).toBeCloseTo(autoOriginBefore.bounds[key], 3);
      });
      expect(autoOriginAfter.objectOrigin.x).toBeCloseTo(autoOriginBefore.center.x, 3);
      expect(autoOriginAfter.objectOrigin.y).toBeCloseTo(autoOriginBefore.center.y, 3);
      expect(autoOriginAfter.objectOrigin.x).not.toBeCloseTo(autoOriginBefore.objectOrigin.x, 3);
      });
      await page.evaluate(() => {
        const app = window.__objectVectorStudioV2App;
        app.selectObject("object.asteroids.large-asteroid", "dirty state continuation");
        app.selectShape(0, "dirty state continuation");
      });
      await expectObjectVectorDirtyAfter("palette color edit", async () => {
        await page.locator("#objectVectorStudioV2PaintModeButton").click();
        const colorToApply = await page.evaluate(() => {
          const app = window.__objectVectorStudioV2App;
          const selectedFill = app.selectedShape()?.style?.fill || "";
          return app.runtimePalette.swatches
            .map((swatch) => swatch.value || swatch.hex || swatch.color || "")
            .find((color) => color && color !== selectedFill);
        });
        expect(colorToApply).toBeTruthy();
        await page.locator(`#objectVectorStudioV2PaletteSummary [data-palette-color="${colorToApply}"]`).click();
        const selectedShapeIndex = await page.evaluate(() => window.__objectVectorStudioV2App.selectedShapeIndex);
        await page.locator(`#objectVectorStudioV2RenderSurface [data-shape-index="${selectedShapeIndex}"]`).click();
      });
      await expectObjectVectorDirtyAfter("shape add edit", async () => {
        await drawDefaultObjectVectorShape(page, "rectangle");
      });
      await expectObjectVectorDirtyAfter("shape visibility edit", async () => {
        const selectedShapeIndex = await page.evaluate(() => window.__objectVectorStudioV2App.selectedShapeIndex);
        await page.locator(`[data-shape-visibility-index="${selectedShapeIndex}"]`).click();
      });
      await expectObjectVectorDirtyAfter("shape lock edit", async () => {
        await page.evaluate(() => window.__objectVectorStudioV2App.toggleSelectedShapeLock());
      });
      await expectObjectVectorDirtyAfter("shape unlock edit", async () => {
        await page.evaluate(() => window.__objectVectorStudioV2App.toggleSelectedShapeLock());
      });
      await expectObjectVectorDirtyAfter("shape delete edit", async () => {
        const selectedShapeIndex = await page.evaluate(() => window.__objectVectorStudioV2App.selectedShapeIndex);
        await page.locator(`[data-shape-delete-index="${selectedShapeIndex}"]`).click();
      });
      await expectObjectVectorDirtyAfter("object add edit", async () => {
        await page.locator("#objectVectorStudioV2ObjectNameInput").fill("Dirty Probe");
        await page.locator("#objectVectorStudioV2AddObjectButton").click();
      });
      await expectObjectVectorDirtyAfter("object rename edit", async () => {
        await page.locator("#objectVectorStudioV2ObjectNameInput").fill("Dirty Probe Renamed");
        await page.locator("#objectVectorStudioV2RenameObjectButton").click();
      });
      await expectObjectVectorDirtyAfter("object duplicate edit", async () => {
        await page.locator("#objectVectorStudioV2DuplicateObjectButton").click();
      });
      const validDirtyObjectVectorSession = await expectObjectVectorDirtyAfter("object delete edit", async () => {
        const selectedObjectId = await page.evaluate(() => window.__objectVectorStudioV2App.selectedObjectId);
        await page.locator(`[data-object-control="delete"][data-object-control-id="${selectedObjectId}"]`).click();
      }, { resetDirty: false });

      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);
      await expectWorkspaceReturnedFromTool(page, { dirty: true });
      const objectVectorTile = page.locator('[data-workspace-tool-id="object-vector-studio-v2"]');
      await expect(objectVectorTile).toHaveAttribute("data-workspace-tool-dirty", "true");
      await expect(page.locator("#saveWorkspaceButton")).toBeEnabled();

      await page.evaluate(() => {
        const session = JSON.parse(sessionStorage.getItem("workspace.tools.object-vector-studio-v2"));
        session.data.objects[0].unexpected = "blocked";
        session.dirty = {
          isDirty: true,
          reason: "object-vector-invalid-save",
          changedAt: new Date().toISOString(),
          changedKeys: ["data.objects.invalid"]
        };
        sessionStorage.setItem("workspace.tools.object-vector-studio-v2", JSON.stringify(session));
        window.__workspaceManagerV2App.syncLifecycleControls();
      });
      await page.locator("#saveWorkspaceButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Save blocked: Workspace Manager V2 manifest\/toolState contract validation failed:/);
      const failedSaveState = await page.evaluate(() => ({
        dirty: JSON.parse(sessionStorage.getItem("workspace.tools.object-vector-studio-v2")).dirty,
        writes: JSON.parse(sessionStorage.getItem("workspace.repo.manifestWrites") || "[]")
      }));
      expect(failedSaveState.dirty).toMatchObject({
        isDirty: true,
        reason: "object-vector-invalid-save"
      });
      expect(failedSaveState.writes).toEqual([]);
      await expect(page.locator("#saveWorkspaceButton")).toBeEnabled();

      await page.evaluate((session) => {
        sessionStorage.setItem("workspace.tools.object-vector-studio-v2", JSON.stringify(session));
        window.__workspaceManagerV2App.syncLifecycleControls();
      }, validDirtyObjectVectorSession.session);
      await page.locator("#saveWorkspaceButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Saved and marked clean: workspace\.tools\.object-vector-studio-v2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save dirty\/clean validation: 1 dirty toolState payload persisted; 1 toolState key marked clean\./);
      await expect(objectVectorTile).toHaveAttribute("data-workspace-tool-dirty", "false");
      await expect(page.locator("#saveWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#closeWorkspaceButton")).toBeEnabled();
      const savedState = await page.evaluate(() => ({
        session: JSON.parse(sessionStorage.getItem("workspace.tools.object-vector-studio-v2")),
        writes: JSON.parse(sessionStorage.getItem("workspace.repo.manifestWrites") || "[]")
      }));
      expect(savedState.session.dirty).toEqual({
        isDirty: false,
        reason: null,
        changedAt: null,
        changedKeys: []
      });
      const writtenManifest = JSON.parse(savedState.writes.at(-1).contents);
      expect(writtenManifest.tools["object-vector-studio-v2"].objects.some((object) => object.name === "Dirty Probe Renamed")).toBe(true);
      expect(writtenManifest.tools["object-vector-studio-v2"].objects.find((object) => object.id === "object.asteroids.large-asteroid").tags).toContain("dirty-state");
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("syncs Workspace Manager V2 dirty lifecycle buttons and closes clean toolState data", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#saveWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#closeWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#cancelWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#activeGameContent button")).toHaveCount(0);
      await selectMockRepo(page);
      await expect(page.locator("#closeWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#saveWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#cancelWorkspaceButton")).toBeDisabled();
      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expectWorkspaceReturnRehydrated(page);
      await expect(page.locator("#saveWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#closeWorkspaceButton")).toBeEnabled();
      await expect(page.locator("#cancelWorkspaceButton")).toBeDisabled();

      await dirtyPaletteToolState(page, {
        hex: "#654321",
        name: "Close Guard Copper",
        symbol: "@"
      });
      await expect(page.locator('[data-workspace-tool-id="palette-manager-v2"]')).toHaveAttribute("data-workspace-tool-dirty", "true");
      await expect(page.locator("#saveWorkspaceButton")).toBeEnabled();
      await expect(page.locator("#closeWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#cancelWorkspaceButton")).toBeEnabled();

      expect((await readWorkspaceSessionHydration(page)).toolKeys).toContain("workspace.tools.palette-manager-v2");
      await expect(page.locator("#repoSelectedValue")).toHaveText("HTML-JavaScript-Gaming");

      await page.locator("#saveWorkspaceButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Saved and marked clean: workspace\.tools\.palette-manager-v2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save source binding: \/games\/Asteroids\/game\.manifest\.json\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Saved path: games\/Asteroids\/game\.manifest\.json\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save write validation: file content changed\./);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Saved file size: \d+ bytes\./);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Saved toolState items: (?:4 \(asset-manager-v2 assets=15; input-mapping-v2 actions=18 inputs=0; object-vector-studio-v2 objects=7; palette-manager-v2 swatches=11\)|5 \(asset-manager-v2 assets=15; input-mapping-v2 actions=18 inputs=0; object-vector-studio-v2 objects=7; palette-manager-v2 swatches=11; text2speech-V2 queue=(?:0|1)\))\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save validation result: game manifest valid; root\.tools toolState valid; saved context matched re-read file\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save dirty\/clean validation: 1 dirty toolState payload persisted; 1 toolState key marked clean\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Saved Workspace Manager V2 toolState context workspace-manager-v2-Asteroids\./);
      await expect(page.locator('[data-workspace-tool-id="palette-manager-v2"]')).toHaveAttribute("data-workspace-tool-dirty", "false");
      await expect(page.locator("#saveWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#closeWorkspaceButton")).toBeEnabled();
      await expect(page.locator("#cancelWorkspaceButton")).toBeDisabled();
      const savedHydration = await readWorkspaceSessionHydration(page);
      expect(savedHydration.dirtyByTool["palette-manager-v2"]).toEqual({
        isDirty: false,
        reason: null,
        changedAt: null,
        changedKeys: []
      });
      expect(savedHydration.dataByTool["palette-manager-v2"].swatches.at(-1)).toMatchObject({
        hex: "#654321",
        name: "Close Guard Copper",
        symbol: "@"
      });
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/Close Guard Copper/);
      const manifestWrites = await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.repo.manifestWrites") || "[]"));
      expect(manifestWrites.at(-1).path).toBe("HTML-JavaScript-Gaming/games/Asteroids/game.manifest.json");
      const writtenGameManifest = JSON.parse(manifestWrites.at(-1).contents);
      expect(writtenGameManifest.game["workspace"]).toBeUndefined();
      expect(writtenGameManifest.game.gameData).toBeUndefined();
      expect(writtenGameManifest.tools).toBeTruthy();
      expect(writtenGameManifest.tools["palette-manager-v2"].swatches.at(-1)).toMatchObject({
        hex: "#654321",
        name: "Close Guard Copper",
        source: "User Added",
        symbol: "@"
      });
      expect(Object.keys(writtenGameManifest.tools["asset-manager-v2"].assets)).toHaveLength(15);
      if (Object.hasOwn(writtenGameManifest.tools, "text2speech-V2")) {
        expect(writtenGameManifest.tools["text2speech-V2"]).toEqual(expect.any(Array));
      }

      await page.locator("#closeWorkspaceButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Close Workspace removed toolState key: workspace\.tools\.asset-manager-v2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Close Workspace removed toolState key: workspace\.tools\.collision-inspector-v2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Close Workspace removed toolState key: workspace\.tools\.palette-manager-v2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Close Workspace removed toolState key: workspace\.tools\.preview-generator-v2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Close Workspace removed toolState key: workspace\.tools\.storage-inspector-v2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Close Workspace removed toolState key: workspace\.repo\.reference\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Closed Workspace Manager V2 toolState\. Removed \d+ workspace toolState keys\./);
      await expect(page.locator("#repoSelectedValue")).toHaveText("not selected");
      await expect(page.locator("#activeGameSelect")).toBeDisabled();
      await expect(page.locator("#saveWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#closeWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#cancelWorkspaceButton")).toBeDisabled();
      await expectWorkspaceToolsDisabled(page);
      expect(await readWorkspaceSessionHydration(page)).toMatchObject({
        repoReference: null,
        toolKeys: []
      });
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("restores sessionStorage toolState read-only until repo folder handle rebinds save source", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expectWorkspaceReturnRehydrated(page);
      const hostContextId = await page.evaluate(() => {
        const app = window.__workspaceManagerV2App;
        const contextId = app.contextService.persistContext(app.activeContext);
        app.activeHostContextId = contextId;
        return contextId;
      });
      await dirtyPaletteToolState(page, {
        hex: "#2468ac",
        name: "Read Only Restore Blue",
        symbol: "&"
      });

      await page.goto(`${server.baseUrl}/tools/workspace-manager-v2/index.html?hostContextId=${hostContextId}`, { waitUntil: "networkidle" });
      await expectWorkspaceRestoreRequiresRepoRebind(page, { dirty: true });
      const restoredState = await page.evaluate(() => ({
        activeGameManifestPath: window.__workspaceManagerV2App.activeGame.manifestPath,
        hasRepoHandle: Boolean(window.__workspaceManagerV2App.activeRepoHandle),
        repoReference: JSON.parse(sessionStorage.getItem("workspace.repo.reference")),
        requiresRepoHandle: window.__workspaceManagerV2App.activeToolStateRequiresRepoHandle,
        writes: JSON.parse(sessionStorage.getItem("workspace.repo.manifestWrites") || "[]")
      }));
      expect(restoredState).toMatchObject({
        hasRepoHandle: false,
        requiresRepoHandle: true,
        writes: []
      });
      expect(restoredState.activeGameManifestPath).toBe(`sessionStorage:${hostContextId}`);
      expectRuntimeBindingMetadata(restoredState.repoReference, {
        bindingSource: "sessionStorage restore",
        boundManifestPath: `sessionStorage:${hostContextId}`,
        hasLiveRepoHandle: false,
        sourceBindingState: "missing-live-repo-handle"
      });
      await expect(page.locator("#statusLog")).toHaveValue(new RegExp(`WARN Runtime handle lost: hasLiveRepoHandle=false; sourceBindingState=missing-live-repo-handle; boundManifestPath=sessionStorage:${hostContextId}; bindingSource=sessionStorage restore\\. Required action: Pick Repo Folder to rebind game\\.manifest\\.json before Save or tool launch\\.`));

      await page.evaluate(() => window.__workspaceManagerV2App.saveWorkspaceSession());
      await expect(page.locator("#statusLog")).toHaveValue(new RegExp(`FAIL Save blocked: missing live repo folder handle for active toolState; active game source=sessionStorage:${hostContextId}; context\\.gameId=Asteroids; context\\.gameRoot=games/Asteroids/\\. Required action: Pick Repo Folder to rebind game\\.manifest\\.json before Save\\.`));
      expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.repo.manifestWrites") || "[]"))).toEqual([]);

      await rebindRestoredWorkspace(page, { dirty: true });
      const reboundState = await page.evaluate(() => ({
        activeGameManifestKind: window.__workspaceManagerV2App.activeGame.manifestKind,
        activeGameManifestPath: window.__workspaceManagerV2App.activeGame.manifestPath,
        hasRepoHandle: Boolean(window.__workspaceManagerV2App.activeRepoHandle),
        repoReference: JSON.parse(sessionStorage.getItem("workspace.repo.reference")),
        requiresRepoHandle: window.__workspaceManagerV2App.activeToolStateRequiresRepoHandle
      }));
      expect(reboundState).toMatchObject({
        activeGameManifestKind: "game-manifest",
        activeGameManifestPath: "/games/Asteroids/game.manifest.json",
        hasRepoHandle: true,
        requiresRepoHandle: false
      });
      expectRuntimeBindingMetadata(reboundState.repoReference);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Runtime handle rebound: hasLiveRepoHandle=true; sourceBindingState=bound; boundManifestPath=\/games\/Asteroids\/game\.manifest\.json; bindingSource=repo-folder-rebind\./);

      await page.locator("#saveWorkspaceButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save source binding: \/games\/Asteroids\/game\.manifest\.json\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Saved path: games\/Asteroids\/game\.manifest\.json\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save write validation: file content changed\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save validation result: game manifest valid; root\.tools toolState valid; saved context matched re-read file\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save dirty\/clean validation: 1 dirty toolState payload persisted; 1 toolState key marked clean\./);
      const saveState = await page.evaluate((contextId) => ({
        paletteSession: JSON.parse(sessionStorage.getItem("workspace.tools.palette-manager-v2")),
        repoReference: JSON.parse(sessionStorage.getItem("workspace.repo.reference")),
        savedContext: JSON.parse(sessionStorage.getItem(contextId)),
        writes: JSON.parse(sessionStorage.getItem("workspace.repo.manifestWrites") || "[]")
      }), hostContextId);
      expectRuntimeBindingMetadata(saveState.repoReference);
      expectRuntimeBindingMetadata(saveState.paletteSession.workspace);
      expect(saveState.paletteSession.dirty).toEqual({
        isDirty: false,
        reason: null,
        changedAt: null,
        changedKeys: []
      });
      expect(saveState.savedContext.tools["palette-manager-v2"].swatches.at(-1)).toMatchObject({
        hex: "#2468ac",
        name: "Read Only Restore Blue",
        source: "User Added",
        symbol: "&"
      });
      expect(saveState.writes.at(-1).path).toBe("HTML-JavaScript-Gaming/games/Asteroids/game.manifest.json");
      expect(JSON.parse(saveState.writes.at(-1).contents).tools["palette-manager-v2"].swatches.at(-1)).toMatchObject({
        hex: "#2468ac",
        name: "Read Only Restore Blue",
        source: "User Added",
        symbol: "&"
      });
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("rebinds restored session Save to the discovered game manifest source", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expectWorkspaceReturnRehydrated(page);
      const hostContextId = await page.evaluate(() => {
        const app = window.__workspaceManagerV2App;
        const contextId = app.contextService.persistContext(app.activeContext);
        app.activeHostContextId = contextId;
        app.activeGame = {
          id: app.activeGame.id,
          name: app.activeGame.name,
          manifestPath: `sessionStorage:${contextId}`
        };
        return contextId;
      });
      await dirtyPaletteToolState(page, {
        hex: "#987654",
        name: "Restored Binding Bronze",
        symbol: "%"
      });
      await page.locator("#saveWorkspaceButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(new RegExp(`INFO Save source rebound to /games/Asteroids/game\\.manifest\\.json for Asteroids\\.`));
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save source binding: \/games\/Asteroids\/game\.manifest\.json\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save write validation: file content changed\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save validation result: game manifest valid; root\.tools toolState valid; saved context matched re-read file\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save dirty\/clean validation: 1 dirty toolState payload persisted; 1 toolState key marked clean\./);
      const sourceBindingState = await page.evaluate((contextId) => ({
        activeGameManifestKind: window.__workspaceManagerV2App.activeGame.manifestKind,
        activeGameManifestPath: window.__workspaceManagerV2App.activeGame.manifestPath,
        savedContext: JSON.parse(sessionStorage.getItem(contextId)),
        writes: JSON.parse(sessionStorage.getItem("workspace.repo.manifestWrites") || "[]")
      }), hostContextId);
      expect(sourceBindingState.activeGameManifestKind).toBe("game-manifest");
      expect(sourceBindingState.activeGameManifestPath).toBe("/games/Asteroids/game.manifest.json");
      expect(sourceBindingState.savedContext.tools["palette-manager-v2"].swatches.at(-1)).toMatchObject({
        hex: "#987654",
        name: "Restored Binding Bronze",
        source: "User Added",
        symbol: "%"
      });
      expect(sourceBindingState.writes.at(-1).path).toBe("HTML-JavaScript-Gaming/games/Asteroids/game.manifest.json");
      expect(JSON.parse(sourceBindingState.writes.at(-1).contents).tools["palette-manager-v2"].swatches.at(-1)).toMatchObject({
        hex: "#987654",
        name: "Restored Binding Bronze",
        source: "User Added",
        symbol: "%"
      });
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("logs recovery action when restored Save cannot bind to a game manifest source", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expectWorkspaceReturnRehydrated(page);
      const hostContextId = await page.evaluate(() => {
        const app = window.__workspaceManagerV2App;
        const contextId = app.contextService.persistContext(app.activeContext);
        app.activeHostContextId = contextId;
        app.activeRepoHandle = null;
        app.contextService.clearDiscoveredGames();
        app.activeGame = {
          id: app.activeGame.id,
          name: app.activeGame.name,
          manifestPath: `sessionStorage:${contextId}`
        };
        return contextId;
      });
      await dirtyPaletteToolState(page, {
        hex: "#445566",
        name: "Missing Source Slate",
        symbol: "?"
      });
      await expect(page.locator("#saveWorkspaceButton")).toBeDisabled();
      await page.evaluate(() => window.__workspaceManagerV2App.saveWorkspaceSession());
      await expect(page.locator("#statusLog")).toHaveValue(new RegExp(`FAIL Save blocked: missing live repo folder handle for active toolState; active game source=sessionStorage:${hostContextId}; context\\.gameId=Asteroids; context\\.gameRoot=games/Asteroids/\\. Required action: Pick Repo Folder to rebind game\\.manifest\\.json before Save\\.`));
      expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.repo.manifestWrites") || "[]"))).toEqual([]);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("warns before Cancel clears dirty Workspace Manager V2 toolState data", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expectWorkspaceReturnRehydrated(page);

      await dirtyPaletteToolState(page, {
        hex: "#123456",
        name: "Cancel Guard Blue",
        symbol: "@"
      });
      await expect(page.locator('[data-workspace-tool-id="palette-manager-v2"]')).toHaveAttribute("data-workspace-tool-dirty", "true");
      await expect(page.locator("#saveWorkspaceButton")).toBeEnabled();
      await expect(page.locator("#closeWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#cancelWorkspaceButton")).toBeEnabled();

      page.once("dialog", async (dialog) => {
        expect(dialog.message()).toBe("Active toolState information will be lost. Cancel active game?");
        await dialog.dismiss();
      });
      await page.locator("#cancelWorkspaceButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Cancel Workspace warning: active toolState information will be lost: workspace\.tools\.palette-manager-v2\(palette-updated\)\./);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Cancel Workspace kept the active toolState\./);
      await expect(page.locator("#repoSelectedValue")).toHaveText("HTML-JavaScript-Gaming");
      expect((await readWorkspaceSessionHydration(page)).toolKeys).toContain("workspace.tools.palette-manager-v2");

      page.once("dialog", async (dialog) => {
        expect(dialog.message()).toBe("Active toolState information will be lost. Cancel active game?");
        await dialog.accept();
      });
      await page.locator("#cancelWorkspaceButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Cancel Workspace removed toolState key: workspace\.tools\.palette-manager-v2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Canceled Workspace Manager V2 toolState\. Removed \d+ workspace toolState keys\./);
      await expect(page.locator("#repoSelectedValue")).toHaveText("not selected");
      await expect(page.locator("#activeGameSelect")).toBeDisabled();
      await expect(page.locator("#cancelWorkspaceButton")).toBeDisabled();
      await expectWorkspaceToolsDisabled(page);
      expect(await readWorkspaceSessionHydration(page)).toMatchObject({
        repoReference: null,
        toolKeys: []
      });
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("blocks Workspace Manager V2 return restore when repo session reference is missing or invalid", async ({ page }) => {
    const pageErrors = [];
    const hostContextId = "workspace-manager-v2-missing-return-repo-reference";
    const gameManifest = JSON.parse(await readFile("games/Asteroids/game.manifest.json", "utf8"));
    const manifest = workspaceContextFromGameManifest(gameManifest, {
      repoPath: process.cwd().replaceAll("\\", "/"),
      repoRoot: "HTML-JavaScript-Gaming"
    });
    await page.addInitScript(({ contextId, workspaceManifest }) => {
      window.sessionStorage.setItem(contextId, JSON.stringify(workspaceManifest));
    }, { contextId: hostContextId, workspaceManifest: manifest });
    const server = await openWorkspaceManagerV2(page, `?hostContextId=${hostContextId}`);

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#repoSelectedValue")).toHaveText("not selected");
      await expect(page.locator("#activeGameSelect")).toBeDisabled();
      await expect(page.locator("#activeGameSelect option")).toHaveCount(0);
      await expect(page.locator("#saveWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#closeWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#cancelWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#workspaceContextOutput")).toHaveValue("{}");
      await expectWorkspaceToolsDisabled(page);
      await expect(page.locator("#activeGameSummary")).toHaveCount(0);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO workspace\.repo\.reference was not found in sessionStorage\. Pick Repo Folder to reselect repo before launching tools\./);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Workspace restore failed: workspace\.repo\.reference was not found in sessionStorage\. Pick Repo Folder to reselect repo before launching tools\./);
      expect(await readWorkspaceSessionHydration(page)).toMatchObject({
        repoReference: null,
        toolKeys: []
      });

      await page.evaluate(({ contextId, workspaceManifest }) => {
        window.sessionStorage.setItem(contextId, JSON.stringify(workspaceManifest));
        window.sessionStorage.setItem("workspace.repo.reference", "not-json");
      }, { contextId: hostContextId, workspaceManifest: manifest });
      await page.goto(`${server.baseUrl}/tools/workspace-manager-v2/index.html?hostContextId=${hostContextId}`, { waitUntil: "networkidle" });
      await expect(page.locator("#repoSelectedValue")).toHaveText("not selected");
      await expect(page.locator("#activeGameSelect")).toBeDisabled();
      await expectWorkspaceToolsDisabled(page);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Workspace restore failed: workspace\.repo\.reference contains invalid JSON:/);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("opens Preview Generator V2 workspace launch with actionable missing repo session status", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];
    const hostContextId = "workspace-manager-v2-display-root-context";
    const displayRootGameManifest = JSON.parse(await readFile("games/Asteroids/game.manifest.json", "utf8"));
    const displayRootManifest = workspaceContextFromGameManifest(displayRootGameManifest, {
      repoRoot: "HTML-JavaScript-Gaming"
    });

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.addInitScript(({ contextId, manifest }) => {
      window.sessionStorage.setItem(contextId, JSON.stringify(manifest));
    }, { contextId: hostContextId, manifest: displayRootManifest });
    await workspaceV2CoverageReporter.start(page);
    await page.goto(`${server.baseUrl}/tools/preview-generator-v2/index.html?launch=workspace&fromTool=workspace-manager-v2&hostContextId=${hostContextId}`, { waitUntil: "networkidle" });

    try {
      await expect(page.locator("#repoDestinationSection")).toBeHidden();
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
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("keeps Preview Generator V2 disabled for invalid workspace repo session state", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];
    const hostContextId = "workspace-manager-v2-invalid-repo-reference-context";
    const gameManifest = JSON.parse(await readFile("games/Asteroids/game.manifest.json", "utf8"));
    const manifest = workspaceContextFromGameManifest(gameManifest, {
      repoRoot: "HTML-JavaScript-Gaming"
    });

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
          schemaRole: "workspace-launch-context"
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
    await workspaceV2CoverageReporter.start(page);
    await page.goto(`${server.baseUrl}/tools/preview-generator-v2/index.html?launch=workspace&fromTool=workspace-manager-v2&hostContextId=${hostContextId}`, { waitUntil: "networkidle" });

    try {
      await expect(page.locator("#repoDestinationSection")).toBeHidden();
      await expect(page.locator("#executeBtn")).toBeDisabled();
      await expect(page.locator("#log")).toContainText("FAIL Workspace repo session hydration: workspace.repo.reference.displayName WrongRepo does not match manifest repoRoot HTML-JavaScript-Gaming.");
      await expect(page.locator("#log")).toContainText("Preview Generator V2 requires Workspace Manager V2 repo session storage before image generation.");
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("logs actionable Preview Generator V2 output path resolution failures", async ({ page }) => {
    await installMissingGamePreviewRepoPicker(page);
    const server = await openPreviewGeneratorV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await page.evaluate((repoRootPath) => {
        window.__missingGameRepoAbsolutePath = repoRootPath;
      }, manifestRepoPath(server));
      await page.locator("#pickRepoBtn").click();
      await expect(page.locator("#repoSelectedValue")).toHaveText("HTML-JavaScript-Gaming");
      await page.locator("#targetTypeGames").check();
      await page.locator("#baseUrl").fill(server.baseUrl);
      await page.locator("#sampleList").fill("MissingGame");
      await expect(page.locator("#executeBtn")).toBeEnabled();

      await page.locator("#executeBtn").click();
      const log = page.locator("#log");
      await expect(log).toContainText(`Repo root: ${displayRepoRootPath(server)}`, { timeout: 10000 });
      await expect(log).toContainText("FAIL Repo handle folder resolution: requested relative folder: games/MissingGame/assets/images; handle root name: HTML-JavaScript-Gaming; display repoRoot string: HTML-JavaScript-Gaming; session key used: workspace.repo.reference", { timeout: 10000 });
      await expect(log).toContainText("FAIL PATH MissingGame", { timeout: 10000 });
      await expect(log).toContainText("Unable to resolve target directory: Missing directory: HTML-JavaScript-Gaming/games/MissingGame", { timeout: 10000 });
      await expect(log).toContainText("relative output path: games/MissingGame/assets/images/preview.svg", { timeout: 10000 });
      await expect(log).toContainText(`repo root: ${displayRepoRootPath(server)}`, { timeout: 10000 });
      await expect(log).toContainText(`full absolute output path: ${displayAbsoluteOutputPath(server, "games/MissingGame/assets/images/preview.svg")}`, { timeout: 10000 });
      await expect(log).toContainText("source resolution context: preview-generator-v2 form controls; selected game: MissingGame; resolved assets/images target: assets/images; target type: games", { timeout: 10000 });
      await expect(log).not.toContainText("OK WRITE MissingGame");
      await expect(log).toContainText("Written: 0", { timeout: 10000 });
      await expect(log).toContainText("Failed: 1", { timeout: 10000 });
      await expect(log).toContainText("Skipped: 0", { timeout: 10000 });
      await expect(log).toContainText("Done.", { timeout: 10000 });
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("logs actionable Preview Generator V2 repo-root selection failures without fallback", async ({ page }) => {
    await installMissingGamePreviewRepoPicker(page);
    const server = await openPreviewGeneratorV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await page.locator("#pickRepoBtn").click();
      await expect(page.locator("#repoSelectedValue")).toHaveText("HTML-JavaScript-Gaming");
      await page.locator("#targetTypeGames").check();
      await page.locator("#baseUrl").fill(server.baseUrl);
      await page.locator("#sampleList").fill("MissingGame");
      await expect(page.locator("#executeBtn")).toBeEnabled();

      await page.locator("#executeBtn").click();
      const log = page.locator("#log");
      await expect(log).toContainText("FAIL Repo root path resolution: Repo root path is unavailable; cannot resolve a full absolute output path.", { timeout: 10000 });
      await expect(log).toContainText("Selected repo label: HTML-JavaScript-Gaming", { timeout: 10000 });
      await expect(log).toContainText("session key checked: workspace.repo.reference", { timeout: 10000 });
      await expect(log).toContainText("Required action: select the repo root folder again in Workspace Manager V2 or Pick Repo before generating previews.", { timeout: 10000 });
      await expect(log).toContainText("FAIL PATH MissingGame", { timeout: 10000 });
      await expect(log).toContainText("full absolute output path: (unavailable)", { timeout: 10000 });
      await expect(log).toContainText("Failed: 1", { timeout: 10000 });
      await expect(log).not.toContainText("OK WRITE MissingGame");
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
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
        return Object.fromEntries(await Promise.all(Object.entries(manifests).map(async ([gameId, manifest]) => {
          const workspaceManifest = service.workspaceManifestFromGameManifest({
            id: manifest.game.id,
            manifest,
            manifestKind: "game-manifest",
            manifestPath: `/games/${manifest.game.folder}/game.manifest.json`,
            name: manifest.game.name,
            repoRoot: "HTML-JavaScript-Gaming"
          });
          return [
            gameId,
            {
              gameManifest: await service.validateGameManifest(manifest),
              workspace: await service.validateGeneratedManifest(workspaceManifest)
            }
          ];
        })));
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
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Gravity Well context uses games\/GravityWell\/ and games\/GravityWell\/assets\./);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"gameRoot": "games\/GravityWell\/"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"assetsPath": "games\/GravityWell\/assets"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"assets.image.preview.preview"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"assets.image.background.preview"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"asset-browser"|"palette-browser"|"vector-map-editor"/);
      await expect(page.locator('[data-workspace-tool-id="asset-manager-v2"]')).toContainText("1 managed assets");
      await expect(page.locator('[data-workspace-tool-id="palette-manager-v2"]')).toContainText("10 palette swatches");
      await expect(page.locator('[data-workspace-tool-id="preview-generator-v2"]')).toContainText("Preview Not Found");
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
      expect(gravityManifest.tools["text2speech-V2"]).toBeUndefined();
      expect(gravityManifest.tools["asset-manager-v2"].assets["assets.image.background.preview"]).toBeUndefined();

      await page.locator('[data-workspace-tool-id="preview-generator-v2"]').click();
      await expect(page).toHaveURL(/preview-generator-v2\/index\.html.*launch=workspace/);
      await expect(page.locator("#repoDestinationSection")).toBeHidden();
      await expect(page.locator("#targetTypeGames")).toBeDisabled();
      await expect(page.locator("#sampleList")).toHaveValue("GravityWell");
      await expect(page.locator("#sampleList")).toBeDisabled();
      await expect(page.locator("#previewTargetValue")).toHaveText("games/GravityWell/assets/images/preview.svg");
      await expect(page.locator("#executeBtn")).toBeEnabled();
      await expect(page.locator("#log")).toContainText("OK Workspace repo session reference loaded from workspace.repo.reference for HTML-JavaScript-Gaming.");
      await expect(page.locator("#log")).toContainText("Workspace launch repo handle restored from workspace-manager-v2 runtime repo handle cache using workspace.repo.reference; independent repo selection is not required.");
      await expect(page.locator("#log")).toContainText("Generated preview target: games/GravityWell/assets/images/preview.svg");
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);
      await expectWorkspaceReturnedFromTool(page, { gameId: "GravityWell", gameName: "Gravity Well" });
      await page.locator("#closeWorkspaceButton").click();
      await expect(page.locator("#repoSelectedValue")).toHaveText("not selected");

      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Pong");
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Pong context uses games\/Pong\/ and games\/Pong\/assets\./);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"gameRoot": "games\/Pong\/"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"assetsPath": "games\/Pong\/assets"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"assets.image.preview.preview"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"assets.image.background.preview"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"asset-browser"|"palette-browser"|"vector-map-editor"/);
      await expect(page.locator('[data-workspace-tool-id="asset-manager-v2"]')).toContainText("1 managed assets");
      await expect(page.locator('[data-workspace-tool-id="palette-manager-v2"]')).toContainText("8 palette swatches");
      await expect(page.locator('[data-workspace-tool-id="preview-generator-v2"]')).toContainText("Preview Not Found");
      const pongManifest = JSON.parse(await page.locator("#workspaceContextOutput").inputValue());
      expect(pongManifest.repoPath).toBe(manifestRepoPath(server));
      expect(Object.keys(pongManifest.tools).sort()).toEqual(["asset-manager-v2", "palette-manager-v2"]);
      expect(pongManifest.tools["asset-manager-v2"].assets["assets.image.preview.preview"]).toEqual({
        path: "assets/images/preview1.svg",
        type: "image",
        kind: "svg",
        role: "preview",
        source: "manifest"
      });
      expect(pongManifest.tools["text2speech-V2"]).toBeUndefined();
      expect(pongManifest.tools["asset-manager-v2"].assets["assets.image.background.preview"]).toBeUndefined();

      await page.locator('[data-workspace-tool-id="preview-generator-v2"]').click();
      await expect(page).toHaveURL(/preview-generator-v2\/index\.html.*launch=workspace/);
      await expect(page.locator("#repoDestinationSection")).toBeHidden();
      await expect(page.locator("#targetTypeGames")).toBeDisabled();
      await expect(page.locator("#sampleList")).toHaveValue("Pong");
      await expect(page.locator("#sampleList")).toBeDisabled();
      await expect(page.locator("#previewTargetValue")).toHaveText("games/Pong/assets/images/preview.svg");
      await expect(page.locator("#executeBtn")).toBeEnabled();
      await expect(page.locator("#log")).toContainText("OK Workspace repo session reference loaded from workspace.repo.reference for HTML-JavaScript-Gaming.");
      await expect(page.locator("#log")).toContainText("Workspace launch repo handle restored from workspace-manager-v2 runtime repo handle cache using workspace.repo.reference; independent repo selection is not required.");
      await expect(page.locator("#log")).toContainText("Generated preview target: games/Pong/assets/images/preview.svg");
      await page.locator("#forceRewrite").check();
      await expect(page.locator("#executeBtn")).toBeEnabled();
      await page.locator("#executeBtn").click();
      await expect(page.locator("#log")).toContainText("Force rewrite: true", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText(`Repo root: ${displayRepoRootPath(server)}`, { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("RUN  Pong", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("OK WRITE Pong", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("Write verification content starts as SVG: true.", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("Write verification handle-relative path: games/Pong/assets/images/preview.svg.", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("Handle-relative output path: games/Pong/assets/images/preview.svg", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText(`Absolute display path: ${displayAbsoluteOutputPath(server, "games/Pong/assets/images/preview.svg")}`, { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("Source resolution context: workspace.tools.preview-generator-v2.data; selected game: Pong; resolved assets/images target: assets/images; target type: games", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText(`Write verification passed: file exists at ${displayAbsoluteOutputPath(server, "games/Pong/assets/images/preview.svg")}.`, { timeout: 20000 });
      await expect(page.locator("#log")).toContainText(`Force rewrite verification passed for ${displayAbsoluteOutputPath(server, "games/Pong/assets/images/preview.svg")}.`, { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("Written: 1", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("Failed: 0", { timeout: 20000 });
      await expect(page.locator("#log")).toContainText("Done.", { timeout: 20000 });
      const pongPreviewWrites = await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.repo.writes") || "[]"));
      expect(pongPreviewWrites.at(-1).path).toBe("HTML-JavaScript-Gaming/games/Pong/assets/images/preview.svg");
      expect(pongPreviewWrites.at(-1).contents).toContain("<svg");
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);
      await expectWorkspaceReturnedFromTool(page, { gameId: "Pong", gameName: "Pong" });

      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("blocks Workspace Manager V2 Save when the toolState file fails schema validation", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expect.poll(() => page.evaluate(() => sessionStorage.getItem("workspace.tools.asset-manager-v2"))).not.toBeNull();
      await page.evaluate(() => {
        const app = window.__workspaceManagerV2App;
        const session = JSON.parse(window.sessionStorage.getItem("workspace.tools.asset-manager-v2"));
        session.data.unexpected = true;
        session.dirty = {
          isDirty: true,
          reason: "asset-updated",
          changedAt: new Date().toISOString(),
          changedKeys: ["data.unexpected"]
        };
        window.sessionStorage.setItem("workspace.tools.asset-manager-v2", JSON.stringify(session));
        const metrics = app.contextSummaryMetrics(app.activeContext);
        app.applyContextResult({
          assetCount: metrics.assetCount,
          context: app.activeContext,
          game: app.activeGame,
          hostContextId: app.activeHostContextId,
          paletteSwatches: app.activeContext.tools["palette-manager-v2"].swatches
        });
      });
      await expect(page.locator("#saveWorkspaceButton")).toBeEnabled();
      await page.locator("#saveWorkspaceButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Save blocked: Workspace Manager V2 manifest\/toolState contract validation failed: root\.tools\.asset-manager-v2\.unexpected is not allowed/);
      expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.repo.manifestWrites") || "[]"))).toEqual([]);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("warns instead of injecting hardcoded Asteroids assets when manifest assets are empty", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];
    const asteroidsManifest = JSON.parse(await readFile("games/Asteroids/game.manifest.json", "utf8"));
    asteroidsManifest.tools["asset-manager-v2"].assets = {};

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
    await workspaceV2CoverageReporter.start(page);
    await page.goto(`${server.baseUrl}/tools/workspace-manager-v2/index.html`, { waitUntil: "networkidle" });

    try {
      await selectMockRepo(page);
      await page.locator("#activeGameSelect").selectOption("Asteroids");
      await expect(page.locator("#activeAssetRegistrySummary")).toHaveCount(0);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"assets": \{\}/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"vector-map-editor"/);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Warning: \/games\/Asteroids\/game\.manifest\.json has no Asteroids Asset Manager V2 assets; Workspace Manager V2 did not inject hardcoded assets\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded Asteroids from \/games\/Asteroids\/game\.manifest\.json with 10 active palette colors and 0 managed assets\./);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("owns temporary UAT manifest seeding and launches Asset Manager V2 through session context", async ({ page }) => {
    const server = await openWorkspaceManagerV2(page, "?workspace=uat");
    const pageErrors = [];
    const uatManifest = JSON.parse(await readFile("tests/fixtures/workspace-v2/uat.manifest.json", "utf8"));

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#seedUatManifestButton")).toBeVisible();
      await expect(page.locator("#saveWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#closeWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#cancelWorkspaceButton")).toBeDisabled();
      await page.locator("#seedUatManifestButton").click();
      const uatManifestValidation = await page.evaluate(async (manifest) => {
        const { WorkspaceManagerV2ContextService } = await import("/tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js");
        return new WorkspaceManagerV2ContextService().validateGameManifest(manifest);
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
      await expect(page.locator('[data-workspace-tool-id="preview-generator-v2"]')).toContainText("Preview Not Found");
      await expect(page.locator('[data-workspace-tool-id="storage-inspector-v2"]')).toContainText("Storage Inspector V2");
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"id": "workspace-manager-v2-_template"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"gameRoot": "games\/_template\/"/);
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"assetsPath": "games\/_template\/assets"/);
      expect(JSON.parse(await page.locator("#workspaceContextOutput").inputValue()).repoPath).toBeUndefined();
      await expect(page.locator("#workspaceContextOutput")).toHaveValue(/"sourceId": "tests\/fixtures\/workspace-v2\/uat.manifest.json"/);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded UAT game manifest fixture workspace-manager-v2-_template from \/tests\/fixtures\/workspace-v2\/uat\.manifest\.json\./);

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
      await workspaceV2CoverageReporter.stop(page);
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
      await expect(page.locator("#assetLaunchGuardMessage")).toHaveText("Asset Manager V2 is only available through Workspace Manager with a game manifest and palette.");
      await expect(page.locator("#assetLaunchGuardReason")).toContainText("Temporary workspace query launches are no longer supported; launch through Workspace Manager V2.");
      await expect(page.locator("#assetLaunchGuardReturnToToolsButton")).toHaveText("Return to Tools");
      await expect(page.locator("body")).toHaveClass(/asset-manager-v2--launch-blocked/);
      expect(pageErrors).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });
});

