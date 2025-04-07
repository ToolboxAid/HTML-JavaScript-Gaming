// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// beaver.js

import GameObject from './gameObject.js';
import CanvasUtils from '../../scripts/canvas.js';
import CollisionUtils from '../../scripts/physics/collisionUtils.js';

class Beaver extends GameObject {
    static DEBUG = new URLSearchParams(window.location.search).has('beaver');

    // - Type (beaver)
    // - Sprite management
    // - Position updates

    constructor(x, y,
        velocityX, velocityY,
        activeGameObjects //this.gameObjectManager.activeGameObjects
    ) {
        // check if activeGameObjects is an array
        if (!Array.isArray(activeGameObjects)) {
            console.error('activeGameObjects is not an array:', activeGameObjects);
            return;
        }

        const width = 48;
        const height = 48;

        super(x, y,
            './assets/images/beaver_sprite_48w_48h_2f.png',//spritePath
            0, 0,//spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.5,//pixelSize,
            'black',//transparentColor,
            'beaver',//gameObjectType, 
            velocityX, velocityY
        );

        this.activeGameObjects = activeGameObjects;

        this.type = 'beaver';

        this.frame = 0;
        this.counter = 0;
    }

    checkLogCollision() {
        if (Beaver.DEBUG) {
            // Check if the beaver is on a log (or other game object)
            if (!Array.isArray(this.activeGameObjects)) {
                console.error('activeGameObjects is not an array:', this.activeGameObjects);
                return false;
            }

            // Check if the beaver is on a log (or other game object)
            console.log('Beaver initialized with', this.activeGameObjects.length, 'active objects');
        }

        for (const gameObject of this.activeGameObjects) {
            // Skip self-collision and only check logs
            if (gameObject === this) {
                // this is the beaver itself, skip check
                continue;
            }

            // Use simple bounds checking instead of full JSON comparison
            if (CollisionUtils.isCollidingWith(this, gameObject)) {
                if (Beaver.DEBUG) {
                    console.log('Beaver collided with log:', {
                        beaverPos: { x: this.x, y: this.y },
                        logPos: { x: gameObject.x, y: gameObject.y }
                    });
                }
                return true;
            }
        }
        return false;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.velocityX < 0) {// moving left
            if (this.x + (this.width * this.pixelSize) < 0) {
                this.x = CanvasUtils.getConfigWidth() + (this.width * this.pixelSize);
            }
        } else {// moving right
            if (this.x > CanvasUtils.getConfigWidth()) {
                this.x = -(this.width * this.pixelSize);
            }
        }

        if (this.counter++ > 40 || this.counter > 10 && this.frame === 1) {
            this.counter = 0;
            this.frame++;
            if (this.frame > 1) {
                this.frame = 0;
            }
            this.spriteX = this.width * this.frame;
        }

        if (this.checkLogCollision()) {
            this.x = -this.boundWidth * 2; // off screen to the left
        }
    }

}

export default Beaver;
