// ToolboxAid.com
// David Quesenberry
// 03/13/2026
// pngControllerTest.js

import PngController from './pngController.js';

export function testPngController(assert) {
    const animation = new PngController(4, 2, 3);

    let sourceRect = animation.getCurrentSourceRect(10, 20, 8, 6);
    assert(sourceRect.sx === 10, 'initial source rect x failed');
    assert(sourceRect.sy === 20, 'initial source rect y failed');

    animation.setFrame(1);
    sourceRect = animation.getCurrentSourceRect(10, 20, 8, 6);
    assert(sourceRect.sx === 18, 'setFrame source rect x failed');
    assert(sourceRect.sy === 20, 'setFrame source rect y failed');

    assert(animation.stepFrame(false) === false, 'stepFrame should not advance without incFrame');
    assert(animation.currentFrameIndex === 1, 'currentFrameIndex changed unexpectedly');

    animation.stepFrame(true);
    animation.stepFrame(true);
    assert(animation.currentFrameIndex === 1, 'frame should not advance before delay threshold');
    animation.stepFrame(true);
    assert(animation.currentFrameIndex === 2, 'frame should advance at delay threshold');

    animation.setFrame(3);
    const looped = animation.advanceFrame();
    assert(looped === true, 'advanceFrame should report loop');
    assert(animation.currentFrameIndex === 0, 'advanceFrame should wrap to zero');

    animation.setFrame(0);
    animation.stepDyingFrame(true);
    animation.stepDyingFrame(true);
    const finished = animation.stepDyingFrame(true);
    assert(finished === false, 'dying animation should not finish on first frame advance');
    assert(animation.currentFrameIndex === 1, 'dying animation should increment frame');

    animation.currentFrameIndex = Number.NaN;
    sourceRect = animation.getCurrentSourceRect(10, 20, 8, 6);
    assert(sourceRect.sx === 10, 'getCurrentSourceRect should normalize non-finite frame index');

    animation.delayCounter = Number.NaN;
    assert(animation.stepFrame(true) === false, 'stepFrame should normalize non-finite delay counter safely');

    assertThrows(() => new PngController(3.2, 2, 3), 'frameCount must be an integer.');
    assertThrows(() => new PngController(3, 2.2, 3), 'framesPerRow must be an integer.');
    assertThrows(() => new PngController(3, 2, 3.5), 'frameDelay must be an integer.');

    animation.destroy();
    animation.destroy();
    assert(animation.frameCount === null, 'destroy should be idempotent for frameCount');
    assert(animation.currentFrameIndex === null, 'destroy should be idempotent for currentFrameIndex');
}

function assertThrows(fn, expectedMessage) {
    let threw = false;

    try {
        fn();
    } catch (error) {
        threw = true;
        if (expectedMessage) {
            if (!String(error.message).includes(expectedMessage)) {
                throw new Error(`Expected error message to include "${expectedMessage}", got "${error.message}".`);
            }
        }
    }

    if (!threw) {
        throw new Error('Expected function to throw.');
    }
}
