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

        // // not sure this is needed, just being safe.
        // this.velocityX = 0;
        // this.velocityY = 0;

        this.angle = 0;

        // Tail properties
        this.previousPositions = []; // Array to store previous positions
        this.tailLength = 15; // Length of the tail

        if (Functions.randomGenerator(0, 1)) {
            this.reset(-(this.leftMin), this.leftMin);
        } else {
            this.reset(this.rightMin, this.rightMax);
        }
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


    checkPaddleCollision(paddle) {
        // Check if the puck is within the paddle's bounds
        if (
            this.x + this.width >= paddle.x &&
            this.x <= paddle.x + paddle.width &&
            this.y + this.height >= paddle.y &&
            this.y <= paddle.y + paddle.height
        ) {
            // Uncomment for debugging
            //console.log(`Puck Position: (${this.x}, ${this.y}), Size: ${this.size}`);
           // console.log(`Paddle Position: (${paddle.x}, ${paddle.y}), Width: ${paddle.width}, Height: ${paddle.height}`);
            let collisionSide;

            // Determine the side of collision
            const offsetLeft = Math.abs(this.x - paddle.x);
            const offsetRight = Math.abs(this.x - (paddle.x + paddle.width));
            const offsetTop = Math.abs(this.y - paddle.y);
            const offsetBottom = Math.abs(this.y - (paddle.y + paddle.height));

            // Find the smallest offset to determine the collision side
            const minOffset = Math.min(offsetLeft, offsetRight, offsetTop, offsetBottom);

            if (minOffset === offsetLeft) {
                collisionSide = 'left';
                this.x = paddle.x - this.width; // Push puck out of the paddle
                this.velocityX *= -1; // Reverse X velocity for left collision
            } else if (minOffset === offsetRight) {
                collisionSide = 'right';
                this.x = paddle.x + paddle.width; // Push puck out of the paddle
                this.velocityX *= -1; // Reverse X velocity for right collision
            } else if (minOffset === offsetTop) {
                collisionSide = 'top';
                this.y = paddle.y - this.width; // Push puck out of the paddle
                //this.velocityY *= -1; // Reverse Y velocity for top collision
            } else if (minOffset === offsetBottom) {
                collisionSide = 'bottom';
                this.y = paddle.y + paddle.height; // Push puck out of the paddle
                //this.velocityY *= -1; // Reverse Y velocity for bottom collision
            }

            // Log collision side immediately
            //console.log(`Collision detected on the ${collisionSide} side.`);
            return collisionSide; // Return the side of collision
        }

        return null; // No collision
    }
    
    update(ctx, leftPaddle, rightPaddle, deltaTime) {
        // Store the current position before updating
        this.previousPositions.push({ x: this.x, y: this.y });

        // Limit the length of the tail
        if (this.previousPositions.length > this.tailLength) {
            this.previousPositions.shift(); // Remove the oldest position
        }

        super.update(deltaTime);

        // Check for collisions with left and right paddles
        const leftCollision = this.checkPaddleCollision(leftPaddle);
        if (leftCollision) {
            this.handlePaddleCollision(leftPaddle, leftCollision);
            //console.log(`Left paddle collision: ${leftCollision}`);
        }

        const rightCollision = this.checkPaddleCollision(rightPaddle);
        if (rightCollision) {
            this.handlePaddleCollision(rightPaddle, rightCollision);
            //console.log(`Right paddle collision: ${rightCollision}`);
        }

        this.checkGameAreaBoundary(leftPaddle, rightPaddle, deltaTime);
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
        if (boundariesHit.includes('left') || boundariesHit.includes('right')) {
            this.velocityX *= -1;
            this.speedScore++;
            // Left Paddle
            if (boundariesHit.includes('left')) {
                this.x += this.velocityX * deltaTime;
                rightPaddle.incrementScore();
                this.reset(-(this.leftMin), this.leftMin);
            }
            // Right Paddle
            if (boundariesHit.includes('right')) {
                this.x -= this.velocityX * deltaTime; // prevent getting stuck to top or bottom
                leftPaddle.incrementScore();
                this.reset(this.rightMin, this.rightMax);
            }
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

    handlePaddleCollision(paddle, collisionSide) {
        //console.log(`paddle collision: ${collisionSide}`);
        if (collisionSide === 'top' || collisionSide === 'bottom') {
            this.velocityY *= -1;
            return;
        }
        
        // Calculate the offset from the center of the paddle    
        let paddleCenterY = paddle.y + (paddle.height / 2);
        let offsetY = (this.y + (this.height / 2)) - paddleCenterY;
        let offsetPercent = -(offsetY / (paddle.height / 2));

        // Reverse X direction
        this.velocityX *= -1;
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
        this.x = (canvasConfig.width / 2) - (this.width / 2);
        this.y = (canvasConfig.height / 2) - (this.height / 2);

        this.speed = this.speedDefault;
        this.speed += this.speedScore * 0.1;
        this.angle = Functions.randomGenerator(min, max);
this.angle = 0;         // temp remove
        this.setVelocity();
        this.velocityX *= -1;  // winner serves the puck
    }
}

export default Puck;
