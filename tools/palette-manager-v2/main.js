import { isPlainObject } from '../../src/shared/objects.js';
import { PaletteUsageService } from "../common/PaletteUsageService.js";
import { PaletteSortService } from "../common/PaletteSortService.js";
import { PaletteManagerApp } from "./modules/PaletteManagerApp.js";

const PALETTE_MANAGER_V2_TOOL_SESSION_KEY = "workspace.tools.palette-manager-v2";
const WORKSPACE_RETURN_HISTORY_CONTEXT_KEY = "workspace-manager-v2-return-history-context-id";

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

function readSessionJson(key) {
  const rawValue = window.sessionStorage.getItem(key);
  if (!rawValue) {
    return { ok: false, message: `${key} was not found in sessionStorage.` };
  }
  try {
    const value = JSON.parse(rawValue);
    return isPlainObject(value)
      ? { ok: true, value }
      : { ok: false, message: `${key} must contain a JSON object.` };
  } catch (error) {
    return { ok: false, message: `${key} contains invalid JSON: ${error.message}` };
  }
}

function readWorkspacePaletteToolSession() {
  const result = readSessionJson(PALETTE_MANAGER_V2_TOOL_SESSION_KEY);
  if (!result.ok) {
    return result;
  }
  const session = result.value;
  if (!isPlainObject(session.data) || !Array.isArray(session.data.swatches)) {
    return { ok: false, message: `${PALETTE_MANAGER_V2_TOOL_SESSION_KEY}.data.swatches must contain the active workspace palette.` };
  }
  if (!isPlainObject(session.dirty)) {
    return { ok: false, message: `${PALETTE_MANAGER_V2_TOOL_SESSION_KEY}.dirty must contain dirty tracking.` };
  }
  return { ok: true, session };
}

function createWorkspacePaletteSessionPersistence() {
  const launchParams = getWorkspaceLaunchParams();
  if (!launchParams.isWorkspaceLaunch) {
    return null;
  }
  return {
    save(paletteValue, changedKeys = []) {
      const result = readWorkspacePaletteToolSession();
      if (!result.ok) {
        return result;
      }
      const session = result.session;
      const uniqueChangedKeys = Array.from(new Set((Array.isArray(changedKeys) ? changedKeys : [])
        .map((key) => String(key || "").trim())
        .filter(Boolean)));
      const nextSession = {
        ...session,
        data: {
          ...session.data,
          swatches: Array.isArray(paletteValue?.swatches) ? paletteValue.swatches : []
        },
        dirty: {
          isDirty: true,
          reason: "palette-updated",
          changedAt: new Date().toISOString(),
          changedKeys: uniqueChangedKeys.length ? uniqueChangedKeys : ["data.swatches"]
        }
      };
      window.sessionStorage.setItem(PALETTE_MANAGER_V2_TOOL_SESSION_KEY, JSON.stringify(nextSession));
      return { ok: true, key: PALETTE_MANAGER_V2_TOOL_SESSION_KEY, session: nextSession };
    }
  };
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

function returnToWorkspace(hostContextId) {
  const targetUrl = workspaceManagerUrl(hostContextId);
  if (window.sessionStorage.getItem(WORKSPACE_RETURN_HISTORY_CONTEXT_KEY) === hostContextId
    && window.history.length > 1) {
    window.history.back();
    return;
  }
  window.location.href = targetUrl;
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
      returnToWorkspace(launchParams.hostContextId);
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
  const sessionResult = readWorkspacePaletteToolSession();
  if (!sessionResult.ok) {
    app.rejectImport([sessionResult.message], "Workspace palette load failed.");
    return;
  }
  const palettePayload = sessionResult.session.data;
  app.importPaletteDocument({
    name: palettePayload.name || "Workspace Palette",
    source: palettePayload.source || palettePayload.sourceId || palettePayload.name || "Workspace Manager V2",
    swatches: palettePayload.swatches
  }, {
    failureStatus: "Workspace palette load failed.",
    persistWorkspaceSession: false,
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
    usageService: new PaletteUsageService(),
    workspaceSessionPersistence: createWorkspacePaletteSessionPersistence()
  });
  app.init();
  configureWorkspaceNav();
  window.paletteManagerV2App = app.getPublicApi();
  loadWorkspacePalette(app);
  void loadSamplePresetFromUrl(app);
} catch (error) {
  reportBootstrapError(error);
}
