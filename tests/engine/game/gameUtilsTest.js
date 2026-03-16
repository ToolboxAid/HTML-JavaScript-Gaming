// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// gameUtilsTest.js

import GameUtils from '../../../engine/game/gameUtils.js';

// Mocked version of keyboard input
class MockKeyboardInput {
    constructor(keysPressed = []) {
        this.keysPressed = keysPressed;
    }
    getKeysPressed() {
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
        this.fillRectCalls = [];
        this.fillTextCalls = [];
    }

    fillRect(x, y, width, height) {
        this.fillRectCalls.push({ x, y, width, height, fillStyle: this.fillStyle });
    }

    fillText(text, x, y) {
        this.fillTextCalls.push({ text, x, y, fillStyle: this.fillStyle, font: this.font });
    }
}


export function testGameUtils(assert) {
    const mockCtx = new MockCanvasContext();
    const canvasConfig = { width: 800, height: 600, backgroundColor: '#000000' };
    const playerSelect = { maxPlayers: 4, lives: 3, optionBaseX: 100, optionBaseY: 100, optionSpacing: 50 };

    const keyboardInput = new MockKeyboardInput(['Digit1']);
    const gameControllers = null;

    const result = GameUtils.selectNumberOfPlayers(mockCtx, canvasConfig, playerSelect, keyboardInput, gameControllers);
    assert(result.playerCount === 1, "selectNumberOfPlayers failed for direct 1-player keyboard selection");
    assert(mockCtx.fillRectCalls.length === 1, "selectNumberOfPlayers should draw the background overlay once");
    assert(mockCtx.fillTextCalls.length >= 5, "selectNumberOfPlayers should draw heading plus keyboard option text");

    const config = GameUtils.getPlayerSelectConfig(canvasConfig, { maxPlayers: 0, lives: 0, optionBaseY: 0, optionSpacing: 0 });
    assert(config.maxPlayers === 0, "getPlayerSelectConfig should preserve explicit zero maxPlayers");
    assert(config.lives === 0, "getPlayerSelectConfig should preserve explicit zero lives");
    assert(config.y === 0, "getPlayerSelectConfig should preserve explicit zero optionBaseY");
    assert(config.spacing === 0, "getPlayerSelectConfig should preserve explicit zero optionSpacing");

    const aliasConfig = GameUtils.getPlayerSelectConfig(canvasConfig, {
        title: 'Choose Players',
        x: 12,
        y: 34,
        spacing: 56,
        color: 'cyan'
    });
    assert(aliasConfig.fillText === 'Choose Players', "getPlayerSelectConfig should accept title alias");
    assert(aliasConfig.x === 12, "getPlayerSelectConfig should accept x alias");
    assert(aliasConfig.y === 34, "getPlayerSelectConfig should accept y alias");
    assert(aliasConfig.spacing === 56, "getPlayerSelectConfig should accept spacing alias");
    assert(aliasConfig.fillStyle === 'cyan', "getPlayerSelectConfig should accept color alias");

    const keyboard1Player = new MockKeyboardInput(['Digit1']);
    const result1Player = GameUtils.selectNumberOfPlayers(mockCtx, canvasConfig, { maxPlayers: 4, lives: 3 }, keyboard1Player, null);
    assert(result1Player.playerCount === 1, "selectNumberOfPlayers failed for 1 player with keyboard input");
    assert(result1Player.playerLives[0] === 3, "selectNumberOfPlayers player lives incorrect for 1 player");

    const keyboard2Players = new MockKeyboardInput(['Digit2']);
    const result2Players = GameUtils.selectNumberOfPlayers(mockCtx, canvasConfig, { maxPlayers: 4, lives: 3 }, keyboard2Players, null);
    assert(result2Players.playerCount === 2, "selectNumberOfPlayers failed for 2 players with keyboard input");
    assert(result2Players.playerLives[0] === 3 && result2Players.playerLives[1] === 3, "selectNumberOfPlayers player lives incorrect for 2 players");

    const keyboard3 = new MockKeyboardInput();
    const controller1Player = new MockGameControllers([4]);
    const resultGameController1Player = GameUtils.selectNumberOfPlayers(mockCtx, canvasConfig, { maxPlayers: 4, lives: 3 }, keyboard3, controller1Player);
    assert(resultGameController1Player.playerCount === 1, "selectNumberOfPlayers failed for 1 player with game controller input");

    const controller2Players = new MockGameControllers([5]);
    const resultGameController2Players = GameUtils.selectNumberOfPlayers(mockCtx, canvasConfig, { maxPlayers: 4, lives: 3 }, keyboard3, controller2Players);
    assert(resultGameController2Players.playerCount === 2, "selectNumberOfPlayers failed for 2 players with game controller input");

    const resolvedKeyboardSelection = GameUtils.resolvePlayerSelection(new MockKeyboardInput(['Digit3']), null, { maxPlayers: 4, lives: 2 });
    assert(resolvedKeyboardSelection.playerCount === 3, "resolvePlayerSelection should return keyboard selection first");

    const resolvedControllerSelection = GameUtils.resolvePlayerSelection(new MockKeyboardInput([]), new MockGameControllers([5]), { maxPlayers: 4, lives: 2 });
    assert(resolvedControllerSelection.playerCount === 2, "resolvePlayerSelection should fall back to controller selection");

    let playerLives = [3, 3, 3, 3];
    let currentPlayer = 0;
    let playerCount = 4;

    const swap1 = GameUtils.swapPlayer(playerLives, currentPlayer, playerCount, (gameState) => { /* No-op for this test */ });
    assert(swap1.updatedPlayer === 1, "swapPlayer failed to swap to player 2");
    assert(swap1.updatedLives[0] === 2, "swapPlayer failed to decrease player 1's life");
    assert(playerLives[0] === 3, "swapPlayer should not mutate the input lives array");

    playerLives = swap1.updatedLives;
    currentPlayer = 1;
    const swap2 = GameUtils.swapPlayer(playerLives, currentPlayer, playerCount, (gameState) => { /* No-op for this test */ });
    assert(swap2.updatedPlayer === 2, "swapPlayer failed to swap to player 3");
    assert(swap2.updatedLives[1] === 2, "swapPlayer failed to decrease player 2's life");

    playerLives = [0, 2, 0, 3];
    currentPlayer = 3;
    const swap3 = GameUtils.swapPlayer(playerLives, currentPlayer, playerCount, (gameState) => { /* No-op for this test */ });
    assert(swap3.updatedPlayer === 1, "swapPlayer failed to swap to player 1 after player 3 lost all lives");
    assert(swap3.updatedLives[3] === 2, "swapPlayer failed to decrease player 4's life");

    playerLives = [1, 0, 0, 0];
    currentPlayer = 0;

    const swapGameOver = GameUtils.swapPlayer(playerLives, currentPlayer, playerCount, (gameState) => {
        assert(gameState === 'gameOver', "swapPlayer did not trigger 'gameOver' state");
    });

    assert(swapGameOver.updatedLives.every(life => life === 0), "swapPlayer did not correctly update all player lives to 0");
    assert(swapGameOver.updatedPlayer === 0, "reset player 0 for swapPlayer did not handle all players out of lives correctly");
}
