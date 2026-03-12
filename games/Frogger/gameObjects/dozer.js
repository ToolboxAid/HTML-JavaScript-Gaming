// dozer.js
// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// Dozer.js

import GameObject from '../../engine/gameObject.js';
import CanvasUtils from '../../engine/canvas.js';

class Dozer extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('dozer');

    constructor(x, y, velocityX, velocityY) {
        const width = 48;
        const height = 42;
        const spriteX = 48;
        const spriteY = 0;

        super(
            x, y,
            './assets/images/vehicles_sprite_48w_42h_6f.png',
            spriteX, spriteY,
            width, height,
            1.35,
            'black',
            'Dozer',
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
        if (Dozer.DEBUG) {
            console.log('Destroying Dozer', {
                id: this.ID,
                position: { x: this.x, y: this.y },
                velocity: { x: this.velocityX, y: this.velocityY }
            });
        }

        const finalState = {
            id: this.ID,
            type: this.type,
            position: { x: this.x, y: this.y }
        };

        const parentDestroyed = super.destroy();
        if (!parentDestroyed) {
            console.error('Parent GameObject destruction failed:', {
                id: this.ID,
                type: this.type
            });
            return false;
        }

        if (Dozer.DEBUG) {
            console.log('Successfully destroyed Dozer', finalState);
        }

        return true;
    }
}

export default Dozer;