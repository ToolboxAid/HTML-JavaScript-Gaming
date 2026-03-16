// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// collisionShapeUtils.js

import NumberUtils from '../math/numberUtils.js';

class CollisionShapeUtils {
    constructor() {
        throw new Error('CollisionShapeUtils is a utility class with only static methods. Do not instantiate.');
    }

    static hasFiniteNumber(value) {
        return NumberUtils.isFiniteNumber(value);
    }

    static getBoundingBox(object) {
        if (!object) {
            return null;
        }

        if (
            this.hasFiniteNumber(object.boundX) &&
            this.hasFiniteNumber(object.boundY) &&
            this.hasFiniteNumber(object.boundWidth) &&
            this.hasFiniteNumber(object.boundHeight)
        ) {
            return {
                x: object.boundX,
                y: object.boundY,
                width: object.boundWidth,
                height: object.boundHeight
            };
        }

        if (
            this.hasFiniteNumber(object.x) &&
            this.hasFiniteNumber(object.y) &&
            this.hasFiniteNumber(object.boundWidth) &&
            this.hasFiniteNumber(object.boundHeight)
        ) {
            return {
                x: object.x,
                y: object.y,
                width: object.boundWidth,
                height: object.boundHeight
            };
        }

        if (
            this.hasFiniteNumber(object.x) &&
            this.hasFiniteNumber(object.y) &&
            this.hasFiniteNumber(object.width) &&
            this.hasFiniteNumber(object.height)
        ) {
            return {
                x: object.x,
                y: object.y,
                width: object.width,
                height: object.height
            };
        }

        return null;
    }

    static getVectorShape(object) {
        if (!object || !Array.isArray(object.vectorMap) || !Array.isArray(object.rotatedPoints)) {
            return null;
        }

        return {
            vectorMap: object.vectorMap,
            rotatedPoints: object.rotatedPoints,
            rotationAngle: object.rotationAngle ?? 0,
            bounds: this.getBoundingBox(object)
        };
    }

    static getSpriteBounds(object) {
        return this.getBoundingBox(object);
    }
}

export default CollisionShapeUtils;
