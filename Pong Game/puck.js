// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// puck.js

import { canvasConfig, puckConfig } from './global.js'; // Import puck & canvas configuration

import CanvasUtils from '../scripts/canvas.js';

import ObjectDynamic from '../scripts/objectDynamic.js';
import Functions from '../scripts/functions.js';
import Timer from '../scripts/timer.js';

import AudioPlayer from '../scripts/audioPlayer.js';

class Puck extends ObjectDynamic {

    // Defining properties as "constant-like"
    num = 20;
    leftMin = 45 + this.num;
    leftMax = 315 - this.num;
    rightMin = 135 - this.num;
    rightMax = 225 + this.num;
    maxAngle = (this.rightMax - this.rightMin) / 2;

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

        // puck reset movement delay 
        this.actionTimer = new Timer(2000);

        // First volly is random.
        if (Functions.randomRange(0, 1)) {
            this.reset(-(this.leftMin), this.leftMin);
        } else {
            this.reset(this.rightMin, this.rightMax);
        }
    }

    processCollisionPoint(paddle) {
        if (Puck.paddleTopBottomHit === true) {
            return;
        }

        const sides = this.isCollidingWithSides(paddle);

        // Check if the paddle is within the paddle's bounds
        if (sides.length !== 0) {
            // Define the edges of the paddle
            const leftEdge = paddle.x;
            const rightEdge = paddle.x + paddle.width;
            const topEdge = paddle.y;
            const bottomEdge = paddle.y + paddle.height;

            // Define the puck's edges
            const puckLeftEdge = this.x;
            const puckRightEdge = this.x + this.width;
            const puckTopEdge = this.y;
            const puckBottomEdge = this.y + this.height;

            // Determine the side of collision using line-based logic
            const overlapLeft = puckRightEdge - leftEdge;  // Distance puck has passed into the left edge
            const overlapRight = rightEdge - puckLeftEdge; // Distance puck has passed into the right edge
            const overlapTop = puckBottomEdge - topEdge;   // Distance puck has passed into the top edge
            const overlapBottom = bottomEdge - puckTopEdge;// Distance puck has passed into the bottom edge

            // Find the smallest overlap to determine the collision side
            const smallestOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            const offset = 0;
            // Determine which side was hit based on the smallest overlap
            if (smallestOverlap === overlapLeft) {
                this.x = paddle.x - this.width - offset; // Push 'this' out of the paddle
                this.handlePuckCollisionSides(paddle);
            }
            if (smallestOverlap === overlapRight) {
                this.x = paddle.x + paddle.width + offset; // Push 'this' out of the paddle
                this.handlePuckCollisionSides(paddle);
            }

            if (smallestOverlap === overlapTop) {
                this.y = paddle.y - this.height; // Push 'this' out of the paddle
                this.velocityY *= -1; // Reverse Y velocity for top collision
                Puck.paddleTopBottomHit = true;
            }
            if (smallestOverlap === overlapBottom) {
                this.y = paddle.y + paddle.height; // Push 'this' out of the paddle
                this.velocityY *= -1; // Reverse Y velocity for bottom collision
                Puck.paddleTopBottomHit = true;
            }
        }
    }

    handleTail() {
        // Store the current position before updating
        this.previousPositions.push({ x: this.x, y: this.y });

        // Limit the length of the tail
        if (this.previousPositions.length > this.tailLength) {
            this.previousPositions.shift(); // Remove the oldest position
        }
    }

    static paddleTopBottomHit = false;
    update(leftPaddle, rightPaddle, deltaTime) {

        // Check timer status
        if (this.actionTimer.isComplete()) {
            super.update(deltaTime);
        }

        this.handleTail();

        this.processCollisionPoint(leftPaddle, true);
        this.processCollisionPoint(rightPaddle, true);

        this.checkGameAreaBoundary(leftPaddle, rightPaddle, deltaTime);
    }

    playBounceSound() {
        // Ball Bounce Sound:
        // Frequency: Approximately 400 Hz
        // Duration: Around 100 milliseconds
        // Description: A short beep sound that played whenever the ball hit the paddles or the walls.
        AudioPlayer.playFrequency(440, 0.1);
    }

    handlePuckCollisionSides(paddle) {
        this.playBounceSound();

        // find percent of paddle for angle adjust (+/-)maxAngle
        let offsetY = this.getCenterPoint().y - paddle.getCenterPoint().y;
        let offsetPercent = offsetY / (paddle.height / 2);

        // set new angle based on offsetPercent
        this.angle = this.maxAngle * offsetPercent;

        if (!paddle.isLeft) { // reverse for right paddle.
            this.angle = (this.angle * -1) + 180;
        }

        this.angle = Functions.degreeLimits(this.angle);

        // Set the puck's velocity based on the new angle
        this.setVelocity();
    }

    setVelocity() {
        const coordinates = Functions.calculateAngle2XY(this.angle);

        this.speed += this.speedIncrease;

        this.velocityX = coordinates.x * this.speed;
        this.velocityY = coordinates.y * this.speed;
    }

    draw() {
        // Draw puck
        super.draw(puckConfig.color);

        // Draw the tail
        for (let i = 0; i < this.previousPositions.length; i++) {
            const pos = this.previousPositions[i];
            CanvasUtils.ctx.fillStyle = `rgba(255, 255, 255, ${(1 - ((this.tailLength - i) / this.tailLength)) * 0.15})`; // Fade effect
            CanvasUtils.ctx.beginPath();
            CanvasUtils.ctx.fillRect(pos.x, pos.y, this.width, this.height);
            CanvasUtils.ctx.fill();
        }
    }

    checkGameAreaBoundary(leftPaddle, rightPaddle) { // score or bounce
        const boundariesHit = this.checkGameBounds();

        // Top/Bottom  - adjust Y direction
        if (boundariesHit.includes('top') || boundariesHit.includes('bottom')) {
            this.velocityY *= -1; // Reverse direction            
            this.playBounceSound();

            if (boundariesHit.includes('top')) {
                this.y = 0; // Prevent moving out of bounds at the top
            }
            if (boundariesHit.includes('bottom')) {
                this.y = canvasConfig.height - this.height; // Prevent moving out of bounds at the bottom
            }
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

    static doUpdate = true;
    reset(min, max) {// Place puck at center of screen and move tward loser.
        Puck.paddleTopBottomHit = false;
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
        this.angle = Functions.randomRange(min, max);
        this.setVelocity();
        this.velocityX *= -1;  // winner serves the puck

        Puck.doUpdate = false;

        this.actionTimer.reset();
    }
}

export default Puck;
