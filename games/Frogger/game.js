// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// game.js - Template Game Engine

import { canvasConfig, performanceConfig, fullscreenConfig, playerSelect } from './global.js';

import GameBase from '../../engine/core/gameBase.js';
import CanvasUtils from '../../engine/core/canvasUtils.js';
import CanvasText from '../../engine/core/canvasText.js';
import GamePlayerSelectUi from '../../engine/game/gamePlayerSelectUi.js';
import GameUtils from '../../engine/game/gameUtils.js';
import KeyboardInput from '../../engine/input/keyboard.js';
import GameControllers from '../../engine/input/controller/gameControllers.js';

import Frog from './gameObjects/frog.js';

import AttractMode from './attractMode.js';

const drawPixelText = CanvasText.bindDrawText(CanvasUtils.drawSprite.bind(CanvasUtils));

class Game extends GameBase {

  constructor() {
    super(canvasConfig, performanceConfig, fullscreenConfig);
    this.frog = new Frog(
      CanvasUtils.getConfigWidth() / 2,    // Center X
      CanvasUtils.getCanvasHeight() - 48,  // Bottom Y
      './assets/images/frog_sprite_60w_70h_3f.png',  // Sprite path
      4                                    // Pixel size
  );

    this.attractMode = new AttractMode();
}

  async onInitialize() {
    this.playerSelect = playerSelect;

    this.keyboardInput = new KeyboardInput();
    this.gameControllers = new GameControllers();

    // Game State Variables
    this.gameState = "attract"; // Possible states: attract, playerSelect, initGame, initEnemy, playGame, gameOver
    this.playerCount = 1;
    this.currentPlayer = 0;
    this.playerLives = null; // Player 1 - Player 4 lives
    this.score = null; // Player 1 - Player 4 scores
    this.gameInitialized = false;
    this.enemyInitialized = false;
    this.onetime = true;

    this.backToAttract = 600;
    this.backToAttractCounter = 0;


  }

  // Example: object.position += object.velocity * deltaTime;
  gameLoop(deltaTime) {
    this.keyboardInput.update();
    this.gameControllers?.update();

   // console.log(this.gameState);

    // Update game state with deltaTime
    switch (this.gameState) {
      case "attract":
        this.displayAttractMode(deltaTime);
        break;

      case "playerSelect":
        this.displayPlayerSelect();
        break;

      case "initGame":
        this.initGame();
        break;

      case "initEnemy":
        if (!this.enemyInitialized) {
          this.initializeEnemy();
        }
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

  // Display 
  displayAttractMode(deltaTime) {
    CanvasUtils.ctx.fillStyle = "white";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText("Welcome to Frogger!", 250, 200);
    CanvasUtils.ctx.fillText("Press `Enter` or `Start` to Begin", 185, 300);
    CanvasUtils.ctx.fillText("Move with Arrow Keys or D-pad", 205, 360);

    if (this.keyboardInput.getKeysPressed().includes('Enter') ||
      this.keyboardInput.getKeysPressed().includes('NumpadEnter') ||
      this.gameControllers?.wasStartPressed()) {
      this.gameState = "playerSelect";
    }

    this.attractMode.update(deltaTime);
    this.attractMode.draw(CanvasUtils.ctx);
  }

  displayPlayerSelect() {
    const config = GameUtils.getPlayerSelectConfig(canvasConfig, this.playerSelect);
    GamePlayerSelectUi.drawPlayerSelection(CanvasUtils.ctx, config, this.gameControllers);
    const result = GameUtils.resolvePlayerSelection(this.keyboardInput, this.gameControllers, config);
    if (result) {
      this.playerCount = result.playerCount;
      this.playerLives = result.playerLives;
      this.gameState = "initGame";
    }
  }

  displayGameOver() {
    CanvasUtils.ctx.fillStyle = "red";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText("Game Over", 300, 200);
    CanvasUtils.ctx.fillText("Press `Enter` or `Start` to Restart", 160, 300);

    if (this.keyboardInput.getKeysPressed().includes('Enter') ||
      this.keyboardInput.getKeysPressed().includes('NumpadEnter') ||
      this.gameControllers?.wasStartPressed() ||
      this.backToAttractCounter++ > this.backToAttract) {
      this.resetGame();
    }
  }

  // Game Logic 
  initGame() {
    this.gameInitialized = true;
    this.onetime = true;
    // this.playerLives = [3, 3, 4, 3]; // Reset lives
    this.score = [0, 0, 0, 0]; // Reset score
    this.currentPlayer = 0;

    this.gameState = "initEnemy";
  }

  initializeEnemy() {
    this.enemyInitialized = true;

    this.gameState = "playGame";
  }

  gamePauseCheck() {
    if (this.keyboardInput.getKeysPressed().includes('KeyP') ||
      this.gameControllers?.wasSelectPressed()) {
      if (this.gameState === "playGame") {
        this.gameState = "pauseGame";
      } else if (this.gameState === "pauseGame") {
        this.gameState = "playGame";
      }
    }
  }

  pauseGame() {
    this.gamePauseCheck();
    drawPixelText(150, 200, "Game Paused.", 3.5, "white");
    drawPixelText(115, 250, "Press `P` or `Select` to unpause", 3.5, "white");
  }

  playGame(deltaTime) {
    this.gamePauseCheck();

    // Draw game info
    const playerInfo = `New Player ${this.currentPlayer + 1} - Lives: ${this.playerLives[this.currentPlayer]} - Score: ${this.score[this.currentPlayer]}`;
    drawPixelText(10, 20, playerInfo, 2, "white");


    // Update and draw frog
    if (this.frog) {
        const controllerUpPressed = this.gameControllers?.wasDPadDirectionPressed('up') || false;
        const controllerDownPressed = this.gameControllers?.wasDPadDirectionPressed('down') || false;
        const controllerLeftPressed = this.gameControllers?.wasDPadDirectionPressed('left') || false;
        const controllerRightPressed = this.gameControllers?.wasDPadDirectionPressed('right') || false;
        const controllerDeathPressed = this.gameControllers?.wasSecondaryActionPressed() || false;

        // Handle keyboard input for frog movement
        if (this.keyboardInput.getKeysPressed().includes('ArrowUp') || controllerUpPressed) {
            this.frog.move('up');
        } else if (this.keyboardInput.getKeysPressed().includes('ArrowDown') || controllerDownPressed) {
            this.frog.move('down');
        } else if (this.keyboardInput.getKeysPressed().includes('ArrowLeft') || controllerLeftPressed) {
            this.frog.move('left');
        } else if (this.keyboardInput.getKeysPressed().includes('ArrowRight') || controllerRightPressed) {
            this.frog.move('right');
        }

        // Update frog state
        this.frog.update(deltaTime);

        // Draw frog
        this.frog.draw();

        // Check for frog death (temporary for testing)
        if (this.keyboardInput.getKeysPressed().includes('KeyD') || controllerDeathPressed) {
            this.frog.loseLife();
            if (!this.frog.isAlive()) {
                const result = GameUtils.swapPlayer(
                    this.playerLives,
                    this.currentPlayer,
                    this.playerCount
                );
                this.currentPlayer = result.updatedPlayer;
                this.playerLives = result.updatedLives;
                if (result.isGameOver) {
                    this.gameState = 'gameOver';
                }
            }
        }
    }
}

  resetGame() {
    if (this.frog) {
      this.frog.destroy();
      this.frog = null;
  }

    this.gameState = "attract";
    this.gameInitialized = false;
    this.enemyInitialized = false;
    this.backToAttractCounter = 0;
  }

}

export default Game;

const game = new Game();


