// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// objectDynamic.js

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

        // left & right
        if (this.x <= 0) {
            this.x = 0; // Prevent moving out of bounds on the left
            this.velocityX *= -1; // Reverse direction
            boundariesHit.push('left');
        } else if (this.x + this.width >= width) {
            this.x = width - this.width; // Prevent moving out of bounds on the right
            this.velocityX *= -1; // Reverse direction
            boundariesHit.push('right');
        }

        // top and bottom
        if (this.y <= 0) {
            this.y = 0; // Prevent moving out of bounds at the top
            this.velocityY *= -1; // Reverse direction
            boundariesHit.push('top');
        } else if (this.y + this.height >= height) {
            this.y = height - this.height; // Prevent moving out of bounds at the bottom
            this.velocityY *= -1; // Reverse direction
            boundariesHit.push('bottom');
        }

        return boundariesHit;
    }

    checkCollisionWithObject(otherObject, deltaTime) {
        // Calculate future positions based on current position and velocity
        const futureX1 = this.x + this.velocityX * deltaTime;
        const futureY1 = this.y + this.velocityY * deltaTime;
        const futureX2 = otherObject.x; // Assuming otherObject is already updated
        const futureY2 = otherObject.y;
    
        // Array to store sides of the collision
        let collisionSides = [];
    
        // Check if a collision occurs (bounding box overlap check)
        const isColliding = (
            futureX1 < futureX2 + otherObject.width &&   // Check left side collision
            futureX1 + this.width > futureX2 &&         // Check right side collision
            futureY1 < futureY2 + otherObject.height && // Check top side collision
            futureY1 + this.height > futureY2           // Check bottom side collision
        );
    
        if (isColliding) {
            // Check for left-side collision
            if (this.x + this.width <= otherObject.x && 
                futureX1 + this.width >= otherObject.x) {
                collisionSides.push('left');
            }
    
            // Check for right-side collision
            if (this.x >= otherObject.x + otherObject.width && 
                futureX1 <= otherObject.x + otherObject.width) {
                collisionSides.push('right');
            }
    
            // Check for top-side collision
            if (this.y + this.height <= otherObject.y && 
                futureY1 + this.height >= otherObject.y) {
                collisionSides.push('top');
            }
    
            // Check for bottom-side collision
            if (this.y >= otherObject.y + otherObject.height && 
                futureY1 <= otherObject.y + otherObject.height) {
                collisionSides.push('bottom');
            }
        }
    
        return collisionSides;
    }
    


}

export default ObjectDynamic; // Export the class for use in other modules
