import DebugFlag from '../../../engine/utils/debugFlag.js';
// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// turtleSink.js


import GameObject from '../../../engine/gameObject.js';

class TurtleSink extends GameObject {
    static DEBUG = DebugFlag.has('turtleSink');
    static FRAME_SEQUENCE = [0, 1, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1];

    constructor(x, y, velocityX, velocityY) {
        const width = 45;
        const height = 33;

        super(
            x, y,
            './assets/images/turtle_sprite_45w_33h_6f.png',
            0, 0,
            width, height,
            1.35,
            'black',
            'turtleSink',
            velocityX, velocityY,
            6, // frameCount
            6, // framesPerRow
            20 // frameDelay
        );

        this.sequenceIndex = 0;
        this.counter = 0;
        this.setFrame(TurtleSink.FRAME_SEQUENCE[this.sequenceIndex]);
    }

    update(deltaTime) {
        super.update(deltaTime, false);

        if (this.velocityX < 0 && this.x + (this.width * this.pixelSize) < 0) {
            this.setIsDead();
            return;
        }

        if (this.counter++ >= this.frameDelay) {
            this.counter = 0;
            this.sequenceIndex = (this.sequenceIndex + 1) % TurtleSink.FRAME_SEQUENCE.length;
            this.setFrame(TurtleSink.FRAME_SEQUENCE[this.sequenceIndex]);
        }
    }

    destroy() {
        if (TurtleSink.DEBUG) {
            console.log('Destroying TurtleSink', {
                id: this.ID,
                position: { x: this.x, y: this.y },
                frame: TurtleSink.FRAME_SEQUENCE[this.sequenceIndex],
                sequenceIndex: this.sequenceIndex,
                counter: this.counter,
                velocity: { x: this.velocityX, y: this.velocityY }
            });
        }

        this.sequenceIndex = null;
        this.counter = null;

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

export default TurtleSink;

