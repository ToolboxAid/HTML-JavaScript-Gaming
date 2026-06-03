import { getToolRegistry } from "./toolRegistry.js";
import { escapeHtml } from "../src/shared/string/strings.js";

const SAMPLES_INDEX_PATH = "/old_samples/index.html";
const SAMPLES_METADATA_PATH = "/old_samples/metadata/samples.index.metadata.json";

function toStandaloneHref(entryPoint) {
  const normalized = String(entryPoint || "").replace(/^\.?\/*/, "");
  return normalized ? `/tools/${normalized}` : "#";
}

function buildDocumentationLinks(tool) {
  const folder = String(tool.folderName || tool.path || "").trim();
  if (!folder) {
    return [];
  }
  return [
    { label: "How To Use", path: `${folder}/how_to_use.html` },
    { label: "Read Me", path: `${folder}/README.md` }
  ];
}

function buildCardLinks(tool, sampleCount) {
  const docs = buildDocumentationLinks(tool);
  const links = [...docs];
  if (Number.isInteger(sampleCount) && sampleCount > 0) {
    links.push({
      label: `Samples (${sampleCount})`,
      path: `${SAMPLES_INDEX_PATH}?tool=${encodeURIComponent(tool.id)}`
    });
  }
  const seen = new Set();
  return links.filter((entry) => {
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

function renderToolCard(tool, sampleCountByToolId) {
  const standaloneHref = toStandaloneHref(tool.entryPoint);
  const sampleCount = Number(sampleCountByToolId.get(tool.id) || 0);
  const cardLinks = buildCardLinks(tool, sampleCount);
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

function classifyToolGroup(toolId) {
  const workflowToolIds = new Set([
    "workspace-manager-v2"
  ]);
  const viewerToolIds = new Set([
    "3d-asset-viewer",
    "collision-inspector-v2",
    "storage-inspector-v2",
    "replay-visualizer",
    "performance-profiler"
  ]);
  const utilityToolIds = new Set([
    "asset-manager-v2",
    "asset-pipeline",
    "audio-sfx-playground-v2",
    "input-mapping-v2",
    "midi-studio-v2",
    "physics-sandbox",
    "text2speech-V2",
    "3d-json-payload"
  ]);
  if (workflowToolIds.has(toolId)) {
    return "workflow";
  }
  if (viewerToolIds.has(toolId)) {
    return "viewers";
  }
  if (utilityToolIds.has(toolId)) {
    return "utilities";
  }
  return "editors";
}

async function loadSampleCountByToolId() {
  const counts = new Map();
  try {
    const response = await fetch(SAMPLES_METADATA_PATH, { cache: "no-store" });
    if (!response.ok) {
      return counts;
    }
    const metadata = await response.json();
    const samples = Array.isArray(metadata?.samples) ? metadata.samples : [];
    for (const sample of samples) {
      if (String(sample?.phase || "").trim() === "20") {
        continue;
      }
      const hintedToolIds = new Set(
        (Array.isArray(sample?.toolHints) ? sample.toolHints : [])
          .map((toolId) => String(toolId || "").trim().toLowerCase())
          .filter(Boolean)
      );
      const presets = Array.isArray(sample?.roundtripToolPresets) ? sample.roundtripToolPresets : [];
      const countedToolIds = new Set();
      for (const preset of presets) {
        const toolId = String(preset?.toolId || "").trim().toLowerCase();
        const presetPath = String(preset?.presetPath || "").trim();
        if (!toolId) {
          continue;
        }
        if (!presetPath || !hintedToolIds.has(toolId) || countedToolIds.has(toolId)) {
          continue;
        }
        countedToolIds.add(toolId);
        counts.set(toolId, Number(counts.get(toolId) || 0) + 1);
      }
    }
    return counts;
  } catch {
    return counts;
  }
}

function renderActiveToolsList(sampleCountByToolId) {
  const workflowGrid = document.querySelector("[data-active-tools-workflow-grid]");
  const editorsGrid = document.querySelector("[data-active-tools-editors-grid]");
  const utilitiesGrid = document.querySelector("[data-active-tools-utilities-grid]");
  const viewersGrid = document.querySelector("[data-active-tools-viewers-grid]");
  if (!workflowGrid || !editorsGrid || !utilitiesGrid || !viewersGrid) {
    return;
  }
  const tools = getToolRegistry()
    .filter((entry) => entry.active === true)
    .filter((entry) => entry.visibleInToolsList === true)
    .filter((entry) => entry.id !== "state-inspector")
    .sort((left, right) => String(left.displayName || "").localeCompare(String(right.displayName || "")));

  const workflow = tools.filter((tool) => classifyToolGroup(tool.id) === "workflow").map((tool) => renderToolCard(tool, sampleCountByToolId));
  const editors = tools.filter((tool) => classifyToolGroup(tool.id) === "editors").map((tool) => renderToolCard(tool, sampleCountByToolId));
  const utilities = tools.filter((tool) => classifyToolGroup(tool.id) === "utilities").map((tool) => renderToolCard(tool, sampleCountByToolId));
  const viewers = tools.filter((tool) => classifyToolGroup(tool.id) === "viewers").map((tool) => renderToolCard(tool, sampleCountByToolId));

  workflowGrid.innerHTML = workflow.join("\n");
  editorsGrid.innerHTML = editors.join("\n");
  utilitiesGrid.innerHTML = utilities.join("\n");
  viewersGrid.innerHTML = viewers.join("\n");
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

async function initToolsIndex() {
  const sampleCountByToolId = await loadSampleCountByToolId();
  renderActiveToolsList(sampleCountByToolId);
  sortPlannedCardsAlphabetically();
}

void initToolsIndex();
