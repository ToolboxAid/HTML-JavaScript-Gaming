import { puckConfig } from './global.js'; // Import puck configuration
import ObjectDynamic from '../scripts/objectDynamic.js'; // Import ObjectDynamic
import Functions from '../scripts/functions.js'; // Adjust the path as necessary

class Puck extends ObjectDynamic {
    constructor() {
        // const width = puckConfig.width;
        // const height = puckConfig.height;
        const x = (window.gameAreaWidth / 2) - (puckConfig.width / 2);
        const y = (window.gameAreaHeight / 2) - (puckConfig.height / 2);
        const angle = 0;

        super(x, y, puckConfig.width, puckConfig.height);

        this.color = puckConfig.color;
        this.speed = 3.5;
        this.speedIncrease = 0.3;
        this.speedDefault = 3.5;

        // not sure this is needed, just being safe.
        this.velocityX = 0;
        this.velocityY = 0;

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

    move(scores, leftPaddle, rightPaddle) {
        this.x += this.velocityX;
        this.y += this.velocityY;

        this.checkBoundaryCollision(scores);
        this.checkPaddleCollision(leftPaddle, rightPaddle);
    }

    checkBoundaryCollision(scores) {
        if (this.x + this.width / 2 > window.gameAreaWidth) {
            this.velocityX *= -1;
            scores.player1++;
            this.reset(-45, 45);
        }
        if (this.x - this.width / 2 < 0) {
            this.velocityX *= -1;
            scores.player2++;
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
        }
        if (this.x + this.width / 2 > rightPaddle.x &&
            this.y > rightPaddle.y && this.y < rightPaddle.y + rightPaddle.height) {
            this.handlePaddleCollision(rightPaddle);
            // let angle = (180-this.angle) + 180;
            // this.resetVelocity(angle);
        }
    }

    handlePaddleCollision(paddle) {
        let paddleCenterY = paddle.y + paddle.height / 2;
        let offsetY = this.y - paddleCenterY;

        this.velocityX *= -1;
        this.velocityY = Math.sign(this.velocityY) * (Math.abs(this.velocityY) + offsetY * 0.1);
        
    }

    resetVelocity() {
        const coordinates = Functions.angleCalculateXY(this.angle); // Call the method

        this.speed += this.speedIncrease;
        console.log(`speed is: ${this.speed}`);

        this.velocityX = coordinates.x * this.speed;
        this.velocityY = coordinates.y * this.speed;
    }

    /*
        angle direction of travel
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
        this.angle = Functions.randomGenerator(min, max);
        // console.log(`The angle is: ${this.angle} degrees`);

        this.resetVelocity();
    }
}

export default Puck;
