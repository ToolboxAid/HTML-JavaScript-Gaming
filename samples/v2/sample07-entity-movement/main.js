import Engine from '../../../engine/v2/core/Engine.js';
import { InputMap, InputService } from '../../../engine/v2/input/index.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import EntityMovementScene from './EntityMovementScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme?.();

const inputMap = new InputMap({
    moveLeft: ['ArrowLeft', 'KeyA'],
    moveRight: ['ArrowRight', 'KeyD'],
    moveUp: ['ArrowUp', 'KeyW'],
    moveDown: ['ArrowDown', 'KeyS'],
});

const input = new InputService({ inputMap });
const canvas = document.getElementById('game');
const engine = new Engine({
    canvas,
    width: 960,
    height: 540,
    fixedStepMs: 1000 / 60,
    input,
});

engine.setScene(new EntityMovementScene());
engine.start();
