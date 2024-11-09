// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyShip.js

import ObjectKillable from '../scripts/objectKillable.js';
import Functions from '../scripts/functions.js';
import { canvasConfig, spriteConfig } from './global.js'; // Import canvasConfig for canvas-related configurations

class EnemyShip extends ObjectKillable {

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

    constructor() {
        super(0, spriteConfig.shipY, EnemyShip.livingFrames, EnemyShip.dyingFrames, spriteConfig.shipVelX);
        this.setSpriteColor(spriteConfig.shipColor);
        // place off left screen the width of ship moving right
        this.x = -(this.width);
        if (Functions.randomGenerator(0, 1, true)) {
            // place off right screen width of ship moving left
            this.x = canvasConfig.width + this.width;
            this.velocityX *= -1;
        }
        this.value = this.getShipValue();
    }

    static nextShipDelay = spriteConfig.shipSpawnSec * 1000; // Convert seconds to milliseconds
    static nextShipTimer = Date.now() + EnemyShip.nextShipDelay;
    static isCreationTime() {
        if (Date.now() > EnemyShip.nextShipTimer) {
            EnemyShip.nextShipTimer = Date.now() + (EnemyShip.nextShipDelay * 1000);// put way out there.
            return true;
        }
        return false;
    }

    getValue(){
        return this.value;
    }

    getShipValue() {
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

    update(deltaTime) {
        super.update(deltaTime);
        
        // If ship off playing field, kill it
        if (this.isAlive()) {
            if (this.velocityX > 0) {
                // moving to right
                if (this.x > canvasConfig.width + this.width) {
                    this.setIsDead();
                }
            } else {
                // moving to left
                if (this.x < -(this.width)) {
                    this.setIsDead();
                }
            }
        }
    }

    setIsDead() {// required for when objectKillable calls setIsDead.
        super.setIsDead();
        EnemyShip.nextShipTimer = Date.now() + EnemyShip.nextShipDelay;
    }
}

export default EnemyShip;