// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemy.js

import ObjectStatic from '../scripts/objectStatic.js'; // Ensure the class is capitalized

class Enemy extends ObjectStatic {
    constructor(x, y, frames, dropDelay = -1) { // Default value added
        super(x, y);
        this.height = 40;
        this.width = 40;
        this.frames = frames;
        this.currentFrameIndex = 0;
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
        for (let row = 0; row < frame.length; row++) {
            for (let col = 0; col < frame[row].length; col++) {
                const pixel = frame[row][col];
                const color = pixel === '1' ? spriteColor : 'transparent'; // Color green for '1' and transparent for '0'
                ctx.fillStyle = color;
                ctx.fillRect((col * this.pixelSize) + this.x, (row * this.pixelSize) + this.y, this.pixelSize, this.pixelSize);
            }
        }
    }

    // Method to switch to the next frame
    nextFrame() {
        this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
    }
}

export default Enemy;
