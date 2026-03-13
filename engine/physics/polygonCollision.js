// ToolboxAid.com
// David Quesenberry
// 03/13/2026
// polygonCollision.js

class PolygonCollision {
    constructor() {
        throw new Error('PolygonCollision is a utility class with only static methods. Do not instantiate.');
    }

    static doEdgesIntersect(A, B, C, D) {
        const det = (B[0] - A[0]) * (D[1] - C[1]) - (B[1] - A[1]) * (D[0] - C[0]);
        if (Math.abs(det) < 1e-6) {
            return false;
        }

        const t = ((C[0] - A[0]) * (D[1] - C[1]) - (C[1] - A[1]) * (D[0] - C[0])) / det;
        const u = ((C[0] - A[0]) * (B[1] - A[1]) - (C[1] - A[1]) * (B[0] - A[0])) / det;
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }

    static isPointInsidePolygon(x, y, polygon, debug = false) {
        if (!Array.isArray(polygon) || polygon.length < 3) {
            return false;
        }
        if (typeof x !== 'number' || typeof y !== 'number') {
            return false;
        }

        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const [xi, yi] = polygon[i];
            const [xj, yj] = polygon[j];

            if (x === xi && y === yi) {
                if (debug) {
                    console.log('Point is on a vertex:', x, y, polygon);
                }
                return true;
            }

            const edgeSlope = (xj - xi) * (y - yi) - (yj - yi) * (x - xi);
            const edgeLength = Math.sqrt((xj - xi) ** 2 + (yj - yi) ** 2);
            const tolerance = 1e-6 * edgeLength;
            const withinBoundingBox = (
                x >= Math.min(xi, xj) &&
                x <= Math.max(xi, xj) &&
                y >= Math.min(yi, yj) &&
                y <= Math.max(yi, yj)
            );

            if (Math.abs(edgeSlope) < tolerance && withinBoundingBox) {
                if (debug) {
                    console.log('Point is on an edge:', x, y, polygon);
                }
                return true;
            }

            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }

        if (inside && debug) {
            console.log('Ray intersects edge:', x, y, polygon);
        }

        return inside;
    }
}

export default PolygonCollision;
