// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// beaver.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';

class Beaver extends GameObject {
    // - Type (beaver)
    // - Sprite management
    // - Position updates

    constructor(x, y,
        velocityX, velocityY) {
        const width = 48;
        const height = 48;

        super(x, y,
            './assets/images/beaver_sprite_48w_48h_2f.png',//spritePath
            0, 0,//spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.5,//pixelSize,
            'black',//transparentColor,
            'beaver',//gameObjectType, 
            velocityX, velocityY
        );

        this.type = 'beaver';

        this.frame = 0;
        this.counter = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.velocityX < 0) {// moving left
            if (this.x + (this.width * this.pixelSize) < 0) {
                this.x = CanvasUtils.getConfigWidth() + (this.width * this.pixelSize);
            }
        } else {// moving right
            if (this.x > CanvasUtils.getConfigWidth()) {
                this.x = -(this.width * this.pixelSize);
            }
        }

        if (this.counter++ > 40) {
            this.counter = 0;
            this.frame++;
                if (this.frame > 1) {
                    this.frame = 0;
                }
            this.spriteX = this.width * this.frame;
        }
    }

}

export default Beaver;
