// ToolboxAid.com
// David Quesenberry
// 02/14/2025
// collisionUtils.js

import CanvasUtils from "../core/canvas.js";
import BoundaryUtils from "./boundaryUtils.js";
import CollisionShapeUtils from "./collisionShapeUtils.js";
import PolygonCollision from './polygonCollision.js';
import VectorShapeUtils from "./vectorShapeUtils.js";
import DebugFlag from "../utils/debugFlag.js";
import DebugLog from "../utils/debugLog.js";
import SystemUtils from "../utils/systemUtils.js";

export default class CollisionUtils {
    // Enable debug mode: game.html?collisionUtils
    static DEBUG = DebugFlag.has('collisionUtils');

    /** Constructor for CollisionUtils class.
    * @throws {Error} Always throws error as this is a utility class with only static methods.
    * @example
    * ❌ Don't do this:
    * const collisionUtils = new CollisionUtils(); // Throws Error
    * 
    * ✅ Do this:
    * CollisionUtils.transformPoints(...); // Use static methods directly
    */
    constructor() {
        throw new Error('CollisionUtils is a utility class with only static methods. Do not instantiate.');
    }

    static transformPoints(vectorMap, x, y, rotationAngle) {
        const transformedPoints = VectorShapeUtils.getRotatedPoints(vectorMap, x, y, rotationAngle);

        if (CollisionUtils.DEBUG) {
            const formattedPoints = transformedPoints.map(([pointX, pointY]) => [
                parseFloat(pointX.toFixed(3)),
                parseFloat(pointY.toFixed(3))
            ]);
            DebugLog.log(true, 'CollisionUtils', 'Transformed Points:', formattedPoints);
        }

        return transformedPoints;
    }

    static vectorCollisionDetection(objectA, objectB) {
        return this.vectorIntersectsVector(objectA, objectB);
    }

    static vectorIntersectsVector(objectA, objectB) {
        const shapeA = CollisionShapeUtils.getVectorShape(objectA);
        const shapeB = CollisionShapeUtils.getVectorShape(objectB);

        if (!shapeA || !shapeB) {
            DebugLog.warn(true, 'CollisionUtils', '\nobjectA:', objectA, '\nobjectB:', objectB);
            if (CollisionUtils.DEBUG) {
                DebugLog.error(true, 'CollisionUtils', 'Invalid objects passed to vectorIntersectsVector', SystemUtils.showStackTrace(), objectA, objectB);
            }
            return false;
        }

        let rotationAngleA = shapeA.rotationAngle;
        let rotationAngleB = shapeB.rotationAngle;

        // Skip bounding box check if either object is rotated
        if (rotationAngleA === 0 && rotationAngleB === 0) {
            if (!this.isCollidingWith(shapeA.bounds, shapeB.bounds)) {
                return false;
            }
        }

        // Check if any point of objectB is inside objectA
        for (let [pointX, pointY] of shapeB.rotatedPoints) {
            if (PolygonCollision.isPointInsidePolygon(pointX, pointY, shapeA.rotatedPoints, CollisionUtils.DEBUG)) {
                if (CollisionUtils.DEBUG) {
                    DebugLog.log(true, 'CollisionUtils', 'objectB.rotatedPoints point', pointX, pointY, shapeA.rotatedPoints);
                }
                return true;
            }
        }

        // Check if any point of objectA is inside objectB
        for (let [pointX, pointY] of shapeA.rotatedPoints) {
            if (PolygonCollision.isPointInsidePolygon(pointX, pointY, shapeB.rotatedPoints, CollisionUtils.DEBUG)) {
                if (CollisionUtils.DEBUG) {
                    DebugLog.log(true, 'CollisionUtils', 'objectAPoints point', pointX, pointY, shapeB.rotatedPoints);
                }
                return true;
            }
        }

        // Check if any edges intersect
        for (let i = 0; i < shapeA.rotatedPoints.length; i++) {
            let a1 = shapeA.rotatedPoints[i];
            let a2 = shapeA.rotatedPoints[(i + 1) % shapeA.rotatedPoints.length];

            for (let j = 0; j < shapeB.rotatedPoints.length; j++) {
                let b1 = shapeB.rotatedPoints[j];
                let b2 = shapeB.rotatedPoints[(j + 1) % shapeB.rotatedPoints.length];

                if (PolygonCollision.doEdgesIntersect(a1, a2, b1, b2)) {
                    if (CollisionUtils.DEBUG) {
                        DebugLog.log(true, 'CollisionUtils', ' edgesIntersect ');
                    }
                    return true;
                }
            }
        }

        return false;
    }

