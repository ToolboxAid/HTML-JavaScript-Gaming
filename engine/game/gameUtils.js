// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// gameUtils.js

import DebugLog from '../utils/debugLog.js';

const CONTROLLER_PLAYER_SELECT_BUTTONS = Object.freeze({
    onePlayer: 4,
    twoPlayers: 5
});

const DEFAULT_PLAYER_SELECT_CONFIG = Object.freeze({
    maxPlayers: 4,
    lives: 3,
    title: 'Select Player Mode',
    x: 100,
    y: 100,
    spacing: 50,
    optionX: null,
    controllerTitle: 'GameController Select Player(s)',
    controllerOffsetY: 150,
    controllerLineSpacing: 50,
    color: 'white',
    font: '30px Arial'
});

class GameUtils {
    static hasWarnedAboutControllerLimit = false;

    static getPlayerSelectConfig(canvasConfig, playerSelect = {}) {
        return {
            maxPlayers: playerSelect.maxPlayers ?? DEFAULT_PLAYER_SELECT_CONFIG.maxPlayers,
            lives: playerSelect.lives ?? DEFAULT_PLAYER_SELECT_CONFIG.lives,
            title: playerSelect.title ?? DEFAULT_PLAYER_SELECT_CONFIG.title,
            x: playerSelect.x ?? DEFAULT_PLAYER_SELECT_CONFIG.x,
            y: playerSelect.y ?? DEFAULT_PLAYER_SELECT_CONFIG.y,
            spacing: playerSelect.spacing ?? DEFAULT_PLAYER_SELECT_CONFIG.spacing,
            optionX: playerSelect.optionX ?? ((canvasConfig.width / 2) - 200),
            controllerTitle: playerSelect.controllerTitle ?? DEFAULT_PLAYER_SELECT_CONFIG.controllerTitle,
            controllerOffsetY: playerSelect.controllerOffsetY ?? DEFAULT_PLAYER_SELECT_CONFIG.controllerOffsetY,
            controllerLineSpacing: playerSelect.controllerLineSpacing ?? DEFAULT_PLAYER_SELECT_CONFIG.controllerLineSpacing,
            color: playerSelect.color ?? DEFAULT_PLAYER_SELECT_CONFIG.color,
            font: playerSelect.font ?? DEFAULT_PLAYER_SELECT_CONFIG.font,
            canvasWidth: canvasConfig.width,
            canvasHeight: canvasConfig.height,
            backgroundColor: canvasConfig.backgroundColor
        };
    }

    static buildPlayerSelectionResult(playerCount, maxPlayers, lives) {
        return {
            playerCount,
            playerLives: Array.from({ length: maxPlayers }, (_, index) => (index < playerCount ? lives : 0))
        };
    }

    static areTrackedPlayersOut(playerLives, playerCount) {
        return playerLives
            .slice(0, playerCount)
            .every(lives => lives <= 0);
    }

    static findNextActivePlayer(playerLives, currentPlayer, playerCount) {
        let nextPlayer = currentPlayer;

        do {
            nextPlayer = (nextPlayer + 1) % playerCount;
        } while (playerLives[nextPlayer] <= 0 && nextPlayer !== currentPlayer);

        return nextPlayer;
    }

    static getKeyboardPlayerSelection(keyboardInput, config) {
        if (!keyboardInput || typeof keyboardInput.getKeysPressed !== 'function') {
            return null;
        }

        const keysPressed = new Set(keyboardInput.getKeysPressed());

        for (let i = 1; i <= config.maxPlayers; i++) {
            if (keysPressed.has(`Digit${i}`) || keysPressed.has(`Numpad${i}`)) {
                return this.buildPlayerSelectionResult(i, config.maxPlayers, config.lives);
            }
        }

        return null;
    }

    static getControllerPlayerSelection(gameControllers, config) {
        if (!gameControllers) {
            return null;
        }

        this.warnAboutControllerLimit();

        if (gameControllers.isButtonIndexDown(0, CONTROLLER_PLAYER_SELECT_BUTTONS.onePlayer)) {
            return this.buildPlayerSelectionResult(1, config.maxPlayers, config.lives);
        }

        if (gameControllers.isButtonIndexDown(0, CONTROLLER_PLAYER_SELECT_BUTTONS.twoPlayers)) {
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
     * GameUtils.resolvePlayerSelection(...); // Use static methods directly
     */
    constructor() {
        throw new Error('GameUtils is a utility class with only static methods. Do not instantiate.');
    }

    static swapPlayer(playerLives, currentPlayer, playerCount) {
        const updatedLives = [...playerLives];

        updatedLives[currentPlayer] -= 1;

        if (updatedLives[currentPlayer] <= 0) {
            if (this.areTrackedPlayersOut(updatedLives, playerCount)) {
                return {
                    updatedPlayer: 0,
                    updatedLives,
                    isGameOver: true
                };
            }
        }

        return {
            updatedPlayer: this.findNextActivePlayer(updatedLives, currentPlayer, playerCount),
            updatedLives,
            isGameOver: false
        };
    }

}

export default GameUtils;
