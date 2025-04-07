// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// homeFrog.js

import GameObject from './gameObject.js';

class HomeFrog extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('homeFrog');

    // - Type (homeFrog)
    // - Sprite management
    // - Position updates

    constructor(x, y,
        velocityX, velocityY) {
        const width = 48;
        const height = 48;

        super(x, y,
            './assets/images/home_danger_sprite_48w_48h_5f.png',//spritePath
            0, 0,//spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.35,//pixelSize,
            'black',//transparentColor,
            'homeFrog',//gameObjectType, 
            velocityX, velocityY
        );

        this.counter = 0;
    }

    setWink(){
        this.spriteX = 48;
    }

    update(deltaTime) {

    }
    destroy() {
        try {
            if (HomeFrog.DEBUG) {
                console.log(`Destroying HomeFrog`, {
                    id: this.ID,
                    position: { x: this.x, y: this.y },
                    sprite: { x: this.spriteX, y: this.spriteY },
                    counter: this.counter
                });
            }
    
            // Clean up HomeFrog-specific properties
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
    
            return true;
    
        } catch (error) {
            console.error('Error during HomeFrog destruction:', {
                error: error.message,
                stack: error.stack,
                id: this.ID
            });
            return false;
        }
    }
    
}

export default HomeFrog;
