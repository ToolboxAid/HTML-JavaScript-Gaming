
// ToolboxAid.com
// David Quesenberry
// Game.js - Connect 4 Implementation
// 11/15/2024

import { canvasConfig, performanceConfig, fullscreenConfig } from './global.js';
import GameBase from '../scripts/gamebase.js';
import CanvasUtils from '../scripts/canvas.js';
import KeyboardInput from '../scripts/input/keyboard.js';

class Game extends GameBase {
  constructor() {
    super(canvasConfig, performanceConfig, fullscreenConfig);
  }

  async onInitialize() {
    this.keyboardInput = new KeyboardInput();

    this.columns = 7;
    this.rows = 6;
    this.lineWidth = 10;
    this.cellWidth = canvasConfig.width / (this.rows + 1);
    this.cellHeight = canvasConfig.height / (this.columns - 1);

    // Game State Variables
    this.gameState = "attract"; // Possible states: attract, playerSelect, playGame, gameOver
    this.currentPlayer = 1; // Player 1 (Red) and Player 2 (Yellow)
    this.playerSymbols = ['R', 'B']; // 'R' for Red, 'B' for Yellow
    this.board = this.createBoard(); // 7 columns x 6 rows
    this.attractDropInterval = 60; // Frame count between drops in attract mode
    this.attractCounter = 0;

    this.counter = 0;
    this.blinkOn = true;
  }

  createBoard() {
    // 7 columns and 6 rows, filled with null initially
    return Array.from({ length: this.columns }, () => Array(this.rows).fill(null));
  }

  resetBoard() {
    this.board = this.createBoard();
  }

  gameLoop(deltaTime) {
    this.keyboardInput.update();
    switch (this.gameState) {
      case "attract":
        this.displayAttractMode();
        break;
      case "playerSelect":
        this.displayPlayerSelect();
        break;
      case "playGame":
        this.playGame();
        break;
      case "gameOver":
        this.displayGameOver();
        break;
    }
  }

  displayAttractMode() {
    this.renderBoard();

    const y1 = this.cellHeight * 2 - 10;
    const y2 = this.cellHeight * 3 - 10;
    CanvasUtils.drawText(250, y1, "Welcome to Connect 4!", 4, "blue");
    CanvasUtils.drawText(300, y2, "Press `Enter` to Start", 3, "blue");

    if (this.keyboardInput.getkeysPressed().includes('Enter')) {
      this.resetBoard();
      this.gameState = "playGame";
    } else {
      // Attract mode logic
      if (this.attractCounter++ >= this.attractDropInterval) {
        this.randomDropInAttractMode();
        this.attractCounter = 0;
      }
    }

    if (this.isBoardFull()) {
      this.resetBoard();
    }

  }

  randomDropInAttractMode() {
    const column = Math.floor(Math.random() * 7); // Random column from 0 to 6
    const symbol = this.playerSymbols[this.currentPlayer - 1];
    this.dropChip(column, symbol);
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1; // Alternate players
  }

  displayPlayerSelect() {

    CanvasUtils.drawText(200, 50, "Select Player Mode", 4, "white");
    CanvasUtils.drawText(200, 100, "Press `Enter` to Start", 3, "white");

    if (this.keyboardInput.getkeysPressed().includes('Enter')) {
      this.resetBoard();
      this.gameState = "playGame";
    }
  }

  isBoardFull() {
    for (let col = 0; col < this.columns; col++) {
      for (let row = 0; row < this.rows; row++) {
        if (!this.board[col][row]) {
          return false; // There is at least one empty slot
        }
      }
    }
    return true; // All slots are filled
  }

  playGame() {
    this.renderBoard();
    CanvasUtils.drawText(20, 20, `Player ${this.currentPlayer}'s Turn`, 3, "white");

    for (let i = 0; i < 7; i++) {
      if (this.keyboardInput.getkeysPressed().includes(`Digit${i + 1}`)) {
        const column = i;
        const symbol = this.playerSymbols[this.currentPlayer - 1];
        if (this.dropChip(column, symbol)) {
          if (this.checkWin(symbol)) {
            this.gameState = "gameOver";
          } else if (this.isBoardFull()) {
            // If board is full and no winner, it's a draw
            this.gameState = "gameOver";
          } else {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
          }
        }
      }
    }
  }

