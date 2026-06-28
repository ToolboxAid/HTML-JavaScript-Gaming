import { readGameJourneyCompletionMetrics } from "/src/api/game-journey-completion-api-client.js";
import { createServerRepositoryClient } from "/src/api/server-api-client.js";
import { getToolBySlug } from "/src/shared/toolbox/tool-metadata-inventory.js";
import { createThemeIcon } from "/assets/theme-v2/js/theme-icons.js";

const EXCLUDED_SELECTED_GAME_TOOLS = new Set(["idea-board"]);
const STATUS_BAR_SELECTOR = "[data-toolbox-status-bar]";
const STATUS_ICON_BY_CONTEXT_KIND = Object.freeze({
  action: "add",
  delete: "delete",
  error: "error",
  info: "info",
  save: "save",
  validation: "validation",
  warning: "warning",
});
const TOOL_PROGRESS_BUCKET_BY_SLUG = Object.freeze({
  "achievements": "Progression",
  "assets": "Graphics",
  "audio": "Audio",
  "audio-effects": "Audio",
  "characters": "Objects",
  "colors": "Graphics",
  "community": "Share",
  "controls": "Controls",
  "events": "Rules",
  "game-configuration": "Create",
  "game-design": "Design",
  "game-hub": "Create",
  "game-testing": "Play Test",
  "hitboxes": "Objects",
  "idea-board": "Idea",
  "input-mapping-v2": "Controls",
  "marketplace": "Share",
  "messages": "Interface",
  "music": "Audio",
  "objects": "Objects",
  "publish": "Publish",
  "ratings": "Share",
  "sprites": "Graphics",
  "tags": "Progression",
  "text-to-speech": "Audio",
  "videos": "Graphics",
  "voices": "Audio",
  "worlds": "Worlds",
});

let repository = null;
let messageObserver = null;
let listenersInstalled = false;
let latestToolMessage = "";
let pendingToolMessageRefresh = 0;
let mountOptions = {
  gameHubHref: "toolbox/game-hub/index.html",
  pagePath: "",
};

function getRepository() {
  if (!repository) {
    repository = createServerRepositoryClient("game-hub");
  }
  return repository;
}

function toolSlugFromPath(pagePath) {
  const parts = String(pagePath || window.location.pathname || "")
    .replace(/^\/+/, "")
    .split("/")
    .filter(Boolean);
  if (parts[0] !== "toolbox") {
    return "";
  }
  const slug = (parts[1] || "index").replace(/\.html$/i, "");
  return slug || "index";
}

function pageRequiresSelectedGame() {
  const slug = toolSlugFromPath(mountOptions.pagePath);
  return !EXCLUDED_SELECTED_GAME_TOOLS.has(slug);
}

function isRepositoryError(value) {
  return Boolean(value && typeof value === "object" && value.error === true);
}

function normalizeSelectedGame(value) {
  if (!value) {
    return null;
  }
  if (isRepositoryError(value)) {
    throw new Error(value.message || "Game Hub selected game is unavailable.");
  }
  const id = String(value.id || "").trim();
  const name = String(value.name || "").trim();
  if (!id || !name || !Array.isArray(value.members)) {
    throw new Error("Game Hub selected game payload is malformed.");
  }
  return Object.freeze({
    id,
    name,
    ownerKey: String(value.ownerKey || "").trim(),
    purpose: String(value.purpose || "Game").trim() || "Game",
    status: String(value.status || "").trim(),
  });
}

function readSelectedGame() {
  return normalizeSelectedGame(getRepository().getActiveGame());
}

function createText(tagName, className, datasetName) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (datasetName) {
    element.dataset[datasetName] = "";
  }
  return element;
}

function createStatusBar() {
  const bar = document.createElement("section");
  bar.className = "toolbox-status-bar";
  bar.dataset.toolboxStatusBar = "";
  bar.setAttribute("aria-label", "Toolbox selected game status");

  const inner = document.createElement("div");
  inner.className = "toolbox-status-bar__inner";

  const game = document.createElement("div");
  game.className = "toolbox-status-bar__game";
  game.dataset.toolboxSelectedGame = "";

  const name = createText("strong", "toolbox-status-bar__game-name", "toolboxSelectedGameName");
  game.append(name);

  const center = document.createElement("div");
  center.className = "toolbox-status-bar__center";
  center.dataset.toolboxStatusCenter = "";

  const message = createText("p", "toolbox-status-bar__message status", "toolboxStatusMessage");
  message.setAttribute("role", "status");
  center.append(message);

  const progress = createText("p", "toolbox-status-bar__progress", "toolboxStatusProgress");
  progress.setAttribute("aria-label", "Tool and journey progress");

  inner.append(game, center, progress);
  bar.append(inner);
  return bar;
}

function ensureStatusBar() {
  let bar = document.querySelector(STATUS_BAR_SELECTOR);
  if (!bar) {
    bar = createStatusBar();
  }
  placeStatusBar(bar);
  return bar;
}

