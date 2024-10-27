// ToolboxAid.com 
// David Quesenberry
// 10/24/2024
// shield.js

import ObjectStatic from '../scripts/objectStatic.js';
import { spriteConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';

// New 22x13 pixel image for the shield (single frame)
class Shield extends ObjectStatic {

    static frame = [
        "0000111111111111111110000",
        "0001111111111111111111000",
        "0011111111111111111111100",
        "0111111111111111111111110",
        "1111111111111111111111111",
        "1111111111111111111111111",
        "1111111111111111111111111",
        "1111111111111111111111111",
        "1111111111111111111111111",
        "1111111111111111111111111",
        "1111111111111111111111111",
        "1111111111111111111111111",
        "1111111111111111111111111",
        "1111111110000000111111111",
        "1111111100000000011111111",
        "1111111000000000001111111",
        "1111110000000000000111111",
        "1111110000000000000111111",
        "1111110000000000000111111",
    ].map(row => row.split("")); // Convert strings to arrays of characters for easy modification

    constructor(x, y) {
        let dimensions = CanvasUtils.spriteWidthHeight(Shield.frame, window.pixelSize);
        super(x, y, dimensions.width, dimensions.height);
        this.frame = Shield.frame.map(row => [...row]); // Clone to avoid modifying the static frame directly
        this.pixelSize = window.pixelSize;
    }

    // Method to draw the shield
    draw(ctx) {
        CanvasUtils.drawSprite(ctx, this.x, this.y, this.frame, this.pixelSize, spriteConfig.shieldColor);
    }

    // Method to overlay another frame from an enemy bomb object, replacing overlapping '1's with '0's
    applyOverlay(enemyBomb) {

    //    console.log("x "+ this.x +" y "+ this.y +" w "+ this.width +" h "+ this.height);

        let shieldHit = false;
        const { x: offsetX, y: offsetY, frames } = enemyBomb;  // Extract frames and position

        // Use the current frame of the enemy bomb
        const overlayFrame = enemyBomb.frame;

        overlayFrame.forEach((row, rowIndex) => {
            row.split("").forEach((cell, colIndex) => {
                const targetY = rowIndex + offsetY - this.y;
                const targetX = colIndex + offsetX - this.x;

                // Check bounds to ensure overlay stays within the shield frame
                if (
                    targetY >= 0 && targetY < this.frame.length &&
                    targetX >= 0 && targetX < this.frame[targetY].length &&
                    cell === "1" && this.frame[targetY][targetX] === "1"
                ) {
                    this.frame[targetY][targetX] = "0"; // Replace overlapping '1's with '0's
                    shieldHit = true;
                }
            });
        });
        return shieldHit;
    }

}

export default Shield;
