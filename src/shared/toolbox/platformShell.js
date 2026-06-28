import { getToolById, getToolRegistry } from "../../../www/toolbox/tool-registry-api-client.js";
import {
  clearSharedAssetHandoff,
  clearSharedPaletteHandoff,
  getSharedShellActions,
  readSharedAssetHandoff,
  readSharedPaletteHandoff,
  writeSharedAssetHandoff
} from "./assetUsageIntegration.js";
import { readToolHostSharedContextFromLocation } from "./toolHostSharedContext.js";
import { createWorkspaceSystemController } from "./projectSystem.js";
import { bindEventHandlers, createCommandDispatcher } from "./eventCommandUtils.js";
import { asHtmlInput, queryAll, queryFirst, readDataAttribute, setTextContent } from "./uiSafeUtils.js";
import { escapeHtml } from "../string/strings.js";
import Logger from "../../engine/logging/Logger.js";
import LocalStorageService from '../../engine/persistence/LocalStorageService.js';
import SessionStorageService from '../../engine/persistence/SessionStorageService.js';
import { createRuntimeMonitoringHooks } from '../../engine/runtime/RuntimeMonitoringHooks.js';
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
let workspaceScopedVectorAssetLabelForStatus = "";
let hostedBadgeRowRemovedLogged = false;
const sidebarAccordionState = new Map();

const HEADER_EXPANDED_STORAGE_KEY = "toolboxaid.toolsPlatform.headerExpanded";
const HEADER_EXPANDED_FALLBACK_TOOL = "tool-host";
const TOOLS_PLATFORM_LOGGER = new Logger({ channel: "tools.platform", level: "debug" });
const TOOLS_PLATFORM_BOOT_MS = Date.now();
const GLOBAL_PALETTE_TOOL_KEY = "palette-browser";
const WORKSPACE_LAUNCH_SIGNATURE_STORAGE_KEY = "toolboxaid.toolsPlatform.launchSignature";
const TOOL_STATE_STORAGE_KEY_PREFIX = "toolboxaid.";
const STANDARDIZED_TOOL_HEADER_IDS = new Set([
  "world-vector-studio-v2",
  "object-vector-studio-v2",
  "sprite-editor",
  "storage-inspector-v2",
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
  const value = new LocalStorageService().getItem(HEADER_EXPANDED_STORAGE_KEY, null);
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return getDefaultHeaderExpandedState();
}

function writeStoredHeaderExpandedState(value) {
  if (typeof window === "undefined") {
    return;
  }
  new LocalStorageService().setItem(HEADER_EXPANDED_STORAGE_KEY, value ? "true" : "false");
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
    return normalizeLocalHref(normalizedValue, ["/archive/v1-v2/games/"]);
  }
  if (key === "workspaceHref") {
    return "";
  }
  if (key === "returnTo") {
    return normalizeLocalHref(normalizedValue, ["/archive/v1-v2/games/", "/archive/v1-v2/samples/"]);
  }
  if (key === "samplePresetPath") {
    return normalizeSamplePresetPath(normalizedValue);
  }
  return normalizedValue;
}

