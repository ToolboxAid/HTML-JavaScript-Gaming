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
  return `
    <div class="card">
      <h3><a href="${escapeHtml(tool.entryPoint)}">${escapeHtml(tool.displayName)}</a></h3>
      <p>${escapeHtml(tool.description)}</p>
      <div class="meta">
        <span class="pill live">Active Tool</span>
        <span class="pill planned">Engine Theme</span>
      </div>
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
