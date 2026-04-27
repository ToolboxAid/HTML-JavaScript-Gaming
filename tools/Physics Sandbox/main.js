import { integrateVelocity2D, stepArcadeBody } from "../../src/engine/physics/index.js";
import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
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
  runButton: document.getElementById("runPhysicsStepButton"),
  statusText: document.getElementById("physicsSandboxStatus"),
  input: document.getElementById("physicsBodyInput"),
  output: document.getElementById("physicsSandboxOutput")
};

let disposeInteractionFlow = null;
let initialized = false;

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

function parseBody() {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return null;
  }
  const parsed = safeParseJson(refs.input.value);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  return { ...parsed };
}

function extractPhysicsBodyFromPreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== "object") {
    return null;
  }
  const payload = rawPreset.payload && typeof rawPreset.payload === "object"
    ? rawPreset.payload
    : rawPreset;
  const config = payload.config && typeof payload.config === "object"
    ? payload.config
    : null;
  const payloadBody = payload?.physicsBody;
  if (payloadBody && typeof payloadBody === "object" && !Array.isArray(payloadBody)) {
    return { ...payloadBody };
  }
  const configBody = config?.physicsBody;
  if (configBody && typeof configBody === "object" && !Array.isArray(configBody)) {
    return { ...configBody };
  }
  const directBody = rawPreset?.physicsBody;
  if (directBody && typeof directBody === "object" && !Array.isArray(directBody)) {
    return { ...directBody };
  }
  return null;
}

async function tryLoadPresetFromQuery() {
  const searchParams = new URLSearchParams(window.location.search);
  const samplePresetPath = normalizeSamplePresetPath(searchParams.get("samplePresetPath") || "");
  const launchQuery = getToolLoadQuerySnapshot(searchParams);
  logToolLoadRequest({
    toolId: "physics-sandbox",
    sampleId: String(searchParams.get("sampleId") || "").trim(),
    samplePresetPath,
    requestedDataPaths: getToolLoadRequestedDataPaths(launchQuery),
    launchQuery
  });
  if (!samplePresetPath) {
    logToolLoadWarning({
      toolId: "physics-sandbox",
      reason: "samplePresetPath missing",
      launchQuery
    });
    return;
  }

  const sampleId = String(searchParams.get("sampleId") || "").trim();
  try {
    const presetUrl = new URL(samplePresetPath, window.location.href);
    const presetHref = presetUrl.toString();
    logToolLoadFetch({
      toolId: "physics-sandbox",
      phase: "attempt",
      fetchUrl: presetHref,
      requestedPath: samplePresetPath,
      pathSource: "tool-input:query.samplePresetPath"
    });
    const response = await fetch(presetHref, { cache: "no-store" });
    logToolLoadFetch({
      toolId: "physics-sandbox",
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
      toolId: "physics-sandbox",
      sampleId,
      samplePresetPath,
      fetchUrl: presetHref,
      loaded: summarizeToolLoadData(rawPreset)
    });
    const body = extractPhysicsBodyFromPreset(rawPreset);
    if (!body) {
      throw new Error("Preset payload did not include physicsBody.");
    }
    if (!(refs.input instanceof HTMLTextAreaElement)) {
      throw new Error("Physics body input is unavailable.");
    }
    refs.input.value = toPrettyJson(body);
    setStatus(buildPresetLoadedStatus(sampleId, samplePresetPath));
  } catch (error) {
    logToolLoadWarning({
      toolId: "physics-sandbox",
      sampleId,
      samplePresetPath,
      error: error instanceof Error ? error.message : "unknown error"
    });
    setStatus(`Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

function runStep() {
  const body = parseBody();
  if (!body) {
    setStatus("Input JSON is invalid. Provide a body object.");
    return;
  }

  const dt = Number(body.dt) > 0 ? Number(body.dt) : 1 / 60;
  const stepped = stepArcadeBody(body, dt);
  const integrated = integrateVelocity2D(stepped, dt);
  if (refs.output instanceof HTMLElement) {
    refs.output.textContent = toPrettyJson({
      dt,
      body: integrated
    });
  }
  setStatus(`Step complete at dt=${dt.toFixed(4)}.`);
}

function bootPhysicsSandbox() {
  if (initialized) {
    return {
      runStep
    };
  }
  if (refs.runButton instanceof HTMLButtonElement) {
    refs.runButton.addEventListener("click", runStep);
  }
  disposeInteractionFlow = setupDebugToolInteractionFlow({
    primaryButton: refs.runButton,
    escapeAction: () => {
      if (refs.output instanceof HTMLElement) {
        refs.output.textContent = "Run a step to inspect updated body state.";
      }
      setStatus("Sandbox reset to ready state.");
    },
    statusElement: refs.statusText
  });
  if (refs.input instanceof HTMLTextAreaElement && !refs.input.value.trim()) {
    refs.input.value = toPrettyJson({
      x: 0,
      y: 0,
      velocityX: 100,
      velocityY: 0,
      accelerationX: -10,
      accelerationY: 0,
      dragX: 12,
      dragY: 0,
      maxSpeedX: 140,
      maxSpeedY: 140
    });
  }
  void tryLoadPresetFromQuery();
  initialized = true;
  return {
    runStep
  };
}

registerToolBootContract("physics-sandbox", {
  init: bootPhysicsSandbox,
  destroy() {
    if (typeof disposeInteractionFlow === "function") {
      disposeInteractionFlow();
      disposeInteractionFlow = null;
    }
    return true;
  },
  getApi() {
    return { runStep };
  }
});

bootPhysicsSandbox();
