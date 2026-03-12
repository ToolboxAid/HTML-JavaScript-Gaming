// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// animationStateUtils.js

class AnimationStateUtils {
    constructor() {
        throw new Error('AnimationStateUtils is a utility class with only static methods. Do not instantiate.');
    }

    static syncToObject(target, animation) {
        if (!target || typeof target !== 'object') {
            throw new Error('target must be an object.');
        }

        if (!animation || typeof animation !== 'object') {
            throw new Error('animation must be an object.');
        }

        target.currentFrameIndex = animation.currentFrameIndex;
        target.delayCounter = animation.delayCounter;
    }

    static destroyAnimation(target, propertyNames = []) {
        if (!target || typeof target !== 'object') {
            throw new Error('target must be an object.');
        }

        if (target.animation && typeof target.animation.destroy === 'function') {
            target.animation.destroy();
        }

        if (typeof target.destroyProperties === 'function' && propertyNames.length > 0) {
            target.destroyProperties(propertyNames);
        }
    }
}

export default AnimationStateUtils;
