/*
Toolbox Aid
David Quesenberry
03/21/2026
TilemapSystemScene.js
*/
import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { clamp } from '../../engine/utils/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { Tilemap, renderTilemap, resolveRectVsTilemap } from '../../engine/tilemap/index.js';

const theme = new Theme(ThemeTokens);

export default class TilemapSystemScene extends Scene {
  constructor() {
    super();
    this.offset = { x: 160, y: 180 };
    this.tilemap = new Tilemap({
      tileSize: 48,
      tiles: [
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,0,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,0,1,1,0,0,1,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1],
      ],
      palette: {
        0: '#1f2937',
        1: '#6366f1',
      },
    });
    this.player = {
      x: this.offset.x + 60,
      y: this.offset.y + 60,
      width: 34,
      height: 34,
      speed: 220,
    };
    this.lastCollision = 'none';
  }

  update(dt, engine) {
    const prev = { x: this.player.x, y: this.player.y };
    const move = this.player.speed * dt;

    if (engine.input.isDown('ArrowLeft')) this.player.x -= move;
    if (engine.input.isDown('ArrowRight')) this.player.x += move;
    if (engine.input.isDown('ArrowUp')) this.player.y -= move;
    if (engine.input.isDown('ArrowDown')) this.player.y += move;

    this.player.x = clamp(this.player.x, this.offset.x, this.offset.x + this.tilemap.width * this.tilemap.tileSize - this.player.width);
    this.player.y = clamp(this.player.y, this.offset.y, this.offset.y + this.tilemap.height * this.tilemap.tileSize - this.player.height);

    const hit = resolveRectVsTilemap(this.player, this.tilemap, this.offset);
    if (hit) {
      this.player.x = prev.x
      this.player.y = prev.y
      this.lastCollision = `tile @ ${hit.x},${hit.y}`
    } else {
      this.lastCollision = 'none'
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine V2 Sample45',
      'Demonstrates tilemap rendering and tile-based collision',
      'Use Arrow keys to move through the open tiles',
      `Collision: ${this.lastCollision}`,
      'This sample provides the first map-driven gameplay foundation',
    ]);

    renderTilemap(renderer, this.tilemap, this.offset);
    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height, '#ffffff', 1);

    drawPanel(renderer, 620, 34, 300, 126, 'Tilemap', [
      `Size: ${this.tilemap.width}x${this.tilemap.height}`,
      `Tile size: ${this.tilemap.tileSize}`,
      `Collision: ${this.lastCollision}`,
      'Map drives collision and rendering',
    ]);
  }
}
