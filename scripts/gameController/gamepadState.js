// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// gamepadState.js

class GamepadState {
    constructor(gameControllerIndex) {
        this.gameControllerIndex = gameControllerIndex;
        this.buttonsPressed = new Set();
        this.buttonsDown = new Set();
        this.buttonsReleased = new Set();
        this.axisData = [];
    }

    update(gameController) {
        if (!gameController) return;

        this.axisData = gameController.axes;

        this.buttonsPressed.clear();
        this.buttonsReleased.clear();

        gameController.buttons.forEach((button, buttonIndex) => {
            if (button.pressed) {
                if (!this.buttonsDown.has(buttonIndex)) {
                    this.buttonsPressed.add(buttonIndex);
                }
                this.buttonsDown.add(buttonIndex);
            } else {
                if (this.buttonsDown.has(buttonIndex)) {
                    this.buttonsReleased.add(buttonIndex);
                    this.buttonsDown.delete(buttonIndex);
                }
            }
        });
    }

    getButtonsPressed() {
        return Array.from(this.buttonsPressed);
    }

    getButtonsDown() {
        return Array.from(this.buttonsDown);
    }

    getButtonsReleased() {
        return Array.from(this.buttonsReleased);
    }

    getAxisRaw() {
        return this.axisData || [0, 0];
    }

    getAxisByIndexRaw(axisIndex) {
        return this.axisData[axisIndex] || 0;
    }

}

export default GamepadState;
