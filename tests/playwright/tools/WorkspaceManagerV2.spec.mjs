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

async function openPreviewGeneratorV2(page, query = "") {
  const server = await startRepoServer();
  await coverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/preview-generator-v2/index.html${query}`, { waitUntil: "networkidle" });
  return server;
}

async function openTextToSpeechTool(page, query = "", speechOptions = {}) {
  const server = await startRepoServer();
  await installMockSpeechSynthesis(page, speechOptions);
  await coverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/text2speach-V2/index.html${query}`, { waitUntil: "networkidle" });
  return server;
}

async function selectTextToSpeechTile(page, itemId) {
  await page.locator(`[data-speech-item-id="${itemId}"]`).click();
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

function displayRepoRootPath(server) {
  return server.repoRoot.replaceAll("/", "\\").replace(/\\+$/, "");
}

function displayAbsoluteOutputPath(server, relativePath) {
  return `${displayRepoRootPath(server)}\\${relativePath.replaceAll("/", "\\")}`;
}

const MOCK_TEXT2SPEACH_LANGUAGE_VALUES = [
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

const MOCK_TEXT2SPEACH_EN_US_VOICE_VALUES = [
  "mock-google-us-english",
  "mock-microsoft-david",
  "mock-microsoft-mark",
  "mock-microsoft-zira"
];

const MOCK_TEXT2SPEACH_EN_US_DETAILS = [
  "4 voices match Any:",
  "- en-US: Google US English",
  "- en-US: Microsoft David - English (United States)",
  "- en-US: Microsoft Mark - English (United States)",
  "- en-US: Microsoft Zira - English (United States)"
].join("\n");

const MOCK_TEXT2SPEACH_GENDER_FILTER_VALUES = ["any", "male-preferred", "female-preferred"];

const MOCK_TEXT2SPEACH_AGE_FILTER_VALUES = ["any", "adult", "child", "elderly", "teen"];

const MOCK_TEXT2SPEACH_FEMALE_LANGUAGE_VALUES = [
  "de-DE",
  "en-GB",
  "en-US",
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

const MOCK_TEXT2SPEACH_MALE_LANGUAGE_VALUES = MOCK_TEXT2SPEACH_LANGUAGE_VALUES;

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
        games[gameFolder] = makeDirectoryHandle(gameFolder, {
          assets: makeDirectoryHandle("assets", {
            images: makeDirectoryHandle("images", {}, `${gamePath}/assets/images`, config)
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
          repoName: reference?.displayName || repoHandle?.name || "HTML-JavaScript-Gaming"
        }));
      },
      async restore({ reference }) {
        const rawValue = window.sessionStorage.getItem("workspace-manager-v2-mock-repo-handle-cache");
        const cachedConfig = rawValue ? JSON.parse(rawValue) : {};
        return await makeMockRepoHandle({
          failPreviewRead: Boolean(cachedConfig.failPreviewRead),
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
    window["__text2speach-V2Canceled"] = 0;
    window["__text2speach-V2Paused"] = 0;
    window["__text2speach-V2Resumed"] = 0;
    window["__text2speach-V2Spoken"] = [];
    window["__text2speach-V2LoadVoices"] = () => {
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
          window["__text2speach-V2Canceled"] += 1;
        },
        getVoices() {
          return voicesAvailable ? voiceOptions : [];
        },
        pause() {
          window["__text2speach-V2Paused"] += 1;
        },
        removeEventListener(type, listener) {
          if (type === "voiceschanged") {
            voiceListeners.delete(listener);
          }
        },
        resume() {
          window["__text2speach-V2Resumed"] += 1;
        },
        speak(utterance) {
          window["__text2speach-V2Spoken"].push({
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
  await expect(page.locator("#workspaceToolTiles [data-workspace-tool-id]")).toHaveCount(6);
  expect(await page.locator("#workspaceToolTiles [data-workspace-tool-id]").evaluateAll((tiles) => tiles.every((tile) => tile.disabled))).toBe(true);
}

async function expectWorkspaceReturnRehydrated(page, { gameId = "Asteroids", repoName = "HTML-JavaScript-Gaming" } = {}) {
  await expect(page.locator("#repoSelectedValue")).toHaveText(repoName);
  await expect(page.locator("#pickRepoBtn")).toBeDisabled();
  await expect(page.locator("#activeGameSelect")).toHaveValue(gameId);
  await expect(page.locator("#activeGameSelect")).toBeDisabled();
  await expect(page.locator('[data-workspace-tool-id="asset-manager-v2"]')).toBeEnabled();
  await expect(page.locator('[data-workspace-tool-id="palette-manager-v2"]')).toBeEnabled();
  await expect(page.locator('[data-workspace-tool-id="preview-generator-v2"]')).toBeEnabled();
  await expect(page.locator('[data-workspace-tool-id="session-inspector-v2"]')).toBeEnabled();
  await expect(page.locator('[data-workspace-tool-id="text2speach-V2"]')).toBeEnabled();
}

async function expectWorkspaceRestoreRequiresRepoRebind(page, { dirty = false, gameId = "Asteroids", repoName = "HTML-JavaScript-Gaming" } = {}) {
  await expect(page.locator("#repoSelectedValue")).toHaveText(repoName);
  await expect(page.locator("#pickRepoBtn")).toBeEnabled();
  await expect(page.locator("#activeGameSelect")).toHaveValue(gameId);
  await expect(page.locator("#activeGameSelect")).toBeDisabled();
  await expect(page.locator("#saveWorkspaceButton")).toBeDisabled();
  await expect(page.locator("#closeWorkspaceButton"))[dirty ? "toBeDisabled" : "toBeEnabled"]();
  await expect(page.locator("#cancelWorkspaceButton")).toBeEnabled();
  await expect(page.locator('[data-workspace-tool-id="asset-manager-v2"]')).toBeDisabled();
  await expect(page.locator('[data-workspace-tool-id="palette-manager-v2"]')).toBeDisabled();
  await expect(page.locator('[data-workspace-tool-id="preview-generator-v2"]')).toBeDisabled();
  await expect(page.locator('[data-workspace-tool-id="session-inspector-v2"]')).toBeDisabled();
  await expect(page.locator('[data-workspace-tool-id="text2speach-V2"]')).toBeDisabled();
  await expect(page.locator('[data-workspace-tool-id="preview-generator-v2"]')).toContainText("Repo folder required");
  await expect(page.locator("#activeGameSummary")).toContainText("Pick Repo Folder to rebind game.manifest.json before Save or tool launch.");
  await expect(page.locator("#statusLog")).toHaveValue(/WARN Restored .* as read-only toolState context: missing live repo folder handle\. Required action: Pick Repo Folder to rebind .*game\.manifest\.json before Save or tool launch\./);
}

async function rebindRestoredWorkspace(page, { dirty = false, gameId = "Asteroids", repoName = "HTML-JavaScript-Gaming" } = {}) {
  await page.evaluate((nextRepoName) => {
    window.__workspaceManagerV2MockRepoConfig = { repoName: nextRepoName };
  }, repoName);
  await page.locator("#pickRepoBtn").click();
  await expectWorkspaceReturnRehydrated(page, { gameId, repoName });
  await expect(page.locator("#saveWorkspaceButton"))[dirty ? "toBeEnabled" : "toBeDisabled"]();
  await expect(page.locator("#closeWorkspaceButton"))[dirty ? "toBeDisabled" : "toBeEnabled"]();
  await expect(page.locator("#cancelWorkspaceButton")).toBeEnabled();
  await expect(page.locator("#statusLog")).toHaveValue(new RegExp(`OK Rebound restored .* toolState to /games/${gameId}/game\\.manifest\\.json after repo folder selection\\.`));
}

async function expectWorkspaceReturnedFromTool(page, { dirty = false, enabledToolCount = 5, gameId = "Asteroids", gameName = "Asteroids", repoName = "HTML-JavaScript-Gaming" } = {}) {
  await expectWorkspaceReturnRehydrated(page, { gameId, repoName });
  await expect(page.locator("#saveWorkspaceButton"))[dirty ? "toBeEnabled" : "toBeDisabled"]();
  await expect(page.locator("#closeWorkspaceButton"))[dirty ? "toBeDisabled" : "toBeEnabled"]();
  await expect(page.locator("#cancelWorkspaceButton")).toBeEnabled();
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

async function expectSessionInspectorV2DetailAccordionsIndependent(page) {
  const contentIds = [
    "sessionInspectorV2JsonContent",
    "sessionInspectorV2DataContent",
    "sessionInspectorV2DirtyContent",
    "sessionInspectorV2StatusContent"
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

const SESSION_INSPECTOR_V2_DETAIL_SECTIONS = [
  {
    contentId: "sessionInspectorV2JsonContent",
    outputSelector: "#sessionInspectorV2JsonOutput"
  },
  {
    contentId: "sessionInspectorV2DataContent",
    outputSelector: "#sessionInspectorV2DataOutput"
  },
  {
    contentId: "sessionInspectorV2DirtyContent",
    outputSelector: "#sessionInspectorV2DirtyOutput"
  },
  {
    contentId: "sessionInspectorV2StatusContent",
    outputSelector: "#statusLog"
  }
];

async function setSessionInspectorV2DetailSectionsOpen(page, openContentIds) {
  const openSet = new Set(openContentIds);
  for (const { contentId } of SESSION_INSPECTOR_V2_DETAIL_SECTIONS) {
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

async function expectSessionInspectorV2SharedDetailSpace(page, openContentIds) {
  await setSessionInspectorV2DetailSectionsOpen(page, openContentIds);
  const state = await page.evaluate((sections) => {
    const rightPanel = document.querySelector(".session-inspector-v2__panel--right");
    const rightRect = rightPanel.getBoundingClientRect();
    const details = sections.map((sectionInfo) => {
      const content = document.querySelector(`#${sectionInfo.contentId}`);
      const section = content.closest(".session-inspector-v2__accordion");
      const header = section.querySelector(".session-inspector-v2__accordion-header-row") || section.querySelector(".accordion-v2__header");
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
  }, SESSION_INSPECTOR_V2_DETAIL_SECTIONS);

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
      const textToSpeechToolCard = page.locator(".tools-platform-card", { has: page.locator("h3", { hasText: "Text to Speech V2" }) });
      await expect(textToSpeechToolCard).toBeVisible();
      await expect(textToSpeechToolCard.locator("a", { hasText: "Text to Speech V2" })).toHaveAttribute("href", "/tools/text2speach-V2/index.html");
      await expect(textToSpeechToolCard).toContainText("First-Class Tool V2 for browser speech synthesis");
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
      expect(toolsIndexState.utilitiesCards).toContain("Text to Speech V2");
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

  test("launches Text to Speech V2 with full TTS options, schema-complete queue, and speech actions", async ({ page }) => {
    const server = await openTextToSpeechTool(page);
    const pageErrors = [];
    const requiredSpeechOptionFields = [
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
      "queueMode",
      "characterPreset",
      "ssmlLikePreset"
    ];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("body[data-tool-id='text2speach-V2']")).toBeVisible();
      await expect(page).toHaveTitle("Text to Speech V2");
      await expect(page.locator("h1")).toHaveText("Text to Speech V2");
      await expect(page.locator(".tool-shell-common__header-frame")).toHaveCount(0);
      await expect(page.locator("[data-text2speach-v2-header] .tools-platform-frame__eyebrow")).toHaveText("Browser speech synthesis");
      await expect(page.locator("[data-text2speach-v2-header] .tools-platform-frame__meta")).toHaveText("Configure voices, helper filters, presets, named sentences, queue behavior, and runtime playback.");
      await expect(page.locator("[data-text2speach-v2-header] .tools-platform-frame__description")).toHaveText("Preview speech lines for narration, prompts, and menu feedback with schema-valid named sentence options.");
      const textToSpeechHeaderLayout = await page.locator("[data-text2speach-v2-header]").evaluate((header) => {
        const frame = header.querySelector(".tools-platform-frame");
        const summary = header.querySelector(".tools-platform-frame__accordion-summary");
        return {
          frameClass: frame?.className || "",
          summaryDisplay: summary ? getComputedStyle(summary).display : "",
          summaryJustify: summary ? getComputedStyle(summary).justifyContent : ""
        };
      });
      expect(textToSpeechHeaderLayout.frameClass).toContain("text2speach-V2__local-shell-frame");
      expect(textToSpeechHeaderLayout.summaryDisplay).toBe("flex");
      expect(textToSpeechHeaderLayout.summaryJustify).toBe("space-between");
      await expect(page.locator('[aria-controls="text2speach-V2TextContent"] > span:first-child')).toHaveText("Text to Speak");
      await expect(page.locator("#text2speach-V2TextContent")).not.toContainText("Speech text");
      await expect(page.locator('[aria-controls="text2speach-V2QueueContent"] > span:first-child')).toHaveText("Named Sentences");
      await expect(page.locator('[data-launch-mode-nav="tool"]')).toBeVisible();
      await expect(page.locator('[data-launch-mode-nav="workspace"]')).toBeHidden();
      await expect(page.locator("#text2speach-V2SpeechPreview")).toHaveCount(0);
      await expect(page.locator("#text2speach-V2SpeechText")).toHaveValue("Welcome to Toolbox Aid. This is the default Text to Speech V2 sample line for previewing narration, prompts, and menu feedback.");
      await expect(page.locator("#text2speach-V2SpeakButton")).toBeEnabled();
      await expect(page.locator("#text2speach-V2PauseButton")).toBeEnabled();
      await expect(page.locator("#text2speach-V2ResumeButton")).toBeEnabled();
      await expect(page.locator("#text2speach-V2StopButton")).toBeEnabled();
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Loaded 3 schema-complete Text to Speech V2 queue items\./);
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Loaded 4 matching SpeechSynthesis voices for Text to Speech V2 \(22 voices; 18 languages; gender=Any; age=Any; language=en-US\)\./);
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Text to Speech V2 ready\. SpeechSynthesis is available\./);
      await expect(page.locator("#text2speach-V2QueueSelect")).toHaveCount(0);
      expect(await page.locator("#text2speach-V2QueueTiles [data-speech-item-id]").evaluateAll((tiles) => tiles.map((tile) => tile.dataset.speechItemId))).toEqual(["narrator-welcome", "hero-ready", "alert-warning"]);
      expect(await page.locator("#text2speach-V2SpeechOptionsContent label").evaluateAll((labels) => labels.map((label) => label.getAttribute("for")))).toEqual([
        "text2speach-V2GenderFilterSelect",
        "text2speach-V2LanguageSelect",
        "text2speach-V2VoiceSelect",
        "text2speach-V2AgeFilterSelect",
        "text2speach-V2CharacterPresetSelect",
        "text2speach-V2SsmlLikePresetSelect",
        "text2speach-V2QueueModeSelect",
        "text2speach-V2VolumeSlider",
        "text2speach-V2RateSlider",
        "text2speach-V2PitchSlider",
        "text2speach-V2SpeechItemName"
      ]);
      expect(await page.locator("#text2speach-V2QueueContent [data-launch-mode-nav='tool'] button").evaluateAll((buttons) => buttons.map((button) => button.id))).toEqual([
        "text2speach-V2SpeakButton",
        "text2speach-V2PauseButton",
        "text2speach-V2ResumeButton",
        "text2speach-V2StopButton"
      ]);
      const namedSentenceTopControls = await page.locator("#text2speach-V2QueueContent").evaluate((content) => {
        const firstElement = Array.from(content.children).find((child) => child.nodeType === Node.ELEMENT_NODE);
        return firstElement?.getAttribute("data-launch-mode-nav") || "";
      });
      expect(namedSentenceTopControls).toBe("tool");
      expect(await page.locator("#text2speach-V2SpeechOptionsContent .text2speach-V2__item-actions button").evaluateAll((buttons) => buttons.map((button) => button.textContent.trim()))).toEqual(["Add", "Duplicate", "Delete"]);
      const statusHeaderOrder = await page.locator(".text2speach-V2__status-accordion-header").evaluate((header) => Array.from(header.querySelectorAll(":scope > span, :scope > div > span, :scope > div > button"), (element) => element.textContent.trim()));
      expect(statusHeaderOrder).toEqual(["Status", "+", "Clear"]);
      expect(await page.locator("#text2speach-V2GenderFilterSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEACH_GENDER_FILTER_VALUES);
      expect(await page.locator("#text2speach-V2AgeFilterSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEACH_AGE_FILTER_VALUES);
      expect(await page.locator("#text2speach-V2LanguageSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEACH_LANGUAGE_VALUES);
      expect(await page.locator("#text2speach-V2VoiceSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEACH_EN_US_VOICE_VALUES);
      await expect(page.locator("#text2speach-V2VoiceDetails")).toHaveText(MOCK_TEXT2SPEACH_EN_US_DETAILS);
      expect(await page.locator("#text2speach-V2QueueModeSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(["append", "replace"]);
      await expect(page.locator("#text2speach-V2RepeatCountSelect")).toHaveCount(0);
      await expect(page.locator("#text2speach-V2DelayBetweenRepeatsMsSlider")).toHaveCount(0);
      expect(await page.locator("#text2speach-V2CharacterPresetSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(["manual", "alert", "calm", "dnd-dungeon-master", "dramatic", "narrator", "robot"]);
      await expect(page.locator("#text2speach-V2CharacterPresetSelect option[value='dnd-dungeon-master']")).toHaveText("D&D Dungeon Master");
      expect(await page.locator("#text2speach-V2SsmlLikePresetSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(["normal", "slow", "whisper-ish"]);
      await expect(page.locator("#text2speach-V2CharacterPresetSelect")).toHaveValue("narrator");
      await expect(page.locator("#text2speach-V2SsmlLikePresetSelect")).toHaveValue("normal");
      await expect(page.locator("#text2speach-V2AutoSpeakCheckbox")).toHaveCount(0);
      await expect(page.locator("body")).not.toContainText(/multi[- ]?thread|threaded|parallel speech|at the same time/i);
      await expect(page.locator("#text2speach-V2VolumeSlider")).toHaveAttribute("min", "0");
      await expect(page.locator("#text2speach-V2VolumeSlider")).toHaveAttribute("max", "1");
      await expect(page.locator("#text2speach-V2VolumeSlider")).toHaveAttribute("step", "0.01");
      await expect(page.locator("#text2speach-V2VolumeSlider")).toHaveValue("1");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveAttribute("min", "0.1");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveAttribute("max", "2");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveAttribute("step", "0.1");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("1");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveAttribute("min", "0.1");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveAttribute("max", "2");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveAttribute("step", "0.1");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("1");
      const pitchHelperScale = page.locator("#text2speach-V2PitchHelperScale");
      await expect(page.locator("#text2speach-V2PitchSlider + #text2speach-V2PitchHelperScale")).toBeVisible();
      await expect(pitchHelperScale).toHaveText("Male < Neutral > Female");
      expect(await pitchHelperScale.evaluate((node) => getComputedStyle(node).textAlign)).toBe("center");
      const pitchSliderBox = await page.locator("#text2speach-V2PitchSlider").boundingBox();
      const pitchHelperBox = await pitchHelperScale.boundingBox();
      expect(pitchSliderBox).not.toBeNull();
      expect(pitchHelperBox).not.toBeNull();
      expect(pitchHelperBox.y).toBeGreaterThan(pitchSliderBox.y);
      await expect(page.locator("#text2speach-V2SpeechItemName")).toHaveValue("Narrator welcome");
      const schemaRequiredFields = await page.evaluate(async () => {
        const schema = await fetch("/tools/schemas/tools/text2speach-V2.schema.json", { cache: "no-store" }).then((response) => response.json());
        return {
          characterPresetEnum: schema.$defs.speechQueueItem.properties.characterPreset.enum,
          genderEnum: schema.$defs.speechQueueItem.properties.gender.enum,
          hasAutoSpeak: Object.hasOwn(schema.$defs.speechQueueItem.properties, "autoSpeak"),
          hasDelayBetweenRepeatsMs: Object.hasOwn(schema.$defs.speechQueueItem.properties, "delayBetweenRepeatsMs"),
          hasRepeatCount: Object.hasOwn(schema.$defs.speechQueueItem.properties, "repeatCount"),
          languagePattern: schema.$defs.speechQueueItem.properties.language.pattern,
          pitchMinimum: schema.$defs.speechQueueItem.properties.pitch.minimum,
          queueModeEnum: schema.$defs.speechQueueItem.properties.queueMode.enum,
          rateMaximum: schema.$defs.speechQueueItem.properties.rate.maximum,
          required: schema.$defs.speechQueueItem.required,
          ssmlLikePresetEnum: schema.$defs.speechQueueItem.properties.ssmlLikePreset.enum,
          voiceAgeEnum: schema.$defs.speechQueueItem.properties.voiceAge.enum
        };
      });
      expect(schemaRequiredFields.required).toEqual(requiredSpeechOptionFields);
      expect(schemaRequiredFields.characterPresetEnum).toEqual(["manual", "alert", "calm", "dnd-dungeon-master", "dramatic", "narrator", "robot"]);
      expect(schemaRequiredFields.genderEnum).toEqual(MOCK_TEXT2SPEACH_GENDER_FILTER_VALUES);
      expect(schemaRequiredFields.languagePattern).toBe("^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$");
      expect(schemaRequiredFields.queueModeEnum).toEqual(["append", "replace"]);
      expect(schemaRequiredFields.pitchMinimum).toBe(0.1);
      expect(schemaRequiredFields.rateMaximum).toBe(2);
      expect(schemaRequiredFields.hasAutoSpeak).toBe(false);
      expect(schemaRequiredFields.hasRepeatCount).toBe(false);
      expect(schemaRequiredFields.hasDelayBetweenRepeatsMs).toBe(false);
      expect(schemaRequiredFields.ssmlLikePresetEnum).toEqual(["normal", "slow", "whisper-ish"]);
      expect(schemaRequiredFields.voiceAgeEnum).toEqual(MOCK_TEXT2SPEACH_AGE_FILTER_VALUES);
      const readySummary = JSON.parse(await page.locator("#text2speach-V2SpeechSummary").textContent());
      expect(readySummary.queue).toHaveLength(3);
      readySummary.queue.forEach((item) => {
        expect(requiredSpeechOptionFields.every((field) => Object.hasOwn(item, field))).toBe(true);
      });
      await selectTextToSpeechTile(page, "alert-warning");
      await expect(page.locator("#text2speach-V2SpeechItemName")).toHaveValue("Alert warning");
      await page.locator("#text2speach-V2SpeechItemName").fill("Alert danger");
      await expect(page.locator('[data-speech-item-id="alert-warning"] .text2speach-V2__queue-tile-name')).toHaveText("Alert danger");
      await expect(page.locator("#text2speach-V2SpeechSummary")).toContainText('"selectedQueueItemName": "Alert danger"');
      await page.locator("#text2speach-V2SpeechItemName").fill("");
      await page.locator("#text2speach-V2AddItemButton").click();
      await expect(page.locator("#text2speach-V2QueueTiles [data-speech-item-id]")).toHaveCount(3);
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/FAIL Text to Speech V2 Add blocked: Name is required before creating a named speech item\./);
      await page.locator("#text2speach-V2SpeechItemName").fill("Alert warning");
      await expect(page.locator("#text2speach-V2SpeechText")).toHaveValue("Warning. Incoming hazard detected. Please confirm the next action.");
      await expect(page.locator("#text2speach-V2GenderFilterSelect")).toHaveValue("female-preferred");
      await expect(page.locator("#text2speach-V2LanguageSelect")).toHaveValue("en-US");
      await expect(page.locator("#text2speach-V2VoiceSelect")).toHaveValue("mock-microsoft-zira");
      await expect(page.locator("#text2speach-V2AgeFilterSelect")).toHaveValue("adult");
      await expect(page.locator("#text2speach-V2CharacterPresetSelect")).toHaveValue("alert");
      await expect(page.locator("#text2speach-V2SsmlLikePresetSelect")).toHaveValue("normal");
      await expect(page.locator("#text2speach-V2QueueModeSelect")).toHaveValue("replace");
      await expect(page.locator("#text2speach-V2VolumeSlider")).toHaveValue("0.9");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("1.3");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("0.9");
      await expect(page.locator("#text2speach-V2VoiceDetails")).toHaveText([
        "2 voices match Female Preferred:",
        "- en-US: Google US English",
        "- en-US: Microsoft Zira - English (United States)"
      ].join("\n"));
      const alertSummary = JSON.parse(await page.locator("#text2speach-V2SpeechSummary").textContent());
      expect(alertSummary).toMatchObject({
        characterPreset: "alert",
        gender: "female-preferred",
        language: "en-US",
        pitch: 0.9,
        queueMode: "replace",
        rate: 1.3,
        selectedQueueItemId: "alert-warning",
        selectedQueueItemName: "Alert warning",
        ssmlLikePreset: "normal",
        status: "speech-item-renamed",
        text: "Warning. Incoming hazard detected. Please confirm the next action.",
        voice: "mock-microsoft-zira",
        voiceAge: "adult",
        volume: 0.9
      });
      await selectTextToSpeechTile(page, "narrator-welcome");
      await expect(page.locator("#text2speach-V2SpeechText")).toHaveValue("Welcome to Toolbox Aid. This is the default Text to Speech V2 sample line for previewing narration, prompts, and menu feedback.");
      await expect(page.locator("#text2speach-V2GenderFilterSelect")).toHaveValue("any");
      await expect(page.locator("#text2speach-V2LanguageSelect")).toHaveValue("en-US");
      await expect(page.locator("#text2speach-V2VoiceSelect")).toHaveValue("mock-google-us-english");
      await expect(page.locator("#text2speach-V2AgeFilterSelect")).toHaveValue("any");
      await expect(page.locator("#text2speach-V2CharacterPresetSelect")).toHaveValue("narrator");
      await expect(page.locator("#text2speach-V2QueueModeSelect")).toHaveValue("replace");
      await expect(page.locator("#text2speach-V2SpeechItemName")).toHaveValue("Narrator welcome");
      await expect(page.locator("#text2speach-V2VolumeSlider")).toHaveValue("1");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("1");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("1");
      await page.locator("#text2speach-V2SpeakButton").click();
      await expect.poll(async () => (await page.evaluate(() => window["__text2speach-V2Spoken"])).length).toBe(1);
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Speech queued: Narrator welcome; mode=replace; en-US; voice=Google US English; rate=1; pitch=1; volume=1; queuedItems=1\./);
      await page.evaluate(() => {
        window["__text2speach-V2Canceled"] = 0;
        window["__text2speach-V2Paused"] = 0;
        window["__text2speach-V2Resumed"] = 0;
        window["__text2speach-V2Spoken"] = [];
        window["__text2speach-V2App"].engine.resetQueuedSpeechItems();
      });
      await page.locator("#text2speach-V2SpeechText").fill("");
      await expect(page.locator("#text2speach-V2SpeakButton")).toBeDisabled();
      await selectTextToSpeechTile(page, "hero-ready");
      await expect(page.locator("#text2speach-V2SpeechText")).toHaveValue("Systems ready. The hero prompt is queued for an upbeat menu confirmation.");
      await expect(page.locator("#text2speach-V2GenderFilterSelect")).toHaveValue("male-preferred");
      await expect(page.locator("#text2speach-V2LanguageSelect")).toHaveValue("en-GB");
      await expect(page.locator("#text2speach-V2VoiceSelect")).toHaveValue("mock-google-uk-english-male");
      await expect(page.locator("#text2speach-V2AgeFilterSelect")).toHaveValue("teen");
      await expect(page.locator("#text2speach-V2CharacterPresetSelect")).toHaveValue("dramatic");
      await expect(page.locator("#text2speach-V2QueueModeSelect")).toHaveValue("append");
      await expect(page.locator("#text2speach-V2SpeechItemName")).toHaveValue("Hero ready");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("1.2");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("1.4");
      await page.locator("#text2speach-V2SpeechText").fill("Mission control confirms launch readiness.");
      await expect(page.locator("#text2speach-V2SpeakButton")).toBeEnabled();
      await page.locator("#text2speach-V2AgeFilterSelect").selectOption("child");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("1.3");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("1.6");
      expect(await page.locator("#text2speach-V2LanguageSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEACH_MALE_LANGUAGE_VALUES);
      expect(await page.locator("#text2speach-V2VoiceSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(["mock-google-uk-english-male"]);
      await expect(page.locator("#text2speach-V2VoiceSelect")).toHaveValue("mock-google-uk-english-male");
      await expect(page.locator("#text2speach-V2VoiceDetails")).toHaveText("1 voices match Male Preferred:\n- en-GB: Google UK English Male");
      await expect(page.locator("#text2speach-V2SpeakButton")).toBeEnabled();
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Voice Age shaping applied: Child; rate=1\.3; pitch=1\.6\./);
      await page.locator("#text2speach-V2AgeFilterSelect").selectOption("any");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("1.1");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("1.2");
      await expect(page.locator("#text2speach-V2VoiceSelect")).toHaveValue("mock-google-uk-english-male");
      await expect(page.locator("#text2speach-V2SpeakButton")).toBeEnabled();
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Voice Age shaping applied: Any; rate=1\.1; pitch=1\.2\./);
      await page.locator("#text2speach-V2AgeFilterSelect").selectOption("teen");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("1.2");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("1.4");
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Voice Age shaping applied: Teen; rate=1\.2; pitch=1\.4\./);
      await page.locator("#text2speach-V2AgeFilterSelect").selectOption("adult");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("1.1");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("1.2");
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Voice Age shaping applied: Adult; rate=1\.1; pitch=1\.2\./);
      await page.locator("#text2speach-V2AgeFilterSelect").selectOption("elderly");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("0.9");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("1");
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Voice Age shaping applied: Elderly; rate=0\.9; pitch=1\./);
      await page.locator("#text2speach-V2AgeFilterSelect").selectOption("any");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("1.1");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("1.2");
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Voice Age shaping applied: Any; rate=1\.1; pitch=1\.2\./);
      await page.locator("#text2speach-V2GenderFilterSelect").selectOption("any");
      await page.locator("#text2speach-V2LanguageSelect").selectOption("en-US");
      expect(await page.locator("#text2speach-V2VoiceSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEACH_EN_US_VOICE_VALUES);
      await page.locator("#text2speach-V2VoiceSelect").selectOption("mock-microsoft-zira");
      await page.locator("#text2speach-V2GenderFilterSelect").selectOption("male-preferred");
      expect(await page.locator("#text2speach-V2LanguageSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEACH_MALE_LANGUAGE_VALUES);
      expect(await page.locator("#text2speach-V2VoiceSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(["mock-google-us-english", "mock-microsoft-david", "mock-microsoft-mark"]);
      await expect(page.locator("#text2speach-V2VoiceSelect")).toHaveValue("mock-google-us-english");
      await expect(page.locator("#text2speach-V2VoiceDetails")).toHaveText([
        "3 voices match Male Preferred:",
        "- en-US: Google US English",
        "- en-US: Microsoft David - English (United States)",
        "- en-US: Microsoft Mark - English (United States)"
      ].join("\n"));
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Filtered 3 matching SpeechSynthesis voices for Text to Speech V2 \(20 Male Preferred voices from 22 total; 18 languages; gender=Male Preferred; age=Any; language=en-US\)\./);
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Filter counts: available languages=18; available voices=20; selected voice=Google US English \(en-US\); gender is a helper filter only, not a voice transformation\./);
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Voice selection adjusted for Male Preferred \/ en-US: Google US English \(en-US\)\./);
      await page.locator("#text2speach-V2LanguageSelect").selectOption("es-ES");
      await expect(page.locator("#text2speach-V2VoiceSelect option")).toHaveText(["Google espanol (es-ES)"]);
      await expect(page.locator("#text2speach-V2VoiceSelect")).toHaveValue("mock-google-espanol");
      await expect(page.locator("#text2speach-V2VoiceDetails")).toHaveText("1 voices match Male Preferred:\n- es-ES: Google espanol");
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Filter counts: available languages=18; available voices=20; selected voice=Google espanol \(es-ES\); gender is a helper filter only, not a voice transformation\./);
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Voice selection adjusted for Male Preferred \/ es-ES: Google espanol \(es-ES\)\./);
      await page.locator("#text2speach-V2LanguageSelect").selectOption("en-GB");
      await expect(page.locator("#text2speach-V2VoiceSelect option")).toHaveText(["Google UK English Male (en-GB)"]);
      await expect(page.locator("#text2speach-V2VoiceSelect")).toHaveValue("mock-google-uk-english-male");
      await expect(page.locator("#text2speach-V2VoiceDetails")).toHaveText("1 voices match Male Preferred:\n- en-GB: Google UK English Male");
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Voice selection adjusted for Male Preferred \/ en-GB: Google UK English Male \(en-GB\)\./);
      await page.locator("#text2speach-V2GenderFilterSelect").selectOption("female-preferred");
      expect(await page.locator("#text2speach-V2LanguageSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEACH_FEMALE_LANGUAGE_VALUES);
      await expect(page.locator("#text2speach-V2VoiceSelect option")).toHaveText(["Google UK English Female (en-GB)"]);
      await expect(page.locator("#text2speach-V2VoiceSelect")).toHaveValue("mock-google-uk-english-female");
      await expect(page.locator("#text2speach-V2VoiceDetails")).toHaveText("1 voices match Female Preferred:\n- en-GB: Google UK English Female");
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Filter counts: available languages=17; available voices=18; selected voice=Google UK English Female \(en-GB\); gender is a helper filter only, not a voice transformation\./);
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Voice selection adjusted for Female Preferred \/ en-GB: Google UK English Female \(en-GB\)\./);
      await page.locator("#text2speach-V2LanguageSelect").selectOption("es-US");
      await expect(page.locator("#text2speach-V2VoiceSelect option")).toHaveText(["Google espanol de Estados Unidos (es-US)"]);
      await expect(page.locator("#text2speach-V2VoiceSelect")).toHaveValue("mock-google-espanol-us");
      await expect(page.locator("#text2speach-V2VoiceDetails")).toHaveText("1 voices match Female Preferred:\n- es-US: Google espanol de Estados Unidos");
      await page.locator("#text2speach-V2GenderFilterSelect").selectOption("any");
      await page.locator("#text2speach-V2LanguageSelect").selectOption("en-GB");
      await expect(page.locator("#text2speach-V2VoiceSelect")).toHaveValue("mock-google-uk-english-female");
      await expect(page.locator("#text2speach-V2SpeakButton")).toBeEnabled();
      await page.locator("#text2speach-V2QueueModeSelect").selectOption("append");
      await page.locator("#text2speach-V2CharacterPresetSelect").selectOption("calm");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("0.8");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("1");
      await expect(page.locator("#text2speach-V2SsmlLikePresetSelect")).toHaveValue("normal");
      await page.locator("#text2speach-V2CharacterPresetSelect").selectOption("dnd-dungeon-master");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("0.8");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("0.5");
      await expect(page.locator("#text2speach-V2SsmlLikePresetSelect")).toHaveValue("normal");
      await page.locator("#text2speach-V2CharacterPresetSelect").selectOption("dramatic");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("1.1");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("1.2");
      await expect(page.locator("#text2speach-V2SsmlLikePresetSelect")).toHaveValue("normal");
      await page.locator("#text2speach-V2CharacterPresetSelect").selectOption("alert");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("1.3");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("0.9");
      await expect(page.locator("#text2speach-V2SsmlLikePresetSelect")).toHaveValue("normal");
      await page.locator("#text2speach-V2CharacterPresetSelect").selectOption("robot");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("0.9");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("0.8");
      await expect(page.locator("#text2speach-V2SsmlLikePresetSelect")).toHaveValue("normal");
      await page.locator("#text2speach-V2CharacterPresetSelect").selectOption("manual");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("1");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("1");
      await expect(page.locator("#text2speach-V2VolumeSlider")).toHaveValue("1");
      await expect(page.locator("#text2speach-V2SsmlLikePresetSelect")).toHaveValue("normal");
      await page.locator("#text2speach-V2CharacterPresetSelect").selectOption("dramatic");
      await page.locator("#text2speach-V2SsmlLikePresetSelect").selectOption("slow");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("0.8");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("1.1");
      await expect(page.locator("#text2speach-V2VolumeSlider")).toHaveValue("0.95");
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK SSML-like preset applied: slow; rate=0\.8; pitch=1\.1; volume=0\.95\./);
      await page.locator("#text2speach-V2RateSlider").fill("1.5");
      await page.locator("#text2speach-V2PitchSlider").fill("1.2");
      await page.locator("#text2speach-V2VolumeSlider").fill("0.8");
      await page.locator("#text2speach-V2AgeFilterSelect").selectOption("child");
      await expect(page.locator("#text2speach-V2RateOutput")).toHaveText("1.5");
      await expect(page.locator("#text2speach-V2PitchOutput")).toHaveText("1.2");
      await expect(page.locator("#text2speach-V2VolumeOutput")).toHaveText("0.8");
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Voice Age shaping applied: Child; rate=1\.5; pitch=1\.2\./);
      await expect(page.locator("#text2speach-V2SpeechSummary")).toContainText('"ssmlLikePreset": "slow"');
      await page.locator("#text2speach-V2SpeakButton").click();
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Speech queued: Hero ready; mode=append; en-GB; voice=Google UK English Female; rate=1\.5; pitch=1\.2; volume=0\.8; queuedItems=1\./);
      await expect(page.locator("#text2speach-V2SpeechSummary")).toContainText('"status": "speak-queued"');
      await selectTextToSpeechTile(page, "narrator-welcome");
      await page.locator("#text2speach-V2QueueModeSelect").selectOption("append");
      await page.locator("#text2speach-V2SpeakButton").click();
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Speech queued: Narrator welcome; mode=append; en-US; voice=Google US English; rate=1; pitch=1; volume=1; queuedItems=2\./);
      const spoken = await page.evaluate(() => window["__text2speach-V2Spoken"]);
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
        text: "Welcome to Toolbox Aid. This is the default Text to Speech V2 sample line for previewing narration, prompts, and menu feedback.",
        voiceName: "Google US English",
        volume: 1
      });
      expect(await page.evaluate(() => window["__text2speach-V2Canceled"])).toBe(0);
      const queuedSummary = JSON.parse(await page.locator("#text2speach-V2SpeechSummary").textContent());
      expect(queuedSummary.queuedSpeechItems).toHaveLength(2);
      await page.locator("#text2speach-V2PauseButton").click();
      await page.locator("#text2speach-V2ResumeButton").click();
      await page.locator("#text2speach-V2StopButton").click();
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Speech paused\./);
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Speech resumed\./);
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Speech queue stopped: 2 queued item\(s\) cleared\./);
      expect(await page.evaluate(() => window["__text2speach-V2Paused"])).toBe(1);
      expect(await page.evaluate(() => window["__text2speach-V2Resumed"])).toBe(1);
      expect(await page.evaluate(() => window["__text2speach-V2Canceled"])).toBe(1);
      await selectTextToSpeechTile(page, "alert-warning");
      await page.locator("#text2speach-V2SpeakButton").click();
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Speech queued: Alert warning; mode=replace; en-US; voice=Microsoft Zira - English \(United States\); rate=1\.3; pitch=0\.9; volume=0\.9; queuedItems=1\./);
      expect(await page.evaluate(() => window["__text2speach-V2Canceled"])).toBe(2);
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("populates text2speach-V2 voice dropdown when SpeechSynthesis voices arrive after load", async ({ page }) => {
    const server = await openTextToSpeechTool(page, "", { voicesInitiallyAvailable: false });
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#text2speach-V2VoiceSelect option")).toHaveText(["No SpeechSynthesis voices available"]);
      await expect(page.locator("#text2speach-V2VoiceSelect")).toHaveValue("");
      await expect(page.locator("#text2speach-V2SpeakButton")).toBeDisabled();
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/FAIL Text to Speech V2 voice dropdown has no SpeechSynthesis voices; waiting for voiceschanged\. Speak is disabled\./);
      await page.evaluate(() => window["__text2speach-V2LoadVoices"]());
      expect(await page.locator("#text2speach-V2GenderFilterSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEACH_GENDER_FILTER_VALUES);
      expect(await page.locator("#text2speach-V2LanguageSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEACH_LANGUAGE_VALUES);
      await expect(page.locator("#text2speach-V2VoiceSelect option")).toHaveCount(4);
      expect(await page.locator("#text2speach-V2VoiceSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEACH_EN_US_VOICE_VALUES);
      await expect(page.locator("#text2speach-V2VoiceSelect")).toHaveValue("mock-google-us-english");
      await expect(page.locator("#text2speach-V2VoiceDetails")).toHaveText(MOCK_TEXT2SPEACH_EN_US_DETAILS);
      await expect(page.locator("#text2speach-V2SpeakButton")).toBeEnabled();
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Updated 4 matching SpeechSynthesis voices for Text to Speech V2 \(22 voices; 18 languages; gender=Any; age=Any; language=en-US\)\./);
      const summary = JSON.parse(await page.locator("#text2speach-V2SpeechSummary").textContent());
      expect(summary.status).toBe("voices-updated");
      expect(summary.voice).toBe("mock-google-us-english");
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("includes unknown and neutral voices in text2speach-V2 preferred gender helper buckets", async ({ page }) => {
    const server = await openTextToSpeechTool(page, "", { includeNeutralVoice: true });
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await page.locator("#text2speach-V2GenderFilterSelect").selectOption("male-preferred");
      expect(await page.locator("#text2speach-V2LanguageSelect option").evaluateAll((options) => options.map((option) => option.value))).toContain("en-AU");
      await page.locator("#text2speach-V2LanguageSelect").selectOption("en-AU");
      await expect(page.locator("#text2speach-V2LanguageSelect")).toHaveValue("en-AU");
      await expect(page.locator("#text2speach-V2VoiceSelect option")).toHaveText(["Studio Neutral English (en-AU)"]);
      await expect(page.locator("#text2speach-V2VoiceSelect")).toHaveValue("mock-studio-neutral-english");
      await expect(page.locator("#text2speach-V2VoiceDetails")).toHaveText("1 voices match Male Preferred:\n- en-AU: Studio Neutral English");
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Filtered 1 matching SpeechSynthesis voices for Text to Speech V2 \(21 Male Preferred voices from 23 total; 19 languages; gender=Male Preferred; age=Any; language=en-AU\)\./);
      await page.locator("#text2speach-V2GenderFilterSelect").selectOption("female-preferred");
      await expect(page.locator("#text2speach-V2LanguageSelect")).toHaveValue("en-AU");
      await expect(page.locator("#text2speach-V2VoiceSelect option")).toHaveText(["Studio Neutral English (en-AU)"]);
      await expect(page.locator("#text2speach-V2VoiceDetails")).toHaveText("1 voices match Female Preferred:\n- en-AU: Studio Neutral English");
      await expect(page.locator("#text2speach-V2SpeakButton")).toBeEnabled();
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("shapes text2speach-V2 Voice Age without filtering selected voices", async ({ page }) => {
    const server = await openTextToSpeechTool(page, "", { includeAgeVoice: true });
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await page.locator("#text2speach-V2AgeFilterSelect").selectOption("child");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("1.2");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("1.4");
      expect(await page.locator("#text2speach-V2LanguageSelect option").evaluateAll((options) => options.map((option) => option.value))).toContain("en-AU");
      await expect(page.locator("#text2speach-V2LanguageSelect")).toHaveValue("en-US");
      expect(await page.locator("#text2speach-V2VoiceSelect option").evaluateAll((options) => options.map((option) => option.value))).toEqual(MOCK_TEXT2SPEACH_EN_US_VOICE_VALUES);
      await expect(page.locator("#text2speach-V2VoiceSelect")).toHaveValue("mock-google-us-english");
      await expect(page.locator("#text2speach-V2VoiceDetails")).toHaveText(MOCK_TEXT2SPEACH_EN_US_DETAILS);
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Voice Age shaping applied: Child; rate=1\.2; pitch=1\.4\./);
      await expect(page.locator("#text2speach-V2SpeakButton")).toBeEnabled();
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
      await expect(page.locator("#sessionInspectorV2DirtyHeaderValue")).toHaveText("Dirty: unknown");
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
      await expectSessionInspectorV2DetailAccordionsIndependent(page);

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
      await expect(page.locator("#sessionInspectorV2DirtyHeaderValue")).toHaveText("Dirty: unknown");
      await page.locator("#copySessionInspectorV2AllButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Copied JSON, Data, and Dirty sections with empty-state text for missing Data and Dirty\./);
      const copiedValidationText = await page.evaluate(() => window.__sessionInspectorV2ClipboardText);
      expect(copiedValidationText).toContain("=== JSON ===\nSession: sessionStorage:session-inspector-v2-alpha\ntrue");
      expect(copiedValidationText).toContain("=== Data ===\nSession: sessionStorage:session-inspector-v2-alpha\nNo data section is present for sessionStorage:session-inspector-v2-alpha.");
      expect(copiedValidationText).toContain("=== Dirty ===\nSession: sessionStorage:session-inspector-v2-alpha\nNo dirty section is present for sessionStorage:session-inspector-v2-alpha.");
      await page.locator("#clearSessionInspectorV2StatusButton").click();
      await expect(page.locator("#statusLog")).toHaveValue("");
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
      const longHorizontalToken = "session-inspector-v2-horizontal-scroll-probe".repeat(8);
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
          schemaRole: "workspace-launch-context",
          schemaRef: "tools/schemas/workspace.manifest.schema.json"
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
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id]")).toHaveCount(5);
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
      await expect(page.locator("#sessionInspectorV2DirtyHeaderValue")).toHaveText("Dirty: false");
      const allDetailContentIds = SESSION_INSPECTOR_V2_DETAIL_SECTIONS.map((section) => section.contentId);
      const fourOpenOutputHeight = await expectSessionInspectorV2SharedDetailSpace(page, allDetailContentIds);
      const threeOpenOutputHeight = await expectSessionInspectorV2SharedDetailSpace(page, allDetailContentIds.slice(0, 3));
      const twoOpenOutputHeight = await expectSessionInspectorV2SharedDetailSpace(page, allDetailContentIds.slice(0, 2));
      const oneOpenOutputHeight = await expectSessionInspectorV2SharedDetailSpace(page, allDetailContentIds.slice(0, 1));
      expect(oneOpenOutputHeight).toBeGreaterThan(twoOpenOutputHeight);
      expect(twoOpenOutputHeight).toBeGreaterThan(threeOpenOutputHeight);
      expect(threeOpenOutputHeight).toBeGreaterThan(fourOpenOutputHeight);
      await setSessionInspectorV2DetailSectionsOpen(page, allDetailContentIds);
      const detailPanelState = await page.evaluate(() => {
        const jsonOutput = document.querySelector("#sessionInspectorV2JsonOutput");
        const dataOutput = document.querySelector("#sessionInspectorV2DataOutput");
        return {
          dataOutputScrollsVertically: dataOutput.scrollHeight > dataOutput.clientHeight + 1,
          jsonOutputScrollsVertically: jsonOutput.scrollHeight > jsonOutput.clientHeight + 1
        };
      });
      expect(detailPanelState).toEqual({
        dataOutputScrollsVertically: true,
        jsonOutputScrollsVertically: true
      });
      await page.locator("#copySessionInspectorV2AllButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Copied JSON, Data, and Dirty sections to clipboard\./);
      const copiedToolPayload = await page.evaluate(() => window.__sessionInspectorV2ClipboardText);
      expect(copiedToolPayload).toContain("=== JSON ===");
      expect(copiedToolPayload).toContain("=== JSON ===\nSession: sessionStorage:workspace.tools.asset-manager-v2\n");
      expect(copiedToolPayload).toContain("=== Data ===");
      expect(copiedToolPayload).toContain("=== Data ===\nSession: sessionStorage:workspace.tools.asset-manager-v2\n");
      expect(copiedToolPayload).toContain("=== Dirty ===");
      expect(copiedToolPayload).toContain("=== Dirty ===\nSession: sessionStorage:workspace.tools.asset-manager-v2\n");
      expect(copiedToolPayload).toContain('"workspace"');
      expect(copiedToolPayload).toContain('"data"');
      expect(copiedToolPayload).toContain('"dirty"');
      expect(copiedToolPayload).toContain('"assets.image.preview.preview"');
      expect(copiedToolPayload).toContain('"isDirty": false');

      await page.locator('[data-session-inspector-v2-entry-id="sessionStorage:workspace.tools.dirty-test"]').click();
      await expect(page.locator("#sessionInspectorV2DirtyHeaderValue")).toHaveText("Dirty: true");
      await expect(page.locator("#sessionInspectorV2DirtyOutput")).toContainText('"isDirty": true');
      const dirtyOutputScrollState = await page.evaluate(() => {
        const dirtyContent = document.querySelector("#sessionInspectorV2DirtyContent");
        const dirtyOutput = document.querySelector("#sessionInspectorV2DirtyOutput");
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
      await page.locator('[data-session-inspector-v2-entry-id="sessionStorage:workspace.tools.no-data-test"]').click();
      await expect(page.locator("#sessionInspectorV2DataOutput")).toContainText("No data section is present for sessionStorage:workspace.tools.no-data-test.");
      await page.locator('[data-session-inspector-v2-entry-id="sessionStorage:workspace.tools.no-dirty-test"]').click();
      await expect(page.locator("#sessionInspectorV2DirtyHeaderValue")).toHaveText("Dirty: unknown");
      await expect(page.locator("#sessionInspectorV2DirtyOutput")).toContainText("No dirty section is present for sessionStorage:workspace.tools.no-dirty-test.");

      await page.locator('[data-session-inspector-v2-delete-entry-id="sessionStorage:workspace.tools.preview-generator-v2"]').click();
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id]")).toHaveCount(4);
      expect(await page.evaluate(() => window.sessionStorage.getItem("workspace.tools.preview-generator-v2"))).toBeNull();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted sessionStorage:workspace\.tools\.preview-generator-v2\./);

      await page.locator("#deleteAllSessionInspectorV2Button").click();
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id]")).toHaveCount(0);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted sessionStorage:workspace\.tools\.asset-manager-v2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted sessionStorage:workspace\.tools\.dirty-test\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted 4 shown storage entries\./);
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
        repoReference: {
          displayName: "StaleRepo"
        },
        toolKeys: ["workspace.tools.asset-manager-v2"]
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
      await expect(page.locator("#workspaceToolTiles [data-workspace-tool-id]")).toHaveCount(6);
      await expect(page.locator('[data-workspace-tool-id="workspace-manager-v2"]')).toHaveCount(0);
      await expect(page.locator('[data-workspace-tool-id="session-inspector"]')).toHaveCount(0);
      const toolGroupMembership = await page.locator(".workspace-manager-v2__tool-group").evaluateAll((groups) => Object.fromEntries(groups.map((group) => [
        group.querySelector(".workspace-manager-v2__tool-group-title")?.textContent?.trim(),
        Array.from(group.querySelectorAll(".workspace-manager-v2__tool-tile-name"), (name) => name.textContent.trim())
      ])));
      expect(toolGroupMembership).toEqual({
        Editors: ["Asset Manager V2", "Palette Manager V2"],
        Utilities: ["Preview Generator V2", "Text to Speech V2"],
        Viewers: ["Tool Starter V2", "Session Inspector V2"]
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
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"hasLiveRepoHandle"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/"sourceBindingState"/);
      await expect(page.locator("#workspaceContextOutput")).not.toHaveValue(/samples\//);
      await expect(page.locator("#pickRepoBtn")).toBeDisabled();
      await expect(page.locator("#activeGameSelect")).toBeDisabled();
      await expect(page.locator("#saveWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#closeWorkspaceButton")).toBeEnabled();
      await expect(page.locator("#cancelWorkspaceButton")).toBeEnabled();
      await expect(page.locator("#activeGameContent button")).toHaveCount(0);
      const selectedGameHydration = await readWorkspaceSessionHydration(page);
      expectRuntimeBindingMetadata(selectedGameHydration.repoReference);
      expect(selectedGameHydration.toolKeys).toEqual([
        "workspace.tools.asset-manager-v2",
        "workspace.tools.palette-manager-v2",
        "workspace.tools.preview-generator-v2",
        "workspace.tools.session-inspector-v2",
        "workspace.tools.text2speach-V2"
      ]);
      expect(selectedGameHydration.toolKeys).not.toContain("workspace.tools.templates-v2");
      expect(selectedGameHydration.toolKeys.some((key) => key.endsWith(".schema") || key.endsWith(".state"))).toBe(false);
      expect(Object.keys(selectedGameHydration.toolSessions).sort()).toEqual([
        "asset-manager-v2",
        "palette-manager-v2",
        "preview-generator-v2",
        "session-inspector-v2",
        "text2speach-V2"
      ]);
      const selectedGameHydrationReport = await page.evaluate(() => window.__workspaceManagerV2App.activeToolStateHydration.report);
      expect(selectedGameHydrationReport.hydratedTools.map((tool) => tool.toolId)).toEqual([
        "asset-manager-v2",
        "palette-manager-v2",
        "preview-generator-v2",
        "text2speach-V2",
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
      expect(selectedGameHydration.schemaByTool["text2speach-V2"]).toMatchObject({
        source: "workspace-manager-v2",
        toolId: "text2speach-V2",
        schemaRole: "workspace-tool-payload",
        schemaRef: "tools/schemas/tools/text2speach-V2.schema.json",
        workspaceSchemaRef: "tools/schemas/workspace.manifest.schema.json"
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
      expectRuntimeBindingMetadata(selectedGameHydration.workspaceByTool["asset-manager-v2"]);
      expectRuntimeBindingMetadata(selectedGameHydration.workspaceByTool["palette-manager-v2"]);
      expectRuntimeBindingMetadata(selectedGameHydration.workspaceByTool["preview-generator-v2"]);
      expectRuntimeBindingMetadata(selectedGameHydration.workspaceByTool["text2speach-V2"]);
      expectRuntimeBindingMetadata(selectedGameHydration.workspaceByTool["session-inspector-v2"]);
      expect(selectedGameHydration.toolSessions["asset-manager-v2"].state).toBeUndefined();
      expect(JSON.stringify(selectedGameHydration.toolSessions)).not.toMatch(/getDirectoryHandle|createWritable|FileSystemDirectoryHandle/);
      expect(Object.keys(selectedGameHydration.dataByTool["asset-manager-v2"].assets)).toHaveLength(14);
      const textToSpeechQueue = selectedGameHydration.dataByTool["text2speach-V2"].queue;
      expect(textToSpeechQueue).toHaveLength(3);
      textToSpeechQueue.forEach((item) => {
        expect(Object.keys(item).sort()).toEqual([
          "characterPreset",
          "gender",
          "id",
          "language",
          "name",
          "pitch",
          "queueMode",
          "rate",
          "ssmlLikePreset",
          "text",
          "voice",
          "voiceAge",
          "volume"
        ]);
      });
      expect(textToSpeechQueue[0]).toMatchObject({
        characterPreset: "narrator",
        gender: "any",
        language: "en-US",
        queueMode: "replace",
        ssmlLikePreset: "normal",
        voiceAge: "any"
      });
      expect(selectedGameHydration.toolSessions["templates-v2"]).toBeUndefined();
      expect(Object.values(selectedGameHydration.dirtyByTool)).toEqual([
        { isDirty: false, reason: null, changedAt: null, changedKeys: [] },
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
      const templateTile = page.locator('[data-workspace-tool-id="templates-v2"]');
      const assetTile = page.locator('[data-workspace-tool-id="asset-manager-v2"]');
      const paletteTile = page.locator('[data-workspace-tool-id="palette-manager-v2"]');
      const previewTile = page.locator('[data-workspace-tool-id="preview-generator-v2"]');
      const textToSpeechToolTile = page.locator('[data-workspace-tool-id="text2speach-V2"]');
      const sessionInspectorTile = page.locator('[data-workspace-tool-id="session-inspector-v2"]');
      await expect(templateTile).toBeDisabled();
      await expect(templateTile).toContainText("Tool Starter V2");
      await expect(templateTile).toContainText("Not enabled for game");
      await expect(templateTile).toContainText("Canonical V2 template");
      await expect(assetTile).toBeEnabled();
      await expect(assetTile).toContainText("Asset Manager V2");
      await expect(assetTile).toContainText("Ready to launch");
      await expect(assetTile).toContainText("14 managed assets");
      await expect(paletteTile).toContainText("10 palette swatches");
      await expect(previewTile).toContainText("Schema-valid manifest");
      await expect(textToSpeechToolTile).toBeEnabled();
      await expect(textToSpeechToolTile).toContainText("Text to Speech V2");
      await expect(textToSpeechToolTile).toContainText("Speech synthesis ready");
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
        { height: 142, width: 180 },
        { height: 142, width: 180 }
      ]);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Boundary contract: game\.gameData is runtime data; game\.workspace is editor\/tool state\. Runtime ignores game\.workspace; tools may read game\.gameData, write game\.workspace, and update game\.gameData only through explicit validated apply\/build\/export actions\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Hydrated workspace session for asset-manager-v2, palette-manager-v2, preview-generator-v2, text2speach-V2, session-inspector-v2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Skipped workspace session hydration for templates-v2: starter\/dev-only tool is not enabled by the selected game workspace config\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded Asteroids from \/games\/Asteroids\/game\.manifest\.json with 10 active palette colors and 14 managed assets\./);

      await page.locator('[data-workspace-tool-id="session-inspector-v2"]').click();
      await expect(page).toHaveURL(/session-inspector-v2\/index\.html.*launch=workspace/);
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id='sessionStorage:workspace.tools.asset-manager-v2']")).toHaveCount(1);
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id='sessionStorage:workspace.tools.palette-manager-v2']")).toHaveCount(1);
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id='sessionStorage:workspace.tools.preview-generator-v2']")).toHaveCount(1);
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id='sessionStorage:workspace.tools.text2speach-V2']")).toHaveCount(1);
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id='sessionStorage:workspace.tools.session-inspector-v2']")).toHaveCount(1);
      await expect(page.locator("#sessionInspectorV2EntryList [data-session-inspector-v2-entry-id='sessionStorage:workspace.tools.templates-v2']")).toHaveCount(0);
      await page.locator('[data-session-inspector-v2-entry-id="sessionStorage:workspace.tools.asset-manager-v2"]').click();
      await expect(page.locator("#sessionInspectorV2JsonOutput")).toContainText('"hasLiveRepoHandle": true');
      await expect(page.locator("#sessionInspectorV2JsonOutput")).toContainText('"sourceBindingState": "bound"');
      await expect(page.locator("#sessionInspectorV2JsonOutput")).toContainText('"boundManifestPath": "/games/Asteroids/game.manifest.json"');
      await expect(page.locator("#sessionInspectorV2JsonOutput")).toContainText('"bindingSource": "game.manifest.json"');
      await expect(page.locator("#sessionInspectorV2JsonOutput")).not.toContainText('"handle":');
      await expect(page.locator("#sessionInspectorV2JsonOutput")).not.toContainText('"repoHandle":');
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Runtime binding status for sessionStorage:workspace\.tools\.asset-manager-v2: hasLiveRepoHandle=true; sourceBindingState=bound; boundManifestPath=\/games\/Asteroids\/game\.manifest\.json; bindingSource=game\.manifest\.json\./);
      await page.locator('[data-session-inspector-v2-entry-id="sessionStorage:workspace.repo.reference"]').click();
      await expect(page.locator("#sessionInspectorV2JsonOutput")).toContainText('"hasLiveRepoHandle": true');
      await expect(page.locator("#sessionInspectorV2JsonOutput")).toContainText('"sourceBindingState": "bound"');
      await expect(page.locator("#sessionInspectorV2JsonOutput")).toContainText('"boundManifestPath": "/games/Asteroids/game.manifest.json"');
      await expect(page.locator("#sessionInspectorV2JsonOutput")).toContainText('"bindingSource": "game.manifest.json"');
      await expect(page.locator("#sessionInspectorV2JsonOutput")).not.toContainText('"handle":');
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Runtime binding status for sessionStorage:workspace\.repo\.reference: hasLiveRepoHandle=true; sourceBindingState=bound; boundManifestPath=\/games\/Asteroids\/game\.manifest\.json; bindingSource=game\.manifest\.json\./);
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);
      await expectWorkspaceReturnedFromTool(page);
      const asteroidsManifest = await page.evaluate(async () => await fetch("/games/Asteroids/game.manifest.json", { cache: "no-store" }).then((response) => response.json()));
      expect(asteroidsManifest.documentKind).toBeUndefined();
      expect(asteroidsManifest.tools).toBeUndefined();
      expect(asteroidsManifest.game.gameData.launch.directPath).toBe("/games/Asteroids/index.html");
      const manifestWorkspace = asteroidsManifest.game.workspace;
      expect(manifestWorkspace.documentKind).toBe("workspace-manifest");
      expect(Object.keys(manifestWorkspace.tools).sort()).toEqual(["asset-manager-v2", "palette-manager-v2", "vector-map-editor"]);
      expect(manifestWorkspace.repoRoot).toBe("HTML-JavaScript-Gaming");
      expect(manifestWorkspace.repoPath).toBe(manifestRepoPath(server));
      expect(manifestWorkspace.tools["palette-manager-v2"].swatches.length).toBeGreaterThan(0);
      expect(Object.keys(manifestWorkspace.tools["asset-manager-v2"].assets)).toHaveLength(14);
      expect(manifestWorkspace.tools["asset-manager-v2"].previewImagePath).toBeUndefined();
      expect(manifestWorkspace.tools["asset-manager-v2"].assets["assets.image.background.deluxe"]).toEqual({
        path: "assets/images/deluxe.png",
        type: "image",
        kind: "png",
        role: "background",
        source: "manifest",
        stretchOverride: {
          uniformEdgeStretchPx: 0
        }
      });
      expect(manifestWorkspace.tools["asset-manager-v2"].assets["assets.image.bezel.bezel"]).toEqual({
        path: "assets/images/bezel.png",
        type: "image",
        kind: "png",
        role: "bezel",
        source: "manifest",
        stretchOverride: {
          uniformEdgeStretchPx: 10
        }
      });
      expect(manifestWorkspace.tools["asset-manager-v2"].assets["assets.image.preview.preview"]).toEqual({
        path: "assets/images/preview.png",
        type: "image",
        kind: "png",
        role: "preview",
        source: "manifest"
      });
      expect(manifestWorkspace.tools["asset-manager-v2"].source).toBe("manifest");
      expect(manifestWorkspace.tools["asset-manager-v2"].schema).toBe("html-js-gaming.asset-manager-v2");
      expect(manifestWorkspace.tools["vector-map-editor"].vectorMapDocument.vectors.map((vector) => vector.id)).toContain("vector.asteroids.ship");

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
      expect(storedContext.hasLiveRepoHandle).toBeUndefined();
      expect(storedContext.sourceBindingState).toBeUndefined();
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
      expect(storedContext.tools["text2speach-V2"].schema).toBe("html-js-gaming.text2speach-V2");
      expect(storedContext.tools["text2speach-V2"].queue).toHaveLength(3);
      expect(storedContext.workspaceMetadata).toBeUndefined();
      expect(storedContext.tools["asset-browser"]).toBeUndefined();
      expect(storedContext.tools["palette-browser"]).toBeUndefined();
      expect(storedContext.tools["asset-manager-v2"].schema).toBe("html-js-gaming.asset-manager-v2");
      const schemaValidation = await page.evaluate(async () => {
        const [workspaceSchema, paletteSchema, assetSchema, vectorMapSchema, textToSpeechSchema] = await Promise.all([
          fetch("/tools/schemas/workspace.manifest.schema.json", { cache: "no-store" }).then((response) => response.json()),
          fetch("/tools/schemas/tools/palette-manager-v2.schema.json", { cache: "no-store" }).then((response) => response.json()),
          fetch("/tools/schemas/tools/asset-manager-v2.schema.json", { cache: "no-store" }).then((response) => response.json()),
          fetch("/tools/schemas/tools/vector-map-editor.schema.json", { cache: "no-store" }).then((response) => response.json()),
          fetch("/tools/schemas/tools/text2speach-V2.schema.json", { cache: "no-store" }).then((response) => response.json())
        ]);
        const url = new URL(window.location.href);
        const manifest = JSON.parse(sessionStorage.getItem(url.searchParams.get("hostContextId")));
        const palettePayload = manifest.tools["palette-manager-v2"];
        const assetPayload = manifest.tools["asset-manager-v2"];
        const vectorPayload = manifest.tools["vector-map-editor"];
        const textToSpeechPayload = manifest.tools["text2speach-V2"];
        const extraKeys = (value, schema) => Object.keys(value).filter((key) => !Object.hasOwn(schema.properties || {}, key));
        const missingKeys = (value, schema) => (schema.required || []).filter((key) => !Object.hasOwn(value, key));
        const swatchExtraKeys = palettePayload.swatches.flatMap((swatch, index) => (
          extraKeys(swatch, paletteSchema.$defs.swatch).map((key) => `${index}.${key}`)
        ));
        const swatchMissingKeys = palettePayload.swatches.flatMap((swatch, index) => (
          missingKeys(swatch, paletteSchema.$defs.swatch).map((key) => `${index}.${key}`)
        ));
        const speechItemExtraKeys = textToSpeechPayload.queue.flatMap((item, index) => (
          extraKeys(item, textToSpeechSchema.$defs.speechQueueItem).map((key) => `${index}.${key}`)
        ));
        const speechItemMissingKeys = textToSpeechPayload.queue.flatMap((item, index) => (
          missingKeys(item, textToSpeechSchema.$defs.speechQueueItem).map((key) => `${index}.${key}`)
        ));
        return {
          assetExtraKeys: extraKeys(assetPayload, assetSchema),
          assetMissingKeys: missingKeys(assetPayload, assetSchema),
          manifestExtraKeys: extraKeys(manifest, workspaceSchema),
          manifestMissingKeys: missingKeys(manifest, workspaceSchema),
          paletteExtraKeys: extraKeys(palettePayload, paletteSchema),
          paletteMissingKeys: missingKeys(palettePayload, paletteSchema),
          speechItemExtraKeys,
          speechItemMissingKeys,
          swatchExtraKeys,
          swatchMissingKeys,
          textToSpeechExtraKeys: extraKeys(textToSpeechPayload, textToSpeechSchema),
          textToSpeechMissingKeys: missingKeys(textToSpeechPayload, textToSpeechSchema),
          textToSpeechQueueLength: textToSpeechPayload.queue.length,
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
        speechItemExtraKeys: [],
        speechItemMissingKeys: [],
        swatchExtraKeys: [],
        swatchMissingKeys: [],
        textToSpeechExtraKeys: [],
        textToSpeechMissingKeys: [],
        textToSpeechQueueLength: 3,
        toolKeys: ["asset-manager-v2", "palette-manager-v2", "text2speach-V2", "vector-map-editor"],
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
      await expectWorkspaceReturnedFromTool(page);
      await expect(page.locator("#activeGameSelect")).toHaveValue("Asteroids");
      await expect(page.locator("#activeAssetRegistrySummary")).toHaveCount(0);
      await expect(page.locator('[data-workspace-tool-id="asset-manager-v2"]')).toBeEnabled();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Restored repo destination from workspace\.repo\.reference for HTML-JavaScript-Gaming\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Restored Asteroids workspace from session context workspace-manager-v2-/);

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
      await expect(previewTile).toContainText("Schema-valid manifest");
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
      await expect(page.locator("#statusLog")).toHaveValue(/Workspace Manager V2 loaded 14 validated assets from tools\.asset-manager-v2\.assets/);
      await expect(page.locator("#statusLog")).toHaveValue(/Workspace Manager V2 loaded 11 palette colors from active palette context/);
      await page.locator("#assetKindColor").check();
      const sessionPurpleSwatch = page.locator('#assetColorSwatchList button[aria-label*="Workspace Session Purple"]');
      await expect(sessionPurpleSwatch).toBeVisible();
      await sessionPurpleSwatch.click();
      await page.locator("#assetUsageInput").fill("session");
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.color.hud.session.workspace-session-purple");
      await page.locator("#addAssetButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Added assets\.color\.hud\.session\.workspace-session-purple\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK workspace\.tools\.asset-manager-v2 now has 15 validated assets\./);
      const editedAssetSession = await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.tools.asset-manager-v2")));
      expect(Object.keys(editedAssetSession.data.assets)).toHaveLength(15);
      expect(editedAssetSession.data.assets["assets.color.hud.session.workspace-session-purple"]).toMatchObject({
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
        'data.assets["assets.color.hud.session.workspace-session-purple"]'
      ]));
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);
      await expectWorkspaceReturnedFromTool(page, { dirty: true });
      await expect(assetTile).toContainText("15 managed assets");
      await expect(assetTile).toHaveAttribute("data-workspace-tool-dirty", "true");
      await expect(paletteTile).toContainText("11 palette swatches");
      await expect(paletteTile).toHaveAttribute("data-workspace-tool-dirty", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Refreshed asset-manager-v2 from workspace\.tools\.asset-manager-v2\.data: 15 managed assets; Dirty: true\./);
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
      await expect(page.locator("#log")).toContainText("Workspace background color: Space Black #020617 from palette-manager-v2 swatch.");
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
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("launches Text to Speech V2 from Workspace Manager with speaking action available", async ({ page }) => {
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
      const textToSpeechToolTile = page.locator('[data-workspace-tool-id="text2speach-V2"]');
      await expect(textToSpeechToolTile).toBeEnabled();
      await expect(textToSpeechToolTile).toContainText("Text to Speech V2");
      await expect(textToSpeechToolTile).toContainText("Speech synthesis ready");
      await textToSpeechToolTile.click();
      await expect(page).toHaveURL(/text2speach-V2\/index\.html.*launch=workspace/);
      await expect(page).toHaveURL(/fromTool=workspace-manager-v2/);
      await expect(page.locator('[data-launch-mode-nav="tool"]')).toBeHidden();
      await expect(page.locator('[data-launch-mode-nav="workspace"]')).toBeVisible();
      await expect(page.locator('[data-launch-mode-nav="workspace"] button')).toHaveText(["Speak", "Pause", "Resume", "Stop", "Return to Workspace"]);
      await expect(page.locator("#text2speach-V2QueueTiles [data-speech-item-id]")).toHaveCount(3);
      await expect(page.locator("#text2speach-V2SpeechText")).toHaveValue("Welcome to Toolbox Aid. This is the default Text to Speech V2 sample line for previewing narration, prompts, and menu feedback.");
      await expect(page.locator("#text2speach-V2SpeechItemName")).toHaveValue("Narrator welcome");
      await expect(page.locator("#text2speach-V2WorkspaceSpeakButton")).toBeEnabled();
      await expect(page.locator("#text2speach-V2WorkspacePauseButton")).toBeEnabled();
      await expect(page.locator("#text2speach-V2WorkspaceResumeButton")).toBeEnabled();
      await expect(page.locator("#text2speach-V2WorkspaceStopButton")).toBeEnabled();
      await expect(page.locator("#text2speach-V2VoiceSelect option")).toHaveCount(4);
      await page.locator("#text2speach-V2WorkspaceSpeakButton").click();
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Speech queued: Narrator welcome; mode=replace; en-US; voice=Google US English; rate=1; pitch=1; volume=1; queuedItems=1\./);
      const spoken = await page.evaluate(() => window["__text2speach-V2Spoken"]);
      expect(spoken).toHaveLength(1);
      expect(spoken[0].text).toBe("Welcome to Toolbox Aid. This is the default Text to Speech V2 sample line for previewing narration, prompts, and menu feedback.");
      await page.locator("#text2speach-V2WorkspacePauseButton").click();
      await page.locator("#text2speach-V2WorkspaceResumeButton").click();
      await page.locator("#text2speach-V2WorkspaceStopButton").click();
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/OK Speech queue stopped: 1 queued item\(s\) cleared\./);
      expect(await page.evaluate(() => window["__text2speach-V2Paused"])).toBe(1);
      expect(await page.evaluate(() => window["__text2speach-V2Resumed"])).toBe(1);
      expect(await page.evaluate(() => window["__text2speach-V2Canceled"])).toBe(2);
      await page.locator("#text2speach-V2SpeechItemName").fill("");
      await page.locator("#text2speach-V2AddItemButton").click();
      await expect(page.locator("#text2speach-V2StatusLog")).toHaveValue(/FAIL Text to Speech V2 Add blocked: Name is required before creating a named speech item\./);
      await expect(page.locator("#text2speach-V2QueueTiles [data-speech-item-id]")).toHaveCount(3);
      await page.locator("#text2speach-V2SpeechItemName").fill("Workspace dungeon master");
      await page.locator("#text2speach-V2AddItemButton").click();
      await expect(page.locator("#text2speach-V2QueueTiles [data-speech-item-id]")).toHaveCount(4);
      await page.locator("#text2speach-V2SpeechText").fill("Workspace-edited dungeon master line.");
      await page.locator("#text2speach-V2CharacterPresetSelect").selectOption("dnd-dungeon-master");
      await expect(page.locator("#text2speach-V2RateSlider")).toHaveValue("0.8");
      await expect(page.locator("#text2speach-V2PitchSlider")).toHaveValue("0.5");
      let textToSpeechSession = await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.tools.text2speach-V2")));
      expect(textToSpeechSession.dirty).toMatchObject({
        isDirty: true,
        reason: "settings-updated"
      });
      expect(textToSpeechSession.data.queue).toHaveLength(4);
      expect(textToSpeechSession.data.queue.at(-1)).toMatchObject({
        characterPreset: "dnd-dungeon-master",
        name: "Workspace dungeon master 2",
        pitch: 0.5,
        rate: 0.8,
        text: "Workspace-edited dungeon master line."
      });
      await page.locator("#text2speach-V2DuplicateItemButton").click();
      await expect(page.locator("#text2speach-V2QueueTiles [data-speech-item-id]")).toHaveCount(5);
      textToSpeechSession = await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.tools.text2speach-V2")));
      expect(textToSpeechSession.dirty.reason).toBe("speech-item-duplicated");
      expect(textToSpeechSession.data.queue.at(-1).name).toBe("Workspace dungeon master 2 copy");
      await page.locator("#text2speach-V2DeleteItemButton").click();
      await expect(page.locator("#text2speach-V2QueueTiles [data-speech-item-id]")).toHaveCount(4);
      textToSpeechSession = await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.tools.text2speach-V2")));
      expect(textToSpeechSession.dirty.reason).toBe("speech-item-deleted");
      expect(textToSpeechSession.data.queue).toHaveLength(4);
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-/);
      await expectWorkspaceReturnedFromTool(page, { dirty: true });
      await expect(page.locator('[data-workspace-tool-id="text2speach-V2"]')).toHaveAttribute("data-workspace-tool-dirty", "true");
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
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
      await expect(page.locator("#statusLog")).toHaveValue(/Workspace Manager V2 loaded 14 validated assets from tools\.asset-manager-v2\.assets/);
      await page.locator('[data-delete-asset-id="assets.image.preview.preview"]').click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted assets\.image\.preview\.preview\./);
      const editedAssetSession = await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.tools.asset-manager-v2")));
      expect(editedAssetSession.data.assets["assets.image.preview.preview"]).toBeUndefined();
      expect(Object.keys(editedAssetSession.data.assets)).toHaveLength(13);
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
      await expect(page.locator('[data-workspace-tool-id="asset-manager-v2"]')).toContainText("13 managed assets");
      await expect(page.locator('[data-workspace-tool-id="asset-manager-v2"]')).toHaveAttribute("data-workspace-tool-dirty", "true");
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Refreshed asset-manager-v2 from workspace\.tools\.asset-manager-v2\.data: 13 managed assets; Dirty: true\./);
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
      await coverageReporter.stop(page);
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
      await coverageReporter.stop(page);
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
      await expect(page.locator("#cancelWorkspaceButton")).toBeEnabled();

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
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Saved toolState items: 4 \(asset-manager-v2 assets=14; palette-manager-v2 swatches=11; text2speach-V2 queue=3; vector-map-editor vectors=5\)\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save validation result: game manifest valid; root game\.workspace toolState valid; saved context matched re-read file\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save dirty\/clean validation: 1 dirty toolState payload persisted; 1 toolState key marked clean\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Saved Workspace Manager V2 toolState context workspace-manager-v2-Asteroids\./);
      await expect(page.locator('[data-workspace-tool-id="palette-manager-v2"]')).toHaveAttribute("data-workspace-tool-dirty", "false");
      await expect(page.locator("#saveWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#closeWorkspaceButton")).toBeEnabled();
      await expect(page.locator("#cancelWorkspaceButton")).toBeEnabled();
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
      expect(writtenGameManifest.game.workspace).toBeTruthy();
      expect(writtenGameManifest.game.workspace.tools["palette-manager-v2"].swatches.at(-1)).toMatchObject({
        hex: "#654321",
        name: "Close Guard Copper",
        source: "User Added",
        symbol: "@"
      });
      expect(Object.keys(writtenGameManifest.game.workspace.tools["asset-manager-v2"].assets)).toHaveLength(14);
      expect(writtenGameManifest.game.workspace.tools["text2speach-V2"].queue).toHaveLength(3);

      await page.locator("#closeWorkspaceButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Close Workspace removed toolState key: workspace\.tools\.asset-manager-v2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Close Workspace removed toolState key: workspace\.tools\.palette-manager-v2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Close Workspace removed toolState key: workspace\.tools\.preview-generator-v2\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Close Workspace removed toolState key: workspace\.tools\.session-inspector-v2\./);
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
      await coverageReporter.stop(page);
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
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save validation result: game manifest valid; root game\.workspace toolState valid; saved context matched re-read file\./);
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
      expect(JSON.parse(saveState.writes.at(-1).contents).game.workspace.tools["palette-manager-v2"].swatches.at(-1)).toMatchObject({
        hex: "#2468ac",
        name: "Read Only Restore Blue",
        source: "User Added",
        symbol: "&"
      });
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
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
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save validation result: game manifest valid; root game\.workspace toolState valid; saved context matched re-read file\./);
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
      expect(JSON.parse(sourceBindingState.writes.at(-1).contents).game.workspace.tools["palette-manager-v2"].swatches.at(-1)).toMatchObject({
        hex: "#987654",
        name: "Restored Binding Bronze",
        source: "User Added",
        symbol: "%"
      });
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
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
      await coverageReporter.stop(page);
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
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("blocks Workspace Manager V2 return restore when repo session reference is missing or invalid", async ({ page }) => {
    const pageErrors = [];
    const hostContextId = "workspace-manager-v2-missing-return-repo-reference";
    const gameManifest = JSON.parse(await readFile("games/Asteroids/game.manifest.json", "utf8"));
    const manifest = gameManifest.game.workspace;
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
      await expect(page.locator("#activeGameSummary")).toHaveText("workspace.repo.reference was not found in sessionStorage. Pick Repo Folder to reselect repo before launching tools.");
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
      await expect(page.locator("#repoDestinationSection")).toBeHidden();
      await expect(page.locator("#executeBtn")).toBeDisabled();
      await expect(page.locator("#log")).toContainText("FAIL Workspace repo session hydration: workspace.repo.reference.displayName WrongRepo does not match manifest repoRoot HTML-JavaScript-Gaming.");
      await expect(page.locator("#log")).toContainText("Preview Generator V2 requires Workspace Manager V2 repo session storage before image generation.");
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
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
      expect(Object.keys(gravityManifest.tools).sort()).toEqual(["asset-manager-v2", "palette-manager-v2", "text2speach-V2"]);
      expect(gravityManifest.tools["asset-manager-v2"].assets["assets.image.preview.preview"]).toEqual({
        path: "assets/images/preview.svg",
        type: "image",
        kind: "svg",
        role: "preview",
        source: "manifest"
      });
      expect(gravityManifest.tools["text2speach-V2"].queue).toHaveLength(3);
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
      expect(Object.keys(pongManifest.tools).sort()).toEqual(["asset-manager-v2", "palette-manager-v2", "text2speach-V2"]);
      expect(pongManifest.tools["asset-manager-v2"].assets["assets.image.preview.preview"]).toEqual({
        path: "assets/images/preview.svg",
        type: "image",
        kind: "svg",
        role: "preview",
        source: "manifest"
      });
      expect(pongManifest.tools["text2speach-V2"].queue).toHaveLength(3);
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
      await coverageReporter.stop(page);
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
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Save blocked: Generated Workspace Manager V2 manifest failed schema validation: root\.tools\.asset-manager-v2\.unexpected is not allowed/);
      expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("workspace.repo.manifestWrites") || "[]"))).toEqual([]);
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
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded Asteroids from \/games\/Asteroids\/game\.manifest\.json with 10 active palette colors and 0 managed assets\./);
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
      await expect(page.locator("#saveWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#closeWorkspaceButton")).toBeDisabled();
      await expect(page.locator("#cancelWorkspaceButton")).toBeDisabled();
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
