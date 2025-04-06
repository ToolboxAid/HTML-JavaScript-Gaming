// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// bonus.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';
import CollisionUtils from '../../scripts/physics/collisionUtils.js';
import SystemUtils from '../../scripts/utils/systemUtils.js';
import AngleUtils from '../../scripts/math/angleUtils.js';

class Bonus extends GameObject {
    // - Type (bonus)
    // - Sprite management
    // - Position updates
    // Add static enum for states
    static State = Object.freeze({
        IDLE: 'idle',
        JUMPING0: 'jumping0',
        JUMPING1: 'jumping1',
        JUMPING2: 'jumping2',
        TURNING0: 'turning0',
        TURNING1: 'turning1',
    });

    constructor(x, y,
        velocityX, velocityY) {
        const width = 36;
        const height = 42;

        super(x, y,
            './assets/images/bonus_sprite_36w_42h_6f.png',//spritePath
            0, 0,//spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.5,//pixelSize,
            'black',//transparentColor,
            'bonus',//gameObjectType, 
            velocityX, velocityY
        );

        this.type = 'bonus';
        this.frame = 0;//Math.floor(Math.random() * 4);
        this.counter = 0;

        this.attachedTo = null;

        this.state = Bonus.State.IDLE;

        this.rotation = AngleUtils.toRadians(270);
        //console.error('Bonus created: ' + JSON.stringify(this));
    }

    attachedToObject(gameObject) {
        this.attachedTo = gameObject;
        this.attachedX = 0;
        this.direction = 1;
    }

    detachedFromObject() {
        this.attachedTo = null;
    }

    setState(state) {
        this.state = state;
    }

    static moveIdle = 60;
    static moveDelay = 3;
    static moveSize = 30;//36;//
    updateAttached(deltaTime) {
        this.y = this.attachedTo.y - 7;

        switch (this.state) {
            case Bonus.State.IDLE:
                if (this.counter++ > Bonus.moveIdle) {
                    this.counter = 0;
                    this.frame = 2;
                    const angle = this.direction === 1 ? 90 : 270;
                    this.setRotation(angle);
                    this.setState(Bonus.State.JUMPING0);
                }
                break;

            case Bonus.State.JUMPING0:
                this.frame = 1;
                this.attachedX += Bonus.moveSize/Bonus.moveDelay/2 * this.direction;

                if (this.counter++ > Bonus.moveDelay) {
                    this.counter = 0;
                    this.setState(Bonus.State.JUMPING1);
                }
                break;

            case Bonus.State.JUMPING1:
                this.frame = 0;
                this.attachedX += Bonus.moveSize/Bonus.moveDelay/2 * this.direction;

                if (this.counter++ > Bonus.moveDelay) {
                    this.counter = 0;
                    this.setState(Bonus.State.JUMPING2);
                }
                break;

            case Bonus.State.JUMPING2:
                this.frame = 2;
                this.setState(Bonus.State.IDLE);

                if (this.attachedX + (this.boundWidth*1.5) >= this.attachedTo.boundWidth) {
                    this.direction = -1;
                    this.state = Bonus.State.TURNING0;
                } else {
                    if (this.attachedX <= 0) {
                        this.direction = 1;
                        this.state = Bonus.State.TURNING0;
                    }
                }
                break;

            case Bonus.State.TURNING0:
                if (this.counter++ > Bonus.moveIdle) {
                    this.counter = 0;
                    this.frame = 2;
                    this.setRotation(0);
                    this.setState(Bonus.State.TURNING1);
                }
                break;

            case Bonus.State.TURNING1:
                if (this.counter++ > Bonus.moveIdle) {
                    this.counter = 0;
                    this.frame = 2;
                    const angle1 = this.direction === 1 ? 90 : 270;
                    this.setRotation(angle1);
                    this.setState(Bonus.State.IDLE);
                }
                break;

            default:
                console.warn(`Unknown bonus state: ${this.state}`);
                this.setState(Bonus.State.IDLE);
        }


        this.x = this.attachedX + this.attachedTo.x;

        // For attached bonus, check both bonus and attached object
        if (this.attachedTo && CollisionUtils.isObjectCompletelyOffScreen(this)) {
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
        // Handle attachment state first
        if (SystemUtils.getObjectType(this) === 'frog') {
            this.attachedTo = null;
            this.setState(Bonus.State.IDLE);
            console.error('Detached from frog: ' + JSON.stringify(this));
        } else if (this.attachedTo) {
            this.updateAttached(deltaTime);
        } else {
            this.updateDetached(deltaTime);
        }

        // Update sprite position based on frame
        this.spriteX = this.width * this.frame;
    }

    draw() {
        // For attached bonus, check both bonus and attached object
        if (this.attachedTo &&
            //CollisionUtils.isSpriteCompletelyOffScreen(this) &&
            CollisionUtils.isObjectCompletelyOffScreen(this.attachedTo)) {
            return;
        }
        super.draw();
    }

}

export default Bonus;
