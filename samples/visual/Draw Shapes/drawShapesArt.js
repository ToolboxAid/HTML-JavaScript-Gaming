// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// drawShapesArt.js

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
        PrimitiveRenderer.drawLine(0, row, canvasConfig.width, row, '#3600af', 2);
    }

    for (let col = 0; col <= canvasConfig.width; col += 100) {
        PrimitiveRenderer.drawLine(col, 0, col, canvasConfig.height, '#ed9700', 2, 0.27);
    }
}

function drawOverlappingRectangles() {
    PrimitiveRenderer.drawRect(605, 235, 110, 110, '#ed9700');
    PrimitiveRenderer.drawRect(625, 255, 90, 90, '#ffffff', null, 0, 0.35);
    PrimitiveRenderer.drawRect(645, 275, 70, 70, '#3600af', null, 0, 0.65);
}

