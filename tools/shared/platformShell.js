import { getToolById, getToolRegistry } from "../toolRegistry.js";

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

function renderHeaderMarkup(currentTool) {
  const isLanding = getPageMode() === "landing";
  const title = currentTool ? currentTool.displayName : "Tools Platform";
  const description = currentTool
    ? currentTool.description
    : "Registry-driven, engine-themed entry surface for vector maps, vector assets, tilemaps, parallax scenes, and sprite workspaces.";
  const meta = isLanding
    ? `${getToolRegistry().filter((entry) => entry.active === true && entry.visibleInToolsList === true).length} active tools | hubCommon.css theme`
    : "Shared shell and engine theme applied from the active tool registry";

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
    </section>
  `;
}

function renderStatusMarkup(currentTool) {
  const label = currentTool ? currentTool.displayName : "Landing Surface";
  return `
    <div class="tools-platform-statusbar">
      <span>Registry-driven navigation and engine theme are active.</span>
      <span>${escapeHtml(label)}</span>
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

function initPlatformShell() {
  const currentToolId = document.body.dataset.toolId || "";
  const currentTool = currentToolId ? getToolById(currentToolId) : null;
  const headerHost = document.querySelector("[data-tools-platform-header]");
  const statusHost = document.querySelector("[data-tools-platform-status]");

  applyDocumentMetadata(currentTool);

  if (headerHost) {
    headerHost.innerHTML = renderHeaderMarkup(currentTool);
  }

  if (statusHost) {
    statusHost.innerHTML = renderStatusMarkup(currentTool);
  }
}

initPlatformShell();
