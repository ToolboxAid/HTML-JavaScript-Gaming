// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameControllersSemanticTest.js

import GameControllers from '../../../../engine/input/controller/gameControllers.js';

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
}
