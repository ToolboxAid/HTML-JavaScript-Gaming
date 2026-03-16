// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// gameUtils.js

import DebugLog from '../utils/debugLog.js';

const DEFAULT_PLAYER_SELECT_CONFIG = Object.freeze({
    maxPlayers: 4,
    lives: 3,
    fillText: 'Select Player Mode',
    x: 100,
    y: 100,
    spacing: 50,
    fillStyle: 'white',
    font: '30px Arial'
});

class GameUtils {
    static hasWarnedAboutControllerLimit = false;

    static getPlayerSelectConfig(canvasConfig, playerSelect = {}) {
        return {
            maxPlayers: playerSelect.maxPlayers ?? DEFAULT_PLAYER_SELECT_CONFIG.maxPlayers,
            lives: playerSelect.lives ?? DEFAULT_PLAYER_SELECT_CONFIG.lives,
            fillText: playerSelect.fillText ?? DEFAULT_PLAYER_SELECT_CONFIG.fillText,
            x: playerSelect.optionBaseX ?? DEFAULT_PLAYER_SELECT_CONFIG.x,
            y: playerSelect.optionBaseY ?? DEFAULT_PLAYER_SELECT_CONFIG.y,
            spacing: playerSelect.optionSpacing ?? DEFAULT_PLAYER_SELECT_CONFIG.spacing,
            fillStyle: playerSelect.fillStyle ?? DEFAULT_PLAYER_SELECT_CONFIG.fillStyle,
            font: playerSelect.font ?? DEFAULT_PLAYER_SELECT_CONFIG.font,
            canvasWidth: canvasConfig.width,
            canvasHeight: canvasConfig.height,
            backgroundColor: canvasConfig.backgroundColor
        };
    }

    static buildPlayerSelectionResult(playerCount, maxPlayers, lives) {
        return {
            playerCount,
            playerLives: Array.from({ length: maxPlayers }, (_, index) => (index < playerCount ? lives : 0)),
            gameState: "initGame"
        };
    }

    static drawPlayerSelectOverlay(ctx, config) {
        ctx.fillStyle = config.backgroundColor + 'AA';
        ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
        ctx.fillStyle = config.fillStyle;
        ctx.font = config.font;
        ctx.fillText(config.fillText, config.x, config.y);
    }

    static drawKeyboardPlayerOptions(ctx, config) {
        for (let i = 1; i <= config.maxPlayers; i++) {
            ctx.fillText(
                `Keyboard \`${i}\` for ${i} Player${i > 1 ? "s" : ""}`,
                (config.canvasWidth / 2) - 200,
                config.y + i * config.spacing
            );
        }
    }

    static getKeyboardPlayerSelection(keyboardInput, config) {
        const keysPressed = new Set(keyboardInput.getKeysPressed());

        for (let i = 1; i <= config.maxPlayers; i++) {
            if (keysPressed.has(`Digit${i}`) || keysPressed.has(`Numpad${i}`)) {
                return this.buildPlayerSelectionResult(i, config.maxPlayers, config.lives);
            }
        }

        return null;
    }

    static drawControllerPlayerOptions(ctx, config) {
        ctx.fillText('GameController Select Player(s)', config.x, config.y + 150);
        ctx.fillText('`Left Bumper` 1 player', (config.canvasWidth / 2) - 200, config.y + 200);
        ctx.fillText('`Right Bumper` 2 players', (config.canvasWidth / 2) - 200, config.y + 250);
    }

    static drawPlayerSelection(ctx, config, gameControllers) {
        this.drawPlayerSelectOverlay(ctx, config);
        this.drawKeyboardPlayerOptions(ctx, config);

        if (gameControllers) {
            this.drawControllerPlayerOptions(ctx, config);
        }
    }

    static getControllerPlayerSelection(gameControllers, config) {
        if (!gameControllers) {
            return null;
        }

        this.warnAboutControllerLimit();

        if (gameControllers.isButtonIndexDown(0, 4)) {
            return this.buildPlayerSelectionResult(1, config.maxPlayers, config.lives);
        }

        if (gameControllers.isButtonIndexDown(0, 5)) {
            return this.buildPlayerSelectionResult(2, config.maxPlayers, config.lives);
        }

        return null;
    }

    static warnAboutControllerLimit() {
        if (this.hasWarnedAboutControllerLimit) {
            return;
        }

        DebugLog.warn(true, 'GameUtils', 'GameController currently supports 2 players');
        this.hasWarnedAboutControllerLimit = true;
    }

    static resolvePlayerSelection(keyboardInput, gameControllers, config) {
        const keyboardSelection = this.getKeyboardPlayerSelection(keyboardInput, config);
        if (keyboardSelection) {
            return keyboardSelection;
        }

        return this.getControllerPlayerSelection(gameControllers, config);
    }

    /** Constructor for GameUtils class.
     * @throws {Error} Always throws error as this is a utility class with only static methods.
     * @example
     * ❌ Don't do this:
     * const gameUtils = new GameUtils(); // Throws Error
     * 
     * ✅ Do this:
     * GameUtils.selectNumberOfPlayers(...); // Use static methods directly
     */
    constructor() {
        throw new Error('GameUtils is a utility class with only static methods. Do not instantiate.');
    }

    /**  Player select information
    */
    static selectNumberOfPlayers(ctx, canvasConfig, playerSelect, keyboardInput, gameControllers) {
        const config = this.getPlayerSelectConfig(canvasConfig, playerSelect);
        this.drawPlayerSelection(ctx, config, gameControllers);
        return this.resolvePlayerSelection(keyboardInput, gameControllers, config);
    }

    static swapPlayer(playerLives, currentPlayer, playerCount, setGameState) {
        const updatedLives = [...playerLives];

        updatedLives[currentPlayer] -= 1;

        if (updatedLives[currentPlayer] <= 0) {
            const allOut = updatedLives.every(lives => lives <= 0);
            if (allOut) {
                setGameState("gameOver");
                return { updatedPlayer: 0, updatedLives };
            }
        }

        let nextPlayer = currentPlayer;
        do {
            nextPlayer = (nextPlayer + 1) % playerCount;
        } while (updatedLives[nextPlayer] <= 0 && nextPlayer !== currentPlayer);

        return { updatedPlayer: nextPlayer, updatedLives };
    }

}

export default GameUtils;
