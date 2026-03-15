// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameInput.js

export function isStartPressed(keyboardInput) {
    const keysPressed = keyboardInput.getKeysPressed();
    return keysPressed.includes('Enter') || keysPressed.includes('NumpadEnter');
}

export function isPauseTogglePressed(keyboardInput) {
    return keyboardInput.getKeysPressed().includes('KeyP');
}

export function isScorePressed(keyboardInput) {
    return keyboardInput.getKeysPressed().includes('KeyS');
}

export function isPlayerDeathPressed(keyboardInput) {
    return keyboardInput.getKeysPressed().includes('KeyD');
}
