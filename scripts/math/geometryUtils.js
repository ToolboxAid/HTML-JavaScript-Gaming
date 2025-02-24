// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// angleUtils.js

class GeometryUtils {

    /** Constructor for GeometryUtils class.
    * @throws {Error} Always throws error as this is a utility class with only static methods.
    * @example
    * ❌ Don't do this:
    * const geometryUtils = new GeometryUtils(); // Throws Error
    * 
    * ✅ Do this:
    * GeometryUtils.getDistanceObjects(...); // Use static methods directly
    */
    constructor() {
        throw new Error('GeometryUtils is a utility class with only static methods. Do not instantiate.');
    }

    static getDistanceObjects(objectA, objectB) {
        const pointA = { x: objectA.x, y: objectA.y };
        const pointB = { x: objectB.x, y: objectB.y };
        return this.getDistance(pointA, pointB);
    }
    // Distance between two points
    static getDistance(startPoint, endPoint, debug = false) {
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    // Check if two lines intersect (defined by points)
    static doLinesIntersectByPoints(p1, p2, p3, p4) {
        return this.getLineIntersectionPoint(p1, p2, p3, p4) !== null;
    }

    // Check if two lines intersect (defined as objects)
    static doLinesIntersect(line1, line2) {
        return this.getLinesIntersection(line1, line2) !== null;
    }

    // Get the intersection point of two lines (defined as objects)
    static getLinesIntersection(line1, line2) {
        return this.getLineIntersectionPoint(line1.start, line1.end, line2.start, line2.end);
    }

    // Get the intersection point of two lines (defined by points)
    static getLineIntersectionPoint(p1, p2, p3, p4) {
        // Convert arrays to objects if necessary
        if (Array.isArray(p1)) p1 = { x: p1[0], y: p1[1] };
        if (Array.isArray(p2)) p2 = { x: p2[0], y: p2[1] };
        if (Array.isArray(p3)) p3 = { x: p3[0], y: p3[1] };
        if (Array.isArray(p4)) p4 = { x: p4[0], y: p4[1] };

        // Validate that each point is an object with 'x' and 'y' properties
        if (!p1 || !p2 || !p3 || !p4 ||
            typeof p1.x === 'undefined' || typeof p1.y === 'undefined' ||
            typeof p2.x === 'undefined' || typeof p2.y === 'undefined' ||
            typeof p3.x === 'undefined' || typeof p3.y === 'undefined' ||
            typeof p4.x === 'undefined' || typeof p4.y === 'undefined') {
            throw new Error('Invalid points passed to getLineIntersectionPoint');
        }

        const { x: x1, y: y1 } = p1;
        const { x: x2, y: y2 } = p2;
        const { x: x3, y: y3 } = p3;
        const { x: x4, y: y4 } = p4;

        const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

        if (denominator === 0) return null; // Lines are parallel or coincident

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
        const u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denominator;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1),
            };
        }

        return null; // Intersection is outside the line segments
    }

    // Calculate the area of a triangle
    static triangleArea(p1, p2, p3) {
        return Math.abs(
            (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2
        );
    }

    // Check if a point is inside a circle
    static pointInCircle(point, center, radius) {
        const dx = point.x - center.x;
        const dy = point.y - center.y;
        return dx * dx + dy * dy <= radius * radius;
    }

    // Rotate a point around another point
    static rotatePoint(point, center, angle) {
        const radians = (angle * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const dx = point.x - center.x;
        const dy = point.y - center.y;
        return {
            x: center.x + (dx * cos - dy * sin),
            y: center.y + (dx * sin + dy * cos),
        };
    }
}

export default GeometryUtils;
