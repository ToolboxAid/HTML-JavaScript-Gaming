// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// snake.js

import GameObject from '../../../engine/gameObject.js';
import CanvasUtils from '../../../engine/core/canvas.js';
import CollisionUtils from '../../../engine/physics/collisionUtils.js';

class Snake extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('snake');

    constructor(x, y, velocityX, velocityY) {
        const width = 84;
        const height = 33;

        super(
            x, y,
            './assets/images/snake_sprite_84w_33h_4f.png',
            0, 0,
            width, height,
            1.35,
            'black',
            'snake',
            velocityX, velocityY,
            4, // frameCount
            4, // framesPerRow
            8  // frameDelay (manual timing still used below)
        );

        this.frame = Math.floor(Math.random() * 4);
        this.counter = 0;

        this.attachedTo = null;
        this.attachedX = 0;
        this.direction = 1;

        this.setFrame(this.frame);
    }

    attachedToObject(gameObject) {
        this.attachedTo = gameObject;
        this.attachedX = 0;
        this.direction = 1;
    }

    detachedFromObject() {
        this.attachedTo = null;
    }

    animateFrame() {
        if (this.counter++ > 8) {
            this.counter = 0;
            this.frame++;

            if (this.frame > 3) {
                this.frame = 0;
            }

            this.setFrame(this.frame);
        }
    }

    updateAttached(deltaTime) {
        this.attachedX += this.velocityX * deltaTime * this.direction;
        this.y = this.attachedTo.y - 7;

        if (this.attachedX + this.boundWidth > this.attachedTo.boundWidth) {
            this.direction = -1;
            this.setFlip('none');
        } else if (this.attachedX < 0) {
            this.direction = 1;
            this.setFlip('horizontal');
        }

        this.x = this.attachedX + this.attachedTo.x;

        if (this.attachedTo && CollisionUtils.isCompletelyOffScreen(this)) {
            this.x = -this.boundWidth;
            return;
        }
    }

    updateDetached(deltaTime) {
        super.update(deltaTime, false);

        if (this.velocityX < 0) {
            if (this.x + this.boundWidth < 0) {
                this.x = CanvasUtils.getConfigWidth() + this.boundWidth;
            }
        } else {
            if (this.x > CanvasUtils.getConfigWidth()) {
                this.x = -this.boundWidth;
            }
        }
    }

    update(deltaTime) {
        if (this.attachedTo) {
            this.updateAttached(deltaTime);
        } else {
            this.updateDetached(deltaTime);
        }

        this.animateFrame();
    }

    draw() {
        if (this.attachedTo && CollisionUtils.isCompletelyOffScreen(this.attachedTo)) {
            return;
        }

        super.draw();
    }

    destroy() {
        try {
            if (Snake.DEBUG) {
                console.log('Destroying Snake', {
                    id: this.ID,
                    position: { x: this.x, y: this.y },
                    frame: this.frame,
                    attached: {
                        to: this.attachedTo?.type,
                        x: this.attachedX,
                        direction: this.direction
                    }
                });
            }

            this.frame = null;
            this.counter = null;
            this.attachedTo = null;
            this.attachedX = null;
            this.direction = null;

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
            console.error('Error during Snake destruction:', {
                error: error.message,
                stack: error.stack,
                id: this.ID
            });
            return false;
        }
    }
}

export default Snake;
