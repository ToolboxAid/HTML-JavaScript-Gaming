// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// objectKillable.js

import ObjectDynamic from './objectDynamic.js';
import SystemUtils from './utils/systemUtils.js';

class ObjectKillable extends ObjectDynamic {
/**
     * Enumeration of possible object states
     * @readonly
     * @enum {string}
     */
static Status = Object.freeze({
    ALIVE: 'alive',
    DYING: 'dying',
    OTHER: 'other',
    DEAD: 'dead'
});

/**
 * Creates an instance of ObjectKillable.
 * @param {number} x - The X position of the object.
 * @param {number} y - The Y position of the object.
 * @param {number} width - The width of the object.
 * @param {number} height - The height of the object.
 * @param {number} [velocityX=0] - The initial velocity in the X direction.
 * @param {number} [velocityY=0] - The initial velocity in the Y direction.
 * @throws {Error} If parameters are invalid or status is invalid
 */
constructor(x, y, width, height, velocityX = 0, velocityY = 0) {
    // Call parent constructor
    super(x, y, width, height, velocityX, velocityY);

    // Initialize status
    this.status = ObjectKillable.Status.ALIVE;
    
    // Initialize animation-related properties
    this.currentFrameIndex = 0;
    this.delayCounter = 0;

    // Validate initial status
    if (!Object.values(ObjectKillable.Status).includes(this.status)) {
        throw new Error('Invalid initial status.');
    }
}

    update(deltaTime, incFrame = false) {
        switch (this.status) {
            case ObjectKillable.Status.ALIVE: // Handle ALIVE status
                this.handleAliveStatus(deltaTime, incFrame);
                break;
            case ObjectKillable.Status.DYING: // Handle DYING status
                this.handleDyingStatus(deltaTime);
                break;
            case ObjectKillable.Status.OTHER: // Handle OTHER status
                this.handleOtherStatus(deltaTime);
                break;
            case ObjectKillable.Status.DEAD: // Handle DEAD status
                this.handleDeadStatus(deltaTime);
                break;
            default:  // Handle OOPS - Handle unknown status
                SystemUtils.showStackTrace(`OOPS : Unknown status: ${this.status}`)
                break;
        }
    }

    handleAliveStatus(deltaTime, incFrame) { // Handle ALIVE status
        super.update(deltaTime);
    }

    handleDyingStatus(deltaTime) {
    }

    handleOtherStatus(deltaTime) { // Custom logic for OTHER status
    }

    handleDeadStatus(deltaTime) { // Custom logic for DEAD status
    }

    isAlive() {
        return this.status === ObjectKillable.Status.ALIVE;
    }

    isDying() {
        return this.status === ObjectKillable.Status.DYING;
    }

    isOther() {
        return this.status === ObjectKillable.Status.OTHER;
    }

    isDead() {
        return this.status === ObjectKillable.Status.DEAD;
    }

    setIsAlive() {
        this.status = ObjectKillable.Status.ALIVE;
        this.currentFrameIndex = 0;
        this.delayCounter = 0;
    }

    setIsDying() {
        this.status = ObjectKillable.Status.DYING;
        this.currentFrameIndex = 0;
        this.delayCounter = 0;
    }

    setIsOther() {
        this.status = ObjectKillable.Status.OTHER;
        this.currentFrameIndex = 0;
        this.delayCounter = 0;
    }

    setIsDead() {
        this.status = ObjectKillable.Status.DEAD;
        this.currentFrameIndex = 0;
        this.delayCounter = 0;
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
            if (this.status === null) {
                return false; // Already destroyed
            }

            // Cleanup animation properties
            this.currentFrameIndex = null;
            this.delayCounter = null;

            // Cleanup status
            this.status = null;

            return true; // Successful cleanup
        } catch (error) {
            console.error('Error during ObjectKillable destruction:', error);
            return false;
        }
    }
}

export default ObjectKillable;