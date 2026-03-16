// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameInput.js

export function isStartPressed(keyboardInput, gameControllers = null) {
    return keyboardInput.isKeyPressed('Enter') ||
        keyboardInput.isKeyPressed('NumpadEnter') ||
        gameControllers?.wasButtonIndexPressed(0, 9);
}

export function isPauseTogglePressed(keyboardInput, gameControllers = null) {
    return keyboardInput.isKeyPressed('KeyP') ||
        gameControllers?.wasButtonIndexPressed(0, 8);
}

export function isScorePressed(keyboardInput, gameControllers = null) {
    return keyboardInput.isKeyPressed('KeyS') ||
        gameControllers?.wasButtonIndexPressed(0, 0);
}

export function isPlayerDeathPressed(keyboardInput, gameControllers = null) {
    return keyboardInput.isKeyPressed('KeyD') ||
        gameControllers?.wasButtonIndexPressed(0, 1);
}
