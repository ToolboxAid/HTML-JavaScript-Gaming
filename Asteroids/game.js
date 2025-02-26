// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// game.js - asteroids

import { canvasConfig, performanceConfig, fullscreenConfig, playerSelect } from './global.js';
import GameBase from '../scripts/gamebase.js';

import CanvasUtils from '../scripts/canvas.js';
import KeyboardInput from '../scripts/input/keyboard.js';
import GameUtils from '../scripts/game/gameUtils.js';

import Ship from './ship.js';

import GameAttract from './gameAttract.js';

import AudioPlayer from '../scripts/output/audioPlayer.js';

import ParticleExplosion from '../scripts/gfx/particleExplosion.js';

class Game extends GameBase {

  static gameAttract = null;

  // Enable debug mode: game.html?game
  static DEBUG = new URLSearchParams(window.location.search).has('game');

  constructor() {
    super(canvasConfig, performanceConfig, fullscreenConfig);
  }

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

  async onInitialize() {
    console.log("onInit");
    this.keyboardInput = new KeyboardInput();

    this.ships = [];

    this.currentPlayer = 0;
    this.playerLives = null; // Player 1 - Player 4 lives
    this.score = null; // Player 1 - Player 4 scores

    // Game State Variables
    this.gameState = "initAttract";

    this.backToAttract = 180;
    this.backToAttractCounter = 0;

    // Load audio files
    await AudioPlayer.loadAllAudioFiles(Game.audioFiles, Game.audioPlayer);
    if (Game.DEBUG) {
      console.log("All audio files have been loaded and cached.");
    }
    this.particleExplosion = null;
  }

  // Create an explosion when an asteroid is hit
  static explosions = [];

  // Modified to add new explosion to array
  static newParticleExplosion(x = 500, y = 500, size = 50, particleRadius = 5.0) {
    const explosion = new ParticleExplosion(
      x,               // x position
      y,               // y position
      0,               // start radius
      size,            // end radius
      1.35,            // duration in seconds
      size / 4,        // number of particles
      particleRadius,  // Particle Radius
    );
    Game.explosions.push(explosion);
  }

  static lastExplosionTime = 0;
  static EXPLOSION_INTERVAL = 100; // 5 seconds in milliseconds

  gameLoop(deltaTime) {
    // Update and draw all explosions with proper cleanup
    Game.explosions = Game.explosions.filter(explosion => {
      if (!explosion || explosion.isDone) {
        if (explosion) {
          explosion.destroy();
        }
        return false;
      }

      if (explosion.update(deltaTime)) {
        explosion.destroy();
        return false;
      }
      explosion.draw();
      return true;
    });

    // Test: Create new explosion every 5 seconds
    if (Game.DEBUG) {
      const currentTime = Date.now();
      if (currentTime - Game.lastExplosionTime > Game.EXPLOSION_INTERVAL) {
        Game.newParticleExplosion(
          Math.random() * canvasConfig.width,
          Math.random() * canvasConfig.height
        );
        Game.lastExplosionTime = currentTime;
      }
    }

    console.log(`this.gameState: '${this.gameState}'`);

    this.keyboardInput.update();

    switch (this.gameState) {
      case "initAttract":
        Game.gameAttract = new GameAttract();
        this.gameState = "attract";
        break;

      case "attract":
        this.displayGameAttract(deltaTime);
        break;

      case "playerSelect":
        this.displayPlayerSelect(deltaTime);
        break;

      case "initGame":
        this.initGame();
        break;

      case "flashScore":
        this.flashScore(deltaTime);
        break;

      case "safeSpawn":
        this.safeSpawn(deltaTime);
        break;

      case "playGame":
        this.playGame(deltaTime);
        break;

      case "pauseGame":
        this.pauseGame();
        break;

      case "gameOver":
        this.displayGameOver();
        break;
    }
  }

  displayGameAttract(deltaTime) {
    Game.gameAttract.update(deltaTime);
    Game.gameAttract.draw();
    if (this.particleExplosion) {
      this.particleExplosion.draw();
    }

    if (this.keyboardInput.getkeysPressed().includes('Enter')) {
      this.gameState = "playerSelect";
    }
  }

  displayPlayerSelect(deltaTime) {
    Game.gameAttract.update(deltaTime);
    Game.gameAttract.draw(false);
    const result = GameUtils.selectNumberOfPlayers(CanvasUtils.ctx, canvasConfig, playerSelect, this.keyboardInput);
    if (result) {
      this.playerCount = result.playerCount;
      this.playerLives = result.playerLives;
      this.gameState = "initGame";
    }
  }

  initGame() {
    for (let i = 0; i <= 3; i++) {
      this.ships[i] = new Ship(Game.audioPlayer);
    }

    this.score = [0, 0, 0, 0]; // Reset score
    this.currentPlayer = 0;


    this.drawLivesScores();

    this.gameState = "flashScore";
  }

  static FLASH_INTERVAL = 200; // Flash every 250ms
  static FLASH_DURATION = 3000; // Total flash duration in ms
  static SCORE_POSITIONS = {
    LIVES: { x: 200, y: 30 },
    SCORE: { x: 200, y: 70 }
  };

  drawShipLives(offsetX, offsetY, vectorMap, lineWidth = 1.25) {
    try {
      // Begin drawing
      CanvasUtils.ctx.beginPath();
      CanvasUtils.ctx.strokeStyle = "white";
      CanvasUtils.ctx.lineWidth = lineWidth;

      // Draw using the pre-calculated rotated points
      vectorMap.forEach(([rx, ry], index) => {
        if (index === 0) {
          CanvasUtils.ctx.moveTo(rx + offsetX, ry + offsetY);
        } else {
          CanvasUtils.ctx.lineTo(rx + offsetX, ry + offsetY);
        }
      });

      // Finish shape
      CanvasUtils.ctx.closePath();
      CanvasUtils.ctx.stroke();

    } catch (error) {
      console.error("Error occurred while drawing:", error.message);
      console.log("Object state:", this);
    }
  }

