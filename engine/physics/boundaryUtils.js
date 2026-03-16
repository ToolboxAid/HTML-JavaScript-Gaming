// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// boundaryUtils.js

import CanvasUtils from "../core/canvasUtils.js";
import CollisionShapeUtils from "./collisionShapeUtils.js";
import PhysicsUtils from "./physicsUtils.js";

class BoundaryUtils {
    constructor() {
        throw new Error('BoundaryUtils is a utility class with only static methods. Do not instantiate.');
    }

    static getHalfDimensions(object) {
        const box = CollisionShapeUtils.getBoundingBox(object);

        if (!box) {
            throw new Error('Invalid object: missing collision bounds');
        }

        return {
            width: box.width / 2,
            height: box.height / 2
        };
    }

    static getBounds(object) {
        const box = CollisionShapeUtils.getBoundingBox(object);

        if (!box) {
            throw new Error('Invalid object: missing collision bounds');
        }

        return box;
    }

    static isCompletelyOffScreen(object, margin = 0) {
        return this.getCompletelyOffScreenSides(object, margin).length > 0;
    }

    static getCompletelyOffScreenSides(object, margin = 0) {
        if (!object || typeof object.x !== 'number' || typeof object.y !== 'number') {
            throw new Error('Invalid object: missing or invalid position properties');
        }

        const box = this.getBounds(object);
        const boundariesCrossed = [];
        const velocityX = PhysicsUtils.getVelocityX(object);
        const velocityY = PhysicsUtils.getVelocityY(object);

        if (box.x + box.width + margin <= 0 && velocityX <= 0) {
            boundariesCrossed.push('left');
        }

        if (box.x - margin >= CanvasUtils.getConfigWidth() && velocityX >= 0) {
            boundariesCrossed.push('right');
        }

        if (box.y + box.height + margin <= 0 && velocityY <= 0) {
            boundariesCrossed.push('top');
        }

        if (box.y - margin >= CanvasUtils.getConfigHeight() && velocityY >= 0) {
            boundariesCrossed.push('bottom');
        }

        return boundariesCrossed;
    }

    static checkGameAtBounds(object, margin = 0) {
        const box = CollisionShapeUtils.getBoundingBox(object);

        if (!box) {
            return false;
        }

        return (
            box.x + margin <= 0 ||
            box.y + margin <= 0 ||
            box.x + box.width - margin >= CanvasUtils.getConfigWidth() ||
            box.y + box.height - margin >= CanvasUtils.getConfigHeight()
        );
    }

    static checkGameAtBoundsSides(object, margin = 0) {
        const box = CollisionShapeUtils.getBoundingBox(object);

        if (!box || !this.checkGameAtBounds(box, margin)) {
            return [];
        }

        const boundariesHit = [];

        if (box.x + margin <= 0) {
            boundariesHit.push('left');
        }
        if (box.y + margin <= 0) {
            boundariesHit.push('top');
        }
        if (box.x + box.width - margin >= CanvasUtils.getConfigWidth()) {
            boundariesHit.push('right');
        }
        if (box.y + box.height - margin >= CanvasUtils.getConfigHeight()) {
            boundariesHit.push('bottom');
        }

        return boundariesHit;
    }

    static checkGameAtBoundsCircle(object) {
        return object.x - object.radius <= 0 ||
            object.y - object.radius <= 0 ||
            object.x + object.radius >= CanvasUtils.getConfigWidth() ||
            object.y + object.radius >= CanvasUtils.getConfigHeight();
    }

    static checkGameAtBoundsCircleSides(object) {
        if (!this.checkGameAtBoundsCircle(object)) {
            return [];
        }

        const boundariesHit = [];

        if (object.y - object.radius <= 0) {
            boundariesHit.push('top');
        }
        if (object.y + object.radius >= CanvasUtils.getConfigHeight()) {
            boundariesHit.push('bottom');
        }
        if (object.x - object.radius <= 0) {
            boundariesHit.push('left');
        }
        if (object.x + object.radius >= CanvasUtils.getConfigWidth()) {
            boundariesHit.push('right');
        }

        return boundariesHit;
    }

    static applyWrapAround(object, margin = 0) {
        const boundaries = this.getCompletelyOffScreenSides(object, margin);

        if (!boundaries || boundaries.length === 0) {
            return false;
        }

        const box = this.getBounds(object);
        const anchorOffsetX = object.x - box.x;
        const anchorOffsetY = object.y - box.y;

        if (boundaries.includes('left')) {
            object.x = CanvasUtils.getConfigWidth() + margin + anchorOffsetX;
        }

        if (boundaries.includes('right')) {
            object.x = -box.width - margin + anchorOffsetX;
        }

        if (boundaries.includes('top')) {
            object.y = CanvasUtils.getConfigHeight() + margin + anchorOffsetY;
        }

        if (boundaries.includes('bottom')) {
            object.y = -box.height - margin + anchorOffsetY;
        }

        return true;
    }
}

export default BoundaryUtils;


