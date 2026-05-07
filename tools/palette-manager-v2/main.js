import { PaletteUsageService } from "../common/PaletteUsageService.js";
import { PaletteSortService } from "../common/PaletteSortService.js";
import { PaletteManagerApp } from "./modules/PaletteManagerApp.js";

function resolvePaletteSource() {
  const paletteSource = globalThis.paletteList;
  if (!paletteSource || !paletteSource.SOURCE_PALETTES) {
    throw new Error("src/engine/paletteList.js must load before Palette Manager V2.");
  }
  return paletteSource;
}

function reportBootstrapError(error) {
  const status = document.getElementById("paletteStatus");
  if (status) {
    status.textContent = error instanceof Error ? error.message : String(error);
  }
  console.error(error);
}

function normalizeSamplePresetPath(samplePresetPath) {
  const cleanPath = typeof samplePresetPath === "string"
    ? samplePresetPath.trim().replace(/\\/g, "/")
    : "";
  if (!cleanPath || cleanPath.includes("..") || !cleanPath.startsWith("/samples/")) {
    return "";
  }
  return cleanPath;
}

function getSamplePresetLabel(searchParams, samplePresetPath) {
  const sampleId = (searchParams.get("sampleId") || "").trim();
  const sampleTitle = (searchParams.get("sampleTitle") || "").trim();
  if (sampleId && sampleTitle) {
    return `sample ${sampleId} (${sampleTitle})`;
  }
  if (sampleId) {
    return `sample ${sampleId}`;
  }
  if (sampleTitle) {
    return sampleTitle;
  }
  return samplePresetPath;
}

function workspaceManagerUrl(hostContextId) {
  const url = new URL("../workspace-manager-v2/index.html", window.location.href);
  const searchParams = new URLSearchParams(window.location.search);
  if (hostContextId) {
    url.searchParams.set("hostContextId", hostContextId);
  }
  if (searchParams.get("workspaceMode")?.toLowerCase() === "uat") {
    url.searchParams.set("workspace", "uat");
  }
  return url.href;
}

function getWorkspaceLaunchParams() {
  const searchParams = new URLSearchParams(window.location.search);
  return {
    hostContextId: searchParams.get("hostContextId") || "",
    isWorkspaceLaunch: searchParams.get("launch") === "workspace"
      && searchParams.get("fromTool") === "workspace-manager-v2"
  };
}

function configureWorkspaceNav() {
  const launchParams = getWorkspaceLaunchParams();
  const toolNav = document.querySelector('[data-launch-mode-nav="tool"]');
  const workspaceNav = document.querySelector('[data-launch-mode-nav="workspace"]');
  const returnButton = document.getElementById("returnToWorkspaceButton");
  if (toolNav) {
    toolNav.hidden = launchParams.isWorkspaceLaunch;
  }
  if (workspaceNav) {
    workspaceNav.hidden = !launchParams.isWorkspaceLaunch;
  }
  if (returnButton) {
    returnButton.addEventListener("click", () => {
      window.location.href = workspaceManagerUrl(launchParams.hostContextId);
    });
  }
}

function loadWorkspacePalette(app) {
  const launchParams = getWorkspaceLaunchParams();
  if (!launchParams.isWorkspaceLaunch) {
    return;
  }
  if (!launchParams.hostContextId) {
    app.rejectImport(["Workspace Manager V2 launch did not include hostContextId."], "Workspace palette load failed.");
    return;
  }
  const rawValue = window.sessionStorage.getItem(launchParams.hostContextId);
  if (!rawValue) {
    app.rejectImport(["Workspace Manager V2 manifest was not found in sessionStorage."], "Workspace palette load failed.");
    return;
  }
  let workspaceManifest;
  try {
    workspaceManifest = JSON.parse(rawValue);
  } catch (error) {
    app.rejectImport([`Workspace Manager V2 manifest JSON is invalid: ${error.message}`], "Workspace palette load failed.");
    return;
  }
  const palettePayload = workspaceManifest?.tools?.["palette-manager-v2"];
  if (!palettePayload || !Array.isArray(palettePayload.swatches)) {
    app.rejectImport(["Workspace Manager V2 manifest is missing tools.palette-manager-v2.swatches."], "Workspace palette load failed.");
    return;
  }
  app.importPaletteDocument({
    name: palettePayload.name || "Workspace Palette",
    source: palettePayload.source || palettePayload.sourceId || palettePayload.name || "Workspace Manager V2",
    swatches: palettePayload.swatches
  }, {
    failureStatus: "Workspace palette load failed.",
    successStatus: `Loaded active workspace palette ${palettePayload.name || "Workspace Palette"}.`
  });
}

async function loadSamplePresetFromUrl(app) {
  const searchParams = new URLSearchParams(window.location.search);
  const samplePresetPath = searchParams.get("samplePresetPath");
  if (!samplePresetPath) {
    return;
  }

  const presetPath = normalizeSamplePresetPath(samplePresetPath);
  if (!presetPath) {
    app.rejectImport([`samplePresetPath is invalid: ${samplePresetPath}`], "Sample preset load failed.");
    return;
  }

  let response;
  try {
    response = await fetch(presetPath, { cache: "no-store" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    app.rejectImport([`Sample preset fetch failed for ${presetPath}: ${message}`], "Sample preset load failed.");
    return;
  }

  if (!response.ok) {
    app.rejectImport([`Sample preset fetch failed (${response.status}) for ${presetPath}.`], "Sample preset load failed.");
    return;
  }

  let documentValue;
  try {
    documentValue = await response.json();
  } catch {
    app.rejectImport([`Sample preset is not valid JSON: ${presetPath}.`], "Sample preset load failed.");
    return;
  }

  app.importPaletteDocument(documentValue, {
    failureStatus: "Sample preset load failed.",
    successStatus: `Loaded ${getSamplePresetLabel(searchParams, presetPath)} palette preset.`
  });
}

try {
  const app = new PaletteManagerApp({
    documentRef: document,
    paletteSource: resolvePaletteSource(),
    sortService: new PaletteSortService(),
    usageService: new PaletteUsageService()
  });
  app.init();
  configureWorkspaceNav();
  window.paletteManagerV2App = app.getPublicApi();
  loadWorkspacePalette(app);
  void loadSamplePresetFromUrl(app);
} catch (error) {
  reportBootstrapError(error);
}
