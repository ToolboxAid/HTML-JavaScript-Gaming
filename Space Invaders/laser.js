// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// laser.js

import ObjectDynamic from '../scripts/objectDynamic.js';
import { canvasConfig, spriteConfig } from './global.js';

import CanvasUtils from '../scripts/canvas.js';

class Laser extends ObjectDynamic {


    static frames = [
        [
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
            "1",
            "1",
            "1",
        ],
        [
            "1",
            "0",
            "1",
            "0",
            "1",
            "0",
            "1",
            "0",
            "1",
            "0",
            "1",
            "0",
            "1",
        ],
    ]

    constructor(x, y) {
        const dimensions = CanvasUtils.spriteWidthHeight(Laser.frames[0], window.pixelSize);
        super(x, y, dimensions.width, dimensions.height, 0, -600);
        this.score = 0;
        this.pixelSize = 3.0;
        this.frames = Laser.frames;
        this.currentFrameIndex = 0;
    }

    draw(ctx) {
        CanvasUtils.drawSprite(ctx, this.x, this.y, Laser.frames[0], this.pixelSize);
    }

    update(deltaTime = 1) {
        super.update(deltaTime);

        if (this.y <= 0 || this.y > canvasConfig.width ||
            this.x <= 0 || this.x > canvasConfig.height
        ) {
            return true;
        }
        return false;
    }
}

export default Laser;
