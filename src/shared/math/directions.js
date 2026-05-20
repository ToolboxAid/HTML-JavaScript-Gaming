/*
Toolbox Aid
David Quesenberry
04/17/2026
directionUtils.js
*/
export function oppositeCardinalDirection(direction) {
  if (direction === "left") return "right";
  if (direction === "right") return "left";
  if (direction === "up") return "down";
  if (direction === "down") return "up";
  return null;
}
