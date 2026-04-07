/*
Toolbox Aid
David Quesenberry
03/22/2026
QuestSystemScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { QuestSystem } from '../../../engine/world/index.js';

const theme = new Theme(ThemeTokens);

export default class QuestSystemScene extends Scene {
  constructor() {
    super();
    this.player = { x: 120, y: 280, width: 34, height: 34 };
    this.items = [
      { x: 380, y: 286, width: 24, height: 24, collected: false },
      { x: 640, y: 286, width: 24, height: 24, collected: false },
    ];
    this.quests = new QuestSystem([{ id: 'collect_orbs', title: 'Collect Orbs', required: 2 }]);
  }

  update(dt, engine) {
    const move = 220 * dt;
    if (engine.input.isActionDown('move_left')) this.player.x -= move;
    if (engine.input.isActionDown('move_right')) this.player.x += move;
    this.player.x = Math.max(40, Math.min(880, this.player.x));

    this.items.forEach((item) => {
      const overlap = this.player.x < item.x + item.width && this.player.x + this.player.width > item.x;
      if (!item.collected && overlap && engine.input.isActionPressed('interact')) {
        item.collected = true;
        this.quests.advance('collect_orbs');
      }
    });
  }

  render(renderer) {
    const quest = this.quests.get('collect_orbs');
    drawFrame(renderer, theme, [
      'Engine sample 0606',
      'Quest progression is tracked by an engine-owned quest system instead of scene counters.',
      'Move to each orb and press Space.',
    ]);

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, '#34d399');
    this.items.forEach((item) => {
      if (!item.collected) {
        renderer.drawRect(item.x, item.y, item.width, item.height, '#fbbf24');
      }
    });

    drawPanel(renderer, 620, 34, 300, 126, 'Quest System', [
      `Quest: ${quest.title}`,
      `Progress: ${quest.progress}/${quest.required}`,
      `Completed: ${quest.completed}`,
      'Collect all orbs to finish.',
    ]);
  }
}
