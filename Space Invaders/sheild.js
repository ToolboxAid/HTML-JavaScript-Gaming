// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// sheild.js

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
    ];

    constructor(x, y) {
        super(x, y);
        this.frame = Shield.frame;
        this.pixelSize = window.pixelSize;
    }

    // Method to draw the shield
    draw(ctx) {
        CanvasUtils.drawSprite(ctx, this.x, this.y, this.frame, this.pixelSize, spriteConfig.sheildColor);
    }
}

export default Shield;
