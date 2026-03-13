// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// geometryUtils.js

class GeometryUtils {

    /** Constructor for GeometryUtils class. */
    constructor() {
        throw new Error('GeometryUtils is a utility class with only static methods. Do not instantiate.');
    }

    /** Get distance between two objects with x,y coordinates. */
    static getDistanceObjects(objectA, objectB) {
        const pointA = { x: objectA.x, y: objectA.y };
        const pointB = { x: objectB.x, y: objectB.y };
        return this.getDistance(pointA, pointB);
    }

    /** Get center point of a rectangle object. */
    static getRectangleCenterPoint(object) {
        return {
            x: object.x + (object.width / 2),
            y: object.y + (object.height / 2)
        };
    }

    /** Get top-left corner of a rectangle object. */
    static getRectangleTopLeftPoint(object) {
        return { x: object.x, y: object.y };
    }

    /** Get top-right corner of a rectangle object. */
    static getRectangleTopRightPoint(object) {
        return { x: object.x + object.width, y: object.y };
    }

    /** Get bottom-left corner of a rectangle object. */
    static getRectangleBottomLeftPoint(object) {
        return { x: object.x, y: object.y + object.height };
    }

    /** Get bottom-right corner of a rectangle object. */
    static getRectangleBottomRightPoint(object) {
        return { x: object.x + object.width, y: object.y + object.height };
    }

    /** Calculate distance between two points. */
    static getDistance(startPoint, endPoint) {
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /** Calculate squared distance between two points (faster, no square root). */
    static getDistanceSquared(x1, y1, x2, y2) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    // Check if two lines intersect (defined by points)
    static doLinesIntersectByPoints(p1, p2, p3, p4) {
        return this.getLineIntersectionPoint(p1, p2, p3, p4) !== null;
    }

    // // Check if two lines intersect (defined as objects)
    // static doLinesIntersect(line1, line2) {
    //     return this.getLinesIntersection(line1, line2) !== null;
    // }

    // Get the intersection point of two lines (defined as objects)
    static getLinesIntersection(line1, line2) {
        return this.getLineIntersectionPoint(line1.start, line1.end, line2.start, line2.end);
    }

    // Get the intersection point of two lines (defined by points)
    static getLineIntersectionPoint(p1, p2, p3, p4) {
        if (Array.isArray(p1)) p1 = { x: p1[0], y: p1[1] };
        if (Array.isArray(p2)) p2 = { x: p2[0], y: p2[1] };
        if (Array.isArray(p3)) p3 = { x: p3[0], y: p3[1] };
        if (Array.isArray(p4)) p4 = { x: p4[0], y: p4[1] };

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

        if (denominator === 0) return null;

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
        const u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denominator;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1),
            };
        }

        return null;
    }

    // Calculate the area of a triangle
    static triangleArea(p1, p2, p3) {
        return Math.abs(
            (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2
        );
    }

    /** Check if a point is inside a circle. */
    static pointInCircle(point, center, radius) {
        const dx = point.x - center.x;
        const dy = point.y - center.y;
        return dx * dx + dy * dy <= radius * radius;
    }

    /** Check if a point is inside a circle (alias for pointInCircle). */
    static isPointInsideCircle(point, circleCenter, radius) {
        return this.pointInCircle(point, circleCenter, radius);
    }

    /** Get intersection points between a line segment and a circle. */
    static getLineCircleIntersections(lineStart, lineEnd, circleCenter, radius) {
        const dx = lineEnd.x - lineStart.x;
        const dy = lineEnd.y - lineStart.y;
        const fx = lineStart.x - circleCenter.x;
        const fy = lineStart.y - circleCenter.y;

        const a = dx * dx + dy * dy;
        const b = 2 * (fx * dx + fy * dy);
        const c = fx * fx + fy * fy - radius * radius;

        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            return [];
        }

        const intersections = [];

        if (discriminant === 0) {
            const t = -b / (2 * a);
            intersections.push({
                x: lineStart.x + t * dx,
                y: lineStart.y + t * dy
            });
        } else {
            const sqrtD = Math.sqrt(discriminant);
            const t1 = (-b - sqrtD) / (2 * a);
            const t2 = (-b + sqrtD) / (2 * a);

            intersections.push(
                {
                    x: lineStart.x + t1 * dx,
                    y: lineStart.y + t1 * dy
                },
                {
                    x: lineStart.x + t2 * dx,
                    y: lineStart.y + t2 * dy
                }
            );
        }

        return intersections;
    }

    /** Check if two circles intersect or touch. */
    static doCirclesIntersect(center1, radius1, center2, radius2) {
        const dx = center2.x - center1.x;
        const dy = center2.y - center1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const sumRadii = radius1 + radius2;
        const diffRadii = Math.abs(radius1 - radius2);

        return distance <= sumRadii && distance >= diffRadii;
    }

    /** Get tangent points from a point to a circle. */
    static getTangentsFromPointToCircle(point, circleCenter, radius) {
        const dx = point.x - circleCenter.x;
        const dy = point.y - circleCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < radius) {
            return [];
        }

        if (Math.abs(distance - radius) < 1e-10) {
            return [{
                x: point.x,
                y: point.y
            }];
        }

        const angle = Math.atan2(dy, dx);
        const alpha = Math.asin(radius / distance);
        const theta1 = angle + alpha;
        const theta2 = angle - alpha;

        return [
            {
                x: circleCenter.x + radius * Math.cos(theta1),
                y: circleCenter.y + radius * Math.sin(theta1)
            },
            {
                x: circleCenter.x + radius * Math.cos(theta2),
                y: circleCenter.y + radius * Math.sin(theta2)
            }
        ];
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

// TODO: complete these
// Translate a Point by a Vector
// static translatePoint(point, vector) { ... }

// Scale a Point Relative to an Origin
// static scalePoint(point, origin, scaleFactor) { ... }

// Mirror a Point Across a Line
// static mirrorPointAcrossLine(point, lineStart, lineEnd) { ... }

export default GeometryUtils;
