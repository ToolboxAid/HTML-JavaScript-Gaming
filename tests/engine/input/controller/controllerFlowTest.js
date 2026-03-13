import GameControllers from '../../../../engine/input/controller/gameControllers.js';

function installWindowHarness() {
    const listeners = new Map();
    const originalAddEventListener = window.addEventListener;
    const originalRemoveEventListener = window.removeEventListener;
    const originalSetInterval = globalThis.setInterval;
    const originalClearInterval = globalThis.clearInterval;
    const originalNavigator = globalThis.navigator;

    let intervalId = 0;
    const intervalCallbacks = new Map();

    window.addEventListener = (eventName, listener) => {
        if (!listeners.has(eventName)) {
            listeners.set(eventName, new Set());
        }
        listeners.get(eventName).add(listener);
    };

    window.removeEventListener = (eventName, listener) => {
        listeners.get(eventName)?.delete(listener);
    };

    globalThis.setInterval = (callback) => {
        intervalId += 1;
        intervalCallbacks.set(intervalId, callback);
        return intervalId;
    };

    globalThis.clearInterval = (id) => {
        intervalCallbacks.delete(id);
    };

    globalThis.navigator = {
        getGamepads() {
            return [];
        }
    };

    return {
        triggerWindowEvent(eventName, payload) {
            listeners.get(eventName)?.forEach((listener) => listener(payload));
        },
        cleanup() {
            window.addEventListener = originalAddEventListener;
            window.removeEventListener = originalRemoveEventListener;
            globalThis.setInterval = originalSetInterval;
            globalThis.clearInterval = originalClearInterval;
            globalThis.navigator = originalNavigator;
        }
    };
}

export function testControllerFlow(assert) {
    const harness = installWindowHarness();

    try {
        const controllers = new GameControllers();

        const mappedId = 'USB gamepad (Vendor: 081f Product: e401)';
        harness.triggerWindowEvent('gamepadconnected', {
            gamepad: {
                index: 0,
                id: mappedId
            }
        });

        assert(controllers.gamepadMappers[0] !== null, 'GameControllers should map gamepad on connected event');
        assert(controllers.getDPadType(0) === 'axis', 'GameControllers should detect axis d-pad mapper');

        controllers.gamepadStates[0].axisData = [0.1, -0.3];
        assert(controllers.getAxisByIndex(0, 0) === 0, 'GameControllers should apply deadzone filtering');
        assert(controllers.getAxisByIndex(0, 1) === -0.3, 'GameControllers should preserve axis values outside deadzone');

        const dPad = controllers.getDPad(0);
        assert(dPad.left === false, 'GameControllers axis d-pad left should be false under deadzone');
        assert(dPad.up === true, 'GameControllers axis d-pad up should be true above deadzone');

        harness.triggerWindowEvent('gamepaddisconnected', {
            gamepad: {
                index: 0,
                id: mappedId
            }
        });
        assert(controllers.gamepadMappers[0] === null, 'GameControllers should clear mapper on disconnected event');

        controllers.destroy();
        assert(controllers.gamepadManager.isRunning === false, 'GameControllers destroy should stop gamepad manager');
    } finally {
        harness.cleanup();
    }
}
