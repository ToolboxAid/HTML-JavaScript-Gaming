// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// drawShapesArt.js

import CanvasUtils from '../../../engine/core/canvas.js';

export function drawShapeGallery(canvasConfig) {
    drawGridLines(canvasConfig);
    drawFilledTriangle();
    drawHollowOval();
    drawOverlappingRectangles();
    drawFilledSquare();
    drawHollowSquare();
    drawFilledCircle();
    drawHollowCircle();
}

function drawFilledCircle() {
    CanvasUtils.ctx.beginPath();
    CanvasUtils.ctx.arc(450, 510, 50, 0, Math.PI * 2);
    CanvasUtils.ctx.fillStyle = '#ed9700';
    CanvasUtils.ctx.fill();
}

function drawHollowCircle() {
    CanvasUtils.ctx.beginPath();
    CanvasUtils.ctx.arc(550, 510, 50, 0, Math.PI * 2);
    CanvasUtils.ctx.strokeStyle = '#ffffff';
    CanvasUtils.ctx.lineWidth = 3;
    CanvasUtils.ctx.stroke();
}

function drawFilledSquare() {
    CanvasUtils.ctx.fillStyle = '#f5d7a4';
    CanvasUtils.ctx.fillRect(350, 300, 100, 100);
}

function drawHollowSquare() {
    CanvasUtils.ctx.strokeStyle = '#ed9700';
    CanvasUtils.ctx.lineWidth = 3;
    CanvasUtils.ctx.strokeRect(480, 300, 100, 100);
}

function drawFilledTriangle() {
    CanvasUtils.ctx.fillStyle = '#d6c4ff';
    CanvasUtils.ctx.beginPath();
    CanvasUtils.ctx.moveTo(140, 180);
    CanvasUtils.ctx.lineTo(200, 320);
    CanvasUtils.ctx.lineTo(80, 320);
    CanvasUtils.ctx.closePath();
    CanvasUtils.ctx.fill();
}

function drawHollowOval() {
    CanvasUtils.ctx.strokeStyle = '#ed9700';
    CanvasUtils.ctx.lineWidth = 3;
    CanvasUtils.ctx.beginPath();
    CanvasUtils.ctx.ellipse(255, 310, 85, 56, 0, 0, Math.PI * 2);
    CanvasUtils.ctx.stroke();
}

function drawGridLines(canvasConfig) {
    for (let row = 0; row <= canvasConfig.height; row += 100) {
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.moveTo(0, row);
        CanvasUtils.ctx.lineTo(canvasConfig.width, row);
        CanvasUtils.ctx.lineWidth = 2;
        CanvasUtils.ctx.strokeStyle = '#3600af';
        CanvasUtils.ctx.stroke();
    }

    for (let col = 0; col <= canvasConfig.width; col += 100) {
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.moveTo(col, 0);
        CanvasUtils.ctx.lineTo(col, canvasConfig.height);
        CanvasUtils.ctx.lineWidth = 2;
        CanvasUtils.ctx.strokeStyle = '#ed970044';
        CanvasUtils.ctx.stroke();
    }
}

function drawOverlappingRectangles() {
    CanvasUtils.ctx.fillStyle = '#ed9700';
    CanvasUtils.ctx.fillRect(605, 235, 110, 110);
    CanvasUtils.ctx.fillStyle = '#ffffff';
    CanvasUtils.ctx.globalAlpha = 0.35;
    CanvasUtils.ctx.fillRect(625, 255, 90, 90);
    CanvasUtils.ctx.fillStyle = '#3600af';
    CanvasUtils.ctx.globalAlpha = 0.65;
    CanvasUtils.ctx.fillRect(645, 275, 70, 70);
    CanvasUtils.ctx.globalAlpha = 1;
}
