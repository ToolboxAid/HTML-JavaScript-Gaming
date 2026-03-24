/*
Toolbox Aid
David Quesenberry
03/22/2026
AssetLoaderSystemScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class AssetLoaderSystemScene extends Scene {
  constructor(loaderSystem) {
    super();
    this.loaderSystem = loaderSystem;
    this.message = 'Assets are loading through engine-owned orchestration.';
  }

  update() {
    if (this.loaderSystem.status === 'ready') {
      this.message = 'Asset loader is ready. The sample scene only reads the snapshot.';
    } else if (this.loaderSystem.status === 'error') {
      this.message = `Asset loader reported an error: ${this.loaderSystem.lastError?.message ?? 'unknown'}`;
    }
  }

  render(renderer) {
    const snapshot = this.loaderSystem.getSnapshot();
    drawFrame(renderer, theme, [
      'Engine Sample94',
      'Asset loading is orchestrated through engine-owned contracts with visible lifecycle state.',
      this.message,
    ]);

    drawPanel(renderer, 60, 180, 840, 220, 'Asset Loader System', snapshot.map((entry) => {
      const width = entry.asset?.width ?? 0;
      const height = entry.asset?.height ?? 0;
      return `${entry.id} | ${entry.type} | ${entry.status} | ${width}x${height}`;
    }).slice(0, 8));

    renderer.drawText(`Loader status: ${this.loaderSystem.status}`, 60, 432, {
      color: theme.getColor('textCanvs'),
      font: '16px monospace',
    });
  }
}
