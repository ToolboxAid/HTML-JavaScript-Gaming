function asObject(value) {
  return value && typeof value === 'object' ? value : null;
}

function getState(source) {
  if (!source || typeof source.getState !== 'function') return null;
  return source.getState();
}

function getSimulationState(source) {
  const state = asObject(getState(source));
  if (!state) return null;
  return asObject(state.simulationState) || asObject(state.simulation);
}

function getReplayState(source) {
  const state = asObject(getState(source));
  if (!state) return null;
  return asObject(state.replayState) || asObject(state.replay);
}

function getEditorState(source) {
  const state = asObject(getState(source));
  if (!state) return null;
  return asObject(state.editorState) || asObject(state.editor);
}

export {
  getState,
  getSimulationState,
  getReplayState,
  getEditorState
};
