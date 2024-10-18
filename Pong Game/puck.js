// ToolboxAid.com
// David Quesenberry
// puck.js
// 10/16/2024

import { puckConfig } from './global.js'; // Import puck configuration
import { paddleConfig } from './global.js'; // Import padle configuration

import ObjectDynamic from '../scripts/objectDynamic.js'; // Import ObjectDynamic
import Functions from '../scripts/functions.js'; // Adjust the path as necessary
import Intersect from '../scripts/intersect.js';

class Puck extends ObjectDynamic {
    constructor() {
        // const width = puckConfig.width;
        // const height = puckConfig.height;
        const x = (window.gameAreaWidth / 2) - (puckConfig.width / 2);
        const y = (window.gameAreaHeight / 2) - (puckConfig.height / 2);

        super(x, y, puckConfig.width, puckConfig.height);

        this.color = puckConfig.color;
        this.speed = 3.5;
        this.speedIncrease = 0.3;
        this.speedDefault = 3.5;
        this.speedScore = 0;

        // not sure this is needed, just being safe.
        this.velocityX = 0;
        this.velocityY = 0;

        this.angle = 0;

        if (Functions.randomGenerator(0, 1)) {
            this.reset(-45, 45);
        } else {
            this.reset(135, 225);
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }

    move(leftPaddle, rightPaddle, ctx) {
        this.x += this.velocityX;
        this.y += this.velocityY;

        this.checkBoundaryCollision(leftPaddle, rightPaddle);
        this.checkPaddleCollision(leftPaddle, rightPaddle);
    }


    // check for wall to:
    // - adjust scores for left & right
    // - adjust Y direction for top & bottom
    checkBoundaryCollision(leftPaddle, rightPaddle) {
        if (this.x + this.width / 2 > window.gameAreaWidth) {
            this.velocityX *= -1;
            leftPaddle.incrementScore();
            this.speedScore++;
            this.reset(-45, 45);
        }
        if (this.x - this.width / 2 < 0) {
            this.velocityX *= -1;
            rightPaddle.incrementScore();
            this.speedScore++;
            this.reset(135, 225);
        }
        if (this.y + this.height / 2 > window.gameAreaHeight || this.y - this.height / 2 < 0) {
            this.velocityY *= -1;
        }
    }

    checkPaddleCollision(leftPaddle, rightPaddle) {
        if (this.x - this.width / 2 < leftPaddle.x + leftPaddle.width &&
            this.y > leftPaddle.y && this.y < leftPaddle.y + leftPaddle.height) {
            this.handlePaddleCollision(leftPaddle);
            this.x += (paddleConfig.width / 4);
        }
        if (this.x + this.width / 2 > rightPaddle.x &&
            this.y > rightPaddle.y && this.y < rightPaddle.y + rightPaddle.height) {
            this.handlePaddleCollision(rightPaddle);
            this.x -= (paddleConfig.width / 8);
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
    reset(min, max) {
        // Place puck at center of screen
        this.x = window.gameAreaWidth / 2;
        this.y = window.gameAreaHeight / 2;

        this.speed = this.speedDefault;
        this.speed += this.speedScore * 0.1;
        this.angle = Functions.randomGenerator(min, max);
        this.setVelocity();
    }
}

export default Puck;
