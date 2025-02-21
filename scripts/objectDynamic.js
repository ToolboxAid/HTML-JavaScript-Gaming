// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// objectDynamic.js

import ObjectStatic from '../scripts/objectStatic.js';

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
     * @throws {Error} If parameters are invalid
     */
    constructor(x, y, width, height, velocityX = 0, velocityY = 0) {
        // Call parent constructor first
        super(x, y, width, height);

        // Validate velocity parameters
        if (typeof velocityX !== 'number' || typeof velocityY !== 'number') {
            throw new Error('Velocity parameters must be numbers.');
        }

        if (!Number.isFinite(velocityX) || !Number.isFinite(velocityY)) {
            throw new Error('Velocity values must be finite numbers.');
        }

        this.velocityX = velocityX;
        this.velocityY = velocityY;
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
        if (!deltaTime) {
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
     * Destroys the object and cleans up resources.
     * @returns {boolean} True if cleanup was successful
     */
    destroy() {
        try {
            // Call parent destroy first
            const parentDestroyed = super.destroy();
            if (!parentDestroyed) {
                return false;
            }

            // Validate object state before destruction
            if (this.velocityX === null || this.velocityY === null) {
                return false; // Already destroyed
            }

            // Nullify velocity properties
            this.velocityX = null;
            this.velocityY = null;

            return true; // Successful cleanup
        } catch (error) {
            console.error('Error during ObjectDynamic destruction:', error);
            return false;
        }
    }

}

export default ObjectDynamic; // Export the class for use in other modules
