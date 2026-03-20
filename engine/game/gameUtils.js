// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// gameUtils.js
//
// PR-006 boundary note:
// - gameplay-facing utility surface retained for engine/game compatibility
// - closer to a future GameBase-aligned public boundary than lower-level object helper utilities
// - currently mixes gameplay convenience with assumptions about current engine/game wiring
//
// PR-011 boundary note:
// - player-selection helpers are now extracted to GamePlayerSelectionUtils
// - GameUtils retains delegation-based compatibility methods for existing callers
//
// PR-021 cleanup note:
// - turn-flow/state helpers are no longer exposed here
// - GameTurnFlowUtils is now the sole owner of tracked-player turn-flow behavior
// - GameUtils remains the compatibility facade for player-selection helpers only

import GamePlayerSelectionUtils from './gamePlayerSelectionUtils.js';

class GameUtils {
    static getPlayerSelectConfig(canvasConfig, playerSelect = {}) {
        return GamePlayerSelectionUtils.getPlayerSelectConfig(canvasConfig, playerSelect);
    }

    static buildPlayerSelectionResult(playerCount, maxPlayers, lives) {
        return GamePlayerSelectionUtils.buildPlayerSelectionResult(playerCount, maxPlayers, lives);
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
}

export default GameUtils;
