// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// player.js

import ObjectDynamic from '../scripts/objectDynamic.js';
import { spriteConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';

// New 22x16 pixel image (single frame)
const frame = [
    "00000000000100000000000",
    "00000000001110000000000",
    "00000000011111000000000",
    "00000000011111000000000",
    "00000000011111000000000",
    "00111111111111111111100",
    "01111111111111111111110",
    "11111111111111111111111",
    "11111111111111111111111",
    "11111111111111111111111",
    "11111111111111111111111",
    "11111111111111111111111",
    "11111111111111111111111"
];

class Player extends ObjectDynamic {
    constructor(x, y) {
        super(x, y); // Call the parent class constructor
        this.frame = frame; // Assign the single frame to this object
        this.score = 0; // Initialize score

        this.pixelSize = window.pixelSize;
    }

    draw(ctx) {
        CanvasUtils.spriteDrawer(ctx, this.x, this.y, this.frame, this.pixelSize);
    }
}

export default Player;
