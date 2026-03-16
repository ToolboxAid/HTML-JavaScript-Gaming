// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// gameControllers.js

import GamepadManager from "./gamepadManager.js";
import GamepadState from "./gamepadState.js";
import GamepadMapper from "./gamepadMapper.js";
import EventBus from '../../messages/eventBus.js';
import DebugFlag from '../../utils/debugFlag.js';
import DebugLog from '../../utils/debugLog.js';
import { D_PAD_AXIS_NAMES, D_PAD_BUTTON_NAMES, DPadType, GAMEPAD_BUTTON_NAMES } from "./gamepadEnums.js";
import { GAMEPAD_EVENT } from './gamepadManager.js';

class GameControllers {
    static DEBUG = DebugFlag.has('gameControllers');

    // Use shared EventBus
    static sender = EventBus.getInstance();

    static showMessage = true;

    messageWarn(message) {
        if (GameControllers.showMessage) {
            DebugLog.warn(true, 'GameControllers', message);
        }
    }
    messageError(message) {
        if (GameControllers.showMessage) {
            DebugLog.error('GameControllers', message);
        }
    }

    constructor() {
        this.gamepadManager = new GamepadManager();
        this.gamepadStates = Array.from({ length: 4 }, () => new GamepadState());
        this.gamepadMappers = Array.from({ length: 4 }, () => null);
        this.controllerChangeBound = this.controllerChange.bind(this);
        this.isListening = false;

        this.start();
    }

    start() {
        if (this.isListening) {
            return;
        }

        // Register the controllerChange method as the event handler
        GameControllers.sender.addEventListener(GAMEPAD_EVENT, this.controllerChangeBound);
        this.gamepadManager.start();
        this.isListening = true;
    }

    stop() {
        if (!this.isListening) {
            return;
        }

        GameControllers.sender.removeEventListener(GAMEPAD_EVENT, this.controllerChangeBound);
        this.gamepadManager.stop();
        this.isListening = false;
    }

    getConnectedGamepads() {
        return this.gamepadManager.gameControllers.filter(controller => controller !== null);
    }

    isConnected(gameControllerIndex) {
        return this.gamepadManager.gameControllers[gameControllerIndex] !== null &&
            typeof this.gamepadManager.gameControllers[gameControllerIndex] !== 'undefined';
    }

    getButtonsPressed(gameControllerIndex) {
        const buttonsPressed = this.getStateSet(gameControllerIndex, 'buttonsPressed');
        return buttonsPressed ? Array.from(buttonsPressed) : [];
    }

    getButtonsDown(gameControllerIndex) {
        const buttonsDown = this.getStateSet(gameControllerIndex, 'buttonsDown');
        return buttonsDown ? Array.from(buttonsDown) : [];
    }

    getButtonsReleased(gameControllerIndex) {
        const buttonsReleased = this.getStateSet(gameControllerIndex, 'buttonsReleased');
        return buttonsReleased ? Array.from(buttonsReleased) : [];
    }

    getButtonEntries(gameControllerIndex) {
        const mapper = this.getMapper(gameControllerIndex);
        return mapper
            ? mapper.buttonNames
                .map((buttonName, buttonIndex) => ({ index: buttonIndex, name: buttonName }))
                .filter((buttonEntry) => buttonEntry.name)
            : [];
    }

    getAxisNames(gameControllerIndex) {
        const mapper = this.getMapper(gameControllerIndex);
        return mapper ? mapper.axisNames.filter(Boolean) : [];
    }

    getNamedAxisValues(gameControllerIndex) {
        return this.getAxisNames(gameControllerIndex).map((axisName) => ({
            name: axisName,
            value: this.getAxisByName(gameControllerIndex, axisName)
        }));
    }

    ensureMapper(gameControllerIndex, gamepadId = 'default') {
        if (!this.gamepadMappers[gameControllerIndex]) {
            this.gamepadMappers[gameControllerIndex] = new GamepadMapper(gameControllerIndex, gamepadId);
        }

        return this.gamepadMappers[gameControllerIndex];
    }

