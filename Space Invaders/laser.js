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
        super(x, y, 1, 10);
        this.score = 0;
        this.pixelSize = 3.0;
        this.frame = Laser.frame;
        this.velocity = 600;
    }

    draw(ctx) {
        CanvasUtils.drawSprite(ctx, this.x, this.y, Laser.frame, this.pixelSize);
    }

    update(deltaTime = 1) {
        //console.log(deltaTime);
        this.y -= this.velocity * deltaTime; // Update y position

        // const speed = 11;
        // let oldY = this.y;
        // this.y -= speed;

        // console.log(oldY + " " + this.y);
        console.log(this.y + " " + this.velocity + " " + deltaTime);
        if (this.y <= 0) {
            return true;
        }
        return false;
    }
}

export default Laser;
