
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
