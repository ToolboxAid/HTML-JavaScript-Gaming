import DebugFlag from '../../../engine/utils/debugFlag.js';
// home_fly.js
// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// home_fly.js


import GameObject from '../../../engine/game/gameObject.js';

class HomeFly extends GameObject {
    static DEBUG = DebugFlag.has('homeFly');

    static Frames = Object.freeze({
        IDLE: 4
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
            'homeFly',
            velocityX, velocityY,
            5, // frameCount
            5, // framesPerRow
            6  // frameDelay
        );

        this.setFrame(HomeFly.Frames.IDLE);
    }

    destroy() {
        if (HomeFly.DEBUG) {
            console.log('Destroying HomeFly', {
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

export default HomeFly;
