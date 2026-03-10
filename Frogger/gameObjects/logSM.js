// logSM.js
// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// LogSM.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';

class LogSM extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('logSM');

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
            'LogSM',
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
        if (LogSM.DEBUG) {
            console.log('Destroying LogSM', {
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

export default LogSM;