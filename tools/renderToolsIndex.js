import { getToolRegistry } from "./toolRegistry.js";
import { escapeHtml } from "../src/shared/string/stringUtil.js";

function toStandaloneHref(entryPoint) {
  const normalized = String(entryPoint || "").replace(/^\.?\/*/, "");
  return normalized ? `/tools/${normalized}` : "#";
}

function toHostHref(toolId) {
  return `/tools/Workspace%20Manager/index.html?tool=${encodeURIComponent(toolId)}`;
}

function buildDocumentationLinks(tool) {
  const folder = String(tool.folderName || tool.path || "").trim();
  if (!folder) {
    return [];
  }
  return [
    { label: "README", path: `${folder}/README.md` },
    { label: "How To Use", path: `${folder}/how_to_use.html` }
  ];
}

function buildCardLinks(tool) {
  const existing = Array.isArray(tool.sampleEntryPoints) ? tool.sampleEntryPoints : [];
  const docs = buildDocumentationLinks(tool);
  const merged = [...docs, ...existing];
  const seen = new Set();
  return merged.filter((entry) => {
    const label = String(entry?.label || "").trim();
    const path = String(entry?.path || "").trim();
    if (!label || !path) {
      return false;
    }
    const key = `${label.toLowerCase()}|${path.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function renderToolCard(tool) {
  const standaloneHref = toStandaloneHref(tool.entryPoint);
  const cardLinks = buildCardLinks(tool);
  const sampleLinks = cardLinks.length > 0
    ? `
      <div class="meta">
        ${cardLinks.map((entry) => `
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
      ${sampleLinks}
    </div>
  `;
}

function renderWorkspaceManagerCard() {
  return `
    <div class="card tools-platform-card">
      <div class="meta">
        <span class="pill live">Workspace</span>
        <span class="pill planned">Manager</span>
      </div>
      <h3><a href="/tools/Workspace%20Manager/index.html">Workspace Manager</a></h3>
      <p>Shared hosted launcher for opening tools inside a managed workspace container.</p>
      <div class="meta">
        <a class="tools-platform-card__action" href="/tools/Workspace%20Manager/index.html">Open Workspace Manager</a>
        <a class="tools-platform-card__action tools-platform-card__action--secondary" href="Workspace Manager/README.md">README</a>
        <a class="tools-platform-card__action tools-platform-card__action--secondary" href="Workspace Manager/how_to_use.html">How To Use</a>
      </div>
    </div>
  `;
}

function renderWorkspaceManagerSection() {
  const grid = document.querySelector("[data-workspace-manager-grid]");
  if (!grid) {
    return;
  }
  grid.innerHTML = renderWorkspaceManagerCard();
}

function renderActiveToolsList() {
  const grid = document.querySelector("[data-active-tools-grid]");
  if (!grid) {
    return;
  }
  const toolCards = getToolRegistry()
    .filter((entry) => entry.active === true)
    .filter((entry) => entry.visibleInToolsList === true)
    .sort((left, right) => String(left.displayName || "").localeCompare(String(right.displayName || "")))
    .map((tool) => renderToolCard(tool));
  grid.innerHTML = toolCards.join("\n");
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

renderWorkspaceManagerSection();
renderActiveToolsList();
sortPlannedCardsAlphabetically();
