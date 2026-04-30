import { getToolHostEntryById } from "./toolHostManifest.js";
import {
  removeToolHostSharedContextById,
  writeToolHostSharedContext
} from "./toolHostSharedContext.js";

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isParentJsonLike(value) {
  if (!isPlainObject(value)) {
    return false;
  }
  const documentKind = typeof value.documentKind === "string" ? value.documentKind.trim().toLowerCase() : "";
  const schema = typeof value.schema === "string" ? value.schema.trim().toLowerCase() : "";
  if (documentKind === "workspace-manifest" || schema === "html-js-gaming.project" || schema === "html-js-gaming.workspace") {
    return true;
  }
  return isPlainObject(value.tools);
}

function hasImplicitGlobalKey(value) {
  if (!isPlainObject(value)) {
    return false;
  }
  const blockedKeys = new Set([
    "launchparams",
    "sharedcontext",
    "hostcontextid",
    "hosttoolid",
    "hosted",
    "sampleid",
    "sampletitle",
    "samplepresetpath",
    "gameid",
    "gametitle",
    "gamehref",
    "workspacehref",
    "returnto",
    "state"
  ]);
  return Object.keys(value).some((key) => blockedKeys.has(String(key).trim().toLowerCase()));
}

function isWrapperJsonLike(value) {
  if (!isPlainObject(value)) {
    return false;
  }
  const keys = Object.keys(value).map((key) => String(key).trim().toLowerCase());
  if (keys.includes("payloadjson") || keys.includes("palettejson")) {
    return true;
  }
  if (keys.includes("wrapper") || keys.includes("wrapped")) {
    return true;
  }
  if (keys.includes("payload") && isPlainObject(value.payload)) {
    return true;
  }
  if (keys.includes("palette") && isPlainObject(value.palette)) {
    return true;
  }
  return false;
}

function hasFallbackAttempt(value) {
  const blockedPrefixes = ["default", "fallback", "tryloadpreset", "buildpreset"];
  const stack = [value];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!isPlainObject(node) && !Array.isArray(node)) {
      continue;
    }
    if (Array.isArray(node)) {
      node.forEach((entry) => stack.push(entry));
      continue;
    }
    Object.entries(node).forEach(([key, nestedValue]) => {
      const normalized = String(key).trim().toLowerCase();
      if (blockedPrefixes.some((prefix) => normalized.startsWith(prefix))) {
        throw new Error("launch contract violation: fallback attempt detected in input JSON.");
      }
      stack.push(nestedValue);
    });
  }
  return false;
}

function computeInputFingerprint(value, label) {
  try {
    return JSON.stringify(value);
  } catch {
    throw new Error(`launch contract violation: ${label} must be JSON-serializable.`);
  }
}

export function validateInput(payloadJson, paletteJson = null) {
  const payloadBefore = computeInputFingerprint(payloadJson, "payloadJson");
  const paletteBefore = paletteJson === null ? null : computeInputFingerprint(paletteJson, "paletteJson");
  if (!isPlainObject(payloadJson)) {
    throw new Error("launch contract violation: missing payloadJson object.");
  }
  if (paletteJson !== null && !isPlainObject(paletteJson)) {
    throw new Error("launch contract violation: paletteJson must be an object or null.");
  }
  if (isWrapperJsonLike(payloadJson) || (paletteJson !== null && isWrapperJsonLike(paletteJson))) {
    throw new Error("launch contract violation: wrapper JSON detected.");
  }
  if (isParentJsonLike(payloadJson) || (paletteJson !== null && isParentJsonLike(paletteJson))) {
    throw new Error("launch contract violation: parent JSON detected.");
  }
  if (hasImplicitGlobalKey(payloadJson) || (paletteJson !== null && hasImplicitGlobalKey(paletteJson))) {
    throw new Error("launch contract violation: implicit/global input keys detected.");
  }
  hasFallbackAttempt(payloadJson);
  if (paletteJson !== null) {
    hasFallbackAttempt(paletteJson);
  }
  const payloadAfter = computeInputFingerprint(payloadJson, "payloadJson");
  const paletteAfter = paletteJson === null ? null : computeInputFingerprint(paletteJson, "paletteJson");
  if (payloadBefore !== payloadAfter || paletteBefore !== paletteAfter) {
    throw new Error("launch contract violation: mutation detected during input validation.");
  }
}

