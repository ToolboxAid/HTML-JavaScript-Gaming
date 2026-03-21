import { invariant } from "../utils/invariant.js";

export default class FixedTicker {
    constructor({ stepMs = 1000 / 60, maxCatchUpSteps = 5 } = {}) {
        invariant(stepMs > 0, "FixedTicker stepMs must be greater than zero.");
        invariant(maxCatchUpSteps > 0, "FixedTicker maxCatchUpSteps must be greater than zero.");

        this.stepMs = stepMs;
        this.maxCatchUpSteps = maxCatchUpSteps;
        this.accumulatorMs = 0;
    }

    reset() {
        this.accumulatorMs = 0;
    }

    advance(deltaMs, onStep) {
        invariant(typeof onStep === "function", "FixedTicker.advance requires an onStep callback.");

        this.accumulatorMs += Math.max(0, deltaMs);

        let steps = 0;
        while (this.accumulatorMs >= this.stepMs && steps < this.maxCatchUpSteps) {
            onStep(this.stepMs / 1000, this.stepMs);
            this.accumulatorMs -= this.stepMs;
            steps += 1;
        }

        if (steps === this.maxCatchUpSteps && this.accumulatorMs >= this.stepMs) {
            this.accumulatorMs = 0;
        }

        return {
            steps,
            alpha: this.accumulatorMs / this.stepMs,
        };
    }
}
