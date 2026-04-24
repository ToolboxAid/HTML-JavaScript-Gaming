import { createToolHostManifest, getToolHostEntryById } from "../../tools/shared/toolHostManifest.js";
import { createToolHostRuntime } from "../../tools/shared/toolHostRuntime.js";

const GAMES_METADATA_PATH = "/games/metadata/games.index.metadata.json";

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
const toolIds = manifest.tools.map((tool) => tool.id);
const hasAvailableTools = toolIds.length > 0;
let currentGameFrame = null;

function decodeSamplePresetPayload(encoded) {
  if (typeof encoded !== "string" || !encoded.trim()) {
    return null;
  }
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;
    const jsonText = atob(padded);
    const parsed = JSON.parse(jsonText);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function readPhase20PresetFromQuery() {
  const url = new URL(window.location.href);
  const parsed = decodeSamplePresetPayload(url.searchParams.get("samplePreset") || "");
  if (!parsed || typeof parsed.state !== "object") {
    return null;
  }
  return {
    toolId: typeof parsed.toolId === "string" ? parsed.toolId : "",
    sampleId: typeof parsed.sampleId === "string" ? parsed.sampleId : "",
    label: typeof parsed.label === "string" ? parsed.label : "",
    state: parsed.state
  };
}

const phase20Preset = readPhase20PresetFromQuery();

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
  const enabled = !!entry;
  refs.standaloneLink.href = enabled ? entry.launchPath : "#";
  refs.standaloneLink.setAttribute("aria-disabled", enabled ? "false" : "true");
  refs.standaloneLink.tabIndex = enabled ? 0 : -1;
  refs.standaloneLink.classList.toggle("is-disabled", !enabled);
}

function writeQueryToolId(toolId, replace = false) {
  const url = new URL(window.location.href);
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
  if (fromQuery && getToolHostEntryById(manifest, fromQuery)) {
    return fromQuery;
  }
  return manifest.tools[0]?.id || "";
}

function readInitialGameId() {
  const url = new URL(window.location.href);
  const gameId = (url.searchParams.get("game") || "").trim();
  return gameId || "";
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
    return {
      id: String(entry.id || "").trim(),
      title: String(entry.title || entry.id || "Game").trim(),
      href
    };
  } catch {
    return null;
  }
}

function unmountGameFrame() {
  if (!currentGameFrame) {
    return;
  }
  if (currentGameFrame.parentElement === refs.mountContainer) {
    currentGameFrame.removeAttribute("src");
    refs.mountContainer.removeChild(currentGameFrame);
  }
  currentGameFrame = null;
}

function mountGameFrame(gameEntry) {
  if (!(refs.mountContainer instanceof HTMLElement)) {
    writeStatus("Workspace container is unavailable.");
    return false;
  }
  runtime.unmountCurrentTool("switch-to-game");
  unmountGameFrame();

  const frame = document.createElement("iframe");
  frame.setAttribute("data-game-host-frame", gameEntry.id);
  frame.setAttribute("title", `${gameEntry.title} Workspace Frame`);
  frame.setAttribute("loading", "eager");
  const gameUrl = new URL(gameEntry.href, window.location.origin);
  gameUrl.searchParams.set("hosted", "1");
  gameUrl.searchParams.set("hostToolId", "workspace-manager");
  gameUrl.searchParams.set("hostGameId", gameEntry.id);
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
  const hasSelection = !!selectedToolId && !!getToolHostEntryById(manifest, selectedToolId);
  const hasMount = !!runtime.getCurrentMount();

  if (refs.mountButton instanceof HTMLButtonElement) {
    refs.mountButton.disabled = !hasSelection;
  }
  if (refs.prevButton instanceof HTMLButtonElement) {
    refs.prevButton.disabled = !hasAvailableTools;
  }
  if (refs.nextButton instanceof HTMLButtonElement) {
    refs.nextButton.disabled = !hasAvailableTools;
  }
  if (refs.unmountButton instanceof HTMLButtonElement) {
    refs.unmountButton.disabled = !hasMount;
  }
}

function populateToolSelect(initialToolId) {
  if (!(refs.toolSelect instanceof HTMLSelectElement)) {
    return;
  }

  refs.toolSelect.innerHTML = manifest.tools
    .map((tool) => `<option value="${tool.id}">${tool.displayName}</option>`)
    .join("");
  refs.toolSelect.value = getToolHostEntryById(manifest, initialToolId) ? initialToolId : (manifest.tools[0]?.id || "");
  updateSwitchMeta();
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
  if (!optionalState && phase20Preset && (phase20Preset.toolId === toolId || phase20Preset.toolId === "workspace-manager")) {
    optionalState = phase20Preset.state;
  }
  updateSwitchMeta();
  updateStandaloneHref(toolId);
  writeQueryToolId(toolId, source === "init");
  const previousMount = runtime.getCurrentMount();
  runtime.mountTool(toolId, {
    source,
    requestedAt: new Date().toISOString(),
    sharedContext: {
      requestedToolId: toolId,
      previousToolId: previousMount?.tool?.id || "",
      switchPosition: `${Math.max(1, getSelectedToolIndex() + 1)}/${Math.max(1, toolIds.length)}`
    },
    state: optionalState
  });
  if (phase20Preset && (phase20Preset.toolId === toolId || phase20Preset.toolId === "workspace-manager")) {
    writeStatus(`Mounting ${toolId} with preset ${phase20Preset.sampleId || phase20Preset.label || "state"}.`);
  }
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
    const toolId = readInitialToolId();
    if (refs.toolSelect instanceof HTMLSelectElement) {
      refs.toolSelect.value = toolId;
    }
    updateSwitchMeta();
    updateStandaloneHref(toolId);
    mountSelectedTool("popstate");
    syncControlState();
  });
}

async function init() {
  const initialGameId = readInitialGameId();
  if (initialGameId) {
    const gameEntry = await readGameEntryById(initialGameId);
    if (gameEntry) {
      mountGameFrame(gameEntry);
      return;
    }
    writeStatus(`Game "${initialGameId}" is not available for Workspace Manager launch.`);
  }

  if (!hasAvailableTools) {
    writeStatus("No active tools are currently available for Workspace Manager.");
  }
  const initialToolId = readInitialToolId();
  populateToolSelect(initialToolId);
  updateStandaloneHref(initialToolId);
  syncControlState();
  bindEvents();
  if (hasAvailableTools) {
    mountSelectedTool("init");
  }
}

void init();
