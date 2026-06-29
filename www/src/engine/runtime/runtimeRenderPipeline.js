/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeRenderPipeline.js
*/

export const RUNTIME_RENDER_PIPELINE_ERRORS = Object.freeze({
  RENDER_STATE_INVALID: "RUNTIME_RENDER_STATE_INVALID",
  OBJECTS_INVALID: "RUNTIME_RENDER_OBJECTS_INVALID",
});

export function renderRuntimeFrame(renderState, runtimeObjects) {
  const errors = [];

  if (!renderState || !Number.isInteger(renderState.width) || !Number.isInteger(renderState.height)) {
    errors.push(createRenderPipelineError(RUNTIME_RENDER_PIPELINE_ERRORS.RENDER_STATE_INVALID, "Render pipeline requires renderState.", "renderState"));
  }

  if (!Array.isArray(runtimeObjects)) {
    errors.push(createRenderPipelineError(RUNTIME_RENDER_PIPELINE_ERRORS.OBJECTS_INVALID, "Render pipeline requires runtimeObjects array.", "runtimeObjects"));
  }

  if (errors.length > 0) {
    return createRenderPipelineResult({ renderState: null, errors });
  }

  const commands = runtimeObjects.map((runtimeObject) => Object.freeze({
    command: "drawRuntimeObject",
    instanceId: runtimeObject.instanceId,
    geometryRef: runtimeObject.geometryRef,
    x: runtimeObject.position.x,
    y: runtimeObject.position.y,
    width: runtimeObject.size.width,
    height: runtimeObject.size.height,
  }));

  return createRenderPipelineResult({
    renderState: Object.freeze({
      ...renderState,
      frame: renderState.frame + 1,
      commands: Object.freeze(commands),
    }),
    errors,
  });
}

function createRenderPipelineResult({ renderState, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    renderState,
    errors: Object.freeze(errors),
  });
}

function createRenderPipelineError(code, message, path) {
  return Object.freeze({ code, message, path });
}
