/*
Toolbox Aid
David Quesenberry
03/22/2026
UIFrameworkScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame } from '../../engine/debug/index.js';
import { UIFramework } from '../../engine/ui/index.js';

const theme = new Theme(ThemeTokens);

export default class UIFrameworkScene extends Scene {
  constructor() {
    super();
    this.ui = new UIFramework();
    this.count = 0;
    this.message = 'Click the canvas buttons to prove UI layout and interaction.';
    this.buildUi();
  }

  buildUi() {
    this.ui.clear();
    this.ui.addPanel({
      id: 'panel',
      x: 620,
      y: 34,
      width: 300,
      height: 180,
      fill: 'rgba(20, 24, 38, 0.92)',
    });
    this.ui.addLabel({ id: 'title', x: 632, y: 44, text: 'UI Framework', textColor: '#ffffff' });
    this.ui.addLabel({ id: 'count-label', x: 632, y: 82, text: `Counter: ${this.count}`, textColor: '#d0d5ff' });
    this.ui.addLabel({ id: 'message-label', x: 632, y: 116, text: this.message, textColor: '#d0d5ff' });
    this.ui.addButton({
      id: 'increment',
      x: 100,
      y: 260,
      width: 180,
      height: 44,
      text: 'Increment',
      fill: '#0f766e',
      onClick: () => {
        this.count += 1;
        this.message = 'Increment button fired through the UI framework.';
        this.buildUi();
      },
    });
    this.ui.addButton({
      id: 'reset',
      x: 320,
      y: 260,
      width: 180,
      height: 44,
      text: 'Reset',
      fill: '#7c2d12',
      onClick: () => {
        this.count = 0;
        this.message = 'Reset button fired through the UI framework.';
        this.buildUi();
      },
    });
  }

  handleCanvasClick(x, y) {
    return this.ui.click(x, y);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample127',
      'Canvas UI layout and input routing stay inside a reusable UI framework.',
      this.message,
    ]);

    this.ui.render(renderer);
  }
}
