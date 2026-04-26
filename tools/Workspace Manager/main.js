import { createToolHostManifest, getToolHostEntryById } from "../../tools/shared/toolHostManifest.js";
import { createToolHostRuntime } from "../../tools/shared/toolHostRuntime.js";
import {
  removeToolHostSharedContextById,
  writeToolHostSharedContext
} from "../../tools/shared/toolHostSharedContext.js";

const GAMES_METADATA_PATH = "/games/metadata/games.index.metadata.json";
const DEFAULT_GAME_ASSET_CATALOG_FILENAME = "workspace.asset-catalog.json";
const GAME_ASSET_CATALOG_SCHEMA = "html-js-gaming.game-asset-catalog";
const GAME_ASSET_CATALOG_VERSION = 1;
const gameAssetCatalogCache = new Map();

function deriveGameAssetCatalogPath(gameHref) {
  const href = normalizeGameHref(gameHref);
  if (!href) {
    return "";
  }
  if (href.endsWith("/index.html")) {
    return `${href.slice(0, -"/index.html".length)}/assets/${DEFAULT_GAME_ASSET_CATALOG_FILENAME}`;
  }
  if (href.endsWith("/")) {
    return `${href}assets/${DEFAULT_GAME_ASSET_CATALOG_FILENAME}`;
  }
  return "";
}

function normalizeGameAssetCatalogEntries(value) {
  const source = value && typeof value === "object" ? value : {};
  const entries = {};
  Object.entries(source).forEach(([assetId, rawEntry]) => {
    const safeAssetId = typeof assetId === "string" ? assetId.trim() : "";
    const entry = rawEntry && typeof rawEntry === "object" ? rawEntry : null;
    const path = typeof entry?.path === "string" ? entry.path.trim() : "";
    if (!safeAssetId || !path) {
      return;
    }
    entries[safeAssetId] = {
      path,
      kind: typeof entry.kind === "string" ? entry.kind.trim() : "",
      source: typeof entry.source === "string" ? entry.source.trim() : ""
    };
  });
  return entries;
}

function parseGameAssetCatalogPayload(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  const schema = typeof source.schema === "string" ? source.schema.trim() : "";
  const version = Number(source.version);
  const entries = normalizeGameAssetCatalogEntries(source.assets || source.entries);
  return {
    schema,
    version,
    entries
  };
}

async function readGameAssetCatalog(assetCatalogPath) {
  const normalizedPath = typeof assetCatalogPath === "string" ? assetCatalogPath.trim() : "";
  if (!normalizedPath) {
    return {};
  }
  if (gameAssetCatalogCache.has(normalizedPath)) {
    return gameAssetCatalogCache.get(normalizedPath);
  }
  try {
    const response = await fetch(normalizedPath, { cache: "no-store" });
    if (!response.ok) {
      gameAssetCatalogCache.set(normalizedPath, {});
      return {};
    }
    const payload = parseGameAssetCatalogPayload(await response.json());
    const validSchema = payload.schema === GAME_ASSET_CATALOG_SCHEMA;
    const validVersion = payload.version === GAME_ASSET_CATALOG_VERSION;
    const entries = validSchema && validVersion ? payload.entries : {};
    gameAssetCatalogCache.set(normalizedPath, entries);
    return entries;
  } catch {
    gameAssetCatalogCache.set(normalizedPath, {});
    return {};
  }
}

const refs = {
  toolSelect: document.querySelector("[data-tool-host-select]"),
  stateInput: document.querySelector("[data-tool-host-state-input]"),
  mountButton: document.querySelector("[data-tool-host-mount]"),
  prevButton: document.querySelector("[data-tool-host-prev]"),
  nextButton: document.querySelector("[data-tool-host-next]"),
  unmountButton: document.querySelector("[data-tool-host-unmount]"),
  standaloneLink: document.querySelector("[data-tool-host-standalone]"),
  switchMetaText: document.querySelector("[data-tool-host-switch-meta]"),
  statusText: document.querySelector("[data-tool-host-status]"),
  currentLabel: document.querySelector("[data-tool-host-current-label]"),
  mountContainer: document.querySelector("[data-tool-host-mount-container]")
};

const manifest = createToolHostManifest();
const allToolIds = manifest.tools.map((tool) => tool.id);
let toolIds = [...allToolIds];
let currentGameFrame = null;
let currentGameHostContextId = "";
const TOOL_LAUNCH_PARAM_PREFIXES = Object.freeze({
  samplePresetPath: ["/samples/", "/games/"],
  gameHref: ["/games/"],
  workspaceHref: ["/tools/Workspace%20Manager/", "/tools/Workspace Manager/"],
  returnTo: ["/games/", "/samples/"]
});

