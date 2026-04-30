import { getToolById, getToolRegistry } from "../toolRegistry.js";
import {
  clearSharedAssetHandoff,
  clearSharedPaletteHandoff,
  getSharedShellActions,
  readSharedAssetHandoff,
  readSharedPaletteHandoff,
  writeSharedAssetHandoff,
  writeSharedPaletteHandoff
} from "./assetUsageIntegration.js";
import { createWorkspaceSystemController } from "./projectSystem.js";
import { bindEventHandlers, createCommandDispatcher } from "./eventCommandUtils.js";
import { asHtmlInput, queryAll, queryFirst, readDataAttribute, setTextContent } from "./uiSafeUtils.js";
import { escapeHtml } from "../../src/shared/string/stringUtil.js";
import { Logger } from "../../src/engine/logging/index.js";
import { createRuntimeMonitoringHooks } from "../../src/engine/runtime/index.js";
import { logToolUiControlReady, logToolUiFinalReady, logToolUiLifecycle } from "./toolLoadDiagnostics.js";

let workspaceController = null;
let headerExpandedState = null;
let runtimeMonitoringHooks = null;
let bindingRefreshHandlersBound = false;
let workspacePagerDelegatedBound = false;
let headerIntroFullscreenBindingBound = false;
let suppressAutoFullscreenEnter = false;
let lastWorkspaceUiStateKey = "";
let lastLockedSurfaceElement = null;
let workspaceScopedToolPresetForStatus = null;
const sidebarAccordionState = new Map();

const HEADER_EXPANDED_STORAGE_KEY = "toolboxaid.toolsPlatform.headerExpanded";
const HEADER_EXPANDED_FALLBACK_TOOL = "tool-host";
const TOOLS_PLATFORM_LOGGER = new Logger({ channel: "tools.platform", level: "debug" });
const TOOLS_PLATFORM_BOOT_MS = Date.now();
const GAME_ASSET_CATALOG_SCHEMA = "html-js-gaming.game-asset-catalog";
const GAME_ASSET_CATALOG_VERSION = 1;
const WORKSPACE_LAUNCH_SIGNATURE_STORAGE_KEY = "toolboxaid.toolsPlatform.launchSignature";
const TOOL_STATE_STORAGE_KEY_PREFIX = "toolboxaid.";
const STANDARDIZED_TOOL_HEADER_IDS = new Set([
  "vector-map-editor",
  "svg-asset-studio",
  "sprite-editor",
  "state-inspector"
]);
const PRESERVED_TOOL_STATE_KEYS = new Set([
  HEADER_EXPANDED_STORAGE_KEY,
  WORKSPACE_LAUNCH_SIGNATURE_STORAGE_KEY
]);
function getPageMode() {
  return document.body.dataset.toolsPlatformPage || "tool";
}

function getDefaultHeaderExpandedState() {
  return getPageMode() === "landing";
}

function readStoredHeaderExpandedState() {
  if (typeof window === "undefined") {
    return getDefaultHeaderExpandedState();
  }
  try {
    const value = window.localStorage.getItem(HEADER_EXPANDED_STORAGE_KEY);
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
  } catch {
    // Ignore storage read failures and fall back to defaults.
  }
  return getDefaultHeaderExpandedState();
}

function writeStoredHeaderExpandedState(value) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(HEADER_EXPANDED_STORAGE_KEY, value ? "true" : "false");
  } catch {
    // Ignore storage write failures because they are non-fatal for shell rendering.
  }
}

function getRelativeToolsHomePath() {
  return getPageMode() === "landing" ? "./index.html" : "../index.html";
}

function getRelativeRepoHomePath() {
  return getPageMode() === "landing" ? "../index.html" : "../../index.html";
}

function getRegistryEntryHref(entryPoint) {
  return getPageMode() === "landing" ? `./${entryPoint}` : `../${entryPoint}`;
}

function normalizeForwardedLaunchParam(key, value) {
  const normalizedValue = normalizeTextValue(value);
  if (!normalizedValue) {
    return "";
  }
  if (key === "gameHref") {
    return normalizeLocalHref(normalizedValue, ["/games/"]);
  }
  if (key === "workspaceHref") {
    return normalizeLocalHref(normalizedValue, ["/tools/Workspace%20Manager/", "/tools/Workspace Manager/"]);
  }
  if (key === "returnTo") {
    return normalizeLocalHref(normalizedValue, ["/games/", "/samples/"]);
  }
  if (key === "samplePresetPath") {
    return normalizeSamplePresetPath(normalizedValue);
  }
  return normalizedValue;
}

function buildHostedRegistryEntryHref(toolEntry) {
  const defaultHref = getRegistryEntryHref(toolEntry.entryPoint);
  if (typeof window === "undefined") {
    return defaultHref;
  }
  const currentParams = new URLSearchParams(window.location.search);
  if (currentParams.get("hosted") !== "1") {
    return defaultHref;
  }

  const nextUrl = new URL(defaultHref, window.location.href);
  nextUrl.searchParams.set("hosted", "1");
  nextUrl.searchParams.set("hostToolId", normalizeTextValue(toolEntry.id));

  const hostContextId = normalizeTextValue(currentParams.get("hostContextId"));
  if (hostContextId) {
    nextUrl.searchParams.set("hostContextId", hostContextId);
  }

  [
    "game",
    "gameId",
    "gameTitle",
    "gameHref",
    "workspaceHref",
    "samplePresetPath",
    "sampleId",
    "sampleTitle",
    "returnTo"
  ].forEach((key) => {
    const normalizedValue = normalizeForwardedLaunchParam(key, currentParams.get(key));
    if (!normalizedValue) {
      return;
    }
    nextUrl.searchParams.set(key, normalizedValue);
  });

  return `${nextUrl.pathname}${nextUrl.search}`;
}

function normalizeTextValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSingleLineText(value) {
  return normalizeTextValue(value).replace(/\s+/g, " ");
}

function buildToolDetailsToggleText(prefix, summaryData) {
  const toolName = normalizeSingleLineText(summaryData?.toolName) || normalizeSingleLineText(summaryData?.toolId) || "Tool";
  return `${prefix} ${toolName} Details`;
}

function applyFullscreenShellState(isActive) {
  const bodyElement = document?.body instanceof HTMLElement ? document.body : null;
  const rootElement = document?.documentElement instanceof HTMLElement ? document.documentElement : null;
  if (bodyElement) {
    bodyElement.classList.toggle("tools-platform-fullscreen-active", isActive);
    if (isActive) {
      bodyElement.setAttribute("data-tools-platform-fullscreen", "1");
    } else {
      bodyElement.removeAttribute("data-tools-platform-fullscreen");
    }
  }
  if (rootElement) {
    rootElement.classList.toggle("tools-platform-fullscreen-active", isActive);
    if (isActive) {
      rootElement.setAttribute("data-tools-platform-fullscreen", "1");
    } else {
      rootElement.removeAttribute("data-tools-platform-fullscreen");
    }
  }
}

function clearFullscreenSummaryMarkers(pageHeaderAccordion) {
  const summaryElement = pageHeaderAccordion instanceof HTMLElement
    ? pageHeaderAccordion.querySelector('[data-tools-platform-summary], .is-collapsible__summary')
    : null;
  if (!(summaryElement instanceof HTMLElement)) {
    return;
  }
  summaryElement.style.removeProperty("max-width");
  summaryElement.style.removeProperty("white-space");
  summaryElement.style.removeProperty("overflow");
  summaryElement.style.removeProperty("text-overflow");
  if (summaryElement.getAttribute("data-tools-platform-summary-mode") === "fullscreen") {
    summaryElement.removeAttribute("data-tools-platform-summary-mode");
  }
  if (summaryElement.getAttribute("data-tools-platform-summary-state") === "collapsed") {
    summaryElement.removeAttribute("data-tools-platform-summary-state");
  }
}

function clearFullscreenLayoutMarkers() {
  const bodyElement = document?.body instanceof HTMLElement ? document.body : null;
  if (bodyElement) {
    bodyElement.classList.remove("fullscreen-mode");
  }
  queryAll(".visible-overlay").forEach((element) => {
    if (element instanceof HTMLElement) {
      element.classList.remove("visible-overlay");
    }
  });
  queryAll(".is-hidden-while-overlay-open").forEach((element) => {
    if (element instanceof HTMLElement) {
      element.classList.remove("is-hidden-while-overlay-open");
    }
  });
}

function restoreShellFromFullscreenExit(pageHeaderAccordion, currentTool, options = {}) {
  const keepHeaderExpanded = options?.keepHeaderExpanded !== false;
  applyFullscreenShellState(false);
  clearFullscreenLayoutMarkers();
  clearFullscreenSummaryMarkers(pageHeaderAccordion);
  if (!(pageHeaderAccordion instanceof HTMLDetailsElement)) {
    renderHeaderIntroSummary(currentTool);
    return;
  }

  const wasExpanded = pageHeaderAccordion.open === true;
  if (wasExpanded && !keepHeaderExpanded) {
    suppressAutoFullscreenEnter = true;
    pageHeaderAccordion.dataset.toolsPlatformSuppressFullscreenEnter = "1";
  }
  pageHeaderAccordion.open = keepHeaderExpanded;
  headerExpandedState = keepHeaderExpanded;
  writeStoredHeaderExpandedState(keepHeaderExpanded);
  if (!wasExpanded || keepHeaderExpanded) {
    suppressAutoFullscreenEnter = false;
    if (pageHeaderAccordion.dataset.toolsPlatformSuppressFullscreenEnter === "1") {
      delete pageHeaderAccordion.dataset.toolsPlatformSuppressFullscreenEnter;
    }
  }

  renderHeaderIntroSummary(currentTool);
}

async function exitFullscreenAndRestoreShell(pageHeaderAccordion, currentTool, options = {}) {
  if (!document.fullscreenElement || typeof document.exitFullscreen !== "function") {
    restoreShellFromFullscreenExit(pageHeaderAccordion, currentTool, options);
    return;
  }
  try {
    await document.exitFullscreen();
  } catch {
    // If exit fails, the fullscreenchange listener will keep state in sync when possible.
  } finally {
    if (!document.fullscreenElement) {
      restoreShellFromFullscreenExit(pageHeaderAccordion, currentTool, options);
    }
  }
}

function buildToolHeaderIntroData(currentTool) {
  const toolId = normalizeTextValue(currentTool?.id);
  if (!toolId) {
    return null;
  }

  const toolName = normalizeSingleLineText(currentTool?.displayName) || normalizeSingleLineText(currentTool?.name);
  const toolShortDescription = normalizeSingleLineText(currentTool?.shortDescription);
  const toolDescription = normalizeSingleLineText(currentTool?.description);
  const headerDescriptor = toolDescription || toolShortDescription;
  const headerText = toolName && headerDescriptor
    ? `${toolName} - ${headerDescriptor}`
    : `Configuration error: ${toolId} header requires tool.displayName/tool.name and tool.description/tool.shortDescription in tools/toolRegistry.js.`;
  const introText = toolName && toolDescription
    ? `${toolName}: ${toolDescription}`
    : `Configuration error: ${toolId} intro requires tool.displayName/tool.name and tool.description in tools/toolRegistry.js.`;
  const hasHeaderError = !(toolName && headerDescriptor);
  const hasIntroError = !(toolName && toolDescription);
  const diagnosticParts = [];
  if (hasHeaderError) {
    diagnosticParts.push(`Configuration error: ${toolId} header requires tool.displayName/tool.name and tool.description/tool.shortDescription in tools/toolRegistry.js.`);
  }
  if (hasIntroError) {
    diagnosticParts.push(`Configuration error: ${toolId} intro requires tool.displayName/tool.name and tool.description in tools/toolRegistry.js.`);
  }
  const headerDisplayText = hasHeaderError
    ? `${toolName || toolId} \u2014 Configuration error (open title for details)`
    : headerText;
  return {
    toolId,
    toolName,
    headerText,
    headerDisplayText,
    introText,
    hasHeaderError,
    hasIntroError,
    diagnosticText: diagnosticParts.join(" | "),
    hasConfigError: hasHeaderError || hasIntroError
  };
}

