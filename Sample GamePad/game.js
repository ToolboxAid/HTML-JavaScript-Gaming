// ToolboxAid.com
// David Quesenberry
// 11/21/2024
// game.js - Gamepad Integration with Button States on Canvas

import GamepadInput from '../scripts/gamepad.js';

const canvas = document.getElementById('gameArea');
const ctx = canvas.getContext('2d');
const gamepadInput = new GamepadInput(); // Instantiate the GamepadInput class

// Player state for each gamepad
const players = [];

// Create a player for each gamepad
function createPlayer(gamepadIndex) {
    // Assign each player a different color and initial position
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'magenta', 'purple', 'cyan', 'brown', 'lime'];
    const color = colors[gamepadIndex % colors.length]; // Loop through colors if more than 10 gamepads

    players[gamepadIndex] = {// this is to allow player to be drawn
        color,
        x: 100 + gamepadIndex * 50,  // Offset initial positions for each player
        y: 100 + gamepadIndex * 50,
        speed: 2,
        size: 8,
        width: 77,
        height: 18,
        buttonColors: Array(10).fill('gray'), // Initialize button colors (max of 10 buttons)
    };
}

// Function to update the game state (called on every frame)
function gameUpdate() {
    gamepadInput.update(); // Update the gamepad state

    // Iterate over all connected gamepads and handle input for each player
    gamepadInput.gamepads.forEach((gamepadState, index) => {
        if (gamepadState) {
            // Create player if it's the first time this gamepad is detected
            if (!players[index]) createPlayer(index);

            const player = players[index];

            // Reset all button colors to gray
            player.buttonColors = Array(10).fill('gray');

            // Handle button presses for each gamepad
            const buttonsDown = gamepadInput.getButtonsDown(index);
            if (buttonsDown.length > 0) {
                // Set all buttons to 'gray'
                player.buttonColors = new Array(10).fill('gray');

                // Iterate over buttons down
                buttonsDown.forEach(button => {
                    player.buttonColors[button] = true ? player.color : 'gray';
                });
            }

            // Handle movement with gamepad analog stick (axes)
            const [axisX, axisY] = gamepadInput.getAxes(index);
            let moveX = 0, moveY = 0;

            if (axisX > 0) moveX = player.speed;
            else if (axisX < 0) moveX = -player.speed;

            if (axisY > 0) moveY = player.speed;
            else if (axisY < 0) moveY = -player.speed;

            player.x += moveX;
            player.y += moveY;

            // Ensure player stays within the canvas bounds
            player.x = Math.max(-6, Math.min(canvas.width - player.width, player.x));
            player.y = Math.max(10, Math.min(canvas.height - player.height, player.y));
        }
    });
}

// Function to render the game scene
function gameRender() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw each player as a square with their unique color
    players.forEach((player, index) => {
        if (player) {
            // // Draw player (colored square)
            // ctx.fillStyle = player.color;
            // ctx.fillRect(player.x, player.y, player.size, player.size);

            // Draw button states for each player
            const buttonSize = 12;
            ctx.font = '8px Arial';
            ctx.fillStyle = 'black';

            // Draw the button indicators next to the player
            player.buttonColors.forEach((color, buttonIndex) => {
                const buttonX = player.x + player.size + 6 + (buttonIndex % 5) * (buttonSize + 2);
                const buttonY = player.y - 3 + Math.floor(buttonIndex / 5) * (buttonSize + 2);

                // Draw button circle
                ctx.beginPath();
                ctx.arc(buttonX, buttonY, buttonSize / 2, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = player.color;
                ctx.stroke();

                // Label the button number
                ctx.fillStyle = 'white';
                ctx.fillText(buttonIndex, buttonX - 2.5, buttonY + 2.5);
            });
        }
    });
}

// Start the game loop
function gameLoop() {
    gameUpdate();
    gameRender();
    requestAnimationFrame(gameLoop); // Continue the game loop
}

gameLoop(); // Start the first frame

