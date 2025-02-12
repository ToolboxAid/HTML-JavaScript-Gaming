class GeometryUtils {

    // Distance between two points
    static getDistance(startPoint, endPoint, debug = false) {
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Check if two lines intersect

    static linesIntersect(line1Start, line1End, line2Start, line2End) {
        if (!line1Start || !line1End || !line2Start || !line2End ||
            !('x' in line1Start && 'y' in line1Start && 'x' in line1End && 'y' in line1End &&
                'x' in line2Start && 'y' in line2Start && 'x' in line2End && 'y' in line2End)) {
            throw new Error('Invalid input: all points must have x and y properties');
        }
        const denom = (line1End.x - line1Start.x) * (line2End.y - line2Start.y) -
            (line1End.y - line1Start.y) * (line2End.x - line2Start.x);
        if (denom === 0) return null;
        const ua = ((line2End.x - line2Start.x) * (line1Start.y - line2Start.y) -
            (line2End.y - line2Start.y) * (line1Start.x - line2Start.x)) / denom;
        const ub = ((line1End.x - line1Start.x) * (line1Start.y - line2Start.y) -
            (line1End.y - line1Start.y) * (line1Start.x - line2Start.x)) / denom;
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;
        return {
            x: line1Start.x + ua * (line1End.x - line1Start.x),
            y: line1Start.y + ua * (line1End.y - line1Start.y)
        };
    }

    static linesIntersect2(line1Start, line1End, line2Start, line2End) {
        // These are points : line1Start, line1End, line2Start, line2End
        const denom = (line1End.x - line1Start.x) * (line2End.y - line2Start.y) - (line1End.y - line1Start.y) * (line2End.x - line2Start.x);

        if (denom === 0) {
            return null; // Lines are parallel
        }

        const ua = ((line2End.x - line2Start.x) * (line1Start.y - line2Start.y) -
            (line2End.y - line2Start.y) * (line1Start.x - line2Start.x)) / denom;
        const ub = ((line1End.x - line1Start.x) * (line1Start.y - line2Start.y) -
            (line1End.y - line1Start.y) * (line1Start.x - line2Start.x)) / denom;

        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return null; // Intersection is outside the line segments
        }

        const intersectionPoint = {
            x: line1Start.x + ua * (line1End.x - line1Start.x),
            y: line1Start.y + ua * (line1End.y - line1Start.y)
        };

        return intersectionPoint; // Return the intersection point
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