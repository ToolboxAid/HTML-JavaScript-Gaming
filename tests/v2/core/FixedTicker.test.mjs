import assert from "node:assert/strict";
import FixedTicker from "../../../engine/v2/core/FixedTicker.js";

export function run() {
    const ticker = new FixedTicker({ stepMs: 10, maxCatchUpSteps: 3 });
    const steps = [];

    let result = ticker.advance(25, (dtSeconds, stepMs) => {
        steps.push({ dtSeconds, stepMs });
    });

    assert.equal(steps.length, 2);
    assert.equal(result.steps, 2);
    assert.equal(result.alpha, 0.5);

    result = ticker.advance(100, () => {});
    assert.equal(result.steps, 3);
    assert.equal(result.alpha, 0);
}
