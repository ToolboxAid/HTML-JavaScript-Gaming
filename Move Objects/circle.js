// ToolboxAid.com
// David Quesenberry
// circle.js
// 10/16/2024

import ObjectDynamic from '../scripts/objectDynamic.js'; // Import ObjectDynamic
import CanvasUtils from '../scripts/canvas.js';

/**
 * Represents a dynamic circle object in a game.
 */
class Circle extends ObjectDynamic {
    /** Creates an instance of Circle.
     * @param {number} x - The X position of the circle's center.
     * @param {number} y - The Y position of the circle's center.
     * @param {number} radius - The radius of the circle.
     * @param {number} [velocityX=0] - The initial velocity in the X direction.
     * @param {number} [velocityY=0] - The initial velocity in the Y direction.
     */
    constructor(x, y, radius, velocityX = 0, velocityY = 0) {
        // Call ObjectDynamic constructor, passing the radius as both width and height
        super(x, y, radius * 2, radius * 2, velocityX, velocityY);
        this.radius = radius;
    }

    /** Draws the circle on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The drawing context.
     * @param {string} [fillColor='black'] - The fill color of the circle.
     * @param {string|null} [borderColor=null] - The border color of the circle.
     * @param {number} [borderWidth=0] - The width of the border.
     */
    draw(ctx, fillColor = 'white', borderColor = null, borderWidth = 0) {
        CanvasUtils.drawCircle2(this.x, this.y, this.radius, fillColor, borderColor, borderColor);
    }

    /** Checks the circle's position against the specified boundaries and adjusts if necessary.
     * Returns an array of boundaries hit ('left', 'right', 'top', 'bottom') or an empty array if no boundary was hit.
     * @param {number} gameAreaWidth - The gameAreaWidth of the area to check against.
     * @param {number} gameAreaHeight - The gameAreaHeight of the area to check against.
     * @returns {string[]} - The boundaries hit or an empty array if no boundary was hit.
     */
    checkCollisionWithBounds(gameAreaWidth, gameAreaHeight) {
        let boundariesHit = [];

        // Check for collision with the top boundary
        if (this.y - this.radius < 0) {
            this.y = this.radius; // Prevent moving out of bounds at the top
            this.velocityY *= -1; // Reverse direction
            boundariesHit.push('top');
        }
        // Check for collision with the bottom boundary
        else if (this.y + this.radius > gameAreaHeight) {
            this.y = gameAreaHeight - this.radius; // Prevent moving out of bounds at the bottom
            this.velocityY *= -1; // Reverse direction
            boundariesHit.push('bottom');
        }

        // Check for collision with the left boundary
        if (this.x - this.radius < 0) {
            this.x = this.radius; // Prevent moving out of bounds on the left
            this.velocityX *= -1; // Reverse direction
            boundariesHit.push('left');
        }
        // Check for collision with the right boundary
        else if (this.x + this.radius > gameAreaWidth) {
            this.x = gameAreaWidth - this.radius; // Prevent moving out of bounds on the right
            this.velocityX *= -1; // Reverse direction
            boundariesHit.push('right');
        }

        return boundariesHit;
    }
}

export default Circle; // Export the class for use in other modules
