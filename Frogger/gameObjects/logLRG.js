// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// LogLRG.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';

class LogLRG extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('logLRG');

    // - Type (LogLRG)
    // - Sprite management
    // - Position updates

    constructor(x, y,
        velocityX, velocityY) {
        const spriteX = 60 * 5;
        const spriteY = 0;
        const width = 60 * 5;
        const height = 30;

        super(x, y,
            './assets/images/log_sprite_60w_30h_10f.png',//spritePath
            spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.35,//pixelSize,
            'black',//transparentColor,
            'LogLRG',//gameObjectType, 
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
        if (LogLRG.DEBUG) {
            console.log(`Destroying LogLRG`, {
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
    
        // Clean up LogLRG-specific properties
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
    
        if (LogLRG.DEBUG) {
            console.log(`Successfully destroyed LogLRG`, finalState);
        }
    
        return true;
    }

}

export default LogLRG;
