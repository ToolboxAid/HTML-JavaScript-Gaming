// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// gamepadMapper.js

import { DPadType } from "./gamepadEnums.js";
import GameControllerMap from "./gameControllerMap.js";

class GamepadMapper {
    constructor(gameControllerIndex, gamepadId) {
        this.gameControllerIndex = gameControllerIndex;

        // Get configuration from GameControllerMap
        const config = GameControllerMap.controllerConfigs[gamepadId] ||
                       GameControllerMap.controllerConfigs["default"];

        // Set properties from config
        this.buttonNames = config.buttonNames;
        this.axisNames = config.axisNames;
        this.axisDeadzone = config.axisDeadzone;
        this.DPadType = this.getDPadType();
        console.log(this);
    }

    // Allow override from game
    mapButtonNames(buttonNames) {
        this.buttonNames = buttonNames;
    }

    // Allow override from game
    mapAxisNames(axisNames) {
        this.axisNames = axisNames;
    }

    // Get the index of a button by name
    getButtonIndex(buttonName) {
        return this.buttonNames.indexOf(buttonName);
    }

    // Get the index of an axis by name
    getAxisIndex(axisName) {
        return this.axisNames.indexOf(axisName);
    }

    getDPadType() {
        // Ensure buttonNames and axisNames are arrays before using includes()
        if (!Array.isArray(this.buttonNames) || !Array.isArray(this.axisNames)) {
            return DPadType.NONE;
        }

        const dPadButtonNames = ["DPadUP", "DPadDOWN", "DPadLEFT", "DPadRIGHT"];
        const dPadAxisNames = ["DPadX", "DPadY"];

        const isDPadButtons = dPadButtonNames.some(name => this.buttonNames.includes(name));
        const isDPadAxes = dPadAxisNames.some(name => this.axisNames.includes(name));

        if (isDPadButtons) return DPadType.BUTTON;
        if (isDPadAxes) return DPadType.AXIS;
        return DPadType.NONE;
    }

}

export default GamepadMapper;
