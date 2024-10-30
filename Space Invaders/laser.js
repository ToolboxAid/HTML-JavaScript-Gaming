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
        "1",
        "1",
        "1",
    ];    

    constructor(x, y) {
        const dimensions = CanvasUtils.spriteWidthHeight(Laser.frame, window.pixelSize);
        super(x, y, dimensions.width, dimensions.height, 0, -600);
        this.score = 0;
        this.pixelSize = 3.0;
        this.frame = Laser.frame;
    }

    draw(ctx) {
        CanvasUtils.drawSprite(ctx, this.x, this.y, Laser.frame, this.pixelSize);
    }

    update(deltaTime = 1) {
        super.update(deltaTime);

        if (this.y <= 0 || this.y > 1000 ||
            this.x <= 0 || this.x > 1000
        ) {
            return true;
        }
        return false;
    }
}

export default Laser;