import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { DebugPanel } from '../../../engine/v2/debug/index.js';
import { AssetRegistry } from '../../../engine/v2/assets/index.js';

const theme = new Theme(ThemeTokens);

function buildSampleAssetRegistry() {
  const registry = new AssetRegistry();

  registry.register('playerSprite', {
    type: 'image',
    path: '/assets/player.png',
    status: 'registered',
  });

  registry.register('pickupSprite', {
    type: 'image',
    path: '/assets/pickup.png',
    status: 'registered',
  });

  registry.register('menuMusic', {
    type: 'audio',
    path: '/assets/menu-theme.mp3',
    status: 'registered',
  });

  registry.register('levelOneData', {
    type: 'data',
    path: '/assets/level-one.json',
    status: 'registered',
  });

  return registry;
}

export default class AssetRegistryScene extends Scene {
  constructor() {
    super();
    this.registry = buildSampleAssetRegistry();
  }

  update() {}

  render(renderer) {
    DebugPanel.drawFrame(renderer, theme, [
      'Engine V2 Sample28',
      'Demonstrates a centralized asset registry pattern before real loading is added',
      'The registry stores identifiers, asset types, paths, and status values',
      'This helps separate content references from scene logic and engine flow',
      'A future loader can resolve these registered definitions into live resources',
    ]);

    const entries = this.registry.entries();
    DebugPanel.drawPanel(renderer, 60, 176, 840, 290, 'Registered Assets', entries.map(([id, definition]) => {
      return `${id} | ${definition.type} | ${definition.path} | ${definition.status}`;
    }).slice(0, 9));

    renderer.drawText(`Total registered assets: ${this.registry.count()}`, 60, 494, {
      color: theme.getColor('textCanvs'),
      font: '16px monospace',
    });
  }
}
