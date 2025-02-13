// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// gameUtilsTest.js

import GameUtils from './gameUtils.js';

// Mocked version of keyboard input
class MockKeyboardInput {
    constructor(keysPressed = []) {
        this.keysPressed = keysPressed;
    }
    getkeysPressed() {
        return this.keysPressed;
    }
}

// Mocked version of game controller input
class MockGameControllers {
    constructor(buttonsPressed = []) {
        this.buttonsPressed = buttonsPressed;
    }
    isButtonIndexDown(controllerIndex, buttonIndex) {
        return this.buttonsPressed.includes(buttonIndex);
    }
}

class MockCanvasContext {
    constructor() {
        this.fillStyle = '';
        this.font = '';
    }

    // Mock fillStyle and fillRect
    fillRect(x, y, width, height) {
        //console.log(`fillRect called with args: x=${x}, y=${y}, width=${width}, height=${height}`);
    }

    // Mock fillText
    fillText(text, x, y) {
        //console.log(`fillText called with text: '${text}', x=${x}, y=${y}`);
    }
}


export function testGameUtils(assert) {
    // ----------------------
    // Test selectNumberOfPlayers (Keyboard Input Simulation)
    // ----------------------

    // Set up the mock ctx object
    const mockCtx = new MockCanvasContext();

    // Mock input data
    const canvasConfig = { width: 800, height: 600, backgroundColor: '#000000' };
    const playerSelect = { maxPlayers: 4, lives: 3, optionBaseX: 100, optionBaseY: 100, optionSpacing: 50 };

    // Mock keyboard input
    const keyboardInput = new MockKeyboardInput(['Digit1']);
    const gameControllers = null; // No controllers used

    // Call the selectNumberOfPlayers function
    const result = GameUtils.selectNumberOfPlayers(mockCtx, canvasConfig, playerSelect, keyboardInput, gameControllers);

    // Test for selecting 1 player using keyboard input (pressing 'Digit1')
    const keyboard1Player = new MockKeyboardInput(['Digit1']);
    const result1Player = GameUtils.selectNumberOfPlayers(mockCtx, canvasConfig, { maxPlayers: 4, lives: 3 }, keyboard1Player, null);
    assert(result1Player.playerCount === 1, "selectNumberOfPlayers failed for 1 player with keyboard input");
    assert(result1Player.playerLives[0] === 3, "selectNumberOfPlayers player lives incorrect for 1 player");

    // Test for selecting 2 players using keyboard input (pressing 'Digit2')
    const keyboard2Players = new MockKeyboardInput(['Digit2']);
    const result2Players = GameUtils.selectNumberOfPlayers(mockCtx, canvasConfig, { maxPlayers: 4, lives: 3 }, keyboard2Players, null);
    assert(result2Players.playerCount === 2, "selectNumberOfPlayers failed for 2 players with keyboard input");
    assert(result2Players.playerLives[0] === 3 && result2Players.playerLives[1] === 3, "selectNumberOfPlayers player lives incorrect for 2 players");

    // ----------------------
    // Test selectNumberOfPlayers (Game Controller Input Simulation)
    // ----------------------

    // Simulate game controller input for 1 player (Left Bumper)
    const keyboard3 = new MockKeyboardInput();
    const controller1Player = new MockGameControllers([4]); // Left Bumper
    const resultGameController1Player = GameUtils.selectNumberOfPlayers(mockCtx, canvasConfig, { maxPlayers: 4, lives: 3 }, keyboard3, controller1Player);
    assert(resultGameController1Player.playerCount === 1, "selectNumberOfPlayers failed for 1 player with game controller input");

    // Simulate game controller input for 2 players (Right Bumper)
    const controller2Players = new MockGameControllers([5]); // Right Bumper
    const resultGameController2Players = GameUtils.selectNumberOfPlayers(mockCtx, canvasConfig, { maxPlayers: 4, lives: 3 }, keyboard3, controller2Players);
    assert(resultGameController2Players.playerCount === 2, "selectNumberOfPlayers failed for 2 players with game controller input");

    // ----------------------
    // Test swapPlayer (Player Losing Lives)
    // ----------------------

    let playerLives = [3, 3, 3, 3]; // 4 players with 3 lives each
    let currentPlayer = 0; // Starting with player 1
    let playerCount = 4;

    // Simulate player 1 losing a life
    const swap1 = GameUtils.swapPlayer(playerLives, currentPlayer, playerCount, (gameState) => { /* No-op for this test */ });
    assert(swap1.updatedPlayer === 1, "swapPlayer failed to swap to player 2");
    assert(swap1.updatedLives[0] === 2, "swapPlayer failed to decrease player 1's life");

    // Simulate player 2 losing a life
    playerLives = swap1.updatedLives;
    currentPlayer = 1; // Now player 2
    const swap2 = GameUtils.swapPlayer(playerLives, currentPlayer, playerCount, (gameState) => { /* No-op for this test */ });
    assert(swap2.updatedPlayer === 2, "swapPlayer failed to swap to player 3");
    assert(swap2.updatedLives[1] === 2, "swapPlayer failed to decrease player 2's life");

    // Simulate player 3 losing all lives and player 4 being next
    playerLives = [0, 2, 0, 3]; // Player 3 is out of lives
    currentPlayer = 3; // Starting with player 4
    const swap3 = GameUtils.swapPlayer(playerLives, currentPlayer, playerCount, (gameState) => { /* No-op for this test */ });
    assert(swap3.updatedPlayer === 1, "swapPlayer failed to swap to player 1 after player 3 lost all lives");
    assert(swap3.updatedLives[3] === 2, "swapPlayer failed to decrease player 4's life");

    // ----------------------
    // Test swapPlayer (Game Over)
    // ----------------------
    // Simulate all players losing all their lives
    playerLives = [1, 0, 0, 0];
    currentPlayer = 0; // Any player

    const swapGameOver = GameUtils.swapPlayer(playerLives, currentPlayer, playerCount, (gameState) => {
        assert(gameState === 'gameOver', "swapPlayer did not trigger 'gameOver' state");
    });

    assert(swapGameOver.updatedLives.every(life => life === 0), "swapPlayer did not correctly update all player lives to 0");
    assert(swapGameOver.updatedPlayer !== 0, "swapPlayer did not handle all players out of lives correctly");
}
