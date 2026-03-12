// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// game.js - asteroids

import { canvasConfig, performanceConfig, fullscreenConfig } from './global.js';
import GameBase from '../../engine/gameBase.js';

import KeyboardInput from '../../engine/input/keyboard.js';

import AsteroidsAttractScreen from './asteroidsAttractScreen.js';
import AsteroidsHud from './asteroidsHud.js';
import AsteroidsHighScoreStore from './asteroidsHighScoreStore.js';
import AsteroidsRuntime from './asteroidsRuntime.js';
import AsteroidsScreens from './asteroidsScreens.js';
import AsteroidsSessionController from './asteroidsSessionController.js';
import AsteroidsStateMachine from './asteroidsStateMachine.js';

import AudioPlayer from '../../engine/output/audioPlayer.js';

class Game extends GameBase {
    // Enable debug mode: game.html?game
    static DEBUG = new URLSearchParams(window.location.search).has('game');

    static audioPlayer = new AudioPlayer('./assets/effects');

    // List of audio files to be loaded
    static audioFiles = [
        'bangLarge.wav',
        'bangMedium.wav',
        'bangSmall.wav',
        'beat1.wav',
        'beat2.wav',
        'extraShip.wav',
        'fire.wav',
        'saucerBig.wav',
        'saucerSmall.wav',
        'thrust.wav',
    ];

    constructor() {
        super(canvasConfig, performanceConfig, fullscreenConfig);

        this.highScoreStore = new AsteroidsHighScoreStore();
        this.highScore = this.highScoreStore.load();
    }

    async onInitialize() {
        console.log('onInit');

        this.keyboardInput = new KeyboardInput();

        this.sessionController = new AsteroidsSessionController(Game.audioPlayer);
        this.attractScreen = null;
        this.playerCount = 0;
        this.selectedPlayerLives = null;

        this.gameState = 'attract';

        this.hudFlashState = AsteroidsHud.createFlashState();
        this.gameOverState = AsteroidsScreens.createGameOverState();
        this.enterAttract();

        await AudioPlayer.loadAllAudioFiles(Game.audioFiles, Game.audioPlayer);

        if (Game.DEBUG) {
            console.log('All audio files have been loaded and cached.');
        }
    }

    gameLoop(deltaTime) {
        if (Game.DEBUG) {
            console.log(`this.gameState: '${this.gameState}'`);
        }

        this.keyboardInput.update();

        AsteroidsStateMachine.update(this, deltaTime);
        AsteroidsStateMachine.draw(this, deltaTime);
    }

    setState(nextState) {
        return AsteroidsStateMachine.transition(this, nextState);
    }

    enterAttract() {
        this.attractScreen = new AsteroidsAttractScreen();
        AsteroidsHud.resetFlashState(this.hudFlashState);
        AsteroidsScreens.resetGameOverState(this.gameOverState);
    }

    enterFlashScore() {
        this.sessionController.ensureSession(this.playerCount, this.selectedPlayerLives);

        AsteroidsHud.resetFlashState(this.hudFlashState);
    }

    enterGameOver() {
        AsteroidsScreens.resetGameOverState(this.gameOverState);
    }

    updateAttract(deltaTime) {
        this.attractScreen.update(deltaTime);

        if (this.keyboardInput.getkeysPressed().includes('Enter')) {
            this.setState('playerSelect');
        }
    }

    drawAttract(deltaTime) {
        this.attractScreen.draw();
    }

    updatePlayerSelect(deltaTime) {
        const result = this.attractScreen.updatePlayerSelect(deltaTime, this.keyboardInput);
        if (result) {
            this.playerCount = result.playerCount;
            this.selectedPlayerLives = result.playerLives;
            this.sessionController.clearSession();
            this.setState('flashScore');
        }
    }

    drawPlayerSelect(deltaTime) {
        this.attractScreen.drawPlayerSelect();
    }

    drawLivesScores() {
        AsteroidsHud.draw(this.sessionController.getSession(), this.highScore, this.hudFlashState.flashOff, Game.DEBUG);
    }

    updateFlashScore() {
        const isComplete = AsteroidsHud.updateFlashState(this.hudFlashState, Game.DEBUG);
        if (isComplete) {
            this.setState('safeSpawn');
        }
    }

    drawFlashScore() {
        this.drawLivesScores();
    }

    updateSafeSpawn(deltaTime) {
        const safe = AsteroidsRuntime.updateSafeSpawn(this.sessionController.getSession(), deltaTime);
        if (safe) {
            this.setState('playGame');
        }
    }

    drawSafeSpawn() {
        AsteroidsRuntime.drawSafeSpawn(this.sessionController.getSession());
        this.drawLivesScores();
    }

    updatePlayGame(deltaTime) {
        this.setState(AsteroidsScreens.getPauseToggledState(this.gameState, this.keyboardInput));
        if (this.gameState !== 'playGame') {
            return;
        }

        const session = this.sessionController.getSession();
        const score = AsteroidsRuntime.stepPlay(session, deltaTime, this.keyboardInput, Game.DEBUG);
        this.highScore = this.highScoreStore.saveIfHigher(score, this.highScore);

        if (session.handleCurrentPlayerDeath((newState) => { this.setState(newState); })) {
            if (this.gameState === 'playGame') {
                this.setState('flashScore');
            }
        }
    }

    drawPlayGame() {
        AsteroidsRuntime.drawPlay(this.sessionController.getSession());
        this.drawLivesScores();
    }

    updatePauseGame(deltaTime) {
        this.setState(AsteroidsScreens.getPauseToggledState(this.gameState, this.keyboardInput));
    }

    drawPauseGame() {
        AsteroidsRuntime.drawPause(this.sessionController.getSession());
        AsteroidsScreens.drawPauseOverlay();
    }

    updateGameOver(deltaTime) {
        if (AsteroidsScreens.shouldReturnToAttract(this.gameOverState, this.keyboardInput)) {
            this.resetGame();
        }
    }

    drawGameOver() {
        AsteroidsScreens.drawGameOver();
    }

    resetGame() {
        this.sessionController.clearSession();
        this.setState('attract');
    }
}

export default Game;

const game = new Game();
