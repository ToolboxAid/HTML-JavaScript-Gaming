// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// screens.js

import CanvasSprite from '../../../engine/core/canvasSprite.js';
import CanvasText from '../../../engine/core/canvasText.js';
import CanvasUtils from '../../../engine/core/canvasUtils.js';

const drawPixelText = CanvasText.bindDrawText(CanvasSprite.bindDrawSprite());

class AsteroidsScreens {
    static BACK_TO_ATTRACT = 180;

    static createGameOverState() {
        return {
            counter: 0
        };
    }

    static resetGameOverState(gameOverState) {
        if (!gameOverState) {
            return;
        }

        gameOverState.counter = 0;
    }

    static shouldReturnToAttract(gameOverState, keyboardInput) {
        if (!gameOverState) {
            return true;
        }

        if (keyboardInput.getKeysPressed().includes('Enter')) {
            return true;
        }

        gameOverState.counter += 1;
        return gameOverState.counter > AsteroidsScreens.BACK_TO_ATTRACT;
    }

    static getPauseToggledState(currentState, keyboardInput) {
        if (!keyboardInput.getKeysPressed().includes('KeyP')) {
            return currentState;
        }

        return currentState === 'playGame' ? 'pauseGame' : 'playGame';
    }

    static drawPauseOverlay() {
        drawPixelText(150, 200, 'Game Paused.', 3.5, 'white');
        drawPixelText(150, 250, 'Press `P` to unpause game', 3.5, 'white');
    }

    static drawGameOver() {
        const ctx = CanvasUtils.ctx;
        const xOffset = CanvasUtils.getConfigWidth() / 2 - 200;
        CanvasText.renderText(ctx, 'Game Over', xOffset + 110, 250, {
            fontSize: 20,
            fontFamily: '"Vector Battle"',
            useDpr: false
        });
        CanvasText.renderText(ctx, 'Press `Enter` to Restart', xOffset, 300, {
            fontSize: 20,
            fontFamily: '"Vector Battle"',
            useDpr: false
        });
    }
}

export default AsteroidsScreens;