function placeStatusBar(bar) {
  const footer = document.querySelector("footer.footer");
  if (footer?.parentNode) {
    if (bar.nextElementSibling !== footer) {
      footer.before(bar);
    }
    return;
  }

  const main = document.querySelector("main");
  if (main?.parentNode) {
    main.after(bar);
    return;
  }

  document.body.append(bar);
}

function visibleStatusText(element) {
  if (!element || element.closest(STATUS_BAR_SELECTOR) || element.hidden) {
    return "";
  }
  if (element.closest("[hidden]")) {
    return "";
  }
  return String(element.textContent || "").replace(/\s+/g, " ").trim();
}

function readToolMessage() {
  const messages = Array.from(document.querySelectorAll("main [role='status'], main .status"))
    .map((element, index) => ({
      index,
      priority: Object.keys(element.dataset || {}).length > 0 ? 1 : 0,
      text: visibleStatusText(element),
    }))
    .filter((entry) => entry.text);
  const prioritized = messages
    .filter((entry) => entry.priority > 0)
    .pop();
  return prioritized?.text || messages[messages.length - 1]?.text || "";
}

function updateLatestToolMessage() {
  const nextMessage = readToolMessage();
  if (nextMessage && nextMessage !== latestToolMessage) {
    latestToolMessage = nextMessage;
    refreshToolboxStatusBar();
  }
}

function scheduleToolMessageRefresh() {
  window.clearTimeout(pendingToolMessageRefresh);
  pendingToolMessageRefresh = window.setTimeout(updateLatestToolMessage, 0);
  window.setTimeout(updateLatestToolMessage, 120);
}

function observeToolMessages() {
  messageObserver?.disconnect();
  const main = document.querySelector("main");
  if (!main) {
    return;
  }
  latestToolMessage = readToolMessage();
  messageObserver = new MutationObserver(updateLatestToolMessage);
  messageObserver.observe(main, {
    characterData: true,
    childList: true,
    subtree: true,
  });
}

function publishSelectedGameContext(selectedGame, state) {
  const required = pageRequiresSelectedGame();
  const context = Object.freeze({
    required,
    selectedGame,
    source: "game-hub",
    state,
  });
  window.GameFoundryToolboxSelectedGame = context;
  document.body.dataset.toolboxSelectedGameFilter = required ? state : "optional";
  document.body.dataset.toolboxSelectedGameSource = "game-hub";
  if (selectedGame) {
    document.body.dataset.toolboxSelectedGameId = selectedGame.id;
  } else {
    delete document.body.dataset.toolboxSelectedGameId;
  }
  document.body.classList.toggle("toolbox-selected-game-missing", required && state === "missing");
  document.body.classList.toggle("toolbox-selected-game-unavailable", required && state === "error");
  document.body.classList.toggle("toolbox-selected-game-optional", !required);
  window.dispatchEvent(new CustomEvent("gamefoundry:toolbox-selected-game-context", {
    detail: context,
  }));
}

function classifyToolContext(messageText, state, required) {
  const text = String(messageText || "").trim();
  if (state === "error") {
    return { kind: "error" };
  }
  if (required && state === "missing") {
    return { kind: "action" };
  }
  if (/\b(error|failed|malformed|unavailable|could not)\b/i.test(text)) {
    return { kind: "error" };
  }
  if (/\b(sign in|refresh|try again|temporarily|blocked)\b/i.test(text)) {
    return { kind: "warning" };
  }
  if (/\b(validation|requirement|requirements|missing|required|open or seed)\b/i.test(text)) {
    return { kind: "validation" };
  }
  if (/\b(deleted)\b/i.test(text)) {
    return { kind: "delete" };
  }
  if (/\b(saved|created|updated|loaded|save changes)\b/i.test(text)) {
    return { kind: "save" };
  }
  return { kind: "info" };
}

function statusIconNameForKind(kind) {
  return STATUS_ICON_BY_CONTEXT_KIND[kind] || STATUS_ICON_BY_CONTEXT_KIND.info;
}

function renderStatusMessage(message, text, context) {
  if (!message) {
    return;
  }
  const kind = context?.kind || "info";
  const iconName = statusIconNameForKind(kind);
  const icon = createThemeIcon(iconName, {
    className: ["status-icon", `status-icon--${kind}`, "toolbox-status-bar__status-icon"],
  });
  message.dataset.toolboxStatusIcon = iconName;
  message.dataset.toolboxStatusKind = kind;
  message.replaceChildren(icon, document.createTextNode(text));
}

function normalizeTextKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function formatToolSlug(slug) {
  return String(slug || "Tool")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ") || "Tool";
}

function currentToolContext() {
  const slug = toolSlugFromPath(mountOptions.pagePath);
  const tool = getToolBySlug(slug);
  return {
    label: tool?.shortLabel || tool?.displayName || tool?.name || formatToolSlug(slug),
    slug,
  };
}

