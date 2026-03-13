import AnimationStateBridge from '../../../engine/animation/animationStateBridge.js';

export function testAnimationStateBridge(assert) {
    const target = {
        lifecycle: {
            currentFrameIndex: 0,
            delayCounter: 0
        },
        animation: {
            currentFrameIndex: 2,
            delayCounter: 4
        }
    };

    AnimationStateBridge.installMirroredCounters(target);

    assert(target.currentFrameIndex === 2, 'getter should prefer animation currentFrameIndex');
    assert(target.delayCounter === 4, 'getter should prefer animation delayCounter');

    target.currentFrameIndex = 7;
    target.delayCounter = 9;

    assert(target.animation.currentFrameIndex === 7, 'setter should update animation currentFrameIndex');
    assert(target.animation.delayCounter === 9, 'setter should update animation delayCounter');
    assert(target.lifecycle.currentFrameIndex === 7, 'setter should update lifecycle currentFrameIndex');
    assert(target.lifecycle.delayCounter === 9, 'setter should update lifecycle delayCounter');
}
