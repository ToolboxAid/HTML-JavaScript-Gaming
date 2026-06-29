/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimePlayableLoop.js
*/

import { applyRuntimeEnvironmentEffects } from "./runtimeEnvironmentEffects.js";
import { applyRuntimeTerrainEffects } from "./runtimeTerrainEffects.js";
import { advanceRuntimeTick, createRuntimeTickLoop } from "./runtimeTickLoop.js";
import { processRuntimeCollisions } from "./runtimeCollisionProcessing.js";
import { processRuntimeMovement } from "./runtimeMovementProcessing.js";
import { renderRuntimeFrame } from "./runtimeRenderPipeline.js";
import { resolveRuntimeInputActions } from "./runtimeInputPipeline.js";

export const RUNTIME_PLAYABLE_LOOP_ERRORS = Object.freeze({
  WORLD_INVALID: "RUNTIME_PLAYABLE_WORLD_INVALID",
  TICK_INVALID: "RUNTIME_PLAYABLE_TICK_INVALID",
  INPUT_INVALID: "RUNTIME_PLAYABLE_INPUT_INVALID",
  ENVIRONMENT_INVALID: "RUNTIME_PLAYABLE_ENVIRONMENT_INVALID",
  TERRAIN_INVALID: "RUNTIME_PLAYABLE_TERRAIN_INVALID",
  MOVEMENT_INVALID: "RUNTIME_PLAYABLE_MOVEMENT_INVALID",
  COLLISION_INVALID: "RUNTIME_PLAYABLE_COLLISION_INVALID",
  RENDER_INVALID: "RUNTIME_PLAYABLE_RENDER_INVALID",
});

export function runRuntimePlayableFrame(world, inputEvents) {
  if (!world || typeof world !== "object" || Array.isArray(world)) {
    return createPlayableLoopResult({ world: null, frame: null, errors: [createPlayableLoopError(RUNTIME_PLAYABLE_LOOP_ERRORS.WORLD_INVALID, "Playable loop requires world.", "world")] });
  }

  const tickResult = world.tick
    ? advanceRuntimeTick(world.tick)
    : createRuntimeTickLoop({ fixedDeltaMs: world.fixedDeltaMs });

  if (!tickResult.valid) {
    return createPlayableLoopResult({ world: null, frame: null, errors: remapErrors(tickResult.errors, RUNTIME_PLAYABLE_LOOP_ERRORS.TICK_INVALID) });
  }

  const inputResult = resolveRuntimeInputActions(world.inputPipeline, inputEvents);

  if (!inputResult.valid) {
    return createPlayableLoopResult({ world: null, frame: null, errors: remapErrors(inputResult.errors, RUNTIME_PLAYABLE_LOOP_ERRORS.INPUT_INVALID) });
  }

  const inputObjects = applyInputActions(world.runtimeObjects, inputResult.actions);
  const environmentResult = applyRuntimeEnvironmentEffects(inputObjects, world.environmentForces, { deltaSeconds: tickResult.tick.deltaSeconds });

  if (!environmentResult.valid) {
    return createPlayableLoopResult({ world: null, frame: null, errors: remapErrors(environmentResult.errors, RUNTIME_PLAYABLE_LOOP_ERRORS.ENVIRONMENT_INVALID) });
  }

  const terrainResult = applyRuntimeTerrainEffects(environmentResult.runtimeObjects, world.terrainMaterials, world.terrainAssignments, { deltaSeconds: tickResult.tick.deltaSeconds });

  if (!terrainResult.valid) {
    return createPlayableLoopResult({ world: null, frame: null, errors: remapErrors(terrainResult.errors, RUNTIME_PLAYABLE_LOOP_ERRORS.TERRAIN_INVALID) });
  }

  const movementResult = processRuntimeMovement(terrainResult.runtimeObjects, { deltaSeconds: tickResult.tick.deltaSeconds });

  if (!movementResult.valid) {
    return createPlayableLoopResult({ world: null, frame: null, errors: remapErrors(movementResult.errors, RUNTIME_PLAYABLE_LOOP_ERRORS.MOVEMENT_INVALID) });
  }

  const collisionResult = processRuntimeCollisions(movementResult.runtimeObjects, world.terrainTiles);

  if (!collisionResult.valid) {
    return createPlayableLoopResult({ world: null, frame: null, errors: remapErrors(collisionResult.errors, RUNTIME_PLAYABLE_LOOP_ERRORS.COLLISION_INVALID) });
  }

  const renderResult = renderRuntimeFrame(world.renderState, collisionResult.runtimeObjects);

  if (!renderResult.valid) {
    return createPlayableLoopResult({ world: null, frame: null, errors: remapErrors(renderResult.errors, RUNTIME_PLAYABLE_LOOP_ERRORS.RENDER_INVALID) });
  }

  const nextWorld = Object.freeze({
    ...world,
    tick: tickResult.tick,
    runtimeObjects: collisionResult.runtimeObjects,
    renderState: renderResult.renderState,
  });

  return createPlayableLoopResult({
    world: nextWorld,
    frame: Object.freeze({
      tick: tickResult.tick,
      actions: inputResult.actions,
      collisions: collisionResult.collisions,
      renderCommands: renderResult.renderState.commands,
    }),
    errors: [],
  });
}

function applyInputActions(runtimeObjects, actions) {
  return runtimeObjects.map((runtimeObject) => {
    const action = actions.find((item) => item.targetInstanceId === runtimeObject.instanceId && item.velocity !== null);

    if (!action) {
      return runtimeObject;
    }

    return Object.freeze({
      ...runtimeObject,
      velocity: Object.freeze({
        x: action.velocity.x,
        y: action.velocity.y,
      }),
    });
  });
}

function createPlayableLoopResult({ world, frame, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    world,
    frame,
    errors: Object.freeze(errors),
  });
}

function createPlayableLoopError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function remapErrors(errors, code) {
  return errors.map((error) => createPlayableLoopError(code, error.message, error.path));
}
