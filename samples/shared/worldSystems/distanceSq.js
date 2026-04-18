/*
Toolbox Aid
David Quesenberry
03/29/2026
distanceSq.js
*/
export function distanceSq(a, b) {
  const dx = (a.x || 0) - (b.x || 0);
  const dy = (a.y || 0) - (b.y || 0);
  return dx * dx + dy * dy;
}
