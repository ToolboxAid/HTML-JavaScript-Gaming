/*
Toolbox Aid
David Quesenberry
03/31/2026
TilemapViewerScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Tilemap, renderTilemap } from '../../../engine/tilemap/index.js';

const theme = new Theme(ThemeTokens);

export default class TilemapViewerScene extends Scene {
  constructor() {
    super();
    this.offset = { x: 192, y: 120 };
    this.tilemap = new Tilemap({
      tileSize: 48,
      tiles: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 2, 2, 0, 0, 0, 2, 2, 0, 0, 1],
        [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 2, 0, 2, 0, 2, 0, 0, 0, 1],
        [1, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      palette: {
        0: '#111827',
        1: '#4f46e5',
        2: '#0ea5e9',
      },
    });
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1201 - Tilemap Viewer',
      'Viewer-only runtime: static tilemap render',
      'No hero, movement, jump, collision behavior, or parallax',
      'Use this as the visual baseline for later Phase 12 samples',
    ]);

    renderTilemap(renderer, this.tilemap, this.offset);

    drawPanel(renderer, 620, 34, 300, 126, 'Tilemap', [
      `Grid: ${this.tilemap.width}x${this.tilemap.height}`,
      `Tile Size: ${this.tilemap.tileSize}`,
      'Mode: Viewer-only',
      'Controls: none',
    ]);
  }
}
