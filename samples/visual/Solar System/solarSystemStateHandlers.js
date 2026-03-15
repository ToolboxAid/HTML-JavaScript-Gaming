// ToolboxAid.com
// David Quesenberry
// solarSystemStateHandlers.js
// 03/15/2026

import { solarSystemConfig } from './global.js';
import {
  updateAttractGameState,
  updatePausedGameState,
  updateSimulationGameState
} from './solarSystemRuntime.js';
import {
  renderAttractScreen,
  renderPausedScreen,
  renderSimulationScreen
} from './solarSystemHud.js';

export function createStateHandlers(sample) {
  return {
    [solarSystemConfig.states.attract]: () => {
      updateAttractGameState(sample, sample.isAnyKeyPressed);
      renderAttractScreen(sample.gameObjectSystem, sample.focusIndex, sample.zoom, sample.showOrbits, sample.showLabels);
    },
    [solarSystemConfig.states.simulation]: (deltaTime) => {
      updateSimulationGameState(
        sample,
        sample.isAnyKeyPressed,
        sample.resetBodies,
        deltaTime
      );
      renderSimulationScreen(
        sample.gameObjectSystem,
        sample.simulationSpeed,
        sample.focusIndex,
        sample.zoom,
        sample.showOrbits,
        sample.showLabels
      );
    },
    [solarSystemConfig.states.paused]: () => {
      updatePausedGameState(sample, sample.isAnyKeyPressed, sample.resetBodies);
      renderPausedScreen(sample.gameObjectSystem, sample.focusIndex, sample.zoom, sample.showOrbits, sample.showLabels);
    }
  };
}
