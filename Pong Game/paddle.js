// ToolboxAid.com
// David Quesenberry
// paddle.js
// 10/16/2024

import ObjectStatic from '../scripts/objectStatic.js'; // Import the ObjectStatic class
//import { paddleWidth, paddleHeight, paddleSpeed, leftPaddleColor, rightPaddleColor } from './global.js'; // Import relevant constants

class Paddle extends ObjectStatic {
    constructor(isLeftPaddle) {
        // Calculate the initial X position based on whether it's the left or right paddle
        const initialX = isLeftPaddle ? window.paddleOffset : (window.gameAreaWidth - paddleWidth - window.paddleOffset);
        // Set y to position the paddle in the middle of the canvas vertically
        const initialY = (window.gameAreaHeight - paddleHeight) / 2; 

        super(initialX, initialY, paddleWidth, paddleHeight); // Call the constructor of ObjectStatic
        this.speed = paddleSpeed; // Use the imported paddle speed
    }

    // Method to move the paddle up or down
    move(direction) {
        // direction: -1 for up, 1 for down
        this.y += direction * this.speed;

        // Optional: Add bounds checking
        if (this.y < 0) {
            this.y = 0; // Prevent moving above the top
        } else if (this.y + this.height > window.gameAreaHeight) { // Use gameAreaHeight for bounds
            this.y = window.gameAreaHeight - this.height; // Prevent moving below the bottom
        }
    }

    // Override the draw method if needed
    draw(ctx, fillColor = leftPaddleColor) {
        super.draw(ctx, fillColor); // Call the parent class draw method
    }
}

export default Paddle; // Don't forget to export the Paddle class
