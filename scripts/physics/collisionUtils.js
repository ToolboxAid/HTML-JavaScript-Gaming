// ToolboxAid.com
// David Quesenberry
// 02/14/2025
// collisionUtils.js

import CanvasUtils from "../../scripts/canvas.js";
import SystemUtils from "../utils/systemUtils.js";

export default class CollisionUtils {
    // Play your game normally: game.html
    // Enable debug mode: game.html?collisionUtils
    static DEBUG = new URLSearchParams(window.location.search).has('collisionUtils');

    constructor() {
        throw new Error("'CollisionUtils' has only static methods.");
    }

    static transformPoints(vectorMap, x, y, rotationAngle) {
        const angleInRadians = (rotationAngle * Math.PI) / 180;
        const cos = Math.cos(angleInRadians);
        const sin = Math.sin(angleInRadians);

        // Find the center of the object (average of all points)
        const centerX = vectorMap.reduce((sum, [px]) => sum + px, 0) / vectorMap.length;
        const centerY = vectorMap.reduce((sum, [, py]) => sum + py, 0) / vectorMap.length;

        const transformedPoints = vectorMap.map(([px, py]) => {
            // Translate points to origin (relative to the center)
            const translatedX = px - centerX;
            const translatedY = py - centerY;

            // Apply rotation
            const rotatedX = translatedX * cos - translatedY * sin;
            const rotatedY = translatedX * sin + translatedY * cos;

            // Translate back to the object's correct world position
            const finalX = centerX + rotatedX + (x - centerX);
            const finalY = centerY + rotatedY + (y - centerY);

            return [finalX, finalY];
        });

        if (false && this.DEBUG) { // this gets spammed, "false" is on purpose
            const formattedPoints = transformedPoints.map(([x, y]) => [
                parseFloat(x.toFixed(3)),
                parseFloat(y.toFixed(3))
            ]);
            console.log("Transformed Points:", formattedPoints);
        }

        return transformedPoints;
    }

    static vectorCollisionDetection(objectA, objectB) {
        if (!objectA || !objectB || !objectA.vectorMap || !objectB.vectorMap || !objectA.rotatedPoints || !objectB.rotatedPoints) {
            console.warn("objectA:", objectA, "\nobjectB:", objectB);
            if (this.DEBUG) {
                console.error("Invalid objects passed to vectorCollisionDetection", objectA, objectB);
            }
            return false;
        }

        let rotationAngleA = objectA.rotationAngle ?? 0;
        let rotationAngleB = objectB.rotationAngle ?? 0;

        // Skip bounding box check if either object is rotated
        if (rotationAngleA === 0 && rotationAngleB === 0) {
            if (!this.isCollidingWith(objectA, objectB)) {
                return false;
            }
        }

        // Check if any point of objectB is inside objectA
        for (let [pointX, pointY] of objectB.rotatedPoints) {
            if (CollisionUtils.isPointInsidePolygon(pointX, pointY, objectA.rotatedPoints)) {
                if (this.DEBUG) {
                    console.log("objectB.rotatedPoints point", pointX, pointY, objectA.rotatedPoints);
                }
                return true;
            }
        }

        // Check if any point of objectA is inside objectB
        for (let [pointX, pointY] of objectA.rotatedPoints) {
            if (CollisionUtils.isPointInsidePolygon(pointX, pointY, objectB.rotatedPoints)) {
                if (this.DEBUG) {
                    console.log("objectAPoints point", pointX, pointY, objectB.rotatedPoints);
                }
                return true;
            }
        }

        // Check if any edges intersect
        for (let i = 0; i < objectA.rotatedPoints.length; i++) {
            let a1 = objectA.rotatedPoints[i];
            let a2 = objectA.rotatedPoints[(i + 1) % objectA.rotatedPoints.length];

            for (let j = 0; j < objectB.rotatedPoints.length; j++) {
                let b1 = objectB.rotatedPoints[j];
                let b2 = objectB.rotatedPoints[(j + 1) % objectB.rotatedPoints.length];

                if (CollisionUtils.doEdgesIntersect(a1, a2, b1, b2)) {
                    if (this.DEBUG) {
                        console.log(" edgesIntersect ");
                    }
                    return true;
                }
            }
        }

        return false;
    }
    static doEdgesIntersect(A, B, C, D) {
        const det = (B[0] - A[0]) * (D[1] - C[1]) - (B[1] - A[1]) * (D[0] - C[0]);
        if (Math.abs(det) < 1e-6) return false; // Parallel lines

        const t = ((C[0] - A[0]) * (D[1] - C[1]) - (C[1] - A[1]) * (D[0] - C[0])) / det;
        const u = ((C[0] - A[0]) * (B[1] - A[1]) - (C[1] - A[1]) * (B[0] - A[0])) / det;

        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }

