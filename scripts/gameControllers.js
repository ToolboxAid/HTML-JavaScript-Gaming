// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// gampad.js

const gameControllerIndex0 = -90;

class GameControllers {

    static get INDEX_0() { return 0; }
    static get INDEX_1() { return 1; }
    static get INDEX_2() { return 2; }
    static get INDEX_3() { return 3; }

    static get BUTTON_0() { return 0; }
    static get BUTTON_1() { return 1; }
    static get BUTTON_2() { return 2; }
    static get BUTTON_3() { return 3; }
    static get BUTTON_4() { return 4; }
    static get BUTTON_5() { return 5; }
    static get BUTTON_6() { return 6; }
    static get BUTTON_7() { return 7; }
    static get BUTTON_8() { return 8; }
    static get BUTTON_9() { return 9; }

    constructor() {
        this.gameControllers = []; // Array to store the state of connected gameControllers
        this.axesData = []; // Separate storage for axes data

        this.buttonsPressed = Array.from({ length: 4 }, () => new Set());  // Buttons just pressed
        this.buttonsDown = Array.from({ length: 4 }, () => new Set());     // Buttons currently pressed
        this.buttonsReleased = Array.from({ length: 4 }, () => new Set()); // Buttons just released

        this.deadzone = 0.2; // Deadzone threshold for analog inputs

        // Automatically poll for gameController updates
        this.pollInterval = setInterval(this.pollGameControllers.bind(this), 16); // ~60 FPS or 16mS = 0.016S

        // Cleanup when the page is unloaded (or game is paused)
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

    update() {
        this.gameControllers.forEach((gameController, index) => {
            if (!gameController) return; // Skip disconnected gameControllers

            // Store the raw axes data for each gameController
            this.axesData[index] = gameController.axes;

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

    // Utility methods
    getButtonsPressed(gameController) {
        return Array.from(this.buttonsPressed[gameController]);
    }

    getButtonsDown(gameController) {
        return Array.from(this.buttonsDown[gameController]);
    }

    getButtonsReleased(gameController) {
        return Array.from(this.buttonsReleased[gameController]);
    }

    isButtonJustPressed(gameController, buttonIndex) {
        return this.buttonsPressed[gameController].has(buttonIndex);
    }

    isButtonDown(gameController, buttonIndex) {
        return this.buttonsDown[gameController].has(buttonIndex);
    }

    isButtonReleased(gameController, buttonIndex) {
        return this.buttonsReleased[gameController].has(buttonIndex);
    }

    getAxes(gameControllerIndex) {
        const axes = this.axesData[gameControllerIndex] || [0, 0]; // Get axes from stored data, or return [0, 0] if no axes

        // Apply deadzone: If the axis value is within the deadzone, set it to zero
        const deadzone = this.deadzone;
        const filteredAxes = axes.map(axis => Math.abs(axis) < deadzone ? 0 : axis);

        return filteredAxes; // Return axes after deadzone processing
    }

    getGameController(gameControllerIndex) {
        return this.gameControllers[gameControllerIndex];
    }

    getGameControllerDPad(gameControllerIndex = 0) {
        if (!GameControllers.debug || gameControllerIndex < 0) return { left: false, right: false, up: false, down: false, };;

        return {
            left: this.axesData[gameControllerIndex][0] < -0.5,
            right: this.axesData[gameControllerIndex][0] > 0.5,
            up: this.axesData[gameControllerIndex][1] < -0.5,
            down: this.axesData[gameControllerIndex][1] > 0.5,
        };
    }

    static number = 301;
    static debug = true;
    logGameController(gameControllerIndex = 0) {
        if (!GameControllers.debug || gameControllerIndex < 0) return;

        if (GameControllers.number++ > 60 * 5) {
            GameControllers.number = 0;
            console.group(`GameController [${gameControllerIndex}]`);
            console.log('ID:', this.gameControllers[gameControllerIndex].id);
            console.log('Buttons:', this.gameControllers[gameControllerIndex].buttons.length);
            console.log('Axes:', this.gameControllers[gameControllerIndex].axes.length);
            console.log("controller", 'Axes:', this.gameControllers[gameControllerIndex]);
            console.log("dPad", this.getGameControllerDPad(gameControllerIndex));
            console.groupEnd();
        }
    }

    // Disconnect the gameController polling when no longer needed
    disconnect() {
        clearInterval(this.pollInterval); // Stop polling gameControllers
    }
}

export default GameControllers;
