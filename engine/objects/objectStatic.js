// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// objectStatic.js

import GeometryUtils from "../math/geometryUtils.js";
import ObjectValidation from "../utils/objectValidation.js";
import ObjectCleanup from "../utils/objectCleanup.js";
import DebugLog from "../utils/debugLog.js";
import DebugFlag from '../utils/debugFlag.js';
import ObjectDestroyUtils from './objectDestroyUtils.js';
import PrimitiveRenderer from "../renderers/primitiveRenderer.js";

/** Represents a static object in a game that cannot move. */
class ObjectStatic {
    static DEBUG = DebugFlag.has('objectStatic');
    static #nextId = 1;

    static getNextId() {
        return this.#nextId++;
    }

    /** Creates an instance of ObjectStatic. */
    constructor(x = 0, y = 0, width = 1, height = 1) {
        ObjectValidation.finiteNumber(x, 'x');
        ObjectValidation.finiteNumber(y, 'y');
        ObjectValidation.positiveNumber(width, 'width');
        ObjectValidation.positiveNumber(height, 'height');

        this.ID = ObjectStatic.getNextId();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isDestroyed = false;
    }

    getCenterPoint() {
        return GeometryUtils.getRectangleCenterPoint(this);
    }

    getTopLeftPoint() {
        return GeometryUtils.getRectangleTopLeftPoint(this);
    }

    getTopRightPoint() {
        return GeometryUtils.getRectangleTopRightPoint(this);
    }

    getBottomLeftPoint() {
        return GeometryUtils.getRectangleBottomLeftPoint(this);
    }

    getBottomRightPoint() {
        return GeometryUtils.getRectangleBottomRightPoint(this);
    }

    /** Updates the position of the object. */
    setPosition(newX, newY) {
        ObjectValidation.finiteNumber(newX, 'newX');
        ObjectValidation.finiteNumber(newY, 'newY');

        this.x = newX;
        this.y = newY;
    }

    /** Shared helper for subclasses. */
    destroyProperties(propertyNames = []) {
        ObjectCleanup.nullifyProperties(this, propertyNames);
    }

    /** Draws the object on the canvas. */
    draw(fillColor = 'gray', borderColor = null, borderWidth = 0) {
        PrimitiveRenderer.draw(this, fillColor, borderColor, borderWidth);
    }

    /** Destroys the object and cleans up resources. */
    destroy() {
        DebugLog.log(ObjectStatic.DEBUG, null, `Destroying ObjectStatic #${this.ID}`, {
            position: { x: this.x, y: this.y },
            dimensions: { width: this.width, height: this.height },
            state: {
                isDestroyed: this.isDestroyed
            }
        });

        if (ObjectDestroyUtils.shouldSkipDestroy(this, ObjectStatic.DEBUG, 'ObjectStatic', this.ID === null)) {
            return false;
        }

        const finalState = {
            id: this.ID,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };

        this.isDestroyed = true;

        this.destroyProperties([
            'width',
            'height',
            'x',
            'y',
            'ID'
        ]);

        DebugLog.log(ObjectStatic.DEBUG, null, 'Successfully destroyed ObjectStatic', finalState);
        return true;
    }
}

export default ObjectStatic;

