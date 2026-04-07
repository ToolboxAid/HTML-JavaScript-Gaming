/*
Toolbox Aid
David Quesenberry
03/22/2026
CutsceneSystemScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js';
import { CutsceneSystem } from '../../../src/engine/world/index.js';

const theme = new Theme(ThemeTokens);

export default class CutsceneSystemScene extends Scene {
  constructor() {
    super();
    this.actor = { x: 140, y: 290, width: 34, height: 34 };
    this.caption = 'Cutscene starting...';
    this.cutscene = new CutsceneSystem({
      steps: [
        {
          duration: 1.0,
          enter: () => { this.caption = 'Step 1: actor walks in.'; },
          update: (dt) => { this.actor.x += 90 * dt; },
        },
        {
          duration: 1.2,
          enter: () => { this.caption = 'Step 2: pause for dialog.'; },
        },
        {
          duration: 1.0,
          enter: () => { this.caption = 'Step 3: actor exits.'; },
          update: (dt) => { this.actor.x += 120 * dt; },
          exit: () => { this.caption = 'Cutscene complete.'; },
        },
      ],
    });
  }

  update(dt) {
    this.cutscene.update(dt, {});
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0608',
      'Timed cutscene sequencing is driven by a reusable engine-owned step system.',
      this.caption,
    ]);

    renderer.drawRect(this.actor.x, this.actor.y, this.actor.width, this.actor.height, '#34d399');
    drawPanel(renderer, 620, 34, 300, 126, 'Cutscene System', [
      `Active: ${this.cutscene.active}`,
      `Current step: ${this.cutscene.index + 1}`,
      this.caption,
      'Steps run enter/update/exit hooks.',
    ]);
  }
}
