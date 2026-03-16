// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// gamepadMapper.js

import { D_PAD_AXIS_NAMES, D_PAD_BUTTON_NAMES, DPadType } from "./gamepadEnums.js";
import GameControllerMap from "./gameControllerMap.js";
import DebugFlag from "../../utils/debugFlag.js";
import DebugLog from "../../utils/debugLog.js";

class GamepadMapper {
    static DEBUG = DebugFlag.has('gamepadMapper');

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
        DebugLog.log(GamepadMapper.DEBUG, 'GamepadMapper', this);
    }

    // Allow override from game
    mapButtonNames(buttonNames) {
        this.buttonNames = buttonNames;
        this.DPadType = this.getDPadType();
    }

    // Allow override from game
    mapAxisNames(axisNames) {
        this.axisNames = axisNames;
        this.DPadType = this.getDPadType();
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

        const dPadButtonNames = Object.values(D_PAD_BUTTON_NAMES);
        const dPadAxisNames = Object.values(D_PAD_AXIS_NAMES);

        const isDPadButtons = dPadButtonNames.some(name => this.buttonNames.includes(name));
        const isDPadAxes = dPadAxisNames.some(name => this.axisNames.includes(name));

        if (isDPadButtons) return DPadType.BUTTON;
        if (isDPadAxes) return DPadType.AXIS;
        return DPadType.NONE;
    }

}

export default GamepadMapper;
