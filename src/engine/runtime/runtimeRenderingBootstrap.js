/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeRenderingBootstrap.js
*/

export const RUNTIME_RENDERING_BOOTSTRAP_ERRORS = Object.freeze({
  TARGET_ID_REQUIRED: "RUNTIME_RENDER_TARGET_ID_REQUIRED",
  WIDTH_INVALID: "RUNTIME_RENDER_WIDTH_INVALID",
  HEIGHT_INVALID: "RUNTIME_RENDER_HEIGHT_INVALID",
});

export function createRuntimeRenderingBootstrap({ targetId, width, height }) {
  const errors = [];

  if (!hasNonEmptyString(targetId)) {
    errors.push(createRenderBootstrapError(RUNTIME_RENDERING_BOOTSTRAP_ERRORS.TARGET_ID_REQUIRED, "Runtime rendering bootstrap requires targetId.", "targetId"));
  }

  if (!Number.isInteger(width) || width <= 0) {
    errors.push(createRenderBootstrapError(RUNTIME_RENDERING_BOOTSTRAP_ERRORS.WIDTH_INVALID, "Runtime rendering bootstrap requires positive integer width.", "width"));
  }

  if (!Number.isInteger(height) || height <= 0) {
    errors.push(createRenderBootstrapError(RUNTIME_RENDERING_BOOTSTRAP_ERRORS.HEIGHT_INVALID, "Runtime rendering bootstrap requires positive integer height.", "height"));
  }

  if (errors.length > 0) {
    return createRenderBootstrapResult({ renderState: null, errors });
  }

  return createRenderBootstrapResult({
    renderState: Object.freeze({
      targetId: targetId.trim(),
      width,
      height,
      frame: 0,
      commands: Object.freeze([]),
    }),
    errors,
  });
}

function createRenderBootstrapResult({ renderState, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    renderState,
    errors: Object.freeze(errors),
  });
}

function createRenderBootstrapError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
