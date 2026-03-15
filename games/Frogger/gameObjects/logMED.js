import DebugFlag from '../../../engine/utils/debugFlag.js';
// logMED.js
// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// LogMED.js


import GameObject from '../../../../engine/game/gameObject.js';
import CanvasUtils from '../../../../engine/core/canvas.js';

class LogMED extends GameObject {
    static DEBUG = DebugFlag.has('logMED');

    constructor(x, y, velocityX, velocityY) {
        const spriteX = 60 * 2;
        const spriteY = 0;
        const width = 60 * 3;
        const height = 30;

        super(
            x, y,
            './assets/images/log_sprite_60w_30h_10f.png',
            spriteX, spriteY,
            width, height,
            1.35,
            'black',
            'LogMED',
            velocityX, velocityY
        );
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.x > CanvasUtils.getConfigWidth()) {
            this.setIsDead();
        }
    }

    destroy() {
        if (LogMED.DEBUG) {
            console.log('Destroying LogMED', {
                id: this.ID,
                position: { x: this.x, y: this.y },
                velocity: { x: this.velocityX, y: this.velocityY }
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

export default LogMED;

