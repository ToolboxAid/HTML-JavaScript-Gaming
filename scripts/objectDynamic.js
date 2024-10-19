// ToolboxAid.com
// David Quesenberry
// objectDynamic.js
// 10/16/2024

import ObjectStatic from '../scripts/objectStatic.js'; // Import ObjectStatic

/**
 * Represents a dynamic object in a game that can move based on velocity.
 */
class ObjectDynamic extends ObjectStatic {
    /**
     * Creates an instance of ObjectDynamic.
     * @param {number} x - The X position of the object.
     * @param {number} y - The Y position of the object.
     * @param {number} width - The width of the object.
     * @param {number} height - The height of the object.
     * @param {number} [velocityX=0] - The initial velocity in the X direction.
     * @param {number} [velocityY=0] - The initial velocity in the Y direction.
     */
    constructor(x, y, width, height, velocityX = 0, velocityY = 0) {
        super(x, y, width, height); // Call the parent constructor
        this.velocityX = velocityX; // Velocity in X direction
        this.velocityY = velocityY; // Velocity in Y direction
    }

    /**
     * Updates the position of the object based on its velocity and delta time.
     * @param {number} deltaTime - The time elapsed since the last update, in seconds.
     */
    update(deltaTime) {
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }

    /**
     * Changes the velocity of the object.
     * @param {number} velocityX - The new velocity in the X direction.
     * @param {number} velocityY - The new velocity in the Y direction.
     */
    setVelocity(velocityX, velocityY) {
        this.velocityX = velocityX;
        this.velocityY = velocityY;
    }

/**
 * Checks the object's position against the specified boundaries and adjusts if necessary.
 * Returns an array of boundaries hit ('left', 'right', 'top', 'bottom') or an empty array if no boundary was hit.
 * @param {number} width - The width of the area to check against.
 * @param {number} height - The height of the area to check against.
 * @returns {string[]} - The boundaries hit or an empty array if no boundary was hit.
 */
checkCollisionWithBounds(width, height) {
    let boundariesHit = [];

    if (this.x < 0) {
        this.x = 0; // Prevent moving out of bounds on the left
        this.velocityX *= -1; // Reverse direction
        boundariesHit.push('left');
    } else if (this.x + this.width > width) {
        this.x = width - this.width; // Prevent moving out of bounds on the right
        this.velocityX *= -1; // Reverse direction
        boundariesHit.push('right');
    }
    
    if (this.y < 0) {
        this.y = 0; // Prevent moving out of bounds at the top
        this.velocityY *= -1; // Reverse direction
        boundariesHit.push('top');
    } else if (this.y + this.height > height) {
        this.y = height - this.height; // Prevent moving out of bounds at the bottom
        this.velocityY *= -1; // Reverse direction
        boundariesHit.push('bottom');
    }

    return boundariesHit;
}

}

export default ObjectDynamic; // Export the class for use in other modules
