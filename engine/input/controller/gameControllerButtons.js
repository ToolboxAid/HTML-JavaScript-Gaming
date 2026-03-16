// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameControllerButtons.js

export const GAMEPAD_BUTTON_NAMES = Object.freeze({
    primary: 'A',
    secondary: 'B',
    select: 'Select',
    start: 'Start'
});

export const D_PAD_BUTTON_NAMES = Object.freeze({
    up: 'DPadUP',
    down: 'DPadDOWN',
    left: 'DPadLEFT',
    right: 'DPadRIGHT'
});

function wasNamedButtonPressed(gameControllers, buttonName, controllerIndex = 0) {
    return gameControllers?.wasButtonNamePressed(controllerIndex, buttonName) || false;
}

export function wasPrimaryActionPressed(gameControllers, controllerIndex = 0) {
    return wasNamedButtonPressed(gameControllers, GAMEPAD_BUTTON_NAMES.primary, controllerIndex);
}

export function wasSecondaryActionPressed(gameControllers, controllerIndex = 0) {
    return wasNamedButtonPressed(gameControllers, GAMEPAD_BUTTON_NAMES.secondary, controllerIndex);
}

export function wasSelectPressed(gameControllers, controllerIndex = 0) {
    return wasNamedButtonPressed(gameControllers, GAMEPAD_BUTTON_NAMES.select, controllerIndex);
}

export function wasStartPressed(gameControllers, controllerIndex = 0) {
    return wasNamedButtonPressed(gameControllers, GAMEPAD_BUTTON_NAMES.start, controllerIndex);
}

export function wasDPadDirectionPressed(gameControllers, direction, controllerIndex = 0) {
    const buttonName = D_PAD_BUTTON_NAMES[direction];
    if (!buttonName) {
        return false;
    }

    return gameControllers?.wasButtonNamePressed(controllerIndex, buttonName) || false;
}

export function getDPadState(gameControllers, controllerIndex = 0) {
    return gameControllers?.getDPad?.(controllerIndex) || null;
}
