globalThis.window = {
    location: {
        search: ''
    }
};

const { runTests } = await import('../engine/runTest.js');

const testModules = await Promise.all([
    import('../engine/animation/animationStateBridgeTest.js'),
    import('../engine/animation/stateUtilsTest.js'),
    import('../engine/animation/spriteControllerTest.js'),
    import('../engine/animation/pngControllerTest.js'),
    import('../engine/objects/objectBaseClassTest.js'),
    import('../engine/objects/objectLifecycleTest.js'),
    import('../engine/renderers/rendererSafetyTest.js'),
    import('../engine/input/inputCoreTest.js'),
    import('../engine/input/controller/controllerFlowTest.js'),
    import('../engine/game/gameObjectUtilsTest.js'),
    import('../engine/game/gameUtilsTest.js'),
    import('../engine/math/angleUtilsTest.js'),
    import('../engine/math/geometryUtilsTest.js'),
    import('../engine/math/randomUtilsTest.js'),
    import('../engine/physics/physicsUtilsTest.js'),
    import('../engine/utils/pngAssetStateTest.js'),
    import('../engine/utils/systemUtilsTest.js')
]);

const tests = [
    ['animationStateBridge', testModules[0].testAnimationStateBridge],
    ['stateUtils', testModules[1].testStateUtils],
    ['spriteController', testModules[2].testSpriteController],
    ['pngController', testModules[3].testPngController],
    ['objectBaseClass', testModules[4].testObjectBaseClass],
    ['objectLifecycle', testModules[5].testObjectLifecycle],
    ['rendererSafety', testModules[6].testRendererSafety],
    ['inputCore', testModules[7].testInputCore],
    ['controllerFlow', testModules[8].testControllerFlow],
    ['gameObjectUtils', testModules[9].testGameObjectUtils],
    ['gameUtils', testModules[10].testGameUtils],
    ['angleUtils', testModules[11].testAngleUtils],
    ['geometryUtils', testModules[12].testGeometryUtils],
    ['randomUtils', testModules[13].testRandomUtils],
    ['physicsUtils', testModules[14].testPhysicsUtils],
    ['pngAssetState', testModules[15].testPngAssetState],
    ['systemUtils', testModules[16].testSystemUtils]
];

let passedCount = 0;

for (const [moduleName, testFunction] of tests) {
    if (runTests(moduleName, testFunction)) {
        passedCount += 1;
    }
}

const failedCount = tests.length - passedCount;
console.log(`\nTest summary: ${passedCount}/${tests.length} passed.`);

if (failedCount > 0) {
    process.exitCode = 1;
}
