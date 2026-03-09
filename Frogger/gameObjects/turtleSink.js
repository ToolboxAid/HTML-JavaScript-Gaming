// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// turtleSink.js

import GameObject from './gameObject.js';

class TurtleSink extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('turtleSink');

    constructor(x, y, velocityX, velocityY) {
        const width = 45;
        const height = 33;

        super(
            x, y,
            './assets/images/turtle_sprite_45w_33h_5f.png', // spritePath
            0, 0,                                           // spriteX, spriteY
            width, height,                                  // spriteWidth, spriteHeight
            1.35,                                           // pixelSize
            'black',                                        // transparentColor
            'turtleSink',                                   // gameObjectType
            velocityX, velocityY
        );

        this.frame = 0;
        this.frameDirection = 1;
        this.counter = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.velocityX < 0) {
            if (this.x + (this.width * this.pixelSize) < 0) {
                this.setIsDead();
            }
        }

        if (this.counter++ > 20) {
            this.counter = 0;
            this.frame += this.frameDirection;

            if (this.frameDirection > 0) {
                if (this.frame > 4) {
                    this.frameDirection = -1;
                }
            } else {
                if (this.frame < 3) {
                    this.frame = 0;
                    this.frameDirection = 1;
                }
            }

            // Manual sprite-sheet animation
            this.spriteX = this.width * this.frame;
        }
    }

    destroy() {
        if (TurtleSink.DEBUG) {
            console.log('Destroying TurtleSink', {
                id: this.ID,
                position: { x: this.x, y: this.y },
                frame: this.frame,
                frameDirection: this.frameDirection,
                counter: this.counter,
                velocity: { x: this.velocityX, y: this.velocityY }
            });
        }

        const finalState = {
            id: this.ID,
            type: this.type,
            position: { x: this.x, y: this.y },
            frame: this.frame,
            frameDirection: this.frameDirection,
            counter: this.counter
        };

        this.frame = null;
        this.frameDirection = null;
        this.counter = null;

        const parentDestroyed = super.destroy();
        if (!parentDestroyed) {
            console.error('Parent GameObject destruction failed:', {
                id: this.ID,
                type: this.type
            });
            return false;
        }

        if (TurtleSink.DEBUG) {
            console.log('Successfully destroyed TurtleSink', finalState);
        }

        return true;
    }
}

export default TurtleSink;