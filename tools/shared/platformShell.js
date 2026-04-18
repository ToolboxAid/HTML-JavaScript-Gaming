import { getToolById, getToolRegistry } from "../toolRegistry.js";
import {
  getSharedShellActions,
  readSharedAssetHandoff,
  readSharedPaletteHandoff
} from "./assetUsageIntegration.js";
import { createProjectSystemController } from "./projectSystem.js";
import { bindEventHandlers, createCommandDispatcher } from "./eventCommandUtils.js";
import { asHtmlInput, queryAll, queryFirst, readDataAttribute, setTextContent } from "./uiSafeUtils.js";
import { escapeHtml } from "../../src/shared/string/stringUtil.js";
import { Logger } from "../../src/engine/logging/index.js";
import { createRuntimeMonitoringHooks } from "../../src/engine/runtime/index.js";

let projectController = null;
let headerExpandedState = null;
let runtimeMonitoringHooks = null;

const HEADER_EXPANDED_STORAGE_KEY = "toolboxaid.toolsPlatform.headerExpanded";
const HEADER_EXPANDED_FALLBACK_TOOL = "tool-host";
const TOOLS_PLATFORM_LOGGER = new Logger({ channel: "tools.platform", level: "debug" });
const TOOLS_PLATFORM_BOOT_MS = Date.now();

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
  return projectController ? projectController.getManifest() : null;
}

function renderToolLinks(currentToolId) {
  return getToolRegistry()
    .filter((entry) => entry.active === true)
    .filter((entry) => entry.visibleInToolsList === true)
    .map((tool) => {
      const currentClass = tool.id === currentToolId ? " is-current" : "";
      return `<a class="tools-platform-frame__nav-link${currentClass}" href="${escapeHtml(getRegistryEntryHref(tool.entryPoint))}">${escapeHtml(tool.displayName)}</a>`;
    })
    .join("");
}

function renderSharedActionLinks(currentToolId) {
  if (getPageMode() === "landing") {
    return "";
  }
  const sourceToolId = currentToolId || HEADER_EXPANDED_FALLBACK_TOOL;
  return getSharedShellActions(sourceToolId, getPageMode())
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
  const asset = readSharedAssetHandoff();
  const palette = readSharedPaletteHandoff();
  const assetLabel = asset?.displayName || "No shared asset selected";
  const paletteLabel = palette?.displayName || "No shared palette selected";

  return `
    <div class="tools-platform-frame__shared-status" aria-label="Shared asset and palette status">
      <span><strong>Shared Asset:</strong> ${escapeHtml(assetLabel)}</span>
      <span><strong>Shared Palette:</strong> ${escapeHtml(paletteLabel)}</span>
    </div>
  `;
}

function renderProjectSummary(currentTool) {
  if (!currentTool || !projectController) {
    return "";
  }

  const manifest = getManifest();
  const projectName = manifest?.name || "Untitled Project";
  const dirtyMark = manifest?.dirty === true ? " *" : "";
  const readiness = manifest?.tools?.[currentTool.id]
    ? "shared project state synced"
    : "shared project shell ready";

  return `
    <div class="tools-platform-frame__project" aria-label="Project system controls">
      <div class="tools-platform-frame__project-copy">
        <span class="tools-platform-frame__project-label">Project</span>
        <strong class="tools-platform-frame__project-name">${escapeHtml(projectName)}${escapeHtml(dirtyMark)}</strong>
        <span class="tools-platform-frame__project-meta">${escapeHtml(readiness)}</span>
      </div>
      <div class="tools-platform-frame__project-actions">
        <button type="button" class="tools-platform-frame__project-button" data-project-action="new">New Project</button>
        <button type="button" class="tools-platform-frame__project-button" data-project-action="open">Open Project</button>
        <button type="button" class="tools-platform-frame__project-button" data-project-action="save">Save Project</button>
        <button type="button" class="tools-platform-frame__project-button" data-project-action="save-as">Save Project As</button>
        <button type="button" class="tools-platform-frame__project-button is-secondary" data-project-action="close">Close Project</button>
        <input type="file" class="tools-platform-frame__project-input" data-project-open-input accept=".json,application/json" />
      </div>
    </div>
  `;
}

function renderHeaderMarkup(currentTool, isHeaderExpanded) {
  const isLanding = getPageMode() === "landing";
  const title = currentTool ? currentTool.displayName : (document.body.dataset.toolTitle || "Tools Platform");
  const description = currentTool
    ? currentTool.description
    : "Registry-driven, engine-themed entry surface for vector maps, vector assets, tilemaps, parallax scenes, and sprite workspaces.";
  const meta = isLanding
    ? `${getToolRegistry().filter((entry) => entry.active === true && entry.visibleInToolsList === true).length} active tools | hubCommon.css theme`
    : "Shared shell, engine theme, and project context applied from the active tool registry";

  return `
    <section class="tools-platform-frame">
      <details class="tools-platform-frame__accordion"${isHeaderExpanded ? " open" : ""}>
        <summary class="tools-platform-frame__accordion-summary" aria-label="Toggle tools platform header details">
          <div class="tools-platform-frame__summary-copy">
            <h1 class="tools-platform-frame__title">${escapeHtml(title)}</h1>
            <h2 class="tools-platform-frame__eyebrow">First-Class Tools Surface</h2>
          </div>
          <div class="tools-platform-frame__summary-meta">
            <div class="tools-platform-frame__meta">${escapeHtml(meta)}</div>
            <span class="tools-platform-frame__accordion-icon">&#9662;</span>
          </div>
        </summary>
        <div class="tools-platform-frame__accordion-content">
          <div class="tools-platform-frame__topline">
            <p class="tools-platform-frame__description">${escapeHtml(description)}</p>
            <div class="tools-platform-frame__links">
              <a class="tools-platform-frame__link" href="${escapeHtml(getRelativeRepoHomePath())}">Repo Home</a>
              <a class="tools-platform-frame__link" href="${escapeHtml(getRelativeToolsHomePath())}">Tools Home</a>
            </div>
          </div>
          <div class="tools-platform-frame__bottomline">
            <nav class="tools-platform-frame__nav" aria-label="Active tools">
              ${renderToolLinks(currentTool?.id ?? "")}
            </nav>
          </div>
          ${renderProjectSummary(currentTool)}
          ${!isLanding ? `
            <div class="tools-platform-frame__actions" aria-label="Shared asset and palette actions">
              ${renderSharedActionLinks(currentTool?.id ?? "")}
            </div>
            ${renderSharedSelectionSummary()}
          ` : ""}
        </div>
      </details>
    </section>
  `;
}

