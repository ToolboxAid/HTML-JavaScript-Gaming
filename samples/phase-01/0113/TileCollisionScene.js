/*
Toolbox Aid
David Quesenberry
03/21/2026
TileCollisionScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';

const theme = new Theme(ThemeTokens);

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export default class TileCollisionScene extends Scene {
  constructor() {
    super();

    this.tileSize = 48;
    this.gridX = 168;
    this.gridY = 156;
    this.worldBounds = { x: this.gridX, y: this.gridY, width: this.tileSize * 12, height: this.tileSize * 6 };

    this.map = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    this.player = {
      x: this.gridX + this.tileSize + 6,
      y: this.gridY + this.tileSize + 6,
      width: 36,
      height: 36,
      speed: 210,
    };
  }

  update(dt, engine) {
    const input = engine.input;
    const move = this.player.speed * dt;

    let dx = 0;
    let dy = 0;

    if (input.isDown('ArrowLeft')) dx -= move;
    if (input.isDown('ArrowRight')) dx += move;
    if (input.isDown('ArrowUp')) dy -= move;
    if (input.isDown('ArrowDown')) dy += move;

    this.player.x += dx;
    this.resolveTileCollisions('x', dx);

    this.player.y += dy;
    this.resolveTileCollisions('y', dy);
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    renderer.clear(theme.getColor('canvasBackground'));
    renderer.strokeRect(10, 10, width - 20, height - 20, '#dddddd', 2);

    for (let row = 0; row < this.map.length; row += 1) {
      for (let col = 0; col < this.map[row].length; col += 1) {
        const x = this.gridX + col * this.tileSize;
        const y = this.gridY + row * this.tileSize;
        const solid = this.map[row][col] === 1;

        renderer.drawRect(x, y, this.tileSize, this.tileSize, solid ? '#6666cc' : '#232334');
        renderer.strokeRect(x, y, this.tileSize, this.tileSize, '#ffffff', 1);
      }
    }

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height, '#ffffff', 1);

    const lines = [
      'Engine Sample 0113',
      'Demonstrates tile-based collision using a grid of solid cells',
      'Use Arrow keys to move through open floor tiles',
      'Axis-separated resolution keeps the player inside valid tile space',
      'This sample bridges from entity collision into tile map collision',
    ];

    lines.forEach((line, index) => {
      renderer.drawText(line, 40, 40 + index * 24, {
        color: theme.getColor('textCanvs'),
        font: '16px monospace',
      });
    });
  }

  getSolidTiles() {
    const solids = [];

    for (let row = 0; row < this.map.length; row += 1) {
      for (let col = 0; col < this.map[row].length; col += 1) {
        if (this.map[row][col] === 1) {
          solids.push({
            x: this.gridX + col * this.tileSize,
            y: this.gridY + row * this.tileSize,
            width: this.tileSize,
            height: this.tileSize,
          });
        }
      }
    }

    return solids;
  }

  resolveTileCollisions(axis, delta) {
    if (delta === 0) {
      return;
    }

    const solids = this.getSolidTiles();

    for (const solid of solids) {
      if (!isColliding(this.player, solid)) {
        continue;
      }

      if (axis === 'x') {
        if (delta > 0) {
          this.player.x = solid.x - this.player.width;
        } else {
          this.player.x = solid.x + solid.width;
        }
      } else {
        if (delta > 0) {
          this.player.y = solid.y - this.player.height;
        } else {
          this.player.y = solid.y + solid.height;
        }
      }
    }
  }
}
