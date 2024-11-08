// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemy.js

import ObjectKillable from '../scripts/objectKillable.js';
import CanvasUtils from '../scripts/canvas.js';
import Functions from '../scripts/functions.js';
import { enemyConfig, spriteConfig } from './global.js';

class Enemy extends ObjectKillable {
    static speed = 0;

    static dyingFrames = [
        [
            "100100010001",
            "010010100010",
            "001001000100",
            "110100001011",
            "001001000100",
            "010010100010",
            "100100010001",
        ],
        [
            "000000000000",
            "010010100010",
            "001001000100",
            "010100001010",
            "001001000100",
            "010010100010",
            "000000000000",
        ],
        [
            "000000000000",
            "000000000000",
            "001001000100",
            "000101101000",
            "001001000100",
            "000000000000",
            "000000000000",
        ],
        [
            "000000000000",
            "000000000000",
            "000101001000",
            "000011110000",
            "000101001000",
            "000000000000",
            "000000000000",
        ],
    ];

    static enemyID = 0;
    static nextID = 0;

    static remainingEnemies = 54;
    static maximumEnemies = 54;
    static newSpeed = (Enemy.maximumEnemies - Enemy.remainingEnemies);

    // Enemy configurations for octopus, squid, and crab
    static enemyRow = 0;
    static enemyCol = 0;

    static enemiesInitialized = false;

    static getRow() {
        return Enemy.enemyRow;
    }

    static getEnemiesInitialized() {
        return Enemy.enemiesInitialized;
    }

    static setNextID() {
        if (Enemy.remainingEnemies > Enemy.nextID) {
            Enemy.nextID++;
        } else {
            Enemy.nextID = 0;

            if (Enemy.prepMoveDown) {
                Enemy.prepMoveDown = false;
                Enemy.doMoveDown = true;
            } else {
                Enemy.doMoveDown = false;
            }

            if (Enemy.prepSpeed) {
                Enemy.prepSpeed = false;
                Enemy.doSpeed = true;
                Enemy.setSpeed();
            } else {
                Enemy.doSpeed = false;
            }
        }
    }

    static reorgID = 0;
    reorgID() {
        this.enemyID = Enemy.reorgID++;
        Enemy.prepSpeed = true;
    }
   
    static setSpeed() {
        Enemy.newSpeed = (Enemy.maximumEnemies - Enemy.remainingEnemies) / 3;
    }

    static getKey(row, column) {
        return Enemy.enemyRow + "x" + Enemy.enemyCol;
    }

    constructor(livingFrames, bombAggression) {
        const frameWidth = CanvasUtils.spriteWidthHeight(livingFrames[0], spriteConfig.pixelSize);
        const x = enemyConfig.xPosition + (Enemy.enemyCol * enemyConfig.xSpacing) - (frameWidth.width / 2);
        const y = enemyConfig.yPosition - (Enemy.enemyRow * enemyConfig.ySpacing);

        super(x, y, livingFrames, Enemy.dyingFrames);

        this.key = Enemy.getKey(Enemy.enemyRow, Enemy.enemyCol);

        this.bombAggression = 15 + (bombAggression * 25);

        this.velocityX = 250; //1250;
        this.enemyID = Enemy.enemyID++;

        if (++Enemy.enemyCol >= enemyConfig.colSize) {
            Enemy.enemyCol = 0;
            if (++Enemy.enemyRow >= enemyConfig.rowSize) {
                Enemy.enemiesInitialized = true;
            }
        }
    }

    adjustSpeed(deltaTime) {
        // Increase speed 
        if (this.velocityX > 0) {
            this.velocityX += Enemy.newSpeed;
        } else {
            this.velocityX -= Enemy.newSpeed;
        }
    }

    static prepSpeed = false;
    static doSpeed = false;

    static prepMoveDown = false;
    static doMoveDown = false;
    update(deltaTime) {
        // Use `===` for comparison
        if (this.enemyID === Enemy.nextID) {
            if (Enemy.doMoveDown) {
                this.velocityX *= -1;
                this.y += this.height;
            }
            if (Enemy.doSpeed) {
                this.adjustSpeed(deltaTime);
            }

            super.update(deltaTime, true);

            if (this.atBounds()) {
                Enemy.prepMoveDown = true;
            }
        } else {
            if (this.isDying()) {
                super.update(deltaTime, true);
            }
        }
    }

    atBounds() {
        let changeDir = false;
        if (!(Enemy.preMoveDown || Enemy.doMoveDown)) {
            if (this.velocityX > 0) {
                changeDir = this.x + (this.width * 1.45) + Enemy.speed > window.gameAreaWidth;
            } else {
                changeDir = this.x - Enemy.speed < (this.width * 0.25);
            }
        }
        return changeDir;
    }

    isDropBombTime() {
        const randomNumber = Functions.randomGenerator(0, 10000, true);
        return (randomNumber <= this.bombAggression);
    }

    toString() {
        console.log(`Key: ${this.key}, Status: ${this.status}, velocityX ${this.velocityX}`);
    }

}

export default Enemy;
