// ToolboxAid.com
// David Quesenberry
// canvas.js
// 10/16/2024

(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 0;

    function drawFPS(ctx) {
        frameCount++;

        const currentTime = performance.now();
        const elapsedTime = currentTime - lastTime;

        if (elapsedTime >= 1000) {
            fps = frameCount;
            //console.log(`FPS: ${fps}`); // Log the FPS to check if it updates
            frameCount = 0;
            lastTime = currentTime; // Reset lastTime for the next second
        }

        ctx.globalAlpha = 1.0;
        ctx.fillStyle = window.fpsColor || 'white'; // Fallback color
        ctx.font = `${window.fpsSize || '16px'} Arial Bold`;
        ctx.fillText(`FPS: ${fps}`, window.fpsX || 10, window.fpsY || 20); // Default positions
    }


    function getElapsedTime() {
        const currentTime = performance.now();
        const elapsed = currentTime - lastTime;
        lastTime = currentTime;
        return elapsed;
    }

    function drawLine(ctx, x1, y1, x2, y2, lineWidth) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }

    function drawBorder(ctx) {
        ctx.lineWidth = window.borderSize;
        ctx.strokeStyle = window.borderColor;
        ctx.strokeRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
    }

    function initCanvas(ctx) {
        ctx.clearRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
        ctx.fillStyle = window.backgroundColor;
        ctx.fillRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);


    }

    // Export functions to global scope
    window.canvasUtils = {
        drawFPS,
        drawLine,
        drawBorder,
        initCanvas
    };
})();
