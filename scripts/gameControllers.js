// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// gampad.js

import GameControllerMap from "../scripts/gameControllerMap.js"

export const DPadType = {
    NONE: "none",
    BUTTON: "button",
    AXIS: "axis",
    INVALID: "invalid",
    NOTFOUND: "not_found",

};
Object.freeze(DPadType);// Freeze the object to prevent modifications

class GameControllers {

    constructor() {
        this.gameControllers = []; // Array to store the state of connected gameControllers

        // Buttons for a max of 4 controllers
        this.buttonsPressed = Array.from({ length: 4 }, () => new Set());  // Buttons just pressed
        this.buttonsDown = Array.from({ length: 4 }, () => new Set());     // Buttons currently pressed
        this.buttonsReleased = Array.from({ length: 4 }, () => new Set()); // Buttons just released
        this.buttonNames = Array.from({ length: 4 }, () => []);

        // Axes for a max of 4 controllers
        this.axisData = Array.from({ length: 4 }, () => []);
        this.axisNames = Array.from({ length: 4 }, () => []);
        this.axisDeadzone = Array.from({ length: 4 }, () => 0.2); // Default deadzone
        this.dPadType = Array.from({ length: 4 }, () => DPadType.NONE); // Initialize with default type        

        // Automatically poll for gameController updates
        this.pollInterval = setInterval(this.pollGameControllers.bind(this), 16); // ~60 FPS or 16mS = 0.016S

        this.start();
    }

    // Start listening for gameController connections/disconnections, also unload
    start() {
        // Connect
        window.addEventListener("gamepadconnected", (event) => {
            const gameController = event.gamepad;
            this.gameControllers[gameController.index] = gameController;

            // Map buttons and axis for a specific gameController
            const controller = GameControllerMap.controllerConfigs[gameController.id] || GameControllerMap.controllerConfigs["default"];
            if (controller.shortName === "default") {
                console.warn(`Controller mapping not found for '${gameController.id}', \nUsing:`, controller);
            }
            // Use the controller object directly
            this.mapButtonNames(gameController.index, controller.buttonNames);
            this.mapAxisNames(gameController.index, controller.axisNames);

            this.axisDeadzone[gameController.index] = controller.axisDeadzone;
            this.dPadType[gameController.index] = this.getDPadType(gameController.index);  // Axix, Button, None

            console.log(`GameController '${gameController.id}' connected at index '${gameController.index}' details:`, this);
        });

        // Disconnect
        window.addEventListener("gamepaddisconnected", (event) => {
            const gameController = event.gamepad;
            delete this.gameControllers[gameController.index];
            console.warn(`GameController ${gameController.id} disconnected from index ${gameController.index}`);
        });

        // Cleanup when the page is unloaded
        window.addEventListener('beforeunload', () => {
            this.disconnect(); // Stop polling gameControllers before the page unloads
        });
    }

    pollGameControllers() {
        const gameControllers = navigator.getGamepads(); // Get the state of all connected gameControllers        

        if (!gameControllers) return;
        this.gameControllers = Array.from(gameControllers).map(gameController => gameController || null);
    }

    // Disconnect the gameController polling when no longer needed
    disconnect() {
        clearInterval(this.pollInterval); // Stop polling gameControllers
    }

    update() {
        this.gameControllers.forEach((gameController, index) => {
            if (!gameController) return; // Skip disconnected gameControllers

            // Store the raw axis data for each gameController
            this.axisData[index] = gameController.axes;

            // Clear previous button states
            this.buttonsPressed[index].clear();
            this.buttonsReleased[index].clear;

            let showDetails = false;
            // Handle button presses
            gameController.buttons.forEach((button, buttonIndex) => {
                if (button.pressed) {
                    if (!this.buttonsDown[index].has(buttonIndex)) {// First time pressed
                        this.buttonsPressed[index].add(buttonIndex);
                    }
                    this.buttonsDown[index].add(buttonIndex);
                    showDetails = true;
                } else { // !button.pressed
                    if (this.buttonsDown[index].has(buttonIndex)) {
                        this.buttonsReleased[index].add(buttonIndex);
                        this.buttonsDown[index].delete(buttonIndex);
                        showDetails = true
                    } else {
                        if (this.buttonsReleased[index].has(buttonIndex)) {
                            this.buttonsReleased[index].delete(buttonIndex)
                            showDetails = true;
                        };
                    }
                }
            });

            // comment out next line to see the showDetails
            showDetails = false;
            if (showDetails) {
                console.log("Pressed:", this.buttonsPressed[index], "Down:", this.buttonsDown[index], "Released:", this.buttonsReleased[index]);
            }
        });
    }

