// ToolboxAid.com
// David Quesenberry
// puck.js
// 10/16/2024

import { puckConfig } from './global.js'; // Import puck configuration
import ObjectDynamic from '../scripts/objectDynamic.js'; // Import ObjectDynamic

class Puck extends ObjectDynamic {
    constructor() {
        // Set initial position and size
        const width = puckConfig.width; // Use width from puckConfig
        const height = puckConfig.height; // Use height from puckConfig
        const x = (window.gameAreaWidth / 2) - (width / 2); // Center horizontally
        const y = (window.gameAreaHeight / 2) - (height / 2); // Center vertically

        // Call the super constructor with the necessary parameters
        super(x, y, width, height); // Ensure ObjectDynamic takes (x, y, width, height)

        this.color = puckConfig.color; // Set puck color
        this.speed = 3; // Set puck speed (you can customize this)

        // Initialize velocity properties
        this.velocityX = 0; // Initialize velocity in X
        this.velocityY = 0; // Initialize velocity in Y
        this.reset(); // Reset puck position and velocity
    }

    draw(ctx) {
        ctx.fillStyle = this.color; // Set the puck color 
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
            this.velocityX *= -1; // Reverse X direction
            scores.player1++; // Player 1 scores
            this.reset();
        }
        if (this.x - this.width / 2 < 0) {
            this.velocityX *= -1; // Reverse X direction
            scores.player2++; // Player 2 scores
            this.reset();
        }
        if (this.y + this.height / 2 > window.gameAreaHeight || this.y - this.height / 2 < 0) {
            this.velocityY *= -1; // Reverse Y direction
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
        }
    }

    handlePaddleCollision(paddle) {
        let paddleCenterY = paddle.y + paddle.height / 2;
        let offsetY = this.y - paddleCenterY;

        this.velocityX *= -1;
        this.velocityY = Math.sign(this.velocityY) * (Math.abs(this.velocityY) + offsetY * 0.1);
    }

    reset() {
        this.x = window.gameAreaWidth / 2;
        this.y = window.gameAreaHeight / 2;
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
