// ToolboxAid.com
// David Quesenberry
// solarSystemRuntime.js
// 03/15/2026

import { canvasConfig, solarSystemConfig } from './global.js';
import CelestialBody from './celestialBody.js';
import GameObjectSystem from '../../../engine/game/gameObjectSystem.js';

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

export function populateGameObjectSystem(gameObjectSystem, bodyDefinitions) {
  const celestialBodies = createCelestialBodies(bodyDefinitions);
  celestialBodies.forEach((body) => {
    gameObjectSystem.addGameObject(body);
  });
}

export function resetGameObjectSystem(gameObjectSystem, bodyDefinitions) {
  if (!gameObjectSystem) {
    return;
  }

  gameObjectSystem.clear();
  populateGameObjectSystem(gameObjectSystem, bodyDefinitions);
}

export function destroyGameObjectSystem(gameObjectSystem) {
  if (gameObjectSystem?.destroy) {
    gameObjectSystem.destroy();
  }
}

export function initializeSimulationWorld(sample, bodyDefinitions) {
  sample.gameObjectSystem = new GameObjectSystem(false);
  applyInitialSimulationState(sample);
  resetGameObjectSystem(sample.gameObjectSystem, bodyDefinitions);
}

export function destroySimulationWorld(sample) {
  destroyGameObjectSystem(sample.gameObjectSystem);
  sample.gameObjectSystem = null;
  sample.focusIndex = -1;
}

export function getActiveBodies(gameObjectSystem) {
  return gameObjectSystem?.getActiveGameObjects() ?? [];
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function createInitialSimulationState() {
  return {
    gameState: solarSystemConfig.states.attract,
    simulationSpeed: solarSystemConfig.simulation.speedMultiplier,
    showOrbits: true,
    showLabels: false,
    zoom: solarSystemConfig.simulation.zoomDefault,
    focusIndex: -1
  };
}

export function applyInitialSimulationState(sample) {
  Object.assign(sample, createInitialSimulationState());
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

export function getFocusLabel(focusedBody) {
  return focusedBody ? focusedBody.name : 'System Center';
}

export function renderBodies(activeBodies, focusIndex, zoom, showOrbits, showLabels) {
  const focusedBody = getFocusedBody(activeBodies, focusIndex);
  const renderOptions = getRenderOptions(focusedBody, zoom, showOrbits, showLabels);

  activeBodies.forEach((body) => {
    body.draw(renderOptions);
  });
}

export function updateBodies(activeBodies, deltaTime) {
  activeBodies.forEach((body) => {
    body.update(deltaTime);
  });
}