function buildHostedRegistryEntryHref(toolEntry) {
  const baseHref = getRegistryEntryHref(toolEntry.entryPoint);
  if (typeof window === "undefined") {
    return baseHref;
  }
  const currentParams = new URLSearchParams(window.location.search);
  if (currentParams.get("hosted") !== "1") {
    return baseHref;
  }

  const nextUrl = new URL(baseHref, window.location.href);
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
    : `Configuration error: ${toolId} header requires displayName/name and description/shortDescription from the Toolbox metadata API record.`;
  const introText = toolName && toolDescription
    ? `${toolName}: ${toolDescription}`
    : `Configuration error: ${toolId} intro requires displayName/name and description from the Toolbox metadata API record.`;
  const hasHeaderError = !(toolName && headerDescriptor);
  const hasIntroError = !(toolName && toolDescription);
  const diagnosticParts = [];
  if (hasHeaderError) {
    diagnosticParts.push(`Configuration error: ${toolId} header requires displayName/name and description/shortDescription from the Toolbox metadata API record.`);
  }
  if (hasIntroError) {
    diagnosticParts.push(`Configuration error: ${toolId} intro requires displayName/name and description from the Toolbox metadata API record.`);
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

function buildWorkspaceHrefFromGameId() {
  return "";
}

function normalizeSamplePresetPath(value) {
  return normalizeLocalHref(value, ["/archive/v1-v2/samples/", "/archive/v1-v2/games/"]);
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
  const schema = normalizeTextValue(rawPreset.schema).toLowerCase();
  return schema === "html-js-gaming.project";
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

  if (directToolId === GLOBAL_PALETTE_TOOL_KEY) {
    const isDirectPaletteDocument = scopedPreset.schema === "html-js-gaming.palette"
      && Array.isArray(scopedPreset.swatches);
    if (!isDirectPaletteDocument) {
      console.warn(`[tools.platform] workspace scoped preset rejected: key="${directToolId}" must be direct palette JSON for tools.palette-browser.`);
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
  const toolLabel = normalizeTextValue(scopedToolState.tool || normalizedToolId);
  const directPalette = normalizedToolId === GLOBAL_PALETTE_TOOL_KEY && Array.isArray(scopedToolState.swatches)
    ? scopedToolState
    : null;
  if (directPalette) {
    const name = normalizeTextValue(directPalette.name || directPalette.id || toolLabel);
    const swatchCount = directPalette.swatches.length;
    return `embedded palette ${name || toolLabel}${swatchCount > 0 ? ` (${swatchCount} swatches)` : ""}`;
  }

  const vectorMapDocument = readWorkspaceScopedToolDocument(payload, "vectorMapDocument", scopedToolState);
  if (vectorMapDocument) {
    const name = normalizeTextValue(vectorMapDocument.name || vectorMapDocument.id || toolLabel);
    const objectCount = Array.isArray(vectorMapDocument.objects) ? vectorMapDocument.objects.length : 0;
    return `embedded vector map ${name || toolLabel}${objectCount > 0 ? ` (${objectCount} objects)` : ""}`;
  }

  const vectorAssetDocument = readWorkspaceScopedToolDocument(payload, "vectorAssetDocument", scopedToolState);
  if (vectorAssetDocument) {
    const sourceName = normalizeTextValue(vectorAssetDocument.sourceName || vectorAssetDocument.name || toolLabel);
    return `embedded vector asset ${sourceName || toolLabel}`;
  }

  const tileMapDocument = readWorkspaceScopedToolDocument(payload, "tileMapDocument", scopedToolState);
  if (tileMapDocument) {
    const mapName = normalizeTextValue(tileMapDocument?.map?.name || tileMapDocument.name || tileMapDocument.id || toolLabel);
    const layerCount = Array.isArray(tileMapDocument.layers) ? tileMapDocument.layers.length : 0;
    return `embedded tile map ${mapName || toolLabel}${layerCount > 0 ? ` (${layerCount} layers)` : ""}`;
  }

  const parallaxDocument = readWorkspaceScopedToolDocument(payload, "parallaxDocument", scopedToolState);
  if (parallaxDocument) {
    const mapName = normalizeTextValue(parallaxDocument?.map?.name || parallaxDocument.name || toolLabel);
    const layerCount = Array.isArray(parallaxDocument.layers) ? parallaxDocument.layers.length : 0;
    return `embedded parallax ${mapName || toolLabel}${layerCount > 0 ? ` (${layerCount} layers)` : ""}`;
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
    const name = normalizeTextValue(skin.name || skin.gameId || skin.projectId || toolLabel);
    return `embedded skin ${name || toolLabel}`;
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
    const name = normalizeTextValue(palette.name || palette.id || toolLabel);
    const swatchCount = Array.isArray(palette.swatches) ? palette.swatches.length : 0;
    return `embedded palette ${name || toolLabel}${swatchCount > 0 ? ` (${swatchCount} swatches)` : ""}`;
  }

  const snapshot = readWorkspaceScopedToolDocument(payload, "snapshot", scopedToolState);
  if (snapshot) {
    const snapshotId = normalizeTextValue(snapshot.toolId || snapshot.schema || toolLabel);
    return `embedded snapshot ${snapshotId || toolLabel}`;
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
    const projectId = normalizeTextValue(pipelinePayload.projectId || toolLabel);
    return `embedded pipeline payload ${projectId || toolLabel}`;
  }

  const candidate = readWorkspaceScopedToolDocument(payload, "candidate", scopedToolState);
  if (candidate) {
    const name = normalizeTextValue(candidate.id || candidate.name || toolLabel);
    return `embedded candidate ${name || toolLabel}`;
  }

  const mapPayload = readWorkspaceScopedToolDocument(payload, "mapPayload", scopedToolState);
  if (mapPayload) {
    const name = normalizeTextValue(mapPayload.mapId || mapPayload.id || toolLabel);
    return `embedded map payload ${name || toolLabel}`;
  }

  const asset3d = readWorkspaceScopedToolDocument(payload, "asset3d", scopedToolState);
  if (asset3d) {
    const name = normalizeTextValue(asset3d.assetId || asset3d.id || toolLabel);
    return `embedded 3D asset ${name || toolLabel}`;
  }

  const cameraPath = readWorkspaceScopedToolDocument(payload, "cameraPath", scopedToolState);
  if (cameraPath) {
    const name = normalizeTextValue(cameraPath.pathId || cameraPath.id || toolLabel);
    return `embedded camera path ${name || toolLabel}`;
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
    if (normalizedToolId === "object-vector-studio-v2") {
      workspaceScopedVectorAssetLabelForStatus = readVectorAssetLabelFromWorkspaceManifestPreset(rawPreset);
    }
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
  if (normalizedToolId === "object-vector-studio-v2") {
    workspaceScopedVectorAssetLabelForStatus = "";
  }
  if (!normalizedToolId || !normalizedSamplePresetPath || typeof window === "undefined" || typeof window.fetch !== "function") {
    return null;
  }
  try {
    const response = await window.fetch(normalizedSamplePresetPath, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const rawPreset = await response.json();
    if (normalizedToolId === "object-vector-studio-v2") {
      workspaceScopedVectorAssetLabelForStatus = readVectorAssetLabelFromWorkspaceManifestPreset(rawPreset);
    }
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
  const gameHref = normalizeLocalHref(searchParams.get("gameHref"), ["/archive/v1-v2/games/"]);
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

function isHostedToolLaunch(searchParams) {
  if (!(searchParams instanceof URLSearchParams)) {
    return false;
  }
  return searchParams.get("hosted") === "1"
    || searchParams.has("hostToolId")
    || searchParams.has("hostContextId");
}

function isHostedWorkspaceBadgeRowRemovalLaunch() {
  if (typeof window === "undefined") {
    return false;
  }
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get("hosted") === "1"
    && Boolean(normalizeTextValue(searchParams.get("hostToolId")))
    && Boolean(normalizeTextValue(searchParams.get("hostContextId")));
}

function isHostedObjectVectorPlatformBadgeLaunch() {
  if (typeof window === "undefined") {
    return false;
  }
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get("hosted") === "1"
    && searchParams.get("hostToolId") === "object-vector-studio-v2"
    && Boolean(normalizeTextValue(searchParams.get("hostContextId")));
}

function readStoredLaunchSignature() {
  if (typeof window === "undefined") {
    return "";
  }
  return normalizeTextValue(new LocalStorageService().getItem(WORKSPACE_LAUNCH_SIGNATURE_STORAGE_KEY, null));
}

function writeStoredLaunchSignature(signature) {
  if (typeof window === "undefined") {
    return;
  }
  const storage = new LocalStorageService();
  if (signature) {
    storage.setItem(WORKSPACE_LAUNCH_SIGNATURE_STORAGE_KEY, signature);
    return;
  }
  storage.removeItem(WORKSPACE_LAUNCH_SIGNATURE_STORAGE_KEY);
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

  const clearStorage = (storage) => {
    const keysToRemove = storage.entries().map(({ key }) => normalizeTextValue(key))
      .filter((key) => {
        if (!key || !key.startsWith(TOOL_STATE_STORAGE_KEY_PREFIX)) {
          return false;
        }
        if (PRESERVED_TOOL_STATE_KEYS.has(key)) {
          return false;
        }
        return true;
      });
    keysToRemove.forEach((key) => {
      storage.removeItem(key);
    });
  };

  clearStorage(new LocalStorageService());
  clearStorage(new SessionStorageService());
}

function readGameLaunchContext() {
  if (typeof window === "undefined") {
    return null;
  }
  const searchParams = new URLSearchParams(window.location.search);
  const gameId = normalizeTextValue(searchParams.get("gameId") || searchParams.get("game"));
  const gameTitle = normalizeTextValue(searchParams.get("gameTitle"));
  const gameHref = normalizeLocalHref(searchParams.get("gameHref"), ["/archive/v1-v2/games/"]);
  const workspaceHref = buildWorkspaceHrefFromGameId(gameId);
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

function deriveGameManifestPaths(context) {
  const candidates = new Set();
  const gameHref = normalizeTextValue(context?.gameHref);
  if (gameHref.endsWith("/index.html")) {
    const base = gameHref.slice(0, -"/index.html".length);
    candidates.add(`${base}/game.manifest.json`);
    const lowerCasedBase = base.replace(/^\/archive\/v1-v2\/games\/([^/]+)/i, (_, folderName) => `/archive/v1-v2/games/${folderName.toLowerCase()}`);
    candidates.add(`${lowerCasedBase}/game.manifest.json`);
  } else if (gameHref.endsWith("/")) {
    const base = gameHref.slice(0, -1);
    candidates.add(`${base}/game.manifest.json`);
    const lowerCasedBase = base.replace(/^\/archive\/v1-v2\/games\/([^/]+)/i, (_, folderName) => `/archive/v1-v2/games/${folderName.toLowerCase()}`);
    candidates.add(`${lowerCasedBase}/game.manifest.json`);
  }

  const gameId = normalizeTextValue(context?.gameId);
  if (gameId) {
    candidates.add(`/archive/v1-v2/games/${encodeURIComponent(gameId)}/game.manifest.json`);
    candidates.add(`/archive/v1-v2/games/${encodeURIComponent(gameId.toLowerCase())}/game.manifest.json`);
  }

  return Array.from(candidates).filter(Boolean);
}

function normalizeAssetsPath(value) {
  return normalizeTextValue(value).replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
}

function normalizeManifestAssetPath(value, assetsPath) {
  const raw = normalizeTextValue(value).replace(/\\/g, "/");
  if (!raw) {
    return "";
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith("/")) {
    return raw;
  }
  const baseAssetsPath = normalizeAssetsPath(assetsPath);
  if (!baseAssetsPath) {
    return raw;
  }
  if (raw.startsWith("archive/v1-v2/games/") || raw.startsWith(`${baseAssetsPath}/`)) {
    return raw.startsWith("/") ? raw : `/${raw}`;
  }
  const relativePath = raw.startsWith("assets/")
    ? raw.slice("assets/".length)
    : raw.replace(/^\.?\//, "");
  return `/${baseAssetsPath}/${relativePath}`;
}

function readManifestAssetEntries(manifestPayload) {
  const source = manifestPayload && typeof manifestPayload === "object" && !Array.isArray(manifestPayload)
    ? manifestPayload
    : {};
  const workspaceBlock = source.workspace && typeof source.workspace === "object" && !Array.isArray(source.workspace)
    ? source.workspace
    : {};
  const tools = source.tools && typeof source.tools === "object" && !Array.isArray(source.tools)
    ? source.tools
    : {};
  const assetManager = tools["asset-manager-v2"] && typeof tools["asset-manager-v2"] === "object" && !Array.isArray(tools["asset-manager-v2"])
    ? tools["asset-manager-v2"]
    : {};
  const entries = assetManager.assets && typeof assetManager.assets === "object" && !Array.isArray(assetManager.assets)
    ? assetManager.assets
    : {};
  const gameFolder = normalizeTextValue(source.game?.folder);
  const assetsPath = normalizeAssetsPath(workspaceBlock.assetsPath || source.assetsPath || (gameFolder ? `archive/v1-v2/games/${gameFolder}/assets` : ""));
  return Object.entries(entries)
    .map(([assetId, rawEntry]) => {
      const safeAssetId = normalizeTextValue(assetId);
      const entry = rawEntry && typeof rawEntry === "object" ? rawEntry : {};
      const kind = normalizeTextValue(entry.type || entry.kind || entry.role).toLowerCase();
      const path = normalizeManifestAssetPath(entry.path || entry.runtimePath || entry.href, assetsPath);
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

async function readManifestAssetContextFromLaunchContext(launchContext) {
  if (!launchContext?.gameId && !launchContext?.gameHref) {
    return null;
  }

  const manifestContext = await readManifestContextFromLaunchContext(launchContext);
  const entries = readManifestAssetEntries(manifestContext?.manifestPayload);
  return entries.length > 0
    ? {
      launchContext,
      manifestPath: manifestContext.manifestPath,
      manifestPayload: manifestContext.manifestPayload,
      entries
    }
    : null;
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

function pickAssetEntryByKind(entries, preferredKinds = []) {
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

async function hydrateSharedAssetFromGameLaunchContext(manifestAssetContext = null) {
  const launchContext = manifestAssetContext?.launchContext || readGameLaunchContext();
  if (!launchContext?.gameId && !launchContext?.gameHref) {
    return false;
  }

  const existingAsset = readSharedAssetHandoff();
  if (existingAsset?.assetId && isCurrentGameHandoff(existingAsset, launchContext)) {
    return false;
  }

  const manifestContext = await readManifestContextFromLaunchContext(launchContext);
  const manifestObjects = manifestContext?.manifestPayload?.tools?.["object-vector-studio-v2"]?.objects;
  const manifestObjectEntry = Array.isArray(manifestObjects)
    ? manifestObjects.find((entry) => Boolean(normalizeTextValue(entry?.id))) || null
    : null;
  const manifestObjectId = normalizeTextValue(manifestObjectEntry?.id);
  const manifestObjectName = normalizeTextValue(manifestObjectEntry?.name) || manifestObjectId;
  const launchGameId = normalizeTextValue(launchContext?.gameId).toLowerCase();
  const shouldPreferManifestObject = launchGameId === "gravitywell";
  if (shouldPreferManifestObject && manifestObjectId) {
    return writeSharedAssetHandoff({
      assetId: manifestObjectId,
      assetType: "vector",
      sourcePath: manifestContext?.manifestPath || "",
      displayName: manifestObjectName,
      tags: ["vector"],
      metadata: {
        source: "workspace-game-manifest.object-vector-studio-v2.objects",
        gameId: launchContext.gameId || "",
        sourcePath: manifestContext?.manifestPath || "",
        objectId: manifestObjectId
      },
      sourceToolId: "tool-host",
      selectedAt: new Date().toISOString()
    });
  }

  const context = manifestAssetContext || await readManifestAssetContextFromLaunchContext(launchContext);
  if (!context || !Array.isArray(context.entries) || context.entries.length === 0) {
    if (manifestObjectId) {
      return writeSharedAssetHandoff({
        assetId: manifestObjectId,
        assetType: "vector",
        sourcePath: manifestContext?.manifestPath || "",
        displayName: manifestObjectName,
        tags: ["vector"],
        metadata: {
          source: "workspace-game-manifest.object-vector-studio-v2.objects",
          gameId: launchContext.gameId || "",
          sourcePath: manifestContext?.manifestPath || "",
          objectId: manifestObjectId
        },
        sourceToolId: "tool-host",
        selectedAt: new Date().toISOString()
      });
    }
    return false;
  }

  const nonPaletteEntries = context.entries.filter((entry) => entry.kind !== "palette");
  if (!nonPaletteEntries.length) {
    return false;
  }

  const primaryAsset = pickAssetEntryByKind(nonPaletteEntries, [
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
      source: "game-manifest.asset-manager-v2.assets",
      gameId: launchContext.gameId || "",
      sourcePath: primaryAsset.path
    },
    sourceToolId: "tool-host",
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
  const paletteBrowserSection = tools[GLOBAL_PALETTE_TOOL_KEY] && typeof tools[GLOBAL_PALETTE_TOOL_KEY] === "object" && !Array.isArray(tools[GLOBAL_PALETTE_TOOL_KEY])
    ? tools[GLOBAL_PALETTE_TOOL_KEY]
    : null;
  const isDirectPalettePayload = paletteBrowserSection?.schema === "html-js-gaming.palette"
    && Array.isArray(paletteBrowserSection.swatches);
  if (!isDirectPalettePayload) {
    return null;
  }
  return paletteBrowserSection;
}

function readVectorAssetLabelFromHostedSharedContext() {
  const hostContext = readToolHostSharedContextFromLocation(
    typeof window !== "undefined" ? window.location : null
  );
  const payloadJson = hostContext?.sharedContext?.payloadJson;
  if (!payloadJson || typeof payloadJson !== "object" || Array.isArray(payloadJson)) {
    return "";
  }
  const vectorAssetDocument = payloadJson.vectorAssetDocument
    && typeof payloadJson.vectorAssetDocument === "object"
    && !Array.isArray(payloadJson.vectorAssetDocument)
    ? payloadJson.vectorAssetDocument
    : null;
  if (!vectorAssetDocument) {
    return "";
  }
  const sourceName = normalizeTextValue(vectorAssetDocument.sourceName);
  if (sourceName) {
    return sourceName;
  }
  const svgText = normalizeTextValue(vectorAssetDocument.svgText);
  return svgText ? "Inline SVG" : "";
}

function readVectorAssetLabelFromWorkspaceScopedPreset(scopedToolState = null) {
  if (!scopedToolState || typeof scopedToolState !== "object" || Array.isArray(scopedToolState)) {
    return "";
  }
  const payload = scopedToolState.payload && typeof scopedToolState.payload === "object" && !Array.isArray(scopedToolState.payload)
    ? scopedToolState.payload
    : scopedToolState;
  const vectorAssetDocument = readWorkspaceScopedToolDocument(payload, "vectorAssetDocument", scopedToolState);
  if (!vectorAssetDocument) {
    return "";
  }
  const sourceName = normalizeTextValue(vectorAssetDocument.sourceName);
  if (sourceName) {
    return sourceName;
  }
  const svgText = normalizeTextValue(vectorAssetDocument.svgText);
  return svgText ? "Inline SVG" : "";
}

function readVectorAssetLabelFromWorkspaceManifestPreset(rawPreset = null) {
  const source = rawPreset && typeof rawPreset === "object" && !Array.isArray(rawPreset)
    ? rawPreset
    : null;
  if (!source) {
    return "";
  }
  const tools = source.tools && typeof source.tools === "object" && !Array.isArray(source.tools)
    ? source.tools
    : null;
  if (!tools) {
    return "";
  }
  const vectorToolPreset = tools["object-vector-studio-v2"] && typeof tools["object-vector-studio-v2"] === "object" && !Array.isArray(tools["object-vector-studio-v2"])
    ? tools["object-vector-studio-v2"]
    : null;
  if (!vectorToolPreset) {
    return "";
  }
  const vectorAssetDocument = readWorkspaceScopedToolDocument(vectorToolPreset, "vectorAssetDocument", vectorToolPreset);
  if (!vectorAssetDocument) {
    return "";
  }
  const sourceName = normalizeTextValue(vectorAssetDocument.sourceName);
  if (sourceName) {
    return sourceName;
  }
  const svgText = normalizeTextValue(vectorAssetDocument.svgText);
  return svgText ? "Inline SVG" : "";
}

async function hydrateSharedPaletteFromSamplePresetPath(samplePresetPath = "") {
  return false;
}

async function hydrateSharedPaletteFromGameLaunchContext(manifestAssetContext = null) {
  return false;
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
  const searchParams = new URLSearchParams(window.location.search);
  const isHostedWorkspaceView = searchParams.get("hosted") === "1"
    || searchParams.has("hostToolId")
    || searchParams.has("hostContextId");
  return isHostedWorkspaceView;
}

function getDisplaySurfaceName(currentTool) {
  if (isWorkspaceManagerContext()) {
    const toolName = currentTool?.displayName || document.body.dataset.toolTitle || "Tool";
    return `Hosted Tool (${toolName})`;
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
    "sprite-editor": ["sprite"],
    "tile-map-editor": ["tilemap"],
    "parallax-editor": ["parallax"],
    "object-vector-studio-v2": ["vector", "svg", "asset"],
    "world-vector-studio-v2": ["vector-map"],
    "3d-asset-viewer": ["model"],
    "3d-camera-path-editor": ["camera-path"],
    "asset-pipeline": []
  };
  return byTool[normalizedToolId] || [];
}

function getAssetPathBasename(value) {
  const raw = normalizeTextValue(value);
  if (!raw) {
    return "";
  }
  const normalized = raw.replace(/\\/g, "/");
  const segments = normalized.split("/").filter(Boolean);
  return segments.length ? segments[segments.length - 1] : "";
}

function resolveSharedAssetLabel(asset = null) {
  if (!asset || typeof asset !== "object" || Array.isArray(asset)) {
    return "";
  }
  const fromDisplayName = normalizeTextValue(asset.displayName);
  if (fromDisplayName) {
    return fromDisplayName;
  }
  const fromSourceName = normalizeTextValue(asset.sourceName);
  if (fromSourceName) {
    return fromSourceName;
  }
  const fromName = normalizeTextValue(asset.name);
  if (fromName) {
    return fromName;
  }
  const fromLabel = normalizeTextValue(asset.label);
  if (fromLabel) {
    return fromLabel;
  }
  const fromPath = getAssetPathBasename(asset.path) || getAssetPathBasename(asset.sourcePath);
  if (fromPath) {
    return fromPath;
  }
  return "";
}

function isAssetCompatibleWithTool(toolId = "", asset = null) {
  const acceptedKinds = resolveAcceptedAssetKindsForTool(toolId);
  if (!asset || !acceptedKinds.length) {
    return false;
  }
  const candidateKinds = [
    normalizeAssetKind(asset.assetType),
    normalizeAssetKind(asset.kind),
    normalizeAssetKind(asset.type)
  ].filter(Boolean);
  return candidateKinds.some((kind) => acceptedKinds.includes(kind));
}

function renderToolAssetBadge(toolId = "") {
  const normalizedToolId = normalizeTextValue(toolId).toLowerCase();
  if (isHostedWorkspaceBadgeRowRemovalLaunch()) {
    if (!hostedBadgeRowRemovedLogged) {
      hostedBadgeRowRemovedLogged = true;
      console.log("[PLATFORM_SHELL_HOSTED_BADGE_ROW_REMOVED]", {
        source: "renderToolAssetBadge",
        hostToolId: new URLSearchParams(window.location.search).get("hostToolId") || "",
        hostContextId: new URLSearchParams(window.location.search).get("hostContextId") || ""
      });
    }
    return "";
  }
  if (normalizedToolId === "object-vector-studio-v2" && isHostedObjectVectorPlatformBadgeLaunch()) {
    console.log("[PLATFORM_SHELL_HOSTED_OBJECT_VECTOR_BADGE_BLOCK]", {
      source: "renderToolAssetBadge",
      toolId: normalizedToolId,
      label: "none"
    });
    return "";
  }
  const embeddedPayloadSummary = summarizeEmbeddedToolPayloadDocument(
    normalizedToolId,
    workspaceScopedToolPresetForStatus
  );
  const vectorPayloadLabel = normalizedToolId === "object-vector-studio-v2"
    ? readVectorAssetLabelFromHostedSharedContext()
    : "";
  const vectorScopedPresetLabel = normalizedToolId === "object-vector-studio-v2"
    ? readVectorAssetLabelFromWorkspaceScopedPreset(workspaceScopedToolPresetForStatus)
    : "";
  const vectorWorkspacePresetLabel = normalizedToolId === "object-vector-studio-v2"
    ? normalizeTextValue(workspaceScopedVectorAssetLabelForStatus)
    : "";
  const acceptedKinds = resolveAcceptedAssetKindsForTool(normalizedToolId);
  if (normalizedToolId === "palette-manager-v2") {
    const palette = readSharedPaletteHandoff();
    const paletteLabel = palette?.displayName || embeddedPayloadSummary || "none";
    const paletteTitle = palette?.displayName
      ? `Updated: ${escapeHtml(palette?.selectedAt || "not-set")}`
      : escapeHtml("Resolved from embedded workspace payload");
    const badgeClass = palette?.displayName || embeddedPayloadSummary ? " is-active" : "";
    console.log("[LEGACY_BADGE_WRITE]", {
      source: "renderToolAssetBadge",
      toolId: normalizedToolId,
      badgeKind: "palette",
      label: paletteLabel,
      badgeClass,
      hasSharedPalette: Boolean(palette?.displayName),
      embeddedPayloadSummary
    });
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
    console.log("[LEGACY_BADGE_WRITE]", {
      source: "renderToolAssetBadge",
      toolId: normalizedToolId,
      badgeKind: "non-asset",
      label: nonAssetLabel,
      badgeClass,
      embeddedPayloadSummary
    });
    return `
      <div class="tools-platform-frame__binding-badges" aria-label="Tool asset binding">
        <span class="tools-platform-frame__binding-badge${badgeClass}" title="${badgeTitle}">${escapeHtml(`Asset: ${nonAssetLabel}`)}</span>
      </div>
    `;
  }

  const asset = readSharedAssetHandoff();
  const compatibleAsset = isAssetCompatibleWithTool(toolId, asset) ? asset : null;
  const missingAssetLabel = "none";
  const compatibleAssetLabel = resolveSharedAssetLabel(compatibleAsset);
  const assetLabel = compatibleAssetLabel || (
    normalizedToolId === "object-vector-studio-v2"
      ? (vectorPayloadLabel || vectorScopedPresetLabel || vectorWorkspacePresetLabel || missingAssetLabel)
      : (embeddedPayloadSummary || missingAssetLabel)
  );
  const assetTitle = compatibleAsset
    ? `Updated: ${escapeHtml(compatibleAsset?.selectedAt || "not-set")}`
    : escapeHtml(
      normalizedToolId === "object-vector-studio-v2"
        ? (vectorPayloadLabel
          ? "Resolved from hosted tool payload"
          : (vectorScopedPresetLabel
            ? "Resolved from workspace scoped preset payload"
            : (vectorWorkspacePresetLabel ? "Resolved from workspace manifest preset payload" : "Updated: not-set")))
        : (embeddedPayloadSummary ? "Resolved from embedded workspace payload" : "Updated: not-set")
    );
  const badgeClass = compatibleAsset || (normalizedToolId === "object-vector-studio-v2"
    ? (vectorPayloadLabel || vectorScopedPresetLabel || vectorWorkspacePresetLabel)
    : embeddedPayloadSummary)
    ? " is-active"
    : "";
  console.log("[LEGACY_BADGE_WRITE]", {
    source: "renderToolAssetBadge",
    toolId: normalizedToolId,
    badgeKind: "asset",
    label: assetLabel,
    badgeClass,
    hasCompatibleAsset: Boolean(compatibleAsset),
    vectorPayloadLabel,
    vectorScopedPresetLabel,
    vectorWorkspacePresetLabel,
    embeddedPayloadSummary
  });
  return `
    <div class="tools-platform-frame__binding-badges" aria-label="Tool asset binding">
      <span class="tools-platform-frame__binding-badge${badgeClass}" title="${assetTitle}">${escapeHtml(`Asset: ${assetLabel}`)}</span>
    </div>
  `;
}

function classifyToolGroup(toolId) {
  const viewerToolIds = new Set([
    "3d-asset-viewer",
    "storage-inspector-v2",
    "state-inspector",
    "replay-visualizer",
    "performance-profiler"
  ]);
  const utilityToolIds = new Set([
    "asset-pipeline",
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
    if (toolId === "palette-manager-v2") {
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
  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null;
  const isHostedWorkspaceView = searchParams?.get("hosted") === "1"
    || searchParams?.has("hostToolId") === true
    || searchParams?.has("hostContextId") === true;
  const showNavThroughTiles = isHostedWorkspaceView;
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
    : `Configuration error: ${currentTool?.id || "tool"} header requires displayName/name and description/shortDescription from the Toolbox metadata API record.`;
  const standardizedIntroText = hasStandardizedIntroConfig
    ? `${standardizedToolName}: ${standardizedToolHelpText}`
    : `Configuration error: ${currentTool?.id || "tool"} intro requires name and description from the Toolbox metadata API record.`;
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
  const isPaletteBrowser = currentTool?.id === "palette-manager-v2";
  const workspaceMissingLock = workspaceContext && isToolSurfacePage && !lockState.workspaceReady;
  const paletteMissingLock = workspaceContext
    && isToolSurfacePage
    && lockState.workspaceReady
    && !lockState.paletteReady
    && !isPaletteBrowser;
  const shouldLockToolSurface = workspaceMissingLock || paletteMissingLock;
  const lockMessage = workspaceMissingLock
    ? "Create or open a workspace to use this tool."
    : "Select a shared palette in Palette Manager V2 to use this tool.";
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
  const clearedForLaunch = isHostedToolLaunch(searchParams)
    ? false
    : clearSharedBindingsForNewLaunch(launchSignature);
  const launchContext = readGameLaunchContext();
  const launchedFromSamplePreset = Boolean(samplePresetPath);
  const hydratedSamplePresetPalette = false;

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

  const manifestAssetContext = await readManifestAssetContextFromLaunchContext(launchContext);
  const hydratedAsset = await hydrateSharedAssetFromGameLaunchContext(manifestAssetContext);
  const hydratedPalette = false;
  renderShell(currentTool);
  if (clearedForLaunch) {
    TOOLS_PLATFORM_LOGGER.debug("cleared shared workspace bindings for new launch payload");
  }
  if (hydratedAsset) {
    TOOLS_PLATFORM_LOGGER.debug("shared asset hydrated from game manifest assets");
  }
  if (hydratedPalette) {
    TOOLS_PLATFORM_LOGGER.debug("shared palette hydrated from game manifest assets");
  }
  if (hydratedSamplePresetPalette) {
    TOOLS_PLATFORM_LOGGER.debug("shared palette hydrated from sample workspace manifest");
  }
  bindLiveBindingRefresh(currentTool);
}

void initPlatformShell();
