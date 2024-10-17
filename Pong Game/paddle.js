// ToolboxAid.com
// David Quesenberry
// paddle.js
// 10/16/2024

import { paddleConfig, canvasConfig } from './global.js'; // Import paddle and canvas configuration
import ObjectStatic from '../scripts/objectStatic.js'; // Import the base class

class Paddle extends ObjectStatic {
    constructor(isLeft) {
        // Calculate initial position and size
        const width = paddleConfig.width;
        const height = paddleConfig.height;
        const x = isLeft ? paddleConfig.offset : canvasConfig.width - paddleConfig.offset - width;
        const y = (canvasConfig.height / 2) - (height / 2); // Center vertically
        
        // Call the super constructor with the necessary parameters
        super(x, y, width, height); // Assuming ObjectStatic takes (x, y, width, height)
        
        this.color = isLeft ? paddleConfig.leftColor : paddleConfig.rightColor; // Set color based on side
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

    draw(ctx) {
        ctx.fillStyle = this.color; // Set the paddle color
        ctx.fillRect(this.x, this.y, this.width, this.height); // Draw the paddle using inherited properties
    }
}

export default Paddle; // Don't forget to export the Paddle class