function renderHeaderIntroSummary(currentTool) {
  const pageHeaderAccordion = queryFirst('.is-collapsible');
  const summaryElement = pageHeaderAccordion instanceof HTMLElement
    ? pageHeaderAccordion.querySelector('[data-tools-platform-summary], .is-collapsible__summary')
    : null;
  if (!(summaryElement instanceof HTMLElement)) {
    return;
  }

  const summaryData = buildToolHeaderIntroData(currentTool);
  if (!summaryData) {
    summaryElement.textContent = '';
    summaryElement.removeAttribute('data-tools-platform-summary-active');
    summaryElement.removeAttribute('data-tools-platform-summary-error');
    summaryElement.removeAttribute('data-tools-platform-summary-diagnostic');
    summaryElement.removeAttribute('data-tools-platform-summary-state');
    summaryElement.removeAttribute('data-tools-platform-summary-mode');
    summaryElement.removeAttribute('title');
    return;
  }

  const isFullscreenActive = Boolean(document.fullscreenElement);
  const isExpanded = pageHeaderAccordion instanceof HTMLDetailsElement
    ? pageHeaderAccordion.open === true
    : false;
  const showDetailsText = buildToolDetailsToggleText("Show", summaryData);
  const hideDetailsText = "Hide Header and Details";
  const summaryText = isExpanded
    ? hideDetailsText
    : (isFullscreenActive ? summaryData.headerDisplayText : showDetailsText);

  // Keep the summary as a single inline text node to preserve one-line caret + text behavior.
  summaryElement.textContent = summaryText;
  if (isFullscreenActive) {
    summaryElement.style.maxWidth = "calc(100vw - 24px)";
    summaryElement.style.whiteSpace = "nowrap";
    summaryElement.style.overflow = "hidden";
    summaryElement.style.textOverflow = "ellipsis";
  } else {
    summaryElement.style.removeProperty("max-width");
    summaryElement.style.removeProperty("white-space");
    summaryElement.style.removeProperty("overflow");
    summaryElement.style.removeProperty("text-overflow");
  }
  summaryElement.setAttribute('data-tools-platform-summary-active', '1');
  summaryElement.setAttribute('data-tools-platform-summary-error', summaryData.hasConfigError ? '1' : '0');
  summaryElement.setAttribute('data-tools-platform-summary-state', isExpanded ? 'expanded' : 'collapsed');
  summaryElement.setAttribute('data-tools-platform-summary-mode', isFullscreenActive ? 'fullscreen' : 'normal');
  summaryElement.setAttribute('data-tool-id', summaryData.toolId);
  summaryElement.setAttribute('data-tools-platform-summary-diagnostic', summaryData.diagnosticText || "");
  summaryElement.setAttribute(
    'title',
    summaryData.hasConfigError
      ? `${summaryData.headerText}\n${summaryData.introText}\n${summaryData.diagnosticText}`
      : `${summaryData.headerText}\n${summaryData.introText}`
  );
}

async function syncFullscreenStateFromHeaderAccordion(accordion, currentTool) {
  if (!(accordion instanceof HTMLDetailsElement) || !document.fullscreenEnabled) {
    return;
  }
  if (suppressAutoFullscreenEnter || accordion.dataset.toolsPlatformSuppressFullscreenEnter === "1") {
    suppressAutoFullscreenEnter = false;
    if (accordion.dataset.toolsPlatformSuppressFullscreenEnter === "1") {
      delete accordion.dataset.toolsPlatformSuppressFullscreenEnter;
    }
    return;
  }

  if (accordion.open) {
    if (document.fullscreenElement) {
      await exitFullscreenAndRestoreShell(accordion, currentTool, { keepHeaderExpanded: true });
    }
    return;
  }

  if (document.fullscreenElement || typeof document.documentElement?.requestFullscreen !== 'function') {
    return;
  }
  try {
    await document.documentElement.requestFullscreen();
  } catch {
    // Ignore fullscreen request failures because collapsed summary remains usable.
  }
}

function bindHeaderIntroFullscreenEvents(currentTool) {
  if (headerIntroFullscreenBindingBound) {
    return;
  }
  const pageHeaderAccordion = queryFirst('.is-collapsible');
  if (!(pageHeaderAccordion instanceof HTMLDetailsElement)) {
    return;
  }

  headerIntroFullscreenBindingBound = true;
  pageHeaderAccordion.addEventListener('toggle', () => {
    void syncFullscreenStateFromHeaderAccordion(pageHeaderAccordion, currentTool);
    renderHeaderIntroSummary(currentTool);
  });
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest('[data-tools-platform-exit-fullscreen]')) {
      return;
    }
    event.preventDefault();
    void exitFullscreenAndRestoreShell(pageHeaderAccordion, currentTool, { keepHeaderExpanded: true });
  });
  document.addEventListener('fullscreenchange', () => {
    const isFullscreenActive = Boolean(document.fullscreenElement);
    if (isFullscreenActive) {
      applyFullscreenShellState(true);
      renderHeaderIntroSummary(currentTool);
      return;
    }
    restoreShellFromFullscreenExit(pageHeaderAccordion, currentTool, { keepHeaderExpanded: true });
  });
}

function normalizeLocalHref(value, allowedPrefixes) {
  const normalized = normalizeTextValue(value).replace(/\\/g, "/");
  if (!normalized || normalized.includes("..") || !normalized.startsWith("/")) {
    return "";
  }
  if (!Array.isArray(allowedPrefixes) || allowedPrefixes.length === 0) {
    return normalized;
  }
  return allowedPrefixes.some((prefix) => normalized.startsWith(prefix)) ? normalized : "";
}

function buildWorkspaceHrefFromGameId(gameId) {
  const normalizedGameId = normalizeTextValue(gameId);
  return normalizedGameId
    ? `/tools/Workspace%20Manager/index.html?gameId=${encodeURIComponent(normalizedGameId)}&mount=game`
    : "";
}

function normalizeSamplePresetPath(value) {
  return normalizeLocalHref(value, ["/samples/", "/games/"]);
}

function normalizeFetchRequestPath(input) {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    if (typeof input === "string") {
      return normalizeSamplePresetPath(new URL(input, window.location.href).pathname);
    }
    if (input instanceof URL) {
      return normalizeSamplePresetPath(input.pathname);
    }
    if (typeof Request !== "undefined" && input instanceof Request) {
      return normalizeSamplePresetPath(new URL(input.url, window.location.href).pathname);
    }
  } catch {
    return "";
  }
  return "";
}

function isWorkspaceManifestPreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== "object" || Array.isArray(rawPreset)) {
    return false;
  }
  const documentKind = normalizeTextValue(rawPreset.documentKind);
  const schema = normalizeTextValue(rawPreset.schema).toLowerCase();
  return documentKind === "workspace-manifest" || schema === "html-js-gaming.project";
}

function resolveWorkspaceManifestScopedToolPreset(rawPreset, toolId) {
  const directToolId = typeof toolId === "string" ? toolId : "";
  if (!directToolId) {
    return null;
  }
  const tools = rawPreset.tools && typeof rawPreset.tools === "object" && !Array.isArray(rawPreset.tools)
    ? rawPreset.tools
    : null;
  if (!tools) {
    return null;
  }

  const scopedPreset = tools[directToolId];
  if (!scopedPreset || typeof scopedPreset !== "object" || Array.isArray(scopedPreset)) {
    return null;
  }

  if (directToolId === "palette-browser") {
    const isDirectPaletteDocument = scopedPreset.schema === "html-js-gaming.palette"
      && Array.isArray(scopedPreset.swatches);
    if (!isDirectPaletteDocument) {
      console.warn(`[tools.platform] workspace scoped preset rejected: key="${directToolId}" must be direct palette JSON for palette-browser.`);
      return null;
    }
    return scopedPreset;
  }

  const payloadToolId = typeof scopedPreset.tool === "string" ? scopedPreset.tool : "";
  if (!payloadToolId) {
    console.warn(`[tools.platform] workspace scoped preset rejected: key="${directToolId}" is missing required "tool" field.`);
    return null;
  }
  if (payloadToolId !== directToolId) {
    console.warn(
      `[tools.platform] workspace scoped preset rejected: key="${directToolId}" expected tool="${directToolId}" but found tool="${payloadToolId}".`
    );
    return null;
  }
  return scopedPreset;
}

function selectWorkspaceScopedToolPreset(rawPreset, toolId) {
  if (!isWorkspaceManifestPreset(rawPreset)) {
    return null;
  }
  return resolveWorkspaceManifestScopedToolPreset(rawPreset, toolId);
}

function readWorkspaceScopedToolDocument(payload = {}, documentKey = "", rootToolState = {}) {
  const sourcePayload = payload && typeof payload === "object" && !Array.isArray(payload)
    ? payload
    : {};
  const payloadValue = sourcePayload[documentKey];
  if (payloadValue && typeof payloadValue === "object" && !Array.isArray(payloadValue)) {
    return payloadValue;
  }
  return null;
}

