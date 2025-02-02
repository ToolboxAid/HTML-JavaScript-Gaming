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
        const pixelSize = spriteConfig.pixelSize || 1;
        const dimensions = Sprite.getWidthHeight(Laser.livingFrames, pixelSize);
        super(x, y, dimensions.width, dimensions.height);
        this.setVelocity(0, -spriteConfig.laserVelocityY);
        this.score = 0;
        this.pixelSize = pixelSize;
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

    destroy() {
        super.destroy();
        this.score = null;
        this.pixelSize = null;
        this.livingFrames = null;
        this.currentFrameIndex = null;
    }

}

export default Laser;