  drawLivesScores() {
    const { LIVES, SCORE } = Game.SCORE_POSITIONS;
    const ctx = CanvasUtils.ctx;

    // Configure text settings
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';

    // During flash state, only current player's score flashes
    for (let player = 0; player < this.playerCount; player++) {
      ctx.font = '20px "Vector Battle"';

      // Skip drawing current player's score if flashing and flashOff is true
      if (player === this.currentPlayer && this.flashOff) {
        continue;
      }

      // Draw lives and score for each player
      const xOffset = player * 460; // Space between player scores
      ctx.fillText(
        `${this.score[player]}`,
        SCORE.x + xOffset,
        SCORE.y
      );

      // Draw ship icons for remaining lives
      const SHIP_SPACING = 20; // Space between each ship icon
      for (let life = 0; life < this.playerLives[player]; life++) {
        const xOffset2 = life * SHIP_SPACING;
        this.drawShipLives(
          LIVES.x + xOffset + xOffset2,
          LIVES.y,
          Ship.VECTOR_MAPS.LIVES
        );
      }
      if (Game.DEBUG) {
        console.log(`Drawing P${player + 1}:`, {
          lives: this.playerLives[player],
          score: this.score[player],
          isCurrentPlayer: player === this.currentPlayer,
          flashOff: this.flashOff
        });
      }
    }

    ctx.font = '15px "Vector Battle"';

    const highScore = 1000;
    ctx.fillText(
      `${highScore}`,
      SCORE.x + 200,
      SCORE.y
    );
  }

  flashScore() {
    if (!this.flashStartTime) {
      this.flashStartTime = Date.now();
      this.flashOff = false;
      console.log('Flash Started:', { startTime: this.flashStartTime });
    }

    const elapsedTime = Date.now() - this.flashStartTime;
    this.flashOff = Math.floor(elapsedTime / Game.FLASH_INTERVAL) % 2 === 0;

    this.drawLivesScores();

    if (elapsedTime >= Game.FLASH_DURATION) {
      console.log('Flash Complete');
      this.flashStartTime = null;
      this.flashOff = false; // Ensure text is visible when moving to safeSpawn
      this.gameState = "safeSpawn";
    }
  }

  safeSpawn(deltaTime) {
    const safe = this.ships[this.currentPlayer].safeSpawn(deltaTime);
    if (safe) {
      this.gameState = "playGame";
    }
    this.ships[this.currentPlayer].safeDraw();

    this.drawLivesScores();

    console.log("============================safeSpawn");
  }

  playGame(deltaTime) {
    this.gamePauseCheck();

    this.ships[this.currentPlayer].update(deltaTime, this.keyboardInput);
    //TODO: fix score
    //this.score[this.currentPlayer] += this.ships[this.currentPlayer].getValue();

    if (this.ships[this.currentPlayer].isDead()) {
      this.ships[this.currentPlayer].setIsAlive();
      console.log("----------pre", this.gameState);
      const result = GameUtils.swapPlayer(
        this.playerLives,
        this.currentPlayer,
        this.playerCount,
        (newState) => { this.gameState = newState; }
      );
      if (this.gameState === "playGame") {
        this.gameState = "flashScore";
      }
      console.log("----------post", this.gameState, result);
      // Update the current player and 
      // lives based on the result from swapPlayer
      this.currentPlayer = result.updatedPlayer;
      this.playerLives = result.updatedLives;
      this.ships[this.currentPlayer].reset();
    }
    this.ships[this.currentPlayer].draw();

    this.drawLivesScores();
  }

  pauseGame() {
    this.gamePauseCheck();
    CanvasUtils.drawText(150, 200, "Game Paused.", 3.5, "white");
    CanvasUtils.drawText(150, 250, "Press `P` to unpause game", 3.5, "white");
  }

  gamePauseCheck() {
    this.ships[this.currentPlayer].draw();

    if (this.keyboardInput.getkeysPressed().includes('KeyP')) {
      this.gameState = this.gameState === "playGame" ? "pauseGame" : "playGame";
    }
  }

  pauseGame() {
    this.gamePauseCheck();
    CanvasUtils.drawText(150, 200, "Game Paused.", 3.5, "white");
    CanvasUtils.drawText(150, 250, "Press `P` to unpause game", 3.5, "white");
  }

  gamePauseCheck() {
    this.ships[this.currentPlayer].draw();

    if (this.keyboardInput.getkeysPressed().includes('KeyP')) {
      this.gameState = this.gameState === "playGame" ? "pauseGame" : "playGame";
    }
  }

  displayGameOver() {
    CanvasUtils.ctx.fillStyle = "red";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText("Game Over", 300, 200);
    CanvasUtils.ctx.fillText("Press `Enter` to Restart", 250, 300);

    if (this.keyboardInput.getkeysPressed().includes('Enter') ||
      this.backToAttractCounter++ > this.backToAttract) {
      this.resetGame();
    }
  }

  resetGame() {
    // Clear all explosions with proper cleanup
    while (Game.explosions.length > 0) {
      const explosion = Game.explosions.pop();
      if (explosion) {
        explosion.destroy();
      }
    }
    Game.explosions = [];

    this.gameState = "initAttract";
    this.backToAttractCounter = 0;
  }
}

export default Game;

const game = new Game();
