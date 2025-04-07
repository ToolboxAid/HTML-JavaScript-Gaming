// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// snake.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';
import CollisionUtils from '../../scripts/physics/collisionUtils.js';

class Snake extends GameObject {
    // - Type (snake)
    // - Sprite management
    // - Position updates

    constructor(x, y,
        velocityX, velocityY) {
        const width = 84;
        const height = 33;

        super(x, y,
            './assets/images/snake_sprite_84w_33h_4f.png',//spritePath
            0, 0,//spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.5,//pixelSize,
            'black',//transparentColor,
            'snake',//gameObjectType, 
            velocityX, velocityY
        );

        this.type = 'snake';
        this.frame = Math.floor(Math.random() * 4);
        this.counter = 0;

        this.attachedTo = null;
        //console.error('Snake created: ' + JSON.stringify(this));
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
            this.spriteX = this.width * this.frame;
        }
    }

    updateAttached(deltaTime) {

        this.attachedX += this.velocityX * deltaTime * this.direction;
        this.y = this.attachedTo.y - 7;

        if (this.attachedX + this.boundWidth > this.attachedTo.boundWidth) {
            this.direction = -1;
            this.setFlip('none');
        } else {
            if (this.attachedX < 0) {
                this.direction = 1;
                this.setFlip('horizontal');
            }
        }

        this.x = this.attachedX + this.attachedTo.x;

        // For attached snake, check both snake and attached object
        if (this.attachedTo &&
            CollisionUtils.isCompletelyOffScreen(this)) {
                this.x = -this.boundWidth;
            return;
        }        
    }
    updateDetached(deltaTime) {
        super.update(deltaTime);
        if (this.velocityX < 0) {// moving left
            if (this.x + this.boundWidth < 0) {
                this.x = CanvasUtils.getConfigWidth() + this.boundWidth;
            }
        } else {// moving right
            if (this.x > CanvasUtils.getConfigWidth()) {
                this.x = -this.boundWidth;
            }
        }
    }
    update(deltaTime) {
        if (this.attachedTo) { // Attached to another object
            this.updateAttached(deltaTime);
        } else { // Free form
            this.updateDetached(deltaTime);
        }

        this.animateFrame();
    }

    draw() {
        // For attached snake, check both snake and attached object
        if (this.attachedTo &&
            //CollisionUtils.isCompletelyOffScreen(this) &&
            CollisionUtils.isCompletelyOffScreen(this.attachedTo)) {
            return;
        }
        super.draw();
    }

}

export default Snake;
