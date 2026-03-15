import DebugFlag from '../../../engine/utils/debugFlag.js';
// logSM.js
// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// LogSML.js


import GameObject from '../../../engine/game/gameObject.js';
import CanvasUtils from '../../../engine/core/canvas.js';

class LogSML extends GameObject {
    static DEBUG = DebugFlag.has('logSML');

    constructor(x, y, velocityX, velocityY) {
        const spriteX = 0;
        const spriteY = 0;
        const width = 60 * 2;
        const height = 30;

        super(
            x, y,
            './assets/images/log_sprite_60w_30h_10f.png',
            spriteX, spriteY,
            width, height,
            1.35,
            'black',
            'LogSML',
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
        if (LogSML.DEBUG) {
            console.log('Destroying LogSML', {
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

export default LogSML;

