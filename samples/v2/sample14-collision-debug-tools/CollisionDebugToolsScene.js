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

function distanceBetweenCenters(a, b) {
  const ax = a.x + a.width / 2;
  const ay = a.y + a.height / 2;
  const bx = b.x + b.width / 2;
  const by = b.y + b.height / 2;

  const dx = ax - bx;
  const dy = ay - by;

  return Math.sqrt(dx * dx + dy * dy);
}

export default class CollisionDebugToolsScene extends Scene {
  constructor() {
    super();

    this.worldBounds = { x: 60, y: 140, width: 840, height: 320 };
    this.player = { x: 130, y: 190, width: 48, height: 48, speed: 240 };
    this.solids = [
      { x: 270, y: 170, width: 90, height: 100 },
      { x: 420, y: 240, width: 140, height: 70 },
      { x: 620, y: 170, width: 100, height: 170 },
      { x: 785, y: 300, width: 70, height: 90 },
    ];

    this.candidateIndex = -1;
    this.overlapIndex = -1;
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
    this.clampXToWorld();

    for (const solid of this.solids) {
      if (isColliding(this.player, solid)) {
        if (dx > 0) this.player.x = solid.x - this.player.width;
        if (dx < 0) this.player.x = solid.x + solid.width;
      }
    }

    this.player.y += dy;
    this.clampYToWorld();

    for (const solid of this.solids) {
      if (isColliding(this.player, solid)) {
        if (dy > 0) this.player.y = solid.y - this.player.height;
        if (dy < 0) this.player.y = solid.y + solid.height;
      }
    }

    this.updateDebugState();
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    renderer.clear(theme.getColor('canvasBackground'));
    renderer.strokeRect(10, 10, width - 20, height - 20, '#dddddd', 2);
    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);

    this.solids.forEach((solid, index) => {
      let fill = '#6666cc';

      if (index === this.candidateIndex) {
        fill = '#ffd166';
      }

      if (index === this.overlapIndex) {
        fill = '#ff6666';
      }

      renderer.drawRect(solid.x, solid.y, solid.width, solid.height, fill);
      renderer.strokeRect(solid.x, solid.y, solid.width, solid.height, '#ffffff', 1);
    });

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height, '#ffffff', 1);

    const lines = [
      'Engine V2 Sample14',
      'Demonstrates collision debug tools and live blocker inspection',
      'Use Arrow keys to move the player box',
      `Nearest candidate: ${this.candidateIndex >= 0 ? this.candidateIndex : 'none'} | Overlap: ${this.overlapIndex >= 0 ? this.overlapIndex : 'none'}`,
      'Yellow = nearest candidate blocker, Red = overlapping blocker',
    ];

    lines.forEach((line, index) => {
      renderer.drawText(line, 40, 40 + index * 24, {
        color: theme.getColor('textCanvs'),
        font: '16px monospace',
      });
    });
  }

  updateDebugState() {
    let nearestIndex = -1;
    let nearestDistance = Number.POSITIVE_INFINITY;

    this.overlapIndex = -1;

    this.solids.forEach((solid, index) => {
      const distance = distanceBetweenCenters(this.player, solid);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }

      if (isColliding(this.player, solid)) {
        this.overlapIndex = index;
      }
    });

    this.candidateIndex = nearestIndex;
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
