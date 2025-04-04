// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// LogLRG.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';

class LogLRG extends GameObject {
    // - Type (LogLRG)
    // - Sprite management
    // - Position updates

    constructor(x, y, 
        velocityX, velocityY) {
        const width = 60*5;
        const height = 30;
        const spriteX = 60 * 5;
        const spriteY = 0;
      
        super(x, y,
            './assets/images/log_sprite_60w_30h_10f.png',//spritePath
            spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.5,//pixelSize,
            'black',//transparentColor,
            'LogLRG',//gameObjectType, 
            velocityX, velocityY
        );

        this.type = 'LogLRG';
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

export default LogLRG;
