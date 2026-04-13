/*
Toolbox Aid
David Quesenberry
03/29/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import PacmanLiteWorldSystemsScene from './PacmanLiteWorldSystemsScene.js';
import { SIMULATION_FIXED_STEP_MS } from '/samples/phase-13/_shared/simulationBaseline.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540, fixedStepMs: SIMULATION_FIXED_STEP_MS });
engine.setScene(new PacmanLiteWorldSystemsScene());
engine.start();
