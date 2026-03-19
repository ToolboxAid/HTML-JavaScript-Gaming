// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// gameUtilsTest.js

import GameUtils from '../../../engine/game/gameUtils.js';
import GamePlayerSelectUi from '../../../engine/game/gamePlayerSelectUi.js';
import CanvasText from '../../../engine/core/canvasText.js';
import PrimitiveRenderer from '../../../engine/renderers/primitiveRenderer.js';

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

export function testGameUtils(assert) {
    const canvasConfig = { width: 800, height: 600, backgroundColor: '#000000' };
    const playerSelect = { maxPlayers: 4, lives: 3, x: 100, y: 100, spacing: 50 };

    const keyboardInput = new MockKeyboardInput(['Digit1']);
    const gameControllers = null;
    const renderConfig = GameUtils.getPlayerSelectConfig(canvasConfig, playerSelect);

    const overlayCalls = [];
    const renderTextCalls = [];

    const originalDrawOverlay = PrimitiveRenderer.drawOverlay;
    const originalParseFont = CanvasText.parseFont;
    const originalRenderText = CanvasText.renderText;

    PrimitiveRenderer.drawOverlay = (width, height, fillColor = 'black', alpha = 0.5) => {
        overlayCalls.push({ width, height, fillColor, alpha });
        return true;
    };
    CanvasText.parseFont = (font) => ({ fontSize: 30, fontFamily: 'Arial' });
    CanvasText.renderText = (text, x, y, options = {}) => {
        renderTextCalls.push({ text, x, y, options });
        return { text, x, y, options };
    };

    try {
        GamePlayerSelectUi.drawPlayerSelection(renderConfig, gameControllers);
        const result = GameUtils.resolvePlayerSelection(keyboardInput, gameControllers, renderConfig);
        assert(result.playerCount === 1, "resolvePlayerSelection failed for direct 1-player keyboard selection");
        assert(overlayCalls.length === 1, "drawPlayerSelection should draw the background overlay once");
        assert(renderTextCalls.length >= 5, "drawPlayerSelection should draw heading plus keyboard option text");
        assert(overlayCalls[0].width === renderConfig.canvasWidth, "drawPlayerSelection should use config canvasWidth for overlay");
        assert(overlayCalls[0].height === renderConfig.canvasHeight, "drawPlayerSelection should use config canvasHeight for overlay");
        assert(overlayCalls[0].fillColor === renderConfig.backgroundColor, "drawPlayerSelection should use config backgroundColor for overlay");
    } finally {
        PrimitiveRenderer.drawOverlay = originalDrawOverlay;
        CanvasText.parseFont = originalParseFont;
        CanvasText.renderText = originalRenderText;
    }

    const config = GameUtils.getPlayerSelectConfig(canvasConfig, { maxPlayers: 0, lives: 0, y: 0, spacing: 0 });
    assert(config.maxPlayers === 0, "getPlayerSelectConfig should preserve explicit zero maxPlayers");
    assert(config.lives === 0, "getPlayerSelectConfig should preserve explicit zero lives");
    assert(config.y === 0, "getPlayerSelectConfig should preserve explicit zero y");
    assert(config.spacing === 0, "getPlayerSelectConfig should preserve explicit zero spacing");

    const aliasConfig = GameUtils.getPlayerSelectConfig(canvasConfig, {
        title: 'Choose Players',
        x: 12,
        y: 34,
        spacing: 56,
        optionX: 78,
        controllerTitle: 'Controllers Ready',
        controllerOffsetY: 144,
        controllerLineSpacing: 66,
        color: 'cyan'
    });
    assert(aliasConfig.title === 'Choose Players', "getPlayerSelectConfig should use title");
    assert(aliasConfig.x === 12, "getPlayerSelectConfig should use x");
    assert(aliasConfig.y === 34, "getPlayerSelectConfig should use y");
    assert(aliasConfig.spacing === 56, "getPlayerSelectConfig should use spacing");
    assert(aliasConfig.optionX === 78, "getPlayerSelectConfig should use optionX");
    assert(aliasConfig.controllerTitle === 'Controllers Ready', "getPlayerSelectConfig should use controllerTitle");
    assert(aliasConfig.controllerOffsetY === 144, "getPlayerSelectConfig should use controllerOffsetY");
    assert(aliasConfig.controllerLineSpacing === 66, "getPlayerSelectConfig should use controllerLineSpacing");
    assert(aliasConfig.color === 'cyan', "getPlayerSelectConfig should use color");

    const keyboard1Player = new MockKeyboardInput(['Digit1']);
    const config1Player = GameUtils.getPlayerSelectConfig(canvasConfig, { maxPlayers: 4, lives: 3 });
    const result1Player = GameUtils.resolvePlayerSelection(keyboard1Player, null, config1Player);
    assert(result1Player.playerCount === 1, "resolvePlayerSelection failed for 1 player with keyboard input");
    assert(result1Player.playerLives[0] === 3, "resolvePlayerSelection player lives incorrect for 1 player");

    const keyboard2Players = new MockKeyboardInput(['Digit2']);
    const config2Players = GameUtils.getPlayerSelectConfig(canvasConfig, { maxPlayers: 4, lives: 3 });
    const result2Players = GameUtils.resolvePlayerSelection(keyboard2Players, null, config2Players);
    assert(result2Players.playerCount === 2, "resolvePlayerSelection failed for 2 players with keyboard input");
    assert(result2Players.playerLives[0] === 3 && result2Players.playerLives[1] === 3, "resolvePlayerSelection player lives incorrect for 2 players");

    const keyboard3 = new MockKeyboardInput();
    const controller1Player = new MockGameControllers([4]);
    const controllerConfig = GameUtils.getPlayerSelectConfig(canvasConfig, { maxPlayers: 4, lives: 3 });
    GamePlayerSelectUi.drawPlayerSelection(controllerConfig, controller1Player);
    const resultGameController1Player = GameUtils.resolvePlayerSelection(keyboard3, controller1Player, controllerConfig);
    assert(resultGameController1Player.playerCount === 1, "resolvePlayerSelection failed for 1 player with game controller input");

    const controller2Players = new MockGameControllers([5]);
    const resultGameController2Players = GameUtils.resolvePlayerSelection(keyboard3, controller2Players, controllerConfig);
    assert(resultGameController2Players.playerCount === 2, "resolvePlayerSelection failed for 2 players with game controller input");

    const resolvedKeyboardSelection = GameUtils.resolvePlayerSelection(new MockKeyboardInput(['Digit3']), null, { maxPlayers: 4, lives: 2 });
    assert(resolvedKeyboardSelection.playerCount === 3, "resolvePlayerSelection should return keyboard selection first");

    const resolvedWithoutKeyboard = GameUtils.resolvePlayerSelection(null, null, { maxPlayers: 4, lives: 2 });
    assert(resolvedWithoutKeyboard === null, "resolvePlayerSelection should handle missing keyboard input");

    const resolvedControllerSelection = GameUtils.resolvePlayerSelection(new MockKeyboardInput([]), new MockGameControllers([5]), { maxPlayers: 4, lives: 2 });
    assert(resolvedControllerSelection.playerCount === 2, "resolvePlayerSelection should fall back to controller selection");

    const keyboardSelectionWithoutInput = GameUtils.getKeyboardPlayerSelection(null, { maxPlayers: 4, lives: 2 });
    assert(keyboardSelectionWithoutInput === null, "getKeyboardPlayerSelection should return null when keyboard input is missing");

    let playerLives = [3, 3, 3, 3];
    let currentPlayer = 0;
    let playerCount = 4;

    const swap1 = GameUtils.swapPlayer(playerLives, currentPlayer, playerCount);
    assert(swap1.updatedPlayer === 1, "swapPlayer failed to swap to player 2");
    assert(swap1.updatedLives[0] === 2, "swapPlayer failed to decrease player 1's life");
    assert(playerLives[0] === 3, "swapPlayer should not mutate the input lives array");
    assert(swap1.isGameOver === false, "swapPlayer should not set game over when players remain");

    playerLives = swap1.updatedLives;
    currentPlayer = 1;
    const swap2 = GameUtils.swapPlayer(playerLives, currentPlayer, playerCount);
    assert(swap2.updatedPlayer === 2, "swapPlayer failed to swap to player 3");
    assert(swap2.updatedLives[1] === 2, "swapPlayer failed to decrease player 2's life");
    assert(swap2.isGameOver === false, "swapPlayer should keep play flow active while tracked players remain");

    playerLives = [0, 2, 0, 3];
    currentPlayer = 3;
    const swap3 = GameUtils.swapPlayer(playerLives, currentPlayer, playerCount);
    assert(swap3.updatedPlayer === 1, "swapPlayer failed to swap to player 1 after player 3 lost all lives");
    assert(swap3.updatedLives[3] === 2, "swapPlayer failed to decrease player 4's life");
    assert(swap3.isGameOver === false, "swapPlayer should keep play flow active when another tracked player has lives");

    playerLives = [1, 0, 0, 0];
    currentPlayer = 0;

    const swapGameOver = GameUtils.swapPlayer(playerLives, currentPlayer, playerCount);
    assert(swapGameOver.updatedLives.every(life => life === 0), "swapPlayer did not correctly update all player lives to 0");
    assert(swapGameOver.updatedPlayer === 0, "reset player 0 for swapPlayer did not handle all players out of lives correctly");
    assert(swapGameOver.isGameOver === true, "swapPlayer should report game over when tracked players are out");

    const swapTrackedGameOver = GameUtils.swapPlayer([1, 0, 5], 0, 2);
    assert(swapTrackedGameOver.isGameOver === true, "swapPlayer should only consider tracked players for game over");
    assert(swapTrackedGameOver.updatedPlayer === 0, "swapPlayer should reset to player 0 when tracked players are out");
}
