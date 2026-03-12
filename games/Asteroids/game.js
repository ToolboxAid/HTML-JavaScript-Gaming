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
import AsteroidsScreens from './asteroidsScreens.js';
import AsteroidsSession from './asteroidsSession.js';
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

        this.session = null;
        this.attractScreen = null;
        this.playerCount = 0;
        this.selectedPlayerLives = null;

        this.gameState = 'initAttract';

        this.hudFlashState = AsteroidsHud.createFlashState();
        this.gameOverState = AsteroidsScreens.createGameOverState();

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

    enterInitAttract() {
        this.attractScreen = null;
        AsteroidsHud.resetFlashState(this.hudFlashState);
        AsteroidsScreens.resetGameOverState(this.gameOverState);
    }

    enterAttract() {
        this.attractScreen = new AsteroidsAttractScreen();
    }

    enterFlashScore() {
        AsteroidsHud.resetFlashState(this.hudFlashState);
    }

    enterGameOver() {
        AsteroidsScreens.resetGameOverState(this.gameOverState);
    }

    handleInitAttract() {
        this.setState('attract');
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
            this.setState('initGame');
        }
    }

    drawPlayerSelect(deltaTime) {
        this.attractScreen.drawPlayerSelect();
    }

    initGame() {
        this.session = new AsteroidsSession(Game.audioPlayer);
        this.session.initialize(this.playerCount, this.selectedPlayerLives);

        this.setState('flashScore');
    }

    drawLivesScores() {
        AsteroidsHud.draw(this.session, this.highScore, this.hudFlashState.flashOff, Game.DEBUG);
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
        const ship = this.session.getCurrentShip();
        const world = this.session.getCurrentWorld();
        world.stepForSpawn(deltaTime, ship);
        const safe = world.isSafeSpawn(ship);
        if (safe) {
            this.setState('playGame');
        }
    }

    drawSafeSpawn() {
        this.session.getCurrentWorld().drawSafeSpawn();
        this.drawLivesScores();
    }

    updatePlayGame(deltaTime) {
        this.setState(AsteroidsScreens.getPauseToggledState(this.gameState, this.keyboardInput));
        if (this.gameState !== 'playGame') {
            return;
        }

        const ship = this.session.getCurrentShip();
        const world = this.session.getCurrentWorld();

        ship.update(deltaTime, this.keyboardInput);
        world.step(deltaTime, ship, this.keyboardInput);

        if (ship.isDying() && world.canFinalizeActorDeath()) {
            if (Game.DEBUG) {
                console.log('Ship death confirmed - UFO destroyed');
            }

            ship.setShipDead();
        }

        const score = this.session.addCurrentPlayerScore(world.consumeScore());
        this.highScore = this.highScoreStore.saveIfHigher(score, this.highScore);

        if (this.session.handleCurrentPlayerDeath((newState) => { this.setState(newState); })) {
            if (this.gameState === 'playGame') {
                this.setState('flashScore');
            }
        }
    }

    drawPlayGame() {
        this.session.getCurrentShip().draw();
        this.session.getCurrentWorld().draw();
        this.drawLivesScores();
    }

    updatePauseGame(deltaTime) {
        this.setState(AsteroidsScreens.getPauseToggledState(this.gameState, this.keyboardInput));
    }

    drawPauseGame() {
        this.session.getCurrentShip().draw();
        this.session.getCurrentWorld().draw();
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
        this.setState('initAttract');
    }
}

export default Game;

const game = new Game();
