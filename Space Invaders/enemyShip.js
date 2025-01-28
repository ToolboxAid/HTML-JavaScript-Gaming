// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyShip.js

import { canvasConfig, spriteConfig } from './global.js'; // Import canvasConfig for canvas-related configurations
import Functions from '../scripts/functions.js';
import ObjectSprite from '../scripts/objectSprite.js';
import Sprite from '../scripts/sprite.js';

class EnemyShip extends ObjectSprite {

    // Explicit static declaration
    static instance = null;
    static nextShipDelay = spriteConfig.shipSpawnSec * 1000; // Convert seconds to milliseconds

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

    // Get SINGLETON instance method
    static getInstance() {
        if (!EnemyShip.instance) {
            EnemyShip.instance = new EnemyShip();
        }
        return EnemyShip.instance;
    }

    constructor() {
        // Check if an instance already exists
        if (EnemyShip.instance) {
            return EnemyShip.instance;
        }

        super(0, spriteConfig.shipY, EnemyShip.livingFrames, EnemyShip.dyingFrames,spriteConfig.pixelSize);
        this.velocityX = spriteConfig.shipVelX;
        this.setSpriteColor(spriteConfig.shipColor);

        this.nextShipTimer = 0;
        this.setIsDead();

        this.value = 0;

        this.startAudio = false;
        this.stopAudio = false;

        EnemyShip.instance = this;
    }

    isCreationTime() {
        if (this.isDead() && Date.now() > this.nextShipTimer) {
            this.setIsAlive();
            this.startAudio = true;
        }
    }

    getValue() {
        const value = this.value;
        this.value = 0;
        return value;
    }

    setValue() {
        const switchValue = Functions.randomRange(0, 3, true);
        switch (switchValue) {
            case 0:
                this.value = 50;
                break;
            case 1:
                this.value = 100;
                break;
            case 2:
                this.value = 250;
                break;
            case 3:
                this.value = 500;
                break;
        }
    }

    getStartAudio() {
        const start = this.startAudio;
        this.startAudio = false;
        return start;
    }
    getStopAudio(){
        const stop = this.stopAudio;
        this.stopAudio = false;
        return stop;
    }

    update(deltaTime, laser) {
        // If ship off playing field, kill it
        super.update(deltaTime);
        if (this.isAlive()) {
            if (laser) {
                if (this.isCollidingWith(laser)) {
                    this.setHit();
                    this.stopAudio = true;
                }
            }
            if (this.velocityX > 0) { // moving to right
                if (this.x > canvasConfig.width + this.width) {
                    this.setIsDead();
                    this.stopAudio = true;
                }
            } else { // moving to left
                if (this.x < -(this.width)) {
                    this.setIsDead();
                    this.stopAudio = true;
                }
            }
        } else {
            this.isCreationTime();
        }
    }

    setHit() {
        this.setValue()
        const shipValue = `${this.value}`;
        const spacing = 2;
        const someFrame = Sprite.getText(shipValue, spacing);
        const someOther = Sprite.getFromText(shipValue, spacing);
console.log(someFrame,someOther);
        const displayFrames = 60;
        this.setOtherFrame(displayFrames, someFrame);
        super.setHit();
    }
    
    setIsAlive() {
        super.setIsAlive();
        // place off left screen the width of ship moving right
        this.x = -(this.width);
        this.velocityX = spriteConfig.shipVelX;
        
        if (Functions.randomRange(0, 1, true)) {
            // place off right screen width of ship moving left
            this.x = canvasConfig.width + this.width;
            this.velocityX *= -1;
        }

        // prevent acidental double, way out there.
        this.nextShipTimer = Date.now() + (EnemyShip.nextShipDelay * 10); //1000);
    }

    setIsDying(){
        super.setIsDying();
        this.stopAudio = true;
    }

    setIsDead() {
        super.setIsDead();
        this.nextShipTimer = Date.now() + EnemyShip.nextShipDelay;
    }
}

export default EnemyShip;