// truck.js
// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// Truck.js

import GameObject from '../../scripts/gameObject.js';

class Truck extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('truck');

    constructor(x, y, velocityX, velocityY) {
        const width = 48 * 2;
        const height = 42;
        const spriteX = 48 * 2;
        const spriteY = 0;

        super(
            x, y,
            './assets/images/vehicles_sprite_48w_42h_6f.png',
            spriteX, spriteY,
            width, height,
            1.35,
            'black',
            'Truck',
            velocityX, velocityY
        );
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.velocityX < 0 && this.x + (this.width * this.pixelSize) < 0) {
            this.setIsDead();
        }
    }

    destroy() {
        if (Truck.DEBUG) {
            console.log('Destroying Truck', {
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

        if (Truck.DEBUG) {
            console.log('Successfully destroyed Truck', finalState);
        }

        return true;
    }
}

export default Truck;