    handleConnectedController(index, id) {
        const mapper = this.ensureMapper(index, id);
        DebugLog.log(GameControllers.DEBUG, 'GameControllers', 'Mapped controller', mapper);
    }

    handleDisconnectedController(index) {
        this.gamepadMappers[index] = null;
    }

    // Method to handle the controller change event
    controllerChange(data) {
        const [action, index, id] = data;

        if (action === 'connected') {
            this.handleConnectedController(index, id);
        } else if (action === 'disconnected') {
            this.handleDisconnectedController(index);
        } else {
            DebugLog.error('GameControllers', "'controllerChange' - Unknown action.");
        }

        DebugLog.log(GameControllers.DEBUG, 'GameControllers', `Controller action: ${action} - Index: ${index}, ID: ${id}`, this);
    }

    update() {
        this.gamepadManager.gameControllers.forEach((gameController, index) => {
            this.gamepadStates[index].update(gameController);
        });
    }

    getMapper(gameControllerIndex) {
        const mapper = this.gamepadMappers[gameControllerIndex];
        if (!mapper) {
            this.messageError(`Gamepad mapper not found for index ${gameControllerIndex}`);
            return null;
        }

        return mapper;
    }

    getGamepadState(gameControllerIndex) {
        const gamepadState = this.gamepadStates[gameControllerIndex];
        if (!gamepadState) {
            this.messageError(`Gamepad state not found for index ${gameControllerIndex}`);
            return null;
        }

        return gamepadState;
    }

    getButtonIndexByName(gameControllerIndex, buttonName) {
        return this.getMappedIndex(gameControllerIndex, buttonName, 'button');
    }

    getAxisIndexByName(gameControllerIndex, axisName) {
        return this.getMappedIndex(gameControllerIndex, axisName, 'axis');
    }

    getDPadType(gameControllerIndex) {
        const mapper = this.getMapper(gameControllerIndex);
        if (!mapper) {
            return DPadType.NONE;
        }
        return mapper.getDPadType();
    }

