// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// font5x3.js


import { font5x3 } from './global.js';
import { canvasConfig } from './global.js';
class Font5x3 {
    static #font = {
        '0': [
            [1, 1, 1],
            [1, 0, 1],
            [1, 0, 1],
            [1, 0, 1],
            [1, 1, 1],
        ],
        '1': [
            [0, 1, 0],
            [1, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 1],
        ],
        '2': [
            [1, 1, 1],
            [0, 0, 1],
            [1, 1, 1],
            [1, 0, 0],
            [1, 1, 1],
        ],
        '3': [
            [1, 1, 1],
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 1],
            [1, 1, 1],
        ],
        '4': [
            [1, 0, 1],
            [1, 0, 1],
            [1, 1, 1],
            [0, 0, 1],
            [0, 0, 1],
        ],
        '5': [
            [1, 1, 1],
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 1],
            [1, 1, 1],
        ],
        '6': [
            [1, 1, 1],
            [1, 0, 0],
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1],
        ],
        '7': [
            [1, 1, 1],
            [0, 0, 1],
            [0, 0, 1],
            [0, 0, 1],
            [0, 0, 1],
        ],
        '8': [
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1],
        ],
        '9': [
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1],
            [0, 0, 1],
            [1, 1, 1],
        ]
    };

    static #formatScore(score) {
        return score.toString().padStart(2, '0'); // Format score to 2 digits
    }

    static #drawChar(ctx, char, x, y, pixelWidth, pixelHeight) {
        const characterMatrix = this.#font[char];
        if (!characterMatrix) return; // Ignore if character doesn't exist

        ctx.fillStyle = font5x3.color;

        for (let row = 0; row < characterMatrix.length; row++) {
            for (let col = 0; col < characterMatrix[row].length; col++) {
                if (characterMatrix[row][col] === 1) {
                    ctx.fillRect(x + col * pixelWidth, y + row * pixelHeight, pixelWidth + 1, pixelHeight + 1);
                }
            }
        }
    }

    static drawScores(ctx, leftPaddle, rightPaddle) {
        const player1X = (canvasConfig.width / 2) - (font5x3.pixelWidth * 24); // X position for Player 1 score
        const player2X = (canvasConfig.width / 2) + (font5x3.pixelWidth * 18); // X position for Player 2 score

        const y = 30;  // Y position for scores

        // Draw Player 1 Score
        const formattedScore1 = this.#formatScore(leftPaddle.score);
        this.#drawChar(ctx, formattedScore1[0], player1X, y, font5x3.pixelWidth, font5x3.pixelHeight); // Tens
        this.#drawChar(ctx, formattedScore1[1], player1X + (4 * font5x3.pixelWidth), y, font5x3.pixelWidth, font5x3.pixelHeight); // Units

        // Draw Player 2 Score
        const formattedScore2 = this.#formatScore(rightPaddle.score);
        this.#drawChar(ctx, formattedScore2[0], player2X, y, font5x3.pixelWidth, font5x3.pixelHeight); // Tens
        this.#drawChar(ctx, formattedScore2[1], player2X + (4 * font5x3.pixelWidth), y, font5x3.pixelWidth, font5x3.pixelHeight); // Units
    }
}

// Export the Font5x3 class
export default Font5x3;
