// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameControllersSemanticTest.js

import GameControllers from '../../../../engine/input/controller/gameControllers.js';
import GamepadMapper from '../../../../engine/input/controller/gamepadMapper.js';

function createControllers() {
    const controllers = Object.create(GameControllers.prototype);
    controllers.gamepadStates = [
        {
            buttonsPressed: new Set([1, 2, 8, 9, 14, 12]),
            buttonsDown: new Set([14, 12]),
            buttonsReleased: new Set()
        }
    ];
    controllers.gamepadMappers = [
        {
            axisDeadzone: 0.1,
            getButtonIndex(buttonName) {
                return {
                    A: 1,
                    B: 2,
                    Select: 8,
                    Start: 9,
                    DPadUP: 12,
                    DPadDOWN: 13,
                    DPadLEFT: 14,
                    DPadRIGHT: 15
                }[buttonName] ?? -1;
            },
            getAxisIndex(axisName) {
                return {
                    DPadX: 0,
                    DPadY: 1
                }[axisName] ?? -1;
            },
            getDPadType() {
                return 'button';
            }
        }
    ];
    controllers.messageError = () => {};
    controllers.messageWarn = () => {};
    return controllers;
}

export function testGameControllersSemantic(assert) {
    const controllers = createControllers();

    assert(controllers.wasPrimaryActionPressed(), 'GameControllers should expose primary action by semantic name');
    assert(controllers.wasSecondaryActionPressed(), 'GameControllers should expose secondary action by semantic name');
    assert(controllers.wasSelectPressed(), 'GameControllers should expose select by semantic name');
    assert(controllers.wasStartPressed(), 'GameControllers should expose start by semantic name');

    assert(controllers.wasDPadDirectionPressed('left'), 'GameControllers should expose left d-pad presses by semantic direction');
    assert(controllers.wasDPadDirectionPressed('up'), 'GameControllers should expose up d-pad presses by semantic direction');
    assert(controllers.wasDPadDirectionPressed('right') === false, 'GameControllers should return false for unpressed d-pad directions');
    assert(controllers.wasDPadDirectionPressed('invalid') === false, 'GameControllers should return false for unknown d-pad directions');

    const dPad = controllers.getDPad(0);
    assert(dPad.left === true && dPad.up === true, 'GameControllers should preserve d-pad state lookup');

    const emptyControllers = Object.create(GameControllers.prototype);
    emptyControllers.gamepadStates = [];
    emptyControllers.gamepadMappers = [];
    emptyControllers.messageError = () => {};
    emptyControllers.messageWarn = () => {};

    const mappedButtonNames = ['Start', 'Select', 'DPadLEFT'];
    const mappedAxisNames = ['DPadX', 'DPadY'];
    emptyControllers.mapButtonNames(0, mappedButtonNames);
    emptyControllers.mapAxisNames(0, mappedAxisNames);

    assert(emptyControllers.gamepadMappers[0] instanceof GamepadMapper, 'mapButtonNames should create a default mapper when missing');
    assert(emptyControllers.gamepadMappers[0].buttonNames === mappedButtonNames, 'mapButtonNames should delegate to the mapper override API');
    assert(emptyControllers.gamepadMappers[0].axisNames === mappedAxisNames, 'mapAxisNames should delegate to the mapper override API');

    emptyControllers.handleConnectedController(1, 'USB gamepad (Vendor: 081f Product: e401)');
    assert(emptyControllers.gamepadMappers[1] instanceof GamepadMapper, 'handleConnectedController should create a mapper for the connected pad');
    emptyControllers.handleDisconnectedController(1);
    assert(emptyControllers.gamepadMappers[1] === null, 'handleDisconnectedController should clear the mapper');

    const loggingControllers = Object.create(GameControllers.prototype);
    const originalShowMessage = GameControllers.showMessage;
    let warnCount = 0;
    let errorCount = 0;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = () => { warnCount += 1; };
    console.error = () => { errorCount += 1; };

    try {
        GameControllers.showMessage = false;
        loggingControllers.messageWarn('hidden warn');
        loggingControllers.messageError('hidden error');
        assert(warnCount === 0 && errorCount === 0, 'GameControllers should honor the static showMessage mute flag');

        GameControllers.showMessage = true;
        loggingControllers.messageWarn('visible warn');
        loggingControllers.messageError('visible error');
        assert(warnCount + errorCount > 0, 'GameControllers should emit logs when the static showMessage flag is enabled');
    } finally {
        GameControllers.showMessage = originalShowMessage;
        console.warn = originalWarn;
        console.error = originalError;
    }
}
