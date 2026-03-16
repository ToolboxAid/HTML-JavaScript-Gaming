// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyShip.js

import { canvasConfig, spriteConfig } from './global.js'; // Import canvasConfig for canvas-related configurations
import GameCollision from '../../engine/game/gameCollision.js';
import RandomUtils from '../../engine/math/randomUtils.js';
import CanvasUtils from '../../engine/core/canvasUtils.js';


import ObjectSprite from '../../engine/objects/objectSprite.js';
import Sprite from '../../engine/core/sprite.js';
import Timer from '../../engine/utils/timer.js';

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

        const pixelSize = spriteConfig.pixelSize || 1;
        super(0, spriteConfig.shipY, EnemyShip.livingFrames, EnemyShip.dyingFrames, pixelSize);
        this.velocityX = spriteConfig.shipVelX;
        this.setSpriteColor(spriteConfig.shipColor);

        this.nextShipTimer = new Timer(EnemyShip.nextShipDelay);
        console.log(EnemyShip.nextShipDelay)
        this.setIsDead();

        this.value = 0;
        this.scorePopupFrame = null;
        this.scorePopupFramesRemaining = 0;
        this.scorePopupDelay = 0;
        this.pendingRespawnTimerReset = false;

        this.startAudio = false;
        this.stopAudio = false;

        EnemyShip.instance = this;
    }

    isCreationTime() {
        if (this.scorePopupFramesRemaining > 0 || this.pendingRespawnTimerReset) {
            return;
        }

        if (this.isDead() && this.nextShipTimer.isComplete()) {
            this.setIsAlive();
        }
    }

    getValue() {
        const value = this.value;
        this.value = 0;
        return value;
    }

    setValue() {
        const switchValue = RandomUtils.randomRange(0, 3, true);
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
    getStopAudio() {
        const stop = this.stopAudio;
        this.stopAudio = false;
        return stop;
    }

    update(deltaTime, laser) {
        // If ship off playing field, kill it
        super.update(deltaTime);
        if (this.isAlive()) {
            if (laser) {
                if (GameCollision.intersects(this, laser)) {
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
            this.updateScorePopup();
            this.isCreationTime();
        }
    }

    updateScorePopup() {
        if (this.scorePopupFramesRemaining <= 0) {
            return;
        }

        this.scorePopupFramesRemaining--;

        if (this.scorePopupFramesRemaining > 0) {
            return;
        }

        this.scorePopupFrame = null;

        if (this.pendingRespawnTimerReset) {
            this.nextShipTimer.reset();
            this.pendingRespawnTimerReset = false;
        }
    }

    setHit() {
        this.stopAudio = true;
        const width = canvasConfig?.width ?? 40;
        this.x = Math.max(25, Math.min(this.x, width - 100));
        this.setValue();
        const shipValue = `${this.value}`;
        const spacing = 2;
        this.scorePopupFrame = Sprite.getText(shipValue, spacing);
        this.scorePopupDelay = 120;
        this.scorePopupFramesRemaining = this.scorePopupDelay;
        this.pendingRespawnTimerReset = true;
        this.setIsDead();
    }

    draw() {
        if (this.isAlive()) {
            super.draw();
            return;
        }

        if (this.scorePopupFrame && this.scorePopupFramesRemaining > 0) {
            const popupX = this.x;
            const popupY = this.y - 10;
            CanvasUtils.drawSprite(popupX, popupY, this.scorePopupFrame, this.pixelSize, this.spriteColor);
        }
    }

    setIsAlive() {
        super.setIsAlive();        
        this.startAudio = true;
        this.scorePopupFrame = null;
        this.scorePopupFramesRemaining = 0;
        this.pendingRespawnTimerReset = false;

        // place off left screen the width of ship moving right
        this.x = -(this.width);
        this.velocityX = spriteConfig.shipVelX;

        if (RandomUtils.randomRange(0, 1, true)) {
            // place off right screen width of ship moving left
            this.x = canvasConfig.width + this.width;
            this.velocityX *= -1;
        }
    }

    setIsDead() {
        super.setIsDead();
        this.stopAudio = true;

        if (this.scorePopupFramesRemaining > 0) {
            this.pendingRespawnTimerReset = true;
            return;
        }

        this.nextShipTimer.reset();
    }

    //destroy(){ not valid as this is a Singleton Class -> getInstance() }
}

export default EnemyShip;


