// ToolboxAid.com
// David Quesenberry
// 03/13/2026
// pngController.js

import ObjectValidation from '../utils/objectValidation.js';

class PngController {
    constructor(frameCount = 1, framesPerRow = 1, frameDelay = 6) {
        ObjectValidation.positiveNumber(frameCount, 'frameCount');
        ObjectValidation.positiveNumber(framesPerRow, 'framesPerRow');
        ObjectValidation.positiveNumber(frameDelay, 'frameDelay');

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

    static normalizeNonNegativeInteger(value, fallback = 0) {
        if (!Number.isFinite(value)) {
            return fallback;
        }

        return Math.max(0, Math.floor(value));
    }

    setFrame(frameIndex = 0) {
        ObjectValidation.finiteNumber(frameIndex, 'frameIndex');

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
        const frameIndex = PngController.normalizeNonNegativeInteger(this.currentFrameIndex, 0);
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
        if (this.frameCount <= 1) {
            return false;
        }

        this.currentFrameIndex = PngController.normalizeNonNegativeInteger(this.currentFrameIndex, 0) + 1;

        if (this.currentFrameIndex >= this.frameCount) {
            this.currentFrameIndex = 0;
            return true;
        }

        return false;
    }

    stepFrame(incFrame = false) {
        if (this.frameCount <= 1 || !incFrame) {
            return false;
        }

        this.delayCounter = PngController.normalizeNonNegativeInteger(this.delayCounter, 0) + 1;

        if (this.delayCounter < this.frameDelay) {
            return false;
        }

        this.delayCounter = 0;
        return this.advanceFrame();
    }

    stepDyingFrame(incFrame = false) {
        if (this.frameCount <= 1) {
            return true;
        }

        this.currentFrameIndex = PngController.normalizeNonNegativeInteger(this.currentFrameIndex, 0);
        this.delayCounter = PngController.normalizeNonNegativeInteger(this.delayCounter, 0);

        if (incFrame) {
            this.delayCounter++;

            if (this.delayCounter >= this.frameDelay) {
                this.delayCounter = 0;
                this.currentFrameIndex++;
            }
        }

        return this.currentFrameIndex >= this.frameCount;
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
