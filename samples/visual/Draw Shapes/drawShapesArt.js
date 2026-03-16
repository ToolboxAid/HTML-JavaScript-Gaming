// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// drawShapesArt.js

import CanvasUtils from '../../../engine/core/canvasUtils.js';
import PrimitiveRenderer from '../../../engine/renderers/primitiveRenderer.js';

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
    PrimitiveRenderer.drawCircle(450, 510, 50, '#ed9700');
}

function drawHollowCircle() {
    PrimitiveRenderer.drawCircle(550, 510, 50, null, '#ffffff', 3);
}

function drawFilledSquare() {
    PrimitiveRenderer.drawRect(350, 300, 100, 100, '#f5d7a4');
}

function drawHollowSquare() {
    PrimitiveRenderer.drawRect(480, 300, 100, 100, null, '#ed9700', 3);
}

function drawFilledTriangle() {
    PrimitiveRenderer.drawTriangle([
        { x: 140, y: 180 },
        { x: 200, y: 320 },
        { x: 80, y: 320 }
    ], '#d6c4ff');
}

function drawHollowOval() {
    PrimitiveRenderer.drawEllipse(255, 310, 85, 56, null, '#ed9700', 3);
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

