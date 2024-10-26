// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemy.js

import ObjectStatic from '../scripts/objectStatic.js'; // Ensure the class is capitalized

import CanvasUtils from '../scripts/canvas.js';

class Enemy extends ObjectStatic {
    static move = 10;
    static flipFlop = false;
    constructor(x, y, frames) {
        const width = window.pixelSize * frames[0][0].length;;
        const height = window.pixelSize * frames[0].length;

        super(x, y, width, height);
        this.pixelSize = window.pixelSize;
        this.frames = frames;
        this.currentFrameIndex = 0;

        // disable move enemy to next line.
        this.doDrop = false;
        this.dropDelay = -1;
        this.dropTime = 0;
    }

    setDropTimer(dropDelay) {
        this.doDrop = true;
        this.dropTime = Date.now() + dropDelay;
    }

    update() {
        if (Date.now() >= this.dropTime && this.doDrop) {
            this.y += this.height;  // Drop by the height value
            this.dropTime = Date.now() + this.dropDelay; // Set the next drop time
            this.doDrop = false;
        }
    }

    // Method to draw the current frame
    draw(ctx, spriteColor = "#888888") {
        const frame = this.frames[this.currentFrameIndex];
        CanvasUtils.drawSprite(ctx, this.x, this.y, frame, this.pixelSize);
        CanvasUtils.drawBounds(ctx, this.x, this.y, this.width, this.height, 'yellow', 3);
    }

    // Method to switch to the next frame
    nextFrame() {
        this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
//        this.x += Enemy.move;
        if (this.x < 10 || this.x + this.width +10 > window.gameAreaWidth) {
            this.setDropTimer();
            if (Enemy.flipFlop == false) {
                Enemy.flipFlop = true;
            }
        }
    }
}

export default Enemy;
