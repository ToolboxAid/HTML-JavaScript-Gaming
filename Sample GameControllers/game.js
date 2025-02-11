// ToolboxAid.com
// David Quesenberry
// 11/21/2024
// game.js - GameController Integration with Button States on Canvas

import GameControllers from '../scripts/input/controller/gameControllers.js';

const canvas = document.getElementById('gameArea');
canvas.width = 480;
canvas.height = 320;
const ctx = canvas.getContext('2d');

// Player state for each gameController
const players = [];

const gameControllers = new GameControllers();

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
    // Update gamepad states (call this in your game loop)
    gameControllers.update();

    // Iterate over all connected gameControllers and handle input for each player
    gameControllers.getConnectedGamepads().forEach((gameController, playerIndex) => {
        if (gameController) {
            // Create player if it's the first time this gameController is detected
            if (!players[playerIndex]) {
                createPlayer(playerIndex);
            }

            const player = players[playerIndex];

            // Reset all button colors to gray
            player.buttonColors = Array(10).fill('gray');

            // Handle button presses for each gameController
            const buttonsDown = gameControllers.gamepadStates[playerIndex].getButtonsDown();
            if (buttonsDown.length > 0) {
                // Set all buttons to 'gray'
                player.buttonColors = new Array(10).fill('gray');

                // Iterate over buttons down
                buttonsDown.forEach(button => {
                    player.buttonColors[button] = true ? player.color : 'gray';
                });
            }

            let moveX = 0, moveY = 0;
            if (true) {
                // use DPad
                player.dPad = gameControllers.getDPad(playerIndex);
                // Handle movement with gameController (dPAD)
                if (player.dPad.left) { moveX = -1 };
                if (player.dPad.right) { moveX = 1 };
                if (player.dPad.up) { moveY = -1 };
                if (player.dPad.down) { moveY = 1 };
            } else if (false) {
                // use Index
                const axisX = gameControllers.getAxisByIndex(playerIndex, 0);
                const axisY = gameControllers.getAxisByIndex(playerIndex, 1);

                if (axisX > 0) moveX = player.speed;
                else if (axisX < 0) moveX = -player.speed;

                if (axisY > 0) moveY = player.speed;
                else if (axisY < 0) moveY = -player.speed;
            } else { 
                // use Name
                const axisX = gameControllers.getAxisByName(playerIndex, "StickLeftX");
                const axisY = gameControllers.getAxisByName(playerIndex, "StickLeftY");

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
    players.forEach((player, playerIndex) => {
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

            // Convert active directions to a string
            const dPadStateString = activeDirections.length > 0 ? `${activeDirections.join(", ")}` : "None";
            ctx.fillText(dPadStateString, newX + 22, player.y + 0);

            // Different access methods
            // console.log(GameControllerMap.controllerConfigs.default.buttonNames); // ["A", "B"]
            // console.log(GameControllerMap.controllerConfigs["Logitech RumblePad 2 USB"].axisNames); // ["StickLeftX", "StickLeftY", "StickRightX", "StickRightY"]
            // console.log(GameControllerMap.controllerMappings.default.buttons.A); // 0
            // console.log(GameControllerMap.controllerMappings.default.axes.LeftStickX); // 0
            // console.log(
            //     GameControllerMap.controllerMappings.default.buttons.A, // 0
            //     GameControllerMap.controllerMappings.default.buttons.B, // 1
            //     GameControllerMap.controllerMappings.default.axes.LeftStickX, // 0
            //     GameControllerMap.controllerMappings.default.axes.LeftStickY  // 1
            // );

            const decimals = 2;
            if (false) {
                // get by axis Index
                ctx.fillText("Axis0 X:", newX, player.y + 8);
                ctx.fillText(gameControllers.getAxisByIndex(playerIndex, 0).toFixed(decimals), newX + 30, player.y + 8);
                ctx.fillText("Axis0 Y:", newX, player.y + 16);
                ctx.fillText(gameControllers.getAxisByIndex(playerIndex, 1).toFixed(decimals), newX + 30, player.y + 16);
                ctx.fillText("Axis1 X:", newX, player.y + 24);
                ctx.fillText(gameControllers.getAxisByIndex(playerIndex, 2).toFixed(decimals), newX + 30, player.y + 24);
                ctx.fillText("Axis1 Y:", newX, player.y + 32);
                ctx.fillText(gameControllers.getAxisByIndex(playerIndex, 3).toFixed(decimals), newX + 30, player.y + 32);
            } else {
                // get by axis Name
                ctx.fillText("Axis0 X:", newX, player.y + 8);
                ctx.fillText(gameControllers.getAxisByName(playerIndex, "StickLeftX").toFixed(decimals), newX + 30, player.y + 8);
                ctx.fillText("Axis0 Y:", newX, player.y + 16);
                ctx.fillText(gameControllers.getAxisByName(playerIndex, "StickLeftY").toFixed(decimals), newX + 30, player.y + 16);
                ctx.fillText("Axis1 X:", newX, player.y + 24);
                ctx.fillText(gameControllers.getAxisByName(playerIndex, "StickRightX").toFixed(decimals), newX + 30, player.y + 24);
                ctx.fillText("Axis1 Y:", newX, player.y + 32);
                ctx.fillText(gameControllers.getAxisByName(playerIndex, "StickRightY").toFixed(decimals), newX + 30, player.y + 32);
            }

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

