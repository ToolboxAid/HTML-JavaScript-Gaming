import { getVisibleActiveToolRegistry } from "./toolRegistry.js";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderToolCard(tool) {
  const sampleLinks = Array.isArray(tool.sampleEntryPoints) && tool.sampleEntryPoints.length > 0
    ? `
      <div class="meta">
        ${tool.sampleEntryPoints.map((entry) => `
          <a class="tools-platform-card__action tools-platform-card__action--secondary" href="${escapeHtml(entry.path)}">${escapeHtml(entry.label)}</a>
        `).join("")}
      </div>
    `
    : "";

  return `
    <div class="card tools-platform-card">
      <div class="meta">
        <span class="pill live">${escapeHtml(tool.showcaseTag || "Active Tool")}</span>
        <span class="pill planned">${escapeHtml(tool.showcaseStatus || "Engine Theme")}</span>
      </div>
      <h3><a href="${escapeHtml(tool.entryPoint)}">${escapeHtml(tool.displayName)}</a></h3>
      <p>${escapeHtml(tool.description)}</p>
      <div class="meta">
        <a class="tools-platform-card__action" href="${escapeHtml(tool.entryPoint)}">Open Tool</a>
      </div>
      ${sampleLinks}
    </div>
  `;
}

function renderActiveToolsList() {
  const grid = document.querySelector("[data-active-tools-grid]");
  if (!grid) {
    return;
  }
  grid.innerHTML = getVisibleActiveToolRegistry().map((tool) => renderToolCard(tool)).join("\n");
}

renderActiveToolsList();
