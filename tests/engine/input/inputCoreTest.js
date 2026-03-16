import KeyboardInput from '../../../engine/input/keyboard.js';
import InputLifecycle from '../../../engine/input/inputLifecycle.js';
import MouseInput, { LEFT } from '../../../engine/input/mouse.js';
import GamepadState from '../../../engine/input/controller/gamepadState.js';

function installWindowEventHarness() {
    const listeners = new Map();
    const originalAddEventListener = window.addEventListener;
    const originalRemoveEventListener = window.removeEventListener;
    const originalDispatchEvent = window.dispatchEvent;

    window.addEventListener = (eventName, listener) => {
        if (!listeners.has(eventName)) {
            listeners.set(eventName, new Set());
        }
        listeners.get(eventName).add(listener);
    };

    window.removeEventListener = (eventName, listener) => {
        listeners.get(eventName)?.delete(listener);
    };

    window.dispatchEvent = (event) => {
        const eventListeners = listeners.get(event.type);
        if (!eventListeners) {
            return true;
        }

        eventListeners.forEach((listener) => listener(event));
        return true;
    };

    return () => {
        window.addEventListener = originalAddEventListener;
        window.removeEventListener = originalRemoveEventListener;
        window.dispatchEvent = originalDispatchEvent;
    };
}

function testKeyboardLifecycle(assert) {
    const restoreWindow = installWindowEventHarness();

    try {
        const keyboard = new KeyboardInput();

        window.dispatchEvent({ type: 'keydown', code: 'KeyA' });
        keyboard.update();
        assert(keyboard.isKeyPressed('KeyA'), 'KeyboardInput should register keydown');

        keyboard.destroy();
        window.dispatchEvent({ type: 'keydown', code: 'KeyB' });
        keyboard.update();
        assert(!keyboard.isKeyDown('KeyB'), 'KeyboardInput should stop listening after destroy');
    } finally {
        restoreWindow();
    }
}

function testMouseLifecycle(assert) {
    const originalHTMLElement = globalThis.HTMLElement;

    class MockHTMLElement {}
    class MockCanvas extends MockHTMLElement {
        constructor() {
            super();
            this.width = 100;
            this.height = 50;
            this.listeners = new Map();
            this.rect = { left: 0, top: 0, width: 100, height: 50 };
        }

        getBoundingClientRect() {
            return this.rect;
        }

        addEventListener(eventName, listener) {
            if (!this.listeners.has(eventName)) {
                this.listeners.set(eventName, new Set());
            }
            this.listeners.get(eventName).add(listener);
        }

        removeEventListener(eventName, listener) {
            this.listeners.get(eventName)?.delete(listener);
        }

        dispatch(event) {
            this.listeners.get(event.type)?.forEach((listener) => listener(event));
        }
    }

    globalThis.HTMLElement = MockHTMLElement;

    try {
        const canvas = new MockCanvas();
        const mouse = new MouseInput(canvas);

        canvas.dispatch({ type: 'mousedown', button: LEFT });
        mouse.update();
        assert(mouse.isButtonIndexDown(LEFT), 'MouseInput should register mousedown');

        canvas.rect = { left: 10, top: 5, width: 50, height: 25 };
        canvas.dispatch({ type: 'mousemove', clientX: 35, clientY: 15 });
        const position = mouse.getPosition();
        assert(position.x === 50, 'MouseInput should refresh x scaling from current bounds');
        assert(position.y === 20, 'MouseInput should refresh y scaling from current bounds');

        mouse.destroy();
        canvas.dispatch({ type: 'mousedown', button: LEFT });
        mouse.update();
        assert(!mouse.isButtonIndexDown(LEFT), 'MouseInput should stop listening after destroy');
    } finally {
        globalThis.HTMLElement = originalHTMLElement;
    }
}

function testGamepadStateDisconnect(assert) {
    const state = new GamepadState();
    const gameController = {
        axes: [0.25, -0.5],
        buttons: [
            { pressed: true },
            { pressed: false }
        ]
    };

    state.update(gameController);
    assert(state.getButtonsDown().includes(0), 'GamepadState should track pressed buttons');

    state.update(null);
    assert(state.getButtonsDown().length === 0, 'GamepadState should clear buttonsDown when disconnected');
    assert(state.getButtonsReleased().includes(0), 'GamepadState should release held buttons when disconnected');
    assert(state.getAxisRaw().length === 0, 'GamepadState should clear axis data when disconnected');
}

function testInputLifecycleDestroy(assert) {
    let starts = 0;
    let stops = 0;
    let cleanups = 0;

    const lifecycle = new InputLifecycle(
        () => { starts += 1; },
        () => { stops += 1; }
    );

    assert(lifecycle.start() === true, 'InputLifecycle should start once');
    assert(starts === 1, 'InputLifecycle should invoke start callback');

    lifecycle.destroy(() => { cleanups += 1; });
    assert(stops === 1, 'InputLifecycle.destroy should stop active listeners');
    assert(cleanups === 1, 'InputLifecycle.destroy should run cleanup callback');
    assert(lifecycle.startFn === null, 'InputLifecycle.destroy should clear start callback');
    assert(lifecycle.stopFn === null, 'InputLifecycle.destroy should clear stop callback');
    assert(lifecycle.isListening === false, 'InputLifecycle.destroy should reset listening state');
    assert(lifecycle.isDestroyed === true, 'InputLifecycle.destroy should mark the lifecycle destroyed');
    assert(lifecycle.start() === false, 'InputLifecycle should not restart after destroy');
    assert(lifecycle.stop() === false, 'InputLifecycle should no-op stop after destroy');
}

export function testInputCore(assert) {
    testKeyboardLifecycle(assert);
    testMouseLifecycle(assert);
    testGamepadStateDisconnect(assert);
    testInputLifecycleDestroy(assert);
}
