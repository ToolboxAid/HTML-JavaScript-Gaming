import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { drawFrame, drawPanel } from './shared.js';
import { buildSampleAssetRegistry } from './assetRegistry.js';

const theme = new Theme(ThemeTokens);

export default class AssetRegistryScene extends Scene {
  constructor() {
    super();
    this.registry = buildSampleAssetRegistry();
  }

  update() {}

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine V2 Sample28',
      'Demonstrates a centralized asset registry pattern before real loading is added',
      'The registry stores identifiers, asset types, paths, and status values',
      'This helps separate content references from scene logic and engine flow',
      'A future loader can resolve these registered definitions into live resources',
    ]);

    const entries = this.registry.entries();
    drawPanel(renderer, 60, 176, 840, 290, 'Registered Assets', entries.map(([id, definition]) => {
      return `${id} | ${definition.type} | ${definition.path} | ${definition.status}`;
    }).slice(0, 9));

    renderer.drawText(`Total registered assets: ${this.registry.count()}`, 60, 494, {
      color: theme.getColor('textCanvs'),
      font: '16px monospace',
    });
  }
}
