import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { clamp, drawFrame } from './shared.js';

const theme = new Theme(ThemeTokens);

export default class CameraBoundsScene extends Scene {
  constructor() {
    super();

    this.viewport = { width: 900, height: 300 };
    this.screen = { x: 30, y: 170 };
    this.world = { width: 2200, height: 1400 };
    this.camera = { x: 0, y: 0 };

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

    this.camera.x = this.player.x + this.player.width / 2 - this.viewport.width / 2;
    this.camera.y = this.player.y + this.player.height / 2 - this.viewport.height / 2;

    this.camera.x = clamp(this.camera.x, 0, this.world.width - this.viewport.width);
    this.camera.y = clamp(this.camera.y, 0, this.world.height - this.viewport.height);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine V2 Sample26',
      'Demonstrates camera follow with world-edge clamping',
      'Use Arrow keys to move the player near all edges of the world',
      'The camera stops at the valid world bounds instead of drifting into empty space',
      'This is the stable camera behavior used by most scrolling games',
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.viewport.width, this.viewport.height, '#d8d5ff', 2);

    const offsetX = this.screen.x - this.camera.x;
    const offsetY = this.screen.y - this.camera.y;

    this.blocks.forEach((block) => {
      renderer.drawRect(block.x + offsetX, block.y + offsetY, block.width, block.height, '#8888ff');
      renderer.strokeRect(block.x + offsetX, block.y + offsetY, block.width, block.height, '#ffffff', 1);
    });

    renderer.drawRect(this.player.x + offsetX, this.player.y + offsetY, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(this.player.x + offsetX, this.player.y + offsetY, this.player.width, this.player.height, '#ffffff', 1);
  }
}
