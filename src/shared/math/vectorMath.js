/*
Toolbox Aid
David Quesenberry
04/14/2026
vectorMath.js
*/
export function vectorFromAngle(angle, magnitude = 1) {
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
  };
}

