// ToolboxAid.com
// David Quesenberry
// font5x3.js
// 10/16/2024


import { font5x3 } from './global.js'; // Import canvasConfig

class Font5x3 {
    static font = {
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
        const characterMatrix = this.font[char];
        if (!characterMatrix) return; // Ignore if character doesn't exist

        ctx.fillStyle = font5x3.color;//'white'; // Set fill color

        for (let row = 0; row < characterMatrix.length; row++) {
            for (let col = 0; col < characterMatrix[row].length; col++) {
                if (characterMatrix[row][col] === 1) {
                    ctx.fillRect(x + col * pixelWidth, y + row * pixelHeight, pixelWidth, pixelHeight);
                }
            }
        }
    }

    static drawScores(ctx, leftPaddle, rightPaddle) {
        const x = 280; // X position for player 1 score
        const y = 30; // Y position for scores

        // Draw Player 1 Score
        const formattedScore1 = this.#formatScore(leftPaddle.score);
        this.#drawChar(ctx, formattedScore1[0], x, y, font5x3.pixelWidth, font5x3.pixelHeight); // Tens
        this.#drawChar(ctx, formattedScore1[1], x + 4 * font5x3.pixelWidth, y, font5x3.pixelWidth, font5x3.pixelHeight); // Units

        // Draw Player 2 Score
        const formattedScore2 = this.#formatScore(rightPaddle.score);
        this.#drawChar(ctx, formattedScore2[0], x + 185, y, font5x3.pixelWidth, font5x3.pixelHeight); // Tens
        this.#drawChar(ctx, formattedScore2[1], x + 185 + 4 * font5x3.pixelWidth, y, font5x3.pixelWidth, font5x3.pixelHeight); // Units
    }
}

// Export the Font5x3 class
export default Font5x3;
