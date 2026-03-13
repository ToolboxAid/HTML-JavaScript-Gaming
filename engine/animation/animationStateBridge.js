import StateUtils from './stateUtils.js';

class AnimationStateBridge {
    constructor() {
        throw new Error('AnimationStateBridge is a utility class with only static methods. Do not instantiate.');
    }

    static installMirroredCounters(target, animationProperty = 'animation') {
        if (!target || typeof target !== 'object') {
            throw new Error('target must be an object.');
        }

        if (typeof animationProperty !== 'string' || animationProperty.length === 0) {
            throw new Error('animationProperty must be a non-empty string.');
        }

        Object.defineProperties(target, {
            currentFrameIndex: {
                configurable: true,
                enumerable: true,
                get() {
                    return this[animationProperty]?.currentFrameIndex ?? this.lifecycle?.currentFrameIndex ?? null;
                },
                set(value) {
                    if (this[animationProperty]) {
                        this[animationProperty].currentFrameIndex = value;
                    }

                    if (this.lifecycle) {
                        this.lifecycle.currentFrameIndex = value;
                    }
                }
            },
            delayCounter: {
                configurable: true,
                enumerable: true,
                get() {
                    return this[animationProperty]?.delayCounter ?? this.lifecycle?.delayCounter ?? null;
                },
                set(value) {
                    if (this[animationProperty]) {
                        this[animationProperty].delayCounter = value;
                    }

                    if (this.lifecycle) {
                        this.lifecycle.delayCounter = value;
                    }
                }
            }
        });
    }

    static syncFromAnimation(target, animation) {
        StateUtils.syncToObject(target, animation);
    }
}

export default AnimationStateBridge;
