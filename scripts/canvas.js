// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// canvas.js

import ObjectStatic from './objectStatic.js';
import Fullscreen from './fullscreen.js'; // Import the Fullscreen class
import Font5x6 from './font5x6.js';
import Colors from './colors.js';
import Sprite from './sprite.js';
import PerformanceMonitor from './performacneMonitor.js';

class CanvasUtils {

    static gameModule;
    static lastTimestamp = 0;
    static ctx = null;

    /**
     * Draw text and numbers 
     */
    static drawNumber(x, y, number, pixelSize, color = 'white', leadingCount = 5, leadingChar = '0') {
        const numberStr = number.toString();
        if (numberStr.length > leadingCount) {
            leadingCount = numberStr.length;
        }
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
                CanvasUtils.drawSprite(x + i * (charWidth * pixelSize + 5), y, frame, pixelSize, color);
            }
        }
    }

    // get text width & height based on size & font w/padding
    static calculateTextMetrics(text, fontSize = 20, font = 'Arial') {
        // Set font
        CanvasUtils.ctx.font = `${fontSize}px ${font}`;

        // Measure text
        const metrics = CanvasUtils.ctx.measureText(text);
        const width = Math.ceil(metrics.width);

        // Get height using font metrics
        const height = Math.ceil(
            metrics.actualBoundingBoxAscent +
            metrics.actualBoundingBoxDescent
        );

        return {
            width: width + 10,    // Add padding
            height: height + 5    // Add padding
        };
    }

    // Method to draw the current frame
    static drawSprite(x, y, frame, pixelSize, spriteColor = 'white', drawBounds = false) {
        for (let row = 0; row < frame.length; row++) {
            for (let col = 0; col < frame[row].length; col++) {
                const pixel = frame[row][col];
                let color = Colors.symbolColorMap[pixel] || '#00000000'; // transparent';

                // Replace white with spriteColor if present
                if (pixel === '1' && spriteColor) {
                    color = spriteColor; // Use sprite color instead of white
                }
                CanvasUtils.ctx.fillStyle = color;
                let ceilX = Math.ceil((col * pixelSize) + x);
                let ceilY = Math.ceil((row * pixelSize) + y);
                let ceilPixelSize = Math.ceil(pixelSize);
                CanvasUtils.ctx.fillRect(ceilX, ceilY, ceilPixelSize, ceilPixelSize);
            }
        }

        if (drawBounds) {
            let dimensions = Sprite.getWidthHeight(frame, pixelSize);
            CanvasUtils.drawBounds(x, y, dimensions.width, dimensions.height, spriteColor, 2);
        }
    }

    // Method to draw the current frame
    static drawSpriteRGB(x, y, frame, pixelSize, drawBounds = false) {
        for (let row = 0; row < frame.length; row++) {
            for (let col = 0; col < frame[row].length; col++) {
                CanvasUtils.ctx.fillStyle = frame[row][col];
                let ceilX = Math.ceil((col * pixelSize) + x);
                let ceilY = Math.ceil((row * pixelSize) + y);
                let ceilPixelSize = Math.ceil(pixelSize);
                CanvasUtils.ctx.fillRect(ceilX, ceilY, ceilPixelSize, ceilPixelSize);
            }
        }

        if (drawBounds) {
            const dimensions = Sprite.getLayerDimensions(frame, pixelSize);
            CanvasUtils.drawBounds(x, y, dimensions.width, dimensions.height, "white", 2);
        }
    }

    /**
     * Line methods
     */
    static drawLine(x1, y1, x2, y2, lineWidth = 5, strokeColor = 'white') {
        CanvasUtils.ctx.lineWidth = lineWidth;
        CanvasUtils.ctx.strokeStyle = strokeColor;

        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.moveTo(x1, y1); // Start point
        CanvasUtils.ctx.lineTo(x2, y2); // End point
        CanvasUtils.ctx.stroke(); // Draw the line
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
        CanvasUtils.ctx.setLineDash(dashPattern);
        CanvasUtils.drawLine(x1, y1, x2, y2, lineWidth, strokeColor);
        CanvasUtils.ctx.setLineDash([]); // Reset to solid line
    }

    static drawBounds(x, y, w, h, color = 'red', lineSize = 1) {
        if (w <= 0) {
            w = 10;
        }
        if (h <= 0) {
            h = 10;
        }
        CanvasUtils.ctx.lineWidth = lineSize;
        CanvasUtils.ctx.strokeStyle = color;
        CanvasUtils.ctx.strokeRect(x, y, w, h);
    }

    static drawRect(x, y, width, height, color) {
        CanvasUtils.ctx.fillStyle = color;
        CanvasUtils.ctx.fillRect(x, y, width, height);
    }

    static drawBorder() {
        CanvasUtils.ctx.lineWidth = window.borderSize || 1; // Fallback if borderSize is not set
        CanvasUtils.ctx.strokeStyle = window.borderColor || 'black'; // Fallback if borderColor is not set
        CanvasUtils.ctx.strokeRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
    }

    /**
     * Circle methods
     */
    static drawCircle(point, color = 'red', size = 7, startAngle = 0, endAngle = Math.PI * 2) {
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.arc(point.x, point.y, size, startAngle, endAngle); // Draw a small circle
        CanvasUtils.ctx.fillStyle = color;
        CanvasUtils.ctx.fill();
    }

    static drawCircle2(x, y, radius, fillColor = 'white', borderColor = null, borderWidth = 0) {
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.arc(x, y, radius, 0, Math.PI * 2); // Draw circle
        CanvasUtils.ctx.fillStyle = fillColor;
        CanvasUtils.ctx.fill();

        if (borderColor && borderWidth > 0) {
            CanvasUtils.ctx.strokeStyle = borderColor;
            CanvasUtils.ctx.lineWidth = borderWidth;
            CanvasUtils.ctx.stroke();
        }
    }

    /**
     *  Canvas Init Methods
     */

    static canvasClear(ctx) {
        CanvasUtils.ctx.fillStyle = window.backgroundColor || 'white'; // Fallback if backgroundColor is not set
        CanvasUtils.ctx.fillRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
    }

    static clickFullscreen() {
        if (!Fullscreen.isFullScreen) {
            // Set up the text properties using global variables or default values
            CanvasUtils.ctx.fillStyle = window.fullscreenColor || 'white'; // Set text color
            CanvasUtils.ctx.font = window.fullscreenFont || '40px Arial'; // Set font size and family

            // Reset text alignment to default (start)
            CanvasUtils.ctx.textAlign = 'start';

            // Measure the width of the text "Click here to enter fullscreen"
            const text = window.fullscreenText || 'Click here to enter fullscreen';
            const textWidth = CanvasUtils.ctx.measureText(text).width; // Get the width of the text in pixels

            const textX = window.fullscreenX || (window.gameAreaWidth - textWidth) / 2;

            const textY = window.fullscreenY || window.gameAreaHeight * (4 / 5); // Position the text vertically


            // Draw the message on the canvas
            CanvasUtils.ctx.fillText(text, textX, textY); // Display the text at the calculated position
        }
    }

    // Animate function moved into the CanvasUtils class?
    static showTextMetrics = false;
    static async animate(time) {

        const timeStartMs = Date.now();

        const canvas = document.getElementById('gameArea');
        if (canvas.getContext) {
            const ctx = canvas.getContext('2d');

            const deltaTime = (time - this.lastTimestamp) / 1000; // Convert milliseconds to seconds
            this.lastTimestamp = time;

            // Try loading the game module only once and instantiate the Game class
            if (!this.gameInstance) {
                // Dynamically import the game.js module and create an instance of the Game class
                // HACK - needs to be moved elseware
                const gameModule = await import(`${window.canvasPath}/game.js`);
                this.gameInstance = new gameModule.default();  // Use the default export from game.js

                CanvasUtils.ctx = ctx;
            }

            CanvasUtils.canvasClear(ctx);

            if (CanvasUtils.showTextMetrics) {
                CanvasUtils.showTextMetrics = false;
                CanvasUtils.canvasClear(CanvasUtils.ctx);
                console.log(CanvasUtils.calculateTextMetrics("MEM: 30.66/33.08MB", 30, "monospace"));
            }

            // Call the game loop method of the Game class
            Colors.generateRandomColor();
            this.gameInstance.gameLoop(deltaTime);

            // Draw click full screen
            this.clickFullscreen();

            // Draw border
            CanvasUtils.drawBorder();

        } else {
            alert('You need a modern browser to see this.');
        }

        const timeSpentMs = Date.now() - timeStartMs;
        PerformanceMonitor.update(timeSpentMs);
        PerformanceMonitor.draw(CanvasUtils.ctx);

        // Call animate recursively to continue the animation loop
        requestAnimationFrame(CanvasUtils.animate.bind(this)); // Use `bind(this)` to maintain context
    }

    // Add EventListener moved into the class
    static setupCanvas() {
        ObjectStatic.gameAreaWidth = window.gameAreaWidth;
        ObjectStatic.gameAreaHeight = window.gameAreaHeight;

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
