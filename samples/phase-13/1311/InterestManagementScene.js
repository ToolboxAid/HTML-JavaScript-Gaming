/*
Toolbox Aid
David Quesenberry
03/22/2026
InterestManagementScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { InterestManager } from '/src/engine/network/index.js';

const theme = new Theme(ThemeTokens);

export default class InterestManagementScene extends Scene {
  constructor() {
    super();
    this.manager = new InterestManager();
    this.viewerA = { id: 'viewer-a', x: 180, y: 280 };
    this.viewerB = { id: 'viewer-b', x: 700, y: 280 };
    this.entities = [
      { id: 'tree', x: 230, y: 260 },
      { id: 'npc', x: 350, y: 290 },
      { id: 'crate', x: 640, y: 300 },
      { id: 'portal', x: 770, y: 250 },
    ];
  }

  render(renderer) {
    const visibleA = this.manager.filterForViewer(this.viewerA, [this.viewerA, ...this.entities], { radius: 170 });
    const visibleB = this.manager.filterForViewer(this.viewerB, [this.viewerB, ...this.entities], { radius: 170 });
    drawFrame(renderer, theme, [
      'Engine Sample 0110',
      'Interest management filters replicated state by relevance instead of sending every entity to every client.',
      'Blue and green viewers receive different subsets of the same world.',
    ]);
    renderer.drawRect(80, 220, 800, 180, '#0f172a');
    renderer.drawRect(this.viewerA.x, this.viewerA.y, 28, 28, '#38bdf8');
    renderer.drawRect(this.viewerB.x, this.viewerB.y, 28, 28, '#22c55e');
    this.entities.forEach((entity) => {
      renderer.drawRect(entity.x, entity.y, 22, 22, '#f59e0b');
    });
    drawPanel(renderer, 620, 40, 250, 180, 'Interest Sets', [
      `Viewer A: ${visibleA.map((entity) => entity.id).join(', ')}`,
      `Viewer B: ${visibleB.map((entity) => entity.id).join(', ')}`,
      `World Entities: ${this.entities.length}`,
    ]);
  }
}
