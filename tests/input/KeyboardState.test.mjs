/*
Toolbox Aid
David Quesenberry
03/21/2026
KeyboardState.test.mjs
*/
import KeyboardState from '/src/engine/input/KeyboardState.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

export function run() {
    const keyboard = new KeyboardState();

    keyboard.setSnapshot(new Set(['ArrowLeft']));
    assert(keyboard.isDown('ArrowLeft') === true, 'ArrowLeft should be down after snapshot.');
    assert(keyboard.isPressed('ArrowLeft') === true, 'ArrowLeft should be pressed on the first frame.');

    keyboard.setSnapshot(new Set(['ArrowLeft']));
    assert(keyboard.isDown('ArrowLeft') === true, 'ArrowLeft should remain down when held.');
    assert(keyboard.isPressed('ArrowLeft') === false, 'ArrowLeft should not be pressed again while held.');

    keyboard.setSnapshot(new Set());
    assert(keyboard.isDown('ArrowLeft') === false, 'ArrowLeft should clear when removed from the snapshot.');

    const snapshot = keyboard.getSnapshot();
    assert(snapshot.down.size === 0, 'Snapshot should report no held keys after release.');
    assert(snapshot.pressed.size === 0, 'Snapshot should report no pressed keys after release.');
}
