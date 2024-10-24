// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// sheild.js

import ObjectStatic from '../scripts/objectStatic.js';
import { spriteConfig } from './global.js';

// New 22x13 pixel image for the shield (single frame)
const frame = [
    "00011111111111111111111000",
    "00111111111111111111111100",
    "01111111111111111111111110",
    "11111111111111111111111111",
    "11111111111111111111111111",
    "11111111111111111111111111",
    "11111111111111111111111111",
    "11111111111111111111111111",
    "11111111111111111111111111",
    "11111111111111111111111111",
    "11111111111111111111111111",
    "11111110000000000001111111",
    "11111100000000000000111111",
    "11111000000000000000011111",
    "11111000000000000000011111",
    "11111000000000000000011111",
];

class Shield extends ObjectStatic {
    constructor(x, y) {
        super(x, y); // Call the parent class constructor
        this.frame = frame; // Assign the single frame to this object
        this.pixelSize = window.pixelSize;
    }

    // Method to draw the shield
    draw(ctx) {
        for (let row = 0; row < this.frame.length; row++) {
            for (let col = 0; col < this.frame[row].length; col++) {
                const pixel = this.frame[row][col];
                const color = pixel === '1' ? spriteConfig.sheildColor : 'transparent';
                ctx.fillStyle = color;
                ctx.fillRect((col * this.pixelSize) + this.x, (row * this.pixelSize) + this.y, this.pixelSize, this.pixelSize);
            }
        }
    }
}

export default Shield;
