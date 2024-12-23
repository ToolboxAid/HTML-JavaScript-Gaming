// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// objectKillable.js

import ObjectDynamic from './objectDynamic.js';
import CanvasUtils from './canvas.js';

class ObjectKillable extends ObjectDynamic {
    static Status = Object.freeze({
        ALIVE: 'alive',
        DYING: 'dying',
        OTHER: 'other',
        DEAD: 'dead'
    });

    constructor(x, y, width, height) {

        super(x, y, width, height);

        this.status = ObjectKillable.Status.ALIVE;
    }

    update(deltaTime, incFrame = false) {
        switch (this.status) {
            case ObjectKillable.Status.ALIVE: // Handle ALIVE status
                this.handleAliveStatus(deltaTime, incFrame);
                break;
            case ObjectKillable.Status.DYING: // Handle DYING status
                this.handleDyingStatus();
                break;
            case ObjectKillable.Status.OTHER: // Handle OTHER status
                this.handleOtherStatus();
                break;
            case ObjectKillable.Status.DEAD: // Handle DEAD status
                this.handleDeadStatus();
                break;
            default:  // Handle OOPS - Handle unknown status
                console.error("OOPS : Unknown status:", this.status);
                break;
        }
    }

    handleAliveStatus(deltaTime, incFrame) { // Handle ALIVE status
        super.update(deltaTime);
    }

    handleDyingStatus() {
    }

     handleOtherStatus() { // Custom logic for OTHER status
     }

     handleDeadStatus() { // Custom logic for DEAD status
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

}

export default ObjectKillable;