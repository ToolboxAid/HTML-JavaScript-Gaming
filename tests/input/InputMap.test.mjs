import InputMap from '../../engine/input/InputMap.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

export function run() {
    const inputMap = new InputMap({
        moveLeft: ['ArrowLeft', 'KeyA'],
        jump: ['Space'],
    });

    assert(inputMap.hasAction('moveLeft') === true, 'moveLeft should exist after construction.');
    assert(inputMap.hasAction('moveRight') === false, 'Unknown actions should not exist.');

    const downSet = new Set(['KeyA']);
    const pressedSet = new Set(['Space']);

    assert(
        inputMap.isActionDown('moveLeft', (input) => downSet.has(input)) === true,
        'moveLeft should be down when any bound physical input is down.',
    );
    assert(
        inputMap.isActionPressed('jump', (input) => pressedSet.has(input)) === true,
        'jump should be pressed when any bound physical input is pressed.',
    );

    const snapshot = inputMap.getSnapshot(
        (input) => downSet.has(input),
        (input) => pressedSet.has(input),
    );

    assert(snapshot.moveLeft.down === true, 'Snapshot should report moveLeft as down.');
    assert(snapshot.jump.pressed === true, 'Snapshot should report jump as pressed.');
    assert(snapshot.moveLeft.inputs.length === 2, 'Snapshot should expose bound inputs.');
}
