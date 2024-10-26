// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// player.js

import ObjectDynamic from '../scripts/objectDynamic.js';
import { spriteConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';



class Player extends ObjectDynamic {

    // New 22x16 pixel image (single frame)
static frame = [
    "00000000100000000",
    "00000001110000000",
    "00000011111000000",
    "00000011111000000",
    "00111111111111100",
    "01111111111111110",
    "11111111111111111",
    "11111111111111111",
    "11111111111111111",
    "11111111111111111",
    "11111111111111111"
];

    constructor(x, y) {
        super(x, y);
        this.score = 0;
        this.lives = 3;
        this.pixelSize = 3.0;
        // this.pixelSize = Math.ceil(window.pixelSize);
        // spriteConfig.pixelSize; //window.pixelSize;
    }

    draw(ctx) {
        CanvasUtils.drawSprite(ctx, this.x, this.y, Player.frame, this.pixelSize);
    }
}

export default Player;
