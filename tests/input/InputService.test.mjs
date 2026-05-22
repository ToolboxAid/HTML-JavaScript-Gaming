/*
Toolbox Aid
David Quesenberry
03/21/2026
InputService.test.mjs
*/
import InputService from '../../src/engine/input/InputService.js';
import InputMap from '../../src/engine/input/InputMap.js';

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
    const inputMap = new InputMap({
        moveLeft: ['ArrowLeft', 'KeyA'],
        moveRight: ['ArrowRight', 'KeyD'],
    });
    const input = new InputService({ target, inputMap, getGamepads: () => [] });

    input.attach();
    target.dispatch('keydown', { code: 'KeyA' });
    input.update();

    assert(input.isDown('KeyA') === true, 'Raw keyboard state should still work.');
    assert(input.isActionDown('moveLeft') === true, 'Action should resolve from mapped key.');
    assert(input.isActionPressed('moveLeft') === true, 'Action should be pressed on first mapped frame.');

    input.update();
    assert(input.isActionPressed('moveLeft') === false, 'Held mapped key should not re-trigger pressed state.');

    target.dispatch('keyup', { code: 'KeyA' });
    target.dispatch('keydown', { code: 'ArrowRight' });
    input.update();

    assert(input.isActionDown('moveLeft') === false, 'Released mapped inputs should clear the action.');
    assert(input.isActionDown('moveRight') === true, 'Alternative mapped action should resolve normally.');

    const snapshot = input.getActionSnapshot();
    assert(snapshot.moveRight.down === true, 'Action snapshot should expose current action state.');
    assert(Array.isArray(snapshot.moveRight.inputs), 'Action snapshot should expose bound inputs.');

    target.dispatch('pointerdown', { button: 0, pointerId: 7, clientX: 10, clientY: 12 });
    target.dispatch('pointermove', { pointerId: 7, clientX: 30, clientY: 42 });
    target.dispatch('pointerup', { pointerId: 7, clientX: 50, clientY: 52 });
    const dragSnapshot = input.getPointerDragSnapshot();
    assert(dragSnapshot.wasReleased === true, 'Pointer drag should track drag release state.');
    assert(dragSnapshot.dragBounds.width === 40, 'Pointer drag bounds should track drag width.');
    assert(dragSnapshot.dragBounds.height === 40, 'Pointer drag bounds should track drag height.');
    const dragRectangle = input.getPointerDragDescriptor('MousePrimaryDragRectangle');
    assert(dragRectangle.label === 'Mouse Primary Drag Rectangle', 'Pointer drag descriptors should expose rectangle gestures.');
    assert(dragRectangle.source === 'mouse', 'Pointer drag descriptors should remain schema-compatible mouse inputs.');

    input.detach();
}
