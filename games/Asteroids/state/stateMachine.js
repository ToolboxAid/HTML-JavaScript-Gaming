// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// stateMachine.js

class AsteroidsStateMachine {
    static TRANSITIONS = {
        attract: ['playerSelect'],
        playerSelect: ['flashScore'],
        flashScore: ['safeSpawn'],
        safeSpawn: ['playGame'],
        playGame: ['pauseGame', 'flashScore', 'gameOver'],
        pauseGame: ['playGame'],
        gameOver: ['attract']
    };

    static UPDATE_HANDLERS = {
        attract: 'updateAttract',
        playerSelect: 'updatePlayerSelect',
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

    static ENTRY_HANDLERS = {
        attract: 'enterAttract',
        flashScore: 'enterFlashScore',
        gameOver: 'enterGameOver'
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

    static canTransition(currentState, nextState) {
        if (currentState === nextState) {
            return true;
        }

        const validTransitions = this.TRANSITIONS[currentState] || [];
        return validTransitions.includes(nextState);
    }

    static transition(game, nextState) {
        const currentState = game.gameState;

        if (currentState === nextState) {
            return true;
        }

        if (this.canTransition(currentState, nextState)) {
            game.gameState = nextState;
            this.enter(game, nextState);
            return true;
        }

        console.warn(`Invalid Asteroids state transition: '${currentState}' -> '${nextState}'`);
        return false;
    }

    static enter(game, state) {
        this.invoke(game, this.ENTRY_HANDLERS[state]);
    }
}

export default AsteroidsStateMachine;
