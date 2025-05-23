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
import Cookies from '../scripts/misc/cookies.js';

class Game extends GameBase {

  static gameAttract = null;

  // Enable debug mode: game.html?game
  static DEBUG = new URLSearchParams(window.location.search).has('game');

  constructor() {
    super(canvasConfig, performanceConfig, fullscreenConfig);

    // Static cookie name & path for consistency
    // Use current directory as name
    const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));

    this.cookieName = Cookies.sanitizeCookieName(currentDir);
    this.cookiePath = "/";
    this.getHighScoreCookie();
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
  }

  gameLoop(deltaTime) {

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

    ctx.fillText(
      `${this.highScore}`,
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
  }

  // Method to get the high score cookie
  getHighScoreCookie(initScore = 0) {
    // Try to get the cookie value
    let cookie = Cookies.get(this.cookieName, { path: this.cookiePath });
    console.log("Retrieved cookie:", cookie);

    if (cookie === null) {
      // Set the high score cookie if it doesn't exist
      this.setHighScoreCookie(initScore);

      // Immediate retrieval to ensure the cookie is accessible
      cookie = Cookies.get(this.cookieName, { path: this.cookiePath });
      if (cookie === null) {
        console.error("Failed to set the cookie!", this.cookieName, this.cookiePath);
      } else {
        console.log("Set new cookie:", cookie);
      }
    } else {
      console.log("Cookie found:", cookie);
    }

    // Convert the cookie to a number and store it as the high score
    if (cookie !== null) {
      this.highScore = parseInt(cookie, 10);
      if (isNaN(this.highScore)) {
        console.error("Error: Cookie value is not a valid number");
        this.highScore = 0; // Default fallback
      } else {
        console.log("Parsed high score:", this.highScore);
      }
    } else {
      this.highScore = 0; // Default fallback for null
    }
  }

  // Method to set the high score cookie
  setHighScoreCookie(score) {
    if (score > this.highScore) {
      this.highScore = score;
      Cookies.set(this.cookieName, score, {
        expires: 7, // Expires in 7 days
        path: this.cookiePath // Root path for simplicity
      });
      console.log(`Cookie set: ${this.cookieName}=${score}`);
    }
  }

  playGame(deltaTime) {
    this.gamePauseCheck();

    this.ships[this.currentPlayer].update(deltaTime, this.keyboardInput);
    this.score[this.currentPlayer] += this.ships[this.currentPlayer].getValue();
    this.setHighScoreCookie(this.score[this.currentPlayer]);
    if (this.ships[this.currentPlayer].isDead()) {
      this.ships[this.currentPlayer].setIsAlive();
      const result = GameUtils.swapPlayer(
        this.playerLives,
        this.currentPlayer,
        this.playerCount,
        (newState) => { this.gameState = newState; }
      );
      if (this.gameState === "playGame") {
        this.gameState = "flashScore";
      }
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

  displayGameOver1() {
    CanvasUtils.ctx.fillStyle = "red";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText("Game Over", 300, 200);
    CanvasUtils.ctx.fillText("Press `Enter` to Restart", 250, 300);

    if (this.keyboardInput.getkeysPressed().includes('Enter') ||
      this.backToAttractCounter++ > this.backToAttract) {
      this.resetGame();
    }
  }

  displayGameOver() {
    const ctx = CanvasUtils.ctx;

    // Configure text settings
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';

    // During flash state, only current player's score flashes
    ctx.font = '20px "Vector Battle"';

    // Draw lives and score for each player
    const xOffset = CanvasUtils.getConfigWidth() / 2 - 200; // Space between player scores
    ctx.fillText(
      `Game Over`,
      xOffset + 110,
      250
    );
    ctx.fillText(
      "Press `Enter` to Restart",
      xOffset,
      300);

    if (this.keyboardInput.getkeysPressed().includes('Enter') ||
      this.backToAttractCounter++ > this.backToAttract) {
      this.resetGame();
    }
  }


  resetGame() {
    this.gameState = "initAttract";
    this.backToAttractCounter = 0;
  }
}

export default Game;

const game = new Game();
