// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// canvas.js

import Fullscreen from '../scripts/fullscreen.js'; // Import the Fullscreen class
import CanvasUtil from '../scripts/canvas.js'
import Font5x6 from './font5x6.js';

class CanvasUtils {
    static frameCount = 0;
    static lastFPSUpdateTime = performance.now(); // Used for FPS calculation
    static lastFrameTime = performance.now(); // Used for frame delta calculation
    static fps = 0;

    static gameModule;
    static lastTimestamp = 0;

    static ctx = null;
    static initCanvas(ctx) {
        CanvasUtil.ctx = ctx;
        CanvasUtil.ctx.fillStyle = window.backgroundColor || 'white'; // Fallback if backgroundColor is not set
        CanvasUtil.ctx.fillRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
    }

    static drawFPS() {
        this.frameCount++;

        const currentTime = performance.now();
        const elapsedTime = currentTime - this.lastFPSUpdateTime; // Use the separate variable

        if (elapsedTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdateTime = currentTime; // Reset lastTime for the next second
        }

        CanvasUtil.ctx.globalAlpha = 1.0;
        CanvasUtil.ctx.fillStyle = window.fpsColor || 'white'; // Fallback color
        CanvasUtil.ctx.font = `${window.fpsSize || '16px'} Arial Bold`;
        CanvasUtil.ctx.fillText(`FPS: ${this.fps}`, window.fpsX || 10, window.fpsY || 20); // Default positions
    }

    static drawBorder() {
        CanvasUtil.ctx.lineWidth = window.borderSize || 1; // Fallback if borderSize is not set
        CanvasUtil.ctx.strokeStyle = window.borderColor || 'black'; // Fallback if borderColor is not set
        CanvasUtil.ctx.strokeRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
    }

    static drawNumber(x, y, number, pixelSize, color = 'white', leadingCount = 5, leadingChar = '0') {
        const numberStr = number.toString();
        const leadingLength = Math.max(0, leadingCount - numberStr.length); // Calculate number of leading characters needed
        const text = leadingChar.repeat(leadingLength) + numberStr; // Create text with leading characters

        // Ensure text length is exactly 5
        const formattedText = text.padStart(leadingCount, leadingChar).slice(-leadingCount);
        this.drawText(x, y, formattedText, pixelSize, color);
    }

