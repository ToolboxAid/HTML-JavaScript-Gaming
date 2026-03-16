// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameControllerButtons.js

export const GAMEPAD_BUTTONS = Object.freeze({
    primary: 0,
    secondary: 1,
    select: 8,
    start: 9
});

export const D_PAD_BUTTON_NAMES = Object.freeze({
    up: 'DPadUP',
    down: 'DPadDOWN',
    left: 'DPadLEFT',
    right: 'DPadRIGHT'
});

export function wasPrimaryActionPressed(gameControllers, controllerIndex = 0) {
    return gameControllers?.wasButtonIndexPressed(controllerIndex, GAMEPAD_BUTTONS.primary) || false;
}

export function wasSecondaryActionPressed(gameControllers, controllerIndex = 0) {
    return gameControllers?.wasButtonIndexPressed(controllerIndex, GAMEPAD_BUTTONS.secondary) || false;
}

export function wasSelectPressed(gameControllers, controllerIndex = 0) {
    return gameControllers?.wasButtonIndexPressed(controllerIndex, GAMEPAD_BUTTONS.select) || false;
}

export function wasStartPressed(gameControllers, controllerIndex = 0) {
    return gameControllers?.wasButtonIndexPressed(controllerIndex, GAMEPAD_BUTTONS.start) || false;
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