    static boxIntersectsBox(objectA, objectB) {
        const boxA = CollisionShapeUtils.getBoundingBox(objectA);
        const boxB = CollisionShapeUtils.getBoundingBox(objectB);
        return this.isCollidingWith(boxA, boxB);
    }

    static spriteBoundsIntersect(objectA, objectB) {
        const boundsA = CollisionShapeUtils.getSpriteBounds(objectA);
        const boundsB = CollisionShapeUtils.getSpriteBounds(objectB);
        return this.isCollidingWith(boundsA, boundsB);
    }

    static pointInPolygon(x, y, polygon) {
        return PolygonCollision.isPointInsidePolygon(x, y, polygon, CollisionUtils.DEBUG);
    }

    static pointInBox(x, y, object) {
        const box = CollisionShapeUtils.getBoundingBox(object);

        if (!box || typeof x !== 'number' || typeof y !== 'number') {
            return false;
        }

        return (
            x >= box.x &&
            x <= box.x + box.width &&
            y >= box.y &&
            y <= box.y + box.height
        );
    }
    static doEdgesIntersect(A, B, C, D) {
        return PolygonCollision.doEdgesIntersect(A, B, C, D);
    }

    static isPointInsidePolygon(x, y, polygon) {
        return PolygonCollision.isPointInsidePolygon(x, y, polygon, CollisionUtils.DEBUG);
    }

    static isContainedWithin(object, container) {
        const objectBounds = CollisionShapeUtils.getBoundingBox(object);
        const containerBounds = CollisionShapeUtils.getBoundingBox(container);

        if (CollisionUtils.DEBUG) {
            console.assert(
                objectBounds && containerBounds,
                `isContainedWithin invalid input: object=${JSON.stringify(object)}, container=${JSON.stringify(container)}`
            );
        }

        if (!objectBounds || !containerBounds) {
            return false;
        }

        if (objectBounds.width <= 0 || objectBounds.height <= 0 || containerBounds.width <= 0 || containerBounds.height <= 0) {
            return false; // Prevents invalid negative or zero-sized objects
        }

        return (
            objectBounds.x >= containerBounds.x &&
            objectBounds.y >= containerBounds.y &&
            objectBounds.x + objectBounds.width <= containerBounds.x + containerBounds.width &&
            objectBounds.y + objectBounds.height <= containerBounds.y + containerBounds.height
        );
    }

    static isCollidingWith(objectA, objectB) {
        const boxA = CollisionShapeUtils.getBoundingBox(objectA);
        const boxB = CollisionShapeUtils.getBoundingBox(objectB);

        if (CollisionUtils.DEBUG) {
            // Check for valid objects and dimensions
            if (!boxA || !boxB) { // Check if either object is null or undefined
                DebugLog.warn(true, 'CollisionUtils', 'isCollidingWith: One or both objects are null or undefined', objectA, objectB);
            }

            // Create simplified objects with only position and size properties
            const debugObjectA = {
                type: SystemUtils.getObjectType(objectA),
                x: boxA?.x,
                y: boxA?.y,
                width: boxA?.width,
                height: boxA?.height
            };

            const debugObjectB = {
                type: SystemUtils.getObjectType(objectB),
                x: boxB?.x,
                y: boxB?.y,
                width: boxB?.width,
                height: boxB?.height
            };

            console.assert(
                boxA && boxB,
                `Invalid object(s) passed to isCollidingWith: 
                \nObject A (${debugObjectA.type}): ${JSON.stringify(debugObjectA)}
                \nObject B (${debugObjectB.type}): ${JSON.stringify(debugObjectB)}`
            );
        }

        if (!boxA || !boxB) {
            return false;
        }

        // Check for valid dimensions
        if (
            boxA.width <= 0 || boxA.height <= 0 ||
            boxB.width <= 0 || boxB.height <= 0
        ) {
            return false;
        }

        // AABB Collision Detection
        return (
            boxA.x < boxB.x + boxB.width &&
            boxA.x + boxA.width > boxB.x &&
            boxA.y < boxB.y + boxB.height &&
            boxA.y + boxA.height > boxB.y
        );
    }

