/*
Toolbox Aid
David Quesenberry
04/14/2026
selectors.js
*/
import { normalizeRecord } from "../data/index.js";
import { readState } from "./guards.js";

export function getState(source) {
  return readState(source, null);
}

export function getSimulationState(source) {
  const state = normalizeRecord(getState(source), null);
  if (!state) {
    return null;
  }
  return normalizeRecord(state.simulationState, normalizeRecord(state.simulation, null));
}

export function getReplayState(source) {
  const state = normalizeRecord(getState(source), null);
  if (!state) {
    return null;
  }
  return normalizeRecord(state.replayState, normalizeRecord(state.replay, null));
}

export function getEditorState(source) {
  const state = normalizeRecord(getState(source), null);
  if (!state) {
    return null;
  }
  return normalizeRecord(state.editorState, normalizeRecord(state.editor, null));
}