function renderStatusMarkup(currentTool) {
  const label = currentTool
    ? currentTool.displayName
    : (getPageMode() === "landing" ? "Landing Surface" : (document.body.dataset.toolTitle || "Tool Surface"));
  const manifest = getManifest();
  const projectName = manifest?.name || "No active project";
  const dirtyLabel = manifest?.dirty === true ? "Unsaved changes" : "Saved";
  return `
    <div class="tools-platform-statusbar">
      <span>Registry-driven navigation, engine theme, and project system are active.</span>
      <span>${escapeHtml(label)} | ${escapeHtml(projectName)}</span>
      <span>${escapeHtml(dirtyLabel)}</span>
      <span>${getToolRegistry().filter((entry) => entry.active === true && entry.visibleInToolsList === true).length} first-class tools</span>
    </div>
  `;
}

function applyDocumentMetadata(currentTool) {
  document.body.classList.add("tools-platform-surface");
  if (currentTool) {
    document.title = `${currentTool.displayName} | Tools Platform`;
  } else if (getPageMode() === "landing") {
    document.title = "Tools Platform";
  } else {
    const toolTitle = document.body.dataset.toolTitle || "Tool Surface";
    document.title = `${toolTitle} | Tools Platform`;
  }
}

function bindProjectShellEvents(currentTool) {
  if (!projectController || !currentTool) {
    return;
  }

  const actionButtons = queryAll("[data-project-action]");
  const openInputElement = asHtmlInput(queryFirst("[data-project-open-input]"));

  const dispatchProjectAction = createCommandDispatcher({
    async new() {
      if (!projectController.shouldConfirmDiscard("Discard unsaved project changes and create a new project?")) {
        return;
      }
      await projectController.handleNewProject();
    },
    async open() {
      if (!projectController.shouldConfirmDiscard("Discard unsaved project changes and open another project?")) {
        return;
      }
      openInputElement?.click();
    },
    async save() {
      projectController.handleSaveProject();
    },
    async "save-as"() {
      projectController.handleSaveProjectAs();
    },
    async close() {
      if (!projectController.shouldConfirmDiscard("Close the active project and clear unsaved changes?")) {
        return;
      }
      projectController.handleCloseProject();
    }
  });

  bindEventHandlers(actionButtons, "click", async (event) => {
    const button = event.currentTarget instanceof Element ? event.currentTarget : null;
    const action = readDataAttribute(button, "data-project-action");
    await dispatchProjectAction(action);
  });

  if (openInputElement) {
    bindEventHandlers(openInputElement, "change", async () => {
      const file = openInputElement.files?.[0];
      openInputElement.value = "";
      if (!file) {
        return;
      }

      try {
        await projectController.handleOpenProject(file);
      } catch (error) {
        window.alert(`Open Project failed: ${error instanceof Error ? error.message : "unknown error"}`);
      }
    });
  }

  bindEventHandlers(queryAll(".tools-platform-frame__nav-link"), "click", (event) => {
      if (projectController.shouldConfirmDiscard("You have unsaved project changes. Continue to another tool?")) {
        return;
      }
      event.preventDefault();
  });
}

function renderShell(currentTool) {
  const headerHost = queryFirst("[data-tools-platform-header]");
  const statusHost = queryFirst("[data-tools-platform-status]");

  const existingAccordion = headerHost?.querySelector(".tools-platform-frame__accordion");
  const isHeaderExpanded = existingAccordion
    ? existingAccordion.hasAttribute("open")
    : (headerExpandedState ?? readStoredHeaderExpandedState());
  headerExpandedState = isHeaderExpanded;

  applyDocumentMetadata(currentTool);

  if (headerHost) {
    headerHost.innerHTML = renderHeaderMarkup(currentTool, isHeaderExpanded);

    const newAccordion = headerHost.querySelector(".tools-platform-frame__accordion");
    if (newAccordion instanceof HTMLDetailsElement) {
      bindEventHandlers(newAccordion, "toggle", () => {
        headerExpandedState = newAccordion.open;
        writeStoredHeaderExpandedState(newAccordion.open);
      });
    }
  }

  if (statusHost) {
    statusHost.innerHTML = renderStatusMarkup(currentTool);
  }

  bindProjectShellEvents(currentTool);
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

function initPlatformShell() {
  ensureRuntimeMonitoring();

  const currentToolId = document.body.dataset.toolId || "";
  const currentTool = currentToolId ? getToolById(currentToolId) : null;

  if (currentToolId) {
    projectController = createProjectSystemController({
      toolId: currentToolId,
      onChange() {
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
    projectController.startWatching();
  }

  renderShell(currentTool);
}

initPlatformShell();
