// ToolboxAid.com
// David Quesenberry
// 03/13/2026
// spriteController.js

import ObjectValidation from '../utils/objectValidation.js';

class SpriteController {
    constructor({
        livingFrames = null,
        dyingFrames = null,
        livingDelay = 30,
        dyingDelay = 7
    } = {}) {
        SpriteController.validateFrames(livingFrames, 'livingFrames');
        SpriteController.validateFrames(dyingFrames, 'dyingFrames');

        ObjectValidation.positiveNumber(livingDelay, 'livingDelay');
        ObjectValidation.positiveNumber(dyingDelay, 'dyingDelay');

        if (!Number.isInteger(livingDelay)) {
            throw new Error('livingDelay must be an integer.');
        }

        if (!Number.isInteger(dyingDelay)) {
            throw new Error('dyingDelay must be an integer.');
        }

        this.livingFrames = livingFrames;
        this.dyingFrames = dyingFrames;
        this.livingDelay = livingDelay;
        this.dyingDelay = dyingDelay;
    }

    static validateFrames(value, name) {
        if (value !== null && !Array.isArray(value)) {
            throw new Error(`${name} must be an array or null.`);
        }
    }

    get livingFrameCount() {
        return this.livingFrames?.length ?? 0;
    }

    get dyingFrameCount() {
        return this.dyingFrames?.length ?? 0;
    }

    getCurrentLivingFrame(currentFrameIndex = 0) {
        if (!this.livingFrames || this.livingFrameCount <= 0) {
            return null;
        }

        return this.livingFrames[currentFrameIndex] ?? null;
    }

    getCurrentDyingFrame(currentFrameIndex = 0) {
        if (!this.dyingFrames || this.dyingFrameCount <= 0) {
            return null;
        }

        return this.dyingFrames[currentFrameIndex] ?? null;
    }

    static normalizeNonNegativeInteger(value, fallback = 0) {
        if (!Number.isFinite(value)) {
            return fallback;
        }

        return Math.max(0, Math.floor(value));
    }

    advanceFrame(currentFrameIndex, frameCount) {
        const normalizedFrameCount = SpriteController.normalizeNonNegativeInteger(frameCount, 0);
        const normalizedCurrentFrameIndex = SpriteController.normalizeNonNegativeInteger(currentFrameIndex, 0);

        if (!normalizedFrameCount || normalizedFrameCount <= 0) {
            return { currentFrameIndex: normalizedCurrentFrameIndex, looped: false };
        }

        const nextFrameIndex = normalizedCurrentFrameIndex + 1;

        if (nextFrameIndex >= normalizedFrameCount) {
            return { currentFrameIndex: 0, looped: true };
        }

        return { currentFrameIndex: nextFrameIndex, looped: false };
    }

    stepLoopingFrame(currentFrameIndex, delayCounter, frameCount, frameDelay, incFrame = false) {
        const normalizedFrameCount = SpriteController.normalizeNonNegativeInteger(frameCount, 0);
        const normalizedFrameDelay = SpriteController.normalizeNonNegativeInteger(frameDelay, 0);
        const normalizedCurrentFrameIndex = SpriteController.normalizeNonNegativeInteger(currentFrameIndex, 0);
        const normalizedDelayCounter = SpriteController.normalizeNonNegativeInteger(delayCounter, 0);

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

    stepFinalFrame(currentFrameIndex, delayCounter, frameCount, frameDelay, incFrame = false) {
        const normalizedFrameCount = SpriteController.normalizeNonNegativeInteger(frameCount, 0);
        const normalizedFrameDelay = SpriteController.normalizeNonNegativeInteger(frameDelay, 0);
        const normalizedCurrentFrameIndex = SpriteController.normalizeNonNegativeInteger(currentFrameIndex, 0);
        const normalizedDelayCounter = SpriteController.normalizeNonNegativeInteger(delayCounter, 0);

        if (!normalizedFrameCount || normalizedFrameCount <= 0 || !incFrame) {
            return { currentFrameIndex: normalizedCurrentFrameIndex, delayCounter: normalizedDelayCounter, finished: false };
        }

        const nextDelayCounter = normalizedDelayCounter + 1;

        if (nextDelayCounter < normalizedFrameDelay) {
            return { currentFrameIndex: normalizedCurrentFrameIndex, delayCounter: nextDelayCounter, finished: false };
        }

        const nextFrameIndex = normalizedCurrentFrameIndex + 1;

        return {
            currentFrameIndex: nextFrameIndex,
            delayCounter: 0,
            finished: nextFrameIndex >= normalizedFrameCount
        };
    }

    destroy() {
        this.livingFrames = null;
        this.dyingFrames = null;
        this.livingDelay = null;
        this.dyingDelay = null;
    }
}

export default SpriteController;
