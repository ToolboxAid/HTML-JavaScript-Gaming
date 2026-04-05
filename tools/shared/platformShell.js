import { getToolById, getToolRegistry } from "../toolRegistry.js";
import {
  getSharedShellActions,
  readSharedAssetHandoff,
  readSharedPaletteHandoff
} from "./assetUsageIntegration.js";
import { createProjectSystemController } from "./projectSystem.js";

let projectController = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getPageMode() {
  return document.body.dataset.toolsPlatformPage || "tool";
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
  if (getPageMode() === "landing" || !currentToolId) {
    return "";
  }
  return getSharedShellActions(currentToolId, getPageMode())
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

function renderHeaderMarkup(currentTool) {
  const isLanding = getPageMode() === "landing";
  const title = currentTool ? currentTool.displayName : "Tools Platform";
  const description = currentTool
    ? currentTool.description
    : "Registry-driven, engine-themed entry surface for vector maps, vector assets, tilemaps, parallax scenes, and sprite workspaces.";
  const meta = isLanding
    ? `${getToolRegistry().filter((entry) => entry.active === true && entry.visibleInToolsList === true).length} active tools | hubCommon.css theme`
    : "Shared shell, engine theme, and project context applied from the active tool registry";

  return `
    <section class="tools-platform-frame">
      <div class="tools-platform-frame__topline">
        <div>
          <p class="tools-platform-frame__eyebrow">First-Class Tools Surface</p>
          <h1 class="tools-platform-frame__title">${escapeHtml(title)}</h1>
          <p class="tools-platform-frame__description">${escapeHtml(description)}</p>
        </div>
        <div class="tools-platform-frame__links">
          <a class="tools-platform-frame__link" href="${escapeHtml(getRelativeRepoHomePath())}">Repo Home</a>
          <a class="tools-platform-frame__link" href="${escapeHtml(getRelativeToolsHomePath())}">Tools Home</a>
        </div>
      </div>
      <div class="tools-platform-frame__bottomline">
        <nav class="tools-platform-frame__nav" aria-label="Active tools">
          ${renderToolLinks(currentTool?.id ?? "")}
        </nav>
        <div class="tools-platform-frame__meta">${escapeHtml(meta)}</div>
      </div>
      ${renderProjectSummary(currentTool)}
      ${currentTool ? `
        <div class="tools-platform-frame__actions" aria-label="Shared asset and palette actions">
          ${renderSharedActionLinks(currentTool.id)}
        </div>
        ${renderSharedSelectionSummary()}
      ` : ""}
    </section>
  `;
}

function renderStatusMarkup(currentTool) {
  const label = currentTool ? currentTool.displayName : "Landing Surface";
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
  }
}

function bindProjectShellEvents(currentTool) {
  if (!projectController || !currentTool) {
    return;
  }

  document.querySelectorAll("[data-project-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.getAttribute("data-project-action");

      if (action === "new") {
        if (!projectController.shouldConfirmDiscard("Discard unsaved project changes and create a new project?")) {
          return;
        }
        await projectController.handleNewProject();
        return;
      }

      if (action === "open") {
        if (!projectController.shouldConfirmDiscard("Discard unsaved project changes and open another project?")) {
          return;
        }
        document.querySelector("[data-project-open-input]")?.click();
        return;
      }

      if (action === "save") {
        projectController.handleSaveProject();
        return;
      }

      if (action === "save-as") {
        projectController.handleSaveProjectAs();
        return;
      }

      if (action === "close") {
        if (!projectController.shouldConfirmDiscard("Close the active project and clear unsaved changes?")) {
          return;
        }
        projectController.handleCloseProject();
      }
    });
  });

  const openInput = document.querySelector("[data-project-open-input]");
  if (openInput instanceof HTMLInputElement) {
    openInput.addEventListener("change", async () => {
      const file = openInput.files?.[0];
      openInput.value = "";
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

  document.querySelectorAll(".tools-platform-frame__nav-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (projectController.shouldConfirmDiscard("You have unsaved project changes. Continue to another tool?")) {
        return;
      }
      event.preventDefault();
    });
  });
}

function renderShell(currentTool) {
  const headerHost = document.querySelector("[data-tools-platform-header]");
  const statusHost = document.querySelector("[data-tools-platform-status]");

  applyDocumentMetadata(currentTool);

  if (headerHost) {
    headerHost.innerHTML = renderHeaderMarkup(currentTool);
  }

  if (statusHost) {
    statusHost.innerHTML = renderStatusMarkup(currentTool);
  }

  bindProjectShellEvents(currentTool);
}

function initPlatformShell() {
  const currentToolId = document.body.dataset.toolId || "";
  const currentTool = currentToolId ? getToolById(currentToolId) : null;

  if (currentToolId) {
    projectController = createProjectSystemController({
      toolId: currentToolId,
      onChange() {
        renderShell(currentTool);
      },
      onStatus(message) {
        const statusHost = document.querySelector("[data-tools-platform-status]");
        if (!(statusHost instanceof HTMLElement)) {
          return;
        }
        const spans = statusHost.querySelectorAll("span");
        if (spans[0]) {
          spans[0].textContent = message;
        }
      }
    });
    projectController.startWatching();
  }

  renderShell(currentTool);
}

initPlatformShell();
