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

    static initCanvas(ctx) {
        ctx.fillStyle = window.backgroundColor || 'white'; // Fallback if backgroundColor is not set
        ctx.fillRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
    }

    static drawFPS(ctx) {
        this.frameCount++;

        const currentTime = performance.now();
        const elapsedTime = currentTime - this.lastFPSUpdateTime; // Use the separate variable

        if (elapsedTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdateTime = currentTime; // Reset lastTime for the next second
        }

        ctx.globalAlpha = 1.0;
        ctx.fillStyle = window.fpsColor || 'white'; // Fallback color
        ctx.font = `${window.fpsSize || '16px'} Arial Bold`;
        ctx.fillText(`FPS: ${this.fps}`, window.fpsX || 10, window.fpsY || 20); // Default positions
    }

    static drawBorder(ctx) {
        ctx.lineWidth = window.borderSize || 1; // Fallback if borderSize is not set
        ctx.strokeStyle = window.borderColor || 'black'; // Fallback if borderColor is not set
        ctx.strokeRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
    }

    static drawNumber(ctx, x, y, number, pixelSize, color = 'white', leadingCount = 5, leadingChar = '0') {
        const numberStr = number.toString();
        const leadingLength = Math.max(0, leadingCount - numberStr.length); // Calculate number of leading characters needed
        const text = leadingChar.repeat(leadingLength) + numberStr; // Create text with leading characters

        // Ensure text length is exactly 5
        const formattedText = text.padStart(leadingCount, leadingChar).slice(-leadingCount);
        this.drawText(ctx, x, y, formattedText, pixelSize, color);
    }

    static drawText(ctx, x, y, text, pixelSize, color = 'white') {
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const frame = Font5x6.font5x6[char];

            if (frame) {
                // Assuming each character has a fixed width, you can adjust the space here
                const charWidth = frame[0].length; // Get the width from the frame
                CanvasUtil.drawSprite(ctx, x + i * (charWidth * pixelSize + 5), y, frame, pixelSize, color);
            }
        }
    }


    static drawBounds(ctx, x, y, w, h, color = 'red') {
        ctx.lineWidth = 1;
        ctx.strokeStyle = color;
        ctx.strokeRect(x, y, w, h);
    }
    // Method to draw the current frame
    static drawSprite(ctx, x, y, frame, pixelSize, spriteColor = '') {
        // Define a color map for letters
        const colorMap = {
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

        let w = 0;
        let h = 0;
        for (let row = 0; row < frame.length; row++) {
            for (let col = 0; col < frame[row].length; col++) {
                const pixel = frame[row][col];
                let color = colorMap[pixel] || 'transparent'; // Default to transparent if pixel is not in colorMap

                // Replace white with spriteColor if present
                if (pixel === '1' && spriteColor) {
                    color = spriteColor; // Use sprite color instead of white
                }
                ctx.fillStyle = color;
                let roundedpixelSize = pixelSize; //Math.floor(pixelSize);
                ctx.fillRect((col * pixelSize) + x, (row * pixelSize) + y, roundedpixelSize, roundedpixelSize);


            }
        }

        if (true) {
            h = pixelSize * frame.length;
            w = pixelSize * frame[0].length;
            CanvasUtils.drawBounds(ctx, x, y, w, h);
            //console.log(pixelSize);
        }
    }

    static drawLine(ctx, x1, y1, x2, y2, lineWidth = 5, strokeColor = 'white') {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeColor;

        ctx.beginPath();
        ctx.moveTo(x1, y1); // Start point
        ctx.lineTo(x2, y2); // End point
        ctx.stroke(); // Draw the line
    }

    static drawLineFromPoints(ctx, start, end, lineWidth = 5, strokeColor = 'red') {
        CanvasUtils.drawLine(ctx, start.x, start.y, end.x, end.y, lineWidth, strokeColor);
    }

    static drawDashLine(ctx, x1, y1, x2, y2, lineWidth, strokeColor = 'white', dashPattern = [10, 10]) {
        /* ctx.setLineDash
             ([5, 15]);        - Short dashes with longer gaps
             ([15, 5]);        - Long dashes with short gaps
             ([15, 5, 5, 5]);  - Long dash, short gap, short dash, short gap
             ([20, 5, 10, 5]); - Alternating long and medium dashes
         */
        ctx.setLineDash(dashPattern);
        CanvasUtils.drawLine(ctx, x1, y1, x2, y2, lineWidth, strokeColor);
        ctx.setLineDash([]); // Reset to solid line
    }

    static drawCircle(ctx, point, color = 'red', size = 7, startAngle = 0, endAngle = Math.PI * 2) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, startAngle, endAngle); // Draw a small circle
        ctx.fillStyle = color;
        ctx.fill();
    }

    static drawCircle2(ctx, x, y, radius, fillColor = 'white', borderColor = null, borderWidth = 0) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2); // Draw circle
        ctx.fillStyle = fillColor;
        ctx.fill();

        if (borderColor && borderWidth > 0) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            ctx.stroke();
        }
    }

    static clickFullscreen(ctx) {
        if (!Fullscreen.isFullScreen) {
            // Set up the text properties using global variables or default values
            ctx.fillStyle = window.fullscreenColor || 'white'; // Set text color
            ctx.font = window.fullscreenFont || '40px Arial';; // Set font size and family

            // Reset text alignment to default (start)
            ctx.textAlign = 'start';

            // Measure the width of the text "Click here to enter fullscreen"
            const text = window.fullscreenText || 'Click here to enter fullscreen';
            const textWidth = ctx.measureText(text).width; // Get the width of the text in pixels

            const textX = window.fullscreenX || (window.gameAreaWidth - textWidth) / 2;

            const textY = window.fullscreenY || window.gameAreaHeight * (4 / 5); // Position the text vertically


            // Draw the message on the canvas
            ctx.fillText(text, textX, textY); // Display the text at the calculated position
        }
    }

    // Animate function moved into the CanvasUtils class
    static async animate(time) {
        var canvas = document.getElementById('gameArea');
        if (canvas.getContext) {
            var ctx = canvas.getContext('2d');

            const deltaTime = (time - this.lastTimestamp) / 1000; // Convert milliseconds to seconds
            this.lastTimestamp = time;

            //try {
            if (!this.gameModule) {
                this.gameModule = await import(`${window.canvasPath}/game.js`);
            }
            CanvasUtils.initCanvas(ctx);
            this.clickFullscreen(ctx);
            this.gameModule.gameLoop(ctx, deltaTime); // Call gameLoop from the imported module
            CanvasUtils.drawBorder(ctx);
            if (window.fpsShow) {
                CanvasUtils.drawFPS(ctx);
            }
            // } catch (error) {
            //     console.error(`Failed to load game module: ${error}`);
            // }
        } else {
            alert('You need a modern browser to see this.');
        }
        requestAnimationFrame(CanvasUtils.animate.bind(this)); // Call animate recursively
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