function summarizeEmbeddedToolPayloadDocument(toolId = "", scopedToolState = null) {
  const normalizedToolId = normalizeTextValue(toolId).toLowerCase();
  if (!normalizedToolId || !scopedToolState || typeof scopedToolState !== "object" || Array.isArray(scopedToolState)) {
    return null;
  }
  const payload = scopedToolState.payload && typeof scopedToolState.payload === "object" && !Array.isArray(scopedToolState.payload)
    ? scopedToolState.payload
    : {};
  const fallbackId = normalizeTextValue(scopedToolState.tool || normalizedToolId);
  const directPalette = normalizedToolId === "palette-browser" && Array.isArray(scopedToolState.swatches)
    ? scopedToolState
    : null;
  if (directPalette) {
    const name = normalizeTextValue(directPalette.name || directPalette.id || fallbackId);
    const swatchCount = directPalette.swatches.length;
    return `embedded palette ${name || fallbackId}${swatchCount > 0 ? ` (${swatchCount} swatches)` : ""}`;
  }

  const vectorMapDocument = readWorkspaceScopedToolDocument(payload, "vectorMapDocument", scopedToolState);
  if (vectorMapDocument) {
    const name = normalizeTextValue(vectorMapDocument.name || vectorMapDocument.id || fallbackId);
    const objectCount = Array.isArray(vectorMapDocument.objects) ? vectorMapDocument.objects.length : 0;
    return `embedded vector map ${name || fallbackId}${objectCount > 0 ? ` (${objectCount} objects)` : ""}`;
  }

  const vectorAssetDocument = readWorkspaceScopedToolDocument(payload, "vectorAssetDocument", scopedToolState);
  if (vectorAssetDocument) {
    const sourceName = normalizeTextValue(vectorAssetDocument.sourceName || vectorAssetDocument.name || fallbackId);
    return `embedded vector asset ${sourceName || fallbackId}`;
  }

  const tileMapDocument = readWorkspaceScopedToolDocument(payload, "tileMapDocument", scopedToolState);
  if (tileMapDocument) {
    const mapName = normalizeTextValue(tileMapDocument?.map?.name || tileMapDocument.name || tileMapDocument.id || fallbackId);
    const layerCount = Array.isArray(tileMapDocument.layers) ? tileMapDocument.layers.length : 0;
    return `embedded tile map ${mapName || fallbackId}${layerCount > 0 ? ` (${layerCount} layers)` : ""}`;
  }

  const parallaxDocument = readWorkspaceScopedToolDocument(payload, "parallaxDocument", scopedToolState);
  if (parallaxDocument) {
    const mapName = normalizeTextValue(parallaxDocument?.map?.name || parallaxDocument.name || fallbackId);
    const layerCount = Array.isArray(parallaxDocument.layers) ? parallaxDocument.layers.length : 0;
    return `embedded parallax ${mapName || fallbackId}${layerCount > 0 ? ` (${layerCount} layers)` : ""}`;
  }

  const spriteProject = readWorkspaceScopedToolDocument(payload, "spriteProject", scopedToolState);
  if (spriteProject) {
    const frameCount = Array.isArray(spriteProject.frames) ? spriteProject.frames.length : 0;
    return `embedded sprite project${frameCount > 0 ? ` (${frameCount} frames)` : ""}`;
  }

  const skin = readWorkspaceScopedToolDocument(payload, "skin", scopedToolState) || (
    scopedToolState.skin && typeof scopedToolState.skin === "object" && !Array.isArray(scopedToolState.skin)
      ? scopedToolState.skin
      : null
  );
  if (skin) {
    const name = normalizeTextValue(skin.name || skin.gameId || skin.projectId || fallbackId);
    return `embedded skin ${name || fallbackId}`;
  }

  const flatAssets = scopedToolState.assets && typeof scopedToolState.assets === "object" && !Array.isArray(scopedToolState.assets)
    ? scopedToolState.assets
    : null;
  if (flatAssets) {
    const entryCount = Object.values(flatAssets)
      .filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry) && normalizeTextValue(entry.path))
      .length;
    return `embedded asset map (${entryCount} entries)`;
  }

  const palette = readWorkspaceScopedToolDocument(payload, "palette", scopedToolState)
    || (Array.isArray(payload.swatches) ? payload : null);
  if (palette) {
    const name = normalizeTextValue(palette.name || palette.id || fallbackId);
    const swatchCount = Array.isArray(palette.swatches) ? palette.swatches.length : 0;
    return `embedded palette ${name || fallbackId}${swatchCount > 0 ? ` (${swatchCount} swatches)` : ""}`;
  }

  const snapshot = readWorkspaceScopedToolDocument(payload, "snapshot", scopedToolState);
  if (snapshot) {
    const snapshotId = normalizeTextValue(snapshot.toolId || snapshot.schema || fallbackId);
    return `embedded snapshot ${snapshotId || fallbackId}`;
  }

  if (Array.isArray(payload.events)) {
    return `embedded events (${payload.events.length})`;
  }

  const profileSettings = readWorkspaceScopedToolDocument(payload, "profileSettings", scopedToolState);
  if (profileSettings) {
    return "embedded profile settings";
  }

  const physicsBody = readWorkspaceScopedToolDocument(payload, "physicsBody", scopedToolState);
  if (physicsBody) {
    return "embedded physics body";
  }

  const pipelinePayload = readWorkspaceScopedToolDocument(payload, "pipelinePayload", scopedToolState);
  if (pipelinePayload) {
    const projectId = normalizeTextValue(pipelinePayload.projectId || fallbackId);
    return `embedded pipeline payload ${projectId || fallbackId}`;
  }

  const candidate = readWorkspaceScopedToolDocument(payload, "candidate", scopedToolState);
  if (candidate) {
    const name = normalizeTextValue(candidate.id || candidate.name || fallbackId);
    return `embedded candidate ${name || fallbackId}`;
  }

  const mapPayload = readWorkspaceScopedToolDocument(payload, "mapPayload", scopedToolState);
  if (mapPayload) {
    const name = normalizeTextValue(mapPayload.mapId || mapPayload.id || fallbackId);
    return `embedded map payload ${name || fallbackId}`;
  }

  const asset3d = readWorkspaceScopedToolDocument(payload, "asset3d", scopedToolState);
  if (asset3d) {
    const name = normalizeTextValue(asset3d.assetId || asset3d.id || fallbackId);
    return `embedded 3D asset ${name || fallbackId}`;
  }

  const cameraPath = readWorkspaceScopedToolDocument(payload, "cameraPath", scopedToolState);
  if (cameraPath) {
    const name = normalizeTextValue(cameraPath.pathId || cameraPath.id || fallbackId);
    return `embedded camera path ${name || fallbackId}`;
  }

  return null;
}

function installWorkspaceScopedSamplePresetFetchShim(currentToolId, samplePresetPath) {
  if (typeof window === "undefined" || typeof window.fetch !== "function") {
    return;
  }
  const normalizedToolId = normalizeTextValue(currentToolId).toLowerCase();
  const normalizedSamplePresetPath = normalizeSamplePresetPath(samplePresetPath);
  if (!normalizedToolId || !normalizedSamplePresetPath) {
    return;
  }
  if (window.fetch.__workspaceScopedSamplePresetShim === true) {
    return;
  }
  const originalFetch = window.fetch.bind(window);
  const patchedFetch = async (...args) => {
    const requestPath = normalizeFetchRequestPath(args[0]);
    const response = await originalFetch(...args);
    if (!response?.ok || requestPath !== normalizedSamplePresetPath) {
      return response;
    }
    const rawPreset = await response.clone().json().catch(() => null);
    const scopedPreset = selectWorkspaceScopedToolPreset(rawPreset, normalizedToolId);
    if (!scopedPreset) {
      return response;
    }
    workspaceScopedToolPresetForStatus = scopedPreset;
    const headers = new Headers(response.headers || {});
    if (!headers.get("content-type")) {
      headers.set("content-type", "application/json; charset=utf-8");
    }
    return new Response(JSON.stringify(scopedPreset), {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  };
  patchedFetch.__workspaceScopedSamplePresetShim = true;
  patchedFetch.__workspaceScopedSamplePresetOriginalFetch = originalFetch;
  window.fetch = patchedFetch;
}

async function primeWorkspaceScopedToolPresetForStatus(toolId, samplePresetPath) {
  const normalizedToolId = normalizeTextValue(toolId).toLowerCase();
  const normalizedSamplePresetPath = normalizeSamplePresetPath(samplePresetPath);
  if (!normalizedToolId || !normalizedSamplePresetPath || typeof window === "undefined" || typeof window.fetch !== "function") {
    return null;
  }
  try {
    const response = await window.fetch(normalizedSamplePresetPath, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const rawPreset = await response.json();
    const scopedPreset = selectWorkspaceScopedToolPreset(rawPreset, normalizedToolId);
    if (!scopedPreset) {
      return null;
    }
    workspaceScopedToolPresetForStatus = scopedPreset;
    return scopedPreset;
  } catch {
    return null;
  }
}

function readLaunchPayloadSignature(searchParams) {
  if (!(searchParams instanceof URLSearchParams)) {
    return "";
  }
  const gameId = normalizeTextValue(searchParams.get("gameId") || searchParams.get("game"));
  const gameHref = normalizeLocalHref(searchParams.get("gameHref"), ["/games/"]);
  const samplePresetPath = normalizeSamplePresetPath(searchParams.get("samplePresetPath"));
  const parts = [];
  if (gameId) {
    parts.push(`gameId=${gameId.toLowerCase()}`);
  }
  if (gameHref) {
    parts.push(`gameHref=${gameHref.toLowerCase()}`);
  }
  if (samplePresetPath) {
    parts.push(`samplePresetPath=${samplePresetPath}`);
  }
  return parts.join("|");
}

function readStoredLaunchSignature() {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    return normalizeTextValue(window.localStorage.getItem(WORKSPACE_LAUNCH_SIGNATURE_STORAGE_KEY));
  } catch {
    return "";
  }
}

function writeStoredLaunchSignature(signature) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (signature) {
      window.localStorage.setItem(WORKSPACE_LAUNCH_SIGNATURE_STORAGE_KEY, signature);
      return;
    }
    window.localStorage.removeItem(WORKSPACE_LAUNCH_SIGNATURE_STORAGE_KEY);
  } catch {
    // Ignore storage failures and continue.
  }
}

function clearSharedBindingsForNewLaunch(signature) {
  if (!signature) {
    return false;
  }
  const previous = readStoredLaunchSignature();
  if (previous && previous === signature) {
    return false;
  }
  clearToolStateStorageForWorkspaceLaunch();
  clearSharedAssetHandoff();
  clearSharedPaletteHandoff();
  writeStoredLaunchSignature(signature);
  return true;
}

function clearToolStateStorageForWorkspaceLaunch() {
  if (typeof window === "undefined") {
    return;
  }

  const clearStorageLike = (storageLike) => {
    if (!storageLike || typeof storageLike.length !== "number") {
      return;
    }
    const keysToRemove = [];
    for (let index = 0; index < storageLike.length; index += 1) {
      const key = normalizeTextValue(storageLike.key(index));
      if (!key || !key.startsWith(TOOL_STATE_STORAGE_KEY_PREFIX)) {
        continue;
      }
      if (PRESERVED_TOOL_STATE_KEYS.has(key)) {
        continue;
      }
      keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => {
      try {
        storageLike.removeItem(key);
      } catch {
        // Ignore storage write failures and continue.
      }
    });
  };

  try {
    clearStorageLike(window.localStorage);
  } catch {
    // Ignore storage read/write failures and continue.
  }
  try {
    clearStorageLike(window.sessionStorage);
  } catch {
    // Ignore storage read/write failures and continue.
  }
}

function readGameLaunchContext() {
  if (typeof window === "undefined") {
    return null;
  }
  const searchParams = new URLSearchParams(window.location.search);
  const gameId = normalizeTextValue(searchParams.get("gameId") || searchParams.get("game"));
  const gameTitle = normalizeTextValue(searchParams.get("gameTitle"));
  const gameHref = normalizeLocalHref(searchParams.get("gameHref"), ["/games/"]);
  const workspaceHrefParam = normalizeLocalHref(searchParams.get("workspaceHref"), ["/tools/Workspace%20Manager/", "/tools/Workspace Manager/"]);
  const workspaceHref = workspaceHrefParam || buildWorkspaceHrefFromGameId(gameId);
  if (!gameId && !gameTitle && !gameHref && !workspaceHref) {
    return null;
  }
  return {
    gameId,
    gameTitle,
    gameHref,
    workspaceHref
  };
}

function deriveGameAssetCatalogPaths(context) {
  const candidates = new Set();
  const gameHref = normalizeTextValue(context?.gameHref);
  if (gameHref.endsWith("/index.html")) {
    const base = gameHref.slice(0, -"/index.html".length);
    candidates.add(`${base}/assets/workspace.asset-catalog.json`);
    const lowerCasedBase = base.replace(/^\/games\/([^/]+)/i, (_, folderName) => `/games/${folderName.toLowerCase()}`);
    candidates.add(`${lowerCasedBase}/assets/workspace.asset-catalog.json`);
  } else if (gameHref.endsWith("/")) {
    const base = gameHref.slice(0, -1);
    candidates.add(`${base}/assets/workspace.asset-catalog.json`);
    const lowerCasedBase = base.replace(/^\/games\/([^/]+)/i, (_, folderName) => `/games/${folderName.toLowerCase()}`);
    candidates.add(`${lowerCasedBase}/assets/workspace.asset-catalog.json`);
  }

  const gameId = normalizeTextValue(context?.gameId);
  if (gameId) {
    candidates.add(`/games/${encodeURIComponent(gameId)}/assets/workspace.asset-catalog.json`);
    candidates.add(`/games/${encodeURIComponent(gameId.toLowerCase())}/assets/workspace.asset-catalog.json`);
  }

  return Array.from(candidates).filter(Boolean);
}

