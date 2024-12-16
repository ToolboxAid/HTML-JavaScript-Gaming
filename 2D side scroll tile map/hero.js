// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// hero.js

import { canvasConfig, spriteConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';
import ObjectSprite from '../scripts/objectSprite.js'

class Hero extends ObjectSprite {

    // New 22x16 pixel image (single frame)
    static frame = [[
        //        1         2
        //234567890123456789
        "00wwwwwwwwwwwwwww00", // 1
        "0wOOOOOOOOOOOOOOOw0", // 2
        "wObbYYYYYYYYYYYbbOw", // 3
        "wObbYYbbbbbbOYYbbOw", // 4
        "wOYYYbYYYYYYbOYYYOw", // 5
        "wOYYbYYYYYYYYbOYYOw", // 6
        "wOYYbYYYbbYYYbOYYOw", // 7
        "wOYYbYYYbbYYYbOYYOw", // 8
        "wOYYYbbbbYYYbOYYYOw", // 9
        "wOYYYYYbYYYbOYYYYOw", // 10
        "wOYYYYYbYYYbOYYYYOw", // 1
        "wOYYYYYbYYYbOYYYYOw", // 2
        "wOYYYYYYbbbOYYYYYOw", // 3
        "wOYYYYYbYYYbOYYYYOw", // 4
        "wOYYYYYbYYYbOYYYYOw", // 5
        "wObbYYYYbBbOYYYbbOw", // 6
        "wObbYYYYYYYYYYYbbOw", // 7
        "0wOOOOOOOOOOOOOOOw0", // 8
        "00wwwwwwwwwwwwwww00", // 9
    ],[
        //        1
        //23456789012345
        "00000bbbbb00000", // 1
        "000bbbwRwbbb000", // 2
        "00bbwwwRwwwbb00", // 3
        "0bbRwwRRRwwRbb0", // 4
        "0bwRRRRRRRRRwb0", // 5
        "bbwwRRRwwRRwwbb", // 6
        "bwwwRRRwwRRwwwb", // 7
        "bwwRRRRwwRRRwwb", // 8
        "bRRRRRRwwRRRRRb", // 9
        "bRRbbbbbbbbRRRb", // 10
        "bbbbPPbPPbPbbbb", // 1
        "0bbPPPbPPbPPbb0", // 2
        "00bPPPPPPPPPb00", // 3
        "00bPPPPPPPPPb00", // 3
        "000bbbbbbbbb000", // 5
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


    constructor(x = 127, y = 380) {
        super(x, y, Hero.frame, Hero.dyingFrames, spriteConfig.pixelSize);

        this.speed = 300;

        this.level = 1;
        this.score = 0;
        this.lives = spriteConfig.heroLives;

        this.setSpriteColor(spriteConfig.playerColor);
        this.pixelSize = spriteConfig.pixelSize;
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

    incLevel() {
        this.level++;
    }

    resetLevel() {
        this.level = 0;
    }

    update(deltaTime, keyboardInput, tileMap) {
        super.update(deltaTime);

        if (keyboardInput.isKeyDown('ArrowLeft')) {
            this.velocityX = -this.speed;
        } else if (keyboardInput.isKeyDown('ArrowRight')) {
            this.velocityX = this.speed;
        } else {
            this.velocityX = 0;
        }

        if (keyboardInput.isKeyPressed('Space')) {
        }

        tileMap.update(deltaTime, this);

        // keep on screen
        if (this.x <= 0 || this.x >= canvasConfig.width - this.width) {
            this.x = Math.max(0, Math.min(canvasConfig.width - this.width, this.x));
        }
    }

    draw() {
        super.draw();
    }
}

export default Hero;
