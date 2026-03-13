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
    ['gameObjectUtils', testModules[6].testGameObjectUtils],
    ['gameUtils', testModules[7].testGameUtils],
    ['angleUtils', testModules[8].testAngleUtils],
    ['geometryUtils', testModules[9].testGeometryUtils],
    ['randomUtils', testModules[10].testRandomUtils],
    ['physicsUtils', testModules[11].testPhysicsUtils],
    ['pngAssetState', testModules[12].testPngAssetState],
    ['systemUtils', testModules[13].testSystemUtils]
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
