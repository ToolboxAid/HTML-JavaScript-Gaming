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
    drawStyledStage();
    drawCenteredText('Welcome to the Game!', gameUi.attract.titleY, gameUi.attract.font, gameUi.attract.color);
    drawCenteredText('Press `Enter` to Start', gameUi.attract.promptY, '30px Segoe UI', gameUi.attract.color);
    drawCenteredText('Starter template ready for your game logic', gameUi.attract.subtitleY, '24px Segoe UI', gameUi.theme.subtitleColor);

    if (isStartPressed(game.keyboardInput)) {
        game.gameState = game.constructor.STATES.PLAYER_SELECT;
    }
}

/** @param {GameContext} game */
export function displayPlayerSelect(game) {
    drawStyledStage();
    drawCenteredText('Select Players', gameUi.playerSelect.titleY, gameUi.playerSelect.titleFont, gameUi.playerSelect.titleColor);
    drawCenteredText('Press 1 or 2 to begin', gameUi.playerSelect.subtitleY, gameUi.playerSelect.subtitleFont, gameUi.playerSelect.subtitleColor);

    const config = GameUtils.getPlayerSelectConfig(canvasConfig, game.playerSelect);
    drawCenteredText('Keyboard `1` for 1 Player', config.y + config.spacing, '26px Segoe UI', gameUi.theme.subtitleColor);
    drawCenteredText('Keyboard `2` for 2 Players', config.y + (2 * config.spacing), '26px Segoe UI', gameUi.theme.subtitleColor);
    const result = GameUtils.getKeyboardPlayerSelection(game.keyboardInput, config);

    if (!result) {
        return;
    }

    game.playerCount = Number.isInteger(result.playerCount) ? result.playerCount : 1;
    game.playerLives = Array.isArray(result.playerLives) ? result.playerLives : [3, 3, 3, 3];
    game.gameState = game.constructor.STATES.INIT_GAME;
}

/** @param {GameContext} game */
export function displayGameOver(game) {
    drawStyledStage('#2d0f18cc', '#ff5a5a');
    drawCenteredText('Game Over', gameUi.gameOver.titleY, gameUi.gameOver.font, gameUi.gameOver.color);
    drawCenteredText('Press `Enter` to Restart', gameUi.gameOver.promptY, '30px Segoe UI', gameUi.gameOver.color);
    drawCenteredText('Restarting returns to attract mode', gameUi.gameOver.subtitleY, '22px Segoe UI', gameUi.theme.subtitleColor);

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
    drawStyledStage('#0c1e22cc', '#77f0ff');
    gamePauseCheck(game);
    drawCenteredText('Game Paused.', gameUi.pause.textY, '46px Segoe UI', gameUi.pause.color);
    drawCenteredText('Press `P` to unpause game', gameUi.pause.promptY, '34px Segoe UI', gameUi.pause.color);
    drawCenteredText('State and timers remain preserved', gameUi.pause.subtitleY, '22px Segoe UI', gameUi.pause.subtitleColor);
}

/** @param {GameContext} game */
export function playGame(game) {
    drawStyledStage('#0f1f33cc', '#66d9ff');
    gamePauseCheck(game);

    const playerInfo = `Player ${game.currentPlayer + 1} - Lives: ${game.playerLives[game.currentPlayer]} - Score: ${game.score[game.currentPlayer]}`;
    drawCenteredText(playerInfo, gameUi.play.infoY, '34px Segoe UI', gameUi.play.color);
    drawCenteredText('Press `D` for player death', gameUi.play.deathPromptY, '24px Segoe UI', gameUi.play.labelColor);
    drawCenteredText('Press `S` for score', gameUi.play.scorePromptY, '24px Segoe UI', gameUi.play.labelColor);
    drawCenteredText('Press `P` to pause game', gameUi.play.pausePromptY, '24px Segoe UI', gameUi.play.labelColor);

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

function drawStyledStage(panelColor = gameUi.theme.panelColor, borderColor = gameUi.theme.panelBorderColor) {
    const { panelX, panelY, panelWidth, panelHeight, panelBorderSize } = gameUi.theme;

    CanvasUtils.drawRect(panelX - 16, panelY - 16, panelWidth + 32, panelHeight + 32, '#07101fcc');
    CanvasUtils.drawRect(panelX, panelY, panelWidth, panelHeight, panelColor);
    CanvasUtils.drawBounds(panelX, panelY, panelWidth, panelHeight, borderColor, panelBorderSize);
    CanvasUtils.drawLine(panelX, panelY + 70, panelX + panelWidth, panelY + 70, 2, borderColor);
}

function drawCenteredText(text, y, font, color) {
    const ctx = CanvasUtils.ctx;
    const centerX = canvasConfig.width / 2;

    ctx.font = font;
    ctx.fillStyle = color;
    const width = ctx.measureText(text).width;
    ctx.fillText(text, Math.round(centerX - (width / 2)), y);
}
