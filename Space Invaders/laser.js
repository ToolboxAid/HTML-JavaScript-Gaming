// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// laser.js

import ObjectDynamic from '../scripts/objectDynamic.js';
import { canvasConfig, spriteConfig } from './global.js';

import CanvasUtils from '../scripts/canvas.js';

class Laser extends ObjectDynamic {

    static frame = [
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
    ];

    constructor(x, y) {
        super(x, y, 2, 2);
        this.score = 0;
        this.pixelSize = 3.0;
    }

    draw(ctx) {
        CanvasUtils.drawSprite(ctx, this.x, this.y, Laser.frame, this.pixelSize);
    }

    update(keysPressed, keyJustPressed) {
        const speed = 11;
        this.y -= speed;
        if (this.y < 0) {
            return true;
        }
        return false;
    }
}

export default Laser;
