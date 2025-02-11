export class GeometryUtils {
    // Distance between two points
    static getDistance(startPoint, endPoint, debug = false) {
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Check if two lines intersect
    static linesIntersect(line1Start, line1End, line2Start, line2End) {
        // Implementation of line intersection logic
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