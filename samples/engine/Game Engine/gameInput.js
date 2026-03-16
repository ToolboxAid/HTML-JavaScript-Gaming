// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameInput.js

export function isStartPressed(keyboardInput) {
    return keyboardInput.isKeyPressed('Enter') || keyboardInput.isKeyPressed('NumpadEnter');
}

export function isPauseTogglePressed(keyboardInput) {
    return keyboardInput.isKeyPressed('KeyP');
}

export function isScorePressed(keyboardInput) {
    return keyboardInput.isKeyPressed('KeyS');
}

export function isPlayerDeathPressed(keyboardInput) {
    return keyboardInput.isKeyPressed('KeyD');
}
