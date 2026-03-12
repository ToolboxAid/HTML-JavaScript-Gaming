// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// animationStateUtilsTest.js

import AnimationStateUtils from './animationStateUtils.js';

export function testAnimationStateUtils(assert) {
    const target = {
        currentFrameIndex: 0,
        delayCounter: 0,
        animation: {
            currentFrameIndex: 3,
            delayCounter: 5,
            destroy() {
                this.destroyed = true;
            }
        },
        destroyProperties(propertyNames) {
            for (const propertyName of propertyNames) {
                this[propertyName] = null;
            }
        }
    };

    AnimationStateUtils.syncToObject(target, target.animation);
    assert(target.currentFrameIndex === 3, 'syncToObject should copy currentFrameIndex');
    assert(target.delayCounter === 5, 'syncToObject should copy delayCounter');

    AnimationStateUtils.destroyAnimation(target, ['animation']);
    assert(target.animation === null, 'destroyAnimation should nullify animation');
}