    static isPointInsidePolygon(x, y, polygon) {
        if (!Array.isArray(polygon) || polygon.length < 3) return false;
        if (typeof x !== 'number' || typeof y !== 'number') return false;

        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const [xi, yi] = polygon[i];
            const [xj, yj] = polygon[j];

            // Check if the point is on a vertex
            if (x === xi && y === yi) {
                if (this.DEBUG) {
                    console.log("Point is on a vertex:", x, y, polygon);
                }
                return true;
            }

            // Check if the point is on an edge (improved precision)
            const edgeSlope = (xj - xi) * (y - yi) - (yj - yi) * (x - xi);

            // Calculate the length of the edge
            const edgeLength = Math.sqrt((xj - xi) ** 2 + (yj - yi) ** 2);

            // Use a scaled tolerance based on the edge length
            const tolerance = 1e-6 * edgeLength;

            // Check if the point lies within the bounding box of the edge
            const withinBoundingBox = (
                x >= Math.min(xi, xj) &&
                x <= Math.max(xi, xj) &&
                y >= Math.min(yi, yj) &&
                y <= Math.max(yi, yj)
            );

            if (Math.abs(edgeSlope) < tolerance && withinBoundingBox) {
                if (this.DEBUG) {
                    console.log("Point is on an edge:", x, y, polygon);
                }
                return true;
            }

            // Ray-casting method
            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }

        if (inside && this.DEBUG) {
            console.log("Ray intersects edge:", x, y, polygon);
        }

        return inside;
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

