/*
Toolbox Aid
David Quesenberry
03/31/2026
TilemapHeroMovementScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { clamp } from '/src/engine/utils/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Camera2D, worldRectToScreen } from '/src/engine/camera/index.js';
import { Tilemap, renderTilemap } from '/src/engine/tilemap/index.js';

const theme = new Theme(ThemeTokens);

export default class TilemapHeroMovementScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 40, y: 180 };
    this.heroSpeed = 260;
    this.tilemap = new Tilemap({
      tileSize: 48,
      tiles: buildTiles(42, 12),
      palette: {
        0: '#111827',
        1: '#4f46e5',
        2: '#0ea5e9',
        3: '#22c55e',
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
    this.fixedCameraY = (this.world.height - this.camera.viewportHeight) * 0.5;
    this.hero = {
      x: 120,
      y: this.world.height * 0.5 - 18,
      width: 36,
      height: 36,
    };
  }

  update(dt, engine) {
    const movingLeft = engine.input.isDown('ArrowLeft');
    const movingRight = engine.input.isDown('ArrowRight');
    const direction = (movingRight ? 1 : 0) - (movingLeft ? 1 : 0);

    this.hero.x += direction * this.heroSpeed * dt;
    this.hero.x = clamp(this.hero.x, 0, this.world.width - this.hero.width);

    this.camera.x = this.hero.x + this.hero.width * 0.5 - this.camera.viewportWidth * 0.5;
    this.camera.y = this.fixedCameraY;
    this.camera.clampToWorld();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1202 - Tilemap Hero Movement',
      'Left/Right hero traversal only',
      'Camera follows hero horizontally on a larger tilemap',
      'No jump, gravity/platforming, collision feature, or parallax',
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);

    const tileScreen = {
      x: this.screen.x - this.camera.x,
      y: this.screen.y - this.camera.y,
    };
    renderTilemap(renderer, this.tilemap, tileScreen);

    const heroScreen = worldRectToScreen(this.camera, this.hero, this.screen.x, this.screen.y);
    renderer.drawRect(heroScreen.x, heroScreen.y, heroScreen.width, heroScreen.height, theme.getColor('actorFill'));
    renderer.strokeRect(heroScreen.x, heroScreen.y, heroScreen.width, heroScreen.height, '#ffffff', 1);

    drawPanel(renderer, 620, 34, 300, 126, 'Hero', [
      `World: ${this.tilemap.width}x${this.tilemap.height} tiles`,
      `Hero X: ${this.hero.x.toFixed(1)}`,
      `Camera X: ${this.camera.x.toFixed(1)}`,
      'Controls: Left/Right Arrow',
    ]);
  }
}

function buildTiles(width, height) {
  const tiles = Array.from({ length: height }, () => Array.from({ length: width }, () => 0));

  for (let x = 0; x < width; x += 1) {
    tiles[0][x] = 1;
    tiles[height - 1][x] = 1;
  }
  for (let y = 0; y < height; y += 1) {
    tiles[y][0] = 1;
    tiles[y][width - 1] = 1;
  }

  const bandRows = [2, 3, 8, 9];
  for (const row of bandRows) {
    for (let x = 2; x < width - 2; x += 1) {
      tiles[row][x] = (x % 6 < 3) ? 2 : 3;
    }
  }

  for (let x = 4; x < width - 4; x += 7) {
    tiles[5][x] = 2;
    tiles[6][x] = 3;
  }

  return tiles;
}
