// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameStates.js

import CanvasUtils from '../../../engine/core/canvas.js';
import DebugLog from '../../../engine/utils/debugLog.js';
import GameUtils from '../../../engine/game/gameUtils.js';
import { canvasConfig } from './global.js';
import { isPauseTogglePressed, isPlayerDeathPressed, isScorePressed, isStartPressed } from './gameInput.js';

export function displayAttractMode(game) {
    CanvasUtils.ctx.fillStyle = 'white';
    CanvasUtils.ctx.font = '30px Arial';
    CanvasUtils.ctx.fillText('Welcome to the Game!', 250, 200);
    CanvasUtils.ctx.fillText('Press `Enter` to Start', 250, 300);

    if (isStartPressed(game.keyboardInput)) {
        game.gameState = game.constructor.STATES.PLAYER_SELECT;
    }
}

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

export function displayGameOver(game) {
    CanvasUtils.ctx.fillStyle = 'red';
    CanvasUtils.ctx.font = '30px Arial';
    CanvasUtils.ctx.fillText('Game Over', 300, 200);
    CanvasUtils.ctx.fillText('Press `Enter` to Restart', 250, 300);

    if (isStartPressed(game.keyboardInput) ||
        game.backToAttractCounter++ > game.backToAttractFrames) {
        resetGame(game);
    }
}

export function initGame(game) {
    game.gameInitialized = true;
    game.score = [0, 0, 0, 0];
    game.currentPlayer = 0;
    game.gameState = game.constructor.STATES.INIT_ENEMY;
}

export function initializeEnemy(game) {
    DebugLog.log(game.constructor.DEBUG, 'Game', 'Initializing enemy');
    game.enemyInitialized = true;
    game.gameState = game.constructor.STATES.PLAY_GAME;
}

export function pauseGame(game) {
    gamePauseCheck(game);
    CanvasUtils.drawText(150, 200, 'Game Paused.', 3.5, 'white');
    CanvasUtils.drawText(150, 250, 'Press `P` to unpause game', 3.5, 'white');
}

export function playGame(game) {
    gamePauseCheck(game);

    const playerInfo = `Player ${game.currentPlayer + 1} - Lives: ${game.playerLives[game.currentPlayer]} - Score: ${game.score[game.currentPlayer]}`;
    CanvasUtils.drawText(100, 200, playerInfo, 3.5, 'white');
    CanvasUtils.drawText(100, 250, 'Press `D` for player death', 3.5, 'white');
    CanvasUtils.drawText(100, 300, 'Press `S` for score', 3.5, 'white');
    CanvasUtils.drawText(100, 350, 'Press `P` to pause game', 3.5, 'white');

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

export function resetGame(game) {
    game.gameState = game.constructor.STATES.ATTRACT;
    game.gameInitialized = false;
    game.enemyInitialized = false;
    game.backToAttractCounter = 0;
}

function gamePauseCheck(game) {
    if (!isPauseTogglePressed(game.keyboardInput)) {
        return;
    }

    game.gameState = game.gameState === game.constructor.STATES.PLAY_GAME
        ? game.constructor.STATES.PAUSE_GAME
        : game.constructor.STATES.PLAY_GAME;
}
