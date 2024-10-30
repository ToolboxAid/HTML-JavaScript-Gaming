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
        const dimensions = CanvasUtils.spriteWidthHeight(frames, window.pixelSize);
        super(x, y, dimensions.width, dimensions.height, 0, 300);
        this.pixelSize = window.pixelSize;
        this.frames = frames;
        this.state === EnemyBomb.Status.ALIVE;
        this.currentFrame = 1;
        this.velocityX = 0;
        this.velocityY = 50;

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
        CanvasUtils.drawSprite(ctx, this.x, this.y, this.frames[this.currentFrame], this.pixelSize, "white");
    }

    update(deltaTime = 1) {
        super.update(deltaTime);

        if (this.frameTime++ > this.frameDelay) {
            this.frameTime = 0;
            if (++this.currentFrame >= 3) {
                this.currentFrame = 0;
            }
        }

        if (this.y <= 0 || this.y > 800 ||
            this.x <= 0 || this.x > 800
        ) {
            this.setIsDead();
        }
    }
}

export default EnemyBomb;
