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
    static direction = 1;
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

    /*
    constructor(row, colun, livingFrames, bombAggression) {

        const x = 10;
        const y = 10;
    */
    constructor(x, y, livingFrames, bombAggression) {

        super(x, y, livingFrames, Enemy.dyingFrames);

        // disable move enemy to next line.
        this.doMoveDown = false;
        this.moveDownDelay = 0;
        this.moveDownTime = 0;

        this.bombAggression = 3 + (bombAggression * 2);

        this.velocityX = 250;
        //        this.actionFrame = Enemy.enemyID;
        this.enemyID = ++Enemy.enemyID;
    }

    static changeDirections() {
        Enemy.direction *= -1;
    }

    static setSpeed(speed) {
        Enemy.speed = speed;
    }


    static enemyID = 0;

    static setID() {
        if (++Enemy.enemyID > 55 + 2) { // Number of remaining enemies
            Enemy.enemyID = 0;
        }
        console.log("setID: ", Enemy.enemyID);
    }

    update(deltaTime) {
        //     console.log("this.enemyID: ", this.enemyID);

        // Use === for comparison
        if (this.enemyID === Enemy.enemyID) {
            console.log("update", this.enemyID);
            super.update(deltaTime, true); // Ensure 'super.update' is valid
        }

        //  this.updateDyingFrames();
    }

    isDropBombTime() {
        const number = Functions.randomGenerator(0, 10000, true);
        return (number <= this.bombAggression);
    }

    setMoveDownTimer(moveDownDelay) {
        this.doMoveDown = true;
        this.moveDownTime = Date.now() + moveDownDelay;
    }

    checkMoveDown() {
        if (Date.now() >= this.moveDownTime && this.doMoveDown) {
            this.y += this.height;
            // Set the next drop time
            this.moveDownTime = Date.now() + this.moveDownDelay;
            this.doMoveDown = false;
        }
    }

    // Method to switch to the next frame
    nextFrame() {
        // this.currentFrameIndex = (this.currentFrameIndex + 1) % this.livingFrameCount;
        // this.x += (Enemy.move + Enemy.speed) * Enemy.direction;

        const atRightBound = Enemy.direction > 0 && this.x + (this.width * 1.45) + Enemy.speed > window.gameAreaWidth;
        const atLeftBound = Enemy.direction < 0 && this.x - Enemy.speed < (this.width * 0.25);

        return atRightBound || atLeftBound;
    }

}

export default Enemy;
