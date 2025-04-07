// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// turtleSink.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';

class TurtleSink extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('turtleSink');

    // - Type (turtleSink)
    // - Sprite management
    // - Position updates

    constructor(x, y,
        velocityX, velocityY) {
        const width = 45;
        const height = 30;

        super(x, y,
            './assets/images/turtle_sprite_45w_33h_5f.png',//spritePath
            0, 0,//spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.35,//pixelSize,
            'black',//transparentColor,
            'turtleSink',//gameObjectType, 
            velocityX, velocityY
        );

        this.frame = 0;
        this.frameDirection = 1;
        this.counter = 0;
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
        
        if (this.counter++ > 20) {
            this.counter = 0;
            this.frame += this.frameDirection;
            if (this.frameDirection > 0) {
                if (this.frame > 4) {
                    this.frameDirection = -1;
                }
            }else{
                if (this.frame < 3) {
                    this.frame = 0;
                    this.frameDirection = 1;
                }
            }

            this.spriteX = this.width * this.frame;
        }
    }

    destroy() {
        try {
            if (TurtleSink.DEBUG) {
                console.log(`Destroying TurtleSink`, {
                    id: this.ID,
                    position: { x: this.x, y: this.y },
                    frame: this.frame,
                    frameDirection: this.frameDirection,
                    counter: this.counter,
                    velocity: { x: this.velocityX, y: this.velocityY }
                });
            }
    
            // Clean up TurtleSink-specific properties
            this.frame = null;
            this.frameDirection = null;
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
            console.error('Error during TurtleSink destruction:', {
                error: error.message,
                stack: error.stack,
                id: this.ID
            });
            return false;
        }
    }
    
}

export default TurtleSink;
