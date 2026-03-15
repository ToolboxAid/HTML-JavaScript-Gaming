import DebugFlag from '../../../engine/utils/debugFlag.js';
// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// bonus.js


import GameObject from '../../../engine/game/gameObject.js';
import CanvasUtils from '../../../engine/core/canvas.js';
import CollisionUtils from '../../../engine/physics/collisionUtils.js';
import SystemUtils from '../../../engine/utils/systemUtils.js';

class Bonus extends GameObject {
    static DEBUG = DebugFlag.has('bonus');

    static State = Object.freeze({
        IDLE: 'idle',
        JUMPING0: 'jumping0',
        JUMPING1: 'jumping1',
        JUMPING2: 'jumping2',
        TURNING0: 'turning0',
        TURNING1: 'turning1',
    });

    static moveIdle = 60;
    static moveDelay = 3;
    static moveSize = 30;

    constructor(x, y, velocityX, velocityY) {
        const width = 36;
        const height = 42;

        super(
            x, y,
            './assets/images/bonus_sprite_36w_42h_6f.png',
            0, 0,
            width, height,
            1.35,
            'black',
            'bonus',
            velocityX, velocityY,
            6, // frameCount
            6, // framesPerRow
            6  // frameDelay (manual state timing still used below)
        );

        this.frame = 0;
        this.animationBank = 0; // 0 or 3
        this.counter = 0;

        this.attachedTo = null;
        this.attachedX = 0;
        this.direction = 1;

        this.state = Bonus.State.IDLE;

        this.setRotation(270);
        this.setBonusFrame(2);
    }

    attachedToObject(gameObject) {
        this.attachedTo = gameObject;
        this.attachedX = 0;
        this.direction = 1;
    }

    detachedFromObject() {
        this.attachedTo = null;
        this.attachedX = 0;
    }

    setState(state) {
        this.state = state;
    }

    setAnimationBank(bankStart = 0) {
        this.animationBank = bankStart;
        this.setBonusFrame(this.frame);
    }

    toggleAnimationBank() {
        this.animationBank = this.animationBank === 0 ? 3 : 0;
        this.setBonusFrame(this.frame);
    }

    setBonusFrame(localFrame = 0) {
        this.frame = localFrame;
        this.setFrame(this.animationBank + this.frame);
    }

    updateAttached(deltaTime) {
        this.y = this.attachedTo.y - 7;

        switch (this.state) {
            case Bonus.State.IDLE:
                if (this.counter++ > Bonus.moveIdle) {
                    this.counter = 0;
                    this.setBonusFrame(2);

                    const angle = this.direction === 1 ? 90 : 270;
                    this.setRotation(angle);

                    this.setState(Bonus.State.JUMPING0);
                }
                break;

            case Bonus.State.JUMPING0:
                this.setBonusFrame(1);
                this.attachedX += (Bonus.moveSize / Bonus.moveDelay / 2) * this.direction;

                if (this.counter++ > Bonus.moveDelay) {
                    this.counter = 0;
                    this.setState(Bonus.State.JUMPING1);
                }
                break;

            case Bonus.State.JUMPING1:
                this.setBonusFrame(0);
                this.attachedX += (Bonus.moveSize / Bonus.moveDelay / 2) * this.direction;

                if (this.counter++ > Bonus.moveDelay) {
                    this.counter = 0;
                    this.setState(Bonus.State.JUMPING2);
                }
                break;

            case Bonus.State.JUMPING2:
                this.setBonusFrame(2);
                this.setState(Bonus.State.IDLE);

                if (this.attachedX + (this.boundWidth * 1.5) >= this.attachedTo.boundWidth) {
                    this.direction = -1;
                    this.setState(Bonus.State.TURNING0);
                } else if (this.attachedX <= 0) {
                    this.direction = 1;
                    this.setState(Bonus.State.TURNING0);
                }
                break;

            case Bonus.State.TURNING0:
                if (this.counter++ > Bonus.moveIdle) {
                    this.counter = 0;
                    this.setBonusFrame(2);
                    this.setRotation(0);
                    this.setState(Bonus.State.TURNING1);
                }
                break;

            case Bonus.State.TURNING1:
                if (this.counter++ > Bonus.moveIdle) {
                    this.counter = 0;
                    this.setBonusFrame(2);

                    const angle = this.direction === 1 ? 90 : 270;
                    this.setRotation(angle);

                    this.toggleAnimationBank();
                    this.setState(Bonus.State.IDLE);
                }
                break;

            default:
                console.warn(`Unknown bonus state: ${this.state}`);
                this.setState(Bonus.State.IDLE);
                this.setBonusFrame(2);
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
        if (SystemUtils.getObjectType(this) === 'frog') {
            this.attachedTo = null;
            this.setState(Bonus.State.IDLE);
        } else if (this.attachedTo) {
            this.updateAttached(deltaTime);
        } else {
            this.updateDetached(deltaTime);
        }
    }

    draw() {
        if (this.attachedTo && CollisionUtils.isCompletelyOffScreen(this.attachedTo)) {
            return;
        }

        super.draw();
    }

    destroy() {
        try {
            if (Bonus.DEBUG) {
                console.log('Destroying Bonus', {
                    id: this.ID,
                    position: { x: this.x, y: this.y },
                    state: this.state,
                    frame: this.frame,
                    animationBank: this.animationBank,
                    attachedTo: this.attachedTo?.type
                });
            }

            this.frame = null;
            this.animationBank = null;
            this.counter = null;
            this.attachedTo = null;
            this.attachedX = null;
            this.direction = null;
            this.state = null;

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
            console.error('Error during Bonus destruction:', {
                error: error.message,
                stack: error.stack,
                id: this.ID
            });
            return false;
        }
    }
}

export default Bonus;

