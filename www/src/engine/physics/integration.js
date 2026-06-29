/*
Toolbox Aid
David Quesenberry
04/14/2026
integration.js
*/
export function integrateVelocity2D(body, dt) {
  body.x += (body.velocityX ?? 0) * dt;
  body.y += (body.velocityY ?? 0) * dt;
  return body;
}

