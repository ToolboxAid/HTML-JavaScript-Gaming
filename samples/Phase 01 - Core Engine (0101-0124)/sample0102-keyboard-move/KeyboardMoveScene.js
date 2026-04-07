/*
Toolbox Aid
David Quesenberry
03/21/2026
KeyboardMoveScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';

const theme = new Theme(ThemeTokens);

export default class KeyboardMoveScene extends Scene {
  constructor() {
    super();

    this.bounds = {
      x: 180,
      y: 180,
      width: 600,
      height: 260,
    };

    this.box = {
      x: this.bounds.x + this.bounds.width / 2 - 20,
      y: this.bounds.y + this.bounds.height / 2 - 20,
      width: 40,
      height: 40,
      speed: 240,
    };

    this.textStartX = 40;
    this.textStartY = 50;
    this.textLineHeight = 24;
  }

  update(deltaTime, engine) {
    const input = engine?.input;
    if (!input || typeof input.isDown !== 'function') {
      return;
    }

    const distance = this.box.speed * deltaTime;

    if (input.isDown('ArrowLeft')) {
      this.box.x -= distance;
    }

    if (input.isDown('ArrowRight')) {
      this.box.x += distance;
    }

    if (input.isDown('ArrowUp')) {
      this.box.y -= distance;
    }

    if (input.isDown('ArrowDown')) {
      this.box.y += distance;
    }

    this.clampBoxToBounds();
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    renderer.clear(theme.getColor('canvasBackground'));
    renderer.strokeRect(10, 10, width - 20, height - 20, '#dddddd', 2);
    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 3);
    renderer.drawRect(this.box.x, this.box.y, this.box.width, this.box.height, theme.getColor('actorFill'));

    const lines = [
      'Engine Sample 0102',
      'Demonstrates the keyboard input boundary',
      'Use Arrow keys to move the box in four directions',
      'Observe movement driven by input state, not DOM events in the scene',
      'This sample now matches the shared themed sample style',
    ];

    lines.forEach((line, index) => {
      renderer.drawText(line, this.textStartX, this.textStartY + this.textLineHeight * index, {
        color: theme.getColor('textCanvs'),
        font: '16px monospace',
      });
    });
  }

  clampBoxToBounds() {
    const minX = this.bounds.x;
    const minY = this.bounds.y;
    const maxX = this.bounds.x + this.bounds.width - this.box.width;
    const maxY = this.bounds.y + this.bounds.height - this.box.height;

    this.box.x = Math.max(minX, Math.min(this.box.x, maxX));
    this.box.y = Math.max(minY, Math.min(this.box.y, maxY));
  }
}
