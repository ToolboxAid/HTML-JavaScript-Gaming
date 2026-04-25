import { getToolById, getToolRegistry } from "../toolRegistry.js";
import {
  getSharedShellActions,
  readSharedAssetHandoff,
  readSharedPaletteHandoff,
  writeSharedPaletteHandoff
} from "./assetUsageIntegration.js";
import { createWorkspaceSystemController } from "./projectSystem.js";
import { bindEventHandlers, createCommandDispatcher } from "./eventCommandUtils.js";
import { asHtmlInput, queryAll, queryFirst, readDataAttribute, setTextContent } from "./uiSafeUtils.js";
import { escapeHtml } from "../../src/shared/string/stringUtil.js";
import { Logger } from "../../src/engine/logging/index.js";
import { createRuntimeMonitoringHooks } from "../../src/engine/runtime/index.js";
import { validatePaletteDocument } from "./paletteDocumentContract.js";

let workspaceController = null;
let headerExpandedState = null;
let runtimeMonitoringHooks = null;
let bindingRefreshHandlersBound = false;
let lastWorkspaceUiStateKey = "";
let lastLockedSurfaceElement = null;

const HEADER_EXPANDED_STORAGE_KEY = "toolboxaid.toolsPlatform.headerExpanded";
const HEADER_EXPANDED_FALLBACK_TOOL = "tool-host";
const TOOLS_PLATFORM_LOGGER = new Logger({ channel: "tools.platform", level: "debug" });
const TOOLS_PLATFORM_BOOT_MS = Date.now();
const GAME_ASSET_CATALOG_SCHEMA = "html-js-gaming.game-asset-catalog";
const GAME_ASSET_CATALOG_VERSION = 1;

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

function normalizeTextValue(value) {
  return typeof value === "string" ? value.trim() : "";
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
    ? `/tools/Workspace%20Manager/index.html?game=${encodeURIComponent(normalizedGameId)}`
    : "";
}

function readGameLaunchContext() {
  if (typeof window === "undefined") {
    return null;
  }
  const searchParams = new URLSearchParams(window.location.search);
  const gameId = normalizeTextValue(searchParams.get("gameId"));
  const gameTitle = normalizeTextValue(searchParams.get("gameTitle"));
  const gameHref = normalizeLocalHref(searchParams.get("gameHref"), ["/games/"]);
  const returnTo = normalizeLocalHref(searchParams.get("returnTo"), ["/games/"]);
  const workspaceHrefParam = normalizeLocalHref(searchParams.get("workspaceHref"), ["/tools/Workspace%20Manager/", "/tools/Workspace Manager/"]);
  const workspaceHref = workspaceHrefParam || buildWorkspaceHrefFromGameId(gameId);
  if (!gameId && !gameTitle && !gameHref && !returnTo && !workspaceHref) {
    return null;
  }
  return {
    gameId,
    gameTitle,
    gameHref,
    returnTo,
    workspaceHref
  };
}

function deriveGameAssetCatalogPath(context) {
  const gameHref = normalizeTextValue(context?.gameHref);
  if (gameHref.endsWith("/index.html")) {
    return `${gameHref.slice(0, -"/index.html".length)}/assets/workspace.asset-catalog.json`;
  }
  if (gameHref.endsWith("/")) {
    return `${gameHref}assets/workspace.asset-catalog.json`;
  }
  const gameId = normalizeTextValue(context?.gameId);
  return gameId ? `/games/${encodeURIComponent(gameId)}/assets/workspace.asset-catalog.json` : "";
}

