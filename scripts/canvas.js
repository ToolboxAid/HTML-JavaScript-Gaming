// ToolboxAid.com
// David Quesenberry
// canvas.js
// 10/16/2024

class CanvasUtils {
    static frameCount = 0;
    static lastFPSUpdateTime = performance.now(); // Used for FPS calculation
    static lastFrameTime = performance.now(); // Used for frame delta calculation
    static fps = 0;

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

    static getElapsedTime() {
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastFrameTime; // Use the separate variable
        this.lastFrameTime = currentTime;
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

    static drawLineFromPoints(ctx, start, end) {
        // Function to draw a line from two points
        CanvasUtils.drawLine(ctx, start.x, start.y, end.x, end.y);
    }

    static drawCircle(ctx, point, color = 'red', size = 7, startAngle = 0, endAngle = Math.PI * 2) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, startAngle, endAngle); // Draw a small circle
        ctx.fillStyle = color;
        ctx.fill();
    }

    /**
    * Draws the circle on the canvas.
    * @param {CanvasRenderingContext2D} ctx - The drawing context.
    * @param {string} [fillColor='white'] - The fill color of the circle.
    * @param {string|null} [borderColor=null] - The border color of the circle.
    * @param {number} [borderWidth=0] - The width of the border.
    */
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

}

// Export the CanvasUtils class
export default CanvasUtils;

// allow for gameloop to be called.
let gameModule;
let lastTimestamp = 0;

async function animate(time) {
    var canvas = document.getElementById('gameArea');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        // Calculate the elapsed time since the last frame in seconds
        const deltaTime = (time - lastTimestamp) / 1000; // Convert milliseconds to seconds
        lastTimestamp = time;

        try {
            // Dynamically import game.js and call gameLoop
            if (!gameModule) {
                gameModule = await import(`${window.canvasPath}/game.js`);
            }
            CanvasUtils.initCanvas(ctx);
            gameModule.gameLoop(ctx, deltaTime); // Call gameLoop from the imported module
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
