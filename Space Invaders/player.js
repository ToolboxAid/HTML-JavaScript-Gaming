// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// player.js

import ObjectKillable from '../scripts/objectKillable.js';
import { canvasConfig, spriteConfig } from './global.js';

import CanvasUtils from '../scripts/canvas.js';

class Player extends ObjectKillable {

    // New 22x16 pixel image (single frame)
    static frame = [[
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
    ],];

    static dyingFrames = [
            [
                "00000000100000000",
                "00000000110000000",
                "00000010101000000",
                "00000011101000000",
                "00011010111110100",
                "01111110111111110",
                "11101111110111111",
                "11111111101111111",
                "11111110111111111",
                "11111111101111101",
                "11111110111111101",
            ],
            [
                "00000000000000000",
                "00000000100000000",
                "00000000101000000",
                "00000010101000000",
                "00101110011110100",
                "01011110011011100",
                "11001111011011111",
                "11101111001111110",
                "11011110111111110",
                "11111100110111111",
                "11110111101111101",
            ],
            [
                "00000000000000000",
                "00000000010000000",
                "00000000100000000",
                "00000010100000000",
                "00100110011010100",
                "01011100011011000",
                "11001111010010110",
                "11100111000111110",
                "11001110011011110",
                "11010100110111110",
                "10110111100111101",
            ],
            [
                "00000000000000000",
                "00000000000000000",
                "00000000100000000",
                "00000000100000000",
                "00000110001010000",
                "01001100011001000",
                "10000110010000110",
                "10100110000110110",
                "10000100001001110",
                "10010100100011100",
                "10100111000111000",
            ],
            [
                "00000000000000000",
                "00000000000000000",
                "00000000000000000",
                "00000000000000000",
                "00000000000010000",
                "01000000001000000",
                "10000100000000010",
                "10000100000100010",
                "10000100000000010",
                "10010000000001000",
                "10000100000010000",
            ],
            [
                "00000000000000000",
                "00000000000000000",
                "00000000000000000",
                "00000000000000000",
                "00000000000000000",
                "00000000000000000",
                "00000000000000000",
                "10000000000000000",
                "00000000000000000",
                "00000000000000000",
                "00000000000000000",
            ],
        ];
    
    constructor(x = 127, y = 820) {
        super(x, y, Player.frame, Player.dyingFrames);
        this.setSpriteColor(spriteConfig.playerColor);
        this.score = 0;
        this.lives = spriteConfig.playerLives;
        this.pixelSize = spriteConfig.pixelSize;
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
        super.draw(ctx, 0, -20);
    }

    incLevel() {
        this.level++;
    }

    resetLevel() {
        this.level = 0;
    }

    update(keysPressed, keyJustPressed) {
        super.update(1);
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
