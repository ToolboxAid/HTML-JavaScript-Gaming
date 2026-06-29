/*
Toolbox Aid
David Quesenberry
04/14/2026
drag.js
*/
export function applyDrag(value, drag, dt) {
  if (!drag) {
    return value;
  }

  if (value > 0) {
    return Math.max(0, value - drag * dt);
  }

  if (value < 0) {
    return Math.min(0, value + drag * dt);
  }

  return 0;
}

