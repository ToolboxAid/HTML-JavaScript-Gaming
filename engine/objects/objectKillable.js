import ObjectDynamic from './objectDynamic.js';
import SystemUtils from '../utils/systemUtils.js';
import ObjectDebug from '../utils/objectDebug.js';
import DebugFlag from '../utils/debugFlag.js';
import ObjectDestroyUtils from './objectDestroyUtils.js';
import ObjectLifecycle from '../lifecycle/objectLifecycle.js';

class ObjectKillable extends ObjectDynamic {
    static DEBUG = DebugFlag.has('objectKillable');

    static Status = Object.freeze({
        ALIVE: 'alive',
        DYING: 'dying',
        DEAD: 'dead'
    });

    constructor(x = 0, y = 0, width = 1, height = 1, velocityX = 0, velocityY = 0) {
        super(x, y, width, height, velocityX, velocityY);

        this.lifecycle = new ObjectLifecycle(
            Object.values(ObjectKillable.Status),
            ObjectKillable.Status.ALIVE
        );
    }

    validateStatus(status) {
        this.lifecycle.validateStatus(status);
    }

    get status() {
        return this.lifecycle?.status ?? null;
    }

    set status(value) {
        if (value === null) {
            if (this.lifecycle) {
                this.lifecycle.status = null;
            }
            return;
        }

        this.lifecycle?.setStatus(value, { resetCounters: false });
    }

    get currentFrameIndex() {
        return this.lifecycle?.currentFrameIndex ?? null;
    }

    set currentFrameIndex(value) {
        if (!this.lifecycle) {
            return;
        }

        this.lifecycle.currentFrameIndex = value;
    }

    get delayCounter() {
        return this.lifecycle?.delayCounter ?? null;
    }

    set delayCounter(value) {
        if (!this.lifecycle) {
            return;
        }

        this.lifecycle.delayCounter = value;
    }

    setLifecycleStatus(status) {
        return this.lifecycle.setStatus(status);
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

    handleDeadStatus(deltaTime, incFrame = false) {
        // no-op
    }

    isAlive() {
        return this.status === ObjectKillable.Status.ALIVE;
    }

    isDying() {
        return this.status === ObjectKillable.Status.DYING;
    }

    isDead() {
        return this.status === ObjectKillable.Status.DEAD;
    }

    setIsAlive() {
        this.setLifecycleStatus(ObjectKillable.Status.ALIVE);
    }

    setIsDying() {
        this.setLifecycleStatus(ObjectKillable.Status.DYING);
    }

    setIsDead() {
        this.setLifecycleStatus(ObjectKillable.Status.DEAD);
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

        if (ObjectDestroyUtils.shouldSkipDestroy(this, ObjectKillable.DEBUG, 'ObjectKillable', this.status === null)) {
            return false;
        }

        const finalState = {
            status: this.status,
            frame: this.currentFrameIndex,
            delay: this.delayCounter
        };

        this.status = ObjectKillable.Status.DEAD;
        this.stop();

        if (this.lifecycle) {
            this.lifecycle.destroy();
        }

        this.destroyProperties([
            'currentFrameIndex',
            'delayCounter',
            'lifecycle'
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
