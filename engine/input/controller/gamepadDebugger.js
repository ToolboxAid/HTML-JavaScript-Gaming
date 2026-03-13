// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// gamepadDebugger.js

import DebugFlag from "../../utils/debugFlag.js";
import DebugLog from "../../utils/debugLog.js";

class GamepadDebugger {
    static DEBUG = DebugFlag.has('gamepadDebugger');

    static logGameController(gameController) {
        DebugLog.log(this.DEBUG, 'GamepadDebugger', `GameController [${gameController.index}]`);
        DebugLog.log(this.DEBUG, 'GamepadDebugger', 'ID:', gameController.id);
        DebugLog.log(this.DEBUG, 'GamepadDebugger', 'Buttons:', gameController.buttons.length);
        DebugLog.log(this.DEBUG, 'GamepadDebugger', 'Axes:', gameController.axes.length);
    }

    static logPressedButtons(buttonsPressed, buttonNames) {
        buttonsPressed.forEach((buttonIndex) => {
            DebugLog.log(this.DEBUG, 'GamepadDebugger', `Button Index: ${buttonIndex}, Name: ${buttonNames[buttonIndex]}`);
        });
    }
}

export default GamepadDebugger;
