class SpriteController {
    constructor({
        livingFrames = null,
        dyingFrames = null,
        livingDelay = 30,
        dyingDelay = 7
    } = {}) {
        this.livingFrames = livingFrames;
        this.dyingFrames = dyingFrames;
        this.livingDelay = livingDelay;
        this.dyingDelay = dyingDelay;
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
        if (!frameCount || frameCount <= 0) {
            return { currentFrameIndex, looped: false };
        }

        const nextFrameIndex = currentFrameIndex + 1;

        if (nextFrameIndex >= frameCount) {
            return { currentFrameIndex: 0, looped: true };
        }

        return { currentFrameIndex: nextFrameIndex, looped: false };
    }

    stepLoopingFrame(currentFrameIndex, delayCounter, frameCount, frameDelay, incFrame = false) {
        if (!frameCount || frameCount <= 1 || !incFrame) {
            return { currentFrameIndex, delayCounter, looped: false };
        }

        const nextDelayCounter = delayCounter + 1;

        if (nextDelayCounter < frameDelay) {
            return { currentFrameIndex, delayCounter: nextDelayCounter, looped: false };
        }

        const result = this.advanceFrame(currentFrameIndex, frameCount);
        return {
            currentFrameIndex: result.currentFrameIndex,
            delayCounter: 0,
            looped: result.looped
        };
    }

    stepFinalFrame(currentFrameIndex, delayCounter, frameCount, frameDelay, incFrame = false) {
        if (!frameCount || frameCount <= 0 || !incFrame) {
            return { currentFrameIndex, delayCounter, finished: false };
        }

        const nextDelayCounter = delayCounter + 1;

        if (nextDelayCounter < frameDelay) {
            return { currentFrameIndex, delayCounter: nextDelayCounter, finished: false };
        }

        const nextFrameIndex = currentFrameIndex + 1;

        return {
            currentFrameIndex: nextFrameIndex,
            delayCounter: 0,
            finished: nextFrameIndex >= frameCount
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
