// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// gameControllerMap.js

class GameControllerMap {
    static controllerConfigs = {
        "default":
        {
            "shortName": "default",
            "buttonNames": ["A", "B"],
            "axisNames": ["LeftStickX", "LeftStickY"],
            "axisDeadzone": 0.0,
        },
        "Logitech RumblePad 2 USB (STANDARD GAMEPAD Vendor: 046d Product: c218)":
        {
            "shortName": "Logitech RumblePad 2",
            "buttonNames": ["Y", "A", "B", "X", "LT", "RT", "LB", "RB", "Select", "Start", "", "", "DPadUP", "DPadDOWN", "DPadLEFT", "DPadRIGHT"],
            "axisNames": ["StickLeftX", "StickLeftY", "StickRightX", "StickRightY"],
            "axisDeadzone": 0.1,
        },
        "USB gamepad (Vendor: 081f Product: e401)":
        {
            "shortName": "USB gamepad",
            "buttonNames": ["X", "A", "B", "Y", "LT", "RT", "", "", "Select", "Start"],
            "axisNames": ["DPadX", "DPadY"],
            "axisDeadzone": 0.2,
        },
    };
}

export default GameControllerMap;
