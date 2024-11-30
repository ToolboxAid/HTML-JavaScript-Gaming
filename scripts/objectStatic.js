// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// objectStatic.js

/** 
 * Represents a static object in a game that cannot move.
 */

import CanvasUtils from "../scripts/canvas.js";

class ObjectStatic {
    static gameAreaWidth = 0;
    static gameAreaHeight = 0;
    /**
     * Creates an instance of ObjectStatic.
     * @param {number} x - The X position of the object.
     * @param {number} y - The Y position of the object.
     * @param {number} width - The width of the object.
     * @param {number} height - The height of the object.
     */
    constructor(x = 0, y = 0, width = 0, height = 0) {
        if (ObjectStatic.gameAreaWidth <= 0 || ObjectStatic.gameAreaHeight <= 0) {
            throw new Error('gameAreaWidth and gameAreaHeight must be positive numbers.');
        }
        if (width <= 0 || height <= 0) {
            throw new Error('Width and height must be positive numbers.');
        }        
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
}

export default ObjectStatic;
