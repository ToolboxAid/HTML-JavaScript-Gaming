// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// laser.js

import ObjectDynamic from '../scripts/objectDynamic.js';
import { canvasConfig, spriteConfig } from './global.js';

import CanvasUtils from '../scripts/canvas.js';
import Sprite from '../scripts/sprite.js';
class Laser extends ObjectDynamic {


    static livingFrames =
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
        ];

    constructor(x, y) {
        const dimensions = Sprite.getWidthHeight(Laser.livingFrames, window.pixelSize);
        super(x, y, dimensions.width, dimensions.height);
        this.velocityY = -spriteConfig.laserVelocityY;
        this.score = 0;
        this.pixelSize = 3.0;
        this.livingFrames = Laser.livingFrames;
        this.currentFrameIndex = 0;
    }

    draw() {
        CanvasUtils.drawSprite(this.x, this.y, this.livingFrames, this.pixelSize, spriteConfig.laserColor);  // no [0] for single dimension arrays
    }

    update(deltaTime = 1) {
        super.update(deltaTime);

        //canvasConfig.width
        console
        if (this.y <= 0 || this.y > canvasConfig.height ||
            this.x <= 0 || this.x > canvasConfig.width
        ) {
            return true;
        }
        return false;
    }
}

export default Laser;
