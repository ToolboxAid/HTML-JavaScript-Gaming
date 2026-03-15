import DebugFlag from '../../../engine/utils/debugFlag.js';
// car1.js
// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// Car1.js


import GameObject from '../../../engine/game/gameObject.js';

class Car1 extends GameObject {
    static DEBUG = DebugFlag.has('car1');

    constructor(x, y, velocityX, velocityY) {
        const width = 48;
        const height = 42;
        const spriteX = 48 * 4;
        const spriteY = 0;

        super(
            x, y,
            './assets/images/vehicles_sprite_48w_42h_6f.png',
            spriteX, spriteY,
            width, height,
            1.35,
            'black',
            'Car1',
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
        if (Car1.DEBUG) {
            console.log('Destroying Car1', {
                id: this.ID,
                position: { x: this.x, y: this.y },
                velocity: { x: this.velocityX, y: this.velocityY }
            });
        }

        return super.destroy();
    }
}

export default Car1;
