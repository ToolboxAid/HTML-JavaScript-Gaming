/*
Toolbox Aid
David Quesenberry
03/21/2026
MouseState.test.mjs
*/
import MouseState from '../../engine/input/MouseState.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

export function run() {
    const mouse = new MouseState();

    mouse.setSnapshot({ x: 120, y: 80, deltaX: 12, deltaY: -4, buttonsDown: new Set([0]) });
    assert(mouse.getPosition().x === 120, 'Mouse X should reflect the snapshot position.');
    assert(mouse.getPosition().y === 80, 'Mouse Y should reflect the snapshot position.');
    assert(mouse.getDelta().x === 12, 'Mouse delta X should reflect the snapshot delta.');
    assert(mouse.getDelta().y === -4, 'Mouse delta Y should reflect the snapshot delta.');
    assert(mouse.isDown(0) === true, 'Primary mouse button should be down after snapshot.');
    assert(mouse.isPressed(0) === true, 'Primary mouse button should be pressed on the first frame.');

    mouse.setSnapshot({ x: 125, y: 82, deltaX: 5, deltaY: 2, buttonsDown: new Set([0]) });
    assert(mouse.isPressed(0) === false, 'Primary mouse button should not be pressed again while held.');

    mouse.setSnapshot({ x: 125, y: 82, deltaX: 0, deltaY: 0, buttonsDown: new Set() });
    assert(mouse.isDown(0) === false, 'Primary mouse button should clear when released.');

    const snapshot = mouse.getSnapshot();
    snapshot.down.add(2);
    assert(mouse.isDown(2) === false, 'Snapshot mutations must not affect internal button state.');
}