    // Game Controller methods
    getButtonsPressed(gameController) {
        return Array.from(this.buttonsPressed[gameController]);
    }

    getButtonsDown(gameController) {
        return Array.from(this.buttonsDown[gameController]);
    }

    getButtonsReleased(gameController) {
        return Array.from(this.buttonsReleased[gameController]);
    }

    getGameController(gameControllerIndex) {
        return this.gameControllers[gameControllerIndex];
    }

    // Map axis indices to names (should this be POV and axis?)
    mapAxisNames(gameControllerIndex, axisNames) {
        if (this.gameControllers.length <= 0) return;

        if (this.gameControllers[gameControllerIndex]) {
            this.axisNames[gameControllerIndex] = axisNames;
        } else {
            console.error(`GameController at index ${gameControllerIndex} not found.`);
        }
    }

    // Get axis value by name (valid values should contain Stick: "StickLeftX", "StickLeftY", "StickRightX", "StickRightY")
    getAxisByName(gameControllerIndex, axisName) {
        // Early return for invalid inputs
        if (gameControllerIndex < 0 || axisName == null) return 0;

        // Check if axisName or gameControllerIndex is invalid
        const axisNames = this.axisNames[gameControllerIndex];
        const axisData = this.axisData[gameControllerIndex];
        const axisDeadzone = this.axisDeadzone[gameControllerIndex];

        if (!axisNames || !axisData || axisDeadzone == null) return 0;

        // Find the axis index
        const axisIndex = axisNames.indexOf(axisName);
        if (axisIndex === -1) return 0; // Axis name not found

        // Apply deadzone logic
        const axisValue = axisData[axisIndex];
        const filteredValue = Math.abs(axisValue) < axisDeadzone ? 0 : axisValue;

        return filteredValue;
        // Round to 3 decimal places using toFixed()
        //return parseFloat(filteredValue.toFixed(3));
    }

    /**
 * Determines the D-pad type based on whether D-pad names are in axisNames or buttonNames.
 * @param {string} controllerId - The ID of the controller (e.g., "default").
 * @returns {ENUM} - The D-pad type: "button", "axis", or "none".
 */
    getDPadType(controllerId) {
        const controller = this.gameControllers[controllerId];
        if (!controller) {
            console.error(`Controller with ID '${controllerId}' not found.`);
            return "none";
        }

        // Define D-pad names for buttons and axes
        const dPadButtonNames = ["DPadUP", "DPadDOWN", "DPadLEFT", "DPadRIGHT"];
        const dPadAxisNames = ["DPadX", "DPadY"];

        // Check if D-pad names are in buttonNames
        const isDPadButtons = dPadButtonNames.some(name => this.buttonNames[controllerId].includes(name));

        // Check if D-pad names are in axisNames
        const isDPadAxes = dPadAxisNames.some(name => this.axisNames[controllerId].includes(name));

        // Determine the D-pad type
        if (isDPadButtons) {
            return DPadType.BUTTON;
        } else if (isDPadAxes) {
            return DPadType.AXIS;
        } else {
            return DPadType.NONE;
        }
    }

    getDPad(gameControllerIndex) {
        if (gameControllerIndex < 0) return { left: false, right: false, up: false, down: false, type: DPadType.INVALID };

        const type = this.dPadType[gameControllerIndex];
        const axes = this.axisData[gameControllerIndex] || [0, 0];
        const deadzone = this.axisDeadzone[gameControllerIndex] || 0.2;

        if (type === DPadType.BUTTON) {
            return {
                left: this.isButtonNameDown(gameControllerIndex, "DPadLEFT"),
                right: this.isButtonNameDown(gameControllerIndex, "DPadRIGHT"),
                up: this.isButtonNameDown(gameControllerIndex, "DPadUP"),
                down: this.isButtonNameDown(gameControllerIndex, "DPadDOWN"),
                type: DPadType.BUTTON,
            };
        } else if (type === DPadType.AXIS) {
            return {
                left: axes[0] < -deadzone,
                right: axes[0] > deadzone,
                up: axes[1] < -deadzone,
                down: axes[1] > deadzone,
                type: DPadType.AXIS,
            };
        }

        return { left: false, right: false, up: false, down: false, type: DPadType.NOTFOUND };
    }

