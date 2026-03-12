// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// asteroidsAppContext.js

import AsteroidsHighScoreStore from './asteroidsHighScoreStore.js';
import AsteroidsAttractScreen from './asteroidsAttractScreen.js';
import AsteroidsHud from './asteroidsHud.js';
import AsteroidsScreens from './asteroidsScreens.js';
import AsteroidsSessionController from './asteroidsSessionController.js';

class AsteroidsAppContext {
    constructor(audioPlayer) {
        this.sessionController = new AsteroidsSessionController(audioPlayer);
        this.highScoreStore = new AsteroidsHighScoreStore();
        this.highScore = this.highScoreStore.load();
        this.hudFlashState = AsteroidsHud.createFlashState();
        this.gameOverState = AsteroidsScreens.createGameOverState();
        this.attractScreen = null;
        this.playerSetup = {
            playerCount: 0,
            playerLives: null
        };
    }

    createAttractScreen() {
        this.attractScreen = new AsteroidsAttractScreen();
        return this.attractScreen;
    }

    setPlayerSetup(playerCount, playerLives) {
        this.playerSetup.playerCount = playerCount;
        this.playerSetup.playerLives = playerLives;
    }

    beginSelectedGame(playerCount, playerLives) {
        this.setPlayerSetup(playerCount, playerLives);
        this.resetSession();
    }

    enterAttract() {
        this.createAttractScreen();
        AsteroidsHud.resetFlashState(this.hudFlashState);
        AsteroidsScreens.resetGameOverState(this.gameOverState);
    }

    enterFlashScore() {
        this.sessionController.ensureSession(this.playerSetup.playerCount, this.playerSetup.playerLives);
        AsteroidsHud.resetFlashState(this.hudFlashState);
    }

    enterGameOver() {
        AsteroidsScreens.resetGameOverState(this.gameOverState);
    }

    drawHud(debug = false) {
        AsteroidsHud.draw(this.sessionController.getSession(), this.highScore, this.hudFlashState.flashOff, debug);
    }

    updateFlashScore(debug = false) {
        return AsteroidsHud.updateFlashState(this.hudFlashState, debug);
    }

    saveHighScore(score) {
        this.highScore = this.highScoreStore.saveIfHigher(score, this.highScore);
        return this.highScore;
    }

    handleCurrentPlayerDeath(setState) {
        const session = this.sessionController.getSession();
        return session.handleCurrentPlayerDeath((newState) => { setState(newState); });
    }

    resetSession() {
        this.sessionController.clearSession();
    }
}

export default AsteroidsAppContext;
