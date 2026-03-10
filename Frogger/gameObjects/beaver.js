// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// beaver.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';
import CollisionUtils from '../../scripts/physics/collisionUtils.js';

class Beaver extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('beaver');

    constructor(x, y, velocityX, velocityY, activeGameObjects) {
        if (!Array.isArray(activeGameObjects)) {
            console.error('activeGameObjects is not an array:', activeGameObjects);
            return;
        }

        const width = 48;
        const height = 48;

        super(
            x, y,
            './assets/images/beaver_sprite_48w_48h_2f.png',
            0, 0,
            width, height,
            1.35,
            'black',
            'beaver',
            velocityX, velocityY,
            2, // frameCount
            2, // framesPerRow
            40 // frameDelay (manual timing still used below)
        );

        this.activeGameObjects = activeGameObjects;

        this.frame = 0;
        this.counter = 0;
        this.setFrame(0);
    }

    checkLogCollision() {
        if (Beaver.DEBUG) {
            if (!Array.isArray(this.activeGameObjects)) {
                console.error('activeGameObjects is not an array:', this.activeGameObjects);
                return false;
            }

            console.log('Beaver initialized with', this.activeGameObjects.length, 'active objects');
        }

        for (const gameObject of this.activeGameObjects) {
            if (gameObject === this) {
                continue;
            }

            if (CollisionUtils.isCollidingWith(this, gameObject)) {
                if (Beaver.DEBUG) {
                    console.log('Beaver collided with log:', {
                        beaverPos: { x: this.x, y: this.y },
                        logPos: { x: gameObject.x, y: gameObject.y }
                    });
                }
                return true;
            }
        }

        return false;
    }

    update(deltaTime) {
        super.update(deltaTime, false);

        if (this.velocityX < 0) {
            if (this.x + (this.width * this.pixelSize) < 0) {
                this.x = CanvasUtils.getConfigWidth() + (this.width * this.pixelSize);
            }
        } else {
            if (this.x > CanvasUtils.getConfigWidth()) {
                this.x = -(this.width * this.pixelSize);
            }
        }

        if (this.counter++ > 40 || (this.counter > 10 && this.frame === 1)) {
            this.counter = 0;
            this.frame++;

            if (this.frame > 1) {
                this.frame = 0;
            }

            this.setFrame(this.frame);
        }

        if (this.checkLogCollision()) {
            this.x = -this.boundWidth * 2;
        }
    }

    destroy() {
        try {
            if (Beaver.DEBUG) {
                console.log('Destroying Beaver', {
                    id: this.ID,
                    position: { x: this.x, y: this.y },
                    frame: this.frame,
                    activeObjects: this.activeGameObjects?.length
                });
            }

            this.frame = null;
            this.counter = null;
            this.activeGameObjects = null;

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
            console.error('Error during Beaver destruction:', {
                error: error.message,
                stack: error.stack,
                id: this.ID
            });
            return false;
        }
    }
}

export default Beaver;