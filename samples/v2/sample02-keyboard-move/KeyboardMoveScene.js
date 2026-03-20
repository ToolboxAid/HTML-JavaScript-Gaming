export default class KeyboardMoveScene {
  constructor() {
    this.bounds = {
      x: 180,
      y: 160,
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

    this.textColor = '#dddddd';
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

    renderer.clear();
    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#dddddd', 2);
    renderer.drawRect(this.box.x, this.box.y, this.box.width, this.box.height, '#ed9700');

    renderer.drawText('Engine V2 Sample02', this.textStartX, this.textStartY, {
      color: this.textColor,
      font: '20px Arial',
    });

    const lines = [
      'Demonstrates the keyboard input boundary',
      'Use Arrow keys to move the box in four directions',
      'Observe movement driven by input state, not DOM events in the scene',
      'This sample reads InputService through a clean scene boundary',
    ];

    lines.forEach((line, index) => {
      renderer.drawText(line, this.textStartX, this.textStartY + this.textLineHeight * (index + 1), {
        color: this.textColor,
        font: '16px Arial',
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
