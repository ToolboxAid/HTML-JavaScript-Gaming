import DebugFlag from '../../../engine/utils/debugFlag.js';
// car0.js
// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// Car0.js


import GameObject from '../../../engine/game/gameObject.js';

class Car0 extends GameObject {
    static DEBUG = DebugFlag.has('car0');

    constructor(x, y, velocityX, velocityY) {
        const width = 48;
        const height = 42;
        const spriteX = 0;
        const spriteY = 0;

        super(
            x, y,
            './assets/images/vehicles_sprite_48w_42h_6f.png',
            spriteX, spriteY,
            width, height,
            1.35,
            'black',
            'Car0',
            velocityX, velocityY
        );
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.x + (this.width * this.pixelSize) < 0) {
            this.setIsDead();
        }
    }

    destroy() {
        if (Car0.DEBUG) {
            console.log('Destroying Car0', {
                id: this.ID,
                position: { x: this.x, y: this.y },
                velocity: { x: this.velocityX, y: this.velocityY }
            });
        }

        return super.destroy();
    }
}

export default Car0;
