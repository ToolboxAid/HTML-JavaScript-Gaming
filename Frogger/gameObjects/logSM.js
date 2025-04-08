// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// LogSM.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';

class LogSM extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('LogSM');

    // - Type (LogSM)
    // - Sprite management
    // - Position updates

    constructor(x, y,
        velocityX, velocityY) {
        const spriteX = 0;
        const spriteY = 0;
        const width = 60 * 2;
        const height = 30;

        super(x, y,
            './assets/images/log_sprite_60w_30h_10f.png',//spritePath
            spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.35,//pixelSize,
            'black',//transparentColor,
            'LogSM',//gameObjectType, 
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
        if (LogSM.DEBUG) {
            console.log(`Destroying LogSM`, {
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
    
        // Clean up LogSM-specific properties
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
    
        if (LogSM.DEBUG) {
            console.log(`Successfully destroyed LogSM`, finalState);
        }
    
        return true;
    }
    
}

export default LogSM;
