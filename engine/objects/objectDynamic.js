// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// objectDynamic.js

import ObjectStatic from './objectStatic.js';
import SystemUtils from "../utils/systemUtils.js";
import ObjectValidation from "../utils/objectValidation.js";
import ObjectDebug from "../utils/objectDebug.js";

/**
 * Represents a dynamic object in a game that can move based on velocity.
 */
class ObjectDynamic extends ObjectStatic {
    static DEBUG = new URLSearchParams(window.location.search).has('objectDynamic');

    /**
     * Creates an instance of ObjectDynamic.
     * @param {number} x - The X position of the object.
     * @param {number} y - The Y position of the object.
     * @param {number} width - The width of the object.
     * @param {number} height - The height of the object.
     * @param {number} [velocityX=0] - The initial velocity in the X direction.
     * @param {number} [velocityY=0] - The initial velocity in the Y direction.
     */
    constructor(x = 0, y = 0, width = 1, height = 1, velocityX = 0, velocityY = 0) {
        super(x, y, width, height);

        ObjectValidation.finiteNumber(velocityX, 'velocityX');
        ObjectValidation.finiteNumber(velocityY, 'velocityY');

        this.velocityX = velocityX;
        this.velocityY = velocityY;
    }

    /**
     * Validates delta time input.
     * @param {number} deltaTime - The elapsed time.
     */
    validateDeltaTime(deltaTime) {
        ObjectValidation.finiteNumber(deltaTime, 'deltaTime');
    }

    /**
     * Returns the future center point after movement.
     * @param {number} [deltaTime=1] - The elapsed time.
     * @returns {{x:number, y:number}}
     */
    getFutureCenterPoint(deltaTime = 1) {
        this.validateDeltaTime(deltaTime);

        return {
            x: this.x + (this.width / 2) + (this.velocityX * deltaTime),
            y: this.y + (this.height / 2) + (this.velocityY * deltaTime)
        };
    }

    getFutureTopLeftPoint(deltaTime = 1) {
        this.validateDeltaTime(deltaTime);

        return {
            x: this.x + (this.velocityX * deltaTime),
            y: this.y + (this.velocityY * deltaTime)
        };
    }

    getFutureTopRightPoint(deltaTime = 1) {
        this.validateDeltaTime(deltaTime);

        return {
            x: this.x + this.width + (this.velocityX * deltaTime),
            y: this.y + (this.velocityY * deltaTime)
        };
    }

    getFutureBottomLeftPoint(deltaTime = 1) {
        this.validateDeltaTime(deltaTime);

        return {
            x: this.x + (this.velocityX * deltaTime),
            y: this.y + this.height + (this.velocityY * deltaTime)
        };
    }

    getFutureBottomRightPoint(deltaTime = 1) {
        this.validateDeltaTime(deltaTime);

        return {
            x: this.x + this.width + (this.velocityX * deltaTime),
            y: this.y + this.height + (this.velocityY * deltaTime)
        };
    }

    /**
     * Updates the position of the object based on its velocity and delta time.
     * @param {number} [deltaTime=1] - The time elapsed since the last update.
     */
    update(deltaTime = 1) {
        this.validateDeltaTime(deltaTime);

        if (this.isDestroyed) {
            return;
        }

        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }

    /**
     * Gets the current movement direction based on velocity.
     * @returns {{x:string, y:string}}
     */
    getDirection() {
        return {
            x: this.velocityX > 0 ? 'right' : this.velocityX < 0 ? 'left' : 'none',
            y: this.velocityY > 0 ? 'down' : this.velocityY < 0 ? 'up' : 'none'
        };
    }

    /**
     * Changes the velocity of the object.
     * @param {number} velocityX - The new velocity in the X direction.
     * @param {number} velocityY - The new velocity in the Y direction.
     */
    setVelocity(velocityX, velocityY) {
        ObjectValidation.finiteNumber(velocityX, 'velocityX');
        ObjectValidation.finiteNumber(velocityY, 'velocityY');

        this.velocityX = velocityX;
        this.velocityY = velocityY;
    }

    /**
     * Stops all movement.
     */
    stop() {
        this.velocityX = 0;
        this.velocityY = 0;
    }

    /**
     * Destroys the object and cleans up resources.
     * @returns {boolean} True if cleanup was successful.
     */
    destroy() {
        ObjectDebug.log(ObjectDynamic.DEBUG, `Destroying ${SystemUtils.getObjectType(this)}`, {
            position: { x: this.x, y: this.y },
            velocity: { x: this.velocityX, y: this.velocityY },
            state: {
                isDestroyed: this.isDestroyed
            }
        });

        if (this.isDestroyed || this.velocityX === null || this.velocityY === null) {
            ObjectDebug.warn(ObjectDynamic.DEBUG, 'ObjectDynamic already destroyed');
            return false;
        }

        const finalState = {
            position: { x: this.x, y: this.y },
            velocity: { x: this.velocityX, y: this.velocityY }
        };

        this.destroyProperties([
            'velocityX',
            'velocityY'
        ]);

        const parentDestroyed = super.destroy();
        if (!parentDestroyed) {
            ObjectDebug.error(ObjectDynamic.DEBUG, 'Parent destruction failed');
            return false;
        }

        ObjectDebug.log(ObjectDynamic.DEBUG, `Successfully destroyed ${SystemUtils.getObjectType(this)}`, finalState);
        return true;
    }
}

export default ObjectDynamic;