    static drawText(x, y, text, pixelSize, color = 'white') {
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const frame = Font5x6.font5x6[char];

            if (frame) {
                // Assuming each character has a fixed width, you can adjust the space here
                const charWidth = frame[0].length; // Get the width from the frame

                // Not needed, completed in drawSprite()
                // const cx = Math.ceil(x + i * (charWidth * pixelSize + 5));
                // const cy = Math.ceil(y);
                // const cp = Math.ceil(pixelSize);
                // CanvasUtil.drawSprite( cx, cy, frame, cp, color);

                CanvasUtil.drawSprite( x + i * (charWidth * pixelSize + 5), y, frame, pixelSize, color);
            }
        }
    }

    static getSpriteText(text, space = 1) {
        // Initialize the sprite array
        const sprite = [];

        // Find the maximum height of characters (assuming all characters have the same height)
        const charHeight = Font5x6.font5x6['A']?.length || 7;

        // Prepare an empty row for spacing
        const emptyRow = '0'.repeat(space);

        // Initialize empty rows
        for (let i = 0; i < charHeight; i++) {
            sprite.push('');
        }

        // Loop through each character in the text
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const frame = Font5x6.font5x6[char] || Font5x6.font5x6[' '];

            // Add each line of the character frame to the sprite
            for (let row = 0; row < charHeight; row++) {
                // Add character row + space for each line in the sprite
                sprite[row] += frame[row] + emptyRow;
            }
        }

        return sprite;
    }

    static drawBounds(x, y, w, h, color = 'red', lineSize = 1) {
        CanvasUtil.ctx.lineWidth = lineSize;
        CanvasUtil.ctx.strokeStyle = color;
        CanvasUtil.ctx.strokeRect(x, y, w, h);
    }

    // Move the color map to be a static property of the class
    static colorMap = {
        'R': 'red',
        'O': 'orange',
        'Y': 'yellow',
        'G': 'green',
        'B': 'blue',
        'I': 'indigo',
        'V': 'violet',
        '0': 'transparent', // '0' is transparent
        '': 'transparent', // empty is transparent
        '1': 'white', // default color for '1'
        'b': 'black',
        'w': 'white',
        'P': 'pink',
        'C': 'cyan',
        'M': 'magenta',
        'L': 'lightgray',
        'D': 'darkgray',
        'A': 'aqua',
        'S': 'silver',
        'N': 'navy',
        'K': 'khaki',
    };

    // Method to draw the current frame
    static drawSprite(x, y, frame, pixelSize, spriteColor = 'white', drawBounds = false) {
        for (let row = 0; row < frame.length; row++) {
            for (let col = 0; col < frame[row].length; col++) {
                const pixel = frame[row][col];
                let color = CanvasUtils.colorMap[pixel] || 'transparent'; // Use the static colorMap

                // Replace white with spriteColor if present
                if (pixel === '1' && spriteColor) {
                    color = spriteColor; // Use sprite color instead of white
                }
                CanvasUtil.ctx.fillStyle = color;
                let ceilX = Math.ceil((col * pixelSize) + x);
                let ceilY = Math.ceil((row * pixelSize) + y);
                let ceilPixelSize = Math.ceil(pixelSize);
                CanvasUtil.ctx.fillRect(ceilX, ceilY, ceilPixelSize, ceilPixelSize);
            }
        }

        if (drawBounds) {
            let dimensions = CanvasUtils.spriteWidthHeight(frame, pixelSize);
            CanvasUtils.drawBounds(x, y, dimensions.width, dimensions.height, spriteColor, 2);
        }
    }

    // const frameWidth = Enemy.getFrameWidth(livingFrames);
    // static getFrameWidth(frames) {
    //     if (!frames || frames.length === 0 || frames[0].length === 0) {
    //         return 0; // Return 0 if the frames array is empty or malformed
    //     }
    //         // Assuming all rows have the same width
    //     return frames[0][0].length * spriteConfig.pixelSize; // Width of the first row of the first frame
    // }

    static spriteWidthHeight(object, pixelSize, debug = false) {
        let width, height;

        if (Array.isArray(object) && Array.isArray(object[0])) {
            // Multi-dimensional array (each element is an array, implying rows of frames)
            let frame = object.map(row => Array.from(row));
            height = frame.length; // Number of rows
            width = frame[0]?.length || 0; // Length of each row (assuming uniform row lengths)

            if (debug) {
                console.log(`Multi-dimensional array detected. Width: ${width}, Height: ${height}`);
                console.log(frame); // Display the actual frame for verification
            }
        } else if (Array.isArray(object)) {
            // Single-dimensional array (likely one frame as an array of strings or characters)
            let frame = Array.from(object); // Create a copy for manipulation
            height = frame.length; // Number of elements (lines or rows)
            width = frame[0]?.length || 1; // Length of each line or character    
            if (debug) {
                console.log(`Single-dimensional array detected. Width: ${width}, Height: ${height}`);
                console.log(frame); // Display the actual frame for verification
            }
        } else {
            console.error("Error occurred:", error.message);
            console.error("Stack trace:", error.stack);
            console.error("Invalid object format:", object);
            return { width: 0, height: 0 };
        }

        width = Math.round(width * pixelSize);
        height = Math.round(height * pixelSize);

        return { width: width, height: height };
    }

    static drawLine(x1, y1, x2, y2, lineWidth = 5, strokeColor = 'white') {
        CanvasUtil.ctx.lineWidth = lineWidth;
        CanvasUtil.ctx.strokeStyle = strokeColor;

        CanvasUtil.ctx.beginPath();
        CanvasUtil.ctx.moveTo(x1, y1); // Start point
        CanvasUtil.ctx.lineTo(x2, y2); // End point
        CanvasUtil.ctx.stroke(); // Draw the line
    }

    static drawLineFromPoints(start, end, lineWidth = 5, strokeColor = 'red') {
    //   const start1 = { x: 0, y: 0 };
    //   const end1   = { x: 500, y: 500 };
        CanvasUtils.drawLine(start.x, start.y, end.x, end.y, lineWidth, strokeColor);
    }

    static drawDashLine(x1, y1, x2, y2, lineWidth, strokeColor = 'white', dashPattern = [10, 10]) {
        /* ctx.setLineDash
             ([5, 15]);        - Short dashes with longer gaps
             ([15, 5]);        - Long dashes with short gaps
             ([15, 5, 5, 5]);  - Long dash, short gap, short dash, short gap
             ([20, 5, 10, 5]); - Alternating long and medium dashes
         */
        CanvasUtil.ctx.setLineDash(dashPattern);
        CanvasUtils.drawLine(x1, y1, x2, y2, lineWidth, strokeColor);
        CanvasUtil.ctx.setLineDash([]); // Reset to solid line
    }

    static drawCircle(point, color = 'red', size = 7, startAngle = 0, endAngle = Math.PI * 2) {
        CanvasUtil.ctx.beginPath();
        CanvasUtil.ctx.arc(point.x, point.y, size, startAngle, endAngle); // Draw a small circle
        CanvasUtil.ctx.fillStyle = color;
        CanvasUtil.ctx.fill();
    }

    static drawCircle2(x, y, radius, fillColor = 'white', borderColor = null, borderWidth = 0) {
        CanvasUtil.ctx.beginPath();
        CanvasUtil.ctx.arc(x, y, radius, 0, Math.PI * 2); // Draw circle
        CanvasUtil.ctx.fillStyle = fillColor;
        CanvasUtil.ctx.fill();

        if (borderColor && borderWidth > 0) {
            CanvasUtil.ctx.strokeStyle = borderColor;
            CanvasUtil.ctx.lineWidth = borderWidth;
            CanvasUtil.ctx.stroke();
        }
    }

    static clickFullscreen() {
        if (!Fullscreen.isFullScreen) {
            // Set up the text properties using global variables or default values
            CanvasUtil.ctx.fillStyle = window.fullscreenColor || 'white'; // Set text color
            CanvasUtil.ctx.font = window.fullscreenFont || '40px Arial'; // Set font size and family

            // Reset text alignment to default (start)
            CanvasUtil.ctx.textAlign = 'start';

            // Measure the width of the text "Click here to enter fullscreen"
            const text = window.fullscreenText || 'Click here to enter fullscreen';
            const textWidth = CanvasUtil.ctx.measureText(text).width; // Get the width of the text in pixels

            const textX = window.fullscreenX || (window.gameAreaWidth - textWidth) / 2;

            const textY = window.fullscreenY || window.gameAreaHeight * (4 / 5); // Position the text vertically


            // Draw the message on the canvas
            CanvasUtil.ctx.fillText(text, textX, textY); // Display the text at the calculated position
        }
    }

    // Animate function moved into the CanvasUtils class
    static async animate(time) {
        const canvas = document.getElementById('gameArea');
        if (canvas.getContext) {
            const ctx = canvas.getContext('2d');

            const deltaTime = (time - this.lastTimestamp) / 1000; // Convert milliseconds to seconds
            this.lastTimestamp = time;

            // Try loading the game module only once and instantiate the Game class
            if (!this.gameInstance) {
                // Dynamically import the game.js module and create an instance of the Game class
                const gameModule = await import(`${window.canvasPath}/game.js`);
                this.gameInstance = new gameModule.default();  // Use the default export from game.js
            }

            // Initialize the canvas and game loop
            CanvasUtils.initCanvas(ctx);
            this.clickFullscreen();

            // Call the game loop method of the Game class
            this.gameInstance.gameLoop(deltaTime);

            // Draw border and FPS if necessary
            CanvasUtils.drawBorder();
            if (window.fpsShow) {
                CanvasUtils.drawFPS();
            }
        } else {
            alert('You need a modern browser to see this.');
        }

        // Call animate recursively to continue the animation loop
        requestAnimationFrame(CanvasUtils.animate.bind(this)); // Use `bind(this)` to maintain context
    }

    // Add EventListener moved into the class
    static setupCanvas() {
        window.addEventListener('DOMContentLoaded', () => {
            console.log(`Canvas Path: ${window.canvasPath}`);
            requestAnimationFrame(CanvasUtils.animate.bind(this));
        });
    }
}

// Export the CanvasUtils class
export default CanvasUtils;

// Call the setupCanvas method to initialize the canvas and game loop
CanvasUtils.setupCanvas();
