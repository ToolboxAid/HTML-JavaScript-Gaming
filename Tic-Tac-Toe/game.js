// ToolboxAid.com
// David Quesenberry
// game.js
// 11/15/2024

import { canvasConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';
import Fullscreen from '../scripts/fullscreen.js';
import KeyboardInput from '../scripts/keyboard.js';
import AttractMode from './attractMode.js';

class Game {
  constructor() {
    // Canvas needs to know the current directory to game.js for dynamic imports
    const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    window.canvasPath = currentDir;

    this.keyboardInput = new KeyboardInput();
    this.gameState = "attract";
    this.playerCount = 1;
    this.currentPlayer = 1;
    this.columns = 7; // Columns for Connect 4
    this.rows = 6; // Rows for Connect 4
    this.board = Array.from({ length: this.columns }, () => Array(this.rows).fill(null)); // 7x6 grid
    this.winner = null;
    this.gameInitialized = false;
    this.backToAttract = 600;
    this.backToAttractCounter = 0;

    // Initialize Attract Mode
    this.attractMode = new AttractMode(this.board);
  }

  gameLoop(deltaTime) {
    this.keyboardInput.update();
    switch (this.gameState) {
      case "attract":
        this.displayAttractMode(deltaTime);
        break;
      case "initGame":
        if (!this.gameInitialized) {
          this.initializeGame();
        }
        break;
      case "playGame":
        this.playGame();
        break;
      case "gameOver":
        this.displayGameOver();
        break;
    }
  }

  displayAttractMode(deltaTime) {
    this.drawGrid();
    this.drawBoard();

    // Display attract text
    CanvasUtils.ctx.fillStyle = "white";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText("Welcome to Connect 4", 150, 50);
    CanvasUtils.ctx.fillText("Press `Enter` to Start", 150, 100);

    if (this.keyboardInput.getKeyJustPressed().includes('Enter')) {
      this.resetGame();
      this.gameState = "initGame";
    }
  }

  initializeGame() {
    // Clear the board
    for (let col = 0; col < this.columns; col++) {
      this.board[col] = Array(this.rows).fill(null);
    }
    this.currentPlayer = 1;
    this.winner = null;
    this.gameInitialized = true;
    this.gameState = "playGame";
  }

  drawGrid() {
    const cellSize = canvasConfig.width / this.columns;
    const lineWidth = 2;

    for (let col = 0; col <= this.columns; col++) {
      // Vertical lines
      const x = col * cellSize;
      CanvasUtils.drawLineFromPoints({ x, y: 0 }, { x, y: canvasConfig.height }, lineWidth, "green");
    }
    for (let row = 0; row <= this.rows; row++) {
      // Horizontal lines
      const y = row * (canvasConfig.height / this.rows);
      CanvasUtils.drawLineFromPoints({ x: 0, y }, { x: canvasConfig.width, y }, lineWidth, "green");
    }
  }

  drawBoard() {
    const cellSize = canvasConfig.width / this.columns;
    const radius = cellSize / 3;

    for (let col = 0; col < this.columns; col++) {
      for (let row = 0; row < this.rows; row++) {
        const x = col * cellSize + cellSize / 2;
        const y = row * (canvasConfig.height / this.rows) + (canvasConfig.height / this.rows) / 2;
        const color = this.board[col][row] === 1 ? "red" : this.board[col][row] === 2 ? "blue" : "white";
        CanvasUtils.drawCircle(x, y, radius, color);
      }
    }
  }

  playGame() {
    this.drawGrid();
    this.drawBoard();

    const keyPressed = this.keyboardInput.getKeyJustPressed();
    const validKeys = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7'];

    for (let i = 0; i < validKeys.length; i++) {
      if (keyPressed.includes(validKeys[i])) {
        this.dropDisc(i);
        this.checkWinner();
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        break;
      }
    }

    if (this.winner) {
      this.gameState = "gameOver";
    }
  }

  dropDisc(col) {
    for (let row = this.rows - 1; row >= 0; row--) {
      if (!this.board[col][row]) {
        this.board[col][row] = this.currentPlayer;
        return;
      }
    }
  }

  checkWinner() {
    // Check horizontal, vertical, and diagonal lines for a win
    const directions = [
      { x: 1, y: 0 }, { x: 0, y: 1 }, // Horizontal, Vertical
      { x: 1, y: 1 }, { x: 1, y: -1 } // Diagonal
    ];

    for (let col = 0; col < this.columns; col++) {
      for (let row = 0; row < this.rows; row++) {
        const player = this.board[col][row];
        if (!player) continue;

        for (const { x, y } of directions) {
          if (this.checkLine(player, col, row, x, y)) {
            this.winner = player;
            return;
          }
        }
      }
    }
  }

  checkLine(player, col, row, dx, dy) {
    for (let i = 1; i < 4; i++) {
      const x = col + dx * i;
      const y = row + dy * i;
      if (x < 0 || x >= this.columns || y < 0 || y >= this.rows || this.board[x][y] !== player) {
        return false;
      }
    }
    return true;
  }

  displayGameOver() {
    CanvasUtils.ctx.fillStyle = "white";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText(`Player ${this.winner} Wins!`, 200, 200);
    CanvasUtils.ctx.fillText("Press `Enter` to Restart", 150, 300);

    if (this.keyboardInput.getKeyJustPressed().includes('Enter')) {
      this.resetGame();
    }
  }

  resetGame() {
    this.gameInitialized = false;
    this.winner = null;
    this.gameState = "attract";
    this.attractMode.reset();
  }
}

export default Game;


// Canvas needs to know the current directory to game.js for dynamic imports
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
