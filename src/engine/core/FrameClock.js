/*
Toolbox Aid
David Quesenberry
03/21/2026
FrameClock.js
*/
import { invariant } from "../utils/invariant.js";

export default class FrameClock {
    constructor({ now = () => performance.now(), maxDeltaMs = 100 } = {}) {
        invariant(typeof now === "function", "FrameClock requires a now() function.");
        invariant(maxDeltaMs > 0, "FrameClock maxDeltaMs must be greater than zero.");

        this.now = now;
        this.maxDeltaMs = maxDeltaMs;
        this.lastTimeMs = null;
    }

    reset(timeMs = this.now()) {
        this.lastTimeMs = timeMs;
    }

    tick(timeMs = this.now()) {
        if (this.lastTimeMs === null) {
            this.lastTimeMs = timeMs;
            return { deltaMs: 0, deltaSeconds: 0 };
        }

        const rawDeltaMs = timeMs - this.lastTimeMs;
        const deltaMs = Math.max(0, Math.min(rawDeltaMs, this.maxDeltaMs));
        this.lastTimeMs = timeMs;

        return {
            deltaMs,
            deltaSeconds: deltaMs / 1000,
        };
    }
}
