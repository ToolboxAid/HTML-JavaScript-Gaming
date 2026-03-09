// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// aligator.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';

class Aligator extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('aligator');

    // - Type (aligator)
    // - Sprite management
    // - Position updates

    constructor(x, y,
        velocityX, velocityY) {
        const width = 48 * 3;
        const height = 48;

        super(x, y,
            './assets/images/aligator_sprite_48w_48h_6f.png',//spritePath
            0, 0,//spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.35,//pixelSize,
            'black',//transparentColor,
            'aligator',//gameObjectType, 
            velocityX, velocityY
        );

        this.frame = 0;
        this.counter = 0;
    }

    setBite() {
        this.spriteX += this.width * 3;
    }

    update(deltaTime) {
        super.update(deltaTime);

        // moving right
        if (this.x > CanvasUtils.getConfigWidth()) {
            this.setIsDead();
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

    destroy() {
        if (Aligator.DEBUG) {
            console.log(`Destroying Aligator`, {
                id: this.ID,
                position: { x: this.x, y: this.y },
                frame: this.frame,
                counter: this.counter,
                sprite: { x: this.spriteX, width: this.width }
            });
        }
    
        // Store values for final logging
        const finalState = {
            id: this.ID,
            type: this.type,
            position: { x: this.x, y: this.y },
            frame: this.frame,
            counter: this.counter
        };
    
        // Clean up Aligator-specific properties
        this.frame = null;
        this.counter = null;
    
        // Call parent destroy
        const parentDestroyed = super.destroy();
        if (!parentDestroyed) {
            console.error('Parent GameObject destruction failed:', {
                id: this.ID,
                type: this.type
            });
            return false;
        }
    
        if (Aligator.DEBUG) {
            console.log(`Successfully destroyed Aligator`, finalState);
        }
    
        return true;
    }

}

export default Aligator;
