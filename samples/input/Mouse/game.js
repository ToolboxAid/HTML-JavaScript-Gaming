// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// game.js - Mouse

import MouseInput from '../../../engine/input/mouse.js';
import { LEFT, MIDDLE, RIGHT } from '../../../engine/input/mouse.js';

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
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    if (mouse.isButtonIndexDown(LEFT)) {
        ctx.fillStyle = 'orange';
    }
    if (mouse.isButtonIndexDown(MIDDLE)) {
        ctx.fillStyle = 'yellow';
    }
    if (mouse.isButtonIndexDown(RIGHT)) {
        ctx.fillStyle = 'green';
    }
    ctx.fill();
    ctx.closePath();
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

