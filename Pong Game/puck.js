// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// puck.js

import { canvasConfig, puckConfig } from './global.js'; // Import puck & canvas configuration

import CanvasUtils from '../scripts/canvas.js';

import ObjectDynamic from '../scripts/objectDynamic.js';
import Functions from '../scripts/functions.js';
//import Intersect from '../scripts/intersect.js';
import { AudioPlayer } from '../scripts/audioPlayer.js';

const debug = false;


class Puck extends ObjectDynamic {
    constructor() {
        const x = (canvasConfig.width / 2) - (puckConfig.width / 2);
        const y = (canvasConfig.height / 2) - (puckConfig.height / 2);

        super(x, y, puckConfig.width, puckConfig.height);

        this.color = puckConfig.color;
        this.speed = 0;
        this.speedIncrease = puckConfig.speedIncrease;
        this.speedDefault = puckConfig.speedDefault;
        this.speedScore = 0;

        // not sure this is needed, just being safe.
        this.velocityX = 0;
        this.velocityY = 0;

        this.angle = 0;

        // Tail properties
        this.previousPositions = []; // Array to store previous positions
        this.tailLength = 15; // Length of the tail

        if (Functions.randomGenerator(0, 1)) {
            this.reset(-45, 45);
        } else {
            this.reset(135, 225);
        }

        this.multAngle = 90;
        this.num = 30;
        this.leftMin = 45 + this.num;
        this.leftMax = 315 - this.num;
        this.rightMin = 135 - this.num;
        this.rightMax = 225 + this.num;
    }

    draw(ctx) {
        // Draw the tail
        for (let i = 0; i < this.previousPositions.length; i++) {
            const pos = this.previousPositions[i];
            ctx.fillStyle = `rgba(255, 255, 255, ${(1 - ((this.tailLength - i) / this.tailLength)) * 0.15})`; // Fade effect
            ctx.beginPath();
            //ctx.arc(pos.x, pos.y, this.width / 2, 0, Math.PI * 2); // Draw a circle for each position
            ctx.fillRect(pos.x, pos.y, this.width, this.height);
            ctx.fill();
        }

        super.draw(ctx, puckConfig.color);
    }

    update(ctx, leftPaddle, rightPaddle, deltaTime) {
        // Store the current position before updating
        this.previousPositions.push({ x: this.x, y: this.y });

        // Limit the length of the tail
        if (this.previousPositions.length > this.tailLength) {
            this.previousPositions.shift(); // Remove the oldest position
        }

        super.update(deltaTime);

        this.checkGameAreaBoundary(leftPaddle, rightPaddle, deltaTime)

        // check collision with paddle
        if (this.velocityX > 0) { // Right paddle
            this.vectorCollisionFront(ctx, rightPaddle, deltaTime);
            this.vectorCollisionTop(ctx, rightPaddle, deltaTime);
            this.vectorCollisionBottom(ctx, rightPaddle, deltaTime);
        } else { // Left paddle
            this.vectorCollisionFront(ctx, leftPaddle, deltaTime);
            this.vectorCollisionTop(ctx, leftPaddle, deltaTime);
            this.vectorCollisionBottom(ctx, leftPaddle, deltaTime);
        }
    }

    playBounceSound() {
        // Ball Bounce Sound:
        // Frequency: Approximately 400 Hz
        // Duration: Around 100 milliseconds
        // Description: A short beep sound that played whenever the ball hit the paddles or the walls.
        AudioPlayer.playFrequency(400, 0.1);
    }

    checkGameAreaBoundary(leftPaddle, rightPaddle, deltaTime) {
        const boundariesHit = this.checkCollisionWithBounds(canvasConfig.width, canvasConfig.height);

        // Call the checkCollisionWithBounds function
        // Top/Bottom  - adjust Y direction
        if (boundariesHit.includes('top') || boundariesHit.includes('bottom')) {
            this.playBounceSound();
        }

        // Adjust scores for left & right
        // Left Paddle
        if (boundariesHit.includes('left')) {
            this.velocityX *= -1;
            this.x += this.velocityX * deltaTime;
            rightPaddle.incrementScore();
            this.speedScore++;
            this.reset(-45, 45);
        }
        // Right Paddle
        if (boundariesHit.includes('right')) {
            this.velocityX *= -1;
            this.x -= this.velocityX * deltaTime; // prevent getting stuck to top or bottom
            leftPaddle.incrementScore();
            this.speedScore++;
            this.reset(135, 225);
        }
    }

