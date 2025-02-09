// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// game.js

import { font5x3 } from './global.js'; // Import canvasConfig
import { canvasConfig, performanceConfig, fullscreenConfig } from './global.js'; // Import canvasConfig
import GameBase from '../scripts/gamebase.js';
import CanvasUtils from '../scripts/canvas.js';

import KeyboardInput from '../scripts/keyboard.js';
import GameControllers from '../scripts/gameControllers.js';

import Font5x3 from './font5x3.js';
import Paddle from './paddle.js';
import Puck from './puck.js';

class Game extends GameBase {
    constructor() {
        super(canvasConfig, performanceConfig, fullscreenConfig);
    }

    async onInitialize() {
        console.log("onInit");
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

        this.keyboardInput = new KeyboardInput();
        this.gameControllers = new GameControllers();

        // Create paddles instances
        this.isLeft = true;
        this.leftPaddle = new Paddle(this.isLeft);
        this.rightPaddle = new Paddle(!this.isLeft);

        // Create puck instance
        this.puck = new Puck();
    }

    drawDashedLine() {
        const dashPattern = [19, 19]; // Define your dash pattern
        const centerX = canvasConfig.width / 2; // Middle of the canvas
        CanvasUtils.drawDashLine(centerX, 0, centerX, canvasConfig.height, 8, 'white', dashPattern); // Draw a dashed line
    }

    gameLoop(deltaTime) {
        this.keyboardInput.update();
        this.gameControllers.update();

        // Movement check
        const gameController = this.gameControllers.getGameController(0);
        if (gameController) {
            console.log("Button 'A' pressed", this.gameControllers.isButtonNameDown(0, "A"));
        }

        const player1X = (canvasConfig.width / 2) - (font5x3.pixelWidth * 24); // X position for Player 1 score
        const player2X = (canvasConfig.width / 2) + (font5x3.pixelWidth * 18); // X position for Player 2 score
        const y = 30;  // Y position for scores
        const digits = 2;
        Font5x3.drawNumber(player1X, y, this.leftPaddle.score, digits);
        Font5x3.drawNumber(player2X, y, this.rightPaddle.score, digits);

        // Draw the dashed line
        this.drawDashedLine();

        if (Paddle.winner) {
            // Stop the game loop and display the winner message
            this.drawWinnerMessage();

            // Draw paddles
            this.leftPaddle.draw();
            this.rightPaddle.draw();

            // Pause the game until a key is pressed
            if (this.keyboardInput.getKeysDown().length > 0 ||
                this.gameControllers.wasButtonIndexPressed(0, 8) ||
                this.gameControllers.wasButtonIndexPressed(0, 9) ||
                this.gameControllers.wasButtonIndexPressed(1, 8) ||
                this.gameControllers.wasButtonIndexPressed(1, 9)) {
                this.restartGame();
            }

            return; // Exit the game loop
        }

        // Update paddles using keyboard
        this.leftPaddle.update(this.keyboardInput, this.gameControllers);
        this.rightPaddle.update(this.keyboardInput, this.gameControllers);

        // Update/Move the puck using its inherited method
        this.puck.update(this.leftPaddle, this.rightPaddle, deltaTime);

        // Draw paddles
        this.leftPaddle.draw();
        this.rightPaddle.draw();

        // Draw the puck
        this.puck.draw();
    }

    // Function to draw the winner message on the canvas
    drawWinnerMessage() {
        CanvasUtils.ctx.fillStyle = 'white'; // Set text color
        CanvasUtils.ctx.font = '55px Arial'; // Set font size and style
        CanvasUtils.ctx.textAlign = 'center'; // Center the text
        CanvasUtils.ctx.fillText("We have a winner!", canvasConfig.width / 2, (canvasConfig.height / 2) - 33); // Draw the message at the center of the canvas
        CanvasUtils.ctx.fillText("Press any key to Play", canvasConfig.width / 2, (canvasConfig.height / 2) + 33); // Draw the message at the center of the canvas
    }

    // Function to restart the game
    restartGame() {
        // Reset paddle winner state
        Paddle.winner = false;
        this.leftPaddle = new Paddle(this.isLeft);
        this.rightPaddle = new Paddle(!this.isLeft);
        this.puck = new Puck(); // Create a new puck instance
    }
}

// Export the Game class
export default Game;

const game = new Game();
