// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemy.js

import ObjectStatic from '../scripts/objectStatic.js'; // Ensure the class is capitalized

import CanvasUtils from '../scripts/canvas.js';


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
            "010000000010",
            "000100001000",
            "000010010000",
            "001000000100",
            "010000000010",
            "000001100000",
        ],
        [
            "000000000000",
            "001001100100",
            "000100001000",
            "000001100000",
            "000100001000",
            "001001100100",
            "000000000000",
        ],
        [
            "000000000000",
            "000100001000",
            "000010010000",
            "000001100000",
            "000010010000",
            "000100001000",
            "000000000000",
        ],
        [
            "000000000000",
            "000000000000",
            "000001100000",
            "000000000000",
            "000001100000",
            "000000000000",
            "000000000000",
        ]

    ];

    constructor(x, y, frames) {
        const dimensions = CanvasUtils.spriteWidthHeight(frames[0], window.pixelSize);
        super(x, y, dimensions.width, dimensions.height);
        this.state = Enemy.Status.ALIVE;
        this.pixelSize = window.pixelSize;
        this.frames = frames;
        this.currentFrameIndex = 0;

        // disable move enemy to next line.
        this.doDrop = false;
        this.dropDelay = -1;
        this.dropTime = 0;

        this.dyingDelay = 0;
    }

    static changeDirections() {
        Enemy.direction *= -1;
    }

    static setSpeed(speed) {
        Enemy.speed = speed;
        //       console.log("Enemy.speed " + Enemy.speed + " " + speed);
    }

    setDropTimer(dropDelay) {
        this.doDrop = true;
        this.dropTime = Date.now() + dropDelay;
    }

    static deadModulue = 4;
    static frameCount = 3;
    update(delta = 1) {
        if (Date.now() >= this.dropTime && this.doDrop) {
            this.y += this.height;  // Drop by the height value
            this.dropTime = Date.now() + this.dropDelay; // Set the next drop time
            this.doDrop = false;
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

            const updatesPerFrame = 10;
            //this.totalUpdates / this.frames;
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

    nextFrame1() {
        let atBounds = false;
        this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;

        this.x += (Enemy.move + Enemy.speed) * Enemy.direction;
        //       console.log(Enemy.speed);

        if (Enemy.direction > 0) {
            // check right
            if (this.x + (this.width * 1.45) + Enemy.speed > window.gameAreaWidth) {
                if (!atBounds) {
                    atBounds = true;
                }
            }
        } else {
            // check left
            if (this.x - Enemy.speed < (this.width * 0.25)) {
                if (!atBounds) {
                    atBounds = true;
                }
            }
        }
        return atBounds;
    }
}

export default Enemy;
