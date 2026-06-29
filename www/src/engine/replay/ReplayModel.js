/*
Toolbox Aid
David Quesenberry
04/14/2026
ReplayModel.js
*/
import {
  SHARED_REPLAY_MODEL_CONTRACT_VERSION,
} from "../../shared/contracts/replayContracts.js";
import { cloneRuntimeValue } from "../../shared/runtime/snapshotClone.js";

function cloneOrNull(value) {
  return cloneRuntimeValue(value);
}

function cloneFrames(frames) {
  if (!Array.isArray(frames)) {
    return [];
  }
  const out = [];
  for (let i = 0; i < frames.length; i += 1) {
    out.push(cloneRuntimeValue(frames[i]));
  }
  return out;
}

function createReplayModel({ metadata = null, initialState = null } = {}) {
  return {
    version: SHARED_REPLAY_MODEL_CONTRACT_VERSION,
    metadata: cloneOrNull(metadata),
    initialState: cloneOrNull(initialState),
    frames: [],
    finalState: null,
  };
}

function normalizeReplayModel(input) {
  if (!input || typeof input !== "object") {
    return createReplayModel();
  }

  return {
    version: Number.isFinite(Number(input.version))
      ? Number(input.version)
      : SHARED_REPLAY_MODEL_CONTRACT_VERSION,
    metadata: cloneOrNull(input.metadata),
    initialState: cloneOrNull(input.initialState),
    frames: cloneFrames(input.frames),
    finalState: cloneOrNull(input.finalState),
  };
}

function withFinalState(replay, finalState = null) {
  const normalized = normalizeReplayModel(replay);
  normalized.finalState = cloneOrNull(finalState);
  return normalized;
}

export {
  createReplayModel,
  normalizeReplayModel,
  withFinalState,
};
