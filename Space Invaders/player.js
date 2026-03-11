// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// player.js

import { canvasConfig, spriteConfig, playerSelect } from './global.js';
import ObjectSprite from '../scripts/objectSprite.js';
import GameControllerMap from '../scripts/input/controller/gameControllerMap.js';

class Player extends ObjectSprite {

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
    ]];

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

    static playerID = 0;

    static cloneFrames(frames) {
        if (!Array.isArray(frames)) {
            return frames;
        }

        return frames.map(frame => {
            if (!Array.isArray(frame)) {
                return frame;
            }
            return frame.map(row => Array.isArray(row) ? [...row] : row);
        });
    }

    constructor() {
        const x = spriteConfig.playerX;
        const y = spriteConfig.playerY;
        const pixelSize = spriteConfig.pixelSize || 1;

        const livingFrames = Player.cloneFrames(Player.frame);
        const dyingFrames = Player.cloneFrames(Player.dyingFrames);

        super(x, y, livingFrames, dyingFrames, pixelSize);

        this.playerID = Player.playerID++;
        this.level = 1;
        this.score = 0;

        this.lives = playerSelect.lives;
        this.setSpriteColor(spriteConfig.playerColor);
        this.pixelSize = pixelSize;

        this.bonus = spriteConfig.playerBonusScore;
        this.nextBonus = this.bonus;
    }

    decrementLives() {
        this.lives -= 1;
    }

    updateScore(score) {
        this.score += score;
        if (this.score > this.nextBonus) {
            this.lives++;
            this.nextBonus += this.bonus;
        }
    }

    draw() {
        super.draw(0, -20);
    }

    incLevel() {
        this.level++;
    }

    resetLevel() {
        this.level = 0;
    }

update(keysDown, keyPressed, gameControllers) {

    super.update(1);

    const speed = 4;
    const laserHalfWidth = (spriteConfig.pixelSize || 1) / 2;
    const laserStartY = this.y - (spriteConfig.pixelSize || 1);

    // Keyboard
    if (keysDown.includes('ArrowLeft')) {
        this.x = Math.max(0, this.x - speed);
    }

    if (keysDown.includes('ArrowRight')) {
        this.x = Math.min(canvasConfig.width - this.width, this.x + speed);
    }

    if (keyPressed.includes('Space')) {
        return {
            x: this.x + (this.width / 2) - laserHalfWidth,
            y: laserStartY
        };
    }

    // GameController
    const direction = gameControllers.getAxisByIndex(0, 0);

    if (direction) {
        this.x += speed * direction;

        if (this.x < 0) {
            this.x = 0;
        }

        if (this.x > canvasConfig.width - this.width) {
            this.x = canvasConfig.width - this.width;
        }
    }

    if (
        gameControllers.wasButtonNamePressed(0, "A") ||
        gameControllers.wasButtonNamePressed(0, "B")
    ) {
        return {
            x: this.x + (this.width / 2) - laserHalfWidth,
            y: laserStartY
        };
    }

    return;
}

    destroy() {
        super.destroy();
        this.playerID = null;
        this.level = null;
        this.score = null;
        this.lives = null;
        this.pixelSize = null;
        this.bonus = null;
        this.nextBonus = null;
    }
}

export default Player;