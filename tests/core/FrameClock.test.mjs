/*
Toolbox Aid
David Quesenberry
03/21/2026
FrameClock.test.mjs
*/
import assert from "node:assert/strict";
import FrameClock from "../../engine/core/FrameClock.js";

export function run() {
    const clock = new FrameClock({ maxDeltaMs: 50 });

    assert.deepEqual(clock.tick(1000), { deltaMs: 0, deltaSeconds: 0 });
    assert.deepEqual(clock.tick(1016), { deltaMs: 16, deltaSeconds: 0.016 });
    assert.deepEqual(clock.tick(1200), { deltaMs: 50, deltaSeconds: 0.05 });

    clock.reset(2000);
    assert.deepEqual(clock.tick(2010), { deltaMs: 10, deltaSeconds: 0.01 });
}
