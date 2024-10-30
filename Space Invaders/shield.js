// ToolboxAid.com 
// David Quesenberry
// 10/24/2024
// shield.js

import ObjectStatic from '../scripts/objectStatic.js';
import { spriteConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';
import Functions from '../scripts/functions.js';

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

    // Check if enemyBomb or its frame is undefined, and assign a default frame if needed
    // Define a default frame pattern
    static defaultFrame = [
        "010",
        "100",
        "010",
        "001",
        "010",
        "100",
        "010",
        "001",
        "010",
        "100",
        "010",
    ].map(row => row.split("")); // Convert to a 2D array of characters;

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
    applyBigBoom(enemyBomb) {

        const { x: bombX, y: bombY, currentFrameIndex } = enemyBomb || {}; // Get bomb position and Index if defined 
        const { x: shieldX, y: shieldY } = this; // Get shield position

        // Use enemyBomb's frame if it exists; otherwise, use the default frame
        let overlayFrame;
        if (enemyBomb && enemyBomb.frames) {
            if (Array.isArray(enemyBomb.frames[0])) {
                // multi dimension Array
                overlayFrame = enemyBomb.frames[currentFrameIndex].map(row => Array.from(row)); // Use it directly if it's already in the correct format
            } else {
                // single dimention
                overlayFrame = enemyBomb.frames.map(row => Array.from(row)); // Adjust based on actual type
            }
        } else {
            overlayFrame = Shield.defaultFrame; // Fallback to default frame
            console.log("Error: fix overlayFrame", overlayFrame);
        }

        let shieldHit = false;

        // Calculate offset
        let offsetX = Math.round((bombX - shieldX) / window.pixelSize);
        let offsetY = Math.round((bombY - shieldY) / window.pixelSize);

        // overlay shield frame debug
        if (false) {
            console.log(overlayFrame.length, overlayFrame[0].length, this.frame.length, this.frame[0].length, enemyBomb.currentFrameIndex);

            for (let c = 0; c < overlayFrame.length; c++) { // c for rows (height)
                let stg = "";
                for (let r = 0; r < overlayFrame[0].length; r++) { // r for columns (width)
                    stg += overlayFrame[c][r];
                }
                //console.log("stg 1: " + stg);
            }

            for (let c = 0; c < this.frame.length; c++) { // c for rows (height)
                let stg = "";
                for (let r = 0; r < this.frame[0].length; r++) { // r for columns (width)
                    stg += this.frame[c][r];
                }
                //.log("stg 2: " + stg);
            }
        }

        // Loop through the shield frame and apply overlay where needed
        for (let c = 0; c < this.frame.length; c++) { // c for rows (height)
            for (let r = 0; r < this.frame[0].length; r++) { // r for columns (width)
                const targetX = r + offsetX;
                const targetY = c + offsetY;

                // Ensure `targetX` and `targetY` are within bounds and check for overlap with `overlayFrame`
                if (
                    targetX >= 0 && targetX < this.frame[0].length &&
                    targetY >= 0 && targetY < this.frame.length &&
                    overlayFrame[c]?.[r] === "1" &&
                    this.frame[targetY][targetX] === "1"
                ) {
                    shieldHit = true;
                    this.frame[targetY][targetX] = "0"; // Apply overlay by setting to '0'

                    // Apply further destruction pattern
                    const destructionWidth = 2;
                    let destructionPathX1 = Math.max(0, targetX - destructionWidth);
                    let destructionPathX2 = Math.min(this.frame[0].length, targetX + destructionWidth);

                    for (let loop3 = destructionPathX1; loop3 < destructionPathX2; loop3++) {
                        if (this.frame[targetY][loop3] === "1" && Functions.randomGenerator(0, 1, false) > 0.33) {
                            this.frame[targetY][loop3] = '0'; // transparent/blank
                        }
                    }
                }

            }
        }

        return shieldHit; // Returns true if any part of the shield was hit
    }

}

export default Shield;
