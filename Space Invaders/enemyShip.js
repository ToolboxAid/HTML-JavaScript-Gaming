// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyShip.js

import ObjectDynamic from '../scripts/objectDynamic.js';
import CanvasUtils from '../scripts/canvas.js';
import Functions from '../scripts/functions.js';
import { canvasConfig, spriteConfig } from './global.js'; // Import canvasConfig for canvas-related configurations

class EnemyShip extends ObjectDynamic {

    static livingFrames = [
        [
            "0000000000000000",
            "0000011111100000",
            "0001111111111000",
            "0011111111111100",
            "0110110110110110",
            "1111111111111111",
            "0011100110001110",
            "0001000000000100"
        ],
    ];

    static dyingFrames = [
        [
            "0000000000000000",
            "0000011111100000",
            "0001111111111000",
            "0011111111111100",
            "0110110110110110",
            "1111111111111111",
            "0011100110001110",
            "0001000000000100"
        ],
        [
            "0000000000000000",
            "0000000000000000",
            "0000111111110000",
            "0011111111111100",
            "0100100100100100",
            "1110011110011110",
            "0001100011000010",
            "0000000000000000"
        ],
        [
            "0000000000000000",
            "0000000000000000",
            "0000011111000000",
            "0010101010101000",
            "0100000000000100",
            "0001110011110000",
            "0000000000000000",
            "0000000000000000"
        ],
        [
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000001100000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000"
        ]
    ];

    static Status = Object.freeze({
        ALIVE: 'alive',
        DYING: 'dying',
        DEAD: 'dead'
    });

    getValue() {
        let value = 0;
        const switchValue = Functions.randomGenerator(0, 3, true);
        switch (switchValue) {
            case 0:
                value = 50;
                break;
            case 1:
                value = 100;
                break;
            case 2:
                value = 250;
                break;
            case 3:
                value = 500;
                break;
        }
        return value;
    }

    constructor(y, dyingModulus = 5) {
        const dimensions = CanvasUtils.spriteWidthHeight(EnemyShip.livingFrames[0], spriteConfig.pixelSize);

        let velocityX = 150;
        let x = -(dimensions.width);  // off left screen the width of ship
        if (Functions.randomGenerator(0, 1, true)) {
            velocityX *= -1;
            x = canvasConfig.width + dimensions.width;  // off right screen width of ship
        }


        super(x, y, dimensions.width, dimensions.height, velocityX, 0);

        this.status = EnemyShip.Status.ALIVE;
        this.value = this.getValue();

        this.currentFrameIndex = 0;

        this.livingDelay = 0;
        this.livingFrames = EnemyShip.livingFrames;
        this.livingFrameCount = this.livingFrames.length;

        this.dyingDelay = 0;
        this.dyingFrames = EnemyShip.dyingFrames;
        this.dyingFrameCount = this.dyingFrames.length;

        this.dyingModulus = dyingModulus;
    }

    static nextShipDelay = 25 * 1000; // Convert seconds to milliseconds
    static nextShipTimer = Date.now() + EnemyShip.nextShipDelay;
    static isCreationTime() {
        if (Date.now() > EnemyShip.nextShipTimer) {
            EnemyShip.nextShipTimer = Date.now() + (EnemyShip.nextShipDelay * 1000);// put way out there.
            return true;
        }
        return false;
    }


    update(deltaTime) {
        super.update(deltaTime);

        if (this.isAlive()) { // is Alive
            this.currentFrameIndex = Math.floor((this.livingDelay++ / this.dyingModulus) % this.livingFrameCount);
            if (this.velocityX > 0) {// moving to right
                if (this.x > canvasConfig.width + this.width) {
                    this.setHit();
                }
            } else {
                if (this.x < -(this.width)) { // moving to left
                    this.setHit();
                }
            }
        } else { // is Dying or Dead
            if (this.isDying()) {
                if (++this.dyingDelay >= this.dyingModulus * this.dyingFrameCount) {
                    this.setDead();
                }
                if (!this.isDead()) {
                    this.currentFrameIndex = Math.floor((this.dyingDelay / this.dyingModulus) % this.dyingFrameCount);
                }
            }
        }
    }

    isAlive() {
        return this.status === EnemyShip.Status.ALIVE;
    }

    setHit() {
        if (this.dyingFrames) {
            this.status = EnemyShip.Status.DYING;
        } else {
            this.status = EnemyShip.Status.DEAD;
        }
    }

    isDying() {
        return this.status === EnemyShip.Status.DYING;
    }

    isDead() {
        EnemyShip.nextShipTimer = Date.now() + EnemyShip.nextShipDelay;
        return this.status === EnemyShip.Status.DEAD;
    }

    setDead() {
        this.status = EnemyShip.Status.DEAD;
    }

    draw(ctx) {
        if (this.isAlive()) {
            CanvasUtils.drawSprite(ctx, this.x, this.y, this.livingFrames[this.currentFrameIndex], spriteConfig.pixelSize, spriteConfig.shipColor);
        } else {
            if (this.isDying()) {
                CanvasUtils.drawSprite(ctx, this.x, this.y, this.dyingFrames[this.currentFrameIndex], spriteConfig.pixelSize, spriteConfig.shipColor);
            }
        }
    }

}

export default EnemyShip;
