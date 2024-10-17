// ToolboxAid.com
// David Quesenberry
// canvas.js
// 10/16/2024

(() => {
    let frameCount = 0;
    let lastTime = 0;
    let fps = 0;

    const FPS_DISPLAY_POSITION = { x: 30, y: 50 };

    function drawFPS(ctx) {
        frameCount++;

        if (getElapsedTime() >= 1000) {
            fps = frameCount;
            frameCount = 0;
        }

        ctx.globalAlpha = 1.0; 
        ctx.fillStyle = window.fpsColor;
        ctx.font = `${window.fpsSize} Arial Bold`; 
        ctx.fillText(`FPS: ${fps}`, FPS_DISPLAY_POSITION.x, FPS_DISPLAY_POSITION.y);
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
        ctx.clearRect(0, 0, 858, 525);
        ctx.fillStyle = window.backgroundColor;
        ctx.fillRect(0, 0, 858, 525);
        console.log("init");
    }

    function initCanvas1(ctx) {
        ctx.clearRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
        ctx.fillStyle = window.backgroundColor;
        ctx.fillRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
        console.log("init");
    }    

    // Export functions to global scope
    window.canvasUtils = {
        drawFPS,
        drawLine,
        drawBorder,
        initCanvas
    };
})();
