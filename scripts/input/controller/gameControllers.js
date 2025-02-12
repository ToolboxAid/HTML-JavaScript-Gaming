// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// gameControllerMap.js

import GamepadManager from "./gamepadManager.js";
import GamepadState from "./gamepadState.js";
import GamepadMapper from "./gamepadMapper.js";
import Receiver from '../../../scripts/messages/receiver.js';
import EventBus from '../../../scripts/messages/eventBus.js';
import { DPadType } from "./gamepadEnums.js";
import { GAMEPAD_EVENT } from './gamepadManager.js';

import GamepadDebugger from "./gamepadDebugger.js";

class GameControllers {
    // Use shared EventBus
    static sender = EventBus.getInstance();
    static receiver = new Receiver(GameControllers.sender, GAMEPAD_EVENT);

    static count = 0; // this is used to prevent spamming not founds.
    static showMessage = true;

    messageWarn(message) {
        if (this.showMessage) {
            console.warn(message);
        }
    }
    messageError(message) {
        if (this.showMessage) {
            console.error(message);
        }
    }

    constructor() {
        this.gamepadManager = new GamepadManager();
        this.gamepadStates = Array.from({ length: 4 }, () => new GamepadState());
        this.gamepadMappers = Array.from({ length: 4 }, () => null);

        // Register the controllerChange method as the event handler
        GameControllers.sender.addEventListener(GAMEPAD_EVENT, this.controllerChange.bind(this));

        this.gamepadManager.start();
    }

    getConnectedGamepads() {
        return this.gamepadManager.gameControllers.filter(controller => controller !== null);
    }

    // Method to handle the controller change event
    controllerChange(data) {
        const [action, index, id] = data;

        if (action === 'connected') {
            // Create new mapper with gamepad ID for config lookup
            this.gamepadMappers[index] = new GamepadMapper(index, id);
            console.log(this.gamepadMappers[index]);
        } else if (action === 'disconnected') {
            this.gamepadMappers[index] = null;
        } else {
            console.Error("'controllerChange' - What do you want me to do?");
        }

        console.log(`Controller action: ${action} - Index: ${index}, ID: ${id}, details:`, this);
    }

    update() {
        if (GameControllers.count++ > 60) {
            GameControllers.count = 0;
        }

        this.gamepadManager.gameControllers.forEach((gameController, index) => {
            this.gamepadStates[index].update(gameController);
        });
    }

    getDPadType(gameControllerIndex) {
        const mapper = this.gamepadMappers[gameControllerIndex];
        if (!mapper) {
            this.messageError(`Gamepad mapper not found for index ${gameControllerIndex}`);
            return DPadType.NONE;
        }
        return mapper.getDPadType();
    }

    getDPad(gameControllerIndex) {
        const mapper = this.gamepadMappers[gameControllerIndex];
        if (!mapper) return { left: false, right: false, up: false, down: false, type: DPadType.INVALID };

        const type = mapper.getDPadType();

        if (type === DPadType.BUTTON) {
            return {
                left: this.isButtonNameDown(gameControllerIndex, "DPadLEFT"),
                right: this.isButtonNameDown(gameControllerIndex, "DPadRIGHT"),
                up: this.isButtonNameDown(gameControllerIndex, "DPadUP"),
                down: this.isButtonNameDown(gameControllerIndex, "DPadDOWN"),
                type: DPadType.BUTTON,
            };
        } else if (type === DPadType.AXIS) {
            const axisX = this.getAxisByName(gameControllerIndex, "DPadX");
            const axisY = this.getAxisByName(gameControllerIndex, "DPadY");

            const deadzone = mapper.axisDeadzone;
            return {
                left: axisX < -deadzone,
                right: axisX > deadzone,
                up: axisY < -deadzone,
                down: axisY > deadzone,
                type: DPadType.AXIS,
            };
        }

        return { left: false, right: false, up: false, down: false, type: DPadType.NOTFOUND };
    }

    // Map button and axis names for a specific game controller
    mapButtonNames(gameControllerIndex, buttonNames) {
        if (!this.gamepadMappers[gameControllerIndex]) {
            this.gamepadMappers[gameControllerIndex] = new GamepadMapper(gameControllerIndex);
        }
        this.gamepadMappers[gameControllerIndex].buttonNames = buttonNames;
    }

    mapAxisNames(gameControllerIndex, axisNames) {
        if (!this.gamepadMappers[gameControllerIndex]) {
            this.gamepadMappers[gameControllerIndex] = new GamepadMapper(gameControllerIndex);
        }
        this.gamepadMappers[gameControllerIndex].axisNames = axisNames;
    }

