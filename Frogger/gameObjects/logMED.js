// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// LogMED.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';

class LogMED extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('LogMED');

    // - Type (LogMED)
    // - Sprite management
    // - Position updates

    constructor(x, y,
        velocityX, velocityY) {
        const spriteX = 60 * 2;
        const spriteY = 0;
        const width = 60 * 3;
        const height = 30;


        super(x, y,
            './assets/images/log_sprite_60w_30h_10f.png',//spritePath
            spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.35,//pixelSize,
            'black',//transparentColor,
            'LogMED',//gameObjectType, 
            velocityX, velocityY
        );

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

    destroy() {
        try {
            if (LogMED.DEBUG) {
                console.log(`Destroying LogMED`, {
                    id: this.ID,
                    position: { x: this.x, y: this.y },
                    frame: this.frame,
                    velocity: { x: this.velocityX, y: this.velocityY }
                });
            }
    
            // Clean up LogMED-specific properties
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
    
            return true;
    
        } catch (error) {
            console.error('Error during LogMED destruction:', {
                error: error.message,
                stack: error.stack,
                id: this.ID
            });
            return false;
        }
    }

}

export default LogMED;
