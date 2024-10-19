// ToolboxAid.com
// David Quesenberry
// puck.js
// 10/16/2024

import { puckConfig } from './global.js'; // Import puck configuration
import { canvasConfig } from './global.js'; // Import canvas configuration

import CanvasUtils from '../scripts/canvas.js';

import ObjectDynamic from '../scripts/objectDynamic.js';
import Functions from '../scripts/functions.js';
//import Intersect from '../scripts/intersect.js';

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
    }

    draw(ctx) {
        // Draw the tail
        for (let i = 0; i < this.previousPositions.length; i++) {
            const pos = this.previousPositions[i];
            ctx.fillStyle = `rgba(255, 255, 255, ${(1 - ((this.tailLength-i) / this.tailLength)) * 0.15})`; // Fade effect
            ctx.beginPath();
            //ctx.arc(pos.x, pos.y, this.width / 2, 0, Math.PI * 2); // Draw a circle for each position
            ctx.fillRect(pos.x - this.width / 2, pos.y - this.height / 2, this.width, this.height);
            ctx.fill();
        }

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }

    move(leftPaddle, rightPaddle, ctx) {
        // Store the current position before updating
        this.previousPositions.push({ x: this.x, y: this.y });

        // Limit the length of the tail
        if (this.previousPositions.length > this.tailLength) {
            this.previousPositions.shift(); // Remove the oldest position
        }

        this.x += this.velocityX;
        this.y += this.velocityY;

        this.checkGameAreaBoundary(leftPaddle, rightPaddle);
        //checkCollisionWithBounds

        if (this.velocityX > 0) {
            this.vectorCollisionFront(ctx, rightPaddle);
            this.vectorCollisionTop(ctx, rightPaddle);
            this.vectorCollisionBottom(ctx, rightPaddle);
        } else {
            this.vectorCollisionFront(ctx, leftPaddle);
            this.vectorCollisionTop(ctx, leftPaddle);
            this.vectorCollisionBottom(ctx, leftPaddle);
        }
    }

    playBounceSound(){
        // Ball Bounce Sound:
        // Frequency: Approximately 400 Hz
        // Duration: Around 100 milliseconds
        // Description: A short beep sound that played whenever the ball hit the paddles or the walls.
        Functions.playSound(400, 0.1);        
    }

    checkGameAreaBoundary(leftPaddle, rightPaddle) {
        // Check if wall hit:
        // - adjust scores for left & right
        // - adjust Y direction for top & bottom
        // Left Paddle
        if (this.x + this.width / 2 > canvasConfig.width) {
            this.velocityX *= -1;
            this.x += this.velocityX;
            leftPaddle.incrementScore();
            this.speedScore++;
            this.reset(-45, 45);
        }
        // Right Paddle
        if (this.x - this.width / 2 < 0) {
            this.velocityX *= -1;
            this.x += this.velocityX; // prevent getting stuck to top or bottom
            rightPaddle.incrementScore();
            this.speedScore++;
            this.reset(135, 225);
        }
        // Top/Bottom
        if (this.y + this.height / 2 > canvasConfig.height || this.y - this.height / 2 < 0) {
            this.velocityY *= -1;
            this.playBounceSound();
        }
    }

    vectorCollisionFront(ctx, paddle) {
        let lineExtend = 1;
        // Puck line
        const line1start = { x: this.x, y: this.y }
        const line1end = { x: this.x + (this.velocityX * lineExtend), y: this.y + (this.velocityY * lineExtend) }
        //console.log(line1start, line1end);
        //CanvasUtils.drawLineFromPoints(ctx, line1start, line1end);

        let line2start = { x: paddle.x, y: paddle.y };
        let line2end = { x: paddle.x, y: paddle.y + paddle.height };

        // Paddle Line
        if (paddle.isLeft) {
            line2start = { x: paddle.x + paddle.width, y: paddle.y };
            line2end = { x: paddle.x + paddle.width, y: paddle.y + paddle.height };
        }
        //console.log(line2start, line2end);
        //CanvasUtils.drawLineFromPoints(ctx, line2start, line2end);

        const intersection = Functions.linesIntersect(line1start, line1end, line2start, line2end);
        if (intersection) {
            //CanvasUtils.drawCircle(ctx, intersection); // Draw a red dot at the intersection
            //console.log(intersection);

            this.handlePaddleCollision(paddle);
            this.playBounceSound();
        }
    }

    vectorCollisionTop(ctx, paddle) {
        let lineExtend = 1;
        // Puck line
        const line1start = { x: this.x, y: this.y }
        const line1end = { x: this.x + (this.velocityX * lineExtend), y: this.y + (this.velocityY * lineExtend) }
        //console.log(line1start, line1end);
        //CanvasUtils.drawLineFromPoints(ctx, line1start, line1end);

        let line2start = { x: paddle.x, y: paddle.y };
        let line2end = { x: paddle.x + paddle.width, y: paddle.y };

        // Draw Paddle Top Line
        //CanvasUtils.drawLineFromPoints(ctx, line2start, line2end);

        const intersection = Functions.linesIntersect(line1start, line1end, line2start, line2end);
        if (intersection) {
            this.velocityY *= -1;
        }
    }

    vectorCollisionBottom(ctx, paddle) {
        let lineExtend = 1;
        // Puck line
        const line1start = { x: this.x, y: this.y }
        const line1end = { x: this.x + (this.velocityX * lineExtend), y: this.y + (this.velocityY * lineExtend) }
        //console.log(line1start, line1end);
        //CanvasUtils.drawLineFromPoints(ctx, line1start, line1end);

        let line2start = { x: paddle.x, y: paddle.y + paddle.height };
        let line2end = { x: paddle.x + paddle.width, y: paddle.y + paddle.height };

        // Draw Paddle Bottom Line
        //CanvasUtils.drawLineFromPoints(ctx, line2start, line2end);

        const intersection = Functions.linesIntersect(line1start, line1end, line2start, line2end);
        if (intersection) {
            this.velocityY *= -1;
        }
    }

    handlePaddleCollision(paddle) {
        this.velocityX *= -1; // Reverse X direction

        // Calculate the offset from the center of the paddle    
        let paddleCenterY = paddle.y + paddle.height / 2;
        let offsetY = this.y - paddleCenterY;

        // Calculate the new angle based on the offset from the paddle center
        let angle = Functions.calculateXY2Angle(this.velocityX, this.velocityY);

        // Adjust the angle based on the offset
        if (paddle.isLeft) {
            this.angle = angle + (offsetY * 1.0);
            // Normalize the angle to [0, 360]
            this.angle = (this.angle + 360) % 360;

            if (this.angle < 45 || this.angle > 315) {
                // angle good
            } else if (this.angle > 180) {
                this.angle = 315;
            } else {
                this.angle = 45;
            }
        } else {
            this.angle = angle - (offsetY * 0.9);
            this.angle = (this.angle + 360) % 360;
            if (this.angle < 135) {
                this.angle = 135;
            }
            if (this.angle > 225) {
                this.angle = 225;
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
            0 is right
            45 is right and down
            90 is down
            135 is down and left
            180 is left
            225 is left and up
            270 is up
            315 if up and right
        */
        this.x = canvasConfig.width / 2;
        this.y = canvasConfig.height / 2;

        this.speed = this.speedDefault;
        this.speed += this.speedScore * 0.1;
        this.angle = Functions.randomGenerator(min, max);
        this.setVelocity();
    }
}

export default Puck;
