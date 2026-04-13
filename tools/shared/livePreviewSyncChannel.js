export const LIVE_PREVIEW_CHANNEL_NAME = "toolboxaid.livePreviewSync.v1";
const LIVE_PREVIEW_STORAGE_KEY = "__toolboxaid_live_preview_sync_v1__";
const VALID_EVENT_TYPES = new Set([
  "update",
  "tool-live-preview-sync",
  "runtime-state-binding"
]);

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toMessageEnvelope(sourceId, payload, eventType) {
  const normalizedEventType = sanitizeText(eventType) || "update";
  return {
    channel: LIVE_PREVIEW_CHANNEL_NAME,
    sourceId: sanitizeText(sourceId) || "unknown-source",
    eventType: VALID_EVENT_TYPES.has(normalizedEventType) ? normalizedEventType : "update",
    updatedAt: Date.now(),
    payload
  };
}

function hasObjectField(payload, key) {
  return payload
    && Object.prototype.hasOwnProperty.call(payload, key)
    && payload[key]
    && typeof payload[key] === "object";
}

function hasRuntimeState(payload) {
  return hasObjectField(payload, "runtimeState");
}

function hasToolStatePayload(payload) {
  return hasObjectField(payload, "tileMapDocument")
    || hasObjectField(payload, "parallaxDocument");
}

export function validateStateBindingPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { valid: false, reason: "payload must be an object." };
  }

  const toolId = sanitizeText(payload.toolId || "");
  if (!toolId) {
    return { valid: false, reason: "payload.toolId is required." };
  }

  if (!hasRuntimeState(payload) && !hasToolStatePayload(payload)) {
    return {
      valid: false,
      reason: "payload must include runtimeState, tileMapDocument, or parallaxDocument."
    };
  }

  if (hasRuntimeState(payload)) {
    const runtimeState = payload.runtimeState;
    const heroX = Number(runtimeState.heroX);
    const heroY = Number(runtimeState.heroY);
    const cameraX = Number(runtimeState.cameraX);
    const cameraY = Number(runtimeState.cameraY);
    if (
      !Number.isFinite(heroX)
      || !Number.isFinite(heroY)
      || !Number.isFinite(cameraX)
      || !Number.isFinite(cameraY)
    ) {
      return {
        valid: false,
        reason: "runtimeState requires finite hero/camera coordinates."
      };
    }
  }

  return { valid: true };
}

export function createLivePreviewSyncBridge(options = {}) {
  const sourceId = sanitizeText(options.sourceId) || "unknown-source";
  const onMessage = typeof options.onMessage === "function" ? options.onMessage : null;
  const localListeners = new Set();
  let channel = null;
  let disposed = false;
  let lastPayloadSignature = "";

  function dispatchMessage(envelope) {
    if (!envelope || disposed) {
      return;
    }
    if (envelope.sourceId === sourceId) {
      return;
    }
    if (onMessage) {
      onMessage(envelope.payload, envelope);
    }
    localListeners.forEach((listener) => {
      listener(envelope.payload, envelope);
    });
  }

  if (typeof BroadcastChannel === "function") {
    channel = new BroadcastChannel(LIVE_PREVIEW_CHANNEL_NAME);
    channel.addEventListener("message", (event) => {
      dispatchMessage(event?.data);
    });
  } else if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
    window.addEventListener("storage", (event) => {
      if (event.key !== LIVE_PREVIEW_STORAGE_KEY || typeof event.newValue !== "string" || !event.newValue) {
        return;
      }
      try {
        dispatchMessage(JSON.parse(event.newValue));
      } catch (_error) {
        // Ignore malformed storage payloads.
      }
    });
  }

  function publish(payload, eventType = "update") {
    if (disposed || !payload || typeof payload !== "object") {
      return { status: "ignored" };
    }
    const validation = validateStateBindingPayload(payload);
    if (!validation.valid) {
      return { status: "rejected", reason: validation.reason };
    }
    const signature = JSON.stringify(payload);
    if (signature === lastPayloadSignature) {
      return { status: "deduped" };
    }
    lastPayloadSignature = signature;

    const envelope = toMessageEnvelope(sourceId, payload, eventType);
    if (channel) {
      channel.postMessage(envelope);
    } else if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(LIVE_PREVIEW_STORAGE_KEY, JSON.stringify(envelope));
      } catch (_error) {
        // Best-effort storage bridge.
      }
    }
    return { status: "sent", envelope };
  }

  function subscribe(listener) {
    if (typeof listener !== "function") {
      return () => {};
    }
    localListeners.add(listener);
    return () => {
      localListeners.delete(listener);
    };
  }

  function dispose() {
    disposed = true;
    localListeners.clear();
    if (channel) {
      channel.close();
      channel = null;
    }
  }

  return {
    publish,
    subscribe,
    dispose
  };
}
