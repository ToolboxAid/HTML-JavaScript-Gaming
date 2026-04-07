/*
Toolbox Aid
David Quesenberry
03/22/2026
AssetOptimizationScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class AssetOptimizationScene extends Scene {
  constructor(loaderSystem, optimizer) {
    super();
    this.loaderSystem = loaderSystem;
    this.optimizer = optimizer;
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0705',
      'Asset optimization caches repeated loads inside engine-owned asset paths.',
      'The optimizer tracks deduplicated asset entries.',
    ]);
    const snapshot = this.loaderSystem.getSnapshot();
    drawPanel(renderer, 60, 180, 840, 180, 'Asset Optimization', snapshot.map((entry) => {
      return `${entry.id} | ${entry.status} | ${entry.type}`;
    }));
    drawPanel(renderer, 620, 34, 300, 126, 'Optimizer Stats', [
      `Cached assets: ${this.optimizer.stats().cachedAssets}`,
      `Loaded entries: ${snapshot.length}`,
      'Repeated loads reuse cache keys.',
      'Optimization stays engine-owned.',
    ]);
  }
}
