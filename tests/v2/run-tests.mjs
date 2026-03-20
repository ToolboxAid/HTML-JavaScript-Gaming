import { run as runFrameClock } from "./core/FrameClock.test.mjs";
import { run as runFixedTicker } from "./core/FixedTicker.test.mjs";
import { run as runSceneManager } from "./scenes/SceneManager.test.mjs";
import { run as runKeyboardState } from "./input/KeyboardState.test.mjs";
import { run as runInputService } from "./input/InputService.test.mjs";

const tests = [
    ["FrameClock", runFrameClock],
    ["FixedTicker", runFixedTicker],
    ["SceneManager", runSceneManager],
    ["KeyboardState", runKeyboardState],
    ["InputService", runInputService],
];

let passed = 0;

for (const [name, test] of tests) {
    test();
    console.log(`PASS ${name}`);
    passed += 1;
}

console.log(`\n${passed}/${tests.length} tests passed.`);
