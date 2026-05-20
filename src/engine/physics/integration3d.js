/*
Toolbox Aid
David Quesenberry
04/15/2026
integration3d.js
*/

import { asFinite } from '../../shared/math/numberNormalization.js';
export function integrateVelocity3D(body, dtSeconds) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const dt = asFinite(dtSeconds, 0);
  body.x = asFinite(body.x, 0) + asFinite(body.velocityX, 0) * dt;
  body.y = asFinite(body.y, 0) + asFinite(body.velocityY, 0) * dt;
  body.z = asFinite(body.z, 0) + asFinite(body.velocityZ, 0) * dt;
  return body;
}
