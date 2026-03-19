// ToolboxAid.com
// David Quesenberry
// Canonical game-level collision and bounds API
// 03/13/2026
//
// Runtime-neutral boundary note:
// - Role: public engine/game collision compatibility surface.
// - Status: retained transitional boundary for compatibility.
// - This first runtime-neutral patch is comment-only and preserves behavior.
// - Extraction candidate: keep collision calls stable here while broader engine/game boundaries are refined.

import BoundaryUtils from '../physics/boundaryUtils.js';
import CollisionUtils from '../physics/collisionUtils.js';

class GameCollision {
    constructor() {
        throw new Error('GameCollision is a utility class with only static methods. Do not instantiate.');
    }

    // Runtime-neutral compatibility marker:
    // - Public collision entry point retained for legacy call-path stability.
    // - Transitional boundary between engine/game callers and lower-level physics helpers.
    static intersects(objectA, objectB) {
        return CollisionUtils.isCollidingWith(objectA, objectB);
    }

    // Runtime-neutral compatibility marker:
    // - Retained public surface for side-aware collision checks.
    // - Extraction candidate if collision policy and call-site coordination separate later.
    static intersectsSides(objectA, objectB) {
        return CollisionUtils.isCollidingWithSides(objectA, objectB);
    }

    // Transitional compatibility marker:
    // - Public vector collision helper retained without changing lower-level ownership.
    static intersectsVector(objectA, objectB) {
        return CollisionUtils.vectorIntersectsVector(objectA, objectB);
    }

    // Transitional compatibility marker:
    // - Public sprite-boundary helper retained for compatibility while collision concerns stay centralized here.
    static intersectsSpriteBounds(objectA, objectB) {
        return CollisionUtils.spriteBoundsIntersect(objectA, objectB);
    }

    // Compatibility surface:
    // - Public point query retained at engine/game boundary.
    static pointInBox(x, y, object) {
        return CollisionUtils.pointInBox(x, y, object);
    }

    // Compatibility surface:
    // - Public polygon query retained at engine/game boundary.
    static pointInPolygon(x, y, polygon) {
        return CollisionUtils.pointInPolygon(x, y, polygon);
    }

    // Runtime-neutral boundary marker:
    // - Retained as public game-level bounds check while boundary implementation remains in physics helpers.
    static isOutOfBounds(object, margin = 0) {
        return BoundaryUtils.checkGameAtBounds(object, margin);
    }

    // Transitional boundary:
    // - Public bounds-side lookup retained for compatibility.
    static getOutOfBoundsSides(object, margin = 0) {
        return BoundaryUtils.checkGameAtBoundsSides(object, margin);
    }

    // Transitional boundary:
    // - Compatibility wrapper for circular bounds checks.
    static isOutOfBoundsCircle(object) {
        return BoundaryUtils.checkGameAtBoundsCircle(object);
    }

    // Transitional boundary:
    // - Compatibility wrapper for circular bounds-side lookup.
    static getOutOfBoundsCircleSides(object) {
        return BoundaryUtils.checkGameAtBoundsCircleSides(object);
    }

    // Runtime-neutral compatibility marker:
    // - Public off-screen helper retained even though implementation lives below engine/game.
    static isCompletelyOffScreen(object, margin = 0) {
        return BoundaryUtils.isCompletelyOffScreen(object, margin);
    }

    // Transitional compatibility marker:
    // - Retained public helper for off-screen side lookup.
    static getCompletelyOffScreenSides(object, margin = 0) {
        return BoundaryUtils.getCompletelyOffScreenSides(object, margin);
    }

    // Transitional boundary:
    // - Public wrap behavior remains here for legacy caller stability.
    static applyWrapAround(object, margin = 0) {
        return BoundaryUtils.applyWrapAround(object, margin);
    }
}

export default GameCollision;