function assertExplicitLaunchInputs({ toolId = "", argumentCount = 0 }) {
  const toolIdText = typeof toolId === "string" ? toolId.trim() : "";
  if (!toolIdText) {
    throw new Error("launch contract violation: toolId is required.");
  }
  if (argumentCount < 2 || argumentCount > 3) {
    throw new Error(`launch contract violation: launch(toolId, payloadJson, paletteJson?) expected 2-3 args, received ${argumentCount}.`);
  }
}

function buildHostLaunchUrl(toolEntry, hostContextId = "") {
  const url = new URL(toolEntry.launchPath, window.location.href);
  url.searchParams.set("hosted", "1");
  url.searchParams.set("hostToolId", toolEntry.id);
  if (hostContextId) {
    url.searchParams.set("hostContextId", hostContextId);
  }
  return url.toString();
}

function createHostFrame(toolEntry, sourceUrl) {
  const frame = document.createElement("iframe");
  frame.setAttribute("data-tool-host-frame", toolEntry.id);
  frame.setAttribute("title", `${toolEntry.displayName} Host Frame`);
  frame.setAttribute("loading", "eager");
  frame.src = sourceUrl;
  return frame;
}

function setFrameActive(frame, isActive) {
  if (!(frame instanceof HTMLIFrameElement)) {
    return;
  }
  frame.hidden = !isActive;
  frame.style.display = isActive ? "block" : "none";
  frame.setAttribute("aria-hidden", isActive ? "false" : "true");
}

function readToolDestroyContract(frameWindow, toolId) {
  if (!frameWindow || typeof frameWindow !== "object") {
    return null;
  }
  const registry = frameWindow.__TOOLS_BOOT_CONTRACT_REGISTRY__;
  if (!registry || typeof registry !== "object") {
    return null;
  }
  const contract = registry[toolId];
  if (!contract || typeof contract.destroy !== "function") {
    return null;
  }
  return contract.destroy.bind(contract);
}

