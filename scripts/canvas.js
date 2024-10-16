// ToolboxAid.com
// David Quesenberry
// canvas.js
// 10/16/2024
// canvas related variables & methods

let frameCount = 0;
let lastTime = 0;
let fps = 0;

function drawFPS(ctx) {
    frameCount++;

    if (performance.now() - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = performance.now();
    }

    ctx.globalAlpha = 1.0; 
    ctx.fillStyle = window.fpsColor; // Accessing global variable
    try {
        ctx.font = window.fpsSize + ' Arial Bold'; // Accessing global variable
    } catch (error) {
        ctx.font = '40px Arial Bold'; 
    }
    ctx.fillText('FPS: ' + fps, 30, 50);
}

function drawLine(ctx, x1, y1, x2, y2, lineWidth) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

function drawBorder(ctx) {
    ctx.lineWidth = window.borderSize; // Accessing global variable
    ctx.strokeStyle = window.borderColor; // Accessing global variable
    ctx.strokeRect(0, 0, window.gameAreaWidth, window.gameAreaHeight); // Accessing global variables
}

function initCanvas(ctx) {
    ctx.clearRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
    ctx.fillStyle = window.backgroundColor; // Accessing global variable
    ctx.fillRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
}


