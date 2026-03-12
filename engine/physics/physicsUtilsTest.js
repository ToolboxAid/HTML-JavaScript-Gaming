// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// physicsUtilsTest.js
import PhysicsUtils from './physicsUtils.js';

export function testPhysicsUtils(assert) {
    // Mock object to be used in tests
    let object = { xVelocity: 0, yVelocity: 0, x: 0, y: 0 };

    // Test applyGravity
    PhysicsUtils.applyGravity(object, 9.81, 1);
    assert(object.yVelocity === 9.81, "applyGravity failed");

    // Test applyWind
    PhysicsUtils.applyWind(object, 2.5, 1);
    assert(object.xVelocity === 2.5, "applyWind failed");

    // Test applyFriction
    object.xVelocity = 10;
    object.yVelocity = 10;
    PhysicsUtils.applyFriction(object, 0.1);
    assert(object.xVelocity === 9, "applyFriction failed on xVelocity");
    assert(object.yVelocity === 9, "applyFriction failed on yVelocity");

    // Test applyDrag
    object.xVelocity = 10;
    object.yVelocity = 10;
    PhysicsUtils.applyDrag(object, 0.05);
    assert(object.xVelocity === 9.5, "applyDrag failed on xVelocity");
    assert(object.yVelocity === 9.5, "applyDrag failed on yVelocity");

    // Test applyBounce
    object.yVelocity = 10;
    PhysicsUtils.applyBounce(object, 0.8);
    assert(object.yVelocity === -8, "applyBounce failed");

    // Test applyAcceleration
    object.xVelocity = 0;
    object.yVelocity = 0;
    PhysicsUtils.applyAcceleration(object, { x: 5, y: -3 }, 2);
    assert(object.xVelocity === 10, "applyAcceleration failed on xVelocity");
    assert(object.yVelocity === -6, "applyAcceleration failed on yVelocity");

    // Test applyMomentum
    object.xVelocity = 4;
    object.yVelocity = 3;
    PhysicsUtils.applyMomentum(object, 2);
    assert(object.momentumX === 8, "applyMomentum failed on momentumX");
    assert(object.momentumY === 6, "applyMomentum failed on momentumY");

    // Test applyImpulse
    object.xVelocity = 0;
    object.yVelocity = 0;
    PhysicsUtils.applyImpulse(object, { x: 7, y: -4 });
    assert(object.xVelocity === 7, "applyImpulse failed on xVelocity");
    assert(object.yVelocity === -4, "applyImpulse failed on yVelocity");

    // Test applyProjectileMotion
    object.xVelocity = 5;
    object.yVelocity = 10;
    object.x = 0;
    object.y = 0;
    PhysicsUtils.applyProjectileMotion(object, 1);
    assert(object.x === 5, "applyProjectileMotion failed on x");
    const epsilon = 0.0001;
    assert(Math.abs(object.y - 19.81) < epsilon, "applyProjectileMotion failed on y");

    // Test applySpringForce
    object.xVelocity = 0;
    PhysicsUtils.applySpringForce(object, 2, 5);
    assert(object.xVelocity === -10, "applySpringForce failed");

    // Test applyKinematics
    object.x = 0;
    object.y = 0;
    object.xVelocity = 3;
    object.yVelocity = -2;
    PhysicsUtils.applyKinematics(object, 2);
    assert(object.x === 6, "applyKinematics failed on x");
    assert(object.y === -4, "applyKinematics failed on y");
}
