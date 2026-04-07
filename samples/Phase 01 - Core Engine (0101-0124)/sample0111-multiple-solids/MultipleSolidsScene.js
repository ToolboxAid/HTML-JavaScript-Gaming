/*
Toolbox Aid
David Quesenberry
03/21/2026
MultipleSolidsScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';

const theme = new Theme(ThemeTokens);

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export default class MultipleSolidsScene extends Scene {
  constructor() {
    super();

    this.worldBounds = { x: 60, y: 180, width: 840, height: 320 };
    this.player = { x: 120, y: 190, width: 48, height: 48, speed: 240 };
    this.solids = [
      { x: 300, y: 200, width: 80, height: 220 },
      { x: 430, y: 260, width: 160, height: 60 },
      { x: 660, y: 200, width: 90, height: 150 },
    ];
    this.activeSolidIndex = -1;
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

    this.activeSolidIndex = -1;

    for (let i = 0; i < this.solids.length; i += 1) {
      if (isColliding(this.player, this.solids[i])) {
        this.player.x = previousX;
        this.player.y = previousY;
        this.activeSolidIndex = i;
        break;
      }
    }
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    renderer.clear(theme.getColor('canvasBackground'));
    renderer.strokeRect(10, 10, width - 20, height - 20, '#dddddd', 2);
    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);

    this.solids.forEach((solid, index) => {
      renderer.drawRect(solid.x, solid.y, solid.width, solid.height, index === this.activeSolidIndex ? '#ff6666' : '#8888ff');
      renderer.strokeRect(solid.x, solid.y, solid.width, solid.height, '#ffffff', 1);
    });

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height, '#ffffff', 1);

    const lines = [
      'Engine Sample 0111',
      'Demonstrates collision response against multiple solid objects',
      'Use Arrow keys to move through the play area',
      'The same loop tests the player against every blocking rectangle',
      'The solid that blocks the player highlights red when hit',
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
