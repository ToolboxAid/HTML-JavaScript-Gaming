// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// game.js - Mouse

import MouseInput from '../../../engine/input/mouse.js';
import { LEFT, MIDDLE, RIGHT } from '../../../engine/input/mouse.js';
import CanvasUtils from '../../../engine/core/canvasUtils.js';
import PrimitiveRenderer from '../../../engine/renderers/primitiveRenderer.js';

const canvas = document.getElementById('gameArea');
const mouse = new MouseInput(canvas);
let animationFrameId = null;
let isDestroyed = false;

function syncCanvasSizeToDisplay() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    CanvasUtils.config.width = rect.width;
    CanvasUtils.config.height = rect.height;
}

// Update mouse state and draw a small color-coded cursor trail.
function gameUpdate() {
    mouse.update();
    const position = mouse.getPosition();
    drawDot(position.x, position.y);
}

function drawDot(x, y) {
    let fillColor = 'red';
    if (mouse.isButtonIndexDown(LEFT)) {
        fillColor = 'orange';
    }
    if (mouse.isButtonIndexDown(MIDDLE)) {
        fillColor = 'yellow';
    }
    if (mouse.isButtonIndexDown(RIGHT)) {
        fillColor = 'green';
    }

    PrimitiveRenderer.drawMarker(x, y, 2, fillColor, 1);
}

// Start the game loop
function gameLoop() {
    if (isDestroyed) {
        return;
    }

    gameUpdate();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function destroy() {
    if (isDestroyed) {
        return;
    }

    isDestroyed = true;

    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
    }

    mouse.destroy();
}

async function init() {
    syncCanvasSizeToDisplay();
    await CanvasUtils.init({
        width: canvas.width,
        height: canvas.height,
        scale: 1.0,
        backgroundColor: '#2f2f2f',
        borderColor: 'red',
        borderSize: 15
    });
    CanvasUtils.canvasClear();

    window.addEventListener('resize', syncCanvasSizeToDisplay);
    window.addEventListener('pagehide', destroy);
    window.addEventListener('beforeunload', destroy);
    gameLoop();
}

init();

