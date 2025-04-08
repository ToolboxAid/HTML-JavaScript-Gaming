// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// Truck.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';

class Truck extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('truck');

    // - Type (Truck)
    // - Sprite management
    // - Position updates

    constructor(x, y, 
        velocityX, velocityY) {
        const width = 48*2;
        const height = 42;
        const spriteX = 48*2;
        const spriteY = 0;
      
        super(x, y,
            './assets/images/vehicles_sprite_48w_42h_6f.png',//spritePath
            spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.35,//pixelSize,
            'black',//transparentColor,
            'Truck',//gameObjectType, 
            velocityX, velocityY
        );

        this.frame = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.velocityX < 0) {// moving left
            if (this.x + (this.width * this.pixelSize) < 0) {
                this.setIsDead();
            }
        } 
    }

    destroy() {
        if (Truck.DEBUG) {
            console.log(`Destroying Truck`, {
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
    
        // Clean up Truck-specific properties
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
    
        if (Truck.DEBUG) {
            console.log(`Successfully destroyed Truck`, finalState);
        }
    
        return true;
    }

}

export default Truck;
