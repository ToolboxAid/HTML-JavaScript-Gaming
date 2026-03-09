// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// objectKillable.js

import ObjectDynamic from './objectDynamic.js';
import SystemUtils from './utils/systemUtils.js';
import ObjectValidation from './utils/objectValidation.js';
import ObjectDebug from './utils/objectDebug.js';

class ObjectKillable extends ObjectDynamic {
    static DEBUG = new URLSearchParams(window.location.search).has('objectKillable');

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
     * @param {number} [x=0] - The X position of the object.
     * @param {number} [y=0] - The Y position of the object.
     * @param {number} [width=1] - The width of the object.
     * @param {number} [height=1] - The height of the object.
     * @param {number} [velocityX=0] - The initial velocity in the X direction.
     * @param {number} [velocityY=0] - The initial velocity in the Y direction.
     */
    constructor(x = 0, y = 0, width = 1, height = 1, velocityX = 0, velocityY = 0) {
        super(x, y, width, height, velocityX, velocityY);

        this.status = ObjectKillable.Status.ALIVE;
        this.currentFrameIndex = 0;
        this.delayCounter = 0;
    }

    /**
     * Validates a killable state.
     * @param {string} status
     */
    validateStatus(status) {
        ObjectValidation.oneOf(status, 'status', Object.values(ObjectKillable.Status));
    }

    /**
     * Centralized state transition helper.
     * @param {string} status
     */
    setStatus(status) {
        this.validateStatus(status);
        this.status = status;
        this.currentFrameIndex = 0;
        this.delayCounter = 0;
    }

    /**
     * Advances animation timing.
     * @param {boolean} incFrame
     */
    updateAnimation(incFrame = false) {
        if (!incFrame) {
            return;
        }

        this.currentFrameIndex++;
        this.delayCounter = 0;
    }

    /**
     * Updates the object based on current status.
     * @param {number} [deltaTime=1] - Time elapsed since last update.
     * @param {boolean} [incFrame=false] - Whether to increment animation frame.
     */
    update(deltaTime = 1, incFrame = false) {
        this.validateDeltaTime(deltaTime);

        if (this.isDestroyed) {
            return;
        }

        switch (this.status) {
            case ObjectKillable.Status.ALIVE:
                this.handleAliveStatus(deltaTime, incFrame);
                break;

            case ObjectKillable.Status.DYING:
                this.handleDyingStatus(deltaTime, incFrame);
                break;

            case ObjectKillable.Status.OTHER:
                this.handleOtherStatus(deltaTime, incFrame);
                break;

            case ObjectKillable.Status.DEAD:
                this.handleDeadStatus(deltaTime, incFrame);
                break;

            default:
                SystemUtils.showStackTrace(`OOPS : Unknown status: ${this.status}`);
                throw new Error(`Unknown status: ${this.status}`);
        }
    }

    handleAliveStatus(deltaTime, incFrame = false) {
        super.update(deltaTime);
        this.updateAnimation(incFrame);
    }

    handleDyingStatus(deltaTime, incFrame = false) {
        this.updateAnimation(incFrame);
    }

    handleOtherStatus(deltaTime, incFrame = false) {
        this.updateAnimation(incFrame);
    }

    handleDeadStatus(deltaTime, incFrame = false) {
        // Intentionally no-op
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
        this.setStatus(ObjectKillable.Status.ALIVE);
    }

    setIsDying() {
        this.setStatus(ObjectKillable.Status.DYING);
    }

    setIsOther() {
        this.setStatus(ObjectKillable.Status.OTHER);
    }

    setIsDead() {
        this.setStatus(ObjectKillable.Status.DEAD);
        this.stop();
    }

    /**
     * Destroys the object and cleans up resources.
     * @returns {boolean} True if cleanup was successful.
     */
    destroy() {
        ObjectDebug.log(ObjectKillable.DEBUG, `Destroying ${SystemUtils.getObjectType(this)}`, {
            status: this.status,
            animation: {
                frame: this.currentFrameIndex,
                delay: this.delayCounter
            },
            state: {
                isDestroyed: this.isDestroyed
            }
        });

        if (this.isDestroyed || this.status === null) {
            ObjectDebug.warn(ObjectKillable.DEBUG, 'ObjectKillable already destroyed');
            return false;
        }

        const finalState = {
            status: this.status,
            frame: this.currentFrameIndex,
            delay: this.delayCounter
        };

        this.status = ObjectKillable.Status.DEAD;
        this.stop();

        this.destroyProperties([
            'currentFrameIndex',
            'delayCounter'
        ]);

        const parentDestroyed = super.destroy();
        if (!parentDestroyed) {
            ObjectDebug.error(ObjectKillable.DEBUG, 'Parent ObjectDynamic destruction failed');
            return false;
        }

        this.status = null;

        ObjectDebug.log(ObjectKillable.DEBUG, `Successfully destroyed ${SystemUtils.getObjectType(this)}`, finalState);
        return true;
    }
}

export default ObjectKillable;