function normalizeTextParam(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeToken(value) {
  return normalizeTextParam(value).toLowerCase();
}

function normalizeToolsUsedList(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Set();
  const output = [];
  value.forEach((entry) => {
    const token = normalizeToken(entry);
    if (!token || seen.has(token)) {
      return;
    }
    seen.add(token);
    output.push(token);
  });
  return output;
}

function normalizeLocalHrefParam(value, allowedPrefixes = []) {
  const normalized = normalizeTextParam(value).replace(/\\/g, "/");
  if (!normalized || !normalized.startsWith("/") || normalized.includes("..")) {
    return "";
  }
  return allowedPrefixes.some((prefix) => normalized.startsWith(prefix)) ? normalized : "";
}

function readForwardedToolLaunchParams() {
  const searchParams = new URL(window.location.href).searchParams;
  const forwarded = {};
  const sampleId = normalizeTextParam(searchParams.get("sampleId"));
  const sampleTitle = normalizeTextParam(searchParams.get("sampleTitle"));
  const samplePresetPath = normalizeLocalHrefParam(
    searchParams.get("samplePresetPath"),
    TOOL_LAUNCH_PARAM_PREFIXES.samplePresetPath
  );
  const gameId = normalizeTextParam(searchParams.get("gameId") || searchParams.get("game"));
  const gameTitle = normalizeTextParam(searchParams.get("gameTitle"));
  const gameHref = normalizeLocalHrefParam(searchParams.get("gameHref"), TOOL_LAUNCH_PARAM_PREFIXES.gameHref);
  const workspaceHref = normalizeLocalHrefParam(searchParams.get("workspaceHref"), TOOL_LAUNCH_PARAM_PREFIXES.workspaceHref);
  const returnTo = normalizeLocalHrefParam(searchParams.get("returnTo"), TOOL_LAUNCH_PARAM_PREFIXES.returnTo);

  if (sampleId) {
    forwarded.sampleId = sampleId;
  }
  if (sampleTitle) {
    forwarded.sampleTitle = sampleTitle;
  }
  if (samplePresetPath) {
    forwarded.samplePresetPath = samplePresetPath;
  }
  if (gameId) {
    forwarded.gameId = gameId;
  }
  if (gameTitle) {
    forwarded.gameTitle = gameTitle;
  }
  if (gameHref) {
    forwarded.gameHref = gameHref;
  }
  if (workspaceHref) {
    forwarded.workspaceHref = workspaceHref;
  }
  if (returnTo) {
    forwarded.returnTo = returnTo;
  }
  return forwarded;
}

function readSelectedToolId() {
  return refs.toolSelect instanceof HTMLSelectElement ? refs.toolSelect.value : "";
}

function writeStatus(text) {
  if (refs.statusText instanceof HTMLElement) {
    refs.statusText.textContent = text;
  }
}

function setCurrentLabel(text) {
  if (refs.currentLabel instanceof HTMLElement) {
    refs.currentLabel.textContent = text;
  }
}

function writeSwitchMeta(text) {
  if (refs.switchMetaText instanceof HTMLElement) {
    refs.switchMetaText.textContent = text;
  }
}

function getSelectedToolIndex() {
  const selectedToolId = readSelectedToolId();
  return toolIds.findIndex((toolId) => toolId === selectedToolId);
}

function updateSwitchMeta() {
  if (toolIds.length === 0) {
    writeSwitchMeta("No active tools are available in host manifest.");
    return;
  }
  const selectedIndex = getSelectedToolIndex();
  const oneBased = selectedIndex >= 0 ? selectedIndex + 1 : 1;
  writeSwitchMeta(`Switch target ${oneBased}/${toolIds.length}.`);
}

function selectToolByOffset(offset) {
  if (!(refs.toolSelect instanceof HTMLSelectElement) || toolIds.length === 0) {
    return false;
  }

  const currentIndex = Math.max(0, getSelectedToolIndex());
  const nextIndex = (currentIndex + offset + toolIds.length) % toolIds.length;
  refs.toolSelect.value = toolIds[nextIndex];
  updateSwitchMeta();
  return true;
}

function updateStandaloneHref(toolId) {
  if (!(refs.standaloneLink instanceof HTMLAnchorElement)) {
    return;
  }
  const entry = getToolHostEntryById(manifest, toolId);
  const enabled = !!entry && toolIds.includes(toolId);
  refs.standaloneLink.href = enabled ? entry.launchPath : "#";
  refs.standaloneLink.setAttribute("aria-disabled", enabled ? "false" : "true");
  refs.standaloneLink.tabIndex = enabled ? 0 : -1;
  refs.standaloneLink.classList.toggle("is-disabled", !enabled);
}

function writeQueryToolId(toolId, replace = false) {
  const url = new URL(window.location.href);
  const gameParam = normalizeTextParam(url.searchParams.get("game"));
  const gameIdParam = normalizeTextParam(url.searchParams.get("gameId"));
  if (!gameIdParam && gameParam) {
    url.searchParams.set("gameId", gameParam);
  }
  url.searchParams.delete("game");
  if (toolId) {
    url.searchParams.set("tool", toolId);
  } else {
    url.searchParams.delete("tool");
  }
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", url.toString());
}

function readInitialToolId() {
  const url = new URL(window.location.href);
  const fromQuery = url.searchParams.get("tool");
  if (fromQuery && getToolHostEntryById(manifest, fromQuery) && toolIds.includes(fromQuery)) {
    return fromQuery;
  }
  return toolIds[0] || "";
}

function readRequestedToolIdFromQuery() {
  const url = new URL(window.location.href);
  const requested = (url.searchParams.get("tool") || "").trim();
  if (!requested || !getToolHostEntryById(manifest, requested) || !toolIds.includes(requested)) {
    return "";
  }
  return requested;
}

function readInitialGameId() {
  const url = new URL(window.location.href);
  const gameId = (url.searchParams.get("game") || url.searchParams.get("gameId") || "").trim();
  return gameId || "";
}

function shouldMountGameFrameFromQuery() {
  const url = new URL(window.location.href);
  const mode = (url.searchParams.get("mount") || "").trim().toLowerCase();
  return mode === "game";
}

function normalizeGameHref(value) {
  const href = typeof value === "string" ? value.trim() : "";
  if (!href || !href.startsWith("/games/")) {
    return "";
  }
  if (href.includes("..")) {
    return "";
  }
  return href;
}

async function readGameEntryById(gameId) {
  const normalizedId = typeof gameId === "string" ? gameId.trim() : "";
  if (!normalizedId) {
    return null;
  }
  try {
    const response = await fetch(GAMES_METADATA_PATH, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const metadata = await response.json();
    const games = Array.isArray(metadata?.games) ? metadata.games : [];
    const entry = games.find((game) => String(game?.id || "").trim().toLowerCase() === normalizedId.toLowerCase());
    if (!entry) {
      return null;
    }
    const href = normalizeGameHref(entry.href);
    if (!href) {
      return null;
    }
    const classValues = Array.isArray(entry.classValues)
      ? entry.classValues.map((value) => String(value || "").trim()).filter(Boolean)
      : [];
    const tags = Array.isArray(entry.tags)
      ? entry.tags.map((value) => String(value || "").trim()).filter(Boolean)
      : [];
    const toolsUsed = normalizeToolsUsedList(entry.toolsUsed);
    return {
      id: String(entry.id || "").trim(),
      title: String(entry.title || entry.id || "Game").trim(),
      href,
      assetCatalogPath: deriveGameAssetCatalogPath(href),
      level: String(entry.level || "").trim(),
      status: String(entry.status || "").trim(),
      description: String(entry.description || "").trim(),
      classValues,
      tags,
      toolsUsed,
      sampleTrack: entry.sampleTrack === true,
      debugShowcase: entry.debugShowcase === true,
      requiresService: entry.requiresService === true
    };
  } catch {
    return null;
  }
}

function unmountGameFrame() {
  if (!currentGameFrame) {
    if (currentGameHostContextId) {
      removeToolHostSharedContextById(currentGameHostContextId);
      currentGameHostContextId = "";
    }
    return;
  }
  if (currentGameFrame.parentElement === refs.mountContainer) {
    currentGameFrame.removeAttribute("src");
    refs.mountContainer.removeChild(currentGameFrame);
  }
  currentGameFrame = null;
  if (currentGameHostContextId) {
    removeToolHostSharedContextById(currentGameHostContextId);
    currentGameHostContextId = "";
  }
}

async function mountGameFrame(gameEntry) {
  if (!(refs.mountContainer instanceof HTMLElement)) {
    writeStatus("Workspace container is unavailable.");
    return false;
  }
  runtime.unmountCurrentTool("switch-to-game");
  unmountGameFrame();
  const assetCatalogPath = typeof gameEntry?.assetCatalogPath === "string" ? gameEntry.assetCatalogPath : "";
  const assetCatalog = await readGameAssetCatalog(assetCatalogPath);

  const hostContext = writeToolHostSharedContext({
    toolId: "workspace-manager",
    source: "game-host",
    requestedAt: new Date().toISOString(),
    sharedContext: {
      hostMode: "game",
      gameId: gameEntry.id,
      gameTitle: gameEntry.title
    },
    state: {
      game: {
        id: gameEntry.id,
        title: gameEntry.title,
        href: gameEntry.href,
        level: gameEntry.level,
        status: gameEntry.status,
        description: gameEntry.description,
        classValues: gameEntry.classValues,
        tags: gameEntry.tags,
        sampleTrack: gameEntry.sampleTrack,
        debugShowcase: gameEntry.debugShowcase,
        requiresService: gameEntry.requiresService,
        assetCatalogPath,
        assetCatalog,
        hostedAt: new Date().toISOString()
      }
    }
  });
  if (!hostContext?.contextId) {
    writeStatus("Unable to mount game: workspace host context storage is unavailable in this browser session.");
    setCurrentLabel("No game mounted.");
    return false;
  }

  const frame = document.createElement("iframe");
  frame.setAttribute("data-game-host-frame", gameEntry.id);
  frame.setAttribute("title", `${gameEntry.title} Workspace Frame`);
  frame.setAttribute("loading", "eager");
  const gameUrl = new URL(gameEntry.href, window.location.origin);
  gameUrl.searchParams.set("hosted", "1");
  gameUrl.searchParams.set("hostToolId", "workspace-manager");
  gameUrl.searchParams.set("hostGameId", gameEntry.id);
  currentGameHostContextId = hostContext.contextId;
  gameUrl.searchParams.set("hostContextId", hostContext.contextId);
  frame.src = gameUrl.toString();
  refs.mountContainer.replaceChildren(frame);
  currentGameFrame = frame;
  setCurrentLabel(`Mounted Game: ${gameEntry.title}`);
  writeStatus(`Mounted game ${gameEntry.title}.`);
  document.title = `Workspace Manager (${gameEntry.title})`;
  return true;
}

function syncControlState() {
  const selectedToolId = readSelectedToolId();
  const hasSelection = !!selectedToolId && toolIds.includes(selectedToolId) && !!getToolHostEntryById(manifest, selectedToolId);
  const hasMount = !!runtime.getCurrentMount();

  if (refs.mountButton instanceof HTMLButtonElement) {
    refs.mountButton.disabled = !hasSelection;
  }
  if (refs.prevButton instanceof HTMLButtonElement) {
    refs.prevButton.disabled = toolIds.length === 0;
  }
  if (refs.nextButton instanceof HTMLButtonElement) {
    refs.nextButton.disabled = toolIds.length === 0;
  }
  if (refs.unmountButton instanceof HTMLButtonElement) {
    refs.unmountButton.disabled = !hasMount;
  }
}

function populateToolSelect(initialToolId) {
  if (!(refs.toolSelect instanceof HTMLSelectElement)) {
    return;
  }

  refs.toolSelect.innerHTML = toolIds
    .map((toolId) => getToolHostEntryById(manifest, toolId))
    .filter(Boolean)
    .map((tool) => `<option value="${tool.id}">${tool.displayName}</option>`)
    .join("");
  refs.toolSelect.value = toolIds.includes(initialToolId) ? initialToolId : (toolIds[0] || "");
  updateSwitchMeta();
}

function applyToolsUsedFilterForGame(gameEntry, preferredToolId = "") {
  if (!gameEntry) {
    toolIds = [...allToolIds];
  } else {
    const allowed = normalizeToolsUsedList(gameEntry.toolsUsed)
      .filter((toolId) => !!getToolHostEntryById(manifest, toolId));
    toolIds = [...allowed];
  }
  const initialToolId = toolIds.includes(preferredToolId) ? preferredToolId : (toolIds[0] || "");
  populateToolSelect(initialToolId);
  updateStandaloneHref(initialToolId);
  syncControlState();
}

const runtime = createToolHostRuntime({
  manifest,
  mountContainer: refs.mountContainer,
  onStatus(message) {
    writeStatus(message);
  },
  onMounted(tool) {
    setCurrentLabel(`Mounted: ${tool.displayName}`);
    syncControlState();
  },
  onUnmounted() {
    setCurrentLabel("No tool mounted.");
    syncControlState();
  }
});

function mountSelectedTool(source = "manual") {
  unmountGameFrame();
  const toolId = readSelectedToolId() || readInitialToolId();
  if (!toolId) {
    writeStatus("Select a tool to mount.");
    return;
  }
  let optionalState = null;
  if (refs.stateInput instanceof HTMLTextAreaElement) {
    const rawState = refs.stateInput.value.trim();
    if (rawState) {
      try {
        optionalState = JSON.parse(rawState);
      } catch {
        writeStatus("State JSON is invalid. Fix JSON or clear the state field.");
        return;
      }
    }
  }
  updateSwitchMeta();
  updateStandaloneHref(toolId);
  writeQueryToolId(toolId, source === "init");
  const previousMount = runtime.getCurrentMount();
  const launchParams = readForwardedToolLaunchParams();
  runtime.mountTool(toolId, {
    source,
    requestedAt: new Date().toISOString(),
    sharedContext: {
      requestedToolId: toolId,
      previousToolId: previousMount?.tool?.id || "",
      switchPosition: `${Math.max(1, getSelectedToolIndex() + 1)}/${Math.max(1, toolIds.length)}`
    },
    state: optionalState,
    launchParams
  });
  syncControlState();
}

function bindEvents() {
  if (refs.mountButton instanceof HTMLButtonElement) {
    refs.mountButton.addEventListener("click", () => {
      mountSelectedTool("button");
    });
  }

  if (refs.prevButton instanceof HTMLButtonElement) {
    refs.prevButton.addEventListener("click", () => {
      if (!selectToolByOffset(-1)) {
        return;
      }
      mountSelectedTool("prev");
    });
  }

  if (refs.nextButton instanceof HTMLButtonElement) {
    refs.nextButton.addEventListener("click", () => {
      if (!selectToolByOffset(1)) {
        return;
      }
      mountSelectedTool("next");
    });
  }

  if (refs.unmountButton instanceof HTMLButtonElement) {
    refs.unmountButton.addEventListener("click", () => {
      runtime.unmountCurrentTool("manual");
      syncControlState();
    });
  }

  if (refs.toolSelect instanceof HTMLSelectElement) {
    refs.toolSelect.addEventListener("change", () => {
      updateSwitchMeta();
      updateStandaloneHref(readSelectedToolId());
      mountSelectedTool("select");
    });
  }

  window.addEventListener("popstate", () => {
    const gameId = readInitialGameId();
    if (gameId) {
      void readGameEntryById(gameId).then((gameEntry) => {
        if (!gameEntry) {
          writeStatus(`Game "${gameId}" is not available for Workspace Manager launch.`);
          applyToolsUsedFilterForGame(null);
          return;
        }
        const requestedToolId = (() => {
          const url = new URL(window.location.href);
          return (url.searchParams.get("tool") || "").trim();
        })();
        applyToolsUsedFilterForGame(gameEntry, requestedToolId);
        if (!requestedToolId && shouldMountGameFrameFromQuery()) {
          void mountGameFrame(gameEntry);
          return;
        }
        mountSelectedTool("popstate");
      });
      return;
    }
    applyToolsUsedFilterForGame(null);
    const requestedToolId = readRequestedToolIdFromQuery();
    const toolId = requestedToolId || readInitialToolId();
    if (refs.toolSelect instanceof HTMLSelectElement) {
      refs.toolSelect.value = toolId;
    }
    updateSwitchMeta();
    updateStandaloneHref(toolId);
    mountSelectedTool("popstate");
    syncControlState();
  });

  window.addEventListener("beforeunload", () => {
    unmountGameFrame();
  });
}

async function init() {
  const initialGameId = readInitialGameId();
  let initialGameEntry = null;
  if (initialGameId) {
    initialGameEntry = await readGameEntryById(initialGameId);
    if (!initialGameEntry) {
      writeStatus(`Game "${initialGameId}" is not available for Workspace Manager launch.`);
    }
  }

  const rawRequestedToolId = (() => {
    const url = new URL(window.location.href);
    return (url.searchParams.get("tool") || "").trim();
  })();
  applyToolsUsedFilterForGame(initialGameEntry, rawRequestedToolId);
  bindEvents();

  const requestedToolId = readRequestedToolIdFromQuery();
  if (initialGameEntry && !requestedToolId && shouldMountGameFrameFromQuery()) {
    await mountGameFrame(initialGameEntry);
    return;
  }

  if (toolIds.length === 0) {
    writeStatus("No active tools are currently available for Workspace Manager.");
    return;
  }
  mountSelectedTool("init");
}

void init();
