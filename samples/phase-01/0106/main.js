/*
Toolbox Aid
David Quesenberry
03/21/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import InputMap from '/src/engine/input/InputMap.js';
import InputService from '/src/engine/input/InputService.js';
import InputMappingScene from './InputMappingScene.js';
import { Theme } from '/src/engine/theme/Theme.js';
import { ThemeTokens } from '/src/engine/theme/ThemeTokens.js';

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
