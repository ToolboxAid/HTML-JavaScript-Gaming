// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// Dozer.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';
import SystemUtils from '../../scripts/utils/systemUtils.js';

class Dozer extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('dozer');

    // - Type (Dozer)
    // - Sprite management
    // - Position updates

    constructor(x, y,
        velocityX, velocityY) {
        const width = 48;
        const height = 42;
        const spriteX = 48;
        const spriteY = 0;

        super(x, y,
            './assets/images/vehicles_sprite_48w_42h_6f.png',//spritePath
            spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.35,//pixelSize,
            'black',//transparentColor,
            'Dozer',//gameObjectType, 
            velocityX, velocityY
        );

        this.frame = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        // moving right
        if (this.x > CanvasUtils.getConfigWidth()) {
            this.setIsDead();
        }
    }

    destroy() {
        if (Dozer.DEBUG) {
            console.log(`Destroying Dozer`, {
                id: this.ID,
                position: { x: this.x, y: this.y },
                frame: this.frame,
                velocity: { x: this.velocityX, y: this.velocityY }
            });
        }

        // Store values for final logging
        const finalState = {
            id: this.ID,
            type: this.type,
            position: { x: this.x, y: this.y },
            frame: this.frame
        };

        // Clean up Dozer-specific properties
        this.frame = null;

        // Call parent destroy
        const parentDestroyed = super.destroy();
        if (!parentDestroyed) {
            console.error('Parent GameObject destruction failed:', {
                id: this.ID,
                type: this.type
            });
            return false;
        }

        if (Dozer.DEBUG) {
            console.log(`Successfully destroyed Dozer`, finalState);
        }

        return true;
    }

}

export default Dozer;
