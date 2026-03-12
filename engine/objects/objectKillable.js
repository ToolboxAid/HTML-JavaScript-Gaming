import ObjectDynamic from './objectDynamic.js';
import SystemUtils from '../utils/systemUtils.js';
import ObjectValidation from '../utils/objectValidation.js';
import ObjectDebug from '../utils/objectDebug.js';

class ObjectKillable extends ObjectDynamic {
    static DEBUG = new URLSearchParams(window.location.search).has('objectKillable');

    static Status = Object.freeze({
        ALIVE: 'alive',
        DYING: 'dying',
        OTHER: 'other',
        DEAD: 'dead'
    });

    constructor(x = 0, y = 0, width = 1, height = 1, velocityX = 0, velocityY = 0) {
        super(x, y, width, height, velocityX, velocityY);

        this.status = ObjectKillable.Status.ALIVE;
        this.currentFrameIndex = 0;
        this.delayCounter = 0;
    }

    validateStatus(status) {
        ObjectValidation.oneOf(status, 'status', Object.values(ObjectKillable.Status));
    }

    #setStatus(status) {
        this.validateStatus(status);

        if (this.status === status) {
            return;
        }

        this.status = status;
        this.currentFrameIndex = 0;
        this.delayCounter = 0;
    }

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
    }

    handleDyingStatus(deltaTime, incFrame = false) {
        // lifecycle only
    }

    handleOtherStatus(deltaTime, incFrame = false) {
        // lifecycle only
    }

    handleDeadStatus(deltaTime, incFrame = false) {
        // no-op
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
        this.#setStatus(ObjectKillable.Status.ALIVE);
    }

    setIsDying() {
        this.#setStatus(ObjectKillable.Status.DYING);
    }

    setIsOther() {
        this.#setStatus(ObjectKillable.Status.OTHER);
    }

    setIsDead() {
        this.#setStatus(ObjectKillable.Status.DEAD);
        this.stop();
    }

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