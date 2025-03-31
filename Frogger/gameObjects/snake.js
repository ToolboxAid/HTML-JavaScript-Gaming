// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// snake.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';

class Snake extends GameObject {
    // - Type (snake)
    // - Speed/direction
    // - Sprite management
    // - Position updates

    constructor(x, y, speed, direction, velocityX, velocityY) {
        // x, y, 
        // spritePath, 
        // spriteX, spriteY,
        // spriteWidth, spriteHeight,
        // pixelSize,
        // transparentColor,
        // gameObjectType, direction, speed

        /*
                    snake: {
                offsetY: -15,
                sprite: './assets/images/snake_sprite_84w_33h_4f.png',
                spriteX: 0,
                spriteY: 0,
                width: 84,
                height: 33,
                speed: 2
            },
            */

        const width = 84;
        const height = 33;

        super(x, y,
            './assets/images/snake_sprite_84w_33h_4f.png',//spritePath
            0, 0,//spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.5,//pixelSize,
            'black',//transparentColor,
            'snake',//gameObjectType, 
            direction,
            0,//speed,            
            velocityX, velocityY
        );

        this.type = 'snake';
        this.frame = 0;
        this.counter = 0;
    }

    update() {
        super.update(0.1);
        this.x += this.speed;

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
    draw() {
        super.draw();
    }
}

export default Snake;
