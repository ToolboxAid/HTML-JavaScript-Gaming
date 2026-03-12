import PngAnimationController from './pngAnimationController.js';

export function testPngAnimationController(assert) {
    const animation = new PngAnimationController(4, 2, 3);

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
}
