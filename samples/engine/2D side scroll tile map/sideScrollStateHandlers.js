// ToolboxAid.com
// David Quesenberry
// 03/16/2026
// sideScrollStateHandlers.js

import CanvasText from '../../../engine/core/canvasText.js';
import CanvasUtils from '../../../engine/core/canvas.js';
import GamePlayerSelectUi from '../../../engine/game/gamePlayerSelectUi.js';
import GameUtils from '../../../engine/game/gameUtils.js';
import { canvasConfig, playerSelect, sideScrollUi } from './global.js';

function renderCenteredLine(line) {
    CanvasText.renderCenteredText(CanvasUtils.ctx, line.text, line.y, {
        defaultCenterX: canvasConfig.width / 2,
        fontSize: line.fontSize,
        fontFamily: line.fontFamily,
        color: line.color,
        useDpr: false
    });
}

function renderScreen(screen) {
    screen.lines.forEach(renderCenteredLine);
}

function isStartPressed(game) {
    const keysPressed = game.keyboardInput.getKeysPressed();
    return keysPressed.includes('Enter') ||
        keysPressed.includes('NumpadEnter') ||
        game.gameControllers?.wasStartPressed();
}

function isPauseTogglePressed(game) {
    return game.keyboardInput.getKeysPressed().includes('KeyP') ||
        game.gameControllers?.wasSelectPressed();
}

function togglePauseState(game) {
    if (!isPauseTogglePressed(game)) {
        return;
    }

    game.gameState = game.gameState === game.constructor.STATES.PLAY_GAME
        ? game.constructor.STATES.PAUSE_GAME
        : game.constructor.STATES.PLAY_GAME;
}

export function displayAttractMode(game, deltaTime) {
    renderScreen(sideScrollUi.screens.attract);
    game.gameAttract.update(deltaTime, game.keyboardInput, game.gameControllers);
    game.gameAttract.draw();

    if (isStartPressed(game)) {
        game.gameState = game.constructor.STATES.PLAYER_SELECT;
    }
}

export function displayPlayerSelect(game) {
    const config = GameUtils.getPlayerSelectConfig(canvasConfig, playerSelect);
    GamePlayerSelectUi.drawPlayerSelection(CanvasUtils.ctx, config, game.gameControllers);
    const result = GameUtils.resolvePlayerSelection(game.keyboardInput, game.gameControllers, config);

    if (!result) {
        return;
    }

    game.playerCount = result.playerCount;
    game.playerLives = result.playerLives;
    game.gameState = game.constructor.STATES.INIT_GAME;
}

export function displayGameOver(game) {
    renderScreen(sideScrollUi.screens.gameOver);

    if (isStartPressed(game) || game.backToAttractCounter++ > game.backToAttract) {
        resetGame(game);
    }
}

export function initGame(game) {
    game.gameInitialized = true;
    game.onetime = true;
    game.score = Array(playerSelect.maxPlayers).fill(0);
    game.currentPlayer = 0;
    game.gameState = game.constructor.STATES.INIT_ENEMY;
}

export function initializeEnemyIfNeeded(game) {
    if (game.enemyInitialized) {
        return;
    }

    game.enemyInitialized = true;
    game.gameState = game.constructor.STATES.PLAY_GAME;
}

export function pauseGame(game) {
    togglePauseState(game);
    renderScreen(sideScrollUi.screens.pause);
}

export function playGame(game) {
    togglePauseState(game);
    const screen = sideScrollUi.screens.play;
    const playerInfo = `Player ${game.currentPlayer + 1} - Lives: ${game.playerLives[game.currentPlayer]} - Score: ${game.score[game.currentPlayer]}`;

    CanvasText.renderCenteredText(CanvasUtils.ctx, playerInfo, screen.infoY, {
        defaultCenterX: canvasConfig.width / 2,
        fontSize: screen.infoFontSize,
        fontFamily: screen.infoFontFamily,
        color: screen.infoColor,
        useDpr: false
    });

    CanvasText.renderCenteredMultilineText(CanvasUtils.ctx, screen.prompts, screen.promptsY, {
        defaultCenterX: canvasConfig.width / 2,
        fontSize: screen.promptFontSize,
        lineHeight: screen.promptLineHeight,
        fontFamily: screen.promptFontFamily,
        color: screen.promptColor,
        useDpr: false
    });

    if (game.keyboardInput.getKeysPressed().includes('KeyS') || game.gameControllers?.wasPrimaryActionPressed()) {
        game.score[game.currentPlayer] += 100;
    }

    if (!(game.keyboardInput.getKeysPressed().includes('KeyD') || game.gameControllers?.wasSecondaryActionPressed())) {
        return;
    }

    const result = GameUtils.swapPlayer(
        game.playerLives,
        game.currentPlayer,
        game.playerCount
    );

    game.currentPlayer = result.updatedPlayer;
    game.playerLives = result.updatedLives;
    if (result.isGameOver) {
        game.gameState = game.constructor.STATES.GAME_OVER;
    }
}

export function resetGame(game) {
    game.gameState = game.constructor.STATES.ATTRACT;
    game.gameInitialized = false;
    game.enemyInitialized = false;
    game.backToAttractCounter = 0;
}
