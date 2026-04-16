/*
Toolbox Aid
David Quesenberry
04/16/2026
overlayCycleInput.js
*/
export const LEVEL17_OVERLAY_CYCLE_KEY = 'KeyG';
export const LEVEL17_OVERLAY_REVERSE_MODIFIERS = Object.freeze(['ShiftLeft', 'ShiftRight']);
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
