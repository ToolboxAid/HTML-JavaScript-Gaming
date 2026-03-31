/*
Toolbox Aid
David Quesenberry
03/31/2026
TilemapViewerScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Camera2D } from '../../../engine/camera/index.js';
import { Tilemap, renderTilemap } from '../../../engine/tilemap/index.js';

const theme = new Theme(ThemeTokens);

export default class TilemapViewerScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 40, y: 180 };
    this.panSpeed = 420;
    this.tilemap = new Tilemap({
      tileSize: 48,
      tiles: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,2,2,2,0,0,3,3,0,0,4,4,0,0,2,2,0,0,3,3,0,0,4,4,0,0,2,2,0,0,1],
        [1,0,2,0,2,0,0,3,0,3,0,4,0,4,0,2,0,2,0,3,0,3,0,4,0,4,0,2,0,2,0,1],
        [1,0,2,2,2,0,0,3,3,3,0,4,4,4,0,2,2,2,0,3,3,3,0,4,4,4,0,2,2,2,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,4,4,0,0,2,2,0,0,3,3,0,0,4,4,0,0,2,2,0,0,3,3,0,0,4,4,0,0,2,1],
        [1,0,4,0,4,0,2,0,2,0,3,0,3,0,4,0,4,0,2,0,2,0,3,0,3,0,4,0,4,0,2,1],
        [1,0,4,4,4,0,2,2,2,0,3,3,3,0,4,4,4,0,2,2,2,0,3,3,3,0,4,4,4,0,2,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,3,3,3,0,4,4,0,0,2,2,0,0,3,3,0,0,4,4,0,0,2,2,0,0,3,3,0,0,4,1],
        [1,0,3,0,3,0,4,0,4,0,2,0,2,0,3,0,3,0,4,0,4,0,2,0,2,0,3,0,3,0,4,1],
        [1,0,3,3,3,0,4,4,4,0,2,2,2,0,3,3,3,0,4,4,4,0,2,2,2,0,3,3,3,0,4,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,2,2,0,0,3,3,0,0,4,4,0,0,2,2,0,0,3,3,0,0,4,4,0,0,2,2,0,0,3,1],
        [1,0,2,0,2,0,3,0,3,0,4,0,4,0,2,0,2,0,3,0,3,0,4,0,4,0,2,0,2,0,3,1],
        [1,0,2,2,2,0,3,3,3,0,4,4,4,0,2,2,2,0,3,3,3,0,4,4,4,0,2,2,2,0,3,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,4,4,0,0,2,2,0,0,3,3,0,0,4,4,0,0,2,2,0,0,3,3,0,0,4,4,0,0,2,1],
        [1,0,4,0,4,0,2,0,2,0,3,0,3,0,4,0,4,0,2,0,2,0,3,0,3,0,4,0,4,0,2,1],
        [1,0,4,4,4,0,2,2,2,0,3,3,3,0,4,4,4,0,2,2,2,0,3,3,3,0,4,4,4,0,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      ],
      palette: {
        0: '#111827',
        1: '#4f46e5',
        2: '#0ea5e9',
        3: '#22c55e',
        4: '#f59e0b',
      },
    });
    this.world = {
      width: this.tilemap.width * this.tilemap.tileSize,
      height: this.tilemap.height * this.tilemap.tileSize,
    };
    this.camera = new Camera2D({
      viewportWidth: 860,
      viewportHeight: 300,
      worldWidth: this.world.width,
      worldHeight: this.world.height,
    });
  }

  update(dt, engine) {
    const pan = this.panSpeed * dt;

    if (engine.input.isDown('ArrowLeft')) this.camera.x -= pan;
    if (engine.input.isDown('ArrowRight')) this.camera.x += pan;
    if (engine.input.isDown('ArrowUp')) this.camera.y -= pan;
    if (engine.input.isDown('ArrowDown')) this.camera.y += pan;

    this.camera.clampToWorld();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1201 - Tilemap Viewer',
      'Viewer-only runtime with camera panning over a larger tilemap',
      'Arrow Keys pan the viewer (Left/Right/Up/Down)',
      'No hero, jump, collision feature, or parallax behavior',
      'Use this as the scrollable visual baseline for Phase 12',
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);

    const tileScreen = {
      x: this.screen.x - this.camera.x,
      y: this.screen.y - this.camera.y,
    };
    renderTilemap(renderer, this.tilemap, tileScreen);

    drawPanel(renderer, 620, 34, 300, 126, 'Tilemap', [
      `Grid: ${this.tilemap.width}x${this.tilemap.height}`,
      `Tile Size: ${this.tilemap.tileSize}`,
      `Camera: ${this.camera.x.toFixed(1)}, ${this.camera.y.toFixed(1)}`,
      'Mode: Viewer-only',
      'Controls: Arrow Keys pan viewer',
    ]);
  }
}
