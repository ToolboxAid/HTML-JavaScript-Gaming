import { ACTIVE_PROJECT_STORAGE_KEY } from "../shared/projectManifestContract.js";
import {
  createStateInspectorSnapshot,
  safeParseJson,
  toPrettyJson
} from "../shared/debugInspectorData.js";
import { readToolHostSharedContextFromLocation } from "../shared/toolHostSharedContext.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";
import {
  getToolLoadQuerySnapshot,
  getToolLoadRequestedDataPaths,
  summarizeToolLoadData,
  logToolLoadRequest,
  logToolLoadFetch,
  logToolLoadLoaded,
  logToolLoadWarning
} from "../shared/toolLoadDiagnostics.js";
import { setupDebugToolInteractionFlow } from "../shared/debugToolInteractionFlow.js";

const refs = {
  refreshButton: document.getElementById("refreshSnapshotButton"),
  loadJsonButton: document.getElementById("loadJsonButton"),
  statusText: document.getElementById("stateInspectorStatus"),
  input: document.getElementById("stateJsonInput"),
  output: document.getElementById("stateSnapshotOutput")
};

const state = {
  snapshot: null
};

let disposeInteractionFlow = null;

function normalizeSamplePresetPath(pathValue) {
  if (typeof pathValue !== "string") {
    return "";
  }
  const trimmed = pathValue.trim().replace(/\\/g, "/");
  if (!trimmed || trimmed.includes("..")) {
    return "";
  }
  if (trimmed.startsWith("/samples/")) {
    return trimmed;
  }
  if (trimmed.startsWith("./samples/")) {
    return trimmed;
  }
  if (trimmed.startsWith("samples/")) {
    return `./${trimmed}`;
  }
  return "";
}

function buildPresetLoadedStatus(sampleId, samplePresetPath) {
  const normalizedSampleId = typeof sampleId === "string" ? sampleId.trim() : "";
  if (normalizedSampleId) {
    return `Loaded preset from sample ${normalizedSampleId}.`;
  }
  const normalizedPath = typeof samplePresetPath === "string" ? samplePresetPath.trim() : "";
  return normalizedPath ? `Loaded preset from ${normalizedPath}.` : "Loaded preset.";
}

function setStatus(message) {
  if (refs.statusText instanceof HTMLElement) {
    refs.statusText.textContent = message;
  }
}

function emitManualJsonDiagnostic(classification, details = {}) {
  if (typeof console === "undefined") {
    return;
  }
  const writer = typeof console.debug === "function" ? console.debug : console.log;
  writer.call(console, "[state-inspector:manual-json]", {
    classification,
    ...details
  });
}

function isManualJsonInputEmpty() {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return true;
  }
  return refs.input.value.trim().length === 0;
}

function updateInspectJsonActionState() {
  if (!(refs.loadJsonButton instanceof HTMLButtonElement)) {
    return;
  }
  const manualJsonEmpty = isManualJsonInputEmpty();
  refs.loadJsonButton.disabled = manualJsonEmpty;
  refs.loadJsonButton.title = manualJsonEmpty
    ? "Paste JSON into JSON Input to inspect manual payloads."
    : "";
}

function clearRoutedPayloadQueryParam() {
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(window.location.href);
  if (!url.searchParams.has("inspectPayloadKey")) {
    return;
  }
  url.searchParams.delete("inspectPayloadKey");
  window.history.replaceState({}, "", url.toString());
}

function readRoutedInspectionPayload() {
  if (typeof window === "undefined") {
    return null;
  }
  const params = new URLSearchParams(window.location.search);
  const payloadId = params.get("inspectPayloadKey");
  if (!payloadId) {
    return null;
  }
  const storageKey = `toolboxaid.viewerPayload.${String(payloadId).trim()}`;
  let raw = null;
  try {
    raw = window.sessionStorage.getItem(storageKey);
    if (raw) {
      window.sessionStorage.removeItem(storageKey);
    }
  } catch {
    raw = null;
  }
  if (!raw) {
    try {
      raw = window.localStorage.getItem(storageKey);
      if (raw) {
        window.localStorage.removeItem(storageKey);
      }
    } catch {
      raw = null;
    }
  }

  clearRoutedPayloadQueryParam();
  const parsed = safeParseJson(raw);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  const payload = parsed.payload && typeof parsed.payload === "object"
    ? parsed.payload
    : parsed;
  return payload && typeof payload === "object" ? payload : null;
}

