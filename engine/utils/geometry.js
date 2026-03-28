/*
Toolbox Aid
David Quesenberry
03/27/2026
geometry.js
*/
export function pointInRect(point, rect) {
  return !!(
    point &&
    rect &&
    point.x >= rect.x &&
    point.y >= rect.y &&
    point.x <= rect.x + rect.w &&
    point.y <= rect.y + rect.h
  );
}

export function xyInRect(x, y, rect) {
  return pointInRect({ x, y }, rect);
}
