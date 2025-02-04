// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// objectDynamic.js

import ObjectStatic from '../scripts/objectStatic.js'; // Import ObjectStatic
import CanvasUtils from "../scripts/canvas.js";

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

        this.gameAreaWidth = CanvasUtils.getWidth();
        this.gameAreaHeight = CanvasUtils.getHeight();
    }

    /** Future methods */
    getFutureCenterPoint(deltaTime = 1) {
        return { x: this.x + (this.width / 2) + (this.velocityX * deltaTime), y: this.y + (this.height / 2) + (this.velocityY * deltaTime) };
    }

    getFutureTopLeftPoint(deltaTime) {
        return { x: this.x + (this.velocityX * deltaTime), y: this.y + (this.velocityY * deltaTime) };
    }

    getFutureTopRightPoint(deltaTime) {
        return { x: this.x + this.width + (this.velocityX * deltaTime), y: this.y + (this.velocityY * deltaTime) };
    }

    getFutureBottomLeftPoint(deltaTime) {
        return { x: this.x + (this.velocityX * deltaTime), y: this.y + this.height + (this.velocityY * deltaTime) };
    }

    getFutureBottomRightPoint(deltaTime) {
        return { x: this.x + this.width + (this.velocityX * deltaTime), y: this.y + this.height + (this.velocityY * deltaTime) };
    }

    /**
     * Updates the position of the object based on its velocity and delta time.
     * @param {number} deltaTime - The time elapsed since the last update, in seconds.
     */
    update(deltaTime = 1) {
        if (!deltaTime){
            console.error("'deltaTime' is required");
            return;
        }
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }

    getDirection() {
        /** Angle to direction
           - down to right 0 to <90
           - down to left 90 to <180
           - up to left 180 < 270
           - up to right 270 to 360
        */
        let direction = {
            x: this.velocityX > 0 ? 'right' : this.velocityX < 0 ? 'left' : 'none',
            y: this.velocityY > 0 ? 'down' : this.velocityY < 0 ? 'up' : 'none'
        };
        // Return the direction of movement
        return direction;
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
     * Checks if this object is fully contained within the specified container object.
     * @param {Object} container - The container object with x, y, width, and height properties.
     * @returns {boolean} - True if this object is fully inside the container, false otherwise.
     */
    isContainedWithin(container) {
        return (
            this.x >= container.x &&
            this.y >= container.y &&
            this.x + this.width <= container.x + container.width &&
            this.y + this.height <= container.y + container.height
        );
    }

    isCollidingWith(object) {
        return (
            this.x + this.width >= object.x &&
            this.x <= object.x + object.width &&
            this.y + this.height >= object.y &&
            this.y <= object.y + object.height
        );
    }

    isCollidingWithSides(object) {
        let collisions = [];

        if (this.isCollidingWith(object)) {
            // Check for collisions
            if (this.x + this.width >= object.x && this.x < object.x) {
                collisions.push('right'); // This object's right edge collides with the other object's left edge
            }
            if (this.x <= object.x + object.width && this.x + this.width > object.x + object.width) {
                collisions.push('left'); // This object's left edge collides with the other object's right edge
            }
            if (this.y + this.height >= object.y && this.y < object.y) {
                collisions.push('bottom'); // This object's bottom edge collides with the other object's top edge
            }
            if (this.y <= object.y + object.height && this.y + this.height > object.y + object.height) {
                collisions.push('top'); // This object's top edge collides with the other object's bottom edge
            }
        }
        // Return false if no collisions, otherwise return collisions
        return collisions;
    }


    /**
 * Checks the object's position against the specified boundaries and adjusts if necessary.
 * Returns an array of boundaries hit ('left', 'right', 'top', 'bottom') or an empty array if no boundary was hit.
 * @returns {string[]} - The boundaries hit or an empty array if no boundary was hit.
 */
    checkGameBounds(offset = 0) {
        if (this.radius) {
            throw new Error("object has 'this.radius' use checkGameBoundsCircle.");
        }
        let boundariesHit = [];

        // top and bottom
        if (this.y + offset <= 0) {
            boundariesHit.push('top');
        } else if (this.y + this.height - offset >= this.gameAreaHeight) {
            boundariesHit.push('bottom');
        }

        // left & right
        if (this.x + offset <= 0) {
            boundariesHit.push('left');
        } else if (this.x + this.width - offset >= this.gameAreaWidth) {
            boundariesHit.push('right');
        }

        return boundariesHit;
    }

    /** Checks the circle's position against the specified boundaries and adjusts if necessary.
     * Returns an array of boundaries hit ('left', 'right', 'top', 'bottom') or an empty array if no boundary was hit.
     * @returns {string[]} - The boundaries hit or an empty array if no boundary was hit.
     */
    checkGameBoundsCircle() {
        if (!this.radius) {
            throw new Error("object requires a 'this.radius' that is not null, undefined, or empty.");
        }

        let boundariesHit = [];

        // Check for collision with the top boundary
        if (this.y - this.radius <= 0) {
            boundariesHit.push('top');
        }
        // Check for collision with the bottom boundary
        else if (this.y + this.radius >= this.gameAreaWidth) {
            boundariesHit.push('bottom');
        }

        // Check for collision with the left boundary
        if (this.x - this.radius <= 0) {
            boundariesHit.push('left');
        }
        // Check for collision with the right boundary
        else if (this.x + this.radius >= this.gameAreaWidth) {
            boundariesHit.push('right');
        }

        return boundariesHit;
    }

    destroy() {
        super.destroy();
        this.velocityX = null;
        this.velocityY = null;
    }

}

export default ObjectDynamic; // Export the class for use in other modules
