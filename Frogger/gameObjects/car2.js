// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// Car2.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';

class Car2 extends GameObject {
    // - Type (Car2)
    // - Sprite management
    // - Position updates

    constructor(x, y, 
        velocityX, velocityY) {
        const width = 48;
        const height = 42;
        const spriteX = 48 * 5;
        const spriteY = 0;
      
        super(x, y,
            './assets/images/vehicles_sprite_48w_42h_6f.png',//spritePath
            spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.5,//pixelSize,
            'black',//transparentColor,
            'Car2',//gameObjectType, 
            velocityX, velocityY
        );

        this.type = 'Car2';
        this.frame = 0;
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
    }

    draw() {
        super.draw();
    } 

}

export default Car2;
