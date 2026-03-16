// ToolboxAid.com
// David Quesenberry
// 03/13/2026
// pngController.js

import AnimationFrameStepper from './animationFrameStepper.js';
import NumberUtils from '../math/numberUtils.js';

class PngController {
    constructor(frameCount = 1, framesPerRow = 1, frameDelay = 6) {
        NumberUtils.positiveNumber(frameCount, 'frameCount');
        NumberUtils.positiveNumber(framesPerRow, 'framesPerRow');
        NumberUtils.positiveNumber(frameDelay, 'frameDelay');

        if (!Number.isInteger(frameCount)) {
            throw new Error('frameCount must be an integer.');
        }

        if (!Number.isInteger(framesPerRow)) {
            throw new Error('framesPerRow must be an integer.');
        }

        if (!Number.isInteger(frameDelay)) {
            throw new Error('frameDelay must be an integer.');
        }

        this.frameCount = frameCount;
        this.framesPerRow = framesPerRow;
        this.frameDelay = frameDelay;
        this.currentFrameIndex = 0;
        this.delayCounter = 0;
    }

    setFrame(frameIndex = 0) {
        NumberUtils.finiteNumber(frameIndex, 'frameIndex');

        if (!Number.isInteger(frameIndex)) {
            throw new Error('frameIndex must be an integer.');
        }

        if (frameIndex < 0 || frameIndex >= this.frameCount) {
            throw new Error(`frameIndex out of range: ${frameIndex}`);
        }

        this.currentFrameIndex = frameIndex;
        this.delayCounter = 0;
    }

    getCurrentSourceRect(spriteX = 0, spriteY = 0, frameWidth = 0, frameHeight = 0) {
        const frameIndex = AnimationFrameStepper.normalizeNonNegativeInteger(this.currentFrameIndex, 0);
        const col = frameIndex % this.framesPerRow;
        const row = Math.floor(frameIndex / this.framesPerRow);

        return {
            sx: spriteX + (col * frameWidth),
            sy: spriteY + (row * frameHeight),
            sw: frameWidth,
            sh: frameHeight
        };
    }

    advanceFrame() {
        const result = AnimationFrameStepper.advanceFrame(this.currentFrameIndex, this.frameCount);
        this.currentFrameIndex = result.currentFrameIndex;
        return result.looped;
    }

    stepFrame(incFrame = false) {
        const result = AnimationFrameStepper.stepLoopingFrame(
            this.currentFrameIndex,
            this.delayCounter,
            this.frameCount,
            this.frameDelay,
            incFrame
        );

        this.currentFrameIndex = result.currentFrameIndex;
        this.delayCounter = result.delayCounter;
        return result.looped;
    }

    stepDyingFrame(incFrame = false) {
        if (this.frameCount <= 1) {
            return true;
        }

        const result = AnimationFrameStepper.stepFinalFrame(
            this.currentFrameIndex,
            this.delayCounter,
            this.frameCount,
            this.frameDelay,
            incFrame
        );

        this.currentFrameIndex = result.currentFrameIndex;
        this.delayCounter = result.delayCounter;
        return result.finished;
    }

    destroy() {
        this.frameCount = null;
        this.framesPerRow = null;
        this.frameDelay = null;
        this.currentFrameIndex = null;
        this.delayCounter = null;
    }
}

export default PngController;
