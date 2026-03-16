// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameControllerButtonsTest.js

import {
    D_PAD_BUTTON_NAMES,
    GAMEPAD_BUTTONS,
    getDPadState,
    wasDPadDirectionPressed,
    wasPrimaryActionPressed,
    wasSecondaryActionPressed,
    wasSelectPressed,
    wasStartPressed
} from '../../../../engine/input/controller/gameControllerButtons.js';

class MockGameControllers {
    constructor({ pressedIndexes = [], pressedNames = [], dPadState = null } = {}) {
        this.pressedIndexes = new Set(pressedIndexes);
        this.pressedNames = new Set(pressedNames);
        this.dPadState = dPadState;
    }

    wasButtonIndexPressed(controllerIndex, buttonIndex) {
        return controllerIndex === 0 && this.pressedIndexes.has(buttonIndex);
    }

    wasButtonNamePressed(controllerIndex, buttonName) {
        return controllerIndex === 0 && this.pressedNames.has(buttonName);
    }

    getDPad(controllerIndex) {
        return controllerIndex === 0 ? this.dPadState : null;
    }
}

export function testGameControllerButtons(assert) {
    assert(GAMEPAD_BUTTONS.primary === 0, 'GAMEPAD_BUTTONS.primary should map to button 0');
    assert(GAMEPAD_BUTTONS.secondary === 1, 'GAMEPAD_BUTTONS.secondary should map to button 1');
    assert(GAMEPAD_BUTTONS.select === 8, 'GAMEPAD_BUTTONS.select should map to button 8');
    assert(GAMEPAD_BUTTONS.start === 9, 'GAMEPAD_BUTTONS.start should map to button 9');

    assert(D_PAD_BUTTON_NAMES.up === 'DPadUP', 'D_PAD_BUTTON_NAMES.up should map to DPadUP');
    assert(D_PAD_BUTTON_NAMES.down === 'DPadDOWN', 'D_PAD_BUTTON_NAMES.down should map to DPadDOWN');
    assert(D_PAD_BUTTON_NAMES.left === 'DPadLEFT', 'D_PAD_BUTTON_NAMES.left should map to DPadLEFT');
    assert(D_PAD_BUTTON_NAMES.right === 'DPadRIGHT', 'D_PAD_BUTTON_NAMES.right should map to DPadRIGHT');

    const controllers = new MockGameControllers({
        pressedIndexes: [0, 1, 8, 9],
        pressedNames: ['DPadLEFT', 'DPadUP'],
        dPadState: { left: true, right: false, up: true, down: false }
    });

    assert(wasPrimaryActionPressed(controllers), 'wasPrimaryActionPressed should detect button 0');
    assert(wasSecondaryActionPressed(controllers), 'wasSecondaryActionPressed should detect button 1');
    assert(wasSelectPressed(controllers), 'wasSelectPressed should detect button 8');
    assert(wasStartPressed(controllers), 'wasStartPressed should detect button 9');

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
