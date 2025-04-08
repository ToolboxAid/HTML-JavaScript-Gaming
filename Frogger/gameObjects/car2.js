// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// Car2.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';

class Car2 extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('car2');

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
            1.35,//pixelSize,
            'black',//transparentColor,
            'Car2',//gameObjectType, 
            velocityX, velocityY
        );

        this.frame = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.x > CanvasUtils.getConfigWidth()) {
            //this.x = -(this.width * this.pixelSize);
            this.setIsDead();
        }
    }

    destroy() {
        // Log destruction if debug is enabled
        if (Car2.DEBUG) {
            console.log(`Destroying Car2 at position (${this.x}, ${this.y}, ${this.ID})`);
        }

        // Reset Car2-specific properties
        this.frame = null;

        // Call parent destructor
        return super.destroy();
    }

}

export default Car2;
