import { canvasConfig } from './global.js'; // Import canvas config

class Puck {
    constructor() {
        // Use canvasConfig for dimensions
        this.x = canvasConfig.width / 2;
        this.y = canvasConfig.height / 2;
        this.velocityX = 1.5;
        this.velocityY = 1.3;
    }

    draw(ctx) {
        ctx.fillStyle = window.puckColor; 
        ctx.fillRect(this.x - window.puckWidth / 2, this.y - window.puckHeight / 2, window.puckWidth, window.puckHeight);
    }

    move(scores, leftPaddle, rightPaddle) {
        this.x += this.velocityX;
        this.y += this.velocityY;

        this.checkBoundaryCollision(scores);
        this.checkPaddleCollision(leftPaddle, rightPaddle);
    }

    checkBoundaryCollision(scores) {
        if (this.x + window.puckWidth / 2 > canvasConfig.width) {
            this.velocityX *= -1; // Reverse X direction
            scores.player1++; // Player 1 scores
            this.reset();
        }
        if (this.x - window.puckWidth / 2 < 0) {
            this.velocityX *= -1; // Reverse X direction
            scores.player2++; // Player 2 scores
            this.reset();
        }
        if (this.y + window.puckHeight / 2 > canvasConfig.height || this.y - window.puckHeight / 2 < 0) {
            this.velocityY *= -1; // Reverse Y direction
        }
    }

    checkPaddleCollision(leftPaddle, rightPaddle) {
        if (this.x - window.puckWidth / 2 < leftPaddle.x + leftPaddle.width &&
            this.y > leftPaddle.y && this.y < leftPaddle.y + leftPaddle.height) {
            this.handlePaddleCollision(leftPaddle);
        }
        if (this.x + window.puckWidth / 2 > rightPaddle.x &&
            this.y > rightPaddle.y && this.y < rightPaddle.y + rightPaddle.height) {
            this.handlePaddleCollision(rightPaddle);
        }
    }

    handlePaddleCollision(paddle) {
        let paddleCenterY = paddle.y + paddle.height / 2;
        let offsetY = this.y - paddleCenterY;

        this.velocityX *= -1;
        this.velocityY = Math.sign(this.velocityY) * (Math.abs(this.velocityY) + offsetY * 0.1);
    }

    reset() {
        this.x = canvasConfig.width / 2;
        this.y = canvasConfig.height / 2;
        this.velocityX = 5 * (this.randomGenerator() * 2 - 1);
        this.velocityY = 2 * (this.randomGenerator() * 2 - 1);

        console.log(`Puck Position: X = ${this.x}, Y = ${this.y}`);
        console.log(`Puck Velocity: X = ${this.velocityX.toFixed(2)}, Y = ${this.velocityY.toFixed(2)}`);
    }

    randomGenerator() {
        return Math.random();
    }
}

export default Puck;
