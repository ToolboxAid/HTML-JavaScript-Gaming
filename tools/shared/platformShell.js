import { getToolById, getToolRegistry } from "../toolRegistry.js";
import {
  getSharedShellActions,
  readSharedAssetHandoff,
  readSharedPaletteHandoff
} from "./assetUsageIntegration.js";
import { createWorkspaceSystemController } from "./projectSystem.js";
import { bindEventHandlers, createCommandDispatcher } from "./eventCommandUtils.js";
import { asHtmlInput, queryAll, queryFirst, readDataAttribute, setTextContent } from "./uiSafeUtils.js";
import { escapeHtml } from "../../src/shared/string/stringUtil.js";
import { Logger } from "../../src/engine/logging/index.js";
import { createRuntimeMonitoringHooks } from "../../src/engine/runtime/index.js";

let workspaceController = null;
let headerExpandedState = null;
let runtimeMonitoringHooks = null;
let bindingRefreshHandlersBound = false;
let lastWorkspaceUiStateKey = "";

const HEADER_EXPANDED_STORAGE_KEY = "toolboxaid.toolsPlatform.headerExpanded";
const HEADER_EXPANDED_FALLBACK_TOOL = "tool-host";
const TOOLS_PLATFORM_LOGGER = new Logger({ channel: "tools.platform", level: "debug" });
const TOOLS_PLATFORM_BOOT_MS = Date.now();
const APPLIED_PRESET_KEY = "__TOOLS_PLATFORM_PHASE20_PRESET_APPLIED__";

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

function renderToolAssetBadge() {
  const asset = readSharedAssetHandoff();
  const assetLabel = asset?.displayName || "none";
  const assetTitle = `Updated: ${escapeHtml(asset?.selectedAt || "not-set")}`;
  return `
    <div class="tools-platform-frame__binding-badges" aria-label="Tool asset binding">
      <span class="tools-platform-frame__binding-badge is-active" title="${assetTitle}">${escapeHtml(`Asset: ${assetLabel}`)}</span>
    </div>
  `;
}

function renderToolLinks(currentToolId) {
  const viewerToolIds = new Set([
    "3d-asset-viewer",
    "state-inspector",
    "replay-visualizer",
    "performance-profiler"
  ]);
  const tools = getToolRegistry()
    .filter((entry) => entry.active === true)
    .filter((entry) => entry.visibleInToolsList === true)
    .sort((left, right) => String(left.displayName || "").localeCompare(String(right.displayName || "")));

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
        return `
          <div class="tools-platform-frame__nav-tool-row">
            <a class="tools-platform-frame__nav-link${currentClass}" href="${escapeHtml(getRegistryEntryHref(tool.entryPoint))}">${escapeHtml(tool.displayName)}</a>
            ${renderToolAssetBadge()}
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
    const creatorTools = tools.filter((tool) => !viewerToolIds.has(tool.id));
    const viewerTools = tools.filter((tool) => viewerToolIds.has(tool.id));
    return `
      <section class="tools-platform-frame__nav-section" aria-label="Editor and creator tools">
        <h1 class="tools-platform-frame__nav-section-title">Editors and Creators</h1>
        <div class="tools-platform-frame__nav-grid">
          ${renderBucketGrid(creatorTools)}
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
      return `
        <div class="tools-platform-frame__nav-tool-row">
          <a class="tools-platform-frame__nav-link${currentClass}" href="${escapeHtml(getRegistryEntryHref(tool.entryPoint))}">${escapeHtml(tool.displayName)}</a>
          ${renderToolAssetBadge()}
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
        <button type="button" class="tools-platform-frame__project-button" data-workspace-action="save">Save Workspace</button>
        <button type="button" class="tools-platform-frame__project-button" data-workspace-action="save-as">Save Workspace As</button>
        <button type="button" class="tools-platform-frame__project-button is-secondary" data-workspace-action="close">Close Workspace</button>
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
  const sharedActionLinks = !isLanding ? renderSharedActionLinks(currentTool?.id ?? "") : "";
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
            <nav class="tools-platform-frame__nav" aria-label="Active tools">
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
  document.body.classList.toggle("tools-platform-workspace-context", isWorkspaceManagerContext());
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
    if (link instanceof HTMLAnchorElement) {
      link.click();
    }
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

function readPhase20PresetFromLocation(currentToolId = "") {
  if (typeof window === "undefined") {
    return null;
  }
  const params = new URLSearchParams(window.location.search);
  const samplePreset = decodeSamplePresetPayload(params.get("samplePreset") || "");
  if (!samplePreset || samplePreset.toolId !== currentToolId || !samplePreset.state || typeof samplePreset.state !== "object") {
    return null;
  }
  return {
    sampleId: typeof samplePreset.sampleId === "string" ? samplePreset.sampleId : "",
    label: typeof samplePreset.label === "string" ? samplePreset.label : "",
    state: samplePreset.state
  };
}

function maybeApplyPhase20Preset(currentToolId = "") {
  if (!workspaceController || !currentToolId || window[APPLIED_PRESET_KEY] === true) {
    return;
  }
  const preset = readPhase20PresetFromLocation(currentToolId);
  if (!preset) {
    return;
  }
  const label = preset.label || `Phase 20 sample ${preset.sampleId || "preset"}`;
  workspaceController.applyExternalToolState({
    state: preset.state,
    label
  });
  window[APPLIED_PRESET_KEY] = true;
}

function initPlatformShell() {
  ensureRuntimeMonitoring();

  const currentToolId = document.body.dataset.toolId || "";
  const currentTool = currentToolId ? getToolById(currentToolId) : null;

  if (currentToolId) {
    workspaceController = createWorkspaceSystemController({
      toolId: currentToolId,
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
    maybeApplyPhase20Preset(currentToolId);
  }

  renderShell(currentTool);
  bindLiveBindingRefresh(currentTool);
}

initPlatformShell();
