// ToolboxAid.com
// David Quesenberry
// solarSystemControls.js
// 03/15/2026

import { solarSystemConfig } from './global.js';
import {
  clamp,
  cycleFocusIndex,
  getActiveBodies,
  updateBodies
} from './solarSystemRuntime.js';

function applyInteractiveControls(sample, wasAnyKeyPressed) {
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

function applySharedControls(sample, wasAnyKeyPressed, resetSimulation) {
  applyInteractiveControls(sample, wasAnyKeyPressed);

  if (wasAnyKeyPressed(solarSystemConfig.controls.resetKeys)) {
    resetSimulation();
  }
}

export function runAttractControls(sample, wasAnyKeyPressed) {
  if (wasAnyKeyPressed(solarSystemConfig.controls.startKeys)) {
    sample.gameState = solarSystemConfig.states.simulation;
  }
}

export function runSimulationControls(sample, wasAnyKeyPressed, resetSimulation, deltaTime) {
  if (wasAnyKeyPressed(solarSystemConfig.controls.pauseKeys)) {
    sample.gameState = solarSystemConfig.states.paused;
    return;
  }

  applySharedControls(sample, wasAnyKeyPressed, resetSimulation);
  updateBodies(getActiveBodies(sample.gameObjectSystem), deltaTime * sample.simulationSpeed);
}

export function runPausedControls(sample, wasAnyKeyPressed, resetSimulation) {
  applySharedControls(sample, wasAnyKeyPressed, resetSimulation);

  if (wasAnyKeyPressed(solarSystemConfig.controls.pauseKeys)) {
    sample.gameState = solarSystemConfig.states.simulation;
  }
}
