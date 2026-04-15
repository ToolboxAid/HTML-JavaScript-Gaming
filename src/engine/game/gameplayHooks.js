/*
Toolbox Aid
David Quesenberry
04/14/2026
gameplayHooks.js
*/
function resolveModeValue(modeOrState) {
  if (typeof modeOrState === 'string') {
    return modeOrState;
  }

  if (modeOrState && typeof modeOrState.getMode === 'function') {
    return modeOrState.getMode();
  }

  if (modeOrState && typeof modeOrState.mode === 'string') {
    return modeOrState.mode;
  }

  return '';
}

export function isGameplayModeActive(modeOrState, activeModes = ['playing']) {
  const mode = resolveModeValue(modeOrState);
  if (!mode) {
    return false;
  }

  const allowedModes = Array.isArray(activeModes) && activeModes.length > 0
    ? activeModes
    : ['playing'];
  return allowedModes.includes(mode);
}

export function runIfGameplayMode(modeOrState, callback, activeModes = ['playing']) {
  const mode = resolveModeValue(modeOrState);
  if (!isGameplayModeActive(mode, activeModes) || typeof callback !== 'function') {
    return { ran: false, mode, value: undefined };
  }

  const value = callback();
  return { ran: true, mode, value };
}
