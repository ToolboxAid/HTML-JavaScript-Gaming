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

    static dyingFrames = [
        [
            "000001100000",
            "010011110010",
            "000111111000",
            "001011111100",
            "011111111110",
            "010111111010",
            "000001100000",
        ],
        [
            "000000000000",
            "001001100100",
            "010111111010",
            "001111111100",
            "010111111010",
            "001001100100",
            "000000000000",
        ],
        [
            "000000000000",
            "000110011000",
            "000101010000",
            "000011110000",
            "000010010000",
            "000000000000",
            "000000000000",
        ],
        [
            "000000000000",
            "000000000000",
            "000001100000",
            "000000100000",
            "000000000000",
            "000000000000",
            "000000000000",
        ]
    ];

    constructor(x, y, livingFrames, bombAggression) {
        super(x, y, livingFrames, Enemy.dyingFrames);

        // disable move enemy to next line.
        this.doMoveDown = false;
        this.moveDownDelay = 0;
        this.moveDownTime = 0;

        this.bombAggression = 3 + (bombAggression * 2);
    }

    static changeDirections() {
        Enemy.direction *= -1;
    }

    static setSpeed(speed) {
        Enemy.speed = speed;
    }

    update() {
        this.updateDyingFrames();
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
        this.currentFrameIndex = (this.currentFrameIndex + 1) % this.livingFrameCount;
        this.x += (Enemy.move + Enemy.speed) * Enemy.direction;

        const atRightBound = Enemy.direction > 0 && this.x + (this.width * 1.45) + Enemy.speed > window.gameAreaWidth;
        const atLeftBound = Enemy.direction < 0 && this.x - Enemy.speed < (this.width * 0.25);

        return atRightBound || atLeftBound;
    }

}

export default Enemy;
