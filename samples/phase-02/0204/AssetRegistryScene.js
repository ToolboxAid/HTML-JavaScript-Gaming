/*
Toolbox Aid
David Quesenberry
03/21/2026
AssetRegistryScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { AssetRegistry } from '/src/engine/assets/index.js';

const theme = new Theme(ThemeTokens);

const sampleAssets = [
  { id: 'playerSprite', type: 'image', path: '/assets/player.png', status: 'registered' },
  { id: 'pickupSprite', type: 'image', path: '/assets/pickup.png', status: 'registered' },
  { id: 'menuMusic', type: 'audio', path: '/assets/menu-theme.mp3', status: 'registered' },
  { id: 'levelOneData', type: 'data', path: '/assets/level-one.json', status: 'registered' },
];

export default class AssetRegistryScene extends Scene {
  constructor() {
    super();
    this.registry = new AssetRegistry();
    this.registry.registerMany(sampleAssets);
  }

  update() {}

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample 0204',
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
