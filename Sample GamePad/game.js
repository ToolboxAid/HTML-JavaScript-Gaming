// ToolboxAid.com
// David Quesenberry
// 11/21/2024
// game.js - Gamepad Integration

import GamepadInput from '../scripts/gamepad.js';

const canvas = document.getElementById('gameArea');
const ctx = canvas.getContext('2d');
const gamepadInput = new GamepadInput(); // Instantiate the GamepadInput class

// Example game state
let playerX = 250;
let playerY = 350;
const playerSpeed = 2;
const playerSize = 8;

// Function to update the game state (called on every frame)
function gameUpdate() {
    gamepadInput.update(); // Update the gamepad state

    // Handle gamepad button presses and releases
    if (gamepadInput.isButtonJustPressed(0)) { // Button 0 (usually 'A' or 'X')
        console.log('Button 0 just pressed!');
    }

    if (gamepadInput.isButtonJustPressed(1)) { // Button 1 (usually 'B' or 'Circle')
        console.log('Button 1 just pressed!');
    }

    if (gamepadInput.isButtonReleased(2)) { // Button 2 (usually 'X' or 'Square')
        console.log('Button 2 released!');
    }

    // // Log the buttons currently pressed
    // console.log("Currently pressed buttons: ");
    // for (const button of gamepadInput.buttonsDown) {
    //     console.log(button); // Logs the button index of currently pressed buttons
    // }

    // Log the buttons currently pressed
    console.log("Currently released buttons: ");
    for (const button of gamepadInput.buttonsReleased) {
        console.log(button); // Logs the button index of currently pressed buttons
    }

    // Handle movement with gamepad analog stick (axes)
    const [axisX, axisY] = gamepadInput.getAxes();

    if (axisX > 0) {
        playerX += playerSpeed;
    } else if (axisX < 0) {
        playerX -= playerSpeed;
    }

    if (axisY > 0) {
        playerY += playerSpeed;
    } else if (axisY < 0) {
        playerY -= playerSpeed;
    }

    // Ensure player stays within the canvas bounds
    playerX = Math.max(0, Math.min(canvas.width - playerSize, playerX));
    playerY = Math.max(0, Math.min(canvas.height - playerSize, playerY));
}

// Function to render the game scene
function gameRender() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw the player as a square
    ctx.fillStyle = 'red';
    ctx.fillRect(playerX, playerY, playerSize, playerSize);
    //console.log(playerX, playerY, playerSize, playerSize);
}

// Start the game loop
function gameLoop() {
    gameUpdate();
    gameRender();
    requestAnimationFrame(gameLoop); // Continue the game loop
}

gameLoop(); // Start the first frame

// Clean up when done (e.g., if game is paused or closed)
window.addEventListener('beforeunload', () => {
    gamepadInput.disconnect(); // Stop polling gamepads before the page unloads
});
