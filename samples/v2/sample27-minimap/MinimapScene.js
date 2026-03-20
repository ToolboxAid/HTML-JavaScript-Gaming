import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { clamp, drawFrame, drawPanel } from './shared.js';

const theme = new Theme(ThemeTokens);

export default class MinimapScene extends Scene {
  constructor() {
    super();

    this.viewport = { width: 900, height: 300 };
    this.screen = { x: 30, y: 170 };
    this.world = { width: 2200, height: 1400 };
    this.camera = { x: 0, y: 0 };
    this.minimap = { x: 710, y: 28, width: 210, height: 134 };

    this.player = { x: 180, y: 180, width: 44, height: 44, speed: 260 };
    this.blocks = [];
    for (let i = 0; i < 20; i += 1) {
      this.blocks.push({
        x: 140 + i * 96,
        y: 160 + (i % 6) * 170,
        width: 48,
        height: 48,
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

    this.camera.x = clamp(
      this.player.x + this.player.width / 2 - this.viewport.width / 2,
      0,
      this.world.width - this.viewport.width
    );
    this.camera.y = clamp(
      this.player.y + this.player.height / 2 - this.viewport.height / 2,
      0,
      this.world.height - this.viewport.height
    );
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine V2 Sample27',
      'Demonstrates a minimap overlay for a larger scrolling world',
      'Use Arrow keys to move and compare the viewport with the minimap panel',
      'The minimap shows player position and obstacle layout at reduced scale',
      'This prepares the engine for larger navigable worlds and overview tools',
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

    drawPanel(renderer, this.minimap.x, this.minimap.y, this.minimap.width, this.minimap.height, 'Minimap', []);

    const scaleX = (this.minimap.width - 24) / this.world.width;
    const scaleY = (this.minimap.height - 48) / this.world.height;
    const mapX = this.minimap.x + 12;
    const mapY = this.minimap.y + 34;
    const mapWidth = this.minimap.width - 24;
    const mapHeight = this.minimap.height - 46;

    renderer.strokeRect(mapX, mapY, mapWidth, mapHeight, '#ffffff', 1);

    this.blocks.forEach((block) => {
      renderer.drawRect(
        mapX + block.x * scaleX,
        mapY + block.y * scaleY,
        Math.max(2, block.width * scaleX),
        Math.max(2, block.height * scaleY),
        '#8888ff'
      );
    });

    renderer.drawRect(
      mapX + this.player.x * scaleX,
      mapY + this.player.y * scaleY,
      Math.max(3, this.player.width * scaleX),
      Math.max(3, this.player.height * scaleY),
      '#ffd166'
    );

    renderer.strokeRect(
      mapX + this.camera.x * scaleX,
      mapY + this.camera.y * scaleY,
      this.viewport.width * scaleX,
      this.viewport.height * scaleY,
      '#ff6666',
      1
    );
  }
}