function deriveGameManifestPaths(context) {
  const candidates = new Set();
  const gameHref = normalizeTextValue(context?.gameHref);
  if (gameHref.endsWith("/index.html")) {
    const base = gameHref.slice(0, -"/index.html".length);
    candidates.add(`${base}/game.manifest.json`);
    const lowerCasedBase = base.replace(/^\/games\/([^/]+)/i, (_, folderName) => `/games/${folderName.toLowerCase()}`);
    candidates.add(`${lowerCasedBase}/game.manifest.json`);
  } else if (gameHref.endsWith("/")) {
    const base = gameHref.slice(0, -1);
    candidates.add(`${base}/game.manifest.json`);
    const lowerCasedBase = base.replace(/^\/games\/([^/]+)/i, (_, folderName) => `/games/${folderName.toLowerCase()}`);
    candidates.add(`${lowerCasedBase}/game.manifest.json`);
  }

  const gameId = normalizeTextValue(context?.gameId);
  if (gameId) {
    candidates.add(`/games/${encodeURIComponent(gameId)}/game.manifest.json`);
    candidates.add(`/games/${encodeURIComponent(gameId.toLowerCase())}/game.manifest.json`);
  }

  return Array.from(candidates).filter(Boolean);
}

function normalizeCatalogEntries(value) {
  const source = value && typeof value === "object" ? value : {};
  return Object.entries(source)
    .map(([assetId, rawEntry]) => {
      const safeAssetId = normalizeTextValue(assetId);
      const entry = rawEntry && typeof rawEntry === "object" ? rawEntry : {};
      const kind = normalizeTextValue(entry.kind).toLowerCase();
      const path = normalizeTextValue(entry.path || entry.runtimePath || entry.href);
      return { assetId: safeAssetId, kind, path };
    })
    .filter((entry) => Boolean(entry.assetId && entry.kind && entry.path));
}

function getHandoffGameId(handoff) {
  return normalizeTextValue(handoff?.metadata?.gameId).toLowerCase();
}

function isCurrentGameHandoff(handoff, launchContext) {
  const launchGameId = normalizeTextValue(launchContext?.gameId).toLowerCase();
  if (!launchGameId) {
    return false;
  }
  return getHandoffGameId(handoff) === launchGameId;
}

function parseCatalogPayload(catalogPayload) {
  if (!catalogPayload || typeof catalogPayload !== "object") {
    return null;
  }
  const schema = normalizeTextValue(catalogPayload.schema);
  const version = Number(catalogPayload.version);
  if (schema !== GAME_ASSET_CATALOG_SCHEMA || version !== GAME_ASSET_CATALOG_VERSION) {
    return null;
  }
  const entries = normalizeCatalogEntries(catalogPayload.assets || catalogPayload.entries);
  return {
    payload: catalogPayload,
    entries
  };
}

async function readCatalogContextFromLaunchContext(launchContext) {
  if (!launchContext?.gameId && !launchContext?.gameHref) {
    return null;
  }

  const catalogPaths = deriveGameAssetCatalogPaths(launchContext);
  for (const catalogPath of catalogPaths) {
    const catalogPayload = await readJsonDocument(catalogPath);
    const parsed = parseCatalogPayload(catalogPayload);
    if (!parsed) {
      continue;
    }
    return {
      launchContext,
      catalogPath,
      catalogPayload: parsed.payload,
      entries: parsed.entries
    };
  }
  return null;
}

async function readManifestContextFromLaunchContext(launchContext) {
  if (!launchContext?.gameId && !launchContext?.gameHref) {
    return null;
  }

  const manifestPaths = deriveGameManifestPaths(launchContext);
  for (const manifestPath of manifestPaths) {
    const manifestPayload = await readJsonDocument(manifestPath);
    if (!manifestPayload || typeof manifestPayload !== "object" || Array.isArray(manifestPayload)) {
      continue;
    }
    return {
      launchContext,
      manifestPath,
      manifestPayload
    };
  }
  return null;
}

function pickCatalogEntryByKind(entries, preferredKinds = []) {
  const source = Array.isArray(entries) ? entries : [];
  for (const kind of preferredKinds) {
    const found = source.find((entry) => entry.kind === kind);
    if (found) {
      return found;
    }
  }
  return source[0] || null;
}

function inferAssetDisplayName(entry, payload) {
  const candidateName = normalizeTextValue(payload?.name);
  if (candidateName) {
    return candidateName;
  }
  return entry?.assetId || "shared-asset";
}

async function hydrateSharedAssetFromGameLaunchContext(catalogContext = null) {
  const launchContext = catalogContext?.launchContext || readGameLaunchContext();
  if (!launchContext?.gameId && !launchContext?.gameHref) {
    return false;
  }

  const existingAsset = readSharedAssetHandoff();
  if (existingAsset?.assetId && isCurrentGameHandoff(existingAsset, launchContext)) {
    return false;
  }

  const manifestContext = await readManifestContextFromLaunchContext(launchContext);
  const manifestVectors = manifestContext?.manifestPayload?.tools?.["svg-asset-studio"]?.vectors;
  const manifestVectorEntry = (() => {
    if (Array.isArray(manifestVectors)) {
      return manifestVectors.find((entry) => Boolean(normalizeTextValue(entry?.id))) || null;
    }
    if (manifestVectors && typeof manifestVectors === "object") {
      const firstKey = normalizeTextValue(Object.keys(manifestVectors)[0]);
      if (!firstKey) {
        return null;
      }
      const vectorRecord = manifestVectors[firstKey];
      if (vectorRecord && typeof vectorRecord === "object") {
        return {
          id: normalizeTextValue(vectorRecord.id) || firstKey,
          ...vectorRecord
        };
      }
      return null;
    }
    return null;
  })();
  const manifestVectorId = normalizeTextValue(manifestVectorEntry?.id);
  const manifestVectorStyle = manifestVectorEntry?.style && typeof manifestVectorEntry.style === "object"
    ? {
      stroke: manifestVectorEntry.style.stroke === true,
      fill: manifestVectorEntry.style.fill === true,
      strokeSymbol: normalizeTextValue(manifestVectorEntry.style.strokeSymbol),
      fillSymbol: normalizeTextValue(manifestVectorEntry.style.fillSymbol)
    }
    : null;
  const launchGameId = normalizeTextValue(launchContext?.gameId).toLowerCase();
  const shouldPreferManifestVector = launchGameId === "gravitywell";
  if (shouldPreferManifestVector && manifestVectorId) {
    return writeSharedAssetHandoff({
      assetId: manifestVectorId,
      assetType: "vector",
      sourcePath: manifestContext?.manifestPath || "",
      displayName: manifestVectorId,
      tags: ["vector"],
      metadata: {
        source: "workspace-game-manifest.svg-asset-studio",
        gameId: launchContext.gameId || "",
        sourcePath: manifestContext?.manifestPath || "",
        vectorStyle: manifestVectorStyle
      },
      sourceToolId: "workspace-manager",
      selectedAt: new Date().toISOString()
    });
  }

  const context = catalogContext || await readCatalogContextFromLaunchContext(launchContext);
  if (!context || !Array.isArray(context.entries) || context.entries.length === 0) {
    if (manifestVectorId) {
      return writeSharedAssetHandoff({
        assetId: manifestVectorId,
        assetType: "vector",
        sourcePath: manifestContext?.manifestPath || "",
        displayName: manifestVectorId,
        tags: ["vector"],
        metadata: {
          source: "workspace-game-manifest.svg-asset-studio",
          gameId: launchContext.gameId || "",
          sourcePath: manifestContext?.manifestPath || "",
          vectorStyle: manifestVectorStyle
        },
        sourceToolId: "workspace-manager",
        selectedAt: new Date().toISOString()
      });
    }
    return false;
  }

  const nonPaletteEntries = context.entries.filter((entry) => entry.kind !== "palette");
  if (!nonPaletteEntries.length) {
    return false;
  }

  const primaryAsset = pickCatalogEntryByKind(nonPaletteEntries, [
    "skin",
    "sprite",
    "tilemap",
    "parallax",
    "vector",
    "image",
    "audio"
  ]);
  if (!primaryAsset) {
    return false;
  }

  const maybeJsonPayload = primaryAsset.path.toLowerCase().endsWith(".json")
    ? await readJsonDocument(primaryAsset.path)
    : null;
  const displayName = inferAssetDisplayName(primaryAsset, maybeJsonPayload);
  const normalizedPrimaryKind = normalizeAssetKind(primaryAsset.kind || "asset");

  return writeSharedAssetHandoff({
    assetId: primaryAsset.assetId,
    assetType: normalizedPrimaryKind || "asset",
    sourcePath: primaryAsset.path,
    displayName,
    tags: [normalizedPrimaryKind || "asset"],
    metadata: {
      source: "workspace-game-catalog",
      gameId: launchContext.gameId || "",
      sourcePath: primaryAsset.path
    },
    sourceToolId: "workspace-manager",
    selectedAt: new Date().toISOString()
  });
}

