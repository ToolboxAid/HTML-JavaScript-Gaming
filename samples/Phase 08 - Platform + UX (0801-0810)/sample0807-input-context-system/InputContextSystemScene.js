/*
Toolbox Aid
David Quesenberry
03/22/2026
InputContextSystemScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class InputContextSystemScene extends Scene {
  constructor() {
    super();
    this.playerX = 180;
    this.menuIndex = 0;
    this.status = 'Switch contexts and watch the same keys resolve differently.';
  }

  onContextChanged(context) {
    if (context === 'gameplay') {
      this.status = 'Gameplay context active. Arrow keys now move the blue square.';
      return;
    }

    this.status = 'Menu context active. Arrow keys now change the green menu selection.';
  }

  update(dtSeconds, engine) {
    const input = engine.input;
    if (!input) {
      return;
    }

    if (input.getContext() === 'gameplay') {
      if (input.isActionDown('move_left')) this.playerX -= 180 * dtSeconds;
      if (input.isActionDown('move_right')) this.playerX += 180 * dtSeconds;
      this.playerX = Math.max(110, Math.min(520, this.playerX));
    } else {
      if (input.isActionPressed('select_left')) this.menuIndex = Math.max(0, this.menuIndex - 1);
      if (input.isActionPressed('select_right')) this.menuIndex = Math.min(2, this.menuIndex + 1);
    }
  }

  render(renderer, engine) {
    const context = engine.input?.getContext?.() || 'none';
    const gameplayActive = context === 'gameplay';
    drawFrame(renderer, theme, [
      'Engine sample 0807',
      'Input routing swaps action maps through a reusable context service.',
      this.status,
    ]);

    renderer.drawRect(90, 230, 480, 150, gameplayActive ? '#111827' : '#16302b');
    renderer.drawRect(this.playerX, 310, 42, 42, gameplayActive ? '#38bdf8' : '#475569');
    for (let index = 0; index < 3; index += 1) {
      const selected = this.menuIndex === index;
      const color = selected
        ? (gameplayActive ? '#64748b' : '#34d399')
        : '#475569';
      renderer.drawRect(120 + index * 120, 250, 80, 30, color);
    }

    drawPanel(renderer, 620, 34, 300, 170, 'Input Context', [
      `Active Context: ${context}`,
      `Player X: ${this.playerX.toFixed(0)}`,
      `Menu Index: ${this.menuIndex}`,
      gameplayActive
        ? 'Gameplay mode: movement input is live.'
        : 'Menu mode: selection input is live.',
      gameplayActive
        ? 'Menu selection is visually muted.'
        : 'Player movement is visually muted.',
      'Switch contexts with the buttons below.',
    ]);
  }
}
