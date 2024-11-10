// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// player.js

import ObjectDynamic from '../scripts/objectDynamic.js';
import { canvasConfig, spriteConfig } from './global.js';

import CanvasUtils from '../scripts/canvas.js';

class Player extends ObjectDynamic {

    // New 22x16 pixel image (single frame)
    static frame = [
        "00000000100000000",
        "00000001110000000",
        "00000011111000000",
        "00000011111000000",
        "00111111111111100",
        "01111111111111110",
        "11111111111111111",
        "11111111111111111",
        "11111111111111111",
        "11111111111111111",
        "11111111111111111",

    ];

    constructor(x = 127, y = 830) {
        super(x, y, 50, 50);
        this.score = 0;
        this.lives = spriteConfig.playerLives;
        this.pixelSize = 3.0;
        this.level = 1;
        this.bonus = spriteConfig.playerBonusScore;
        this.nextBonus = this.bonus;
    }

    updateScore(score) {
        this.score += score;
        if (this.score > this.nextBonus) {
            this.lives++;
            this.nextBonus += this.bonus;
        }
    }

    draw(ctx) {
        CanvasUtils.drawSprite(ctx, this.x, this.y-20, Player.frame, this.pixelSize, spriteConfig.playerColor);
    }

    setLevel() {
        this.level++;
    }

    update(keysPressed, keyJustPressed) {
        const speed = 4;
        if (keysPressed.includes('ArrowLeft')) {
            if (this.x - speed > 0) {
                this.x -= speed;
            }
        }
        if (keysPressed.includes('ArrowRight')) {
            if (this.x < canvasConfig.width - this.width - speed) {
                this.x += speed;
            }
        }

        if (keyJustPressed.includes('Space')) {
            let laserPoint = { x: this.x + (this.width / 2), y: this.y };
            return laserPoint;
        }
        return;
    }
}

export default Player;
