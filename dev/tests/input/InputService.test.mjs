/*
Toolbox Aid
David Quesenberry
03/21/2026
InputService.test.mjs
*/
import InputService from '../../../www/src/engine/input/InputService.js';
import InputMap from '../../../www/src/engine/input/InputMap.js';

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
    assert(dragRectangle.label === 'Mouse Drag Rectangle', 'Pointer drag descriptors should expose rectangle gestures.');
    assert(dragRectangle.source === 'mouse', 'Pointer drag descriptors should remain schema-compatible mouse inputs.');
    const dragRelease = input.getPointerDragDescriptor('MousePrimaryDragRelease');
    assert(dragRelease.snapshot.dragBounds.width === 40, 'Drag release descriptors should carry drag bounds width.');
    assert(dragRelease.snapshot.dragBounds.height === 40, 'Drag release descriptors should carry drag bounds height.');
    const capabilities = input.getInputDeviceCapabilities({ gamepadCount: 0 });
    assert(capabilities.some((device) => device.label === 'VR Controller'), 'Input capabilities should expose safe VR controller descriptors.');
    assert(!capabilities.some((device) => device.label === 'Wheel'), 'Input capabilities should treat wheel as mouse input instead of a device.');
    const gestures = input.getInputGestureDescriptors({ enabledDeviceIds: ['keyboard', 'mouse'] });
    assert(gestures.some((gesture) => gesture.binding === 'MouseWheelUp'), 'Input gestures should expose wheel descriptors through Mouse when wheel is available.');
    assert(gestures.some((gesture) => gesture.binding === 'CrossDeviceCombo'), 'Input gestures should expose cross-device combos when two combo-capable devices are enabled.');
    assert(
        gestures.find((gesture) => gesture.binding === 'MousePrimaryDrag').title.includes('continuous movement while held'),
        'Gesture descriptors should expose use-case title help.'
    );
    const gesturesWithoutWheelSupport = input.getInputGestureDescriptors({ enabledDeviceIds: ['keyboard', 'mouse'], wheelAvailable: false });
    assert(!gesturesWithoutWheelSupport.some((gesture) => gesture.binding === 'MouseWheelUp'), 'Input gestures should hide wheel descriptors when wheel support is unavailable.');
    assert(!gestures.some((gesture) => gesture.binding === 'MousePrimaryDragRectangle'), 'Visible input gestures should not expose Drag Rectangle.');

    input.detach();
}
