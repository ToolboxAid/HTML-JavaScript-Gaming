// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemy.js

import ObjectStatic from '../scripts/objectStatic.js'; // Ensure the class is capitalized

import CanvasUtils from '../scripts/canvas.js';

class Enemy extends ObjectStatic {
    static move = 10;
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

    static changeDirections(){
        Enemy.move*=-1;
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
        CanvasUtils.drawSprite(ctx, this.x, this.y, frame, this.pixelSize,spriteColor);
    }

    // Method to switch to the next frame
    nextFrame() {
        let atBounds = false;
        this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
        this.x += Enemy.move;

        if (Enemy.move>0){
            // check right
            if (this.x + (this.width * 1.45) > window.gameAreaWidth) {
                if (!atBounds) {
                    atBounds = true;
                }
            }
        }else {
            // check left
            if (this.x < (this.width * 0.25) ) {
                if (!atBounds) {
                    atBounds = true;
                }
            }
        }
        return atBounds;
    }
}

export default Enemy;