    /** Checks if an object is completely outside the game boundaries
 * @param {Object} object - The object to check
 * @param {number} [margin=0] - Additional margin around the boundaries
 * @returns {boolean} True if object is completely outside game boundaries
 */
static isCompletelyOffScreen(object, margin = 0) {
    // Calculate half dimensions
    const halfWidth = (object.boundWidth ?? object.width) / 2;
    const halfHeight = (object.boundHeight ?? object.height) / 2;

    return (
        object.velocityX < 0 && object.x + halfWidth + margin <= 0 ||              // Off left edge
        object.velocityX >= 0 && object.x - halfWidth - margin >= CanvasUtils.getConfigWidth() ||  // Off right edge
        object.velocityY < 0 && object.y + halfHeight + margin <= 0 ||             // Off top edge
        object.velocityY >= 0 && object.y - halfHeight - margin >= CanvasUtils.getConfigHeight()   // Off bottom edge
    );
}
    /** Checks which sides of the game boundaries an object has crossed based on its velocity
     * @param {Object} object - The object to check
     * @param {number} [margin=0] - Additional margin around the boundaries (positive shrinks play area)
     * @returns {Array<string>} Array of sides ('left', 'right', 'top', 'bottom') that the object has crossed
     * @throws {Error} If object properties are invalid
     */
    static getCompletelyOffScreenBoundaries(object, margin = 0) {
        // Validate object properties
        if (!object || typeof object.x !== 'number' || typeof object.y !== 'number') {
            throw new Error('Invalid object: missing or invalid position properties');
        }
    
        // Early return if object is not off screen
        if (!this.isCompletelyOffScreen(object, margin)) {
            return [];
        }
    
        // Calculate half dimensions
        const halfWidth = (object.boundWidth ?? object.width) / 2;
        const halfHeight = (object.boundHeight ?? object.height) / 2;
    
        // Document the sides
        const boundariesCrossed = [];
    
        // Check left boundary crossing (moving left)
        if (object.velocityX < 0 && object.x + halfWidth + margin <= 0) {
            boundariesCrossed.push('left');
        }
        // Check right boundary crossing (moving right)
        if (object.velocityX >= 0 && object.x - halfWidth - margin >= CanvasUtils.getConfigWidth()) {
            boundariesCrossed.push('right');
        }
        // Check top boundary crossing (moving up)
        if (object.velocityY < 0 && object.y + halfHeight + margin <= 0) {
            boundariesCrossed.push('top');
        }
        // Check bottom boundary crossing (moving down)
        if (object.velocityY >= 0 && object.y - halfHeight - margin >= CanvasUtils.getConfigHeight()) {
            boundariesCrossed.push('bottom');
        }
    
        if (this.DEBUG && boundariesCrossed.includes('right')) {
            console.log("Boundaries crossed:", {
                boundaries: boundariesCrossed,
                object: {
                    x: object.x,
                    y: object.y,
                    w2: halfWidth,
                    h2: halfHeight,
                    m: margin
                },
                canvas: {
                    width: CanvasUtils.getConfigWidth(),
                    height: CanvasUtils.getConfigHeight()
                }
            });
        }
    
        return boundariesCrossed;
    }
    static checkGameAtBounds(object, margin = 0) {
        return (
            object.x + margin <= 0 ||
            object.y + margin <= 0 ||
            object.x + object.width - margin >= CanvasUtils.getConfigWidth() ||
            object.y + object.height - margin >= CanvasUtils.getConfigHeight()
        );
    }
    static checkGameAtBoundsSides(object, margin = 0) {
        if (this.DEBUG) {
            console.assert(
                object && typeof object.x === 'number' && typeof object.y === 'number' &&
                typeof object.width === 'number' && typeof object.height === 'number',
                `Object '${SystemUtils.getObjectType(object)} ' is invalid: ${JSON.stringify(object)}`
            );
            console.assert(
                !object.radius,
                `Object '${SystemUtils.getObjectType(object)}' has 'radius'. Use checkGameAtBoundsCircle instead: ${JSON.stringify(object)} `
            );
        }

        // **Avoid checking bounds twice!** If checkGameAtBounds returns empty array, the boundaries will be determined below.
        if (!this.checkGameAtBounds(object, margin)) {
            return [];  // Return empty array instead of undefined
        }

        // We have a hit, determine where.
        let boundariesHit = [];
        if (object.x + margin <= 0) {
            boundariesHit.push('left');
        }
        if (object.y + margin <= 0) {
            boundariesHit.push('top');
        }
        if (object.x + object.width - margin >= CanvasUtils.getConfigWidth()) {
            boundariesHit.push('right');
        }
        if (object.y + object.height - margin >= CanvasUtils.getConfigHeight()) {
            boundariesHit.push('bottom');
        }

        if (this.DEBUG) {
            console.log("checkGameAtBoundsSides", CanvasUtils.getConfigWidth(), CanvasUtils.getConfigHeight(), boundariesHit);
        }

        return boundariesHit;
    }

    static checkGameAtBoundsCircle(object) {
        if (this.DEBUG) {
            console.assert(
                object && typeof object.x === 'number' && typeof object.y === 'number' &&
                typeof object.radius === 'number',
                `checkGameAtBoundsCircle requires an object with a valid 'radius', 'x', and 'y'.`
            );
        }
        return object.x - object.radius <= 0 ||
            object.y - object.radius <= 0 ||
            object.x + object.radius >= CanvasUtils.getConfigWidth() ||
            object.y + object.radius >= CanvasUtils.getConfigHeight();
    }
    static checkGameAtBoundsCircleSides(object) {
        if (this.DEBUG) {
            console.assert(
                object && typeof object.x === 'number' && typeof object.y === 'number' &&
                typeof object.radius === 'number',
                `checkGameAtBoundsCircle requires an object with a valid 'radius', 'x', and 'y'.`
            );
        }

        if (!this.checkGameAtBoundsCircle(object)) {
            return [];  // Return empty array instead of undefined
        }

        let boundariesHit = [];

        // Check for collision with the top boundary
        if (object.y - object.radius <= 0) {
            boundariesHit.push('top');
        }
        // Check for collision with the bottom boundary
        if (object.y + object.radius >= CanvasUtils.getConfigHeight()) {
            boundariesHit.push('bottom');
        }

        // Check for collision with the left boundary
        if (object.x - object.radius <= 0) {
            boundariesHit.push('left');
        }
        // Check for collision with the right boundary
        if (object.x + object.radius >= CanvasUtils.getConfigWidth()) {
            boundariesHit.push('right');
        }

        return boundariesHit;
    }

}
