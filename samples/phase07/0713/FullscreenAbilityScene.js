/*
Toolbox Aid
David Quesenberry
03/22/2026
FullscreenAbilityScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';

const theme = new Theme(ThemeTokens);

export default class FullscreenAbilityScene extends Scene {
  constructor() {
    super();
    this.bounds = {
      x: 70,
      y: 180,
      width: 820,
      height: 270,
    };
    this.box = {
      x: 160,
      y: 250,
      width: 68,
      height: 68,
      velocityX: 220,
    };
    this.canvasButtons = [
      { id: 'enter', x: 70, y: 470, width: 220, height: 40, label: 'Enter Fullscreen' },
      { id: 'exit', x: 310, y: 470, width: 220, height: 40, label: 'Exit Fullscreen' },
    ];
    this.statusLines = [];
  }

  getCanvasButtons() {
    return this.canvasButtons;
  }

  async handleCanvasClick(x, y, engine) {
    const button = this.canvasButtons.find((entry) => (
      x >= entry.x &&
      x <= entry.x + entry.width &&
      y >= entry.y &&
      y <= entry.y + entry.height
    ));

    if (!button) {
      return false;
    }

    if (button.id === 'enter') {
      await engine.fullscreen.request();
      return true;
    }

    if (button.id === 'exit') {
      await engine.fullscreen.exit();
      return true;
    }

    return false;
  }

  update(dtSeconds, engine) {
    this.box.x += this.box.velocityX * dtSeconds;
    const minX = this.bounds.x;
    const maxX = this.bounds.x + this.bounds.width - this.box.width;
    if (this.box.x <= minX || this.box.x >= maxX) {
      this.box.x = Math.max(minX, Math.min(maxX, this.box.x));
      this.box.velocityX *= -1;
    }

    const fullscreen = engine.fullscreen.getState();
    this.statusLines = [
      `Supported: ${fullscreen.supported}`,
      `Available: ${fullscreen.available}`,
      `Active: ${fullscreen.active}`,
      `Last Error: ${fullscreen.lastError || 'none'}`,
    ];
  }

  render(renderer, engine) {
    const { width, height } = renderer.getCanvasSize();
    const fullscreen = engine.fullscreen.getState();
    const pad = 10;

    renderer.clear(theme.getColor('canvasBackground'));
    renderer.strokeRect(pad, pad, width - pad * 2, height - pad * 2, '#dddddd', 2);
    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, fullscreen.active ? '#34d399' : '#d8d5ff', 3);
    renderer.drawRect(this.box.x, this.box.y, this.box.width, this.box.height, fullscreen.active ? '#fbbf24' : theme.getColor('actorFill'));

    const lines = [
      'Engine sample 0713',
      'Demonstrates reusable fullscreen enter, exit, and state reporting.',
      'Use the fullscreen buttons below or click the matching buttons on the canvas.',
      fullscreen.active ? 'Fullscreen is active.' : 'Running in windowed mode.',
      fullscreen.lastError || 'No fullscreen errors reported.',
    ];

    lines.forEach((line, index) => {
      renderer.drawText(line, 40, 48 + 24 * index, {
        color: theme.getColor('textCanvs'),
        font: '16px monospace',
      });
    });

    this.statusLines.forEach((line, index) => {
      renderer.drawText(line, 620, 220 + index * 26, {
        color: '#d0d5ff',
        font: '15px monospace',
      });
    });

    this.canvasButtons.forEach((button) => {
      const fill = button.id === 'enter' ? '#0f766e' : '#7c2d12';
      renderer.drawRect(button.x, button.y, button.width, button.height, fill);
      renderer.strokeRect(button.x, button.y, button.width, button.height, '#f8fafc', 2);
      renderer.drawText(button.label, button.x + button.width / 2, button.y + 25, {
        color: '#ffffff',
        font: '16px monospace',
        textAlign: 'center',
      });
    });
  }
}