export function createToolHostRuntime(options = {}) {
  const manifest = options.manifest;
  const mountContainer = options.mountContainer instanceof HTMLElement ? options.mountContainer : null;
  const onStatus = typeof options.onStatus === "function" ? options.onStatus : (() => {});
  const onMounted = typeof options.onMounted === "function" ? options.onMounted : (() => {});
  const onUnmounted = typeof options.onUnmounted === "function" ? options.onUnmounted : (() => {});

  let currentMount = null;
  let mountSequence = 0;
  const mountedByToolId = new Map();

  function getCurrentMount() {
    return currentMount ? { ...currentMount } : null;
  }

  function destroyMountRecord(record, reason = "manual") {
    if (!record) {
      return "not-available";
    }

    let destroyStatus = "not-available";
    try {
      const frameWindow = record.frame?.contentWindow ?? null;
      const destroyFn = readToolDestroyContract(frameWindow, record.tool.id);
      if (destroyFn) {
        const destroyResult = destroyFn({
          reason,
          hosted: true,
          source: "tool-host-runtime"
        });
        destroyStatus = destroyResult === false ? "failed" : "ok";
      }
    } catch {
      destroyStatus = "failed";
    }

    if (record.frame && record.frame.parentElement === mountContainer) {
      record.frame.removeAttribute("src");
      mountContainer.removeChild(record.frame);
    }
    if (record.hostContextId) {
      removeToolHostSharedContextById(record.hostContextId);
    }
    mountedByToolId.delete(record.tool.id);
    return destroyStatus;
  }

  function setActiveMount(record) {
    mountedByToolId.forEach((entry) => {
      setFrameActive(entry.frame, entry.tool.id === record?.tool?.id);
    });
    currentMount = record ? { ...record } : null;
  }

  function unmountCurrentTool(reason = "manual") {
    if (!currentMount) {
      onStatus("Tool host is idle.");
      return false;
    }

    const previous = mountedByToolId.get(currentMount.tool.id) || currentMount;
    currentMount = null;
    const destroyStatus = destroyMountRecord(previous, reason);
    onStatus(`Unmounted ${previous.tool.displayName} (${reason}, destroy=${destroyStatus}).`);
    onUnmounted(previous.tool, reason, destroyStatus);
    return true;
  }

  function clearMountedTools(reason = "manual") {
    let unmountedAny = false;
    let lastTool = null;
    let lastDestroyStatus = "not-available";
    const mountedEntries = [...mountedByToolId.values()];
    mountedEntries.forEach((entry) => {
      const destroyStatus = destroyMountRecord(entry, reason);
      unmountedAny = true;
      lastTool = entry.tool;
      lastDestroyStatus = destroyStatus;
    });
    currentMount = null;
    if (unmountedAny) {
      onUnmounted(lastTool, reason, lastDestroyStatus);
      onStatus(`Unmounted all hosted tools (${reason}).`);
    } else {
      onStatus("Tool host is idle.");
    }
    return unmountedAny;
  }

  function launch(toolId, payloadJson, paletteJson = null) {
    if (!mountContainer) {
      onStatus("Tool host container is unavailable.");
      return null;
    }

    assertExplicitLaunchInputs({
      toolId,
      argumentCount: arguments.length
    });
    validateInput(payloadJson, paletteJson);
    const toolIdText = typeof toolId === "string" ? toolId.trim() : "";
    const toolEntry = getToolHostEntryById(manifest, toolIdText);
    if (!toolEntry) {
      onStatus(`Tool id not found: ${toolIdText || "(empty)"}.`);
      return null;
    }

    const existingMount = mountedByToolId.get(toolEntry.id) || null;
    if (existingMount) {
      setActiveMount(existingMount);
      onStatus(`Mounted ${toolEntry.displayName} (restored).`);
      onMounted(toolEntry, existingMount);
      return getCurrentMount();
    }

    mountSequence += 1;
    const sequenceId = mountSequence;
    const hostContext = writeToolHostSharedContext({
      toolId: toolEntry.id,
      source: "workspace-manager",
      requestedAt: new Date().toISOString(),
      sharedContext: {
        payloadJson,
        paletteJson
      },
      state: null
    });
    const hostContextId = hostContext?.contextId || "";
    const sourceUrl = buildHostLaunchUrl(toolEntry, hostContextId);
    const frame = createHostFrame(toolEntry, sourceUrl);
    frame.addEventListener("load", () => {
      if (!currentMount || currentMount.mountSequence !== sequenceId) {
        return;
      }
      currentMount.loadedAt = new Date().toISOString();
      onStatus(`Mounted ${toolEntry.displayName}.`);
    }, { once: true });
    frame.addEventListener("error", () => {
      if (!currentMount || currentMount.mountSequence !== sequenceId) {
        return;
      }
      currentMount.failedAt = new Date().toISOString();
      onStatus(`Failed to load ${toolEntry.displayName}.`);
    }, { once: true });

    if (mountedByToolId.size === 0) {
      mountContainer.replaceChildren(frame);
    } else {
      mountContainer.appendChild(frame);
    }
    const nextMount = {
      tool: toolEntry,
      frame,
      sourceUrl,
      mountedAt: new Date().toISOString(),
      mountSequence: sequenceId,
      hostContextId
    };
    mountedByToolId.set(toolEntry.id, nextMount);
    setActiveMount(nextMount);

    onStatus(`Mounting ${toolEntry.displayName}...`);
    onMounted(toolEntry, nextMount);
    return getCurrentMount();
  }

  window.addEventListener("beforeunload", () => {
    clearMountedTools("page-unload");
  });

  return {
    launch,
    unmountCurrentTool,
    clearMountedTools,
    getCurrentMount
  };
}
