// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameControllerButtonsTest.js

import {
    getDPadState,
    wasDPadDirectionPressed,
    wasPrimaryActionPressed,
    wasSecondaryActionPressed,
    wasSelectPressed,
    wasStartPressed
} from '../../../../engine/input/controller/gameControllerButtons.js';
import { D_PAD_BUTTON_NAMES, GAMEPAD_BUTTON_NAMES } from '../../../../engine/input/controller/gamepadEnums.js';

class MockGameControllers {
    constructor({ pressedNames = [], dPadState = null } = {}) {
        this.pressedNames = new Set(pressedNames);
        this.dPadState = dPadState;
    }

    wasButtonNamePressed(controllerIndex, buttonName) {
        return controllerIndex === 0 && this.pressedNames.has(buttonName);
    }

    getDPad(controllerIndex) {
        return controllerIndex === 0 ? this.dPadState : null;
    }
}

export function testGameControllerButtons(assert) {
    assert(GAMEPAD_BUTTON_NAMES.primary === 'A', 'GAMEPAD_BUTTON_NAMES.primary should map to A');
    assert(GAMEPAD_BUTTON_NAMES.secondary === 'B', 'GAMEPAD_BUTTON_NAMES.secondary should map to B');
    assert(GAMEPAD_BUTTON_NAMES.select === 'Select', 'GAMEPAD_BUTTON_NAMES.select should map to Select');
    assert(GAMEPAD_BUTTON_NAMES.start === 'Start', 'GAMEPAD_BUTTON_NAMES.start should map to Start');

    assert(D_PAD_BUTTON_NAMES.up === 'DPadUP', 'D_PAD_BUTTON_NAMES.up should map to DPadUP');
    assert(D_PAD_BUTTON_NAMES.down === 'DPadDOWN', 'D_PAD_BUTTON_NAMES.down should map to DPadDOWN');
    assert(D_PAD_BUTTON_NAMES.left === 'DPadLEFT', 'D_PAD_BUTTON_NAMES.left should map to DPadLEFT');
    assert(D_PAD_BUTTON_NAMES.right === 'DPadRIGHT', 'D_PAD_BUTTON_NAMES.right should map to DPadRIGHT');

    const controllers = new MockGameControllers({
        pressedNames: ['A', 'B', 'Select', 'Start', 'DPadLEFT', 'DPadUP'],
        dPadState: { left: true, right: false, up: true, down: false }
    });

    assert(wasPrimaryActionPressed(controllers), 'wasPrimaryActionPressed should detect A');
    assert(wasSecondaryActionPressed(controllers), 'wasSecondaryActionPressed should detect B');
    assert(wasSelectPressed(controllers), 'wasSelectPressed should detect Select');
    assert(wasStartPressed(controllers), 'wasStartPressed should detect Start');

    assert(wasDPadDirectionPressed(controllers, 'left'), 'wasDPadDirectionPressed should detect DPadLEFT');
    assert(wasDPadDirectionPressed(controllers, 'up'), 'wasDPadDirectionPressed should detect DPadUP');
    assert(wasDPadDirectionPressed(controllers, 'right') === false, 'wasDPadDirectionPressed should return false for unpressed directions');
    assert(wasDPadDirectionPressed(controllers, 'invalid') === false, 'wasDPadDirectionPressed should return false for unknown directions');

    const dPadState = getDPadState(controllers);
    assert(dPadState.left === true && dPadState.up === true, 'getDPadState should return the controller d-pad state');

    assert(wasPrimaryActionPressed(null) === false, 'wasPrimaryActionPressed should handle missing controllers');
    assert(wasDPadDirectionPressed(null, 'left') === false, 'wasDPadDirectionPressed should handle missing controllers');
    assert(getDPadState(null) === null, 'getDPadState should return null when controllers are missing');
}
