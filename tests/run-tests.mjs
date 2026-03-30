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
import { run as runAudioService } from './audio/AudioService.test.mjs';
import { run as runAsteroidsHardening } from './games/AsteroidsHardening.test.mjs';
import { run as runAsteroidsCollisionTimingStress } from './games/AsteroidsCollisionTimingStress.test.mjs';
import { run as runAsteroidsValidation } from './games/AsteroidsValidation.test.mjs';
import { run as runAsteroidsVectorTransforms } from './games/AsteroidsVectorTransforms.test.mjs';
import { run as runAsteroidsPresentation } from './games/AsteroidsPresentation.test.mjs';
import { run as runAITargetDummyWorld } from './games/AITargetDummyWorld.test.mjs';
import { run as runAITargetDummyValidation } from './games/AITargetDummyValidation.test.mjs';
import { run as runBouncingBallValidation } from './games/BouncingBallValidation.test.mjs';
import { run as runBouncingBallWorld } from './games/BouncingBallWorld.test.mjs';
import { run as runBreakoutValidation } from './games/BreakoutValidation.test.mjs';
import { run as runBreakoutWorld } from './games/BreakoutWorld.test.mjs';
import { run as runGravityValidation } from './games/GravityValidation.test.mjs';
import { run as runGravityWorld } from './games/GravityWorld.test.mjs';
import { run as runGravityWell } from './games/GravityWell.test.mjs';
import { run as runGravityWellDeterminismTimingStress } from './games/GravityWellDeterminismTimingStress.test.mjs';
import { run as runGravityWellReplay } from './games/GravityWellReplay.test.mjs';
import { run as runGravityWellValidation } from './games/GravityWellValidation.test.mjs';
import { run as runGravityWellWorldMechanics } from './games/GravityWellWorldMechanics.test.mjs';
import { run as runMultiBallChaosValidation } from './games/MultiBallChaosValidation.test.mjs';
import { run as runMultiBallChaosWorld } from './games/MultiBallChaosWorld.test.mjs';
import { run as runPaddleInterceptValidation } from './games/PaddleInterceptValidation.test.mjs';
import { run as runPaddleInterceptWorld } from './games/PaddleInterceptWorld.test.mjs';
import { run as runPacmanLiteValidation } from './games/PacmanLiteValidation.test.mjs';
import { run as runPacmanLiteWorld } from './games/PacmanLiteWorld.test.mjs';
import { run as runPacmanFullAIValidation } from './games/PacmanFullAIValidation.test.mjs';
import { run as runPacmanFullAIWorld } from './games/PacmanFullAIWorld.test.mjs';
import { run as runPongValidation } from './games/PongValidation.test.mjs';
import { run as runPongAudio } from './games/PongAudio.test.mjs';
import { run as runPongWorld } from './games/PongWorld.test.mjs';
import { run as runSolarSystemValidation } from './games/SolarSystemValidation.test.mjs';
import { run as runSolarSystemWorld } from './games/SolarSystemWorld.test.mjs';
import { run as runSpaceInvadersFont } from './games/SpaceInvadersFont.test.mjs';
import { run as runSpaceInvadersAudio } from './games/SpaceInvadersAudio.test.mjs';
import { run as runSpaceInvadersHighScorePersistence } from './games/SpaceInvadersHighScorePersistence.test.mjs';
import { run as runSpaceInvadersScene } from './games/SpaceInvadersScene.test.mjs';
import { run as runSpaceInvadersWorld } from './games/SpaceInvadersWorld.test.mjs';
import { run as runSpaceDuelCore } from './games/SpaceDuelCore.test.mjs';
import { run as runSpaceDuelHighScorePersistence } from './games/SpaceDuelHighScorePersistence.test.mjs';
import { run as runThrusterValidation } from './games/ThrusterValidation.test.mjs';
import { run as runThrusterWorld } from './games/ThrusterWorld.test.mjs';
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
import { run as runGamepadInputAdapter } from './input/GamepadInputAdapter.test.mjs';
import { run as runInputService } from './input/InputService.test.mjs';
import { run as runKeyboardState } from './input/KeyboardState.test.mjs';
import { run as runMouseState } from './input/MouseState.test.mjs';
import './input/GamepadState.test.mjs';
import { run as runAttractModeController } from './scenes/AttractModeController.test.mjs';
import { run as runSceneManager } from './scenes/SceneManager.test.mjs';
import { run as runTransitionScene } from './scenes/TransitionScene.test.mjs';
import { run as runVectorMath } from './vector/VectorMath.test.mjs';
import { run as runWorldSystems } from './world/WorldSystems.test.mjs';
import { run as runWorldGameStateSystem } from './world/WorldGameStateSystem.test.mjs';
import { run as runWorldGameStateAuthoritativeHandoff } from './world/WorldGameStateAuthoritativeHandoff.test.mjs';
import { run as runProductionReadiness } from './production/ProductionReadiness.test.mjs';
import { run as runEnginePublicBarrelImports } from './production/EnginePublicBarrelImports.test.mjs';
import { run as runStorageService } from './persistence/StorageService.test.mjs';
import './render/Renderer.test.mjs';
import { run as runReplaySystem } from './replay/ReplaySystem.test.mjs';
import { run as runOrbitLabModel } from './samples/OrbitLabModel.test.mjs';
import { run as runOrbitLabScene } from './samples/OrbitLabScene.test.mjs';
import { run as runProjectileLabModel } from './samples/ProjectileLabModel.test.mjs';
import { run as runProjectileLabScene } from './samples/ProjectileLabScene.test.mjs';
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
    ['AudioService', runAudioService],
    ['RuntimeMetrics', runRuntimeMetrics],
    ['AsteroidsHardening', runAsteroidsHardening],
    ['AsteroidsCollisionTimingStress', runAsteroidsCollisionTimingStress],
    ['AsteroidsValidation', runAsteroidsValidation],
    ['AsteroidsVectorTransforms', runAsteroidsVectorTransforms],
    ['AsteroidsPresentation', runAsteroidsPresentation],
    ['AITargetDummyWorld', runAITargetDummyWorld],
    ['AITargetDummyValidation', runAITargetDummyValidation],
    ['BouncingBallValidation', runBouncingBallValidation],
    ['BouncingBallWorld', runBouncingBallWorld],
    ['BreakoutValidation', runBreakoutValidation],
    ['BreakoutWorld', runBreakoutWorld],
    ['GravityValidation', runGravityValidation],
    ['GravityWorld', runGravityWorld],
    ['GravityWell', runGravityWell],
    ['GravityWellDeterminismTimingStress', runGravityWellDeterminismTimingStress],
    ['GravityWellReplay', runGravityWellReplay],
    ['GravityWellValidation', runGravityWellValidation],
    ['GravityWellWorldMechanics', runGravityWellWorldMechanics],
    ['MultiBallChaosValidation', runMultiBallChaosValidation],
    ['MultiBallChaosWorld', runMultiBallChaosWorld],
    ['PaddleInterceptValidation', runPaddleInterceptValidation],
    ['PaddleInterceptWorld', runPaddleInterceptWorld],
    ['PacmanLiteValidation', runPacmanLiteValidation],
    ['PacmanLiteWorld', runPacmanLiteWorld],
    ['PacmanFullAIValidation', runPacmanFullAIValidation],
    ['PacmanFullAIWorld', runPacmanFullAIWorld],
    ['PongValidation', runPongValidation],
    ['PongAudio', runPongAudio],
    ['PongWorld', runPongWorld],
    ['SolarSystemValidation', runSolarSystemValidation],
    ['SolarSystemWorld', runSolarSystemWorld],
    ['SpaceInvadersFont', runSpaceInvadersFont],
    ['SpaceInvadersAudio', runSpaceInvadersAudio],
    ['SpaceInvadersHighScorePersistence', runSpaceInvadersHighScorePersistence],
    ['SpaceInvadersScene', runSpaceInvadersScene],
    ['SpaceInvadersWorld', runSpaceInvadersWorld],
    ['SpaceDuelCore', runSpaceDuelCore],
    ['SpaceDuelHighScorePersistence', runSpaceDuelHighScorePersistence],
    ['ThrusterValidation', runThrusterValidation],
    ['ThrusterWorld', runThrusterWorld],
    ['Combat', runCombat],
    ['Entity', runEntity],
    ['EventBus', runEventBus],
    ['EventBusNaming', runEventBusNaming],
    ['InputMap', runInputMap],
    ['GamepadInputAdapter', runGamepadInputAdapter],
    ['InputService', runInputService],
    ['KeyboardState', runKeyboardState],
    ['MouseState', runMouseState],
    ['StorageService', runStorageService],
    ['ReplaySystem', runReplaySystem],
    ['OrbitLabModel', runOrbitLabModel],
    ['OrbitLabScene', runOrbitLabScene],
    ['ProjectileLabModel', runProjectileLabModel],
    ['ProjectileLabScene', runProjectileLabScene],
    ['EnginePublicBarrelImports', runEnginePublicBarrelImports],
    ['ProductionReadiness', runProductionReadiness],
    ['AttractModeController', runAttractModeController],
    ['SceneManager', runSceneManager],
    ['TransitionScene', runTransitionScene],
    ['VectorMath', runVectorMath],
    ['WorldSystems', runWorldSystems],
    ['WorldGameStateSystem', runWorldGameStateSystem],
    ['WorldGameStateAuthoritativeHandoff', runWorldGameStateAuthoritativeHandoff],
];

let passed = 0;

for (const [name, test] of tests) {
    await test();
    console.log(`PASS ${name}`);
    passed += 1;
}

console.log(`\n${passed}/${tests.length} explicit run() tests passed.`);
