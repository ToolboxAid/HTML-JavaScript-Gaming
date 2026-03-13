// ToolboxAid.com
// David Quesenberry
// Canonical game-level collision and bounds API
// 03/13/2026

import BoundaryUtils from '../physics/boundaryUtils.js';
import CollisionUtils from '../physics/collisionUtils.js';

class GameCollision {
    constructor() {
        throw new Error('GameCollision is a utility class with only static methods. Do not instantiate.');
    }

    static intersects(objectA, objectB) {
        return CollisionUtils.isCollidingWith(objectA, objectB);
    }

    static intersectsSides(objectA, objectB) {
        return CollisionUtils.isCollidingWithSides(objectA, objectB);
    }

    static intersectsVector(objectA, objectB) {
        return CollisionUtils.vectorIntersectsVector(objectA, objectB);
    }

    static intersectsSpriteBounds(objectA, objectB) {
        return CollisionUtils.spriteBoundsIntersect(objectA, objectB);
    }

    static pointInBox(x, y, object) {
        return CollisionUtils.pointInBox(x, y, object);
    }

    static pointInPolygon(x, y, polygon) {
        return CollisionUtils.pointInPolygon(x, y, polygon);
    }

    static isOutOfBounds(object, margin = 0) {
        return BoundaryUtils.checkGameAtBounds(object, margin);
    }

    static getOutOfBoundsSides(object, margin = 0) {
        return BoundaryUtils.checkGameAtBoundsSides(object, margin);
    }

    static isOutOfBoundsCircle(object) {
        return BoundaryUtils.checkGameAtBoundsCircle(object);
    }

    static getOutOfBoundsCircleSides(object) {
        return BoundaryUtils.checkGameAtBoundsCircleSides(object);
    }

    static isCompletelyOffScreen(object, margin = 0) {
        return BoundaryUtils.isCompletelyOffScreen(object, margin);
    }

    static getCompletelyOffScreenSides(object, margin = 0) {
        return BoundaryUtils.getCompletelyOffScreenSides(object, margin);
    }

    static applyWrapAround(object, margin = 0) {
        return BoundaryUtils.applyWrapAround(object, margin);
    }
}

export default GameCollision;
