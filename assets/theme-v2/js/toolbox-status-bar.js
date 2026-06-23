import { createServerRepositoryClient } from "/src/api/server-api-client.js";

const EXCLUDED_SELECTED_GAME_TOOLS = new Set(["idea-board"]);
const STATUS_BAR_SELECTOR = "[data-toolbox-status-bar]";

let repository = null;
let messageObserver = null;
let listenersInstalled = false;
let latestToolMessage = "";
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

  const label = createText("span", "toolbox-status-bar__label", "toolboxSelectedGameLabel");
  label.textContent = "Selected Game";
  const name = createText("strong", "toolbox-status-bar__game-name", "toolboxSelectedGameName");
  const meta = createText("span", "toolbox-status-bar__meta", "toolboxSelectedGameMeta");
  game.append(label, name, meta);

  const center = document.createElement("div");
  center.className = "toolbox-status-bar__center";
  center.dataset.toolboxStatusCenter = "";

  const message = createText("p", "toolbox-status-bar__message status", "toolboxStatusMessage");
  message.setAttribute("role", "status");
  const action = document.createElement("a");
  action.className = "btn btn--compact toolbox-status-bar__action";
  action.dataset.toolboxStatusAction = "";
  action.href = mountOptions.gameHubHref;
  action.textContent = "Open Game Hub";
  center.append(message, action);

  inner.append(game, center);
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

function selectedGameMeta(selectedGame) {
  return [selectedGame.purpose, selectedGame.status]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" - ");
}

function renderSelectedGame(bar, selectedGame, state, messageText) {
  const required = pageRequiresSelectedGame();
  const name = bar.querySelector("[data-toolbox-selected-game-name]");
  const meta = bar.querySelector("[data-toolbox-selected-game-meta]");
  const message = bar.querySelector("[data-toolbox-status-message]");
  const action = bar.querySelector("[data-toolbox-status-action]");

  bar.dataset.selectedGameState = state;
  bar.dataset.selectedGameRequired = String(required);
  action.hidden = false;
  action.href = mountOptions.gameHubHref;

  if (selectedGame) {
    name.textContent = selectedGame.name;
    meta.textContent = selectedGameMeta(selectedGame) || "Game Hub selected game";
    message.textContent = messageText || latestToolMessage || `Data filtered to ${selectedGame.name}.`;
    action.textContent = "Open Game Hub";
    return;
  }

  if (!required) {
    name.textContent = "Optional";
    meta.textContent = "Idea Board can start before Game Hub creation";
    message.textContent = latestToolMessage || "Idea Board can capture ideas before a Game Hub game exists.";
    action.textContent = "Open Game Hub";
    return;
  }

  if (state === "error") {
    name.textContent = "Unavailable";
    meta.textContent = "Game Hub selected game could not be read";
    message.textContent = messageText || "Game Hub selected game is unavailable. Refresh or restore the Local API.";
    action.textContent = "Open Game Hub";
    return;
  }

  name.textContent = "No game selected";
  meta.textContent = "Game Hub owns game selection";
  message.textContent = "Select or create a game in Game Hub before using this toolbox page.";
  action.textContent = "Select or Create in Game Hub";
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
