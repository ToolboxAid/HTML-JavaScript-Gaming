import {
  getToolProgressReadiness,
  getActiveToolRegistry,
  getToolRoute,
  toolRegistryMetadataDiagnostic
} from "../toolbox/toolRegistry.js";

const swatchByGroup = Object.freeze({
  AI: "swatch-purple",
  Audio: "swatch-orange",
  "Build/Create": "swatch-red",
  Design: "swatch-pink",
  Marketplace: "swatch-gold",
  Platform: "swatch-blue",
  Play: "swatch-green"
});

const progressBody = document.querySelector("[data-tools-progress-body]");
const progressSummary = document.querySelector("[data-tools-progress-summary]");
const nextBuildItem = document.querySelector("[data-tools-progress-next]");

function createCell(tagName, text) {
  const cell = document.createElement(tagName);
  cell.textContent = text;
  return cell;
}

export function createToolNameNode(tool) {
  const label = document.createElement("span");
  label.className = "content-cluster";
  const route = getToolRoute(tool);

  if (route) {
    const link = document.createElement("a");
    link.href = route;
    link.textContent = tool.displayName;
    link.dataset.toolsProgressRoute = route;
    label.append(link);
    return label;
  }

  const text = document.createElement("span");
  text.textContent = tool.displayName;

  const planned = document.createElement("span");
  planned.className = "pill";
  planned.textContent = `${tool.status || "Planned"} - Route pending`;

  label.append(text, planned);
  return label;
}

function createToolNameCell(tool) {
  const cell = document.createElement("td");
  cell.append(createToolNameNode(tool));
  return cell;
}

function createGroupCell(tool) {
  const cell = document.createElement("td");
  const label = document.createElement("span");
  label.className = "content-cluster";

  const swatch = document.createElement("span");
  swatch.className = `brand-color-swatch ${swatchByGroup[tool.category] || "swatch-blue"}`;
  swatch.setAttribute("role", "img");
  swatch.setAttribute("aria-label", `${tool.category} group color`);
  swatch.title = `${tool.category} color`;

  const text = document.createElement("span");
  text.textContent = tool.category;

  label.append(swatch, text);
  cell.append(label);
  return cell;
}

function createStatusCell(tool) {
  const cell = createCell("td", tool.status);
  const statusDiagnostic = toolRegistryMetadataDiagnostic(tool);
  if (statusDiagnostic) {
    const diagnostic = document.createElement("span");
    diagnostic.className = "status";
    diagnostic.dataset.toolsProgressStatusDiagnostic = tool.displayName;
    diagnostic.setAttribute("role", "status");
    diagnostic.textContent = statusDiagnostic;
    cell.append(diagnostic);
  }
  return cell;
}

function isComplete(tool) {
  return tool.readiness || getToolProgressReadiness(tool.status);
}

function firstIncompleteTool(tools) {
  return tools.find((tool) => isComplete(tool) !== "Yes") || null;
}

function renderToolsProgress() {
  if (!progressBody) {
    return;
  }

  const tools = getActiveToolRegistry();
  progressBody.replaceChildren();
  tools.forEach((tool) => {
    const row = document.createElement("tr");
    const statusDiagnostic = toolRegistryMetadataDiagnostic(tool);
    row.className = tool.colorGroup;
    row.dataset.toolsProgressTool = tool.displayName;
    row.dataset.toolsProgressOrder = String(tool.order);
    row.dataset.toolsProgressGroup = tool.category;
    row.dataset.toolsProgressColorGroup = tool.colorGroup;
    row.dataset.toolsProgressStatus = tool.status;
    row.dataset.toolsProgressComplete = isComplete(tool);
    if (statusDiagnostic) {
      row.dataset.toolsProgressStatusDiagnostic = statusDiagnostic;
    }
    row.append(
      createCell("td", String(tool.order)),
      createToolNameCell(tool),
      createGroupCell(tool),
      createStatusCell(tool),
      createCell("td", isComplete(tool))
    );
    progressBody.append(row);
  });

  if (nextBuildItem) {
    const nextTool = firstIncompleteTool(tools);
    nextBuildItem.textContent = `What should I build next for the platform? ${nextTool ? nextTool.displayName : "All active tools are complete."}`;
  }

  if (progressSummary) {
    const completeCount = tools.filter((tool) => isComplete(tool) === "Yes").length;
    progressSummary.textContent = `Tools Progress lists ${tools.length}/${tools.length} planned or active tools in intended build sequence. Complete: ${completeCount}/${tools.length}.`;
  }
}

renderToolsProgress();
