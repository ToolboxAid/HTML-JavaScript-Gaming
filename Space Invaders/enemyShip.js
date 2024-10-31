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

    constructor(y) {
        const dimensions = CanvasUtils.spriteWidthHeight(EnemyShip.livingFrames[0], spriteConfig.pixelSize);

        console.log(Functions.randomGenerator(0,1,true));

        let velocityX = 150;
        let x = -(dimensions.width);  // off left screen the width of ship

        if (Functions.randomGenerator(0,1,true)){
            velocityX *= -1;
            x = canvasConfig.width+dimensions.width;  // off right screen width of ship
        }       

        super(x, y, dimensions.width, dimensions.height, velocityX, 0);
        this.value = 50;

        this.currentFrameIndex = 0;
        this.dyingDelay = 0;
    }

    static nextShipDelay = 5 * 1000; // Convert seconds to milliseconds
    static nextShipTimer = Date.now() + EnemyShip.nextShipDelay;
    static isCreationTime() {
        if (Date.now() > EnemyShip.nextShipTimer) {
            EnemyShip.nextShipTimer = Date.now() + (EnemyShip.nextShipDelay * 1000);// put way out there.
            return true;
        }
        return false;
    }

    static deadModulus = 4;// this is ?????
    static frameCount = 3;

    update(deltaTime) {
        super.update(deltaTime);

        if (this.isAlive) {
            if (this.velocityX > 0) {// moving to right
                if (this.x > canvasConfig.width + this.width) {
                    this.setHit();
                }
            } else {
                if (this.x < -(this.width)) { // moving to left
                    this.setHit();
                }
            }
        } else { // Dying or Dead
            if (this.state === EnemyShip.Status.DYING) {
                if (this.dyingDelay++ >= EnemyShip.deadModulus * EnemyShip.frameCount) {
                    this.state = EnemyShip.Status.DEAD;
                }
            }
            currentFrameIndex = Math.floor((this.dyingDelay / EnemyShip.deadModulus) % EnemyShip.frameCount);
        }
    }

    isAlive() {
        return this.state === EnemyShip.Status.ALIVE;
    }

    setHit() {
        if (this.dyingFrames) {
            this.state = EnemyShip.Status.DYING;
        } else {
            this.state = EnemyShip.Status.DEAD;
        }
    }

    isDying() {
        return this.state === EnemyShip.Status.DYING;
    }

    isDead() {
        EnemyShip.nextShipTimer = Date.now() + EnemyShip.nextShipDelay;
        return this.state === EnemyShip.Status.DEAD;
    }

    setDead() {
        this.state = EnemyShip.Status.DEAD;
    }

    draw(ctx) {
        if (this.isAlive()) {
            CanvasUtils.drawSprite(ctx, this.x, this.y, EnemyShip.livingFrames[0], spriteConfig.pixelSize, spriteConfig.shipColor);
        } else {
            CanvasUtils.drawSprite(ctx, this.x, this.y, EnemyShip.dyingFrames[this.currentFrameIndex], spriteConfig.pixelSize, spriteConfig.shipColor);
        }
    }

}

export default EnemyShip;
