/*
Toolbox Aid
David Quesenberry
03/22/2026
AchievementsSystemScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { AchievementSystem } from '/src/engine/world/index.js';

const theme = new Theme(ThemeTokens);

export default class AchievementsSystemScene extends Scene {
  constructor() {
    super();
    this.coins = 0;
    this.achievements = new AchievementSystem([
      { id: 'first_coin', title: 'First Coin', condition: ({ coins }) => coins >= 1 },
      { id: 'collector', title: 'Collector', condition: ({ coins }) => coins >= 3 },
    ]);
  }

  update(_dt, engine) {
    if (engine.input.isActionPressed('collect') && this.coins < 3) {
      this.coins += 1;
      this.achievements.evaluate({ coins: this.coins });
    }
  }

  render(renderer) {
    const unlocked = this.achievements.getAll().filter((entry) => entry.unlocked);
    drawFrame(renderer, theme, [
      'Engine sample 0710',
      'Achievements unlock through reusable engine-owned milestone evaluation.',
      'Press C to collect coins and unlock milestones.',
    ]);
    drawPanel(renderer, 60, 180, 840, 180, 'Achievements System', this.achievements.getAll().map((entry) => {
      return `${entry.title} | ${entry.unlocked ? 'Unlocked' : 'Locked'}`;
    }));
    drawPanel(renderer, 620, 34, 300, 126, 'Progress', [
      `Coins: ${this.coins}`,
      `Unlocked: ${unlocked.length}`,
      'Milestones are data-driven.',
      'Scene only updates context.',
    ]);
  }
}
