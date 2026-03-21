import { run as runFixedTicker } from './core/FixedTicker.test.mjs';
import { run as runFrameClock } from './core/FrameClock.test.mjs';
import { run as runEntity } from './entity/Entity.test.mjs';
import { run as runInputMap } from './input/InputMap.test.mjs';
import { run as runInputService } from './input/InputService.test.mjs';
import { run as runKeyboardState } from './input/KeyboardState.test.mjs';
import { run as runMouseState } from './input/MouseState.test.mjs';
import './input/GamepadState.test.mjs';
import { run as runSceneManager } from './scenes/SceneManager.test.mjs';
import './render/Renderer.test.mjs';
import './theme.test.js';

const tests = [
    ['FixedTicker', runFixedTicker],
    ['FrameClock', runFrameClock],
    ['Entity', runEntity],
    ['InputMap', runInputMap],
    ['InputService', runInputService],
    ['KeyboardState', runKeyboardState],
    ['MouseState', runMouseState],
    ['SceneManager', runSceneManager],
];

let passed = 0;

for (const [name, test] of tests) {
    test();
    console.log(`PASS ${name}`);
    passed += 1;
}

console.log(`\n${passed}/${tests.length} explicit run() tests passed.`);