function readStorageEntries(storageLike, prefix = "") {
  const entries = [];
  if (!storageLike || typeof storageLike.length !== "number") {
    return entries;
  }

  for (let index = 0; index < storageLike.length; index += 1) {
    const key = storageLike.key(index);
    if (!key || (prefix && !key.startsWith(prefix))) {
      continue;
    }
    const value = storageLike.getItem(key);
    entries.push({
      key,
      value: typeof value === "string" ? value : ""
    });
  }

  entries.sort((left, right) => left.key.localeCompare(right.key));
  return entries;
}

function readProjectManifest() {
  try {
    const raw = window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return safeParseJson(raw);
  } catch {
    return null;
  }
}

function readBootRegistryKeys() {
  const registry = globalThis.__TOOLS_BOOT_CONTRACT_REGISTRY__;
  if (!registry || typeof registry !== "object") {
    return [];
  }
  return Object.keys(registry).sort((left, right) => left.localeCompare(right));
}

function buildLiveSnapshot() {
  const hostContext = readToolHostSharedContextFromLocation(window.location);
  const localStorageEntries = readStorageEntries(window.localStorage, "toolboxaid.");
  const sessionStorageEntries = readStorageEntries(window.sessionStorage, "toolboxaid.");
  const hosted = new URLSearchParams(window.location.search).get("hosted") === "1";
  return createStateInspectorSnapshot({
    hosted,
    toolId: "state-inspector",
    hostContext,
    projectManifest: readProjectManifest(),
    localStorageEntries,
    sessionStorageEntries,
    bootRegistryKeys: readBootRegistryKeys(),
    notes: "Read-only snapshot generated by State Inspector."
  });
}

function extractSnapshotFromSamplePreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== "object") {
    return null;
  }
  const payload = rawPreset.payload && typeof rawPreset.payload === "object"
    ? rawPreset.payload
    : rawPreset;
  if (payload.snapshot && typeof payload.snapshot === "object") {
    return payload.snapshot;
  }
  if (payload.inspectJson && typeof payload.inspectJson === "object") {
    return payload.inspectJson;
  }
  if (payload.stateSnapshot && typeof payload.stateSnapshot === "object") {
    return payload.stateSnapshot;
  }
  if (payload.schema && typeof payload.schema === "string" && payload.schema.includes("snapshot")) {
    return payload;
  }
  return null;
}

