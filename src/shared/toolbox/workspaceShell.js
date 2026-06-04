import { readToolHostSharedContextFromLocation } from "./toolHostSharedContext.js";
import { normalizeText } from "../string/strings.js";

let workspaceShellInitialized = false;
let initializedWorkspaceShellState = null;

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readSearchParams(locationLike = null) {
  const rawHref = typeof locationLike === "string"
    ? locationLike
    : (locationLike && typeof locationLike.href === "string"
      ? locationLike.href
      : (typeof window !== "undefined" ? window.location.href : ""));

  if (!rawHref) {
    return new URLSearchParams();
  }

  try {
    return new URL(rawHref).searchParams;
  } catch {
    return new URLSearchParams();
  }
}

function createBaseWorkspaceShellState(locationLike = null) {
  const searchParams = readSearchParams(locationLike);
  const hosted = searchParams.get("hosted") === "1"
    || searchParams.has("hostToolId")
    || searchParams.has("hostContextId");
  const hostContextId = normalizeText(searchParams.get("hostContextId"));
  const hostContext = hosted
    ? readToolHostSharedContextFromLocation(locationLike)
    : null;
  const sharedContext = isRecord(hostContext?.sharedContext)
    ? hostContext.sharedContext
    : {};
  const payloadJson = isRecord(sharedContext.payloadJson)
    ? sharedContext.payloadJson
    : null;
  const paletteJson = isRecord(sharedContext.paletteJson)
    ? sharedContext.paletteJson
    : null;
  const errors = [];

  if (hosted && hostContextId && !hostContext) {
    errors.push("host context not found");
  }
  if (hosted && !hostContextId) {
    errors.push("hostContextId missing");
  }

  return {
    hosted,
    toolId: normalizeText(hostContext?.toolId) || normalizeText(searchParams.get("hostToolId")),
    hostContextId,
    payloadJson,
    paletteJson,
    loaded: false,
    assetLabel: "",
    paletteLabel: "none",
    statusLabel: hosted ? "Hosted context pending" : "Standalone shell",
    contractType: hosted ? "hosted.unhandled" : "standalone",
    errors
  };
}

function applyObjectVectorStudioContract(state) {
  const nextState = { ...state, errors: [...state.errors] };
  nextState.contractType = "vectorAssetDocument";

  const vectorAssetDocument = isRecord(nextState.payloadJson?.vectorAssetDocument)
    ? nextState.payloadJson.vectorAssetDocument
    : null;
  if (!vectorAssetDocument) {
    nextState.assetLabel = "";
    nextState.statusLabel = "Vector asset payload missing: payloadJson.vectorAssetDocument is required";
    nextState.errors.push("vectorAssetDocument missing");
    return nextState;
  }

  const svgText = normalizeText(vectorAssetDocument.svgText);
  nextState.loaded = Boolean(svgText);
  if (!nextState.loaded) {
    nextState.assetLabel = "";
    nextState.statusLabel = "Vector asset payload not loaded: vectorAssetDocument.svgText is required";
    nextState.errors.push("vectorAssetDocument.svgText missing");
    return nextState;
  }

  const sourceName = normalizeText(vectorAssetDocument.sourceName);
  nextState.assetLabel = sourceName || "Inline SVG";
  nextState.statusLabel = "Loaded";
  return nextState;
}

function applyPaletteContract(state) {
  const paletteName = normalizeText(state.paletteJson?.name) || normalizeText(state.paletteJson?.id);
  if (!paletteName) {
    return state;
  }
  return {
    ...state,
    paletteLabel: paletteName
  };
}

export function readWorkspaceShellStateFromLocation(locationLike = null) {
  const baseState = createBaseWorkspaceShellState(locationLike);

  if (!baseState.hosted) {
    const stateWithPalette = applyPaletteContract(baseState);
    console.log("[WORKSPACE_SHELL_STATE]", stateWithPalette);
    return stateWithPalette;
  }
  if (baseState.toolId === "object-vector-studio-v2") {
    const vectorState = applyObjectVectorStudioContract(baseState);
    console.log("[WORKSPACE_SHELL_STATE]", vectorState);
    return vectorState;
  }

  const stateWithPalette = applyPaletteContract(baseState);
  console.log("[WORKSPACE_SHELL_STATE]", stateWithPalette);
  return stateWithPalette;
}

