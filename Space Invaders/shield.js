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
        const { x: bombX, y: bombY, frame: overlayFrame } = enemyBomb; // Get bomb position and frame
        const { x: shieldX, y: shieldY } = this; // Get shield position
        let shieldHit = false;

        // Calculate offset
        let offsetX = Math.round((bombX - shieldX) / window.pixelSize);
        let offsetY = Math.round((bombY - shieldY) / window.pixelSize);

        // Log enemyBomb frame (each row in `overlayFrame` is a string)
        overlayFrame.forEach(row => console.log(row));

        // Loop through the shield frame and apply overlay where needed
        for (let c = 0; c < this.frame.length; c++) { // c for rows (height)
            let stg = "";
            for (let r = 0; r < this.frame[0].length; r++) { // r for columns (width)


                const targetX = r + offsetX;
                const targetY = c + offsetY;

                // Ensure `targetX` and `targetY` are within bounds and check for overlap with `overlayFrame`
                if (
                    // X (horizontal) = this.frame[0].length
                    // Y (vertical) = this.frame.length

                    targetX >= 0 && targetX < this.frame[0].length &&
                    targetY >= 0 && targetY < this.frame.length &&
                    overlayFrame[c]?.[r] === "1" &&
                    // documented because this is backwards from other languages are.
                    // The first index (targetY) represents the row (top to bottom), so it corresponds to the Y-axis (vertical).
                    // The second index (targetX) represents the column (left to right), so it corresponds to the X-axis (horizontal).
                    this.frame[targetY][targetX] === "1"
                ) {
                    shieldHit = true;

                    this.frame[targetY][targetX] = "0"; // Apply overlay by setting to '0'

                    const distructionWidth = 2;
                    let distructionPathX1 = targetX - distructionWidth;
                    if (distructionPathX1 < 0) { distructionPathX1 = 0; }
                    if (distructionPathX1 > this.frame[0].length) { distructionPathX1 = this.frame[0].length; }

                    let distructionPathX2 = targetX + distructionWidth;
                    if (distructionPathX2 < 0) { distructionPathX2 = 0; }
                    if (distructionPathX2 > this.frame[0].length) { distructionPathX2 = this.frame[0].length; }

                    for (let loop3 = distructionPathX1; loop3 < distructionPathX2; loop3++) {
                        console.log(loop3);
                        if (this.frame[targetY][loop3] === "1") {
                            if (Functions.randomGenerator(0, 1, false) > 0.33) { // replace 66% of the 1's with 0's
                                this.frame[targetY][loop3] = '0';// transparent/blank
                            }
                        }
                    }


                }
                stg += this.frame[c][r];  // Access the current cell
            }
            console.log(stg);  // Log the current row string
        }

        return shieldHit; // Returns true if any part of the shield was hit
    }









}

export default Shield;
