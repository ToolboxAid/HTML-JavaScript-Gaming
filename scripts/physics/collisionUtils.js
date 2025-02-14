// ToolboxAid.com
// David Quesenberry
// 02/14/2025
// collisionUtils.js

import CanvasUtils from "../../scripts/canvas.js"
import SystemUtils from "../utils/systemUtils.js";
import GeometryUtils from "../math/geometryUtils.js"
export default class CollisionUtils {
    // Play your game normally: game.html
    // Enable debug mode: game.html?collisionUtils
    static DEBUG = new URLSearchParams(window.location.search).has('collisionUtils');

    constructor() {
        throw new Error("'CollisionUtils' has only static methods.");
    }

    static isPointInsidePolygon(x, y, polygon) { // ray-casting algorithm for point-in-polygon detection
        if (this.DEBUG) {
            console.assert(
                Array.isArray(polygon) && polygon.length >= 3,
                `Invalid polygon: Expected an array with at least 3 points, got ${JSON.stringify(polygon)}`
            );
            console.assert(
                typeof x === 'number' && typeof y === 'number',
                `Invalid point coordinates: x=${x}, y=${y}`
            );
        }

        if (!Array.isArray(polygon) || polygon.length < 3) return false;
        if (typeof x !== 'number' || typeof y !== 'number') return false;

        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const [xi, yi] = polygon[i];
            const [xj, yj] = polygon[j];

            // Check if point is exactly on a vertex
            if ((x === xi && y === yi) || (x === xj && y === yj)) {
                return true;
            }

            // Check if the point is on the edge
            if (
                y >= Math.min(yi, yj) &&
                y <= Math.max(yi, yj) &&
                x >= Math.min(xi, xj) &&
                x <= Math.max(xi, xj)
            ) {
                const edgeSlope = (xj !== xi) ? (yj - yi) / (xj - xi) : Infinity;
                const pointSlope = (x !== xi) ? (y - yi) / (x - xi) : Infinity;
                if (edgeSlope === pointSlope) {
                    return true;
                }
            }

            // Ray-casting logic
            const intersect =
                yi > y !== yj > y &&
                x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
            if (intersect) inside = !inside;
        }

