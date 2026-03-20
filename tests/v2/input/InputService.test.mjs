import InputService from '../../../engine/v2/input/InputService.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

class FakeEventTarget {
    constructor() {
        this.listeners = new Map();
    }

    addEventListener(type, callback) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }

        this.listeners.get(type).add(callback);
    }

    removeEventListener(type, callback) {
        this.listeners.get(type)?.delete(callback);
    }

    dispatch(type, event = {}) {
        for (const callback of this.listeners.get(type) ?? []) {
            callback(event);
        }
    }
}

export function run() {
    const target = new FakeEventTarget();
    const input = new InputService({ target });

    input.attach();
    target.dispatch('keydown', { code: 'ArrowRight' });
    input.update();

    assert(input.isDown('ArrowRight') === true, 'ArrowRight should be down after keydown.');
    assert(input.isPressed('ArrowRight') === true, 'ArrowRight should be pressed on its first frame.');

    input.update();
    assert(input.isPressed('ArrowRight') === false, 'ArrowRight should not report pressed on subsequent frames.');

    target.dispatch('mousemove', { offsetX: 120, offsetY: 80 });
    target.dispatch('mousedown', { button: 0 });
    input.update();

    const mousePosition = input.getMousePosition();
    const mouseDelta = input.getMouseDelta();
    assert(mousePosition.x === 120 && mousePosition.y === 80, 'Mouse position should update from mousemove.');
    assert(mouseDelta.x === 120 && mouseDelta.y === 80, 'Mouse delta should report movement since the prior frame.');
    assert(input.isMouseDown(0) === true, 'Mouse button should be down after mousedown.');
    assert(input.isMousePressed(0) === true, 'Mouse button should be pressed on its first frame.');

    input.update();
    const settledDelta = input.getMouseDelta();
    assert(settledDelta.x === 0 && settledDelta.y === 0, 'Mouse delta should reset after update when no new movement occurs.');
    assert(input.isMousePressed(0) === false, 'Mouse button should not be pressed again while held.');

    target.dispatch('blur');
    input.update();
    assert(input.isDown('ArrowRight') === false, 'Blur should clear all keys.');
    assert(input.isMouseDown(0) === false, 'Blur should clear all mouse buttons.');

    target.dispatch('keydown', { code: 'Space' });
    target.dispatch('mousemove', { offsetX: 160, offsetY: 100 });
    input.update();
    const snapshot = input.getSnapshot();
    snapshot.keyboard.down.add('InjectedKey');
    snapshot.mouse.down.add(2);
    assert(input.isDown('InjectedKey') === false, 'Keyboard snapshot must not mutate internal state.');
    assert(input.isMouseDown(2) === false, 'Mouse snapshot must not mutate internal state.');

    input.detach();
    target.dispatch('keydown', { code: 'ArrowLeft' });
    target.dispatch('mousedown', { button: 0 });
    input.update();
    assert(input.isDown('ArrowLeft') === false, 'Detached input should ignore new keyboard events.');
    assert(input.isMouseDown(0) === false, 'Detached input should ignore new mouse events.');
}
