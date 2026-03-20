import Engine from '../../../engine/v2/core/Engine.js';
import KeyboardMoveScene from './KeyboardMoveScene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({
    canvas,
    width: 960,
    height: 540,
    fixedStepMs: 1000 / 60,
});

engine.setScene(new KeyboardMoveScene());
engine.start();
