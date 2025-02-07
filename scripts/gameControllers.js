// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// gampad.js

import GameControllerMap from "../scripts/gameControllerMap.js"

const gameControllerIndex0 = -90;

class GameControllers {

    constructor() {
        this.gameControllers = []; // Array to store the state of connected gameControllers

        // Buttons for a max of 4 controllers
        this.buttonsPressed = Array.from({ length: 4 }, () => new Set());  // Buttons just pressed
        this.buttonsDown = Array.from({ length: 4 }, () => new Set());     // Buttons currently pressed
        this.buttonsReleased = Array.from({ length: 4 }, () => new Set()); // Buttons just released
        this.buttonNames = Array.from({ length: 4 }, () => new Set());

        // Axes for a max of 4 controllers
        this.axisData = Array.from({ length: 4 }, () => new Set());
        this.axisNames = Array.from({ length: 4 }, () => new Set());
        this.axisDeadzone = Array.from({ length: 4 }, () => new Set());// 0.2;

        this.dPadType = Array.from({ length: 4 }, () => new Set());// 0.2;

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
            console.log(`GameController '${gameController.id}' connected at index '${gameController.index}'`);

            // Map buttons and axis for a specific gameController
            const controller = GameControllerMap.controllers[gameController.id] || GameControllerMap.controllers["default"];
            if (gameController.index, controller.shortName === "default") {
                console.warn(`Controller maping not found for '${gameController.id}', \nUsing:`, controller);
            }
            // Use the controller object directly
            this.mapButtonLetters(gameController.index, controller.buttonNames);
            this.mapAxis(gameController.index, controller.axisNames);

            this.axisDeadzone[gameController.index] = controller.axisDeadzone;
            this.dPadType[gameController.index] = controller.dPadType;

            console.log(this);
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
        //const gameControllers = navigator.getGameControllers(); // Get the state of all connected gameControllers
        const gameControllers = navigator.getGamepads(); // Get the state of all connected gameControllers        

        if (!gameControllers) return;

        // Update gameControllers array, even if some slots are null (disconnected gameControllers)
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
    mapAxis(gameControllerIndex, axisNames) {
        if (this.gameControllers.length <= 0) return;

        if (this.gameControllers[gameControllerIndex]) {
            this.axisNames[gameControllerIndex] = axisNames;
        } else {
            console.error(`GameController at index ${gameControllerIndex} not found.`);
        }
    }
    // Get axis value by name
    getAxisState(gameControllerIndex, axisName) {
        if (gameControllerIndex < 0) return { left: false, right: false, up: false, down: false };

        if (this.gameControllers[gameControllerIndex] && this.axisNames[gameControllerIndex]) {
            const axisButtonIndex = this.axisNames[gameControllerIndex].indexOf(axisName);
            if (axisButtonIndex !== -1) {
                return this.axisData[gameControllerIndex][axisButtonIndex];
            } else {
                console.error(`Axis name "${axisName}" not found for gameController at index ${gameControllerIndex}.`);
            }
        } else {
            console.error(`GameController at index ${gameControllerIndex} or axis names not found.`);
        }
        return 0;
    }

    getDPad(gameControllerIndex) {
        if (gameControllerIndex < 0) return { left: false, right: false, up: false, down: false, index: -1 };

        if (this.dPadType[gameControllerIndex] === "button") {
            return {
                left: this.isButtonLetterDown(gameControllerIndex,"dPadLEFT"),
                right: this.isButtonLetterDown(gameControllerIndex,"dPadRIGHT"),
                up: this.isButtonLetterDown(gameControllerIndex,"dPadUP"),
                down: this.isButtonLetterDown(gameControllerIndex,"dPadDOWN"),
                type: "button",
            };
        }
        if (this.dPadType[gameControllerIndex] === "axis") {
            return {
                left: this.axisData[gameControllerIndex][0] < -this.axisDeadzone[gameControllerIndex],
                right: this.axisData[gameControllerIndex][0] > this.axisDeadzone[gameControllerIndex],
                up: this.axisData[gameControllerIndex][1] < -this.axisDeadzone[gameControllerIndex],
                down: this.axisData[gameControllerIndex][1] > this.axisDeadzone[gameControllerIndex],
                type: "axis",
            };
        }
        return {
            left: false,
            right: false,
            up: false,
            down: false,
            type: "none",
        };
    }

    getAxis(gameControllerIndex) {
        const axis = this.axisData[gameControllerIndex] || [0, 0]; // Get axis from stored data, or return [0, 0] if no axis

        // Apply axisDeadzone: If the axis value is within the axisDeadzone, set it to zero
        const filteredAxis = axis.map(axis => Math.abs(axis) < this.axisDeadzone[gameControllerIndex] ? 0 : axis);

        return filteredAxis; // Return axis after axisDeadzone processing
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
    mapButtonLetters(gameControllerIndex, buttonNames) {
        if (this.gameControllers.length <= 0) return;
        if (this.gameControllers[gameControllerIndex]) {
            this.buttonNames[gameControllerIndex] = buttonNames;
        } else {
            console.error(`GameController at index ${gameControllerIndex} not found.`);
        }
    }

    wasButtonLetterPressed(gameControllerIndex, buttonName) {
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

    isButtonLetterDown(gameControllerIndex, buttonName) {
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

    wasButtonLetterReleased(gameControllerIndex, buttonName) {
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
