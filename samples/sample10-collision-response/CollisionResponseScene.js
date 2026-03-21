/*
Toolbox Aid
David Quesenberry
03/21/2026
CollisionResponseScene.js
*/
import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';

const theme = new Theme(ThemeTokens);

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export default class CollisionResponseScene extends Scene {
  constructor() {
    super();

    this.worldBounds = { x: 60, y: 180, width: 840, height: 320 };
    this.player = { x: 160, y: 230, width: 48, height: 48, speed: 260 };
    this.block = { x: 480, y: 220, width: 140, height: 140 };
    this.colliding = false;
  }

  update(dt, engine) {
    const input = engine.input;
    const move = this.player.speed * dt;

    const previousX = this.player.x;
    const previousY = this.player.y;

    if (input.isDown('ArrowLeft')) this.player.x -= move;
    if (input.isDown('ArrowRight')) this.player.x += move;
    if (input.isDown('ArrowUp')) this.player.y -= move;
    if (input.isDown('ArrowDown')) this.player.y += move;

    this.clampPlayerToWorld();

    if (isColliding(this.player, this.block)) {
      this.player.x = previousX;
      this.player.y = previousY;
      this.colliding = true;
    } else {
      this.colliding = false;
    }
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    renderer.clear(theme.getColor('canvasBackground'));
    renderer.strokeRect(10, 10, width - 20, height - 20, '#dddddd', 2);
    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);

    renderer.drawRect(this.block.x, this.block.y, this.block.width, this.block.height, '#8888ff');
    renderer.strokeRect(this.block.x, this.block.y, this.block.width, this.block.height, '#ffffff', 1);

    renderer.drawRect(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height,
      this.colliding ? '#ff4444' : theme.getColor('actorFill')
    );
    renderer.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height, '#ffffff', 1);

    const lines = [
      'Engine V2 Sample10',
      'Demonstrates basic collision response against one solid block',
      'Use Arrow keys to move the player box',
      'Movement is reverted when the attempted step overlaps the block',
      'This is the first pass where collision now affects gameplay',
    ];

    lines.forEach((line, index) => {
      renderer.drawText(line, 40, 40 + index * 24, {
        color: theme.getColor('textCanvs'),
        font: '16px monospace',
      });
    });
  }

  clampPlayerToWorld() {
    const minX = this.worldBounds.x;
    const minY = this.worldBounds.y;
    const maxX = this.worldBounds.x + this.worldBounds.width - this.player.width;
    const maxY = this.worldBounds.y + this.worldBounds.height - this.player.height;

    this.player.x = Math.max(minX, Math.min(this.player.x, maxX));
    this.player.y = Math.max(minY, Math.min(this.player.y, maxY));
  }
}
