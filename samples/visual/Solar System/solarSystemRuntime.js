// ToolboxAid.com
// David Quesenberry
// solarSystemRuntime.js
// 03/15/2026

import { canvasConfig } from './global.js';
import CelestialBody from './celestialBody.js';

export function createCelestialBodies(bodyDefinitions) {
  return bodyDefinitions.map((body) => new CelestialBody(
    body.name,
    body.radius,
    body.distance,
    body.color,
    body.angle,
    body.speed,
    body.moons ?? [],
    body.ring ?? null
  ));
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function cycleFocusIndex(currentIndex, bodyCount, step) {
  const maxIndex = bodyCount - 1;

  if (maxIndex < 0) {
    return -1;
  }

  if (currentIndex === -1 && step > 0) {
    return 0;
  }

  if (currentIndex === -1 && step < 0) {
    return maxIndex;
  }

  const nextIndex = currentIndex + step;

  if (nextIndex > maxIndex) {
    return -1;
  }

  if (nextIndex < -1) {
    return maxIndex;
  }

  return nextIndex;
}

export function getFocusedBody(activeBodies, focusIndex) {
  if (focusIndex < 0 || focusIndex >= activeBodies.length) {
    return null;
  }

  return activeBodies[focusIndex];
}

export function getRenderOptions(focusedBody, zoom, showOrbits, showLabels) {
  const centerX = canvasConfig.width / 2;
  const centerY = canvasConfig.height / 2;

  if (!focusedBody) {
    return {
      centerX,
      centerY,
      zoom,
      showOrbits,
      showLabels
    };
  }

  return {
    centerX: centerX - (focusedBody.x * zoom),
    centerY: centerY - (focusedBody.y * zoom),
    zoom,
    showOrbits,
    showLabels
  };
}
