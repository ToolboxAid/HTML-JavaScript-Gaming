// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// attract.js
import CanvasUtils from '../scripts/canvas.js';
import KeyboardInput from '../scripts/keyboard.js';

class AttractScreen {
  constructor(startGameCallback) {
    this.keyboardInput = new KeyboardInput();
    this.startGameCallback = startGameCallback; // Callback function to start the game
  }

  update() {
    this.keyboardInput.update();
    this.drawAttractScreen();

    if (this.keyboardInput.getKeyJustPressed().includes('Enter')) {
      this.startGameCallback(); // Trigger the callback to start the game
    }
  }

  drawAttractScreen() {
    CanvasUtils.ctx.fillStyle = "black";
    CanvasUtils.ctx.fillRect(0, 0, CanvasUtils.ctx.canvas.width, CanvasUtils.ctx.canvas.height);

    CanvasUtils.ctx.fillStyle = "white";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText("Welcome to Snake Game", 150, 150);
    CanvasUtils.ctx.fillText("Press `Enter` to Start", 150, 250);
  }
}

export default AttractScreen;
