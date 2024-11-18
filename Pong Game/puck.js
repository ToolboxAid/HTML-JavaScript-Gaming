// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// puck.js

import { canvasConfig, puckConfig } from './global.js'; // Import puck & canvas configuration

import CanvasUtils from '../scripts/canvas.js';

import ObjectDynamic from '../scripts/objectDynamic.js';
import Functions from '../scripts/functions.js';
import { AudioPlayer } from '../scripts/audioPlayer.js';
const debug = false;

class Puck extends ObjectDynamic {

    // Defining properties as "constant-like"
    multAngle = 90;
    num = 10;
    leftMin = 45 + this.num;
    leftMax = 315 - this.num;
    rightMin = 135 - this.num;
    rightMax = 225 + this.num;

    constructor() {
        const x = (canvasConfig.width / 2) - (puckConfig.width / 2);
        const y = (canvasConfig.height / 2) - (puckConfig.height / 2);

        super(x, y, puckConfig.width, puckConfig.height);

        this.color = puckConfig.color;
        this.speed = 0;
        this.speedIncrease = puckConfig.speedIncrease;
        this.speedDefault = puckConfig.speedDefault;
        this.speedScore = 0;

        // Tail properties
        this.previousPositions = []; // Array to store previous positions
        this.tailLength = 15; // Length of the tail

        // First volly is random.
        if (Functions.randomGenerator(0, 1)) {
            this.reset(-(this.leftMin), this.leftMin);
        } else {
            this.reset(this.rightMin, this.rightMax);
        }
    }

    draw() {
        // Draw the tail
        for (let i = 0; i < this.previousPositions.length; i++) {
            const pos = this.previousPositions[i];
            CanvasUtils.ctx.fillStyle = `rgba(255, 255, 255, ${(1 - ((this.tailLength - i) / this.tailLength)) * 0.15})`; // Fade effect
            CanvasUtils.ctx.beginPath();
            CanvasUtils.ctx.fillRect(pos.x, pos.y, this.width, this.height);
            CanvasUtils.ctx.fill();
        }

        super.draw(puckConfig.color);
    }

    update(leftPaddle, rightPaddle, deltaTime) {
        super.update(deltaTime);

        // Store the current position before updating
        this.previousPositions.push({ x: this.x, y: this.y });

        // Limit the length of the tail
        if (this.previousPositions.length > this.tailLength) {
            this.previousPositions.shift(); // Remove the oldest position
        }

        // Check for collisions with left and right paddles
        const leftCollision = this.processCollisionWith(leftPaddle);
        if (leftCollision) {
            this.handlePaddleCollision(leftPaddle, leftCollision);
        }

        const rightCollision = this.processCollisionWith(rightPaddle);
        if (rightCollision) {
            this.handlePaddleCollision(rightPaddle, rightCollision);
        }

        this.checkGameAreaBoundary(leftPaddle, rightPaddle, deltaTime);
    }

    playBounceSound() {
        // Ball Bounce Sound:
        // Frequency: Approximately 400 Hz
        // Duration: Around 100 milliseconds
        // Description: A short beep sound that played whenever the ball hit the paddles or the walls.
        AudioPlayer.playFrequency(440, 0.1);
    }

    checkGameAreaBoundary(leftPaddle, rightPaddle, deltaTime) {
        const boundariesHit = this.checkCollisionWithBounds(canvasConfig.width, canvasConfig.height);

        // Call the checkCollisionWithBounds function
        // Top/Bottom  - adjust Y direction
        if (boundariesHit.includes('top') || boundariesHit.includes('bottom')) {
            this.playBounceSound();
        }

        // Adjust scores for left & right
        if (boundariesHit.includes('left') || boundariesHit.includes('right')) {
            this.speedScore++;
            // Left Paddle
            if (boundariesHit.includes('left')) {
                rightPaddle.incrementScore();
                this.reset(-(this.leftMin), this.leftMin);
            }
            // Right Paddle
            if (boundariesHit.includes('right')) {
                leftPaddle.incrementScore();
                this.reset(this.rightMin, this.rightMax);
            }
        }
    }

    handlePaddleCollision(paddle, collisionSide) {
        this.playBounceSound();

        if (collisionSide === 'top' || collisionSide === 'bottom') {
            return;
        }

        let offsetY = this.getCenterPoint().y - paddle.getCenterPoint().y;
        let offsetPercent = -(offsetY / (paddle.height / 2));
        
        // Calculate the new angle based on velocityX change
        let angle = Functions.calculateXY2Angle(this.velocityX, this.velocityY);

        let expo = (offsetPercent ** 2);
        if (offsetY > 0) {
            expo *= -1;
        }
        expo *= this.multAngle;

        // Adjust the angle based on the offset
        if (paddle.isLeft) {
            this.angle = angle - expo;
            this.angle = (this.angle + 360) % 360;

            if (this.angle < this.leftMin || this.angle > this.leftMax) {
                // angle good
            } else if (this.angle > 180) {
                this.angle = this.leftMax;
            } else {
                this.angle = this.leftMin;
            }
        } else {
            //this.angle = angle - (offsetY * 1.0);
            this.angle = angle + expo;
            this.angle = (this.angle + 360) % 360;
            if (this.angle < this.rightMin) {
                this.angle = this.rightMin;
            }
            if (this.angle > this.rightMax) {
                this.angle = this.rightMax;
            }
        }

        // Set the puck's velocity based on the new angle
        this.setVelocity();
    }

    setVelocity() {
        this.speed += this.speedIncrease;

        const coordinates = Functions.calculateAngle2XY(this.angle); // Call the method

        this.velocityX = coordinates.x * this.speed;
        this.velocityY = coordinates.y * this.speed;
    }

    reset(min, max) {
        // Place puck at center of screen and move tward loser.

        /* Angle direction of travel
            270 is up

            315 if up and right
            0 is right
            45 is right and down

            90 is down
            
            135 is down and left
            180 is left
            225 is left and up
        */
        this.setPosition((canvasConfig.width / 2) - (this.width / 2), (canvasConfig.height / 2) - (this.height / 2));

        this.speed = this.speedDefault;
        this.speed += this.speedScore * 0.1;
        this.angle = Functions.randomGenerator(min, max);
        this.setVelocity();
        this.velocityX *= -1;  // winner serves the puck
    }
}

export default Puck;
