// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// game.js - Sample Mouse

import MouseInput from '../scripts/input/mouse.js';
import { LEFT, MIDDLE, RIGHT } from '../scripts/input/mouse.js';

const canvas = document.getElementById('gameArea');
const ctx = canvas.getContext('2d');

const mouse = new MouseInput(canvas);

// Update the mouse state and log interactions
function gameUpdate() {
    mouse.update(); // Update the mouse state

    // Log mouse position relative to the canvas
    //console.log('Mouse position relative to canvas:', mouse.getPosition());

    if (mouse.wasButtonIndexPressed(0)) {
        console.log('Left mouse button just pressed at:', mouse.getPosition());
    }

    if (mouse.wasButtonIndexReleased(1)) {
        console.log('Middle mouse button just released at:', mouse.getPosition());
    }

    if (mouse.wasButtonIndexReleased(2)) {
        console.log('Right mouse button just released at:', mouse.getPosition());
    }

    const position = mouse.getPosition();
    //console.log('Mouse movement delta:', mouse.getMouseDelta());
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
    ctx.fill(); // Fill the circle
    ctx.closePath();
}

// Start the game loop
function gameLoop() {
    gameUpdate();
    requestAnimationFrame(gameLoop);
}

gameLoop();
