/*
Toolbox Aid
David Quesenberry
04/14/2026
arcadeBody.js
*/
import { clamp } from '../utils/math.js';
import { applyDrag } from './drag.js';

export function stepArcadeBody(body, dt) {
  body.velocityX += (body.accelerationX ?? 0) * dt;
  body.velocityY += (body.accelerationY ?? 0) * dt;

  const dragX = body.dragX ?? 0;
  const dragY = body.dragY ?? 0;

  if (!body.accelerationX) {
    body.velocityX = applyDrag(body.velocityX, dragX, dt);
  }

  if (!body.accelerationY) {
    body.velocityY = applyDrag(body.velocityY, dragY, dt);
  }

  const maxSpeedX = body.maxSpeedX ?? Infinity;
  const maxSpeedY = body.maxSpeedY ?? Infinity;
  body.velocityX = clamp(body.velocityX, -maxSpeedX, maxSpeedX);
  body.velocityY = clamp(body.velocityY, -maxSpeedY, maxSpeedY);
  return body;
}

