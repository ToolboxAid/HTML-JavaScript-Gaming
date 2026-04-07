/*
Toolbox Aid
David Quesenberry
03/21/2026
SpriteAtlasImageRenderingScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js';
import { renderSpriteReadyEntities } from '../../../src/engine/render/index.js';
import { SpriteAtlas, ImageAssetLoader } from '../../../src/engine/assets/index.js';

const theme = new Theme(ThemeTokens);

export default class SpriteAtlasImageRenderingScene extends Scene {
  constructor() {
    super();
    this.loader = new ImageAssetLoader();
    this.loader.load('playerSheet', '/assets/player-sheet.png');

    this.atlas = new SpriteAtlas({
      imagePath: '/assets/player-sheet.png',
      frames: {
        idle_0: { color: '#7dd3fc' },
        idle_1: { color: '#60a5fa' },
        walk_0: { color: '#34d399' },
        walk_1: { color: '#10b981' },
      },
    });

    this.entities = [
      { x: 140, y: 260, width: 64, height: 64, atlas: 'playerSheet', frame: 'idle_0', label: 'idle_0' },
      { x: 280, y: 260, width: 64, height: 64, atlas: 'playerSheet', frame: 'idle_1', label: 'idle_1' },
      { x: 420, y: 260, width: 64, height: 64, atlas: 'playerSheet', frame: 'walk_0', label: 'walk_0' },
      { x: 560, y: 260, width: 64, height: 64, atlas: 'playerSheet', frame: 'walk_1', label: 'walk_1' },
    ];
  }

  update() {}

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample 01219',
      'Demonstrates sprite atlas frame lookup and image-loader-ready output',
      'Current rendering uses safe frame-color proxies instead of real image blits',
      'This sample defines the engine contract for atlas + frame based rendering',
      'Each entity references atlas/frame instead of raw color only',
    ]);

    renderSpriteReadyEntities(renderer, this.entities, {
      label: true,
      labelOffsetY: 86,
      getFrameColor: (entity) => this.atlas.getFrame(entity.frame)?.color || '#8888ff',
    });

    drawPanel(renderer, 620, 184, 300, 126, 'Atlas', [
      `Image: ${this.atlas.imagePath}`,
      `Frames: ${this.atlas.getFrameNames().length}`,
      `Loader status: ${this.loader.get('playerSheet')?.status || 'none'}`,
      'Next step: real image blitting',
    ]);
  }
}
