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
import { run as runEngineFullscreen } from './core/EngineFullscreen.test.mjs';
import { run as runEngineSceneLifecycle } from './core/EngineSceneLifecycle.test.mjs';
import { run as runEngineTiming } from './core/EngineTiming.test.mjs';
import { run as runFrameClock } from './core/FrameClock.test.mjs';
import { run as runRuntimeMetrics } from './core/RuntimeMetrics.test.mjs';
import { run as runParticleSystem } from './fx/ParticleSystem.test.mjs';
import { run as runAsteroidsHardening } from './games/AsteroidsHardening.test.mjs';
import { run as runAsteroidsCollisionTimingStress } from './games/AsteroidsCollisionTimingStress.test.mjs';
import { run as runAsteroidsValidation } from './games/AsteroidsValidation.test.mjs';
import { run as runAsteroidsVectorTransforms } from './games/AsteroidsVectorTransforms.test.mjs';
import { run as runGravityWell } from './games/GravityWell.test.mjs';
import { run as runGravityWellDeterminismTimingStress } from './games/GravityWellDeterminismTimingStress.test.mjs';
import { run as runGravityWellReplay } from './games/GravityWellReplay.test.mjs';
import { run as runGravityWellValidation } from './games/GravityWellValidation.test.mjs';
import { run as runGravityWellWorldMechanics } from './games/GravityWellWorldMechanics.test.mjs';
import { run as runFinalSystems } from './final/FinalSystems.test.mjs';
import { run as runFullscreenService } from './final/FullscreenService.test.mjs';
import { run as runPlatformUxSystems } from './final/PlatformUxSystems.test.mjs';
import { run as runPrecisionCollisionSystems } from './final/PrecisionCollisionSystems.test.mjs';
import { run as runMultiplayerNetworkingStack } from './final/MultiplayerNetworkingStack.test.mjs';
import { run as runEditorAutomationSecurityPipeline } from './final/EditorAutomationSecurityPipeline.test.mjs';
import { run as runDeveloperToolingSystems } from './final/DeveloperToolingSystems.test.mjs';
import { run as runReleaseReadinessSystems } from './final/ReleaseReadinessSystems.test.mjs';
import { run as runCombat } from './combat/Combat.test.mjs';
import { run as runEntity } from './entity/Entity.test.mjs';
import { run as runEventBus } from './events/EventBus.test.mjs';
import { run as runEventBusNaming } from './events/EventBusNaming.test.mjs';
import { run as runInputMap } from './input/InputMap.test.mjs';
import { run as runInputService } from './input/InputService.test.mjs';
import { run as runKeyboardState } from './input/KeyboardState.test.mjs';
import { run as runMouseState } from './input/MouseState.test.mjs';
import './input/GamepadState.test.mjs';
import { run as runSceneManager } from './scenes/SceneManager.test.mjs';
import { run as runTransitionScene } from './scenes/TransitionScene.test.mjs';
import { run as runVectorMath } from './vector/VectorMath.test.mjs';
import { run as runWorldSystems } from './world/WorldSystems.test.mjs';
import { run as runProductionReadiness } from './production/ProductionReadiness.test.mjs';
import { run as runEnginePublicBarrelImports } from './production/EnginePublicBarrelImports.test.mjs';
import { run as runStorageService } from './persistence/StorageService.test.mjs';
import './render/Renderer.test.mjs';
import { run as runReplaySystem } from './replay/ReplaySystem.test.mjs';
import './theme.test.js';

const tests = [
    ['AIBehaviors', runAIBehaviors],
    ['AssetLoaderSystem', runAssetLoaderSystem],
    ['ConfigStore', runConfigStore],
    ['EngineFullscreen', runEngineFullscreen],
    ['EngineSceneLifecycle', runEngineSceneLifecycle],
    ['EngineTiming', runEngineTiming],
    ['FixedTicker', runFixedTicker],
    ['FinalSystems', runFinalSystems],
    ['FullscreenService', runFullscreenService],
    ['PlatformUxSystems', runPlatformUxSystems],
    ['PrecisionCollisionSystems', runPrecisionCollisionSystems],
    ['MultiplayerNetworkingStack', runMultiplayerNetworkingStack],
    ['EditorAutomationSecurityPipeline', runEditorAutomationSecurityPipeline],
    ['DeveloperToolingSystems', runDeveloperToolingSystems],
    ['ReleaseReadinessSystems', runReleaseReadinessSystems],
    ['FrameClock', runFrameClock],
    ['ParticleSystem', runParticleSystem],
    ['RuntimeMetrics', runRuntimeMetrics],
    ['AsteroidsHardening', runAsteroidsHardening],
    ['AsteroidsCollisionTimingStress', runAsteroidsCollisionTimingStress],
    ['AsteroidsValidation', runAsteroidsValidation],
    ['AsteroidsVectorTransforms', runAsteroidsVectorTransforms],
    ['GravityWell', runGravityWell],
    ['GravityWellDeterminismTimingStress', runGravityWellDeterminismTimingStress],
    ['GravityWellReplay', runGravityWellReplay],
    ['GravityWellValidation', runGravityWellValidation],
    ['GravityWellWorldMechanics', runGravityWellWorldMechanics],
    ['Combat', runCombat],
    ['Entity', runEntity],
    ['EventBus', runEventBus],
    ['EventBusNaming', runEventBusNaming],
    ['InputMap', runInputMap],
    ['InputService', runInputService],
    ['KeyboardState', runKeyboardState],
    ['MouseState', runMouseState],
    ['StorageService', runStorageService],
    ['ReplaySystem', runReplaySystem],
    ['EnginePublicBarrelImports', runEnginePublicBarrelImports],
    ['ProductionReadiness', runProductionReadiness],
    ['SceneManager', runSceneManager],
    ['TransitionScene', runTransitionScene],
    ['VectorMath', runVectorMath],
    ['WorldSystems', runWorldSystems],
];

let passed = 0;

for (const [name, test] of tests) {
    await test();
    console.log(`PASS ${name}`);
    passed += 1;
}

console.log(`\n${passed}/${tests.length} explicit run() tests passed.`);
