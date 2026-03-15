// ToolboxAid.com
// David Quesenberry
// solarSystemRuntime.js
// 03/15/2026

import { canvasConfig, solarSystemConfig } from './global.js';
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

export function updateAttractGameState(sample, wasAnyKeyPressed) {
  if (wasAnyKeyPressed(solarSystemConfig.controls.startKeys)) {
    sample.gameState = solarSystemConfig.states.simulation;
  }
}

export function applyInteractiveControls(sample, wasAnyKeyPressed) {
  const activeBodies = getActiveBodies(sample.gameObjectSystem);

  if (wasAnyKeyPressed(solarSystemConfig.controls.speedUpKeys)) {
    sample.simulationSpeed = clamp(
      sample.simulationSpeed + solarSystemConfig.simulation.speedStep,
      solarSystemConfig.simulation.minSpeedMultiplier,
      solarSystemConfig.simulation.maxSpeedMultiplier
    );
  }

  if (wasAnyKeyPressed(solarSystemConfig.controls.speedDownKeys)) {
    sample.simulationSpeed = clamp(
      sample.simulationSpeed - solarSystemConfig.simulation.speedStep,
      solarSystemConfig.simulation.minSpeedMultiplier,
      solarSystemConfig.simulation.maxSpeedMultiplier
    );
  }

  if (wasAnyKeyPressed(solarSystemConfig.controls.toggleOrbitKeys)) {
    sample.showOrbits = !sample.showOrbits;
  }

  if (wasAnyKeyPressed(solarSystemConfig.controls.toggleLabelKeys)) {
    sample.showLabels = !sample.showLabels;
  }

  if (wasAnyKeyPressed(solarSystemConfig.controls.zoomInKeys)) {
    sample.zoom = clamp(
      sample.zoom + solarSystemConfig.simulation.zoomStep,
      solarSystemConfig.simulation.minZoom,
      solarSystemConfig.simulation.maxZoom
    );
  }

  if (wasAnyKeyPressed(solarSystemConfig.controls.zoomOutKeys)) {
    sample.zoom = clamp(
      sample.zoom - solarSystemConfig.simulation.zoomStep,
      solarSystemConfig.simulation.minZoom,
      solarSystemConfig.simulation.maxZoom
    );
  }

  if (wasAnyKeyPressed(solarSystemConfig.controls.focusNextKeys)) {
    sample.focusIndex = cycleFocusIndex(sample.focusIndex, activeBodies.length, 1);
  }

  if (wasAnyKeyPressed(solarSystemConfig.controls.focusPrevKeys)) {
    sample.focusIndex = cycleFocusIndex(sample.focusIndex, activeBodies.length, -1);
  }
}

export function applySharedControls(sample, wasAnyKeyPressed, resetSimulation) {
  applyInteractiveControls(sample, wasAnyKeyPressed);

  if (wasAnyKeyPressed(solarSystemConfig.controls.resetKeys)) {
    resetSimulation();
  }
}

export function updateSimulationGameState(sample, wasAnyKeyPressed, resetSimulation, deltaTime) {
  if (wasAnyKeyPressed(solarSystemConfig.controls.pauseKeys)) {
    sample.gameState = solarSystemConfig.states.paused;
    return;
  }

  applySharedControls(sample, wasAnyKeyPressed, resetSimulation);
  updateBodies(getActiveBodies(sample.gameObjectSystem), deltaTime * sample.simulationSpeed);
}

export function updatePausedGameState(sample, wasAnyKeyPressed, resetSimulation) {
  applySharedControls(sample, wasAnyKeyPressed, resetSimulation);

  if (wasAnyKeyPressed(solarSystemConfig.controls.pauseKeys)) {
    sample.gameState = solarSystemConfig.states.simulation;
  }
}
