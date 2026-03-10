// home_alligator.js
// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// home_alligator.js

import GameObject from '../../scripts/gameObject.js';

class HomeAlligator extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('homeAlligator');

    static Frames = Object.freeze({
        IDLE: 2,
        BITE: 3
    });

    constructor(x, y, velocityX = 0, velocityY = 0) {
        const width = 48;
        const height = 48;

        super(
            x, y,
            './assets/images/home_danger_sprite_48w_48h_5f.png',
            0, 0,
            width, height,
            1.35,
            'black',
            'homeAlligator',
            velocityX, velocityY,
            5, // frameCount
            5, // framesPerRow
            6  // frameDelay
        );

        this.setIdle();
    }

    setIdle() {
        this.setFrame(HomeAlligator.Frames.IDLE);
    }

    setBite() {
        this.setFrame(HomeAlligator.Frames.BITE);
    }

    destroy() {
        if (HomeAlligator.DEBUG) {
            console.log('Destroying HomeAlligator', {
                id: this.ID,
                position: { x: this.x, y: this.y },
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

export default HomeAlligator;