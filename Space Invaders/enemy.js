// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemy.js

import ObjectStatic from '../scripts/objectStatic.js'; // Ensure the class is capitalized

import CanvasUtils from '../scripts/canvas.js';

class Enemy extends ObjectStatic {
    constructor(x, y, frames, dropDelay = -1) { // Default value added
        super(x, y);
        this.height = 40;
        this.width = 40;
        this.frames = frames;
        this.currentFrameIndex = 0;
//        this.pixelSize = Math.ceil(window.pixelSize);
        this.pixelSize = window.pixelSize;

        // move enemy to next line.
        this.doDrop = false;
        this.dropDelay = dropDelay; // dropDelay should now default to 5000 if not provided
        this.dropTime = 0;
    }


    setDropTimer() {
        this.doDrop = true;
        this.dropTime = Date.now() + this.dropDelay;
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
        //const sheildColor = spriteConfig.sheildColor;

        const frame = this.frames[this.currentFrameIndex];
        CanvasUtils.drawSprite(ctx, this.x, this.y, frame, this.pixelSize);
    }

    // Method to switch to the next frame
    nextFrame() {
        this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
    }
}

export default Enemy;
