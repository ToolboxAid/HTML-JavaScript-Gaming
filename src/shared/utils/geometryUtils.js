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

export function getCenteredRect(containerRect, width, height, verticalBias = 0.5) {
  return {
    x: containerRect.x + Math.floor((containerRect.width - width) * 0.5),
    y: containerRect.y + Math.floor((containerRect.height - height) * verticalBias),
    w: width,
    h: height
  };
}
