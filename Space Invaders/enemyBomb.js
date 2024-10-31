// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyBomb.js

import ObjectDynamic from '../scripts/objectDynamic.js';
import { canvasConfig, spriteConfig } from './global.js';

import CanvasUtils from '../scripts/canvas.js';

class EnemyBomb extends ObjectDynamic {

    static Status = Object.freeze({
        ALIVE: 'alive',
        DEAD: 'dead'
    });

    constructor(x, y, frames) {
        const dimensions = CanvasUtils.spriteWidthHeight(frames[0], window.pixelSize);
        //console.log("EnemyBomb: width:",dimensions.width," height: ", dimensions.height);
        super(x, y, dimensions.width, dimensions.height, 0, 300);

        this.pixelSize = window.pixelSize;
        this.state === EnemyBomb.Status.ALIVE;
        this.velocityX = 0;
        this.velocityY = 175 ;

        this.frames = frames;
        this.currentFrameIndex = 0;

        this.frameDelay = 7;
        this.frameTime = 0;
    }

    isDead() {
        return this.state === EnemyBomb.Status.DEAD;
    }

    setIsDead() {
        this.state = EnemyBomb.Status.DEAD;
    }

    draw(ctx) {
        CanvasUtils.drawSprite(ctx, this.x, this.y, this.frames[this.currentFrameIndex], this.pixelSize, "white");
    }

    update(deltaTime = 1) {
        super.update(deltaTime);

        if (this.frameTime++ > this.frameDelay) {
            this.frameTime = 0;
            if (++this.currentFrameIndex >= this.frames.length) {
                this.currentFrameIndex = 0;
            }
        }

        if (this.y <= 0 || this.y > canvasConfig.width ||
            this.x <= 0 || this.x > canvasConfig.height
        ){
            this.setIsDead();
        }
    }
}

export default EnemyBomb;
