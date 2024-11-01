// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// objectKillable.js

import ObjectDynamic from './objectDynamic.js';
import CanvasUtils from './canvas.js';
//import { spriteConfig } from '../Space Invaders/global.js';

class ObjectKillable extends ObjectDynamic {
    static Status = Object.freeze({
        ALIVE: 'alive',
        DYING: 'dying',
        DEAD: 'dead'
    });

    constructor(x, y, dyingModulus = 5) {
        const dimensions = CanvasUtils.spriteWidthHeight(ObjectKillable.livingFrames[0], spriteConfig.pixelSize);

        super(x, y, dimensions.width, dimensions.height, velocityX, 0);

        this.status = ObjectKillable.Status.ALIVE;

        this.currentFrameIndex = 0;

        this.livingDelay = 0;
        this.livingFrames = ObjectKillable.livingFrames;
        this.livingFrameCount = this.livingFrames.length;

        this.dyingDelay = 0;
        this.dyingFrames = ObjectKillable.dyingFrames;
        this.dyingFrameCount = this.dyingFrames.length;

        this.dyingModulus = dyingModulus;
    }


    update(deltaTime) {
        super.update(deltaTime);

        if (this.isAlive()) { // is Alive
            this.currentFrameIndex = Math.floor((this.livingDelay++ / this.dyingModulus) % this.livingFrameCount);
        } else { // is Dying or Dead
            if (this.isDying()) {
                this.dyingDelay;
                if (this.dyingDelay >= this.dyingModulus * this.dyingFrameCount) {
                    this.setDead();
                }
                if (!this.isDead()) {
                    this.currentFrameIndex = Math.floor((this.dyingDelay / this.dyingModulus) % this.dyingFrameCount);
                }
            }
        }
    }

    isAlive() {
        return this.status === ObjectKillable.Status.ALIVE;
    }

    setHit() {
        if (this.dyingFrames) {
            this.status = ObjectKillable.Status.DYING;
        } else {
            this.status = ObjectKillable.Status.DEAD;
        }
    }

    isDying() {
        return this.status === ObjectKillable.Status.DYING;
    }

    isDead() {
        return this.status === ObjectKillable.Status.DEAD;
    }

    setDead() {
        this.status = ObjectKillable.Status.DEAD;
    }

    draw(ctx) {
        if (this.isAlive()) {
            CanvasUtils.drawSprite(ctx, this.x, this.y, this.livingFrames[this.currentFrameIndex], spriteConfig.pixelSize, spriteConfig.shipColor);
        } else {
            if (this.isDying()) {
                CanvasUtils.drawSprite(ctx, this.x, this.y, this.dyingFrames[this.currentFrameIndex], spriteConfig.pixelSize, spriteConfig.shipColor);
            }
        }
    }

}

export default ObjectKillable;