    static isCollidingWithSides(objectA, objectB) {
        const boxA = CollisionShapeUtils.getBoundingBox(objectA);
        const boxB = CollisionShapeUtils.getBoundingBox(objectB);

        if (CollisionUtils.DEBUG) {
            console.assert(
                boxA && boxB,
                `isCollidingWithSides invalid input: \nobjectA=${JSON.stringify(objectA)}, \nobjectB=${JSON.stringify(objectB)}`
            );
        }

        let collisions = [];

        if (!boxA || !boxB || !this.isCollidingWith(boxA, boxB)) {
            return collisions; // Return empty array (no collision)
        }

        const ax1 = boxA.x, ax2 = boxA.x + boxA.width;
        const ay1 = boxA.y, ay2 = boxA.y + boxA.height;
        const bx1 = boxB.x, bx2 = boxB.x + boxB.width;
        const by1 = boxB.y, by2 = boxB.y + boxB.height;

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
     * @returns {boolean} True if object is completely outside game boundaries
     */
    static isCompletelyOffScreen(object, margin = 0) {
        return BoundaryUtils.isCompletelyOffScreen(object, margin);
    }

    /** Checks which sides of the game boundaries an object has crossed based on its velocity
     * @returns {Array<string>} Array of sides ('left', 'right', 'top', 'bottom') that the object has crossed
     * @throws {Error} If object properties are invalid
     */
    static getCompletelyOffScreenSides(object, margin = 0) {
        const boundariesCrossed = BoundaryUtils.getCompletelyOffScreenSides(object, margin);

        if (CollisionUtils.DEBUG && boundariesCrossed.includes('right')) {
            const halfDimensions = BoundaryUtils.getHalfDimensions(object);
            DebugLog.log(true, 'CollisionUtils', 'Boundaries crossed:', {
                boundaries: boundariesCrossed,
                object: {
                    x: object.x,
                    y: object.y,
                    w2: halfDimensions.width,
                    h2: halfDimensions.height,
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
        return BoundaryUtils.checkGameAtBounds(object, margin);
    }
    static checkGameAtBoundsSides(object, margin = 0) {
        if (CollisionUtils.DEBUG) {
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

        const boundariesHit = BoundaryUtils.checkGameAtBoundsSides(object, margin);

        if (CollisionUtils.DEBUG) {
            DebugLog.log(true, 'CollisionUtils', 'checkGameAtBoundsSides', CanvasUtils.getConfigWidth(), CanvasUtils.getConfigHeight(), boundariesHit);
        }

        return boundariesHit;
    }

    static checkGameAtBoundsCircle(object) {
        if (CollisionUtils.DEBUG) {
            console.assert(
                object && typeof object.x === 'number' && typeof object.y === 'number' &&
                typeof object.radius === 'number',
                `checkGameAtBoundsCircle requires an object with a valid 'radius', 'x', and 'y'.`
            );
        }
        return BoundaryUtils.checkGameAtBoundsCircle(object);
    }
    static checkGameAtBoundsCircleSides(object) {
        if (CollisionUtils.DEBUG) {
            console.assert(
                object && typeof object.x === 'number' && typeof object.y === 'number' &&
                typeof object.radius === 'number',
                `checkGameAtBoundsCircle requires an object with a valid 'radius', 'x', and 'y'.`
            );
        }

        return BoundaryUtils.checkGameAtBoundsCircleSides(object);
    }

}

