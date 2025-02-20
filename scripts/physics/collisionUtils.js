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

    static boundingBoxCollision(objectA, objectB) {
        if (this.DEBUG) {
            console.log("radius", objectA.radius, objectB.radius);
        }
        const aLeft = objectA.x - objectA.radius;
        const aRight = objectA.x + objectA.radius;
        const aTop = objectA.y - objectA.radius;
        const aBottom = objectA.y + objectA.radius;

        const bLeft = objectB.x - objectB.radius;
        const bRight = objectB.x + objectB.radius;
        const bTop = objectB.y - objectB.radius;
        const bBottom = objectB.y + objectB.radius;

        return !(aRight < bLeft || aLeft > bRight || aBottom < bTop || aTop > bBottom);
    }

    static vectorCollisionDetection(objectA, objectB) {
        if (!objectA || !objectB || !objectA.vectorMap || !objectB.vectorMap) {
            console.warn(objectA, objectB);
            if (this.DEBUG) {
                console.error("Invalid objects passed to vectorCollisionDetection", objectA, objectB);
            }
            return false;
        }

        let rotationAngleA = objectA.rotationAngle ?? 0;
        let rotationAngleB = objectB.rotationAngle ?? 0;

        // Skip bounding box check if either object is rotated
        if (rotationAngleA === 0 && rotationAngleB === 0) {
            if (!this.boundingBoxCollision(objectA, objectB)) {
                return false;
            }
        }

        // Transform points for both objects
        const objectAPoints = this.transformPoints(objectA.vectorMap, objectA.x, objectA.y, rotationAngleA);
        const objectBPoints = this.transformPoints(objectB.vectorMap, objectB.x, objectB.y, rotationAngleB);

        // Check if any point of objectB is inside objectA
        for (let [pointX, pointY] of objectBPoints) {
            if (CollisionUtils.isPointInsidePolygon(pointX, pointY, objectAPoints)) {
                if (this.DEBUG) {
                    console.log("objectBPoints point");
                }
                return true;
            }
        }

        // Check if any point of objectA is inside objectB
        for (let [pointX, pointY] of objectAPoints) {
            if (CollisionUtils.isPointInsidePolygon(pointX, pointY, objectBPoints)) {
                if (this.DEBUG) {
                    console.log("objectAPoints point");
                }
                return true;
            }
        }

        // Check if any edges intersect
        for (let i = 0; i < objectAPoints.length; i++) {
            let a1 = objectAPoints[i];
            let a2 = objectAPoints[(i + 1) % objectAPoints.length];

            for (let j = 0; j < objectBPoints.length; j++) {
                let b1 = objectBPoints[j];
                let b2 = objectBPoints[(j + 1) % objectBPoints.length];

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

    static checkGameOutBounds(object, offset = 0) {
        return (
            object.x - object.width + offset <= 0 ||
            object.y - object.height + offset <= 0 ||
            object.x + object.width - offset >= CanvasUtils.getConfigWidth() ||
            object.y + object.height - offset >= CanvasUtils.getConfigHeight()
        );
    }    
    static checkGameOutBoundsSides(object, offset = 0) {
        if (this.DEBUG) {
            console.assert(
                object && typeof object.x === 'number' && typeof object.y === 'number' &&
                typeof object.width === 'number' && typeof object.height === 'number',
                `checkGameOutBoundsSides invalid object: ${JSON.stringify(object)}, ${SystemUtils.getObjectType(object)}`
            );
            // console.assert(
            //     !object.radius,
            //     `Object has 'radius'. Use checkGameOutBoundsCircle instead. ${JSON.stringify(object)}`
            // );
        }
    
        // If the object is not out of bounds, return an empty array.
        if (!this.checkGameOutBounds(object, offset)) {
            return [];
        }
    
        // Determine which boundaries the object is out of.
        let boundariesOut = [];

        const width = object.boundWidth/2 ?? this.radius/2 ?? this.width/2;
        const height = object.boundHeight/2 ?? this.radius/2 ?? this.height/2;

        if (object.velocityX < 0 && object.x + width + offset <= 0) {
            boundariesOut.push('left');
        }
        if (object.velocityX >= 0 && object.x - width - offset >= CanvasUtils.getConfigWidth()) {
            boundariesOut.push('right');
        }

        if (object.velocityY < 0 &&  object.y + height + offset <= 0) {
            boundariesOut.push('top');
        }
        if (object.velocityY >= 0 && object.y - height - offset >= CanvasUtils.getConfigHeight()) {
            boundariesOut.push('bottom');
        }

    
        if (this.DEBUG) {
            console.log("checkGameOutBoundsSides", CanvasUtils.getConfigWidth(), CanvasUtils.getConfigHeight(), boundariesOut);
        }
    
        return boundariesOut;
    }
    

    static checkGameAtBounds(object, offset = 0) {
        return (
            object.x + offset <= 0 ||
            object.y + offset <= 0 ||
            object.x + object.width - offset >= CanvasUtils.getConfigWidth() ||
            object.y + object.height - offset >= CanvasUtils.getConfigHeight()
        );
    }
    static checkGameAtBoundsSides(object, offset = 0) {
        if (this.DEBUG) {
            console.assert(
                object && typeof object.x === 'number' && typeof object.y === 'number' &&
                typeof object.width === 'number' && typeof object.height === 'number',
                `checkGameAtBoundsSides invalid object: ${JSON.stringify(object)}, ${SystemUtils.getObjectType(object)}`
            );
            console.assert(
                !object.radius,
                "Object has 'radius'. Use checkGameAtBoundsCircle instead."
            );
        }

        // **Avoid checking bounds twice!** If checkGameAtBounds returns empty array, the boundaries will be determined below.
        if (!this.checkGameAtBounds(object, offset)) {
            return [];  // Return empty array instead of undefined
        }

        // We have a hit, determine where.
        let boundariesHit = [];

        if (object.y + offset <= 0) {
            boundariesHit.push('top');
        }
        if (object.y + object.height - offset >= CanvasUtils.getConfigHeight()) {
            boundariesHit.push('bottom');
        }
        if (object.x + offset <= 0) {
            boundariesHit.push('left');
        }
        if (object.x + object.width - offset >= CanvasUtils.getConfigWidth()) {
            boundariesHit.push('right');
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
