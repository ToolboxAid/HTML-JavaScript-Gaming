// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameStates.js

import CanvasUtils from '../../../engine/core/canvas.js';
import DebugLog from '../../../engine/utils/debugLog.js';
import GameUtils from '../../../engine/game/gameUtils.js';
import { canvasConfig, gameUi } from './global.js';
import { isPauseTogglePressed, isPlayerDeathPressed, isScorePressed, isStartPressed } from './gameInput.js';

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
 */

/** @param {GameContext} game */
export function displayAttractMode(game) {
    CanvasUtils.ctx.fillStyle = gameUi.attract.color;
    CanvasUtils.ctx.font = gameUi.attract.font;
    CanvasUtils.ctx.fillText('Welcome to the Game!', gameUi.attract.titleX, gameUi.attract.titleY);
    CanvasUtils.ctx.fillText('Press `Enter` to Start', gameUi.attract.promptX, gameUi.attract.promptY);

    if (isStartPressed(game.keyboardInput)) {
        game.gameState = game.constructor.STATES.PLAYER_SELECT;
    }
}

/** @param {GameContext} game */
export function displayPlayerSelect(game) {
    const gameController = null;
    const result = GameUtils.selectNumberOfPlayers(
        CanvasUtils.ctx,
        canvasConfig,
        game.playerSelect,
        game.keyboardInput,
        gameController
    );

    if (!result) {
        return;
    }

    game.playerCount = Number.isInteger(result.playerCount) ? result.playerCount : 1;
    game.playerLives = Array.isArray(result.playerLives) ? result.playerLives : [3, 3, 3, 3];
    game.gameState = game.constructor.STATES.INIT_GAME;
}

/** @param {GameContext} game */
export function displayGameOver(game) {
    CanvasUtils.ctx.fillStyle = gameUi.gameOver.color;
    CanvasUtils.ctx.font = gameUi.gameOver.font;
    CanvasUtils.ctx.fillText('Game Over', gameUi.gameOver.titleX, gameUi.gameOver.titleY);
    CanvasUtils.ctx.fillText('Press `Enter` to Restart', gameUi.gameOver.promptX, gameUi.gameOver.promptY);

    if (isStartPressed(game.keyboardInput) ||
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
export function initializeEnemy(game) {
    DebugLog.log(game.constructor.DEBUG, 'Game', 'Initializing enemy');
    game.enemyInitialized = true;
    game.gameState = game.constructor.STATES.PLAY_GAME;
}

/** @param {GameContext} game */
export function pauseGame(game) {
    gamePauseCheck(game);
    CanvasUtils.drawText(gameUi.pause.textX, gameUi.pause.textY, 'Game Paused.', gameUi.pause.scale, gameUi.pause.color);
    CanvasUtils.drawText(gameUi.pause.promptX, gameUi.pause.promptY, 'Press `P` to unpause game', gameUi.pause.scale, gameUi.pause.color);
}

/** @param {GameContext} game */
export function playGame(game) {
    gamePauseCheck(game);

    const playerInfo = `Player ${game.currentPlayer + 1} - Lives: ${game.playerLives[game.currentPlayer]} - Score: ${game.score[game.currentPlayer]}`;
    CanvasUtils.drawText(gameUi.play.infoX, gameUi.play.infoY, playerInfo, gameUi.play.scale, gameUi.play.color);
    CanvasUtils.drawText(gameUi.play.deathPromptX, gameUi.play.deathPromptY, 'Press `D` for player death', gameUi.play.scale, gameUi.play.color);
    CanvasUtils.drawText(gameUi.play.scorePromptX, gameUi.play.scorePromptY, 'Press `S` for score', gameUi.play.scale, gameUi.play.color);
    CanvasUtils.drawText(gameUi.play.pausePromptX, gameUi.play.pausePromptY, 'Press `P` to pause game', gameUi.play.scale, gameUi.play.color);

    if (isScorePressed(game.keyboardInput)) {
        game.score[game.currentPlayer] += 100;
    }

    if (!isPlayerDeathPressed(game.keyboardInput)) {
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
function gamePauseCheck(game) {
    if (!isPauseTogglePressed(game.keyboardInput)) {
        return;
    }

    game.gameState = game.gameState === game.constructor.STATES.PLAY_GAME
        ? game.constructor.STATES.PAUSE_GAME
        : game.constructor.STATES.PLAY_GAME;
}