    getDPad(gameControllerIndex) {
        const mapper = this.getMapper(gameControllerIndex);
        if (!mapper) return { left: false, right: false, up: false, down: false, type: DPadType.INVALID };

        const type = mapper.getDPadType();

        if (type === DPadType.BUTTON) {
            return {
                left: this.isButtonNameDown(gameControllerIndex, D_PAD_BUTTON_NAMES.left),
                right: this.isButtonNameDown(gameControllerIndex, D_PAD_BUTTON_NAMES.right),
                up: this.isButtonNameDown(gameControllerIndex, D_PAD_BUTTON_NAMES.up),
                down: this.isButtonNameDown(gameControllerIndex, D_PAD_BUTTON_NAMES.down),
                type: DPadType.BUTTON,
            };
        } else if (type === DPadType.AXIS) {
            const axisX = this.getAxisByName(gameControllerIndex, D_PAD_AXIS_NAMES.x);
            const axisY = this.getAxisByName(gameControllerIndex, D_PAD_AXIS_NAMES.y);

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
        this.ensureMapper(gameControllerIndex).mapButtonNames(buttonNames);
    }

    mapAxisNames(gameControllerIndex, axisNames) {
        this.ensureMapper(gameControllerIndex).mapAxisNames(axisNames);
    }

    getMappedIndex(gameControllerIndex, inputName, inputType) {
        const mapper = this.getMapper(gameControllerIndex);
        if (!mapper) {
            return -1;
        }

        const getIndex = inputType === 'button' ? mapper.getButtonIndex.bind(mapper) : mapper.getAxisIndex.bind(mapper);
        const inputIndex = getIndex(inputName);
        if (inputIndex === -1) {
            this.messageError(`${inputType === 'button' ? 'Button' : 'Axis'} name "${inputName}" not found for game controller at index ${gameControllerIndex}`);
        }

        return inputIndex;
    }

    getStateSet(gameControllerIndex, stateKey) {
        const gamepadState = this.getGamepadState(gameControllerIndex);
        if (!gamepadState) {
            return null;
        }

        return gamepadState[stateKey];
    }

    // --------------------------------------------
    // Look up a button value by name
    // --------------------------------------------
    wasButtonNamePressed(gameControllerIndex, buttonName) {
        const buttonIndex = this.getButtonIndexByName(gameControllerIndex, buttonName);
        if (buttonIndex === -1) {
            return false;
        }

        return this.wasButtonIndexPressed(gameControllerIndex, buttonIndex);
    }
    isButtonNameDown(gameControllerIndex, buttonName) {
        const buttonIndex = this.getButtonIndexByName(gameControllerIndex, buttonName);
        if (buttonIndex === -1) {
            return false;
        }

        return this.isButtonIndexDown(gameControllerIndex, buttonIndex);
    }
    wasButtonNameReleased(gameControllerIndex, buttonName) {
        const buttonIndex = this.getButtonIndexByName(gameControllerIndex, buttonName);
        if (buttonIndex === -1) {
            return false;
        }

        return this.wasButtonIndexReleased(gameControllerIndex, buttonIndex);
    }

    wasPrimaryActionPressed(gameControllerIndex = 0) {
        return this.wasButtonNamePressed(gameControllerIndex, GAMEPAD_BUTTON_NAMES.primary);
    }

    wasSecondaryActionPressed(gameControllerIndex = 0) {
        return this.wasButtonNamePressed(gameControllerIndex, GAMEPAD_BUTTON_NAMES.secondary);
    }

    wasSelectPressed(gameControllerIndex = 0) {
        return this.wasButtonNamePressed(gameControllerIndex, GAMEPAD_BUTTON_NAMES.select);
    }

    wasStartPressed(gameControllerIndex = 0) {
        return this.wasButtonNamePressed(gameControllerIndex, GAMEPAD_BUTTON_NAMES.start);
    }

    wasDPadDirectionPressed(direction, gameControllerIndex = 0) {
        const buttonName = D_PAD_BUTTON_NAMES[direction];
        if (!buttonName) {
            return false;
        }

        return this.wasButtonNamePressed(gameControllerIndex, buttonName);
    }

    // --------------------------------------------
    // Look up a button value by index
    // --------------------------------------------
    wasButtonIndexPressed(gameControllerIndex, buttonIndex) {
        const buttonsPressed = this.getStateSet(gameControllerIndex, 'buttonsPressed');
        if (!buttonsPressed) {
            return false;
        }
        return buttonsPressed.has(buttonIndex);
    }
    isButtonIndexDown(gameControllerIndex, buttonIndex) {
        const buttonsDown = this.getStateSet(gameControllerIndex, 'buttonsDown');
        if (!buttonsDown) {
            return false;
        }
        return buttonsDown.has(buttonIndex);
    }
    wasButtonIndexReleased(gameControllerIndex, buttonIndex) {
        const buttonsReleased = this.getStateSet(gameControllerIndex, 'buttonsReleased');
        if (!buttonsReleased) {
            return false;
        }
        return buttonsReleased.has(buttonIndex);
    }

    // Look up an axis value by name
    getAxisByName(gameControllerIndex, axisName) {
        const axisIndex = this.getAxisIndexByName(gameControllerIndex, axisName);
        if (axisIndex === -1) {
            return 0;
        }

        return this.getAxisByIndex(gameControllerIndex, axisIndex);
    }

    // Get the value of an axis (by index)
    getAxisByIndex(gameControllerIndex, axisIndex) {
        const gamepadState = this.getGamepadState(gameControllerIndex);
        if (!gamepadState) {
            return 0;
        }
        const gamepadMapper = this.getMapper(gameControllerIndex);
        if (!gamepadMapper) {
            return 0;
        }

        const deadzone = gamepadMapper.axisDeadzone;
        const axisValue = gamepadState.getAxisByIndexRaw(axisIndex);
        return Math.abs(axisValue) < deadzone ? 0 : axisValue;
    }

    destroy() {
        this.stop();
        this.controllerChangeBound = null;
    }
}

export default GameControllers;
