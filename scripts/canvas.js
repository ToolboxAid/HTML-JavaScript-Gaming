// Import canvasConfig variables
import { canvasConfig } from './global.js';

// Set the game area width based on canvasConfig
window.gameAreaWidth = canvasConfig.width;

// ToolboxAid.com
// David Quesenberry
// canvas.js
// 10/16/2024

class CanvasUtils {
    static frameCount = 0;
    static lastTime = performance.now();
    static fps = 0;

    static initCanvas(ctx) {
        ctx.clearRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
        ctx.fillStyle = window.backgroundColor || 'white'; // Fallback if backgroundColor is not set
        ctx.fillRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
    }

    static drawFPS(ctx) {
        this.frameCount++;

        const currentTime = performance.now();
        const elapsedTime = currentTime - this.lastTime;

        if (elapsedTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime; // Reset lastTime for the next second
        }

        ctx.globalAlpha = 1.0;
        ctx.fillStyle = window.fpsColor || 'white'; // Fallback color
        ctx.font = `${window.fpsSize || '16px'} Arial Bold`;
        ctx.fillText(`FPS: ${this.fps}`, window.fpsX || 10, window.fpsY || 20); // Default positions
    }

    static getElapsedTime() {
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastTime;
        this.lastTime = currentTime;
        return elapsed;
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

    static drawDashLine(ctx, x1, y1, x2, y2, lineWidth, strokeColor = 'white', dashPattern = [10, 10]) {
        // Set the line dash pattern
        ctx.setLineDash(dashPattern);
        CanvasUtils.drawLine(ctx, x1, y1, x2, y2, lineWidth, strokeColor);
        // Reset to solid line
        ctx.setLineDash([]); // Empty array means a solid line        
    }
}

// Export the CanvasUtils class
export default CanvasUtils;