        return inside;
    }

    static arePolygonsOverlapping(polygon1, polygon2) {
        if (!Array.isArray(polygon1) || polygon1.length < 3 ||
            !Array.isArray(polygon2) || polygon2.length < 3) {
            return false;
        }

        // Check if any point of polygon1 is inside polygon2
        for (const [x, y] of polygon1) {
            if (this.isPointInsidePolygon(x, y, polygon2)) {
                return true;
            }
        }

        // Check if any point of polygon2 is inside polygon1
        for (const [x, y] of polygon2) {
            if (this.isPointInsidePolygon(x, y, polygon1)) {
                return true;
            }
        }

        // Check if any edges of polygon1 intersect with edges of polygon2
        for (let i = 0; i < polygon1.length; i++) {
            let p1 = polygon1[i];
            let p2 = polygon1[(i + 1) % polygon1.length]; // Wrap around

            for (let j = 0; j < polygon2.length; j++) {
                let q1 = polygon2[j];
                let q2 = polygon2[(j + 1) % polygon2.length]; // Wrap around

                if (GeometryUtils.doLinesIntersectByPoints(p1, p2, q1, q2)) {
                    return true;
                }
            }
        }

        return false;
    }

    static isContainedWithin(object, container) {
        if (this.DEBUG) {
            console.assert(
                object && container &&
                typeof object.x === 'number' && typeof object.y === 'number' &&
                typeof object.width === 'number' && typeof object.height === 'number' &&
                typeof container.x === 'number' && typeof container.y === 'number' &&
                typeof container.width === 'number' && typeof container.height === 'number',
                `isContainedWithin invalid input: object=${JSON.stringify(object)}, container=${JSON.stringify(container)}`
            );
        }

        if (object.width <= 0 || object.height <= 0 || container.width <= 0 || container.height <= 0) {
            return false; // Prevents invalid negative or zero-sized objects
        }

        return (
            object.x >= container.x &&
            object.y >= container.y &&
            object.x + object.width <= container.x + container.width &&
            object.y + object.height <= container.y + container.height
        );
    }

    static isCollidingWith(objectA, objectB) {
        if (this.DEBUG) {
            if (objectB === true) {
                console.log(objectB);
                SystemUtils.showStackTrace("isCollidingWith");
            }
            console.assert(
                objectA && objectB &&
                typeof objectA.x === 'number' && typeof objectA.y === 'number' &&
                typeof objectA.width === 'number' && typeof objectA.height === 'number' &&
                typeof objectB.x === 'number' && typeof objectB.y === 'number' &&
                typeof objectB.width === 'number' && typeof objectB.height === 'number',
                `Invalid object(s) passed to isCollidingWith: \n---objectA=${JSON.stringify(objectA)}, \n---objectB=${JSON.stringify(objectB)}  ${SystemUtils.getObjectType(objectB)}`
            );
        }

        // Check for valid dimensions
        if (
            objectA.width <= 0 || objectA.height <= 0 ||
            objectB.width <= 0 || objectB.height <= 0
        ) {
            return false;
        }

        // AABB Collision Detection
        return (
            objectA.x < objectB.x + objectB.width &&
            objectA.x + objectA.width > objectB.x &&
            objectA.y < objectB.y + objectB.height &&
            objectA.y + objectA.height > objectB.y
        );
    }
    static isCollidingWithSides(objectA, objectB) {
        if (this.DEBUG) {
            console.assert(
                objectA && objectB &&
                typeof objectA.x === 'number' && typeof objectA.y === 'number' &&
                typeof objectA.width === 'number' && typeof objectA.height === 'number' &&
                typeof objectB.x === 'number' && typeof objectB.y === 'number' &&
                typeof objectB.width === 'number' && typeof objectB.height === 'number',
                `isCollidingWithSides invalid input: \nobjectA=${JSON.stringify(objectA)}, \nobjectB=${JSON.stringify(objectB)}`
            );
        }

        let collisions = [];

        if (!this.isCollidingWith(objectA, objectB)) {
            return collisions; // Return empty array (no collision)
        }

        const ax1 = objectA.x, ax2 = objectA.x + objectA.width;
        const ay1 = objectA.y, ay2 = objectA.y + objectA.height;
        const bx1 = objectB.x, bx2 = objectB.x + objectB.width;
        const by1 = objectB.y, by2 = objectB.y + objectB.height;

        // Right collision (A’s right edge hits B’s left edge)
        if (ax2 >= bx1 && ax1 < bx1) {
            collisions.push('right');
        }
        // Left collision (A’s left edge hits B’s right edge)
        if (ax1 <= bx2 && ax2 > bx2) {
            collisions.push('left');
        }
        // Bottom collision (A’s bottom edge hits B’s top edge)
        if (ay2 >= by1 && ay1 < by1) {
            collisions.push('bottom');
        }
        // Top collision (A’s top edge hits B’s bottom edge)
        if (ay1 <= by2 && ay2 > by2) {
            collisions.push('top');
        }

        return collisions; // Returns array of collision sides
    }

    static checkGameBounds(object, offset = 0) {
        return (
            object.x + offset <= 0 ||
            object.y + offset <= 0 ||
            object.x + object.width - offset >= CanvasUtils.getCanvasWidth() ||
            object.y + object.height - offset >= CanvasUtils.getCanvasHeight()
        );
    }
    static checkGameBoundsSides(object, offset = 0) {
        if (this.DEBUG) {
            console.assert(
                object && typeof object.x === 'number' && typeof object.y === 'number' &&
                typeof object.width === 'number' && typeof object.height === 'number',
                `checkGameBoundsSides invalid object: ${JSON.stringify(object)}, ${SystemUtils.getObjectType(object)}`
            );
            console.assert(
                !object.radius,
                "Object has 'radius'. Use checkGameBoundsCircle instead."
            );
        }

        if (!this.checkGameBounds(object, offset = 0)) {
            return [];  // Return empty array instead of undefined
        }

        let boundariesHit = [];

        // **Avoid checking bounds twice!** If checkGameBounds returns true, the boundaries will be determined below.
        if (object.y + offset <= 0) {
            boundariesHit.push('top');
        }
        if (object.y + object.height - offset >= CanvasUtils.getCanvasHeight()) {
            boundariesHit.push('bottom');
        }
        if (object.x + offset <= 0) {
            boundariesHit.push('left');
        }
        if (object.x + object.width - offset >= CanvasUtils.getCanvasWidth()) {
            boundariesHit.push('right');
        }

        return boundariesHit;
    }

    static checkGameBoundsCircle(object) {
        if (this.DEBUG) {
            console.assert(
                object && typeof object.x === 'number' && typeof object.y === 'number' &&
                typeof object.radius === 'number',
                `checkGameBoundsCircle requires an object with a valid 'radius', 'x', and 'y'.`
            );
        }
        return object.x - object.radius <= 0 ||
            object.y - object.radius <= 0 ||
            object.x + object.radius >= CanvasUtils.getCanvasWidth() ||
            object.y + object.radius >= CanvasUtils.getCanvasHeight();
    }
    static checkGameBoundsCircleSides(object) {
        if (this.DEBUG) {
            console.assert(
                object && typeof object.x === 'number' && typeof object.y === 'number' &&
                typeof object.radius === 'number',
                `checkGameBoundsCircle requires an object with a valid 'radius', 'x', and 'y'.`
            );
        }

        if (!this.checkGameBoundsCircle(object)) {
            return [];  // Return empty array instead of undefined
        }

        let boundariesHit = [];

        // Check for collision with the top boundary
        if (object.y - object.radius <= 0) {
            boundariesHit.push('top');
        }
        // Check for collision with the bottom boundary
        if (object.y + object.radius >= CanvasUtils.getCanvasHeight()) {
            boundariesHit.push('bottom');
        }

        // Check for collision with the left boundary
        if (object.x - object.radius <= 0) {
            boundariesHit.push('left');
        }
        // Check for collision with the right boundary
        if (object.x + object.radius >= CanvasUtils.getCanvasWidth()) {
            boundariesHit.push('right');
        }

        return boundariesHit;
    }

}
