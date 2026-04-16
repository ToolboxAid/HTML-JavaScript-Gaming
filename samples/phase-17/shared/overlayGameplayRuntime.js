/*
Toolbox Aid
David Quesenberry
04/16/2026
overlayGameplayRuntime.js
*/

function normalizeRuntimeExtensionEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const overlayId = String(entry.overlayId || '').trim();
  const onStep = typeof entry.onStep === 'function' ? entry.onStep : null;
  const onRender = typeof entry.onRender === 'function' ? entry.onRender : null;
  if (!onStep && !onRender) {
    return null;
  }

  return Object.freeze({
    overlayId,
    onStep,
    onRender,
  });
}

function normalizeRuntimeExtensions(runtimeExtensions) {
  if (!Array.isArray(runtimeExtensions) || runtimeExtensions.length === 0) {
    return Object.freeze([]);
  }

  const normalized = [];
  for (let i = 0; i < runtimeExtensions.length; i += 1) {
    const candidate = normalizeRuntimeExtensionEntry(runtimeExtensions[i]);
    if (!candidate) {
      continue;
    }
    normalized.push(candidate);
  }
  return Object.freeze(normalized);
}

function shouldRunRuntimeExtension(extension, activeOverlayId) {
  if (!extension) {
    return false;
  }
  if (!extension.overlayId) {
    return true;
  }
  return extension.overlayId === activeOverlayId;
}

export function createOverlayGameplayRuntime({ runtimeExtensions = [] } = {}) {
  return {
    runtimeExtensions: normalizeRuntimeExtensions(runtimeExtensions),
  };
}

export function setOverlayGameplayRuntimeExtensions(runtime, runtimeExtensions) {
  if (!runtime) {
    return false;
  }
  runtime.runtimeExtensions = normalizeRuntimeExtensions(runtimeExtensions);
  return true;
}

export function stepOverlayGameplayRuntime(runtime, context = {}) {
  if (!runtime || !Array.isArray(runtime.runtimeExtensions) || runtime.runtimeExtensions.length === 0) {
    return 0;
  }

  const activeOverlayId = String(context.activeOverlayId || '').trim();
  let invoked = 0;
  for (let i = 0; i < runtime.runtimeExtensions.length; i += 1) {
    const extension = runtime.runtimeExtensions[i];
    if (!extension.onStep || !shouldRunRuntimeExtension(extension, activeOverlayId)) {
      continue;
    }
    try {
      extension.onStep(context);
      invoked += 1;
    } catch {
      // Runtime overlays must never break gameplay execution.
    }
  }
  return invoked;
}

export function renderOverlayGameplayRuntime(runtime, context = {}) {
  if (!runtime || !Array.isArray(runtime.runtimeExtensions) || runtime.runtimeExtensions.length === 0) {
    return 0;
  }

  const activeOverlayId = String(context.activeOverlayId || '').trim();
  let invoked = 0;
  for (let i = 0; i < runtime.runtimeExtensions.length; i += 1) {
    const extension = runtime.runtimeExtensions[i];
    if (!extension.onRender || !shouldRunRuntimeExtension(extension, activeOverlayId)) {
      continue;
    }
    try {
      extension.onRender(context);
      invoked += 1;
    } catch {
      // Runtime overlays must never break gameplay rendering.
    }
  }
  return invoked;
}
