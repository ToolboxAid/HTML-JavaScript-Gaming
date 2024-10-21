// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// canvas.js

import Fullscreen from '../scripts/fullscreen.js'; // Import the Fullscreen class

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

    static drawLine(ctx, x1, y1, x2, y2, lineWidth = 5, strokeColor = 'white') {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeColor;

        ctx.beginPath();
        ctx.moveTo(x1, y1); // Start point
        ctx.lineTo(x2, y2); // End point
        ctx.stroke(); // Draw the line
    }

    static drawLineFromPoints(ctx, start, end) {
        CanvasUtils.drawLine(ctx, start.x, start.y, end.x, end.y);
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
            const text = window.fullscreenText || 'Click here to enter fullscreen';
            const font = window.fullscreenFont || '40px Arial';
            const color = window.fullscreenColor || 'white';
            ctx.fillStyle = color; // Set text color
            ctx.font = font; // Set font size and family
            
            // Measure the width of the text "Click here to enter fullscreen"
            const textWidth = ctx.measureText(text).width; // Get the width of the text in pixels
            const textX = (window.gameAreaWidth - textWidth) / 2; // Center the text horizontally
            const textY = window.gameAreaHeight * (4 / 5); // Position the text vertically
            
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

            try {
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
            } catch (error) {
                console.error(`Failed to load game module: ${error}`);
            }
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
