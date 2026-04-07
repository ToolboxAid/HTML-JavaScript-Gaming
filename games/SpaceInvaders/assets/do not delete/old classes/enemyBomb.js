import { canvasConfig, spriteConfig } from './global.js';
import ObjectSprite from '../../src/engine/objects/objectSprite.js';

class EnemyBomb extends ObjectSprite {

    static dyingFrames = [
        [
            "100100010001",
            "010010100010",
            "001001000100",
            "110100001011",
            "001001000100",
            "010010100010",
            "100100010001",
        ],
        [
            "000000000000",
            "010010100010",
            "001001000100",
            "010100001010",
            "001001000100",
            "010010100010",
            "000000000000",
        ],
        [
            "000000000000",
            "000000000000",
            "001001000100",
            "000101101000",
            "001001000100",
            "000000000000",
            "000000000000",
        ],
        [
            "000000000000",
            "000000000000",
            "000101001000",
            "000011110000",
            "000101001000",
            "000000000000",
            "000000000000",
        ],
    ];

    static cloneFrames(frames) {
        if (!Array.isArray(frames)) {
            return frames;
        }

        return frames.map(frame => {
            if (!Array.isArray(frame)) {
                return frame;
            }
            return frame.map(row => Array.isArray(row) ? [...row] : row);
        });
    }

    constructor(x, y, frames, velocityY = 150) {
        const pixelSize = spriteConfig.pixelSize || 1;
        const safeLivingFrames = EnemyBomb.cloneFrames(frames);
        const safeDyingFrames = EnemyBomb.cloneFrames(EnemyBomb.dyingFrames);

        y += spriteConfig.bombYoffset;
        super(x, y, safeLivingFrames, safeDyingFrames, pixelSize);

        this.setVelocity(0, velocityY);
        this.livingDelay = 6;
    }

    update(deltaTime = 1) {
        super.update(deltaTime);

        if (
            this.x <= 0 || this.x > canvasConfig.width ||
            this.y <= 0 || this.y > canvasConfig.height
        ) {
            this.setIsDead();
        }
    }

    destroy() {
        super.destroy();
        this.livingDelay = null;
    }
}

export default EnemyBomb;