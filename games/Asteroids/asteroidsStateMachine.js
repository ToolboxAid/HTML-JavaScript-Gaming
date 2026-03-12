// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// asteroidsStateMachine.js

class AsteroidsStateMachine {
    static UPDATE_HANDLERS = {
        initAttract: 'handleInitAttract',
        attract: 'updateAttract',
        playerSelect: 'updatePlayerSelect',
        initGame: 'initGame',
        flashScore: 'updateFlashScore',
        safeSpawn: 'updateSafeSpawn',
        playGame: 'updatePlayGame',
        pauseGame: 'updatePauseGame',
        gameOver: 'updateGameOver'
    };

    static DRAW_HANDLERS = {
        attract: 'drawAttract',
        playerSelect: 'drawPlayerSelect',
        flashScore: 'drawFlashScore',
        safeSpawn: 'drawSafeSpawn',
        playGame: 'drawPlayGame',
        pauseGame: 'drawPauseGame',
        gameOver: 'drawGameOver'
    };

    static update(game, deltaTime) {
        this.invoke(game, this.UPDATE_HANDLERS[game.gameState], deltaTime);
    }

    static draw(game, deltaTime) {
        this.invoke(game, this.DRAW_HANDLERS[game.gameState], deltaTime);
    }

    static invoke(game, handlerName, deltaTime) {
        if (!handlerName || typeof game[handlerName] !== 'function') {
            return;
        }

        game[handlerName](deltaTime);
    }
}

export default AsteroidsStateMachine;
