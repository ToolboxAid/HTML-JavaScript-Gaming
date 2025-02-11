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

    //    static controllerMappings = {};
    static controllerMappings = {
        "default": {
            "shortName": "default",
            "buttons": {
                "A": 1,
                "B": 2
            },
            "axes": {
                "LeftStickX": 0,
                "LeftStickY": 1
            },
            "axisDeadzone": 0
        },
        "Logitech RumblePad 2 USB (STANDARD GAMEPAD Vendor: 046d Product: c218)": {
            "shortName": "Logitech RumblePad 2",
            "buttons": {
                "Y": 0,
                "A": 1,
                "B": 2,
                "X": 3,
                "LT": 4,
                "RT": 5,
                "LB": 6,
                "RB": 7,
                "Select": 8,
                "Start": 9,
                "": 11,
                "DPadUP": 12,
                "DPadDOWN": 13,
                "DPadLEFT": 14,
                "DPadRIGHT": 15
            },
            "axes": {
                "StickLeftX": 0,
                "StickLeftY": 1,
                "StickRightX": 2,
                "StickRightY": 3
            },
            "axisDeadzone": 0.1
        },
        "USB gamepad (Vendor: 081f Product: e401)": {
            "shortName": "USB gamepad",
            "buttons": {
                "X": 0,
                "A": 1,
                "B": 2,
                "Y": 3,
                "LT": 4,
                "RT": 5,
                "Select": 8,
                "Start": 9
            },
            "axes": {
                "DPadX": 0,
                "DPadY": 1
            },
            "axisDeadzone": 0.1
        }
    }

    // Support method to build mapping 'contrllerMappings' above.
    // Method to build controllerMappings from controllerConfigs
    static buildControllerMappings() {
        for (const controllerId in this.controllerConfigs) {
            const config = this.controllerConfigs[controllerId];

            // Create the mapping object for this controller
            this.controllerMappings[controllerId] = {
                shortName: config.shortName,
                buttons: config.buttonNames.reduce((acc, buttonName, index) => {
                    if (buttonName) { // Skip empty button names
                        acc[buttonName] = index; // Map button name to its index
                    }
                    return acc;
                }, {}),
                axes: config.axisNames.reduce((acc, axisName, index) => {
                    if (axisName) { // Skip empty axis names
                        acc[axisName] = index; // Map axis name to its index
                    }
                    return acc;
                }, {}),
                axisDeadzone: config.axisDeadzone,
            };
        }
    }

}

export default GameControllerMap;

// Generate static controllerMappings code from static controllerConfigs
const generateControllerMappings = false;
if (generateControllerMappings) {
    // Build the controllerMappings object
    GameControllerMap.buildControllerMappings();

    // Log the result as a string for easy copy/paste
    console.log(`static controllerMappings = ${JSON.stringify(GameControllerMap.controllerMappings, null, 4)}`);

    console.log(`Remember to copy/paste your new controllerMappings data.`)
}