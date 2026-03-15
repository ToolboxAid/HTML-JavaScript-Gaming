// ToolboxAid.com
// David Quesenberry
// solarSystemStateHandlers.js
// 03/15/2026

import { solarSystemConfig } from './global.js';
import {
  renderAttractScreen,
  renderPausedScreen,
  renderSimulationScreen
} from './solarSystemHud.js';
import {
  runAttractControls,
  runPausedControls,
  runSimulationControls
} from './solarSystemControls.js';

export function createStateHandlers(sample) {
  return {
    [solarSystemConfig.states.attract]: () => {
      runAttractControls(sample, sample.isAnyKeyPressed);
      renderAttractScreen(sample.gameObjectSystem, sample.focusIndex, sample.zoom, sample.showOrbits, sample.showLabels);
    },
    [solarSystemConfig.states.simulation]: (deltaTime) => {
      runSimulationControls(
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
      runPausedControls(sample, sample.isAnyKeyPressed, sample.resetBodies);
      renderPausedScreen(sample.gameObjectSystem, sample.focusIndex, sample.zoom, sample.showOrbits, sample.showLabels);
    }
  };
}
