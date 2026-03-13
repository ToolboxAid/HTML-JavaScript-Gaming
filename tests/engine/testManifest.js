// Shared engine test manifest used by Node and browser test runners.

export const engineTestEntries = [
  { name: 'animationStateBridge', modulePath: './animation/animationStateBridgeTest.js', exportName: 'testAnimationStateBridge' },
  { name: 'stateUtils', modulePath: './animation/stateUtilsTest.js', exportName: 'testStateUtils' },
  { name: 'spriteController', modulePath: './animation/spriteControllerTest.js', exportName: 'testSpriteController' },
  { name: 'pngController', modulePath: './animation/pngControllerTest.js', exportName: 'testPngController' },
  { name: 'objectBaseClass', modulePath: './objects/objectBaseClassTest.js', exportName: 'testObjectBaseClass' },
  { name: 'objectLifecycle', modulePath: './objects/objectLifecycleTest.js', exportName: 'testObjectLifecycle' },
  { name: 'rendererSafety', modulePath: './renderers/rendererSafetyTest.js', exportName: 'testRendererSafety' },
  { name: 'inputCore', modulePath: './input/inputCoreTest.js', exportName: 'testInputCore' },
  { name: 'controllerFlow', modulePath: './input/controller/controllerFlowTest.js', exportName: 'testControllerFlow' },
  { name: 'messagesCore', modulePath: './messages/messagesCoreTest.js', exportName: 'testMessagesCore' },
  { name: 'objectLifecycleCore', modulePath: './lifecycle/objectLifecycleTest.js', exportName: 'testObjectLifecycleCore' },
  { name: 'cookies', modulePath: './misc/cookiesTest.js', exportName: 'testCookies' },
  { name: 'outputCore', modulePath: './output/outputCoreTest.js', exportName: 'testOutputCore' },
  { name: 'gameObjectSystem', modulePath: './game/gameObjectSystemTest.js', exportName: 'testGameObjectSystem' },
  { name: 'gameCollision', modulePath: './game/gameCollisionTest.js', exportName: 'testGameCollision' },
  { name: 'gameObjectUtils', modulePath: './game/gameObjectUtilsTest.js', exportName: 'testGameObjectUtils' },
  { name: 'gameUtils', modulePath: './game/gameUtilsTest.js', exportName: 'testGameUtils' },
  { name: 'angleUtils', modulePath: './math/angleUtilsTest.js', exportName: 'testAngleUtils' },
  { name: 'geometryUtils', modulePath: './math/geometryUtilsTest.js', exportName: 'testGeometryUtils' },
  { name: 'randomUtils', modulePath: './math/randomUtilsTest.js', exportName: 'testRandomUtils' },
  { name: 'physicsUtils', modulePath: './physics/physicsUtilsTest.js', exportName: 'testPhysicsUtils' },
  { name: 'pngAssetState', modulePath: './utils/pngAssetStateTest.js', exportName: 'testPngAssetState' },
  { name: 'systemUtils', modulePath: './utils/systemUtilsTest.js', exportName: 'testSystemUtils' },
  { name: 'objectSpriteFrameConfig', modulePath: './objects/objectSpriteFrameConfigTest.js', exportName: 'testObjectSpriteFrameConfig' }
];
