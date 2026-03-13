// ToolboxAid.com
// David Quesenberry
// 03/13/2026
// spriteControllerTest.js

import SpriteController from '../../../engine/animation/spriteController.js';

export function testSpriteController(assert) {
    const controller = new SpriteController({
        livingFrames: [['a'], ['b']],
        dyingFrames: [['x'], ['y']],
        livingDelay: 3,
        dyingDelay: 2
    });

    assert(controller.getCurrentLivingFrame(0)[0] === 'a', 'getCurrentLivingFrame failed');
    assert(controller.getCurrentDyingFrame(1)[0] === 'y', 'getCurrentDyingFrame failed');

    let result = controller.stepLoopingFrame(0, 0, controller.livingFrameCount, controller.livingDelay, true);
    assert(result.currentFrameIndex === 0, 'looping frame should not advance early');
    result = controller.stepLoopingFrame(0, 2, controller.livingFrameCount, controller.livingDelay, true);
    assert(result.currentFrameIndex === 1, 'looping frame should advance at threshold');

    result = controller.stepFinalFrame(0, 1, controller.dyingFrameCount, controller.dyingDelay, true);
    assert(result.currentFrameIndex === 1, 'final frame should advance');
    assert(result.finished === false, 'final frame should not finish too early');

    result = controller.stepFinalFrame(1, 1, controller.dyingFrameCount, controller.dyingDelay, true);
    assert(result.finished === true, 'final frame should finish at end');

    result = controller.stepLoopingFrame(Number.NaN, Number.NaN, controller.livingFrameCount, controller.livingDelay, true);
    assert(Number.isFinite(result.currentFrameIndex), 'looping frame should normalize non-finite frame index');
    assert(Number.isFinite(result.delayCounter), 'looping frame should normalize non-finite delay counter');

    result = controller.stepFinalFrame(Number.NaN, Number.NaN, controller.dyingFrameCount, controller.dyingDelay, true);
    assert(Number.isFinite(result.currentFrameIndex), 'final frame should normalize non-finite frame index');
    assert(Number.isFinite(result.delayCounter), 'final frame should normalize non-finite delay counter');

    assertThrows(() => new SpriteController({ livingDelay: 1.5 }), 'livingDelay must be an integer.');
    assertThrows(() => new SpriteController({ dyingDelay: 2.5 }), 'dyingDelay must be an integer.');
    assertThrows(() => new SpriteController({ livingFrames: 'invalid' }), 'livingFrames must be an array or null.');

    controller.destroy();
    controller.destroy();
    assert(controller.livingFrames === null, 'destroy should be idempotent for livingFrames');
    assert(controller.dyingFrames === null, 'destroy should be idempotent for dyingFrames');
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
