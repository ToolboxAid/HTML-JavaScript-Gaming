/*
Toolbox Aid
David Quesenberry
03/21/2026
CameraBoundsScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { clamp } from '/src/engine/utils/index.js';
import { drawFrame } from '/src/engine/debug/index.js';
import { Camera2D } from '/src/engine/camera/index.js';

const theme = new Theme(ThemeTokens);

export default class CameraBoundsScene extends Scene {
  constructor() {
    super();

    this.screen = { x: 30, y: 170 };
    this.world = { width: 2200, height: 1400 };
    this.camera = new Camera2D({
      viewportWidth: 900,
      viewportHeight: 300,
      worldWidth: this.world.width,
      worldHeight: this.world.height,
    });

    this.player = {
      x: 180,
      y: 180,
      width: 44,
      height: 44,
      speed: 260,
    };

    this.blocks = [];
    for (let i = 0; i < 18; i += 1) {
      this.blocks.push({
        x: 120 + i * 110,
        y: 180 + (i % 5) * 180,
        width: 54,
        height: 54,
      });
    }
  }

  update(dt, engine) {
    const move = this.player.speed * dt;

    if (engine.input.isDown('ArrowLeft')) this.player.x -= move;
    if (engine.input.isDown('ArrowRight')) this.player.x += move;
    if (engine.input.isDown('ArrowUp')) this.player.y -= move;
    if (engine.input.isDown('ArrowDown')) this.player.y += move;

    this.player.x = clamp(this.player.x, 0, this.world.width - this.player.width);
    this.player.y = clamp(this.player.y, 0, this.world.height - this.player.height);

    this.camera.followRect(this.player);
    this.camera.clampToWorld();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample 0202',
      'Demonstrates camera follow with world-edge clamping',
      'Use Arrow keys to move the player near all edges of the world',
      'The camera stops at the valid world bounds instead of drifting into empty space',
      'This is the stable camera behavior used by most scrolling games',
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);

    this.blocks.forEach((block) => {
      const pos = this.camera.worldToScreen(block.x, block.y, this.screen.x, this.screen.y);
      renderer.drawRect(pos.x, pos.y, block.width, block.height, '#8888ff');
      renderer.strokeRect(pos.x, pos.y, block.width, block.height, '#ffffff', 1);
    });

    const playerPos = this.camera.worldToScreen(this.player.x, this.player.y, this.screen.x, this.screen.y);
    renderer.drawRect(playerPos.x, playerPos.y, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(playerPos.x, playerPos.y, this.player.width, this.player.height, '#ffffff', 1);
  }
}
