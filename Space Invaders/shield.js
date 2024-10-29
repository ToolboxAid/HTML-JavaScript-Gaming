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
        let shieldHit = false;

let offsetX = Math.round((enemyBomb.x - this.x)/window.pixelSize);
let offsetY = Math.round((enemyBomb.y - this.y)/window.pixelSize);

console.log("Offset ", offsetX, offsetY);

let stg = "";
    console.log(enemyBomb);
        for (let i = 0; i < enemyBomb.frame.length; i++) {
            stg = "";
            for (let j = 0; j < enemyBomb.frame[i].length; j++) {
                stg += enemyBomb.frame[i][j];
            }
            console.log(stg);
        }  


// frame.length gives you the number of rows (height).
// frame[i].length gives you the number of columns (width) for the i-th row.
console.log(enemyBomb);
console.log("c Height:; "+this.frame.length + " r Width: " + this.frame[0].length)
for (let c = 0; c < this.frame.length; c++) {  // c for rows (height)
    let stg = "";
    for (let r = 0; r < this.frame[0].length; r++) {  // r for columns (width)
        const c1 = c ;/// window.pixelSize;
        const r1 = r ;/// window.pixelSize;
        stg += this.frame[c][r];  // Access the current cell
        if (r1 >= offsetX && r1 <= offsetX + (3)) {
            this.frame[c1][r1] = 'R';  // Change value to 'Y' if the column index is 10
        }
    }
    console.log(stg);  // Log the current column string
}          
this.frame[0][2] = 'Y';
// this.frame


//         const { x: bombX, y: bombY, frame: overlayFrame } = enemyBomb; // Get bomb position and frame
//         const { x: shieldX, y: shieldY } = this; // Get shield position
    

//         overlayFrame.forEach((cell, rowIndex) => {
//             const targetX = Math.round(bombX) - Math.round(shieldX); // Calculate relative X position of the bomb on the shield
//             const targetY = rowIndex + Math.round(bombY) - Math.round(shieldY); // Calculate target Y position


//             // Check bounds and ensure `this.frame[targetY]` exists before accessing `targetX`
//             if (
//                 targetY >= 0 && targetY < this.frame.length &&
//                 targetX >= 0 && targetX < (this.frame[targetY]?.length || 0) &&
//                 cell === "1" && this.frame[targetY][targetX] === "1"
//             ) {
//                 this.frame[targetX][targetY] = "0"; // Apply overlay by setting to '0'
//                 shieldHit = true;
// //console.log("");;    
// console.log(targetX, targetY, this, enemyBomb,'overlay', targetY, targetX);
//             }
//         });
    
        return shieldHit; // Returns true if any part of the shield was hit
    }
    
    
    

    
    

}

export default Shield;
