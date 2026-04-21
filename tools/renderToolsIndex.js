import { getToolRegistry } from "./toolRegistry.js";
import { escapeHtml } from "../src/shared/string/stringUtil.js";

function toStandaloneHref(entryPoint) {
  const normalized = String(entryPoint || "").replace(/^\.?\/*/, "");
  return normalized ? `/tools/${normalized}` : "#";
}

function toHostHref(toolId) {
  return `/tools/Workspace%20Manager/index.html?tool=${encodeURIComponent(toolId)}`;
}

function renderToolCard(tool) {
  const standaloneHref = toStandaloneHref(tool.entryPoint);
  const hostHref = toHostHref(tool.id);
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
      <h3><a href="${escapeHtml(standaloneHref)}">${escapeHtml(tool.displayName)}</a></h3>
      <p>${escapeHtml(tool.description)}</p>
      <div class="meta">
        <a class="tools-platform-card__action" href="${escapeHtml(standaloneHref)}">Open Tool</a>
        <a class="tools-platform-card__action tools-platform-card__action--secondary" href="${escapeHtml(hostHref)}">Open In Workspace Manager</a>
      </div>
      <p class="tools-platform-card__launch-help">
        Open Tool = launch the tool directly/standalone<br />
        Open In Workspace Manager = launch the same tool inside a shared host shell/container
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
    .sort((left, right) => String(left.displayName || "").localeCompare(String(right.displayName || "")))
    .map((tool) => renderToolCard(tool))
    .join("\n");
}

function sortPlannedCardsAlphabetically() {
  const grid = document.querySelector("[data-planned-tools-grid]");
  if (!grid) {
    return;
  }
  const cards = Array.from(grid.querySelectorAll(".card"));
  cards
    .sort((left, right) => {
      const leftName = left.querySelector("h3")?.textContent?.trim() || "";
      const rightName = right.querySelector("h3")?.textContent?.trim() || "";
      return leftName.localeCompare(rightName);
    })
    .forEach((card) => grid.appendChild(card));
}

renderActiveToolsList();
sortPlannedCardsAlphabetically();
