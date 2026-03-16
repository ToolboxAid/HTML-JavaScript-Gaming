// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameControllerButtons.js

import { D_PAD_BUTTON_NAMES, GAMEPAD_BUTTON_NAMES } from './gamepadEnums.js';

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
