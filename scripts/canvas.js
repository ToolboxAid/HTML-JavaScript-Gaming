// ToolboxAid.com
// David Quesenberry
// canvas.js
// 10/16/2024
// canvas related variables & methods

let frameCount = 0;
let lastTime = 0;
let fps = 0;

function drawFPS(ctx) {
    // Update frame count
    frameCount++;

    // Calculate FPS
    if (performance.now() - lastTime >= 1000) {
        fps = frameCount;           // Set FPS to the current frame count
        frameCount = 0;            // Reset frame count
        lastTime = performance.now(); // Update last time
    }

    // Draw the FPS on the canvas
    ctx.globalAlpha = 1.0; // Reset opacity
    ctx.fillStyle = fpsColor; // Set text color
    try {
        ctx.font = fpsSize + ' Arial Bold'; // Set font size and family
    }
    catch (error) {
        ctx.font = '40px Arial Bold'; // Set font size and family
    }
    ctx.fillText('FPS: ' + fps, 30, 50); // Draw the FPS at coordinates (30, 30)
}

// Draw a line from point (x1, y1) to (x2, y2) with a specified line width
function drawLine(ctx, x1, y1, x2, y2, lineWidth) {
    ctx.beginPath(); // Start a new path
    ctx.moveTo(x1, y1); // Move to the starting point
    ctx.lineTo(x2, y2); // Draw a line to the ending point
    ctx.lineWidth = lineWidth; // Set the line width
    ctx.stroke(); // Render the line
}
// Example usage
//drawLine(ctx, squareX + squareSize / 2, squareY + squareSize / 2, futureSquareX + squareSize / 2, futureSquareY + squareSize / 2, 5); // Line width of 5

function drawBorder(ctx) {
    ctx.lineWidth = boarderSize;
    ctx.strokeStyle = boarderColor;
    ctx.strokeRect(0, 0, gameAreaWidth, gameAreaHeight);
}

function initCanvas(ctx) {
    // Clearing Previous Drawings
    ctx.clearRect(0, 0, gameAreaWidth, gameAreaHeight);

    // Creating a Clean Slate
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, gameAreaWidth, gameAreaHeight);
}

function animate(time) {
    var canvas = document.getElementById('gameArea');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        // Initialize Canvas area
        initCanvas(ctx);

        // Game Loop
        gameLoop(ctx, time);

        // Draw Border
        drawBorder(ctx);

        // Show the FPS
        if (showFPS) {
            drawFPS(ctx); // Call drawFPS with the current context
        }
    } else {
        alert('You need a modern browser to see this.');
    }
    // Request another loop of animation
    requestAnimationFrame(animate);
}

// Wait for the page to fully load before starting the game loop
window.addEventListener('DOMContentLoaded', () => {
    // Start the animation loop
    requestAnimationFrame(animate);
});
