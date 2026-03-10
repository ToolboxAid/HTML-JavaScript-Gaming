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
            './assets/images/turtle_sprite_45w_33h_6f.png',
            0, 0,
            width, height,
            1.35,
            'black',
            'turtleSink',
            velocityX, velocityY,
            6, // frameCount
            6, // framesPerRow
            30 // frameDelay
        );

        this.frame = 0;
        this.frameDirection = 1;
        this.counter = 0;
        this.setFrame(0);
    }

    update(deltaTime) {
        super.update(deltaTime, false);

        if (this.velocityX < 0 && this.x + (this.width * this.pixelSize) < 0) {
            this.setIsDead();
            return;
        }

        if (this.counter++ >= this.frameDelay) {
            this.counter = 0;
            this.frame += this.frameDirection;

            if (this.frameDirection > 0) {
                const lastFrameIndex = this.frameCount - 1;
                if (this.frame >= lastFrameIndex) {
                    this.frame = lastFrameIndex;
                    this.frameDirection = -1;
                }
            } else {
                if (this.frame <= 0) {
                    this.frame = 0;
                    this.frameDirection = 1;
                }
            }

            this.setFrame(this.frame);

            console.log(  `TurtleSink ${this.ID} - Frame: ${this.frame}, Dir: ${this.frameDirection}, Counter: ${this.counter}`);
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

        return true;
    }
}

export default TurtleSink;