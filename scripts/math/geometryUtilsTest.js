

// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// geometryUtilsTest.js

import GeometryUtils from './geometryUtils.js';

export function testGeometryUtils(assert) {
    // Test getDistance
    const point1 = { x: 0, y: 0 };
    const point2 = { x: 3, y: 4 };
    assert(Math.abs(GeometryUtils.getDistance(point1, point2) - 5) < 1e-10, "getDistance failed");

    // Test linesIntersect
    const line1Start = { x: 0, y: 0 };
    const line1End = { x: 4, y: 4 };
    const line2Start = { x: 0, y: 4 };
    const line2End = { x: 4, y: 0 };
    const intersection1 = GeometryUtils.linesIntersect(line1Start, line1End, line2Start, line2End);
    assert(intersection1 !== null, "linesIntersect failed (lines should intersect)");
    assert(Math.abs(intersection1.x - 2) < 1e-10 && Math.abs(intersection1.y - 2) < 1e-10, "linesIntersect failed (incorrect intersection point)");

    // Test linesIntersect2 (with same logic, you can test it similarly)
    const intersection2 = GeometryUtils.linesIntersect2(line1Start, line1End, line2Start, line2End);
    assert(intersection2 !== null, "linesIntersect2 failed (lines should intersect)");
    assert(Math.abs(intersection2.x - 2) < 1e-10 && Math.abs(intersection2.y - 2) < 1e-10, "linesIntersect2 failed (incorrect intersection point)");

    // Test triangleArea
    const trianglePoint1 = { x: 0, y: 0 };
    const trianglePoint2 = { x: 5, y: 0 };
    const trianglePoint3 = { x: 0, y: 5 };
    const area = GeometryUtils.triangleArea(trianglePoint1, trianglePoint2, trianglePoint3);
    assert(Math.abs(area - 12.5) < 1e-10, "triangleArea failed");

    // Test pointInCircle
    const pointIn = { x: 1, y: 1 };
    const pointOut = { x: 6, y: 6 };
    const circleCenter = { x: 0, y: 0 };
    const radius = 5;
    assert(GeometryUtils.pointInCircle(pointIn, circleCenter, radius), "pointInCircle failed (point should be inside)");
    assert(!GeometryUtils.pointInCircle(pointOut, circleCenter, radius), "pointInCircle failed (point should be outside)");

    // Test rotatePoint
    const pointToRotate = { x: 1, y: 0 };
    const centerPoint = { x: 0, y: 0 };
    const rotatedPoint = GeometryUtils.rotatePoint(pointToRotate, centerPoint, 90);
    assert(Math.abs(rotatedPoint.x) < 1e-10 && Math.abs(rotatedPoint.y - 1) < 1e-10, "rotatePoint failed");
}
