// ToolboxAid.com
// David Quesenberry
// 03/16/2026
// animationFrameStepper.js

import NumberUtils from '../math/numberUtils.js';

class AnimationFrameStepper {
    constructor() {
        throw new Error('AnimationFrameStepper is a utility class with only static methods. Do not instantiate.');
    }

    static normalizeNonNegativeInteger(value, fallback = 0) {
        if (!NumberUtils.isFiniteNumber(value)) {
            return fallback;
        }

        return Math.max(0, Math.floor(value));
    }

    static advanceFrame(currentFrameIndex, frameCount) {
        const normalizedFrameCount = this.normalizeNonNegativeInteger(frameCount, 0);
        const normalizedCurrentFrameIndex = this.normalizeNonNegativeInteger(currentFrameIndex, 0);

        if (!normalizedFrameCount || normalizedFrameCount <= 0) {
            return { currentFrameIndex: normalizedCurrentFrameIndex, looped: false };
        }

        const nextFrameIndex = normalizedCurrentFrameIndex + 1;

        if (nextFrameIndex >= normalizedFrameCount) {
            return { currentFrameIndex: 0, looped: true };
        }

        return { currentFrameIndex: nextFrameIndex, looped: false };
    }

    static stepLoopingFrame(currentFrameIndex, delayCounter, frameCount, frameDelay, incFrame = false) {
        const normalizedFrameCount = this.normalizeNonNegativeInteger(frameCount, 0);
        const normalizedFrameDelay = this.normalizeNonNegativeInteger(frameDelay, 0);
        const normalizedCurrentFrameIndex = this.normalizeNonNegativeInteger(currentFrameIndex, 0);
        const normalizedDelayCounter = this.normalizeNonNegativeInteger(delayCounter, 0);

        if (!normalizedFrameCount || normalizedFrameCount <= 1 || !incFrame) {
            return { currentFrameIndex: normalizedCurrentFrameIndex, delayCounter: normalizedDelayCounter, looped: false };
        }

        const nextDelayCounter = normalizedDelayCounter + 1;

        if (nextDelayCounter < normalizedFrameDelay) {
            return { currentFrameIndex: normalizedCurrentFrameIndex, delayCounter: nextDelayCounter, looped: false };
        }

        const result = this.advanceFrame(normalizedCurrentFrameIndex, normalizedFrameCount);
        return {
            currentFrameIndex: result.currentFrameIndex,
            delayCounter: 0,
            looped: result.looped
        };
    }

    static stepFinalFrame(currentFrameIndex, delayCounter, frameCount, frameDelay, incFrame = false) {
        const normalizedFrameCount = this.normalizeNonNegativeInteger(frameCount, 0);
        const normalizedFrameDelay = this.normalizeNonNegativeInteger(frameDelay, 0);
        const normalizedCurrentFrameIndex = this.normalizeNonNegativeInteger(currentFrameIndex, 0);
        const normalizedDelayCounter = this.normalizeNonNegativeInteger(delayCounter, 0);

        if (!normalizedFrameCount || normalizedFrameCount <= 0 || !incFrame) {
            return { currentFrameIndex: normalizedCurrentFrameIndex, delayCounter: normalizedDelayCounter, finished: false };
        }

        const nextDelayCounter = normalizedDelayCounter + 1;

        if (nextDelayCounter < normalizedFrameDelay) {
            return { currentFrameIndex: normalizedCurrentFrameIndex, delayCounter: nextDelayCounter, finished: false };
        }

        const nextFrameIndex = normalizedCurrentFrameIndex + 1;
        const lastFrameIndex = Math.max(0, normalizedFrameCount - 1);
        const finished = nextFrameIndex >= normalizedFrameCount;

        return {
            currentFrameIndex: finished ? lastFrameIndex : nextFrameIndex,
            delayCounter: 0,
            finished
        };
    }
}

export default AnimationFrameStepper;
