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

    target.dispatch('blur');
    input.update();
    assert(input.isDown('ArrowRight') === false, 'Blur should clear all keys.');

    target.dispatch('keydown', { code: 'Space' });
    input.update();
    const snapshot = input.getSnapshot();
    snapshot.down.add('InjectedKey');
    assert(input.isDown('InjectedKey') === false, 'Snapshots must not mutate internal state.');

    input.detach();
    target.dispatch('keydown', { code: 'ArrowLeft' });
    input.update();
    assert(input.isDown('ArrowLeft') === false, 'Detached input should ignore new events.');
}
