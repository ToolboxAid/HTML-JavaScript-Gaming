// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameStates.js

import CanvasUtils from '../../../engine/core/canvas.js';
import CanvasText from '../../../engine/core/canvasText.js';
import DebugLog from '../../../engine/utils/debugLog.js';
import GameUtils from '../../../engine/game/gameUtils.js';
import { canvasConfig, gameUi, safeArea, uiFont } from './global.js';
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
    renderCenteredText('Welcome to the Game!', gameUi.attract.titleY, {
        fontSize: 46,
        fontFamily: uiFont.display,
        color: gameUi.attract.color
    });
    renderCenteredText('Press `Enter` to Start', gameUi.attract.promptY, {
        fontSize: 30,
        fontFamily: uiFont.ui,
        color: gameUi.attract.color
    });
    renderCenteredText('Starter template ready for your game logic', gameUi.attract.subtitleY, {
        fontSize: 24,
        fontFamily: uiFont.ui,
        color: gameUi.theme.subtitleColor
    });

    if (isStartPressed(game.keyboardInput)) {
        game.gameState = game.constructor.STATES.PLAYER_SELECT;
    }
}

/** @param {GameContext} game */
export function displayPlayerSelect(game) {
    drawStyledStage();
    renderCenteredText('Select Players', gameUi.playerSelect.titleY, {
        fontSize: 42,
        fontFamily: uiFont.display,
        color: gameUi.playerSelect.titleColor
    });
    renderCenteredText('Press 1 or 2 to begin', gameUi.playerSelect.subtitleY, {
        fontSize: 24,
        fontFamily: uiFont.ui,
        color: gameUi.playerSelect.subtitleColor
    });

    const config = GameUtils.getPlayerSelectConfig(canvasConfig, game.playerSelect);
    renderCenteredMultilineText(
        ['Keyboard `1` for 1 Player', 'Keyboard `2` for 2 Players'],
        config.y + config.spacing,
        {
            fontSize: 26,
            lineHeight: 54,
            fontFamily: uiFont.ui,
            color: gameUi.theme.subtitleColor
        }
    );
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
    drawStyledStage(gameUi.theme.colors.panelDanger, gameUi.theme.colors.danger);
    renderCenteredText('Game Over', gameUi.gameOver.titleY, {
        fontSize: 52,
        fontFamily: uiFont.display,
        color: gameUi.gameOver.color
    });
    renderCenteredText('Press `Enter` to Restart', gameUi.gameOver.promptY, {
        fontSize: 30,
        fontFamily: uiFont.ui,
        color: gameUi.gameOver.color
    });
    renderCenteredText('Restarting returns to attract mode', gameUi.gameOver.subtitleY, {
        fontSize: 22,
        fontFamily: uiFont.ui,
        color: gameUi.theme.subtitleColor
    });

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
    drawStyledStage(gameUi.theme.colors.panelPause, '#77f0ff');
    gamePauseCheck(game);
    renderCenteredText('Game Paused.', gameUi.pause.textY, {
        fontSize: 46,
        fontFamily: uiFont.display,
        color: gameUi.pause.color
    });
    renderCenteredText('Press `P` to unpause game', gameUi.pause.promptY, {
        fontSize: 34,
        fontFamily: uiFont.ui,
        color: gameUi.pause.color
    });
    renderCenteredText('State and timers remain preserved', gameUi.pause.subtitleY, {
        fontSize: 22,
        fontFamily: uiFont.ui,
        color: gameUi.pause.subtitleColor
    });
}

/** @param {GameContext} game */
export function playGame(game) {
    drawStyledStage(gameUi.theme.colors.panelPlay, gameUi.theme.colors.accent);
    gamePauseCheck(game);

    const playerInfo = `Player ${game.currentPlayer + 1} - Lives: ${game.playerLives[game.currentPlayer]} - Score: ${game.score[game.currentPlayer]}`;
    renderCenteredText(playerInfo, gameUi.play.infoY, {
        fontSize: 34,
        fontFamily: uiFont.ui,
        color: gameUi.play.color
    });
    renderCenteredMultilineText(
        ['Press `D` for player death', 'Press `S` for score', 'Press `P` to pause game'],
        gameUi.play.deathPromptY,
        {
            fontSize: 24,
            lineHeight: 50,
            fontFamily: uiFont.ui,
            color: gameUi.play.labelColor
        }
    );

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

    const inset = 16;
    const headerOffsetY = 70;
    CanvasUtils.drawRect(panelX - inset, panelY - inset, panelWidth + (inset * 2), panelHeight + (inset * 2), gameUi.theme.colors.panelBackdrop);
    CanvasUtils.drawRect(panelX, panelY, panelWidth, panelHeight, panelColor);
    CanvasUtils.drawBounds(panelX, panelY, panelWidth, panelHeight, borderColor, panelBorderSize);
    CanvasUtils.drawLine(panelX, panelY + headerOffsetY, panelX + panelWidth, panelY + headerOffsetY, 2, borderColor);
    drawPulseAccent(panelX, panelY + headerOffsetY + 6, panelWidth, gameUi.theme.accentColor);
    CanvasUtils.drawSafeAreaGuides(Math.min(safeArea.x, safeArea.y), `${gameUi.theme.accentColor}99`);
}

function drawPulseAccent(x, y, width, accentColor) {
    const pulse = (Math.sin(Date.now() * 0.004) + 1) / 2;
    const alpha = 0.25 + (pulse * 0.45);
    const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');
    const colorWithAlpha = accentColor.length === 7 ? `${accentColor}${alphaHex}` : accentColor;
    CanvasUtils.drawLine(x + 24, y, x + width - 24, y, 3, colorWithAlpha);
}

function renderCenteredText(text, y, options = {}) {
    return CanvasText.renderCenteredText(CanvasUtils.ctx, text, y, {
        ...options,
        defaultCenterX: canvasConfig.width / 2
    });
}

function renderCenteredMultilineText(lines, startY, options = {}) {
    return CanvasText.renderCenteredMultilineText(CanvasUtils.ctx, lines, startY, {
        ...options,
        defaultCenterX: canvasConfig.width / 2
    });
}
