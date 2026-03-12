// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// boundaryUtils.js

import CanvasUtils from "../../engine/canvas.js";
import CollisionShapeUtils from "./collisionShapeUtils.js";

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

    static isCompletelyOffScreen(object, margin = 0) {
        const halfDimensions = this.getHalfDimensions(object);

        return (
            object.velocityX < 0 && object.x + halfDimensions.width + margin <= 0 ||
            object.velocityX >= 0 && object.x - halfDimensions.width - margin >= CanvasUtils.getConfigWidth() ||
            object.velocityY < 0 && object.y + halfDimensions.height + margin <= 0 ||
            object.velocityY >= 0 && object.y - halfDimensions.height - margin >= CanvasUtils.getConfigHeight()
        );
    }

    static getCompletelyOffScreenSides(object, margin = 0) {
        if (!object || typeof object.x !== 'number' || typeof object.y !== 'number') {
            throw new Error('Invalid object: missing or invalid position properties');
        }

        if (!this.isCompletelyOffScreen(object, margin)) {
            return [];
        }

        const halfDimensions = this.getHalfDimensions(object);
        const boundariesCrossed = [];

        if (object.velocityX < 0 && object.x + halfDimensions.width + margin <= 0) {
            boundariesCrossed.push('left');
        }

        if (object.velocityX >= 0 && object.x - halfDimensions.width - margin >= CanvasUtils.getConfigWidth()) {
            boundariesCrossed.push('right');
        }

        if (object.velocityY < 0 && object.y + halfDimensions.height + margin <= 0) {
            boundariesCrossed.push('top');
        }

        if (object.velocityY >= 0 && object.y - halfDimensions.height - margin >= CanvasUtils.getConfigHeight()) {
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

        const halfDimensions = this.getHalfDimensions(object);

        if (boundaries.includes('left')) {
            object.x = CanvasUtils.getConfigWidth() + halfDimensions.width;
        }

        if (boundaries.includes('right')) {
            object.x = -halfDimensions.width;
        }

        if (boundaries.includes('top')) {
            object.y = CanvasUtils.getConfigHeight() + halfDimensions.height;
        }

        if (boundaries.includes('bottom')) {
            object.y = -halfDimensions.height;
        }

        return true;
    }
}

export default BoundaryUtils;
