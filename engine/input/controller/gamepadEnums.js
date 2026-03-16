
// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// gamepadEnums.js

// Enum for D-pad types
export const DPadType = {
    NONE: "none",
    BUTTON: "button",
    AXIS: "axis",
    
    INVALID: "invalid",
    NOTFOUND: "not_found",
};

// Freeze the object to prevent modifications
Object.freeze(DPadType);

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

export const D_PAD_AXIS_NAMES = Object.freeze({
    x: 'DPadX',
    y: 'DPadY'
});