async function readJsonDocument(pathValue) {
  const safePath = normalizeTextValue(pathValue);
  if (!safePath || typeof fetch !== "function") {
    return null;
  }
  try {
    const response = await fetch(safePath, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

function normalizeHexColor(value) {
  const normalized = normalizeTextValue(value);
  const match = normalized.match(/^#([0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (!match) {
    return "";
  }
  return `#${match[1].toUpperCase()}`;
}

function normalizePaletteColorsFromArray(rawEntries) {
  if (!Array.isArray(rawEntries)) {
    return [];
  }
  return rawEntries
    .filter((entry) => entry && typeof entry === "object")
    .map((entry, index) => {
      const hex = normalizeHexColor(entry.hex);
      if (!hex) {
        return null;
      }
      return {
        symbol: normalizeTextValue(entry.symbol),
        hex,
        name: normalizeTextValue(entry.name) || `Swatch ${index + 1}`
      };
    })
    .filter(Boolean);
}

function normalizePaletteColorsFromHexArray(rawColors) {
  if (!Array.isArray(rawColors)) {
    return [];
  }
  return rawColors
    .map((entry, index) => {
      const hex = normalizeHexColor(entry);
      if (!hex) {
        return null;
      }
      return {
        symbol: "",
        hex,
        name: `Swatch ${index + 1}`
      };
    })
    .filter(Boolean);
}

function buildPaletteHandoffShape(rawPalette, options = {}) {
  if (!rawPalette || typeof rawPalette !== "object" || Array.isArray(rawPalette)) {
    return null;
  }
  const colorsFromSwatches = normalizePaletteColorsFromArray(rawPalette.swatches);
  const colorsFromEntries = normalizePaletteColorsFromArray(rawPalette.entries);
  const colorsFromHex = normalizePaletteColorsFromHexArray(rawPalette.colors);
  const colors = colorsFromSwatches.length > 0
    ? colorsFromSwatches
    : (colorsFromEntries.length > 0 ? colorsFromEntries : colorsFromHex);
  if (colors.length === 0) {
    return null;
  }

  const fallbackPaletteId = normalizeTextValue(options.fallbackPaletteId);
  const fallbackDisplayName = normalizeTextValue(options.fallbackDisplayName);
  const paletteId = normalizeTextValue(rawPalette.sourceId || rawPalette.paletteId || rawPalette.id || rawPalette.name || fallbackPaletteId);
  const displayName = normalizeTextValue(rawPalette.name || fallbackDisplayName || paletteId);
  return {
    paletteId: paletteId || "shared-palette",
    displayName: displayName || "Shared Palette",
    colors
  };
}

function readPaletteFromManifestPayload(manifestPayload, launchContext = null) {
  const source = manifestPayload && typeof manifestPayload === "object" && !Array.isArray(manifestPayload)
    ? manifestPayload
    : null;
  if (!source) {
    return null;
  }

  const tools = source.tools && typeof source.tools === "object" && !Array.isArray(source.tools)
    ? source.tools
    : {};
  const paletteBrowserSection = tools["palette-browser"] && typeof tools["palette-browser"] === "object" && !Array.isArray(tools["palette-browser"])
    ? tools["palette-browser"]
    : null;
  const directPalettePayload = normalizeTextValue(paletteBrowserSection?.schema).toLowerCase() === "html-js-gaming.palette"
    ? paletteBrowserSection
    : null;
  const wrappedPalettePayload = paletteBrowserSection?.payload && typeof paletteBrowserSection.payload === "object" && !Array.isArray(paletteBrowserSection.payload)
    ? paletteBrowserSection.payload
    : null;
  const paletteBrowserPayload = directPalettePayload || wrappedPalettePayload;
  if (!paletteBrowserPayload) {
    return null;
  }

  const fallbackPaletteId = normalizeTextValue(launchContext?.gameId)
    ? `palette.${normalizeTextValue(launchContext.gameId).toLowerCase()}`
    : "palette.game";
  const fallbackDisplayName = normalizeTextValue(paletteBrowserSection?.name) || "Game Palette";
  const normalized = buildPaletteHandoffShape(paletteBrowserPayload, {
    fallbackPaletteId,
    fallbackDisplayName
  });
  if (!normalized) {
    return null;
  }
  return {
    ...normalized,
    source: directPalettePayload
      ? "workspace-game-manifest.palette-browser"
      : "workspace-game-manifest.palette-browser.payload"
  };
}

async function hydrateSharedPaletteFromSamplePresetPath(samplePresetPath = "") {
  const normalizedSamplePresetPath = normalizeSamplePresetPath(samplePresetPath);
  if (!normalizedSamplePresetPath || typeof window === "undefined" || typeof window.fetch !== "function") {
    return false;
  }
  const fetchImpl = window.fetch.__workspaceScopedSamplePresetOriginalFetch || window.fetch.bind(window);
  try {
    const response = await fetchImpl(normalizedSamplePresetPath, { cache: "no-store" });
    if (!response.ok) {
      return false;
    }
    const samplePreset = await response.json();
    if (!isWorkspaceManifestPreset(samplePreset)) {
      return false;
    }
    const manifestPalette = readPaletteFromManifestPayload(samplePreset, null);
    if (!manifestPalette) {
      return false;
    }
    return writeSharedPaletteHandoff({
      paletteId: manifestPalette.paletteId,
      displayName: manifestPalette.displayName,
      colors: manifestPalette.colors,
      metadata: {
        source: manifestPalette.source,
        sourcePath: normalizedSamplePresetPath
      },
      sourceToolId: "workspace-manager",
      selectedAt: new Date().toISOString()
    });
  } catch {
    return false;
  }
}

async function hydrateSharedPaletteFromGameLaunchContext(catalogContext = null) {
  const launchContext = catalogContext?.launchContext || readGameLaunchContext();
  if (!launchContext?.gameId && !launchContext?.gameHref) {
    return false;
  }

  const existingPalette = readSharedPaletteHandoff();
  if (existingPalette?.paletteId && isCurrentGameHandoff(existingPalette, launchContext)) {
    return false;
  }

  const manifestContext = await readManifestContextFromLaunchContext(launchContext);
  const manifestPalette = readPaletteFromManifestPayload(manifestContext?.manifestPayload, launchContext);
  if (manifestPalette) {
    return writeSharedPaletteHandoff({
      paletteId: manifestPalette.paletteId,
      displayName: manifestPalette.displayName,
      colors: manifestPalette.colors,
      metadata: {
        source: manifestPalette.source,
        gameId: launchContext.gameId || "",
        sourcePath: manifestContext?.manifestPath || ""
      },
      sourceToolId: "workspace-manager",
      selectedAt: new Date().toISOString()
    });
  }

  const context = catalogContext || await readCatalogContextFromLaunchContext(launchContext);
  if (!context || !Array.isArray(context.entries)) {
    return false;
  }

  const paletteEntries = context.entries.filter((entry) => entry.kind === "palette");
  const primaryPalette = paletteEntries[0];
  if (!primaryPalette) {
    return false;
  }

  const palettePayload = await readJsonDocument(primaryPalette.path);
  const catalogPalette = buildPaletteHandoffShape(palettePayload, {
    fallbackPaletteId: primaryPalette.assetId,
    fallbackDisplayName: primaryPalette.assetId
  });
  if (!catalogPalette) {
    return false;
  }

  return writeSharedPaletteHandoff({
    paletteId: catalogPalette.paletteId || primaryPalette.assetId,
    displayName: catalogPalette.displayName || primaryPalette.assetId,
    colors: catalogPalette.colors,
    metadata: {
      source: "workspace-game-catalog",
      gameId: launchContext.gameId || "",
      sourcePath: primaryPalette.path
    },
    sourceToolId: "workspace-manager",
    selectedAt: new Date().toISOString()
  });
}

function renderGameReturnLine() {
  const context = readGameLaunchContext();
  if (!context) {
    return "";
  }
  const gameLabel = context.gameTitle || context.gameId || "Game";
  const gamePageLink = context.gameHref
    ? `<a class="tools-platform-frame__action-link" href="${escapeHtml(context.gameHref)}">Open Game</a>`
    : "";
  return `
    <div class="tools-platform-frame__return-line" aria-label="Game launch context">
      <span class="tools-platform-frame__return-copy"><strong>Game Source:</strong> ${escapeHtml(gameLabel)}</span>
      ${gamePageLink}
    </div>
  `;
}

function getManifest() {
  return workspaceController ? workspaceController.getManifest() : null;
}

function isWorkspaceManagerContext() {
  if (typeof window === "undefined") {
    return false;
  }
  const currentPath = window.location.pathname || "";
  const searchParams = new URLSearchParams(window.location.search);
  const isHostedWorkspaceView = searchParams.get("hosted") === "1"
    || searchParams.has("hostToolId")
    || searchParams.has("hostContextId");
  const isWorkspaceManagerReferrer = /\/tools\/Workspace(?:%20| )Manager\//i.test(document.referrer || "");
  const isWorkspaceManagerParent = (() => {
    try {
      return window.top !== window
        && /\/tools\/Workspace(?:%20| )Manager\//i.test(window.top.location.pathname || "");
    } catch {
      return false;
    }
  })();
  return isHostedWorkspaceView
    || isWorkspaceManagerReferrer
    || isWorkspaceManagerParent
    || /\/tools\/Workspace%20Manager\//i.test(currentPath)
    || /\/tools\/Workspace Manager\//i.test(currentPath);
}

function getDisplaySurfaceName(currentTool) {
  if (isWorkspaceManagerContext()) {
    const toolName = currentTool?.displayName || document.body.dataset.toolTitle || "Tool";
    return `Workspace Manager (${toolName})`;
  }
  if (currentTool) {
    return currentTool.displayName;
  }
  return document.body.dataset.toolTitle || "Tools Platform";
}

function resolveProjectBindingLabel() {
  const manifest = getManifest();
  if (!manifest) {
    return "none";
  }
  if (manifest.workspace?.notes === "closed") {
    return "Closed";
  }
  return manifest.dirty === true ? "Unsaved" : "Loaded";
}

function normalizeAssetKind(value) {
  const normalized = normalizeTextValue(value).toLowerCase();
  if (!normalized) {
    return "";
  }
  if (normalized === "image" || normalized === "audio" || normalized === "font" || normalized === "svg" || normalized === "data" || normalized === "other") {
    return "asset";
  }
  return normalized;
}

function resolveAcceptedAssetKindsForTool(toolId = "") {
  const normalizedToolId = normalizeTextValue(toolId).toLowerCase();
  const byTool = {
    "skin-editor": ["skin"],
    "sprite-editor": ["sprite"],
    "tile-map-editor": ["tilemap"],
    "parallax-editor": ["parallax"],
    "svg-asset-studio": ["vector"],
    "vector-map-editor": ["vector-map"],
    "3d-asset-viewer": ["model"],
    "3d-camera-path-editor": ["camera-path"],
    "asset-browser": ["asset"],
    "asset-pipeline": [],
    "tile-model-converter": ["tilemap", "vector", "model"]
  };
  return byTool[normalizedToolId] || [];
}

function isAssetCompatibleWithTool(toolId = "", asset = null) {
  const acceptedKinds = resolveAcceptedAssetKindsForTool(toolId);
  if (!asset || !acceptedKinds.length) {
    return false;
  }
  const kind = normalizeAssetKind(asset.assetType);
  return acceptedKinds.includes(kind);
}

function renderToolAssetBadge(toolId = "") {
  const normalizedToolId = normalizeTextValue(toolId).toLowerCase();
  const embeddedPayloadSummary = summarizeEmbeddedToolPayloadDocument(
    normalizedToolId,
    workspaceScopedToolPresetForStatus
  );
  const acceptedKinds = resolveAcceptedAssetKindsForTool(normalizedToolId);
  if (normalizedToolId === "palette-browser") {
    const palette = readSharedPaletteHandoff();
    const paletteLabel = palette?.displayName || embeddedPayloadSummary || "none";
    const paletteTitle = palette?.displayName
      ? `Updated: ${escapeHtml(palette?.selectedAt || "not-set")}`
      : escapeHtml("Resolved from embedded workspace payload");
    const badgeClass = palette?.displayName || embeddedPayloadSummary ? " is-active" : "";
    return `
      <div class="tools-platform-frame__binding-badges" aria-label="Tool asset binding">
        <span class="tools-platform-frame__binding-badge${badgeClass}" title="${paletteTitle}">${escapeHtml(`Palette: ${paletteLabel}`)}</span>
      </div>
    `;
  }
  if (!acceptedKinds.length) {
    const nonAssetLabel = embeddedPayloadSummary || "N/A";
    const badgeClass = embeddedPayloadSummary ? " is-active" : "";
    const badgeTitle = embeddedPayloadSummary
      ? escapeHtml("Resolved from embedded workspace payload")
      : escapeHtml("No shared asset dependency for this tool");
    return `
      <div class="tools-platform-frame__binding-badges" aria-label="Tool asset binding">
        <span class="tools-platform-frame__binding-badge${badgeClass}" title="${badgeTitle}">${escapeHtml(`Asset: ${nonAssetLabel}`)}</span>
      </div>
    `;
  }

  const asset = readSharedAssetHandoff();
  const compatibleAsset = isAssetCompatibleWithTool(toolId, asset) ? asset : null;
  const missingAssetLabel = normalizedToolId === "skin-editor"
    ? "select skin in Asset Browser"
    : "none";
  const fallbackAssetLabel = embeddedPayloadSummary || missingAssetLabel;
  const assetLabel = compatibleAsset?.displayName || fallbackAssetLabel;
  const assetTitle = compatibleAsset
    ? `Updated: ${escapeHtml(compatibleAsset?.selectedAt || "not-set")}`
    : escapeHtml(embeddedPayloadSummary ? "Resolved from embedded workspace payload" : "Updated: not-set");
  const badgeClass = compatibleAsset || embeddedPayloadSummary ? " is-active" : "";
  return `
    <div class="tools-platform-frame__binding-badges" aria-label="Tool asset binding">
      <span class="tools-platform-frame__binding-badge${badgeClass}" title="${assetTitle}">${escapeHtml(`Asset: ${assetLabel}`)}</span>
    </div>
  `;
}

function classifyToolGroup(toolId) {
  const viewerToolIds = new Set([
    "3d-asset-viewer",
    "state-inspector",
    "replay-visualizer",
    "performance-profiler"
  ]);
  const utilityToolIds = new Set([
    "asset-browser",
    "asset-pipeline",
    "tile-model-converter",
    "physics-sandbox",
    "3d-json-payload"
  ]);

  if (viewerToolIds.has(toolId)) {
    return "viewers";
  }
  if (utilityToolIds.has(toolId)) {
    return "utilities";
  }
  return "editors";
}

function resolveWorkspaceToolLockState() {
  const manifest = getManifest();
  const palette = readSharedPaletteHandoff();
  const workspaceReady = Boolean(manifest && manifest.workspace?.notes !== "closed");
  const manifestPalette = readPaletteFromManifestPayload(manifest, null);
  const paletteReady = Boolean(
    (palette && typeof palette.displayName === "string" && palette.displayName.trim())
    || manifestPalette
  );
  const hasToolState = (toolId) => {
    const normalizedToolId = normalizeTextValue(toolId);
    if (!normalizedToolId || !manifest || typeof manifest !== "object") {
      return false;
    }
    return Boolean(manifest.tools && manifest.tools[normalizedToolId]);
  };
  return { workspaceReady, paletteReady, hasToolState };
}

function renderToolLinks(currentToolId) {
  const tools = getToolRegistry()
    .filter((entry) => entry.active === true)
    .filter((entry) => entry.visibleInToolsList === true)
    .sort((left, right) => String(left.displayName || "").localeCompare(String(right.displayName || "")));
  const lockState = resolveWorkspaceToolLockState();
  const isWorkspaceContext = isWorkspaceManagerContext();

  function isToolDisabled(toolId) {
    if (!isWorkspaceContext) {
      return false;
    }
    if (!lockState.workspaceReady) {
      return true;
    }
    if (toolId === "palette-browser") {
      return false;
    }
    if (lockState.hasToolState(toolId)) {
      return false;
    }
    if (!lockState.paletteReady) {
      return true;
    }
    return false;
  }

  function renderBucketGrid(toolEntries) {
    const bucketMap = new Map();
    toolEntries.forEach((tool) => {
      const bucket = String(tool.showcaseTag || "Other").trim() || "Other";
      if (!bucketMap.has(bucket)) {
        bucketMap.set(bucket, []);
      }
      bucketMap.get(bucket).push(tool);
    });

    return Array.from(bucketMap.entries())
      .sort((left, right) => left[0].localeCompare(right[0]))
      .map(([bucketName, bucketTools]) => `
        <div class="tools-platform-frame__nav-bucket" aria-label="${escapeHtml(bucketName)} tools">
          <h3 class="tools-platform-frame__nav-bucket-title">${escapeHtml(bucketName)}</h3>
          <div class="tools-platform-frame__nav-bucket-links">
            ${bucketTools
      .map((tool) => {
        const currentClass = tool.id === currentToolId ? " is-current" : "";
        const disabled = isToolDisabled(tool.id);
        const disabledClass = disabled ? " is-disabled" : "";
        const disabledAttrs = disabled ? ' aria-disabled="true" tabindex="-1"' : "";
        return `
          <div class="tools-platform-frame__nav-tool-row${disabledClass}">
            <a class="tools-platform-frame__nav-link${currentClass}${disabledClass}" href="${escapeHtml(buildHostedRegistryEntryHref(tool))}"${disabledAttrs}>${escapeHtml(tool.displayName)}</a>
            ${renderToolAssetBadge(tool.id)}
          </div>
        `;
      })
      .join("")}
          </div>
        </div>
      `)
      .join("");
  }

  if (isWorkspaceManagerContext()) {
    const editorTools = tools.filter((tool) => classifyToolGroup(tool.id) === "editors");
    const utilityTools = tools.filter((tool) => classifyToolGroup(tool.id) === "utilities");
    const viewerTools = tools.filter((tool) => classifyToolGroup(tool.id) === "viewers");
    return `
      <section class="tools-platform-frame__nav-section" aria-label="Editor tools">
        <h1 class="tools-platform-frame__nav-section-title">Editors</h1>
        <div class="tools-platform-frame__nav-grid">
          ${renderBucketGrid(editorTools)}
        </div>
      </section>
      <hr class="tools-platform-frame__divider tools-platform-frame__divider--nav-split" />
      <section class="tools-platform-frame__nav-section" aria-label="Utility tools">
        <h1 class="tools-platform-frame__nav-section-title">Utilities</h1>
        <div class="tools-platform-frame__nav-grid">
          ${renderBucketGrid(utilityTools)}
        </div>
      </section>
      <hr class="tools-platform-frame__divider tools-platform-frame__divider--nav-split" />
      <section class="tools-platform-frame__nav-section" aria-label="Viewer tools">
        <h1 class="tools-platform-frame__nav-section-title">Viewers</h1>
        <div class="tools-platform-frame__nav-grid">
          ${renderBucketGrid(viewerTools)}
        </div>
      </section>
    `;
  }

  const bucketMap = new Map();
  tools.forEach((tool) => {
    const bucket = String(tool.showcaseTag || "Other").trim() || "Other";
    if (!bucketMap.has(bucket)) {
      bucketMap.set(bucket, []);
    }
    bucketMap.get(bucket).push(tool);
  });

  return Array.from(bucketMap.entries())
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([bucketName, bucketTools]) => `
      <div class="tools-platform-frame__nav-bucket" aria-label="${escapeHtml(bucketName)} tools">
        <h3 class="tools-platform-frame__nav-bucket-title">${escapeHtml(bucketName)}</h3>
        <div class="tools-platform-frame__nav-bucket-links">
          ${bucketTools
    .map((tool) => {
      const currentClass = tool.id === currentToolId ? " is-current" : "";
      const disabled = isToolDisabled(tool.id);
      const disabledClass = disabled ? " is-disabled" : "";
      const disabledAttrs = disabled ? ' aria-disabled="true" tabindex="-1"' : "";
      return `
        <div class="tools-platform-frame__nav-tool-row${disabledClass}">
          <a class="tools-platform-frame__nav-link${currentClass}${disabledClass}" href="${escapeHtml(buildHostedRegistryEntryHref(tool))}"${disabledAttrs}>${escapeHtml(tool.displayName)}</a>
          ${renderToolAssetBadge(tool.id)}
        </div>
      `;
    })
    .join("")}
        </div>
      </div>
    `)
    .join("");
}

function renderSharedActionLinks(currentToolId) {
  if (getPageMode() === "landing") {
    return "";
  }
  const sourceToolId = currentToolId || HEADER_EXPANDED_FALLBACK_TOOL;
  const visibleToolIds = new Set(
    getToolRegistry()
      .filter((entry) => entry.active === true && entry.visibleInToolsList === true)
      .map((entry) => entry.id)
  );
  return getSharedShellActions(sourceToolId, getPageMode())
    .filter((action) => !action.targetToolId || !visibleToolIds.has(action.targetToolId))
    .map((action) => {
      const currentClass = action.current ? " is-current" : "";
      return `<a class="tools-platform-frame__action-link${currentClass}" href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a>`;
    })
    .join("");
}

function renderWorkspaceStatusHeaderBlock(currentTool) {
  if (!currentTool || !workspaceController) {
    return "";
  }

  const lockState = resolveWorkspaceToolLockState();
  const workspaceActionDisabled = !lockState.workspaceReady
    ? ' disabled aria-disabled="true"'
    : "";
  const manifest = getManifest();
  const workspaceName = manifest?.name || "Untitled Workspace";
  const dirtyMark = manifest?.dirty === true ? " *" : "";
  const readiness = manifest?.tools?.[currentTool.id]
    ? "shared workspace state synced"
    : "shared workspace shell ready";
  const workspaceLabel = resolveProjectBindingLabel();
  const asset = readSharedAssetHandoff();
  const palette = readSharedPaletteHandoff();
  const paletteLabel = palette?.displayName || "No shared palette selected";
  const hasMeaningfulSharedAsset = Boolean(asset && (
    normalizeTextValue(asset.displayName)
    || normalizeTextValue(asset.assetId)
    || normalizeTextValue(asset.sourcePath)
  ));
  const sharedAssetLine = hasMeaningfulSharedAsset
    ? `<span><strong>Shared Assets:</strong> ${escapeHtml(asset.displayName || asset.assetId || "Selected shared asset")}</span>`
    : "";

  return `
    <div class="tools-platform-frame__workspace-status-block" aria-label="Workspace status and tool switch controls">
      <div class="tools-platform-frame__project" aria-label="Workspace system controls">
        <div class="tools-platform-frame__project-actions">
          <button type="button" class="tools-platform-frame__project-button" data-workspace-action="new">New Workspace</button>
          <button type="button" class="tools-platform-frame__project-button" data-workspace-action="open">Open Workspace</button>
          <button type="button" class="tools-platform-frame__project-button" data-workspace-action="save"${workspaceActionDisabled}>Save Workspace</button>
          <button type="button" class="tools-platform-frame__project-button" data-workspace-action="save-as"${workspaceActionDisabled}>Save Workspace As</button>
          <button type="button" class="tools-platform-frame__project-button is-secondary" data-workspace-action="close"${workspaceActionDisabled}>Close Workspace</button>
          <input type="file" class="tools-platform-frame__project-input" data-workspace-open-input accept=".json,application/json" />
        </div>
      <div class="tools-platform-frame__shared-status" aria-label="Shared asset and palette status">
        <span><strong>Workspace:</strong> ${escapeHtml(workspaceLabel)}</span>
        <span><strong>Shared Palette:</strong> ${escapeHtml(paletteLabel)}</span>
        ${sharedAssetLine}
      </div>           
        <div class="tools-platform-frame__project-copy">
          <span class="tools-platform-frame__project-label">Workspace</span>
          <strong class="tools-platform-frame__project-name">${escapeHtml(workspaceName)}${escapeHtml(dirtyMark)}</strong>
          <span class="tools-platform-frame__project-meta">${escapeHtml(readiness)}</span>
        </div>       
        <section class="tool-host-pager" aria-label="Workspace tool pager" data-tool-host-pager><button type="button" class="tool-host-pager__button" data-tool-host-prev>PREV</button><span class="tool-host-pager__name" data-tool-host-current-label>${escapeHtml(currentTool?.displayName || "Tool")}</span><button type="button" class="tool-host-pager__button" data-tool-host-next>NEXT</button></section>
      </div>
    
    </div>
  `;
}

function renderHeaderMarkup(currentTool, isHeaderExpanded) {
  const isLanding = getPageMode() === "landing";
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null;
  const isHostedWorkspaceView = searchParams?.get("hosted") === "1"
    || searchParams?.has("hostToolId") === true
    || searchParams?.has("hostContextId") === true;
  const isWorkspaceManagerReferrer = typeof document !== "undefined"
    ? /\/tools\/Workspace(?:%20| )Manager\//i.test(document.referrer || "")
    : false;
  const isWorkspaceManagerParent = (() => {
    if (typeof window === "undefined") {
      return false;
    }
    try {
      return window.top !== window
        && /\/tools\/Workspace(?:%20| )Manager\//i.test(window.top.location.pathname || "");
    } catch {
      return false;
    }
  })();
  const showNavThroughTiles = isHostedWorkspaceView
    || isWorkspaceManagerReferrer
    || isWorkspaceManagerParent
    || /\/tools\/Workspace%20Manager\//i.test(currentPath)
    || /\/tools\/Workspace Manager\//i.test(currentPath);
  const lockState = resolveWorkspaceToolLockState();
  const navWorkspaceLockClass = showNavThroughTiles && !lockState.workspaceReady ? " is-workspace-locked" : "";
  const sharedActionLinks = !isLanding ? renderSharedActionLinks(currentTool?.id ?? "") : "";
  const gameReturnLine = !isLanding ? renderGameReturnLine() : "";
  const title = isLanding ? (document.body.dataset.toolTitle || "Tools Platform") : getDisplaySurfaceName(currentTool);
  const description = currentTool
    ? currentTool.description
    : "Registry-driven, engine-themed entry surface for vector maps, vector assets, tilemaps, parallax scenes, and sprite workspaces.";
  const useStandardizedToolHeader = !isLanding
    && Boolean(currentTool?.id)
    && STANDARDIZED_TOOL_HEADER_IDS.has(currentTool.id);
  const standardizedToolName = normalizeTextValue(currentTool?.displayName) || normalizeTextValue(currentTool?.name);
  const standardizedToolShortDescription = normalizeTextValue(currentTool?.shortDescription);
  const standardizedToolHelpText = normalizeTextValue(currentTool?.description);
  const standardizedHeaderDescriptor = standardizedToolHelpText || standardizedToolShortDescription;
  const hasStandardizedHeaderConfig = Boolean(standardizedToolName && standardizedHeaderDescriptor);
  const hasStandardizedIntroConfig = Boolean(standardizedToolName && standardizedToolHelpText);
  const standardizedHeaderText = hasStandardizedHeaderConfig
    ? `${standardizedToolName} - ${standardizedHeaderDescriptor}`
    : `Configuration error: ${currentTool?.id || "tool"} header requires tool.displayName/tool.name and tool.description/tool.shortDescription in tools/toolRegistry.js.`;
  const standardizedIntroText = hasStandardizedIntroConfig
    ? `${standardizedToolName}: ${standardizedToolHelpText}`
    : `Configuration error: ${currentTool?.id || "tool"} intro requires tool.name and tool.description in tools/toolRegistry.js.`;
  const meta = isLanding
    ? `${getToolRegistry().filter((entry) => entry.active === true && entry.visibleInToolsList === true).length} active tools | hubCommon.css theme`
    : "Shared shell, engine theme, and workspace context applied from the active tool registry";

  return `
    <section class="tools-platform-frame">
      <div class="tools-platform-frame__accordion-content">
        <div class="tools-platform-frame__accordion-summary">
          <div class="tools-platform-frame__summary-copy">
            <h1 class="tools-platform-frame__title${useStandardizedToolHeader ? " tools-platform-frame__title--single-line" : ""}${useStandardizedToolHeader && !hasStandardizedHeaderConfig ? " tools-platform-frame__title--config-error" : ""}" data-tool-id="${escapeHtml(currentTool?.id || "")}"${useStandardizedToolHeader ? ` title="${escapeHtml(standardizedHeaderText)}"` : ""}>${escapeHtml(useStandardizedToolHeader ? standardizedHeaderText : title)}</h1>
            ${useStandardizedToolHeader ? "" : '<h2 class="tools-platform-frame__eyebrow">First-Class Tools Surface</h2>'}
          </div>
          <div class="tools-platform-frame__summary-meta">
            <div class="tools-platform-frame__meta">${escapeHtml(meta)}</div>
          </div>
        </div>
        ${useStandardizedToolHeader ? `
        <div class="tools-platform-frame__topline">
          <p class="tools-platform-frame__description tools-platform-frame__description--single-line${!hasStandardizedIntroConfig ? " tools-platform-frame__description--config-error" : ""}" title="${escapeHtml(standardizedIntroText)}">${escapeHtml(standardizedIntroText)}</p>
        </div>
        ` : `
        <div class="tools-platform-frame__topline">
          <p class="tools-platform-frame__description">${escapeHtml(description)}</p>
        </div>
        `}
        ${showNavThroughTiles ? `
          <div class="tools-platform-frame__bottomline">
            ${!isLanding ? `<hr class="tools-platform-frame__divider" />` : ""}
            ${!isLanding ? `
            <div class="tools-platform-frame__controls-stack">
              ${gameReturnLine}
              ${sharedActionLinks ? `
                <div class="tools-platform-frame__actions" aria-label="Shared asset and palette actions">
                  ${sharedActionLinks}
                </div>
              ` : ""}
              ${renderWorkspaceStatusHeaderBlock(currentTool)}
            </div>
            ` : ""}
            ${!isLanding ? `<hr class="tools-platform-frame__divider" />` : ""}
            <nav class="tools-platform-frame__nav${navWorkspaceLockClass}" aria-label="Active tools">
              ${renderToolLinks(currentTool?.id ?? "")}
            </nav>
          </div>
        ` : ""}
      </div>
    </section>
  `;
}

function renderStatusMarkup(currentTool) {
  const label = getPageMode() === "landing"
    ? "Landing Surface"
    : getDisplaySurfaceName(currentTool);
  const manifest = getManifest();
  const workspaceName = manifest?.name || "No active workspace";
  const dirtyLabel = manifest?.dirty === true ? "Unsaved changes" : "Saved";
  return `
    <div class="tools-platform-statusbar">
      <span>Registry-driven navigation, engine theme, and workspace system are active.</span>
      <span>${escapeHtml(label)} | ${escapeHtml(workspaceName)}</span>
      <span>${escapeHtml(dirtyLabel)}</span>
      <span>${getToolRegistry().filter((entry) => entry.active === true && entry.visibleInToolsList === true).length} first-class tools</span>
    </div>
  `;
}

function applyDocumentMetadata(currentTool) {
  document.body.classList.add("tools-platform-surface");
  const workspaceContext = isWorkspaceManagerContext();
  const lockState = resolveWorkspaceToolLockState();
  const isToolSurfacePage = getPageMode() !== "landing";
  const isPaletteBrowser = currentTool?.id === "palette-browser";
  const workspaceMissingLock = workspaceContext && isToolSurfacePage && !lockState.workspaceReady;
  const paletteMissingLock = workspaceContext
    && isToolSurfacePage
    && lockState.workspaceReady
    && !lockState.paletteReady
    && !isPaletteBrowser;
  const shouldLockToolSurface = workspaceMissingLock || paletteMissingLock;
  const lockMessage = workspaceMissingLock
    ? "Create or open a workspace to use this tool."
    : "Select a shared palette in Palette Browser to use this tool.";
  document.body.classList.toggle("tools-platform-workspace-context", workspaceContext);
  document.body.classList.toggle("tools-platform-workspace-tool-locked", shouldLockToolSurface);
  if (lastLockedSurfaceElement) {
    lastLockedSurfaceElement.removeAttribute("data-tools-platform-lock-message");
    lastLockedSurfaceElement.classList.remove("tools-platform-lock-surface");
    lastLockedSurfaceElement = null;
  }
  if (shouldLockToolSurface) {
    const lockSurface = document.querySelector(
      "#appRoot, .app, .tool-shell-container, .tools-playground-layout, .workspace-shell, .app-shell, .page-shell, .canvas-shell, main"
    );
    if (lockSurface instanceof HTMLElement) {
      lockSurface.setAttribute("data-tools-platform-lock-message", lockMessage);
      lockSurface.classList.add("tools-platform-lock-surface");
      lastLockedSurfaceElement = lockSurface;
    }
  }
  const surfaceName = getDisplaySurfaceName(currentTool);
  if (currentTool || isWorkspaceManagerContext()) {
    document.title = `${surfaceName} | Tools Platform`;
  } else if (getPageMode() === "landing") {
    document.title = "Tools Platform";
  } else {
    const toolTitle = document.body.dataset.toolTitle || "Tool Surface";
    document.title = `${toolTitle} | Tools Platform`;
  }
}

function bindWorkspaceShellEvents(currentTool) {
  if (!workspaceController || !currentTool) {
    return;
  }

  const actionButtons = queryAll("[data-workspace-action]");
  const openInputElement = asHtmlInput(queryFirst("[data-workspace-open-input]"));

  const dispatchWorkspaceAction = createCommandDispatcher({
    async new() {
      if (!workspaceController.shouldConfirmDiscard("Discard unsaved workspace changes and create a new workspace?")) {
        return;
      }
      await workspaceController.handleNewWorkspace();
    },
    async open() {
      if (!workspaceController.shouldConfirmDiscard("Discard unsaved workspace changes and open another workspace?")) {
        return;
      }
      openInputElement?.click();
    },
    async save() {
      workspaceController.handleSaveWorkspace();
    },
    async "save-as"() {
      workspaceController.handleSaveWorkspaceAs();
    },
    async close() {
      if (!workspaceController.shouldConfirmDiscard("Close the active workspace and clear unsaved changes?")) {
        return;
      }
      workspaceController.handleCloseWorkspace();
    }
  });

  bindEventHandlers(actionButtons, "click", async (event) => {
    const button = event.currentTarget instanceof Element ? event.currentTarget : null;
    const action = readDataAttribute(button, "data-workspace-action");
    await dispatchWorkspaceAction(action);
  });

  if (openInputElement) {
    bindEventHandlers(openInputElement, "change", async () => {
      const file = openInputElement.files?.[0];
      openInputElement.value = "";
      if (!file) {
        return;
      }

      try {
        await workspaceController.handleOpenWorkspace(file);
      } catch (error) {
        window.alert(`Open Workspace failed: ${error instanceof Error ? error.message : "unknown error"}`);
      }
    });
  }

  bindEventHandlers(queryAll(".tools-platform-frame__nav-link"), "click", (event) => {
      const target = event.currentTarget instanceof Element ? event.currentTarget : null;
      if (target?.classList.contains("is-disabled") || target?.getAttribute("aria-disabled") === "true") {
        event.preventDefault();
        return;
      }
      if (workspaceController.shouldConfirmDiscard("You have unsaved workspace changes. Continue to another tool?")) {
        return;
      }
      event.preventDefault();
  });

  bindEventHandlers(queryAll(".tools-platform-frame__nav-tool-row"), "click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(".tools-platform-frame__nav-link")) {
      return;
    }
    const row = event.currentTarget instanceof Element ? event.currentTarget : null;
    const link = row?.querySelector(".tools-platform-frame__nav-link");
    if (link?.classList.contains("is-disabled") || link?.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
      return;
    }
    if (link instanceof HTMLAnchorElement) {
      link.click();
    }
  });
}

