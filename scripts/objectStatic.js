// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// objectStatic.js

/** 
 * Represents a static object in a game that cannot move.
 */

import CanvasUtils from "../scripts/canvas.js";

class ObjectStatic {
    static DEBUG = new URLSearchParams(window.location.search).has('objectStatic');

    // Static counter for unique IDs
    static #nextId = 0;
    static getNextId() {
        return this.#nextId++;
    }

    /**
     * Creates an instance of ObjectStatic.
     * @param {number} x - The X position of the object.
     * @param {number} y - The Y position of the object.
     * @param {number} width - The width of the object.
     * @param {number} height - The height of the object.
     * @throws {Error} If parameters are invalid
     */
    constructor(x = 0, y = 0, width = 0, height = 0) {
        // Validate types
        if (typeof x !== 'number' || typeof y !== 'number' ||
            typeof width !== 'number' || typeof height !== 'number') {
            throw new Error('All parameters must be numbers.');
        }

        // Validate dimensions
        if (width <= 0 || height <= 0) {
            throw new Error('Width and height must be positive numbers.');
        }

        // Validate position
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            throw new Error('Position coordinates must be finite numbers.');
        }

        this.ID = ObjectStatic.getNextId(); // Unique ID for each object

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
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
        this.x = newX;
        this.y = newY;
    }

    /**
     * Draws the object on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The drawing context.
     * @param {string} [fillColor='black'] - The fill color of the object.
     * @param {string|null} [borderColor=null] - The border color of the object.
     * @param {number} [borderWidth=0] - The width of the border.
     */
    draw(fillColor = 'gray', borderColor = null, borderWidth = 0) {
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
     * @returns {boolean} True if cleanup was successful
     */
    destroy() {
        if (ObjectStatic.DEBUG) {
            console.log(`Destroying ObjectStatic #${this.ID}`, {
                position: { x: this.x, y: this.y },
                dimensions: { width: this.width, height: this.height },
                state: {
                    isDestroyed: !this.ID,
                    hasPosition: this.x !== null && this.y !== null,
                    hasDimensions: this.width !== null && this.height !== null
                }
            });
        }

        // Check if already destroyed
        if (!this.ID) {
            if (ObjectStatic.DEBUG) {
                console.warn('ObjectStatic already destroyed');
            }
            return false;
        }

        // Store values for final logging
        const finalState = {
            id: this.ID,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };

        // Clean up properties in specific order
        this.width = null;  // Dimensions first
        this.height = null;
        this.x = null;      // Position second
        this.y = null;
        this.ID = null;     // ID last

        if (ObjectStatic.DEBUG) {
            console.log(`Successfully destroyed ObjectStatic`, finalState);
        }

        return true;
    }

}

export default ObjectStatic;
