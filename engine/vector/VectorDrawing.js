/*
Toolbox Aid
David Quesenberry
03/22/2026
VectorDrawing.js
*/
export function transformPoints(points, {
  x = 0,
  y = 0,
  rotation = 0,
  scale = 1,
} = {}) {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  return points.map((point) => ({
    x: x + ((point.x * scale) * cos) - ((point.y * scale) * sin),
    y: y + ((point.x * scale) * sin) + ((point.y * scale) * cos),
  }));
}

export function drawVectorShape(renderer, points, options = {}) {
  renderer.drawPolygon(points, options);
}
