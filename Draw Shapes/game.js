// game.js



function drawFilledCircle(ctx) {
    ctx.beginPath();
    ctx.arc(450, 550, 50, 0, Math.PI * 2);
    ctx.fillStyle = 'yellow';
    ctx.fill();
}

function drawHollowCircle(ctx) {
    ctx.beginPath();
    ctx.arc(550, 550, 50, 0, Math.PI * 2);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawFilledSquare(ctx) {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(350, 350, 100, 100);
}

function drawHollowSquare(ctx) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(500, 350, 100, 100);
}

function drawFilledTriangle(ctx) {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(50, 100);
    ctx.lineTo(100, 250);
    ctx.lineTo(0, 250);
    ctx.closePath();
    ctx.fill();
}

function drawHollowOval(ctx) {
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(200, 150, 75, 50, 0, 0, Math.PI * 2);
    ctx.stroke();
}

function drawGridLines(ctx) {
    for (let gx = 0; gx <= gameAreaHeight; gx += 100) {
        ctx.beginPath();
        ctx.moveTo(0, gx);
        ctx.lineTo(gameAreaWidth, gx);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#3600af';
        ctx.stroke();
    }
    for (let gy = 0; gy <= gameAreaWidth; gy += 100) {
        ctx.beginPath();
        ctx.moveTo(gy, 0);
        ctx.lineTo(gy, gameAreaHeight);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ed9700';
        ctx.stroke();
    }
}

function drawOverlappingRectangles(ctx) {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(415, 115, 120, 120);
    ctx.fillStyle = 'red';
    ctx.globalAlpha = 0.5;
    ctx.fillRect(430, 130, 90, 90);
    ctx.globalAlpha = 1.0; // Reset alpha to 1
    ctx.fillRect(445, 145, 60, 60);
    ctx.fillStyle = '#00808080';
    ctx.fillRect(460, 160, 70, 70);
}


function gameLoop(ctx) {
    // Call each drawing function
    drawFilledCircle(ctx);
    drawHollowCircle(ctx);
    drawFilledSquare(ctx);
    drawHollowSquare(ctx);
    drawFilledTriangle(ctx);
    drawHollowOval(ctx);
    drawGridLines(ctx);
    drawOverlappingRectangles(ctx);
}
