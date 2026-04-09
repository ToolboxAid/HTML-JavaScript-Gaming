/*
Toolbox Aid
David Quesenberry
03/21/2026
GamepadState.test.mjs
*/
import assert from 'node:assert/strict';
import GamepadState from '/src/engine/input/GamepadState.js';

function testStoresMultipleConcurrentGamepads() {
    const gamepads = new GamepadState();
    gamepads.setSnapshot([
        {
            index: 0,
            id: 'Pad A',
            connected: true,
            axes: [0.5, -0.25],
            buttons: [{ pressed: true }, { pressed: false }],
        },
        {
            index: 1,
            id: 'Pad B',
            connected: true,
            axes: [-1, 1],
            buttons: [{ pressed: false }, { pressed: true }],
        },
    ]);

    const pad0 = gamepads.getGamepad(0);
    const pad1 = gamepads.getGamepad(1);

    assert.equal(gamepads.getGamepads().length, 2);
    assert.equal(pad0.id, 'Pad A');
    assert.equal(pad1.id, 'Pad B');
    assert.equal(pad0.isDown(0), true);
    assert.equal(pad1.isDown(1), true);
}

function testTracksPressedButtonsBetweenFrames() {
    const gamepads = new GamepadState();
    gamepads.setSnapshot([
        {
            index: 0,
            id: 'Pad A',
            connected: true,
            axes: [0, 0],
            buttons: [{ pressed: false }, { pressed: false }],
        },
    ]);

    gamepads.setSnapshot([
        {
            index: 0,
            id: 'Pad A',
            connected: true,
            axes: [0, 0],
            buttons: [{ pressed: true }, { pressed: false }],
        },
    ]);

    const pad0 = gamepads.getGamepad(0);
    assert.equal(pad0.isPressed(0), true);
    assert.equal(pad0.isPressed(1), false);
}

testStoresMultipleConcurrentGamepads();
testTracksPressedButtonsBetweenFrames();
console.log('GamepadState tests passed');
