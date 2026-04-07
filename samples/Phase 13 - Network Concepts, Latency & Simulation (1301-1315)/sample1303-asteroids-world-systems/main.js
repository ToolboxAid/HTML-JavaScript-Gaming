/*
Toolbox Aid
David Quesenberry
03/29/2026
main.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import AsteroidsWorldSystemsScene from './AsteroidsWorldSystemsScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540, fixedStepMs: 1000 / 60 });
engine.setScene(new AsteroidsWorldSystemsScene());
engine.start();
