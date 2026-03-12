

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

    // Standard intersection test
    const line1Start = { x: 0, y: 0 };
    const line1End = { x: 4, y: 4 };
    const line2Start = { x: 0, y: 4 };
    const line2End = { x: 4, y: 0 };
    const intersection1 = GeometryUtils.getLineIntersectionPoint(line1Start, line1End, line2Start, line2End);
    assert(intersection1 !== null, "Test failed: Lines should intersect");
    assert(Math.abs(intersection1.x - 2) < 1e-10 && Math.abs(intersection1.y - 2) < 1e-10, "Test failed: Incorrect intersection point");

    // Parallel lines (no intersection)
    const line3Start = { x: 0, y: 1 };
    const line3End = { x: 4, y: 1 };
    const line4Start = { x: 0, y: 3 };
    const line4End = { x: 4, y: 3 };
    const intersection2 = GeometryUtils.getLineIntersectionPoint(line3Start, line3End, line4Start, line4End);
    assert(intersection2 === null, "Test failed: Parallel lines should not intersect");

    // Coincident lines (overlapping, infinite intersections)
    const line5Start = { x: 1, y: 1 };
    const line5End = { x: 3, y: 3 };
    const line6Start = { x: 2, y: 2 };
    const line6End = { x: 4, y: 4 };
    const intersection3 = GeometryUtils.getLineIntersectionPoint(line5Start, line5End, line6Start, line6End);
    assert(intersection3 === null, "Test failed: Overlapping segments should not return a single intersection point");

    // T-junction (one line ends on another)
    const line7Start = { x: 1, y: 1 };
    const line7End = { x: 3, y: 3 };
    const line8Start = { x: 2, y: 3 };
    const line8End = { x: 2, y: 1 };
    const intersection4 = GeometryUtils.getLineIntersectionPoint(line7Start, line7End, line8Start, line8End);
    assert(intersection4 !== null, "Test failed: Lines should intersect at a T-junction");
    assert(Math.abs(intersection4.x - 2) < 1e-10 && Math.abs(intersection4.y - 2) < 1e-10, "Test failed: Incorrect intersection point at T-junction");

    // Intersection outside of segments (but would intersect if extended)
    const line9Start = { x: 0, y: 0 };
    const line9End = { x: 1, y: 1 };
    const line10Start = { x: 2, y: 2 };
    const line10End = { x: 3, y: 3 };
    const intersection5 = GeometryUtils.getLineIntersectionPoint(line9Start, line9End, line10Start, line10End);
    assert(intersection5 === null, "Test failed: Lines would intersect if extended, but segments do not overlap");
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