function asHeadingElement(element) {
  if (!(element instanceof HTMLElement)) {
    return null;
  }
  const tag = element.tagName.toUpperCase();
  if (tag === "H2" || tag === "H3" || tag === "H4") {
    return element;
  }
  return null;
}

function convertPanelToAccordion(panelElement) {
  if (!(panelElement instanceof HTMLElement)) {
    return null;
  }
  const heading = asHeadingElement(panelElement.querySelector(":scope > h2, :scope > h3, :scope > h4"));
  const titleText = heading?.textContent?.trim() || "Panel";
  const summaryHeadingTag = heading?.tagName?.toLowerCase() || "h3";

  const accordion = document.createElement("details");
  accordion.className = "panel-accordion";
  const summary = document.createElement("summary");
  summary.className = "panel-accordion__summary";
  summary.innerHTML = `<${summaryHeadingTag}>${escapeHtml(titleText)}</${summaryHeadingTag}>`;

  const body = document.createElement("div");
  body.className = "panel-accordion__body";

  if (heading && heading.parentElement === panelElement) {
    heading.remove();
  }
  while (panelElement.firstChild) {
    body.appendChild(panelElement.firstChild);
  }
  accordion.append(summary, body);
  panelElement.replaceWith(accordion);
  return accordion;
}

