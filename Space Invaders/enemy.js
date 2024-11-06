// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemy.js

//import ObjectStatic from '../scripts/objectStatic.js'; // Ensure the class is capitalized

import ObjectDynamic from '../scripts/objectDynamic.js';
import ObjectKillable from '../scripts/objectKillable.js';
import CanvasUtils from '../scripts/canvas.js';
import Functions from '../scripts/functions.js';

class Enemy extends ObjectKillable {
    //   static direction = 1;
    static move = 10;
    static speed = 0;

    static remainingEnimy = 35;
    static frameDelay = (35 / 55) * 60;
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

    constructor(x, y, livingFrames, bombAggression) {

        super(x, y, livingFrames, Enemy.dyingFrames);

        this.bombAggression = 3 + (bombAggression * 2);

        this.velocityX = 250;
        this.enemyID = Enemy.enemyID++;
    }

    static setSpeed(speed) {
        Enemy.speed = speed;
    }


    static enemyID = 0;

    static setID() {
        if (Enemy.enemyID >= 54) { // Update to number of remaining enemies
            Enemy.enemyID = 0;
            console.log("Enemy.prepMoveDown: ", Enemy.prepMoveDown, "Enemy.doMoveDown", Enemy.doMoveDown);
            if (Enemy.prepMoveDown) {
                Enemy.prepMoveDown = false;
                Enemy.doMoveDown = true;
            } else {
                Enemy.doMoveDown = false;
            }
        } else {
            Enemy.enemyID++;
        }
        // console.log("setID: ", Enemy.enemyID);
    }

    static prepMoveDown = false;
    static doMoveDown = false;
    update(deltaTime) {
        // Use === for comparison
        if (this.enemyID === Enemy.enemyID || !this.isAlive()) {
            if (Enemy.doMoveDown) {
                this.velocityX *= -1;
                this.y += this.height;
            }
            super.update(deltaTime, true); // Ensure 'super.update' is valid
            if (this.atBounds()) {
                console.log("atbounds");
                Enemy.prepMoveDown = true;
            }
        }
    }

    isDropBombTime() {
        const number = Functions.randomGenerator(0, 10000, true);
        return (number <= this.bombAggression);
    }


    // Method to switch to the next frame
    atBounds() {
        console.log("this.velocityX: ", this.velocityX);
        let changeDir = false;
        if (this.velocityX > 0) {
            changeDir = this.x + (this.width * 1.45) + Enemy.speed > window.gameAreaWidth;
        } else {
            changeDir = this.x - Enemy.speed < (this.width * 0.25);
        }
        return changeDir;
    }

}

export default Enemy;
