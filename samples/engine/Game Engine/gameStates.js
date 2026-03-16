// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameStates.js

import DebugLog from '../../../engine/utils/debugLog.js';
import GameUtils from '../../../engine/game/gameUtils.js';
import { canvasConfig, gameUi } from './global.js';
import { isPauseTogglePressed, isPlayerDeathPressed, isScorePressed, isStartPressed } from './gameInput.js';
import { renderPlayScreen, renderPlayerSelectOptions, renderScreen } from './gameStateUi.js';

/**
 * @typedef {Object} GameContext
 * @property {typeof import('./game.js').default} constructor
 * @property {string} gameState
 * @property {number} backToAttractCounter
 * @property {number} backToAttractFrames
 * @property {number} playerCount
 * @property {number} currentPlayer
 * @property {number[]} playerLives
 * @property {number[]} score
 * @property {boolean} gameInitialized
 * @property {boolean} enemyInitialized
 * @property {object} playerSelect
 * @property {import('../../../engine/input/keyboard.js').default} keyboardInput
 * @property {import('../../../engine/input/controller/gameControllers.js').default | null} gameControllers
 */

/** @param {GameContext} game */
export function displayAttractMode(game) {
    renderScreen(gameUi.screens.attract);

    if (isStartPressed(game.keyboardInput, game.gameControllers)) {
        game.gameState = game.constructor.STATES.PLAYER_SELECT;
    }
}

/** @param {GameContext} game */
export function displayPlayerSelect(game) {
    const screen = gameUi.screens.playerSelect;
    renderScreen(screen);

    const config = GameUtils.getPlayerSelectConfig(canvasConfig, game.playerSelect);
    renderPlayerSelectOptions(screen, config, game.gameControllers);
    const result = GameUtils.resolvePlayerSelection(game.keyboardInput, game.gameControllers, config);

    if (!result) {
        return;
    }

    game.playerCount = Number.isInteger(result.playerCount) ? result.playerCount : 1;
    game.playerLives = Array.isArray(result.playerLives) ? result.playerLives : [3, 3, 3, 3];
    game.gameState = game.constructor.STATES.INIT_GAME;
}

/** @param {GameContext} game */
export function displayGameOver(game) {
    renderScreen(gameUi.screens.gameOver);

    if (isStartPressed(game.keyboardInput, game.gameControllers) ||
        game.backToAttractCounter++ > game.backToAttractFrames) {
        resetGame(game);
    }
}

/** @param {GameContext} game */
export function initGame(game) {
    game.gameInitialized = true;
    game.score = [0, 0, 0, 0];
    game.currentPlayer = 0;
    game.gameState = game.constructor.STATES.INIT_ENEMY;
}

/** @param {GameContext} game */
export function initializeEnemyIfNeeded(game) {
    if (game.enemyInitialized) {
        return;
    }

    DebugLog.log(game.constructor.DEBUG, 'Game', 'Initializing enemy');
    game.enemyInitialized = true;
    game.gameState = game.constructor.STATES.PLAY_GAME;
}

/** @param {GameContext} game */
export function pauseGame(game) {
    renderScreen(gameUi.screens.pause);
    togglePauseState(game);
}

/** @param {GameContext} game */
export function playGame(game) {
    const screen = gameUi.screens.play;
    togglePauseState(game);

    const playerInfo = `Player ${game.currentPlayer + 1} - Lives: ${game.playerLives[game.currentPlayer]} - Score: ${game.score[game.currentPlayer]}`;
    renderPlayScreen(screen, playerInfo);

    if (isScorePressed(game.keyboardInput, game.gameControllers)) {
        game.score[game.currentPlayer] += 100;
    }

    if (!isPlayerDeathPressed(game.keyboardInput, game.gameControllers)) {
        return;
    }

    const result = GameUtils.swapPlayer(
        game.playerLives,
        game.currentPlayer,
        game.playerCount,
        (newState) => {
            game.gameState = newState;
        }
    );

    game.currentPlayer = result.updatedPlayer;
    game.playerLives = result.updatedLives;
}

/** @param {GameContext} game */
export function resetGame(game) {
    game.gameState = game.constructor.STATES.ATTRACT;
    game.gameInitialized = false;
    game.enemyInitialized = false;
    game.backToAttractCounter = 0;
}

/** @param {GameContext} game */
function togglePauseState(game) {
    if (!isPauseTogglePressed(game.keyboardInput, game.gameControllers)) {
        return;
    }

    game.gameState = game.gameState === game.constructor.STATES.PLAY_GAME
        ? game.constructor.STATES.PAUSE_GAME
        : game.constructor.STATES.PLAY_GAME;
}