    vectorCollisionFront(ctx, paddle, deltaTime) {
        // Puck line
        const line1start = { x: this.x, y: this.y }
        const line1end = { x: this.x + (this.velocityX * deltaTime), y: this.y + (this.velocityY * deltaTime) }

        let line2start = { x: paddle.x, y: paddle.y };
        let line2end = { x: paddle.x, y: paddle.y + paddle.height };

        // Paddle Line
        if (paddle.isLeft) {
            line2start = { x: paddle.x + paddle.width, y: paddle.y };
            line2end = { x: paddle.x + paddle.width, y: paddle.y + paddle.height };
        }

        if (debug) {
            CanvasUtils.drawLineFromPoints(ctx, line1start, line1end);
            CanvasUtils.drawLineFromPoints(ctx, line2start, line2end);
        }

        const boundariesHit = this.checkCollisionWithObject(paddle, deltaTime);

        if (boundariesHit.includes('left') || boundariesHit.includes('right')) {
            // Here you could add logic to handle the left-side collision specifically
            this.handlePaddleCollision(paddle);
            this.playBounceSound();
        }
    }

    vectorCollisionTop(ctx, paddle, deltaTime) {
        // Puck line
        const line1start = { x: this.x, y: this.y }
        const line1end = { x: this.x + (this.velocityX * deltaTime), y: this.y + (this.velocityY * deltaTime) }

        let line2start = { x: paddle.x, y: paddle.y };
        let line2end = { x: paddle.x + paddle.width, y: paddle.y };


        if (debug) {//         Draw Paddle Top Line
            CanvasUtils.drawLineFromPoints(ctx, line1start, line1end);
            CanvasUtils.drawLineFromPoints(ctx, line2start, line2end);
        }

        const intersection = Functions.linesIntersect(line1start, line1end, line2start, line2end);
        if (intersection) {
            this.velocityY *= -1;
        }
    }

    vectorCollisionBottom(ctx, paddle, deltaTime) {
        // Puck line
        const line1start = { x: this.x, y: this.y }
        const line1end = { x: this.x + (this.velocityX * deltaTime), y: this.y + (this.velocityY * deltaTime) }

        let line2start = { x: paddle.x, y: paddle.y + paddle.height };
        let line2end = { x: paddle.x + paddle.width, y: paddle.y + paddle.height };


        if (debug) {
            CanvasUtils.drawLineFromPoints(ctx, line1start, line1end);
            CanvasUtils.drawLineFromPoints(ctx, line2start, line2end);
        }

        const intersection = Functions.linesIntersect(line1start, line1end, line2start, line2end);
        if (intersection) {
            this.velocityY *= -1;
        }
    }

    handlePaddleCollision(paddle) {

        const multAngle = 90;
        const num = 30;
        const leftMin = 45+num;
        const leftMax = 315-num;
        const rightMin = 135-num;
        const rightMax = 225+num;

        this.velocityX *= -1; // Reverse X direction

        // Calculate the offset from the center of the paddle    
        let paddleCenterY = paddle.y + paddle.height / 2;
        let offsetY = this.y - paddleCenterY;
        let offsetPercent = -(offsetY / (paddle.height / 2));

        // Exponentially increase the angle based on the offset from the edges
        // The closer to the edges (|offsetPercent| > 0.5), the more the angle changes
        let exponentialFactor = Math.sign(offsetPercent) * Math.pow(Math.abs(offsetPercent), 2);

        // Calculate the new angle based on the offset from the paddle center
        let angle = Functions.calculateXY2Angle(this.velocityX, this.velocityY);

        console.log(this.angle);
        this.angle = angle + (exponentialFactor * multAngle);

        // Adjust the angle based on the offset
        if (paddle.isLeft) {
            this.angle = angle + (offsetY * 1.0);
            this.angle = (this.angle + 360) % 360;

            if (this.angle < leftMin || this.angle > leftMax) {
                // angle good
            } else if (this.angle > 180) {
                this.angle = leftMax;
            } else {
                this.angle = leftMin;
            }
        } else {
            this.angle = angle - (offsetY * 1.0);
            this.angle = (this.angle + 360) % 360;
            if (this.angle < rightMin) {
                this.angle = rightMin;
            }
            if (this.angle > rightMax) {
                this.angle = rightMax;
            }
        }
        console.log(this.angle);
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
        // Place puck at center of screen
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
        this.x = canvasConfig.width / 2;
        this.y = canvasConfig.height / 2;

        this.speed = this.speedDefault;
        this.speed += this.speedScore * 0.1;
        this.angle = Functions.randomGenerator(min, max);
        this.angle = Functions.randomGenerator(0, 0);
        this.setVelocity();
        this.velocityX *= -1;  // winner serves the puck
    }
}

export default Puck;
