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
    static remainingEnemies = 54;
    static maximumEnemies = 54;

    constructor(x, y, livingFrames, bombAggression) {

        super(x, y, livingFrames, Enemy.dyingFrames);

        this.bombAggression = 3 + (bombAggression * 2);

        this.velocityX = 250;
        this.enemyID = Enemy.enemyID++;
    }

    static setRemainingEnemies(count) {
        Enemy.remainingEnemies = count;
    }

    static setNextID() {
        if (Enemy.remainingEnemies > Enemy.enemyID) {
            Enemy.enemyID++;
        } else {
            Enemy.enemyID = 0;
            if (Enemy.prepMoveDown) {
                Enemy.prepMoveDown = false;
                Enemy.doMoveDown = true;
            } else {
                Enemy.doMoveDown = false;
            }
        }
    }

    static resetEnemyID(){
        Enemy.remainingEnemiesyID = 0;
    }
    doResetEnemyID() {
        const newID = Enemy.remainingEnemiesyID++;        
        console.log("ID: ", this.enemyID, " newID: ",newID);
        this.enemyID = newID;
        // Increase speed 
        if (this.velocityX > 0) {
            this.velocityX += (Enemy.maximumEnemies - Enemy.remainingEnemies);
        } else {
            this.velocityX -= (Enemy.maximumEnemies - Enemy.remainingEnemies);
        }
        //console.log(this.velocityX);
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

            super.update(deltaTime, true);
            //            console.log("update b", this.enemyID, this.x);
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


    atBounds() {
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
