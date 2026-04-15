/*
Toolbox Aid
David Quesenberry
04/15/2026
integration3d.js
*/
function toFinite(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

export function integrateVelocity3D(body, dtSeconds) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const dt = toFinite(dtSeconds, 0);
  body.x = toFinite(body.x, 0) + toFinite(body.velocityX, 0) * dt;
  body.y = toFinite(body.y, 0) + toFinite(body.velocityY, 0) * dt;
  body.z = toFinite(body.z, 0) + toFinite(body.velocityZ, 0) * dt;
  return body;
}
