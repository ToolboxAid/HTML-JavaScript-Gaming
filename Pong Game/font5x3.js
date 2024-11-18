// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// font5x3.js


import { font5x3 } from './global.js';
import { canvasConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';

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


    static #drawChar(char, x, y, pixelWidth, pixelHeight) {
        const characterMatrix = Font5x3.font[char];
        if (!characterMatrix) return; // Ignore if character doesn't exist

        CanvasUtils.ctx.fillStyle = font5x3.color;

        for (let row = 0; row < characterMatrix.length; row++) {
            for (let col = 0; col < characterMatrix[row].length; col++) {
                if (characterMatrix[row][col] === 1) {
                    CanvasUtils.ctx.fillRect(x + col * pixelWidth, y + row * pixelHeight, pixelWidth + 1, pixelHeight + 1);
                }
            }
        }
    }

    static #formatNumber(number, digits) {
        return number.toString().padStart(digits, '0'); // Format number to 2 digits
    }

    // todo: this is specific to PONG, needs to be for number only.
    static drawNumber(x, y, number, digits) {
        const formattedNumber = this.#formatNumber(number, digits);

        // Loop through each character in formattedNumber
        for (let i = 0; i < formattedNumber.length; i++) {
            const offsetX = i * (4 * font5x3.pixelWidth); // Calculate the x-offset for each character
            this.#drawChar(
                formattedNumber[i],  // Current character
                x + offsetX,         // Adjusted x-position
                y,                   // y-position remains the same
                font5x3.pixelWidth,  // Character width
                font5x3.pixelHeight  // Character height
            );
        }
    }

}

// Export the Font5x3 class
export default Font5x3;
