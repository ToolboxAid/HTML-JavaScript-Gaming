/*
Toolbox Aid
David Quesenberry
03/21/2026
run-tests.mjs
*/
import { run as runAIBehaviors } from './ai/AIBehaviors.test.mjs';
import { run as runAssetLoaderSystem } from './assets/AssetLoaderSystem.test.mjs';
import { run as runConfigStore } from './config/ConfigStore.test.mjs';
import { run as runFixedTicker } from './core/FixedTicker.test.mjs';
import { run as runFrameClock } from './core/FrameClock.test.mjs';
import { run as runRuntimeMetrics } from './core/RuntimeMetrics.test.mjs';
import { run as runCombat } from './combat/Combat.test.mjs';
import { run as runEntity } from './entity/Entity.test.mjs';
import { run as runEventBus } from './events/EventBus.test.mjs';
import { run as runInputMap } from './input/InputMap.test.mjs';
import { run as runInputService } from './input/InputService.test.mjs';
import { run as runKeyboardState } from './input/KeyboardState.test.mjs';
import { run as runMouseState } from './input/MouseState.test.mjs';
import './input/GamepadState.test.mjs';
import { run as runSceneManager } from './scenes/SceneManager.test.mjs';
import { run as runWorldSystems } from './world/WorldSystems.test.mjs';
import { run as runProductionReadiness } from './production/ProductionReadiness.test.mjs';
import './render/Renderer.test.mjs';
import './theme.test.js';

const tests = [
    ['AIBehaviors', runAIBehaviors],
    ['AssetLoaderSystem', runAssetLoaderSystem],
    ['ConfigStore', runConfigStore],
    ['FixedTicker', runFixedTicker],
    ['FrameClock', runFrameClock],
    ['RuntimeMetrics', runRuntimeMetrics],
    ['Combat', runCombat],
    ['Entity', runEntity],
    ['EventBus', runEventBus],
    ['InputMap', runInputMap],
    ['InputService', runInputService],
    ['KeyboardState', runKeyboardState],
    ['MouseState', runMouseState],
    ['ProductionReadiness', runProductionReadiness],
    ['SceneManager', runSceneManager],
    ['WorldSystems', runWorldSystems],
];

let passed = 0;

for (const [name, test] of tests) {
    await test();
    console.log(`PASS ${name}`);
    passed += 1;
}

console.log(`\n${passed}/${tests.length} explicit run() tests passed.`);
