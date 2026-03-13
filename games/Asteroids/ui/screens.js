// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// screens.js

import CanvasUtils from '../../../engine/core/canvas.js';

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
        CanvasUtils.drawText(150, 200, 'Game Paused.', 3.5, 'white');
        CanvasUtils.drawText(150, 250, 'Press `P` to unpause game', 3.5, 'white');
    }

    static drawGameOver() {
        const ctx = CanvasUtils.ctx;

        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.font = '20px "Vector Battle"';

        const xOffset = CanvasUtils.getConfigWidth() / 2 - 200;

        ctx.fillText('Game Over', xOffset + 110, 250);
        ctx.fillText('Press `Enter` to Restart', xOffset, 300);
    }
}

export default AsteroidsScreens;

