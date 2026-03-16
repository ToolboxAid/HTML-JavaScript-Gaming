// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameControllersSemanticTest.js

import GameControllers from '../../../../engine/input/controller/gameControllers.js';
import GamepadMapper from '../../../../engine/input/controller/gamepadMapper.js';

function createControllers() {
    const controllers = Object.create(GameControllers.prototype);
    controllers.gamepadManager = {
        gameControllers: [{ id: 'Pad 0' }]
    };
    controllers.gamepadStates = [
        {
            buttonsPressed: new Set([1, 2, 8, 9, 14, 12]),
            buttonsDown: new Set([14, 12]),
            buttonsReleased: new Set(),
            getAxisByIndexRaw(axisIndex) {
                return [0, 0][axisIndex] || 0;
            }
        }
    ];
    controllers.gamepadMappers = [
        {
            axisDeadzone: 0.1,
            shortName: 'Test Pad',
            buttonNames: ['', 'A', 'B', '', '', '', '', '', 'Select', 'Start', '', '', 'DPadUP', 'DPadDOWN', 'DPadLEFT', 'DPadRIGHT'],
            axisNames: ['DPadX', 'DPadY'],
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
    assert(controllers.isConnected(0) === true, 'GameControllers should report connected pads through isConnected');
    assert(controllers.isConnected(1) === false, 'GameControllers should report missing pads as disconnected');
    assert(controllers.getButtonsDown(0).includes(14), 'GameControllers should expose buttonsDown through a read-only helper');
    assert(controllers.getButtonsPressed(0).includes(1), 'GameControllers should expose buttonsPressed through a read-only helper');
    assert(Array.isArray(controllers.getButtonsReleased(0)), 'GameControllers should expose buttonsReleased through a read-only helper');
    assert(controllers.getTrackedControllerIndices().includes(0), 'GameControllers should expose tracked connected controller indices');
    assert(controllers.getButtonEntries(0).some((buttonEntry) => buttonEntry.index === 14 && buttonEntry.name === 'DPadLEFT'),
        'GameControllers should expose mapped button names with their original indices');
    assert(controllers.getAxisNames(0).includes('DPadX'), 'GameControllers should expose mapped axis names');
    assert(controllers.getNamedAxisValues(0).some((axisEntry) => axisEntry.name === 'DPadX' && axisEntry.value === 0),
        'GameControllers should expose named axis values through a read-only helper');
    const snapshot = controllers.getControllerSnapshot(0);
    assert(snapshot !== null && snapshot.index === 0, 'GameControllers should expose a controller snapshot for connected pads');
    assert(snapshot.id === 'Pad 0', 'GameControllers controller snapshots should include the device id');
    assert(snapshot.shortName === 'Test Pad', 'GameControllers controller snapshots should include the mapper shortName');
    assert(snapshot.buttonsDown.includes(14), 'GameControllers controller snapshots should include buttonsDown');
    assert(snapshot.dPad.left === true, 'GameControllers controller snapshots should include d-pad state');
    assert(snapshot.axisValues.some((axisEntry) => axisEntry.name === 'DPadX'), 'GameControllers controller snapshots should include named axis values');
    assert(controllers.getControllerSnapshot(1) === null, 'GameControllers should return null snapshots for disconnected pads');

    const emptyControllers = Object.create(GameControllers.prototype);
    emptyControllers.gamepadManager = {
        gameControllers: []
    };
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