    getAxisByIndex(gameControllerIndex, axisIndex) {
        // Early return for invalid inputs
        if (gameControllerIndex < 0 || axisIndex < 0) return 0;

        // Retrieve axis data and deadzone for the specified controller
        const axisData = this.axisData[gameControllerIndex];
        const axisDeadzone = this.axisDeadzone[gameControllerIndex];

        // Check if axis data or deadzone is invalid
        if (!axisData || axisDeadzone == null || axisData[axisIndex] == null) return 0;

        // Apply deadzone logic
        const axisValue = axisData[axisIndex];
        const filteredValue = Math.abs(axisValue) < axisDeadzone ? 0 : axisValue;

        return filteredValue;
        // Round to 3 decimal places using toFixed()
        //return parseFloat(filteredValue.toFixed(3));
    }

    // Game Controller button methods
    // -- index --
    wasButtonIndexPressed(gameControllerIndex, buttonIndex) {
        return this.buttonsPressed[gameControllerIndex].has(buttonIndex);
    }

    isButtonIndexDown(gameControllerIndex, buttonIndex) {
        return this.buttonsDown[gameControllerIndex].has(buttonIndex);
    }

    wasButtonIndexReleased(gameControllerIndex, buttonIndex) {
        return this.buttonsReleased[gameControllerIndex].has(buttonIndex);
    }

    // -- names --
    mapButtonNames(gameControllerIndex, buttonNames) {
        if (this.gameControllers.length <= 0) return;
        if (this.gameControllers[gameControllerIndex]) {
            this.buttonNames[gameControllerIndex] = buttonNames;
        } else {
            console.error(`GameController at index ${gameControllerIndex} not found.`);
        }
    }

    wasButtonNamePressed(gameControllerIndex, buttonName) {
        if (this.gameControllers[gameControllerIndex] && this.buttonNames[gameControllerIndex]) {
            const buttonIndex = this.buttonNames[gameControllerIndex].indexOf(buttonName);
            if (buttonIndex !== -1) {
                return this.buttonsPressed[gameControllerIndex].has(buttonIndex);
            } else {
                console.error(`Button name "${buttonName}" not found for gameController at index ${gameControllerIndex}.`);
            }
        } else {
            console.error(`GameController at index ${gameControllerIndex} or button names not found.`);
        }
        return false;
    }

    isButtonNameDown(gameControllerIndex, buttonName) {
        if (this.gameControllers[gameControllerIndex] && this.buttonNames[gameControllerIndex]) {
            const buttonIndex = this.buttonNames[gameControllerIndex].indexOf(buttonName);
            if (buttonIndex !== -1) {
                return this.buttonsDown[gameControllerIndex].has(buttonIndex);
            } else {
                console.error(`Button name "${buttonName}" not found for gameController at index ${gameControllerIndex}.`);
            }
        } else {
            console.error(`GameController at index ${gameControllerIndex} or button names not found.`);
        }
        return false;
    }

    wasButtonNameReleased(gameControllerIndex, buttonName) {
        if (this.gameControllers[gameControllerIndex] && this.buttonNames[gameControllerIndex]) {
            const buttonIndex = this.buttonNames[gameControllerIndex].indexOf(buttonName);
            if (buttonIndex !== -1) {
                return this.buttonsReleased[gameControllerIndex].has(buttonIndex);
            } else {
                console.error(`Button name "${buttonName}" not found for gameController at index ${gameControllerIndex}.`);
            }
        } else {
            console.error(`GameController at index ${gameControllerIndex} or button names not found.`);
        }
        return false;
    }

    // Debug methods
    static number = 301; // Prevent spamming console log
    static debug = false;
    logGameController(gameControllerIndex) {
        if (!GameControllers.debug || gameControllerIndex < 0) return;

        if (GameControllers.number++ > 60 * 5) {
            GameControllers.number = 0;
            console.group(`GameController [${gameControllerIndex}]`);
            console.log('ID:', this.gameControllers[gameControllerIndex].id);
            console.log('Buttons:', this.gameControllers[gameControllerIndex].buttons.length);
            console.log('Axis:', this.gameControllers[gameControllerIndex].axis.length);
            console.log("controller", 'Axis:', this.gameControllers[gameControllerIndex]);
            console.log("dPad", this.getDPad(gameControllerIndex));
            console.groupEnd();
        }
    }

    logPressedName(gameControllerIndex) {
        if (!GameControllers.debug || gameControllerIndex < 0) return;

        this.buttonsPressed[gameControllerIndex].forEach((button, buttonIndex) => {
            console.log(`Controller: ${gameControllerIndex}, Button >>> Index: ${buttonIndex}, Name: ${this.buttonNames[gameControllerIndex][buttonIndex]}`);
        });
    }

}

export default GameControllers;