function normalizeProgressRecord(record) {
  const total = Math.max(0, Number(record?.plannedCount) || 0);
  const complete = Math.max(0, Math.min(Number(record?.completedCount) || 0, total));
  const percent = Number.isFinite(Number(record?.percentComplete))
    ? Math.max(0, Math.min(Number(record.percentComplete), 100))
    : total > 0
      ? Math.round((complete / total) * 100)
      : 0;
  return {
    complete,
    percent,
    total,
  };
}

function formatProgressRecord(label, record) {
  const progress = normalizeProgressRecord(record);
  return `${label} ${progress.complete}/${progress.total} (${progress.percent}%)`;
}

function findMetricForCurrentTool(snapshot, toolContext) {
  if (toolContext.slug === "game-journey") {
    return snapshot;
  }

  const records = Array.isArray(snapshot?.records) ? snapshot.records : [];
  const explicitBucketName = TOOL_PROGRESS_BUCKET_BY_SLUG[toolContext.slug];
  const explicitBucket = normalizeTextKey(explicitBucketName);
  const toolLabel = normalizeTextKey(toolContext.label);
  const toolSlug = normalizeTextKey(toolContext.slug);

  return records.find((metric) => {
    const bucketName = normalizeTextKey(metric?.bucketName);
    return bucketName && (
      bucketName === explicitBucket ||
      bucketName === toolLabel ||
      bucketName === toolSlug
    );
  }) || null;
}

function resolveProgressContext() {
  const toolContext = currentToolContext();
  const snapshot = readGameJourneyCompletionMetrics();
  const currentMetric = findMetricForCurrentTool(snapshot, toolContext);
  const journeyText = formatProgressRecord("Journey", snapshot);

  if (!currentMetric) {
    return {
      state: "unmapped",
      text: `${toolContext.label} progress unavailable | ${journeyText}`,
    };
  }

  return {
    state: "active",
    text: `${formatProgressRecord(toolContext.label, currentMetric)} | ${journeyText}`,
  };
}

function renderProgressContext(bar) {
  const progress = bar.querySelector("[data-toolbox-status-progress]");
  if (!progress) {
    return;
  }

  try {
    const context = resolveProgressContext();
    bar.dataset.toolboxProgressState = context.state;
    progress.textContent = context.text;
    progress.removeAttribute("title");
  } catch (error) {
    bar.dataset.toolboxProgressState = "error";
    progress.textContent = "Progress unavailable";
    progress.removeAttribute("title");
  }
}

function renderSelectedGame(bar, selectedGame, state, messageText) {
  const required = pageRequiresSelectedGame();
  const name = bar.querySelector("[data-toolbox-selected-game-name]");
  const message = bar.querySelector("[data-toolbox-status-message]");
  const nextMessage = messageText || latestToolMessage || (selectedGame
    ? `Tool context is filtered to ${selectedGame.name}.`
    : required
      ? "Select or create a game in Game Hub before using this toolbox page."
      : "Idea Board can capture ideas before a Game Hub game exists.");
  const context = classifyToolContext(nextMessage, state, required);

  bar.dataset.selectedGameState = state;
  bar.dataset.selectedGameRequired = String(required);
  bar.dataset.toolboxStatusContextKind = context.kind;
  renderProgressContext(bar);

  if (selectedGame) {
    name.textContent = selectedGame.name;
    renderStatusMessage(message, nextMessage, context);
    return;
  }

  if (!required) {
    name.textContent = "No game selected";
    renderStatusMessage(message, nextMessage, context);
    return;
  }

  if (state === "error") {
    name.textContent = "Unavailable";
    renderStatusMessage(message, nextMessage, context);
    return;
  }

  name.textContent = "No game selected";
  renderStatusMessage(message, "Select or create a game in Game Hub before using this toolbox page.", context);
}

export function refreshToolboxStatusBar() {
  const bar = ensureStatusBar();
  let selectedGame = null;
  let state = "missing";
  let message = "";

  try {
    selectedGame = readSelectedGame();
    state = selectedGame ? "active" : "missing";
  } catch (error) {
    state = "error";
    message = error instanceof Error ? error.message : String(error || "Game Hub selected game is unavailable.");
  }

  publishSelectedGameContext(selectedGame, state);
  renderSelectedGame(bar, selectedGame, state, message);
  placeStatusBar(bar);
}

function installEventListeners() {
  if (listenersInstalled) {
    return;
  }
  listenersInstalled = true;
  document.addEventListener("click", scheduleToolMessageRefresh, true);
  document.addEventListener("submit", scheduleToolMessageRefresh, true);
  document.addEventListener("change", scheduleToolMessageRefresh, true);
  window.addEventListener("gamefoundry:toolbox-selected-game-changed", refreshToolboxStatusBar);
  window.addEventListener("gamefoundry:data-changed", refreshToolboxStatusBar);
}

export function mountToolboxStatusBar(options = {}) {
  mountOptions = {
    ...mountOptions,
    ...options,
  };
  ensureStatusBar();
  observeToolMessages();
  installEventListeners();
  refreshToolboxStatusBar();
}
