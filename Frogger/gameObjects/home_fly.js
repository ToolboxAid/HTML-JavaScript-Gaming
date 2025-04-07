// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// homeFly.js

import GameObject from './gameObject.js';

class HomeFly extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('homeFly');

    // - Type (homeFly)
    // - Sprite management
    // - Position updates

    constructor(x, y,
        velocityX, velocityY) {
        const width = 36;
        const height = 36;

        super(x, y,
            './assets/images/home_danger_sprite_48w_48h_5f.png',//spritePath
            48*4, 0,//spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.35,//pixelSize,
            'black',//transparentColor,
            'homeFly',//gameObjectType, 
            velocityX, velocityY
        );

        this.frame = Math.floor(Math.random() * 4);
        this.counter = 0;

        this.attachedTo = null;
    }

    update(deltaTime) {

    }

    destroy() {
        try {
            if (HomeFly.DEBUG) {
                console.log(`Destroying HomeFly`, {
                    id: this.ID,
                    position: { x: this.x, y: this.y },
                    frame: this.frame,
                    attachedTo: this.attachedTo?.type
                });
            }

            // Clean up HomeFly-specific properties
            this.frame = null;
            this.counter = null;
            this.attachedTo = null;

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
            console.error('Error during HomeFly destruction:', {
                error: error.message,
                stack: error.stack,
                id: this.ID
            });
            return false;
        }
    }
    
}

export default HomeFly;
