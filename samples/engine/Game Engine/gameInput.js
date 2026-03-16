// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameInput.js

export function isStartPressed(keyboardInput, gameControllers = null) {
    return keyboardInput.isKeyPressed('Enter') ||
        keyboardInput.isKeyPressed('NumpadEnter') ||
        gameControllers?.wasStartPressed() ||
        false;
}

export function isPauseTogglePressed(keyboardInput, gameControllers = null) {
    return keyboardInput.isKeyPressed('KeyP') ||
        gameControllers?.wasSelectPressed() ||
        false;
}

export function isScorePressed(keyboardInput, gameControllers = null) {
    return keyboardInput.isKeyPressed('KeyS') ||
        gameControllers?.wasPrimaryActionPressed() ||
        false;
}

export function isPlayerDeathPressed(keyboardInput, gameControllers = null) {
    return keyboardInput.isKeyPressed('KeyD') ||
        gameControllers?.wasSecondaryActionPressed() ||
        false;
}