function appendTextElement(parent, tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function renderHostedVectorAssetBadge(state, headerHost) {
  const frame = document.createElement("section");
  frame.className = "tools-platform-frame";
  frame.setAttribute("data-workspace-shell", "hosted");
  frame.setAttribute("data-workspace-shell-contract", state.contractType);
  frame.setAttribute("data-workspace-shell-loaded", state.loaded ? "1" : "0");

  const content = document.createElement("div");
  content.className = "tools-platform-frame__accordion-content";

  const summary = document.createElement("div");
  summary.className = "tools-platform-frame__accordion-summary";

  const copy = document.createElement("div");
  copy.className = "tools-platform-frame__summary-copy";
  appendTextElement(copy, "h1", "tools-platform-frame__title tools-platform-frame__title--single-line", "Object Vector Studio V2");
  appendTextElement(copy, "p", "tools-platform-frame__description tools-platform-frame__description--single-line", state.statusLabel);

  const badges = document.createElement("div");
  badges.className = "tools-platform-frame__binding-badges";
  badges.setAttribute("aria-label", "Workspace hosted asset binding");
  const badge = document.createElement("span");
  badge.className = `tools-platform-frame__binding-badge${state.loaded ? " is-active" : ""}`;
  badge.title = state.statusLabel;
  badge.textContent = `Asset: ${state.assetLabel}`;
  badges.appendChild(badge);

  summary.append(copy, badges);
  content.appendChild(summary);
  frame.appendChild(content);
  headerHost.replaceChildren(frame);
}

function renderWorkspaceShellStatus(state, statusHost) {
  const statusBar = document.createElement("div");
  statusBar.className = "tools-platform-statusbar";
  [state.statusLabel, `Contract: ${state.contractType}`, `Host: ${state.hostContextId || "none"}`].forEach((text) => {
    appendTextElement(statusBar, "span", "", text);
  });
  statusHost.replaceChildren(statusBar);
}

function publishWorkspaceShellState(state) {
  if (!state.hosted || typeof window === "undefined" || window.parent === window) {
    console.log("[VECTOR_ASSET_POSTMESSAGE_SEND]", {
      skipped: true,
      hosted: state.hosted,
      hasWindow: typeof window !== "undefined",
      parentIsSelf: typeof window !== "undefined" ? window.parent === window : true,
      toolId: state.toolId,
      hostContextId: state.hostContextId
    });
    return;
  }
  console.log("[VECTOR_ASSET_POSTMESSAGE_SEND]", {
    skipped: false,
    type: "tools:workspace-shell-state",
    toolId: state.toolId,
    hostContextId: state.hostContextId,
    loaded: state.loaded,
    assetLabel: state.assetLabel,
    statusLabel: state.statusLabel,
    contractType: state.contractType,
    payload: state
  });
  window.parent.postMessage({
    type: "tools:workspace-shell-state",
    payload: state
  }, window.location.origin);
}

export function renderWorkspaceShellFromLocation(locationLike = null, documentLike = document) {
  const state = readWorkspaceShellStateFromLocation(locationLike);
  const headerHost = documentLike.querySelector("[data-tools-platform-header]");
  const statusHost = documentLike.querySelector("[data-tools-platform-status]");
  const summaryElement = documentLike.querySelector("[data-tools-platform-summary]");

  documentLike.body?.classList?.add("tools-platform-surface", "tools-platform-workspace-context");

  if (summaryElement instanceof HTMLElement) {
    summaryElement.textContent = state.loaded ? `Object Vector Studio V2 - ${state.assetLabel}` : "Object Vector Studio V2";
    summaryElement.setAttribute("data-workspace-shell-summary", "1");
  }

  if (headerHost instanceof HTMLElement && state.toolId === "object-vector-studio-v2") {
    renderHostedVectorAssetBadge(state, headerHost);
  }
  if (statusHost instanceof HTMLElement) {
    renderWorkspaceShellStatus(state, statusHost);
  }

  publishWorkspaceShellState(state);
  return state;
}

export function initWorkspaceShell(locationLike = null, documentLike = null) {
  if (workspaceShellInitialized) {
    return initializedWorkspaceShellState;
  }
  workspaceShellInitialized = true;
  const nextLocation = locationLike || (typeof window !== "undefined" ? window.location : null);
  const nextDocument = documentLike || (typeof document !== "undefined" ? document : null);
  if (!nextDocument) {
    initializedWorkspaceShellState = readWorkspaceShellStateFromLocation(nextLocation);
    publishWorkspaceShellState(initializedWorkspaceShellState);
    return initializedWorkspaceShellState;
  }
  initializedWorkspaceShellState = renderWorkspaceShellFromLocation(nextLocation, nextDocument);
  return initializedWorkspaceShellState;
}
