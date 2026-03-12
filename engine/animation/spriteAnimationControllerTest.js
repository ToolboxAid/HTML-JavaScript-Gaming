import SpriteAnimationController from './spriteAnimationController.js';

export function testSpriteAnimationController(assert) {
    const controller = new SpriteAnimationController({
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

    controller.setOtherFrame(60, ['z']);
    assert(controller.otherDelay === 60, 'setOtherFrame delay failed');
    assert(controller.otherFrame[0] === 'z', 'setOtherFrame frame failed');
}