async function tryLoadPresetFromQuery() {
  const searchParams = new URLSearchParams(window.location.search);
  const samplePresetPath = normalizeSamplePresetPath(searchParams.get("samplePresetPath") || "");
  const launchQuery = getToolLoadQuerySnapshot(searchParams);
  logToolLoadRequest({
    toolId: "state-inspector",
    sampleId: String(searchParams.get("sampleId") || "").trim(),
    samplePresetPath,
    requestedDataPaths: getToolLoadRequestedDataPaths(launchQuery),
    launchQuery
  });
  if (!samplePresetPath) {
    logToolLoadWarning({
      toolId: "state-inspector",
      reason: "samplePresetPath missing",
      launchQuery
    });
    return false;
  }
  const sampleId = String(searchParams.get("sampleId") || "").trim();
  try {
    const presetUrl = new URL(samplePresetPath, window.location.href);
    const presetHref = presetUrl.toString();
    logToolLoadFetch({
      toolId: "state-inspector",
      phase: "attempt",
      fetchUrl: presetHref,
      requestedPath: samplePresetPath,
      pathSource: "tool-input:query.samplePresetPath"
    });
    const response = await fetch(presetHref, { cache: "no-store" });
    logToolLoadFetch({
      toolId: "state-inspector",
      phase: "response",
      fetchUrl: presetHref,
      requestedPath: samplePresetPath,
      pathSource: "tool-input:query.samplePresetPath",
      status: response.status,
      ok: response.ok
    });
    if (!response.ok) {
      throw new Error(`Preset request failed (${response.status}).`);
    }
    const rawPreset = await response.json();
    logToolLoadLoaded({
      toolId: "state-inspector",
      sampleId,
      samplePresetPath,
      fetchUrl: presetHref,
      loaded: summarizeToolLoadData(rawPreset)
    });
    const snapshot = extractSnapshotFromSamplePreset(rawPreset);
    if (!snapshot) {
      throw new Error("Preset payload did not include an inspector snapshot payload.");
    }
    if (refs.input instanceof HTMLTextAreaElement) {
      refs.input.value = toPrettyJson(snapshot);
    }
    renderSnapshot(snapshot);
    setStatus(buildPresetLoadedStatus(sampleId, samplePresetPath));
    return true;
  } catch (error) {
    logToolLoadWarning({
      toolId: "state-inspector",
      sampleId,
      samplePresetPath,
      error: error instanceof Error ? error.message : "unknown error"
    });
    setStatus(`Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
    return false;
  }
}

function renderSnapshot(snapshot) {
  state.snapshot = snapshot;
  if (refs.output instanceof HTMLElement) {
    refs.output.textContent = toPrettyJson(snapshot);
  }

  const localCount = snapshot?.storage?.localCount ?? 0;
  const sessionCount = snapshot?.storage?.sessionCount ?? 0;
  const bootCount = snapshot?.bootContracts?.count ?? 0;
  updateInspectJsonActionState();
  setStatus(`Snapshot ready. local=${localCount}, session=${sessionCount}, bootContracts=${bootCount}.`);
}

function refreshSnapshot() {
  renderSnapshot(buildLiveSnapshot());
}

function inspectInputJson() {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return;
  }
  const inputText = refs.input.value;
  if (inputText.trim().length === 0) {
    emitManualJsonDiagnostic("manual-json-empty", {
      hasSnapshot: Boolean(state.snapshot)
    });
    setStatus(state.snapshot
      ? "Manual JSON input is empty. Inspection Snapshot is still valid; paste JSON to inspect manual payloads."
      : "Manual JSON input is empty. Paste valid JSON to inspect manual payloads.");
    return;
  }
  const parsed = safeParseJson(inputText);
  if (!parsed || typeof parsed !== "object") {
    emitManualJsonDiagnostic("invalid-json", {
      hasSnapshot: Boolean(state.snapshot)
    });
    setStatus(state.snapshot
      ? "Manual JSON input is invalid. Inspection Snapshot remains unchanged."
      : "Manual JSON input is invalid. Paste valid JSON to inspect.");
    return;
  }
  renderSnapshot(parsed);
  emitManualJsonDiagnostic("manual-json-success", {
    hasSnapshot: Boolean(state.snapshot)
  });
  setStatus("Custom JSON payload loaded into inspector view.");
}

function bindEvents() {
  if (refs.refreshButton instanceof HTMLButtonElement) {
    refs.refreshButton.addEventListener("click", refreshSnapshot);
  }
  if (refs.loadJsonButton instanceof HTMLButtonElement) {
    refs.loadJsonButton.addEventListener("click", inspectInputJson);
  }
  if (refs.input instanceof HTMLTextAreaElement) {
    refs.input.addEventListener("input", updateInspectJsonActionState);
  }
}

let initialized = false;

const stateInspectorApi = {
  captureProjectState() {
    return {
      input: refs.input instanceof HTMLTextAreaElement ? refs.input.value : "",
      snapshot: state.snapshot
    };
  },
  applyProjectState(snapshot) {
    if (refs.input instanceof HTMLTextAreaElement && typeof snapshot?.input === "string") {
      refs.input.value = snapshot.input;
    }
    if (snapshot?.snapshot && typeof snapshot.snapshot === "object") {
      renderSnapshot(snapshot.snapshot);
      return true;
    }
    refreshSnapshot();
    return true;
  }
};

function bootStateInspector() {
  if (!initialized) {
    bindEvents();
    updateInspectJsonActionState();
    disposeInteractionFlow = setupDebugToolInteractionFlow({
      primaryButton: refs.refreshButton,
      escapeAction: refreshSnapshot,
      statusElement: refs.statusText
    });
    const routedPayload = readRoutedInspectionPayload();
    if (routedPayload) {
      if (refs.input instanceof HTMLTextAreaElement) {
        refs.input.value = toPrettyJson(routedPayload);
      }
      renderSnapshot(routedPayload);
      setStatus("Imported JSON payload loaded into inspector view.");
    } else {
      void tryLoadPresetFromQuery().then((loaded) => {
        if (!loaded) {
          refreshSnapshot();
        }
      });
    }
    initialized = true;
  }
  window.stateInspectorApp = stateInspectorApi;
  return stateInspectorApi;
}

registerToolBootContract("state-inspector", {
  init: bootStateInspector,
  destroy() {
    if (typeof disposeInteractionFlow === "function") {
      disposeInteractionFlow();
      disposeInteractionFlow = null;
    }
    return true;
  },
  getApi() {
    return window.stateInspectorApp || null;
  }
});

bootStateInspector();
