import DebugFlag from '../../../engine/utils/debugFlag.js';
// car2.js
// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// Car2.js


import GameObject from '../../../../engine/game/gameObject.js';
import CanvasUtils from '../../../../engine/core/canvas.js';

class Car2 extends GameObject {
    static DEBUG = DebugFlag.has('car2');

    constructor(x, y, velocityX, velocityY) {
        const width = 48;
        const height = 42;
        const spriteX = 48 * 5;
        const spriteY = 0;

        super(
            x, y,
            './assets/images/vehicles_sprite_48w_42h_6f.png',
            spriteX, spriteY,
            width, height,
            1.35,
            'black',
            'Car2',
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
        if (Car2.DEBUG) {
            console.log('Destroying Car2', {
                id: this.ID,
                position: { x: this.x, y: this.y },
                velocity: { x: this.velocityX, y: this.velocityY }
            });
        }

        return super.destroy();
    }
}

export default Car2;

