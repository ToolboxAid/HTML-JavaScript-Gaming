// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// angleUtilsTest.js

import AngleUtils from '../../../engine/math/angleUtils.js';

export function testAngleUtils(assert) {
    // Test toDegrees and toRadians
    assert(AngleUtils.toDegrees(Math.PI) === 180, "toDegrees failed");
    assert(AngleUtils.toRadians(180) === Math.PI, "toRadians failed");

    // Test normalizeAngle
    assert(AngleUtils.normalizeAngle(370) === 10, "normalizeAngle failed");
    assert(AngleUtils.normalizeAngle(-10) === 350, "normalizeAngle failed");

    // Test applyRotation
    const obj = { rotationAngle: 30, rotationSpeed: 10 };
    AngleUtils.applyRotation(obj, 1, 1);
    assert(obj.rotationAngle === 40, "applyRotation failed");

    // Test applyRotationToPoint
    const rotatedPoint = AngleUtils.applyRotationToPoint(1, 0, 90);
    assert(Math.abs(rotatedPoint.rotatedX) < 1e-10, "applyRotationToPoint X failed");
    assert(Math.abs(rotatedPoint.rotatedY - 1) < 1e-10, "applyRotationToPoint Y failed");

    // Test angleToVector
    const vector = AngleUtils.angleToVector(90);
    assert(Math.abs(vector.x) < 1e-10, "angleToVector X failed");
    assert(Math.abs(vector.y - 1) < 1e-10, "angleToVector Y failed");

    // Test angle calculations
    assert(Math.abs(AngleUtils.velocityToAngle(1, 0)) < 1e-10, "velocityToAngle failed");
    assert(Math.abs(AngleUtils.velocityToAngle(0, 1) - 90) < 1e-10, "velocityToAngle failed");

    // Test angleToVelocity
    const angleVector = AngleUtils.angleToVelocity(180);
    assert(Math.abs(angleVector.x + 1) < 1e-10, "angleToVelocity X failed");
    assert(Math.abs(angleVector.y) < 1e-10, "angleToVelocity Y failed");

    const preciseAngleVector = AngleUtils.angleToVelocity(45);
    assert(Math.abs(preciseAngleVector.x - Math.SQRT1_2) < 1e-10, "angleToVelocity should not round by default");
    assert(Math.abs(preciseAngleVector.y - Math.SQRT1_2) < 1e-10, "angleToVelocity should not round by default");

    const roundedAngleVector = AngleUtils.angleToVelocity(45, 4);
    assert(roundedAngleVector.x === 0.7071, "angleToVelocity explicit precision X failed");
    assert(roundedAngleVector.y === 0.7071, "angleToVelocity explicit precision Y failed");

    // Test calculateOrbitalPosition
    const orbit = AngleUtils.calculateOrbitalPosition(0, 0, 90, 10);
    assert(Math.abs(orbit.x) < 1e-10, "calculateOrbitalPosition X failed");
    assert(Math.abs(orbit.y - 10) < 1e-10, "calculateOrbitalPosition Y failed");

    const orbitAlias = AngleUtils.getOrbitalPosition(0, 0, 90, 10);
    assert(Math.abs(orbitAlias.x) < 1e-10, "getOrbitalPosition X failed");
    assert(Math.abs(orbitAlias.y - 10) < 1e-10, "getOrbitalPosition Y failed");
}
