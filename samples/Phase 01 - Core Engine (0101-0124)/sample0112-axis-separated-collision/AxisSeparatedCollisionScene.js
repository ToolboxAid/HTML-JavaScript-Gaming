/*
Toolbox Aid
David Quesenberry
03/21/2026
AxisSeparatedCollisionScene.js
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

export default class AxisSeparatedCollisionScene extends Scene {
  constructor() {
    super();

    this.worldBounds = { x: 60, y: 160, width: 840, height: 320 };
    this.player = { x: 120, y: 190, width: 48, height: 48, speed: 240 };
    this.solids = [
      { x: 300, y: 160, width: 70, height: 230 },
      { x: 430, y: 160, width: 90, height: 90 },
      { x: 430, y: 300, width: 160, height: 70 },
      { x: 660, y: 210, width: 120, height: 120 },
    ];

    this.hitX = false;
    this.hitY = false;
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

    this.hitX = false;
    this.hitY = false;

    this.player.x += dx;
    this.clampXToWorld();

    for (const solid of this.solids) {
      if (isColliding(this.player, solid)) {
        if (dx > 0) {
          this.player.x = solid.x - this.player.width;
        } else if (dx < 0) {
          this.player.x = solid.x + solid.width;
        }
        this.hitX = dx !== 0;
      }
    }

    this.player.y += dy;
    this.clampYToWorld();

    for (const solid of this.solids) {
      if (isColliding(this.player, solid)) {
        if (dy > 0) {
          this.player.y = solid.y - this.player.height;
        } else if (dy < 0) {
          this.player.y = solid.y + solid.height;
        }
        this.hitY = dy !== 0;
      }
    }
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    renderer.clear(theme.getColor('canvasBackground'));
    renderer.strokeRect(10, 10, width - 20, height - 20, '#dddddd', 2);
    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);

    this.solids.forEach((solid) => {
      renderer.drawRect(solid.x, solid.y, solid.width, solid.height, '#8888ff');
      renderer.strokeRect(solid.x, solid.y, solid.width, solid.height, '#ffffff', 1);
    });

    renderer.drawRect(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height,
      this.hitX || this.hitY ? '#ffb347' : theme.getColor('actorFill')
    );
    renderer.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height, '#ffffff', 1);

    const lines = [
      'Engine Sample 0112',
      'Demonstrates axis-separated collision resolution',
      'Use Arrow keys to move and slide along obstacle edges',
      `X collision: ${this.hitX ? 'yes' : 'no'} | Y collision: ${this.hitY ? 'yes' : 'no'}`,
      'Separate X and Y handling becomes the base for robust top-down movement',
    ];

    lines.forEach((line, index) => {
      renderer.drawText(line, 40, 40 + index * 24, {
        color: theme.getColor('textCanvs'),
        font: '16px monospace',
      });
    });
  }

  clampXToWorld() {
    const minX = this.worldBounds.x;
    const maxX = this.worldBounds.x + this.worldBounds.width - this.player.width;
    this.player.x = Math.max(minX, Math.min(this.player.x, maxX));
  }

  clampYToWorld() {
    const minY = this.worldBounds.y;
    const maxY = this.worldBounds.y + this.worldBounds.height - this.player.height;
    this.player.y = Math.max(minY, Math.min(this.player.y, maxY));
  }
}
