// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyBomb.js

import ObjectDynamic from '../scripts/objectDynamic.js';
import ObjectKillable from '../scripts/objectKillable.js';
import { canvasConfig, spriteConfig } from './global.js';

import CanvasUtils from '../scripts/canvas.js';

class EnemyBomb extends ObjectKillable {

    static Status = Object.freeze({
        ALIVE: 'alive',
        DEAD: 'dead'
    });

    constructor(x, y, frames, velocityY = 150) {
        super(x, y, frames, null, 0, velocityY);

    }

    update(deltaTime = 1) {
        super.update(deltaTime);

        if (this.x <= 0 || this.x > canvasConfig.width ||
            this.y <= 0 || this.y > canvasConfig.height) {
            this.setIsDead();
        }
    }
}

export default EnemyBomb;
