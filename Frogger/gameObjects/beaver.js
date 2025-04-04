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
        const width = 84;
        const height = 33;

        super(x, y,
            './assets/images/snake_sprite_84w_33h_4f.png',//spritePath
            0, 0,//spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.5,//pixelSize,
            'black',//transparentColor,
            'snake',//gameObjectType, 
            velocityX, velocityY
        );

        this.type = 'snake';
        this.frame = Math.floor(Math.random() * 4);
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

        if (this.counter++ > 8) {
            this.counter = 0;
            this.frame++;
            if (this.frame > 3) {
                this.frame = 0;
            }
            this.spriteX = this.width * this.frame;
        }
    }
}

export default Beaver;
