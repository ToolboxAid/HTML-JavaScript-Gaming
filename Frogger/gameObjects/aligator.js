// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// aligator.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';

class Aligator extends GameObject {
    // - Type (aligator)
    // - Sprite management
    // - Position updates

    constructor(x, y,
        velocityX, velocityY) {
        const width = 48*3;
        const height = 48;

        super(x, y,
            './assets/images/aligator_sprite_48w_48h_6f.png',//spritePath
            0, 0,//spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.5,//pixelSize,
            'black',//transparentColor,
            'aligator',//gameObjectType, 
            velocityX, velocityY
        );

        this.type = 'aligator';

        this.frame = 0;
        this.counter = 0;
    }

    setBite(){
        this.spriteX += this.width*3;
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

export default Aligator;
