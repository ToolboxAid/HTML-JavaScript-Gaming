// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// objectStatic.js

import CanvasUtils from "../canvas.js";
import ObjectValidation from "../utils/objectValidation.js";
import ObjectCleanup from "../utils/objectCleanup.js";
import ObjectDebug from "../utils/objectDebug.js";

/**
 * Represents a static object in a game that cannot move.
 */
class ObjectStatic {
    static DEBUG = new URLSearchParams(window.location.search).has('objectStatic');
    static #nextId = 1;

    static getNextId() {
        return this.#nextId++;
    }

    /**
     * Creates an instance of ObjectStatic.
     * @param {number} x - The X position of the object.
     * @param {number} y - The Y position of the object.
     * @param {number} width - The width of the object.
     * @param {number} height - The height of the object.
     */
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
        return { x: this.x + (this.width / 2), y: this.y + (this.height / 2) };
    }

    getTopLeftPoint() {
        return { x: this.x, y: this.y };
    }

    getTopRightPoint() {
        return { x: this.x + this.width, y: this.y };
    }

    getBottomLeftPoint() {
        return { x: this.x, y: this.y + this.height };
    }

    getBottomRightPoint() {
        return { x: this.x + this.width, y: this.y + this.height };
    }

    /**
     * Updates the position of the object.
     * @param {number} newX - The new X position.
     * @param {number} newY - The new Y position.
     */
    setPosition(newX, newY) {
        ObjectValidation.finiteNumber(newX, 'newX');
        ObjectValidation.finiteNumber(newY, 'newY');

        this.x = newX;
        this.y = newY;
    }

    /**
     * Shared helper for subclasses.
     * @param {string[]} propertyNames
     */
    destroyProperties(propertyNames = []) {
        ObjectCleanup.nullifyProperties(this, propertyNames);
    }

    /**
     * Draws the object on the canvas.
     * @param {string} [fillColor='gray'] - The fill color of the object.
     * @param {string|null} [borderColor=null] - The border color of the object.
     * @param {number} [borderWidth=0] - The width of the border.
     */
    draw(fillColor = 'gray', borderColor = null, borderWidth = 0) {
        if (this.isDestroyed) {
            return;
        }

        CanvasUtils.ctx.fillStyle = fillColor;
        CanvasUtils.ctx.fillRect(this.x, this.y, this.width, this.height);

        if (borderColor && borderWidth > 0) {
            CanvasUtils.ctx.strokeStyle = borderColor;
            CanvasUtils.ctx.lineWidth = borderWidth;
            CanvasUtils.ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }

    /**
     * Destroys the object and cleans up resources.
     * @returns {boolean} True if cleanup was successful.
     */
    destroy() {
        ObjectDebug.log(ObjectStatic.DEBUG, `Destroying ObjectStatic #${this.ID}`, {
            position: { x: this.x, y: this.y },
            dimensions: { width: this.width, height: this.height },
            state: {
                isDestroyed: this.isDestroyed
            }
        });

        if (this.isDestroyed || this.ID === null) {
            ObjectDebug.warn(ObjectStatic.DEBUG, 'ObjectStatic already destroyed');
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

        ObjectDebug.log(ObjectStatic.DEBUG, 'Successfully destroyed ObjectStatic', finalState);
        return true;
    }
}

export default ObjectStatic;
