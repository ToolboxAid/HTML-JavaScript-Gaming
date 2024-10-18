// ToolboxAid.com
// David Quesenberry
// canvas.js
// 10/16/2024

class CanvasUtils {
    static frameCount = 0;
    static lastTime = performance.now();
    static fps = 0;

    static initCanvas(ctx) {
        //ctx.clearRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
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

// allow for gameloop to be called.
async function animate(time) {
    var canvas = document.getElementById('gameArea');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        try {
            // Dynamically import game.js and call gameLoop
            const gameModule = await import(`${window.canvasPath}/game.js`);
            CanvasUtils.initCanvas(ctx);
            gameModule.gameLoop(ctx); // Call gameLoop from the imported module
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
    requestAnimationFrame(animate);
}

// Log window.canvasPath when all documents are loaded
window.addEventListener('DOMContentLoaded', () => {
    console.log(`Canvas Path: ${window.canvasPath}`);
    requestAnimationFrame(animate);
});