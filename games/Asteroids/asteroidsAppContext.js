// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// asteroidsAppContext.js

import AsteroidsHighScoreStore from './asteroidsHighScoreStore.js';
import AsteroidsAttractScreen from './asteroidsAttractScreen.js';
import AsteroidsHud from './asteroidsHud.js';
import AsteroidsRuntime from './asteroidsRuntime.js';
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
    }

    setPlayerSetup(playerCount, playerLives) {
        this.playerSetup.playerCount = playerCount;
        this.playerSetup.playerLives = playerLives;
    }

    beginSelectedGame(playerCount, playerLives) {
        this.setPlayerSetup(playerCount, playerLives);
        this.clearSession();
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

    getSession() {
        return this.sessionController.getSession();
    }

    updateAttract(deltaTime) {
        this.attractScreen.update(deltaTime);
    }

    drawAttract() {
        this.attractScreen.draw();
    }

    updatePlayerSelect(deltaTime, keyboardInput) {
        return this.attractScreen.updatePlayerSelect(deltaTime, keyboardInput);
    }

    drawPlayerSelect() {
        this.attractScreen.drawPlayerSelect();
    }

    getPauseToggledState(currentState, keyboardInput) {
        return AsteroidsScreens.getPauseToggledState(currentState, keyboardInput);
    }

    shouldReturnToAttract(keyboardInput) {
        return AsteroidsScreens.shouldReturnToAttract(this.gameOverState, keyboardInput);
    }

    updateSafeSpawn(deltaTime) {
        return AsteroidsRuntime.updateSafeSpawn(this.getSession(), deltaTime);
    }

    stepPlay(deltaTime, keyboardInput, debug = false) {
        return AsteroidsRuntime.stepPlay(this.getSession(), deltaTime, keyboardInput, debug);
    }

    drawSafeSpawn() {
        AsteroidsRuntime.drawSafeSpawn(this.getSession());
    }

    drawPlay() {
        AsteroidsRuntime.drawPlay(this.getSession());
    }

    drawPause() {
        AsteroidsRuntime.drawPause(this.getSession());
    }

    handleCurrentPlayerDeath(setState) {
        return this.getSession().handleCurrentPlayerDeath((newState) => { setState(newState); });
    }

    clearSession() {
        this.sessionController.clearSession();
    }
}

export default AsteroidsAppContext;
