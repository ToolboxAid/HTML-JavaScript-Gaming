// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// game.js - asteroids

import { canvasConfig, performanceConfig, fullscreenConfig } from './global.js';
import GameBase from '../../engine/gameBase.js';

import KeyboardInput from '../../engine/input/keyboard.js';

import AsteroidsAppContext from './asteroidsAppContext.js';
import AsteroidsScreens from './ui/asteroidsScreens.js';
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
        this.app = new AsteroidsAppContext(Game.audioPlayer);
    }

    async onInitialize() {
        console.log('onInit');

        this.keyboardInput = new KeyboardInput();

        this.gameState = 'attract';
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
        this.app.enterAttract();
    }

    enterFlashScore() {
        this.app.enterFlashScore();
    }

    enterGameOver() {
        this.app.enterGameOver();
    }

    updateAttract(deltaTime) {
        this.app.updateAttract(deltaTime);

        if (this.keyboardInput.getkeysPressed().includes('Enter')) {
            this.setState('playerSelect');
        }
    }

    drawAttract(deltaTime) {
        this.app.drawAttract();
    }

    updatePlayerSelect(deltaTime) {
        const result = this.app.updatePlayerSelect(deltaTime, this.keyboardInput);
        if (result) {
            this.app.beginSelectedGame(result.playerCount, result.playerLives);
            this.setState('flashScore');
        }
    }

    drawPlayerSelect(deltaTime) {
        this.app.drawPlayerSelect();
    }

    drawLivesScores() {
        this.app.drawHud(Game.DEBUG);
    }

    updateFlashScore() {
        const isComplete = this.app.updateFlashScore(Game.DEBUG);
        if (isComplete) {
            this.setState('safeSpawn');
        }
    }

    drawFlashScore() {
        this.drawLivesScores();
    }

    updateSafeSpawn(deltaTime) {
        const safe = this.app.updateSafeSpawn(deltaTime);
        if (safe) {
            this.setState('playGame');
        }
    }

    drawSafeSpawn() {
        this.app.drawSafeSpawn();
        this.drawLivesScores();
    }

    updatePlayGame(deltaTime) {
        this.setState(this.app.getPauseToggledState(this.gameState, this.keyboardInput));
        if (this.gameState !== 'playGame') {
            return;
        }

        const score = this.app.stepPlay(deltaTime, this.keyboardInput, Game.DEBUG);
        this.app.saveHighScore(score);

        if (this.app.handleCurrentPlayerDeath((newState) => { this.setState(newState); })) {
            if (this.gameState === 'playGame') {
                this.setState('flashScore');
            }
        }
    }

    drawPlayGame() {
        this.app.drawPlay();
        this.drawLivesScores();
    }

    updatePauseGame(deltaTime) {
        this.setState(this.app.getPauseToggledState(this.gameState, this.keyboardInput));
    }

    drawPauseGame() {
        this.app.drawPause();
        AsteroidsScreens.drawPauseOverlay();
    }

    updateGameOver(deltaTime) {
        if (this.app.shouldReturnToAttract(this.keyboardInput)) {
            this.resetGame();
        }
    }

    drawGameOver() {
        AsteroidsScreens.drawGameOver();
    }

    resetGame() {
        this.app.clearSession();
        this.setState('attract');
    }
}

export default Game;

const game = new Game();
