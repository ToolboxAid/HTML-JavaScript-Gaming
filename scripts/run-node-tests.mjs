globalThis.window = {
    location: {
        search: ''
    }
};

const { runTests } = await import('../engine/runTest.js');

const testModules = await Promise.all([
    import('../engine/animation/stateUtilsTest.js'),
    import('../engine/animation/spriteControllerTest.js'),
    import('../engine/animation/pngControllerTest.js'),
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
    ['stateUtils', testModules[0].testStateUtils],
    ['spriteController', testModules[1].testSpriteController],
    ['pngController', testModules[2].testPngController],
    ['gameObjectUtils', testModules[3].testGameObjectUtils],
    ['gameUtils', testModules[4].testGameUtils],
    ['angleUtils', testModules[5].testAngleUtils],
    ['geometryUtils', testModules[6].testGeometryUtils],
    ['randomUtils', testModules[7].testRandomUtils],
    ['physicsUtils', testModules[8].testPhysicsUtils],
    ['pngAssetState', testModules[9].testPngAssetState],
    ['systemUtils', testModules[10].testSystemUtils]
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