function getAccordionStateKey(sidebar, accordion, index) {
  const side = sidebar instanceof HTMLElement
    ? normalizeTextValue(sidebar.getAttribute("data-panel-side"))
    : "";
  const summaryText = accordion?.querySelector?.("summary")?.textContent || "";
  const normalizedSummary = normalizeTextValue(summaryText).toLowerCase();
  return `${side || "unknown-side"}:${index}:${normalizedSummary || "panel"}`;
}

function emitAccordionReadinessLog(accordion, index, stateKey, phase = "render", cause = "accordion-state-sync") {
  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
  const toolId = normalizeTextValue(document.body?.dataset?.toolId) || "tools-platform";
  const sampleId = normalizeTextValue(searchParams.get("sampleId"));
  const isOpen = accordion.open === true;
  logToolUiControlReady({
    toolId,
    sampleId,
    controlId: `accordion:${stateKey || index}`,
    requiredData: "sidebar-accordion-open-state",
    loaded: isOpen,
    value: isOpen ? "open" : "closed",
    classification: "success"
  });
  logToolUiLifecycle({
    toolId,
    sampleId,
    phase,
    cause,
    classification: "success"
  });
  logToolUiFinalReady({
    toolId,
    sampleId,
    requiredInputsReady: true,
    requiredControlsReady: true,
    requiredOutputsReady: true,
    lifecycleStable: true,
    classification: "success"
  });
}

