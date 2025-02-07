class GameControllerMap {
    static controllers = {
        "default":
        {
            "shortName":"default",
            "buttonNames": ["A", "B"],
            "axisNames": ["LeftStickX", "LeftStickY"],
            "axisDeadzone": 0.0,
            "dPadType": "none",
        },
        "Logitech RumblePad 2 USB (STANDARD GAMEPAD Vendor: 046d Product: c218)":
        {
            "shortName":"Logitech RumblePad 2",
            "buttonNames": ["Y", "A", "B", "X", "LT", "RT", "LB", "RB", "Select", "Start", "n/a", "n/a", "dPadUP", "dPadDOWN", "dPadLEFT", "dPadRIGHT"],
            "axisNames": ["LeftStickX", "LeftStickY", "RightStickX", "RightStickY"],
            "axisDeadzone": 0.5,
            "dPadType": "button",
        },
        "USB gamepad (Vendor: 081f Product: e401)":
        {
            "shortName":"USB gamepad",
            "buttonNames": ["X", "A", "B", "Y", "LT", "RT", "","", "Select", "Start"],
            "axisNames": ["LeftStickX", "LeftStickY"],
            "axisDeadzone": 0.2,
            "dPadType": "axis",
        },
    };
}

export default GameControllerMap;
