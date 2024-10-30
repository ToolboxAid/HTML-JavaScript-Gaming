// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemy.js

import ObjectStatic from '../scripts/objectStatic.js'; // Ensure the class is capitalized
import CanvasUtils from '../scripts/canvas.js';
import Functions from '../scripts/functions.js';

class Enemy extends ObjectStatic {
    static direction = 1;
    static move = 10;
    static speed = 0;

    static Status = Object.freeze({
        ALIVE: 'alive',
        DYING: 'dying',
        DEAD: 'dead'
    });

    static dyingFrames = [
        [
            "000001100000",
            "010011110010",
            "000111111000",
            "001011111100",
            "011111111110",
            "010111111010",
            "000001100000",
        ],
        [
            "000000000000",
            "001001100100",
            "010111111010",
            "001111111100",
            "010111111010",
            "001001100100",
            "000000000000",
        ],
        [
            "000000000000",
            "000110011000",
            "000101010000",
            "000011110000",
            "000010010000",
            "000000000000",
            "000000000000",
        ],
        [
            "000000000000",
            "000000000000",
            "000001100000",
            "000000100000",
            "000000000000",
            "000000000000",
            "000000000000",
        ]
    ];

    constructor(x, y, frames, bombAggression) {
        const dimensions = CanvasUtils.spriteWidthHeight(frames[0], window.pixelSize);
        super(x, y, dimensions.width, dimensions.height);
        this.state = Enemy.Status.ALIVE;
        this.pixelSize = window.pixelSize;
        this.frames = frames;
        this.currentFrameIndex = 0;

        // disable move enemy to next line.
        this.doMoveDown = false;
        this.moveDownDelay = 0;
        this.moveDownTime = 0;

        this.dyingDelay = 0;

        this.bombAggression = 3 + (bombAggression * 2);
    }

    static changeDirections() {
        Enemy.direction *= -1;
    }

    static setSpeed(speed) {
        Enemy.speed = speed;
    }

    getDropBomb() {
        const number = Functions.randomGenerator(0, 10000, true);
        return (number <= this.bombAggression);
    }

    update(delta = 1) {
        this.y += 1;
    }

    setMoveDownTimer(moveDownDelay) {
        this.doMoveDown = true;
        this.moveDownTime = Date.now() + moveDownDelay;
    }

    static deadModulue = 4;
    static frameCount = 3;
    update(delta = 1) {
        if (Date.now() >= this.moveDownTime && this.doMoveDown) {
            this.y += this.height;  // Drop by the height value
            this.moveDownTime = Date.now() + this.moveDownDelay; // Set the next drop time
            this.doMoveDown = false;
        }
        if (this.state === Enemy.Status.DYING) {
            if (this.dyingDelay++ >= Enemy.deadModulue * Enemy.frameCount) {
                this.state = Enemy.Status.DEAD
            }
        }
    }

    isDead() {
        return this.state === Enemy.Status.DEAD;
    }

    setHit() {
        this.state = Enemy.Status.DYING;
    }

    // Method to draw the current frame
    draw(ctx, spriteColor = "#888888") {
        if (!this.frames || this.frames.length === 0) {
            console.warn("No frames available for drawing");
            return;
        }

        const frame = this.frames[this.currentFrameIndex];

        if (this.state === Enemy.Status.ALIVE) {
            CanvasUtils.drawSprite(ctx, this.x, this.y, frame, this.pixelSize, spriteColor);
        } else if (this.state === Enemy.Status.DYING) {

            let frameNum = Math.floor((this.dyingDelay / Enemy.deadModulue) % Enemy.frameCount);
            CanvasUtils.drawSprite(ctx, this.x, this.y, Enemy.dyingFrames[frameNum], this.pixelSize, spriteColor);
        }
    }

    // Method to switch to the next frame
    nextFrame() {
        this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
        this.x += (Enemy.move + Enemy.speed) * Enemy.direction;

        const atRightBound = Enemy.direction > 0 && this.x + (this.width * 1.45) + Enemy.speed > window.gameAreaWidth;
        const atLeftBound = Enemy.direction < 0 && this.x - Enemy.speed < (this.width * 0.25);

        return atRightBound || atLeftBound;
    }

}

export default Enemy;
