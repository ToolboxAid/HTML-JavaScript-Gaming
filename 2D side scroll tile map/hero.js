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
        super(x, y, Hero.frame, Hero.dyingFrames);

        this.speed = 300;

        this.level = 1;
        this.score = 0;
        this.lives = spriteConfig.heroLives;

        this.setSpriteColor(spriteConfig.heroColor);
        this.pixelSize = spriteConfig.pixelSize;

        this.scrollPos = 0;
        this.tileSetWidth = 0;
        this.canvasMidPoint = 0;
        this.scrollMax = 0;
    }


    setTileMapInfo(tileSetWidth, canvasMidPoint, scrollMax, scrollPos = 0) {
        this.scrollPos = scrollPos;
        this.tileSetWidth = tileSetWidth;
        this.canvasMidPoint = canvasMidPoint;
        this.scrollMax = scrollMax;
    }

    getScrollPos() {
        return this.scrollPos;
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



    update(deltaTime, keyboardInput) {
        super.update(deltaTime);

        // console.log("Tile Set Width:", this.tileSetWidth);
        // console.log("Canvas Mid Point:" ,this.canvasMidPoint);
        // console.log("Max Scroll:" ,this.scrollMax);



        if (keyboardInput.isKeyDown('ArrowLeft')) {
            this.velocityX = -this.speed;
        } else if (keyboardInput.isKeyDown('ArrowRight')) {
            this.velocityX = this.speed;
        } else {
            this.velocityX = 0;
        }

        if (this.velocityX > 0
            && this.x > this.canvasMidPoint
        ) {
            if (this.scrollPos < this.scrollMax) {
                this.scrollPos += this.velocityX * deltaTime;
                this.velocityX = 0;
            }
        } else {
            if (this.velocityX < 0
                && this.x < this.canvasMidPoint
            ) {
                if (this.scrollPos > 0) {
                    this.scrollPos += this.velocityX * deltaTime;
                    this.velocityX = 0;
                }
            }
        }

        if (keyboardInput.isKeyPressed('Space')) {
        }

        // keep on screen
        if (this.x <= 0 || this.x >= canvasConfig.width - this.width) {
            this.x = Math.max(0, Math.min(canvasConfig.width - this.width, this.x));
        }
    }

    draw() {
        super.draw(0, 0);

        if (true) {
            CanvasUtils.ctx.fillStyle = "white";
            CanvasUtils.ctx.font = "30px Arial";
            CanvasUtils.ctx.fillText(this.x, 50, 100);
            CanvasUtils.ctx.fillText(this.scrollPos, 50, 150);
            CanvasUtils.ctx.fillText(this.scrollMax, 50, 200);
        }
    }
}

export default Hero;
