// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyBomb.js

import { canvasConfig, spriteConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';

import ObjectSprite from '../scripts/objectSprite.js';

class EnemyBomb extends ObjectSprite {

    static dyingFrames = [
        [
            "100100010001",
            "010010100010",
            "001001000100",
            "110100001011",
            "001001000100",
            "010010100010",
            "100100010001",
        ],
        [
            "000000000000",
            "010010100010",
            "001001000100",
            "010100001010",
            "001001000100",
            "010010100010",
            "000000000000",
        ],
        [
            "000000000000",
            "000000000000",
            "001001000100",
            "000101101000",
            "001001000100",
            "000000000000",
            "000000000000",
        ],
        [
            "000000000000",
            "000000000000",
            "000101001000",
            "000011110000",
            "000101001000",
            "000000000000",
            "000000000000",
        ],
    ];

    constructor(x, y, frames, velocityY = 150) {
        super(x, y, frames, EnemyBomb.dyingFrames, spriteConfig.pixelSize);
        this.velocityX = this.velocityX;
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
