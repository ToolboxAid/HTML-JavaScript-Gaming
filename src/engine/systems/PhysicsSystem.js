/*
Toolbox Aid
David Quesenberry
03/21/2026
PhysicsSystem.js
*/
import { clamp } from '../utils/math.js';

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

export function applyDrag(value, drag, dt) {
  if (!drag) {
    return value;
  }

  if (value > 0) {
    return Math.max(0, value - drag * dt);
  }

  if (value < 0) {
    return Math.min(0, value + drag * dt);
  }

  return 0;
}
