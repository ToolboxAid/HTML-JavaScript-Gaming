import { getToolRegistry } from "./toolRegistry.js";
import { escapeHtml } from "../src/shared/string/stringUtil.js";

function renderToolCard(tool) {
  const hostHref = `Tool Host/index.html?tool=${encodeURIComponent(tool.id)}`;
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
        <a class="tools-platform-card__action tools-platform-card__action--secondary" href="${escapeHtml(hostHref)}">Open In Host</a>
      </div>
      <p class="tools-platform-card__launch-help">
        Open Tool = launch the tool directly/standalone<br />
        Open In Host = launch the same tool inside a shared host shell/container
      </p>
      ${sampleLinks}
    </div>
  `;
}

function renderActiveToolsList() {
  const grid = document.querySelector("[data-active-tools-grid]");
  if (!grid) {
    return;
  }
  grid.innerHTML = getToolRegistry()
    .filter((entry) => entry.active === true)
    .filter((entry) => entry.visibleInToolsList === true)
    .map((tool) => renderToolCard(tool))
    .join("\n");
}

renderActiveToolsList();
