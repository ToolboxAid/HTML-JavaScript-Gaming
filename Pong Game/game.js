// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// game.js

import { canvasConfig } from './global.js'; // Import canvasConfig
import Font5x3 from './font5x3.js';
import Paddle from './paddle.js';
import Puck from './puck.js';
import CanvasUtils from '../scripts/canvas.js';
import Functions from '../scripts/functions.js';
import Fullscreen from '../scripts/fullscreen.js'; // shows as unused, but it is required.

class Game {
    constructor() {
/*
Sounds in Original Pong
Ball Bounce Sound:

Frequency: Approximately 400 Hz
Duration: Around 100 milliseconds
Description: A short beep sound that played whenever the ball hit the paddles or the walls.
Paddle Hit Sound:

Frequency: Similar to the ball bounce sound, around 400 Hz
Duration: Also about 100 milliseconds
Description: A distinct sound effect that played when the ball collided with a paddle.
Score Sound:

Frequency: Approximately 300 Hz to 400 Hz (varied based on the version)
Duration: Usually longer than the bounce sounds, around 200-500 milliseconds
Description: A sound indicating a score was made, usually more pronounced than the bounce sound.
*/

        // Create paddles instances
        this.leftPaddle = new Paddle(true);
        this.rightPaddle = new Paddle(false);

        // Create puck instance
        this.puck = new Puck();

        // Initialize the canvas path
        this.currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
        window.canvasPath = this.currentDir;

        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.drawDashedLine = this.drawDashedLine.bind(this);
        this.drawWinnerMessage = this.drawWinnerMessage.bind(this);
        this.restartGame = this.restartGame.bind(this);
    }

    drawDashedLine(ctx) {
        const dashPattern = [19, 19]; // Define your dash pattern
        const centerX = canvasConfig.width / 2; // Middle of the canvas
        CanvasUtils.drawDashLine(ctx, centerX, 0, centerX, canvasConfig.height, 8, 'white', dashPattern); // Draw a dashed line
    }

    gameLoop(ctx, deltaTime) {
        // Call drawScores to display the current scores
        Font5x3.drawScores(ctx, this.leftPaddle, this.rightPaddle);

        // Draw the dashed line
        this.drawDashedLine(ctx);

        if (Paddle.winner) {
            // Stop the game loop and display the winner message
            this.drawWinnerMessage(ctx);

            // Draw paddles
            this.leftPaddle.draw(ctx);
            this.rightPaddle.draw(ctx);

            // Pause the game until a key is pressed
            document.addEventListener('keydown', this.restartGame);
            return; // Exit the game loop
        }

        // Update paddles using keyboard
        this.leftPaddle.update();
        this.rightPaddle.update();

        // Update/Move the puck using its inherited method
        this.puck.update(ctx, this.leftPaddle, this.rightPaddle, deltaTime);

        // Draw paddles
        this.leftPaddle.draw(ctx);
        this.rightPaddle.draw(ctx);

        // Draw the puck
        this.puck.draw(ctx);
    }

    // Function to draw the winner message on the canvas
    drawWinnerMessage(ctx, message) {
        ctx.fillStyle = 'white'; // Set text color
        ctx.font = '55px Arial'; // Set font size and style
        ctx.textAlign = 'center'; // Center the text
        ctx.fillText("We have a winner!", window.gameAreaWidth / 2, (window.gameAreaHeight / 2) - 33); // Draw the message at the center of the canvas
        ctx.fillText("Press any key to Play", window.gameAreaWidth / 2, (window.gameAreaHeight / 2) + 33); // Draw the message at the center of the canvas
    }

    // Function to restart the game
    restartGame() {
        // Reset paddle winner state
        Paddle.winner = false;
        this.leftPaddle = new Paddle(true);
        this.rightPaddle = new Paddle(false);
        this.puck = new Puck(); // Create a new puck instance

        // Remove the keydown event listener to prevent multiple triggers
        document.removeEventListener('keydown', this.restartGame);
    }
}

// Export the Game class
export default Game;

// Canvas needs to know the current directory to game.js
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
