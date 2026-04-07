/*
Toolbox Aid
David Quesenberry
03/21/2026
main.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import { InputMap, InputService } from '../../../src/engine/input/index.js';
import InputMappingScene from './InputMappingScene.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

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

engine.setScene(new InputMappingScene());
engine.start();