    // --------------------------------------------
    // Look up a button value by name
    // --------------------------------------------
    wasButtonNamePressed(gameControllerIndex, buttonName) {
        const mapper = this.gamepadMappers[gameControllerIndex];
        if (!mapper) {
            this.messageError(`Gamepad mapper not found for index ${gameControllerIndex}`);
            return false;
        }

        const buttonIndex = mapper.getButtonIndex(buttonName);
        if (buttonIndex === -1) {
            this.messageError(`Button name "${buttonName}" not found for game controller at index ${gameControllerIndex}`);
            return false;
        }

        // Use the isButtonIndexDown method to check if the button is pressed
        return this.wasButtonIndexPressed(gameControllerIndex, buttonIndex);
    }
    isButtonNameDown(gameControllerIndex, buttonName) {
        const mapper = this.gamepadMappers[gameControllerIndex];
        if (!mapper) {
            this.messageError(`Gamepad mapper not found for index ${gameControllerIndex}`);
            return false;
        }

        const buttonIndex = mapper.getButtonIndex(buttonName);
        if (buttonIndex === -1) {
            this.messageError(`Button name "${buttonName}" not found for game controller at index ${gameControllerIndex}`);
            return false;
        }

        // Use the isButtonIndexDown method to check if the button is pressed
        return this.isButtonIndexDown(gameControllerIndex, buttonIndex);
    }
    wasButtonNameReleased(gameControllerIndex, buttonName) {
        const mapper = this.gamepadMappers[gameControllerIndex];
        if (!mapper) {
            this.messageError(`Gamepad mapper not found for index ${gameControllerIndex}`);
            return false;
        }

        const buttonIndex = mapper.getButtonIndex(buttonName);
        if (buttonIndex === -1) {
            this.messageError(`Button name "${buttonName}" not found for game controller at index ${gameControllerIndex}`);
            return false;
        }

        // Use the isButtonIndexDown method to check if the button is pressed
        return this.wasButtonIndexReleased(gameControllerIndex, buttonIndex);
    }

    // --------------------------------------------
    // Look up a button value by index
    // --------------------------------------------
    wasButtonIndexPressed(gameControllerIndex, buttonIndex) {
        const gamepadState = this.gamepadStates[gameControllerIndex];
        if (!gamepadState) {
            this.messageError(`Gamepad state not found for index ${gameControllerIndex}`);
            return false;
        }
        return gamepadState.buttonsPressed.has(buttonIndex);
    }
    isButtonIndexDown(gameControllerIndex, buttonIndex) {
        const gamepadState = this.gamepadStates[gameControllerIndex];
        if (!gamepadState) {
            this.messageError(`Gamepad state not found for index ${gameControllerIndex}`);
            return false;
        }
        return gamepadState.buttonsDown.has(buttonIndex);
    }
    wasButtonIndexReleased(gameControllerIndex, buttonIndex) {
        const gamepadState = this.gamepadStates[gameControllerIndex];
        if (!gamepadState) {
            this.messageError(`Gamepad state not found for index ${gameControllerIndex}`);
            return false;
        }
        return gamepadState.buttonsReleased.has(buttonIndex);
    }

    // Look up an axis value by name
    getAxisByName(gameControllerIndex, axisName) {
        const mapper = this.gamepadMappers[gameControllerIndex];
        if (!mapper) {
            this.messageError(`Gamepad mapper not found for index ${gameControllerIndex}`);
            return 0;
        }

        const axisIndex = mapper.getAxisIndex(axisName);

        if (axisIndex === -1) {
            this.messageError(`Axis name "${axisName}" not found for game controller at index ${gameControllerIndex}`);
            return 0;
        }

        // Use the getAxisByIndex method to get the axis value
        return this.getAxisByIndex(gameControllerIndex, axisIndex);
    }

    // Get the value of an axis (by index)
    getAxisByIndex(gameControllerIndex, axisIndex) {
        const gamepadState = this.gamepadStates[gameControllerIndex];
        if (!gamepadState) {
            this.messageError(`Gamepad state not found for index ${gameControllerIndex}`);
            return 0;
        }
        const gamepadMappers = this.gamepadMappers[gameControllerIndex];
        if (!gamepadMappers) {
            this.messageError(`Gamepad mapper not found for index ${gameControllerIndex}`);
            return 0;
        }
        // Apply deadzone logic
        const deadzone = this.gamepadMappers[gameControllerIndex].axisDeadzone;// 0.2;//this.gamepadMappers.axisDeadzone;
        const axisValue = gamepadState.getAxisByIndexRaw(axisIndex);
        const filteredValue = Math.abs(axisValue) < deadzone ? 0 : axisValue;

        return filteredValue;
    }
}

export default GameControllers;