function normalizePaletteCatalogEntries(value) {
  const source = value && typeof value === "object" ? value : {};
  return Object.entries(source)
    .map(([assetId, rawEntry]) => {
      const safeAssetId = normalizeTextValue(assetId);
      const entry = rawEntry && typeof rawEntry === "object" ? rawEntry : {};
      const kind = normalizeTextValue(entry.kind).toLowerCase();
      const path = normalizeTextValue(entry.path || entry.runtimePath || entry.href);
      return { assetId: safeAssetId, kind, path };
    })
    .filter((entry) => Boolean(entry.assetId && entry.kind === "palette" && entry.path));
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

async function hydrateSharedPaletteFromGameLaunchContext() {
  const existingPalette = readSharedPaletteHandoff();
  if (existingPalette?.paletteId) {
    return false;
  }

  const launchContext = readGameLaunchContext();
  if (!launchContext?.gameId && !launchContext?.gameHref) {
    return false;
  }

  const catalogPath = deriveGameAssetCatalogPath(launchContext);
  if (!catalogPath) {
    return false;
  }

  const catalogPayload = await readJsonDocument(catalogPath);
  if (!catalogPayload || typeof catalogPayload !== "object") {
    return false;
  }

  const schema = normalizeTextValue(catalogPayload.schema);
  const version = Number(catalogPayload.version);
  if (schema !== GAME_ASSET_CATALOG_SCHEMA || version !== GAME_ASSET_CATALOG_VERSION) {
    return false;
  }

  const paletteEntries = normalizePaletteCatalogEntries(catalogPayload.assets || catalogPayload.entries);
  const primaryPalette = paletteEntries[0];
  if (!primaryPalette) {
    return false;
  }

  const palettePayload = await readJsonDocument(primaryPalette.path);
  const validation = validatePaletteDocument(palettePayload, { requireSchema: false });
  if (!validation.valid) {
    return false;
  }

  return writeSharedPaletteHandoff({
    paletteId: primaryPalette.assetId,
    displayName: validation.palette.name || primaryPalette.assetId,
    colors: validation.palette.entries,
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
  const returnHref = context.returnTo || "/games/index.html";
  const gamePageLink = context.gameHref
    ? `<a class="tools-platform-frame__action-link" href="${escapeHtml(context.gameHref)}">Open Game</a>`
    : "";
  return `
    <div class="tools-platform-frame__return-line" aria-label="Game launch context">
      <span class="tools-platform-frame__return-copy"><strong>Game Source:</strong> ${escapeHtml(gameLabel)}</span>
      <a class="tools-platform-frame__action-link" href="${escapeHtml(returnHref)}">Return to Games</a>
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

function renderToolAssetBadge(toolId = "") {
  const normalizedToolId = normalizeTextValue(toolId).toLowerCase();
  if (normalizedToolId === "palette-browser") {
    const palette = readSharedPaletteHandoff();
    const paletteLabel = palette?.displayName || "none";
    const paletteTitle = `Updated: ${escapeHtml(palette?.selectedAt || "not-set")}`;
    return `
      <div class="tools-platform-frame__binding-badges" aria-label="Tool asset binding">
        <span class="tools-platform-frame__binding-badge is-active" title="${paletteTitle}">${escapeHtml(`Palette: ${paletteLabel}`)}</span>
      </div>
    `;
  }

  const asset = readSharedAssetHandoff();
  const assetLabel = asset?.displayName || "none";
  const assetTitle = `Updated: ${escapeHtml(asset?.selectedAt || "not-set")}`;
  return `
    <div class="tools-platform-frame__binding-badges" aria-label="Tool asset binding">
      <span class="tools-platform-frame__binding-badge is-active" title="${assetTitle}">${escapeHtml(`Asset: ${assetLabel}`)}</span>
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
    "asset-pipeline-tool",
    "tile-model-converter",
    "physics-sandbox",
    "3d-json-payload-normalizer"
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
  const paletteReady = Boolean(palette && typeof palette.displayName === "string" && palette.displayName.trim());
  return { workspaceReady, paletteReady };
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
    if (!lockState.paletteReady && toolId !== "palette-browser") {
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
            <a class="tools-platform-frame__nav-link${currentClass}${disabledClass}" href="${escapeHtml(getRegistryEntryHref(tool.entryPoint))}"${disabledAttrs}>${escapeHtml(tool.displayName)}</a>
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
          <a class="tools-platform-frame__nav-link${currentClass}${disabledClass}" href="${escapeHtml(getRegistryEntryHref(tool.entryPoint))}"${disabledAttrs}>${escapeHtml(tool.displayName)}</a>
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

function renderSharedSelectionSummary() {
  if (getPageMode() === "landing") {
    return "";
  }
  const workspaceLabel = resolveProjectBindingLabel();
  const asset = readSharedAssetHandoff();
  const palette = readSharedPaletteHandoff();
  const assetLabel = asset?.displayName || "No shared asset selected";
  const paletteLabel = palette?.displayName || "No shared palette selected";

  return `
    <div class="tools-platform-frame__shared-status" aria-label="Shared asset and palette status">
      <span><strong>Workspace:</strong> ${escapeHtml(workspaceLabel)}</span>
      <span><strong>Shared Palette:</strong> ${escapeHtml(paletteLabel)}</span>
      <span><strong>Shared Assets:</strong> ${escapeHtml(assetLabel)}</span>
    </div>
  `;
}

function renderWorkspaceSummary(currentTool) {
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

  return `
    <div class="tools-platform-frame__project" aria-label="Workspace system controls">
      <div class="tools-platform-frame__project-actions">
        <button type="button" class="tools-platform-frame__project-button" data-workspace-action="new">New Workspace</button>
        <button type="button" class="tools-platform-frame__project-button" data-workspace-action="open">Open Workspace</button>
        <button type="button" class="tools-platform-frame__project-button" data-workspace-action="save"${workspaceActionDisabled}>Save Workspace</button>
        <button type="button" class="tools-platform-frame__project-button" data-workspace-action="save-as"${workspaceActionDisabled}>Save Workspace As</button>
        <button type="button" class="tools-platform-frame__project-button is-secondary" data-workspace-action="close"${workspaceActionDisabled}>Close Workspace</button>
        <input type="file" class="tools-platform-frame__project-input" data-workspace-open-input accept=".json,application/json" />
      </div>
      <div class="tools-platform-frame__project-copy">
        <span class="tools-platform-frame__project-label">Workspace</span>
        <strong class="tools-platform-frame__project-name">${escapeHtml(workspaceName)}${escapeHtml(dirtyMark)}</strong>
        <span class="tools-platform-frame__project-meta">${escapeHtml(readiness)}</span>
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
  const meta = isLanding
    ? `${getToolRegistry().filter((entry) => entry.active === true && entry.visibleInToolsList === true).length} active tools | hubCommon.css theme`
    : "Shared shell, engine theme, and workspace context applied from the active tool registry";

  return `
    <section class="tools-platform-frame">
      <div class="tools-platform-frame__accordion-content">
        <div class="tools-platform-frame__accordion-summary">
          <div class="tools-platform-frame__summary-copy">
            <h1 class="tools-platform-frame__title">${escapeHtml(title)}</h1>
            <h2 class="tools-platform-frame__eyebrow">First-Class Tools Surface</h2>
          </div>
          <div class="tools-platform-frame__summary-meta">
            <div class="tools-platform-frame__meta">${escapeHtml(meta)}</div>
          </div>
        </div>
        <div class="tools-platform-frame__topline">
          <p class="tools-platform-frame__description">${escapeHtml(description)}</p>
        </div>
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
              ${renderWorkspaceSummary(currentTool)}
              ${renderSharedSelectionSummary()}
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
      accordion.open = index === 0;
    });
  });
}

function renderShell(currentTool) {
  const headerHost = queryFirst("[data-tools-platform-header]");
  const statusHost = queryFirst("[data-tools-platform-status]");
  const pageHeaderAccordion = queryFirst(".is-collapsible");

  const isHeaderExpanded = pageHeaderAccordion instanceof HTMLDetailsElement
    ? pageHeaderAccordion.open
    : (headerExpandedState ?? readStoredHeaderExpandedState());
  headerExpandedState = isHeaderExpanded;

  applyDocumentMetadata(currentTool);

  if (headerHost) {
    headerHost.innerHTML = renderHeaderMarkup(currentTool, isHeaderExpanded);
  }

  if (pageHeaderAccordion instanceof HTMLDetailsElement) {
    pageHeaderAccordion.open = isHeaderExpanded;
    bindEventHandlers(pageHeaderAccordion, "toggle", () => {
      headerExpandedState = pageHeaderAccordion.open;
      writeStoredHeaderExpandedState(pageHeaderAccordion.open);
    });
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
  const launchContext = readGameLaunchContext();
  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
  const launchedFromSamplePreset = searchParams.has("samplePresetPath");

  if (currentToolId) {
    workspaceController = createWorkspaceSystemController({
      toolId: currentToolId,
      launchContext,
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

  const hydratedPalette = await hydrateSharedPaletteFromGameLaunchContext();
  renderShell(currentTool);
  if (hydratedPalette) {
    TOOLS_PLATFORM_LOGGER.debug("shared palette hydrated from game asset catalog");
  }
  bindLiveBindingRefresh(currentTool);
}

void initPlatformShell();
