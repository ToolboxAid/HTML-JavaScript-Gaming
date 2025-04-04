// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// turtleSink.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';

class TurtleSink extends GameObject {
    // - Type (turtleSink)
    // - Sprite management
    // - Position updates

    constructor(x, y,
        velocityX, velocityY) {
        const width = 45;
        const height = 30;

        super(x, y,
            './assets/images/turtle_sprite_45w_33h_5f.png',//spritePath
            0, 0,//spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.5,//pixelSize,
            'black',//transparentColor,
            'turtleSink',//gameObjectType, 
            velocityX, velocityY
        );

        this.type = 'turtleSink';

        this.frame = 0;
        this.frameDirection = 1;
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
        
        if (this.counter++ > 20) {
            this.counter = 0;
            this.frame += this.frameDirection;
            if (this.frameDirection > 0) {
                if (this.frame > 4) {
                    this.frameDirection = -1;
                }
            }else{
                if (this.frame < 3) {
                    this.frame = 0;
                    this.frameDirection = 1;
                }
            }

            this.spriteX = this.width * this.frame;
        }
    }

}

export default TurtleSink;
