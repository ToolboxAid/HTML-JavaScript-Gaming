// ToolboxAid.com
// David Quesenberry
// 03/13/2026
// spriteController.js

import AnimationFrameStepper from './animationFrameStepper.js';
import NumberUtils from '../math/numberUtils.js';

class SpriteController {
    constructor({
        livingFrames = null,
        dyingFrames = null,
        livingDelay = 30,
        dyingDelay = 7
    } = {}) {
        SpriteController.validateFrames(livingFrames, 'livingFrames');
        SpriteController.validateFrames(dyingFrames, 'dyingFrames');

        NumberUtils.positiveInteger(livingDelay, 'livingDelay');
        NumberUtils.positiveInteger(dyingDelay, 'dyingDelay');

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

    advanceFrame(currentFrameIndex, frameCount) {
        return AnimationFrameStepper.advanceFrame(currentFrameIndex, frameCount);
    }

    stepLoopingFrame(currentFrameIndex, delayCounter, frameCount, frameDelay, incFrame = false) {
        return AnimationFrameStepper.stepLoopingFrame(currentFrameIndex, delayCounter, frameCount, frameDelay, incFrame);
    }

    stepFinalFrame(currentFrameIndex, delayCounter, frameCount, frameDelay, incFrame = false) {
        return AnimationFrameStepper.stepFinalFrame(currentFrameIndex, delayCounter, frameCount, frameDelay, incFrame);
    }

    destroy() {
        this.livingFrames = null;
        this.dyingFrames = null;
        this.livingDelay = null;
        this.dyingDelay = null;
    }
}

export default SpriteController;
