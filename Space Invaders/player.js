// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// player.js

import ObjectKillable from '../scripts/objectKillable.js';
import { canvasConfig, spriteConfig } from './global.js';

import CanvasUtils from '../scripts/canvas.js';

class Player extends ObjectKillable {

    // New 22x16 pixel image (single frame)
    static frame = [ [
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
    ], ];    

    static dyingFrames = [
        // Initial burst
        [
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
            "11111111111111111"
        ],
        // Expanded burst stage 1
        [
            "00000000000000000",
            "00000001000100000",
            "00000111111110000",
            "00011111111111000",
            "01111111111111110",
            "11111111111111111",
            "11111111111111111",
            "11111111111111111",
            "01111111111111110",
            "00011111111111000",
            "00000011111000000"
        ],
        // Expanded burst stage 2
        [
            "00000000000000000",
            "00000100101000000",
            "00011111111111000",
            "00111111111111100",
            "11111111111111111",
            "11111111111111111",
            "11111111111111111",
            "11111111111111111",
            "00111111111111100",
            "00011111111111000",
            "00000011111000000"
        ],
        // Expanded burst stage 3
        [
            "00000000000000000",
            "00000010001000000",
            "00011111011111000",
            "01111111111111110",
            "11111111111111111",
            "11111111111111111",
            "01111111111111110",
            "00011111111111000",
            "00001111111110000",
            "00000111111100000",
            "00000001110000000"
        ],
        // Dispersed blast
        [
            "00000000000000000",
            "00000100000010000",
            "00001100000110000",
            "00011111011111000",
            "00111111111111100",
            "01111111111111110",
            "00111111111111100",
            "00011111011111000",
            "00001100000110000",
            "00000100000010000",
            "00000000000000000"
        ],
        // Fade out
        [
            "00000000000000000",
            "00000010001000000",
            "00000111111100000",
            "00001111111110000",
            "00011111111111000",
            "00111111111111100",
            "00011111111111000",
            "00001111111110000",
            "00000111111100000",
            "00000010001000000",
            "00000000000000000"
        ]
    ];


    constructor(x = 127, y = 820) {
        //super(x, y, 50, 50);
        super(x, y, Player.frame, Player.dyingFrames);
        this.setSpriteColor(spriteConfig.playerColor);
        this.score = 0;
        this.lives = spriteConfig.playerLives;
        this.pixelSize = 3.0;
        this.level = 1;
        this.bonus = spriteConfig.playerBonusScore;
        this.nextBonus = this.bonus;

        console.log(this);
    }

    updateScore(score) {
        this.score += score;
        if (this.score > this.nextBonus) {
            this.lives++;
            this.nextBonus += this.bonus;
        }
    }

    draw(ctx) {
        super.draw(ctx, 0, -20);
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