function applySidebarAccordionRules() {
  if (getPageMode() !== "tool") {
    return;
  }
  const sidebars = queryAll(".tools-platform-resize-panel");
  sidebars.forEach((sidebar) => {
    if (!(sidebar instanceof HTMLElement)) {
      return;
    }

    const directPanelElements = Array.from(sidebar.children).filter((child) =>
      child instanceof HTMLElement && (child.matches("section.panel") || child.matches("div.panel"))
    );
    directPanelElements.forEach((panelElement) => {
      convertPanelToAccordion(panelElement);
    });

    const accordions = Array.from(sidebar.querySelectorAll(":scope > details.panel-accordion"));
    accordions.forEach((accordion, index) => {
      const stateKey = getAccordionStateKey(sidebar, accordion, index);
      if (sidebarAccordionState.has(stateKey)) {
        accordion.open = sidebarAccordionState.get(stateKey) === true;
      } else if (accordion.dataset.accordionInitialized !== "1") {
        accordion.open = index === 0;
      }

      sidebarAccordionState.set(stateKey, accordion.open === true);
      if (accordion.dataset.accordionInitialized !== "1") {
        accordion.dataset.accordionInitialized = "1";
      }

      if (accordion.dataset.accordionStateBound !== "1") {
        accordion.dataset.accordionStateBound = "1";
        bindEventHandlers(accordion, "toggle", () => {
          sidebarAccordionState.set(stateKey, accordion.open === true);
          emitAccordionReadinessLog(accordion, index, stateKey, "user-action", "accordion-toggle");
        });
      }

      if (accordion.dataset.accordionReadinessLogged !== "1") {
        accordion.dataset.accordionReadinessLogged = "1";
        emitAccordionReadinessLog(accordion, index, stateKey, "init", "accordion-initialized");
      }
    });
  });
}

function bindWorkspacePagerDelegatedEvents() {
  if (workspacePagerDelegatedBound) {
    return;
  }
  const headerHost = queryFirst("[data-tools-platform-header]");
  if (!(headerHost instanceof HTMLElement)) {
    return;
  }

  workspacePagerDelegatedBound = true;
  headerHost.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) {
      return;
    }

    const prevButton = target.closest("[data-tool-host-prev]");
    const nextButton = target.closest("[data-tool-host-next]");
    if (!prevButton && !nextButton) {
      return;
    }

    event.preventDefault();
    const action = prevButton ? "prev" : "next";
    console.info(`[WorkspacePager] ${action.toUpperCase()} handler fired.`);

    if (typeof window === "undefined" || window.top === window) {
      console.warn("[WorkspacePager] No parent host available for delegated pager action.");
      return;
    }

    try {
      window.top.postMessage({
        type: "workspace-pager-action",
        action
      }, window.location.origin);
    } catch (error) {
      console.warn("[WorkspacePager] Failed to dispatch delegated pager action.", error);
    }
  });
}

function renderShell(currentTool) {
  const headerHost = queryFirst("[data-tools-platform-header]");
  const statusHost = queryFirst("[data-tools-platform-status]");
  const pageHeaderAccordion = queryFirst(".is-collapsible");

  applyFullscreenShellState(Boolean(document.fullscreenElement));

  const isHeaderExpanded = pageHeaderAccordion instanceof HTMLDetailsElement
    ? pageHeaderAccordion.open
    : (headerExpandedState ?? readStoredHeaderExpandedState());
  headerExpandedState = isHeaderExpanded;

  applyDocumentMetadata(currentTool);

  if (headerHost) {
    headerHost.innerHTML = renderHeaderMarkup(currentTool, isHeaderExpanded);
  }
  renderHeaderIntroSummary(currentTool);
  bindWorkspacePagerDelegatedEvents();
  bindHeaderIntroFullscreenEvents(currentTool);

  if (pageHeaderAccordion instanceof HTMLDetailsElement) {
    pageHeaderAccordion.open = isHeaderExpanded;
    if (pageHeaderAccordion.dataset.toolsPlatformHeaderToggleBound !== "1") {
      pageHeaderAccordion.dataset.toolsPlatformHeaderToggleBound = "1";
      bindEventHandlers(pageHeaderAccordion, "toggle", () => {
        headerExpandedState = pageHeaderAccordion.open;
        writeStoredHeaderExpandedState(pageHeaderAccordion.open);
        renderHeaderIntroSummary(currentTool);
      });
    }
  }

  if (statusHost) {
    statusHost.innerHTML = renderStatusMarkup(currentTool);
  }

  applySidebarAccordionRules();
  bindWorkspaceShellEvents(currentTool);
}

function bindLiveBindingRefresh(currentTool) {
  if (bindingRefreshHandlersBound || typeof window === "undefined") {
    return;
  }
  bindingRefreshHandlersBound = true;

  const rerender = () => {
    renderShell(currentTool);
  };

  window.addEventListener("storage", rerender);
  window.addEventListener("focus", rerender);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      rerender();
    }
  });
}

function ensureRuntimeMonitoring() {
  if (runtimeMonitoringHooks) {
    return;
  }

  runtimeMonitoringHooks = createRuntimeMonitoringHooks({
    logger: TOOLS_PLATFORM_LOGGER,
    source: "tools.platform",
    sampleIntervalMs: 10000,
    contextProvider: () => ({
      pageMode: getPageMode(),
      toolId: document.body.dataset.toolId || "",
    }),
    onError(payload) {
      window.__TOOLS_PLATFORM_RUNTIME_LAST_ERROR__ = payload;
    },
    onPerformance(payload) {
      window.__TOOLS_PLATFORM_RUNTIME_LAST_PERFORMANCE__ = payload;
    },
  });

  runtimeMonitoringHooks.start();
  runtimeMonitoringHooks.emitPerformanceSample("load", {
    surface: "tools.platform.init",
    loadDurationMs: Math.max(0, Date.now() - TOOLS_PLATFORM_BOOT_MS),
  });
  window.addEventListener("beforeunload", () => {
    runtimeMonitoringHooks?.stop?.();
  }, { once: true });
}

async function initPlatformShell() {
  ensureRuntimeMonitoring();

  const currentToolId = document.body.dataset.toolId || "";
  const currentTool = currentToolId ? getToolById(currentToolId) : null;
  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
  const samplePresetPath = normalizeSamplePresetPath(searchParams.get("samplePresetPath"));
  installWorkspaceScopedSamplePresetFetchShim(currentToolId, samplePresetPath);
  await primeWorkspaceScopedToolPresetForStatus(currentToolId, samplePresetPath);
  const launchSignature = readLaunchPayloadSignature(searchParams);
  const clearedForLaunch = clearSharedBindingsForNewLaunch(launchSignature);
  const launchContext = readGameLaunchContext();
  const launchedFromSamplePreset = Boolean(samplePresetPath);
  const hydratedSamplePresetPalette = await hydrateSharedPaletteFromSamplePresetPath(samplePresetPath);

  if (currentToolId) {
    workspaceController = createWorkspaceSystemController({
      toolId: currentToolId,
      launchContext,
      launchHasSourcePreset: launchedFromSamplePreset,
      skipInitialToolStateApply: launchedFromSamplePreset,
      onChange(payload) {
        const manifest = payload?.manifest || {};
        const uiStateKey = JSON.stringify({
          dirty: payload?.dirty === true,
          ready: payload?.ready === true,
          workspaceName: manifest?.name || "",
          workspaceNotes: manifest?.workspace?.notes || "",
          activeToolId: manifest?.activeToolId || "",
          sharedAsset: manifest?.sharedReferences?.asset?.displayName || "",
          sharedPalette: manifest?.sharedReferences?.palette?.displayName || ""
        });
        if (uiStateKey === lastWorkspaceUiStateKey) {
          return;
        }
        lastWorkspaceUiStateKey = uiStateKey;
        renderShell(currentTool);
      },
      onStatus(message) {
        const statusHost = queryFirst("[data-tools-platform-status]");
        if (!(statusHost instanceof HTMLElement)) {
          return;
        }
        const spans = queryAll("span", statusHost);
        if (spans[0]) {
          setTextContent(spans[0], message);
        }
      }
    });
    workspaceController.startWatching();
  }

  const catalogContext = await readCatalogContextFromLaunchContext(launchContext);
  const hydratedAsset = await hydrateSharedAssetFromGameLaunchContext(catalogContext);
  const hydratedPalette = await hydrateSharedPaletteFromGameLaunchContext(catalogContext);
  renderShell(currentTool);
  if (clearedForLaunch) {
    TOOLS_PLATFORM_LOGGER.debug("cleared shared workspace bindings for new launch payload");
  }
  if (hydratedAsset) {
    TOOLS_PLATFORM_LOGGER.debug("shared asset hydrated from game asset catalog");
  }
  if (hydratedPalette) {
    TOOLS_PLATFORM_LOGGER.debug("shared palette hydrated from game asset catalog");
  }
  if (hydratedSamplePresetPalette) {
    TOOLS_PLATFORM_LOGGER.debug("shared palette hydrated from sample workspace manifest");
  }
  bindLiveBindingRefresh(currentTool);
}

void initPlatformShell();
