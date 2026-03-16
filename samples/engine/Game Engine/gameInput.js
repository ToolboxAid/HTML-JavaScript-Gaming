// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameInput.js

import {
    wasPrimaryActionPressed,
    wasSecondaryActionPressed,
    wasSelectPressed,
    wasStartPressed as wasControllerStartPressed
} from '../../../engine/input/controller/gameControllerButtons.js';

export function isStartPressed(keyboardInput, gameControllers = null) {
    return keyboardInput.isKeyPressed('Enter') ||
        keyboardInput.isKeyPressed('NumpadEnter') ||
        wasControllerStartPressed(gameControllers);
}

export function isPauseTogglePressed(keyboardInput, gameControllers = null) {
    return keyboardInput.isKeyPressed('KeyP') ||
        wasSelectPressed(gameControllers);
}

export function isScorePressed(keyboardInput, gameControllers = null) {
    return keyboardInput.isKeyPressed('KeyS') ||
        wasPrimaryActionPressed(gameControllers);
}

export function isPlayerDeathPressed(keyboardInput, gameControllers = null) {
    return keyboardInput.isKeyPressed('KeyD') ||
        wasSecondaryActionPressed(gameControllers);
}
