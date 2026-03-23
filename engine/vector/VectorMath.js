/*
Toolbox Aid
David Quesenberry
03/23/2026
VectorMath.js
*/
export function vectorFromAngle(angle, magnitude = 1) {
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
  };
}
