// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// game.js - Mouse

import MouseInput from '../../../engine/input/mouse.js';
import { LEFT, MIDDLE, RIGHT } from '../../../engine/input/mouse.js';
import PrimitiveRenderer from '../../../engine/renderers/primitiveRenderer.js';

const canvas = document.getElementById('gameArea');
const ctx = canvas.getContext('2d');
const mouse = new MouseInput(canvas);
let animationFrameId = null;
let isDestroyed = false;

function syncCanvasSizeToDisplay() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
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

    PrimitiveRenderer.drawCircle(x, y, 2, fillColor, null, 0, 1, { ctx });
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

syncCanvasSizeToDisplay();
window.addEventListener('resize', syncCanvasSizeToDisplay);
window.addEventListener('pagehide', destroy);
window.addEventListener('beforeunload', destroy);
gameLoop();

