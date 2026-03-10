// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// turtle.js

import GameObject from './gameObject.js';

class Turtle extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('turtle');

    constructor(x, y, velocityX, velocityY) {
        const width = 45;
        const height = 33;

        super(
            x, y,
            './assets/images/turtle_sprite_45w_33h_5f.png',
            0, 0,
            width, height,
            1.35,
            'black',
            'turtle',
            velocityX, velocityY,
            3, // frameCount
            3, // framesPerRow
            20 // frameDelay
        );
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.velocityX < 0 && this.x + (this.width * this.pixelSize) < 0) {
            this.setIsDead();
        }
    }

    destroy() {
        if (Turtle.DEBUG) {
            console.log('Destroying Turtle', {
                id: this.ID,
                position: { x: this.x, y: this.y },
                velocity: { x: this.velocityX, y: this.velocityY },
                frame: this.currentFrameIndex
            });
        }

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

export default Turtle;