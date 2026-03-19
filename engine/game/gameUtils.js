// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// gameUtils.js
//
// PR-006 boundary note:
// - gameplay-facing utility surface retained for engine/game compatibility
// - closer to a future GameBase-aligned public boundary than lower-level object helper utilities
// - currently mixes gameplay convenience with assumptions about current engine/game wiring
// - player-selection helpers below are likely future GameBase-aligned boundary candidates
//
// PR-011 boundary note:
// - player-selection helpers are now extracted to GamePlayerSelectionUtils
// - GameUtils retains delegation-based compatibility methods for existing callers
// - player-state / turn-flow helpers remain here pending a later split

import GamePlayerSelectionUtils from './gamePlayerSelectionUtils.js';

class GameUtils {
    // PR-011 compatibility note:
    // delegated player-selection bridge retained for existing call paths.
    static getPlayerSelectConfig(canvasConfig, playerSelect = {}) {
        return GamePlayerSelectionUtils.getPlayerSelectConfig(canvasConfig, playerSelect);
    }

    static buildPlayerSelectionResult(playerCount, maxPlayers, lives) {
        return GamePlayerSelectionUtils.buildPlayerSelectionResult(playerCount, maxPlayers, lives);
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
        return GamePlayerSelectionUtils.getKeyboardPlayerSelection(keyboardInput, config);
    }

    static getControllerPlayerSelection(gameControllers, config) {
        return GamePlayerSelectionUtils.getControllerPlayerSelection(gameControllers, config);
    }

    static warnAboutControllerLimit() {
        return GamePlayerSelectionUtils.warnAboutControllerLimit();
    }

    static resolvePlayerSelection(keyboardInput, gameControllers, config) {
        return GamePlayerSelectionUtils.resolvePlayerSelection(keyboardInput, gameControllers, config);
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
