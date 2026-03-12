// home_frog.js
// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// home_frog.js

import GameObject from '../../../engine/gameObject.js';

class HomeFrog extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('homeFrog');

    static Frames = Object.freeze({
        IDLE: 0,
        WINK: 1
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
            'homeFrog',
            velocityX, velocityY,
            5, // frameCount
            5, // framesPerRow
            6  // frameDelay
        );

        this.setIdle();
    }

    setIdle() {
        this.setFrame(HomeFrog.Frames.IDLE);
    }

    setWink() {
        this.setFrame(HomeFrog.Frames.WINK);
    }

    destroy() {
        if (HomeFrog.DEBUG) {
            console.log('Destroying HomeFrog', {
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

export default HomeFrog;