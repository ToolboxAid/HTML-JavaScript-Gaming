// ToolboxAid.com
// David Quesenberry
// 11/21/2024
// game.js - GameController Integration with Button States on Canvas

import GameControllers from '../scripts/gameControllers.js';

const canvas = document.getElementById('gameArea');
canvas.width = 480;
canvas.height = 320;
const ctx = canvas.getContext('2d');

const gameControllers = new GameControllers(); // Instantiate the GameControllers class

// Player state for each gameController
const players = [];

// Create a player for each gameController
function createPlayer(gameControllerIndex) {
    // Assign each player a different color and initial position
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'cyan', 'brown', 'lime'];
    const color = colors[gameControllerIndex % colors.length]; // Loop through colors if more than 10 gameControllers

    players[gameControllerIndex] = {// this is to allow player to be drawn
        color,
        x: gameControllerIndex * 25,  // Offset initial positions for each player
        y: gameControllerIndex * 25,
        speed: 2,
        size: 8,
        width: 140,
        height: 36,
        buttonColors: Array(10).fill('gray'), // Initialize button colors (max of 10 buttons)
        axis: [0, 0],
        dPad: [],
    };
}

// Function to update the game state (called on every frame)
function gameUpdate() {
    gameControllers.update(); // Update the gameController state

//    gameControllers.logPressedName(1);

    // Iterate over all connected gameControllers and handle input for each player
    gameControllers.gameControllers.forEach((gameController, index) => {
        if (gameController) {
            // Create player if it's the first time this gameController is detected
            if (!players[index]) createPlayer(index);

            const player = players[index];

            // Reset all button colors to gray
            player.buttonColors = Array(10).fill('gray');

            // Handle button presses for each gameController
            const buttonsDown = gameControllers.getButtonsDown(index);
            if (buttonsDown.length > 0) {
                // Set all buttons to 'gray'
                player.buttonColors = new Array(10).fill('gray');

                // Iterate over buttons down
                buttonsDown.forEach(button => {
                    player.buttonColors[button] = true ? player.color : 'gray';
                });
            }

            player.axis = gameControllers.getAxis(index);
            player.dPad = gameControllers.getDPad(index);

            let moveX = 0, moveY = 0;
            if (true) {
                // Handle movement with gameController (dPAD)
                if (player.dPad.left) { moveX = -1 };
                if (player.dPad.right) { moveX = 1 };
                if (player.dPad.up) { moveY = -1 };
                if (player.dPad.down) { moveY = 1 };
            } else {
                // Handle movement with gameController (axis [analoge])
                const [axisX, axisY] = gameControllers.getAxis(index);

                if (axisX > 0) moveX = player.speed;
                else if (axisX < 0) moveX = -player.speed;

                if (axisY > 0) moveY = player.speed;
                else if (axisY < 0) moveY = -player.speed;
            }

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
            // Draw button states for each player
            const buttonsAcross = 5;
            const buttonSize = 12;
            ctx.font = '8px Arial';
            ctx.fillStyle = 'black';

            // Draw the button indicators next to the player
            player.buttonColors.forEach((color, buttonIndex) => {
                const buttonX = player.x + player.size + 6 + (buttonIndex % buttonsAcross) * (buttonSize + 2);
                const buttonY = player.y - 3 + Math.floor(buttonIndex / buttonsAcross) * (buttonSize + 2);

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

            // axis and dpad
            ctx.fillStyle = player.color;
            const newX = player.x + (buttonsAcross + 1.5) * buttonSize;
            ctx.fillText("dPad:", newX, player.y + 0);
            const activeDirections = [];
            if (player.dPad.up) activeDirections.push("Up");
            if (player.dPad.down) activeDirections.push("Down");
            if (player.dPad.left) activeDirections.push("Left");
            if (player.dPad.right) activeDirections.push("Right");

            // Convert the active directions to a string
            const dPadStateString = activeDirections.length > 0 ? `${activeDirections.join(", ")}` : "None";

            ctx.fillText(dPadStateString, newX + 30, player.y + 0);

            // Axis 0
            ctx.fillText("Axis0 X:", newX, player.y + 8);
            ctx.fillText(player.axis[0], newX + 30, player.y + 8);
            ctx.fillText("Axis0 Y:", newX, player.y + 16);
            ctx.fillText(player.axis[1], newX + 30, player.y + 16);

            ctx.fillText("Axis1 X:", newX, player.y + 24);
            ctx.fillText(player.axis[2], newX + 30, player.y + 24);
            ctx.fillText("Axis1 Y:", newX, player.y + 32);
            ctx.fillText(player.axis[3], newX + 30, player.y + 32);
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

