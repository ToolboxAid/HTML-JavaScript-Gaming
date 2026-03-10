// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// aligator.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';

class Aligator extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('aligator');

    constructor(x, y, velocityX, velocityY) {
        const width = 48 * 3;
        const height = 48;

        super(
            x, y,
            './assets/images/aligator_sprite_48w_48h_6f.png',
            0, 0,
            width, height,
            1.35,
            'black',
            'aligator',
            velocityX, velocityY,
            2, // two wide strips: normal and alt
            2, // one row with two composite frames
            40
        );

        this.frame = 0;
        this.counter = 0;
        this.biteMode = false;

        this.setFrame(0);
    }

    setBite() {
        this.biteMode = true;
        this.frame = 1;
        this.setFrame(1);
    }

    clearBite() {
        this.biteMode = false;
        this.frame = 0;
        this.setFrame(0);
    }

    update(deltaTime) {
        super.update(deltaTime, false);

        if (this.x > CanvasUtils.getConfigWidth()) {
            this.setIsDead();
            return;
        }

        if (!this.biteMode && this.counter++ > 40) {
            this.counter = 0;
            this.frame++;

            if (this.frame > 1) {
                this.frame = 0;
            }

            this.setFrame(this.frame);
        }
    }

    destroy() {
        if (Aligator.DEBUG) {
            console.log('Destroying Aligator', {
                id: this.ID,
                position: { x: this.x, y: this.y },
                frame: this.frame,
                counter: this.counter,
                biteMode: this.biteMode
            });
        }

        const finalState = {
            id: this.ID,
            type: this.type,
            position: { x: this.x, y: this.y },
            frame: this.frame,
            counter: this.counter,
            biteMode: this.biteMode
        };

        this.frame = null;
        this.counter = null;
        this.biteMode = null;

        const parentDestroyed = super.destroy();
        if (!parentDestroyed) {
            console.error('Parent GameObject destruction failed:', {
                id: this.ID,
                type: this.type
            });
            return false;
        }

        if (Aligator.DEBUG) {
            console.log('Successfully destroyed Aligator', finalState);
        }

        return true;
    }
}

export default Aligator;