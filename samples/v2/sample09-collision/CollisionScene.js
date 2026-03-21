import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';

const theme = new Theme(ThemeTokens);

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export default class CollisionScene extends Scene {
  constructor() {
    super();

    this.player = {
      x: 200,
      y: 200,
      width: 50,
      height: 50,
      speed: 260,
    };

    this.block = {
      x: 500,
      y: 250,
      width: 120,
      height: 120,
    };

    this.worldBounds = {
      x: 60,
      y: 170,
      width: 840,
      height: 320,
    };

    this.colliding = false;
    this.textStartX = 40;
    this.textStartY = 40;
    this.textLineHeight = 24;
  }

  update(dt, engine) {
    const input = engine.input;
    const move = this.player.speed * dt;

    if (input.isDown('ArrowLeft')) this.player.x -= move;
    if (input.isDown('ArrowRight')) this.player.x += move;
    if (input.isDown('ArrowUp')) this.player.y -= move;
    if (input.isDown('ArrowDown')) this.player.y += move;

    this.clampPlayerToWorld();
    this.colliding = isColliding(this.player, this.block);
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    renderer.clear(theme.getColor('canvasBackground'));
    renderer.strokeRect(10, 10, width - 20, height - 20, '#dddddd', 2);
    renderer.strokeRect(
      this.worldBounds.x,
      this.worldBounds.y,
      this.worldBounds.width,
      this.worldBounds.height,
      '#d8d5ff',
      3
    );

    renderer.drawRect(
      this.block.x,
      this.block.y,
      this.block.width,
      this.block.height,
      '#8888ff'
    );

    renderer.drawRect(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height,
      this.colliding ? '#ff4444' : theme.getColor('actorFill')
    );

    renderer.strokeRect(
      this.block.x,
      this.block.y,
      this.block.width,
      this.block.height,
      '#ffffff',
      1
    );

    renderer.strokeRect(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height,
      '#ffffff',
      1
    );

    const lines = [
      'Engine V2 Sample09',
      'Demonstrates AABB collision detection and visual debug rendering',
      'Use Arrow keys to move the player box',
      'Player turns red while overlapping the static block',
      'This is the collision foundation pass for future response systems',
    ];

    lines.forEach((line, index) => {
      renderer.drawText(line, this.textStartX, this.textStartY + this.textLineHeight * index, {
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
