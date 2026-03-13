// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// objectDynamic.js

import ObjectStatic from './objectStatic.js';
import SystemUtils from "../utils/systemUtils.js";
import ObjectValidation from "../utils/objectValidation.js";
import ObjectDebug from "../utils/objectDebug.js";
import PhysicsUtils from '../physics/physicsUtils.js';

/** Represents a dynamic object in a game that can move based on velocity. */
class ObjectDynamic extends ObjectStatic {
    static DEBUG = new URLSearchParams(window.location.search).has('objectDynamic');

    /** Creates an instance of ObjectDynamic. */
    constructor(x = 0, y = 0, width = 1, height = 1, velocityX = 0, velocityY = 0) {
        super(x, y, width, height);

        ObjectValidation.finiteNumber(velocityX, 'velocityX');
        ObjectValidation.finiteNumber(velocityY, 'velocityY');

        this.velocityX = velocityX;
        this.velocityY = velocityY;
    }

    /** Validates delta time input. */
    validateDeltaTime(deltaTime) {
        ObjectValidation.finiteNumber(deltaTime, 'deltaTime');
    }

    /** Returns the future center point after movement. */
    getFutureCenterPoint(deltaTime = 1) {
        this.validateDeltaTime(deltaTime);
        return PhysicsUtils.getFutureCenterPoint(this, deltaTime);
    }

    getFutureTopLeftPoint(deltaTime = 1) {
        this.validateDeltaTime(deltaTime);
        return PhysicsUtils.getFutureTopLeftPoint(this, deltaTime);
    }

    getFutureTopRightPoint(deltaTime = 1) {
        this.validateDeltaTime(deltaTime);
        return PhysicsUtils.getFutureTopRightPoint(this, deltaTime);
    }

    getFutureBottomLeftPoint(deltaTime = 1) {
        this.validateDeltaTime(deltaTime);
        return PhysicsUtils.getFutureBottomLeftPoint(this, deltaTime);
    }

    getFutureBottomRightPoint(deltaTime = 1) {
        this.validateDeltaTime(deltaTime);
        return PhysicsUtils.getFutureBottomRightPoint(this, deltaTime);
    }

    /** Updates the position of the object based on its velocity and delta time. */
    update(deltaTime = 1) {
        this.validateDeltaTime(deltaTime);

        if (this.isDestroyed) {
            return;
        }

        PhysicsUtils.applyKinematics(this, deltaTime);
    }

    /** Gets the current movement direction based on velocity. */
    getDirection() {
        return PhysicsUtils.getDirectionFromVelocity(this.velocityX, this.velocityY);
    }

    /** Changes the velocity of the object. */
    setVelocity(velocityX, velocityY) {
        ObjectValidation.finiteNumber(velocityX, 'velocityX');
        ObjectValidation.finiteNumber(velocityY, 'velocityY');

        PhysicsUtils.setVelocity(this, velocityX, velocityY);
    }

    /** Stops all movement. */
    stop() {
        PhysicsUtils.stop(this);
    }

    /** Destroys the object and cleans up resources. */
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