  dropChip(column, symbol) {

    for (let row = 5; row >= 0; row--) {
      if (!this.board[column][row]) {
        this.board[column][row] = symbol;
        return true;
      }
    }
    return false; // Column is full
  }

  checkWin(symbol) {
    // Check horizontal, vertical, diagonal
    return this.checkHorizontal(symbol) || this.checkVertical(symbol) || this.checkDiagonal(symbol);
  }

  checkHorizontal(symbol) {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.board[col][row] === symbol && this.board[col + 1][row] === symbol &&
          this.board[col + 2][row] === symbol && this.board[col + 3][row] === symbol) {
          return true;
        }
      }
    }
    return false;
  }

  checkVertical(symbol) {
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 3; row++) {
        if (this.board[col][row] === symbol && this.board[col][row + 1] === symbol &&
          this.board[col][row + 2] === symbol && this.board[col][row + 3] === symbol) {
          return true;
        }
      }
    }
    return false;
  }

  checkDiagonal(symbol) {
    // Check diagonals (both / and \)
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 3; row++) {
        if ((this.board[col][row] === symbol && this.board[col + 1][row + 1] === symbol &&
          this.board[col + 2][row + 2] === symbol && this.board[col + 3][row + 3] === symbol) ||
          (this.board[col][row + 3] === symbol && this.board[col + 1][row + 2] === symbol &&
            this.board[col + 2][row + 1] === symbol && this.board[col + 3][row] === symbol)) {
          return true;
        }
      }
    }
    return false;
  }

  renderBoard() {
    const over = 110;
    for (let col = 0; col < this.columns; col++) {
      const x = col * this.cellWidth + over;
      const y = 10;
      CanvasUtils.drawNumber(x, y, col + 1, 5, "blue", 0)
    }

    const offset = 65;
    for (let col = 0; col < this.columns; col++) {
      for (let row = 0; row < this.rows; row++) {
        const x = col * this.cellWidth + offset;
        const y = row * this.cellHeight + offset;
        const symbol = this.board[col][row];
        CanvasUtils.drawCircle2(x, y, 40, symbol === 'R' ? "red" : symbol === 'B' ? "black" : "yellow");
      }
    }

    for (let col = 0; col <= this.columns; col++) {
      // Vertical lines
      //const x = col * (canvasConfig.width / this.columns);
      const x = col * this.cellWidth;
      CanvasUtils.drawLineFromPoints({ x, y: 0 }, { x, y: canvasConfig.height }, this.lineWidth, "yellow");
    }
    for (let row = 0; row <= this.rows; row++) {
      // Horizontal lines
      const y = row * this.cellHeight;
      CanvasUtils.drawLineFromPoints({ x: 0, y }, { x: canvasConfig.width, y }, this.lineWidth, "yellow");
    }

  }

  displayGameOver() {
    this.renderBoard();

    let x2 = 310;
    // Determine the game over message (win or draw)
    let message = '';
    const symbol = this.playerSymbols[this.currentPlayer - 1];
    const color = symbol === 'R' ? "red" : symbol === 'B' ? "black" : "yellow";

    if (this.isBoardFull() && !this.checkWin('R') && !this.checkWin('B')) {
      message = "It's a Draw!";
      x2 += 85;  // Adjust x2 for draw message if needed
    } else {
      message = "The winner is: `" + color + "`";
    }

    // Set the vertical positions for the text
    const y1 = this.cellHeight * 2 - 10;
    const y2 = this.cellHeight * 3 - 10;
    const y3 = this.cellHeight * 4 - 10;

    // Display "Game Over" text
    CanvasUtils.drawText(400, y1, "Game Over", 4, "red");

    // Blink the winner or draw message
    if (this.counter++ > 10) {
      this.counter = 0;       // Reset counter after 10 frames
      this.blinkOn = !this.blinkOn;  // Toggle the blink state
    }

    if (this.blinkOn) {
      CanvasUtils.drawText(x2, y2, message, 3, "blue");
    }

    // Display restart message
    CanvasUtils.drawText(280, y3, "Press `Enter` to Restart", 3, "blue");

    // Check for restart input
    if (this.keyboardInput.getkeysPressed().includes('Enter')) {
      this.resetBoard();
      this.gameState = "attract";
    }
  }

}

export default Game;

const game = new Game();
