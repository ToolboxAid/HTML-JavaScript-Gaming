/*
Toolbox Aid
David Quesenberry
04/16/2026
overlayCycleInput.js
*/
export const LEVEL17_OVERLAY_CYCLE_KEY = 'KeyG';
export const LEVEL17_OVERLAY_REVERSE_MODIFIERS = Object.freeze(['ShiftLeft', 'ShiftRight']);
export const LEVEL19_OVERLAY_RUNTIME_TOGGLE_MODIFIERS = Object.freeze(['ControlLeft', 'ControlRight']);
export const LEVEL19_OVERLAY_RUNTIME_CYCLE_MODIFIERS = LEVEL17_OVERLAY_REVERSE_MODIFIERS;
export const LEVEL17_OVERLAY_CYCLE_LABEL = 'G/Shift+G';

export function isOverlayCycleReverseModifierActive(input) {
  for (let i = 0; i < LEVEL17_OVERLAY_REVERSE_MODIFIERS.length; i += 1) {
    if (input?.isDown(LEVEL17_OVERLAY_REVERSE_MODIFIERS[i]) === true) {
      return true;
    }
  }
  return false;
}

export function getOverlayCycleInputCodes({ reverse = false } = {}) {
  if (!reverse) {
    return [LEVEL17_OVERLAY_CYCLE_KEY];
  }
  return [LEVEL17_OVERLAY_CYCLE_KEY, LEVEL17_OVERLAY_REVERSE_MODIFIERS[0]];
}

export function isOverlayRuntimeToggleModifierActive(input) {
  for (let i = 0; i < LEVEL19_OVERLAY_RUNTIME_TOGGLE_MODIFIERS.length; i += 1) {
    if (input?.isDown(LEVEL19_OVERLAY_RUNTIME_TOGGLE_MODIFIERS[i]) === true) {
      return true;
    }
  }
  return false;
}

export function getOverlayRuntimeToggleInputCodes() {
  return [LEVEL17_OVERLAY_CYCLE_KEY, LEVEL19_OVERLAY_RUNTIME_TOGGLE_MODIFIERS[0]];
}

export function isOverlayRuntimeCycleModifierActive(input) {
  for (let i = 0; i < LEVEL19_OVERLAY_RUNTIME_CYCLE_MODIFIERS.length; i += 1) {
    if (input?.isDown(LEVEL19_OVERLAY_RUNTIME_CYCLE_MODIFIERS[i]) === true) {
      return true;
    }
  }
  return false;
}

export function getOverlayRuntimeCycleInputCodes() {
  return [
    LEVEL17_OVERLAY_CYCLE_KEY,
    LEVEL19_OVERLAY_RUNTIME_TOGGLE_MODIFIERS[0],
    LEVEL19_OVERLAY_RUNTIME_CYCLE_MODIFIERS[0],
  ];
}
