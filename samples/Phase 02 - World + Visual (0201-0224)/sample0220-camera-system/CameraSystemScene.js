/*
Toolbox Aid
David Quesenberry
03/21/2026
CameraSystemScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { clamp } from '../../../engine/utils/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Camera2D, followCameraTarget, worldRectToScreen } from '../../../engine/camera/index.js';

const theme = new Theme(ThemeTokens);

export default class CameraSystemScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 40, y: 180 };
    this.world = { width: 2200, height: 1200 };
    this.camera = new Camera2D({
      viewportWidth: 860,
      viewportHeight: 300,
      worldWidth: this.world.width,
      worldHeight: this.world.height,
    });
    this.player = { x: 80, y: 120, width: 46, height: 46, speed: 260 };
    this.objects = Array.from({ length: 14 }, (_, i) => ({
      x: 160 + i * 130,
      y: 200 + (i % 4) * 180,
      width: 58,
      height: 58,
    }));
  }

  update(dt, engine) {
    const move = this.player.speed * dt;
    if (engine.input.isDown('ArrowLeft')) this.player.x -= move;
    if (engine.input.isDown('ArrowRight')) this.player.x += move;
    if (engine.input.isDown('ArrowUp')) this.player.y -= move;
    if (engine.input.isDown('ArrowDown')) this.player.y += move;

    this.player.x = clamp(this.player.x, 0, this.world.width - this.player.width);
    this.player.y = clamp(this.player.y, 0, this.world.height - this.player.height);

    followCameraTarget(this.camera, this.player, true)

  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample 010220',
      'Demonstrates a shared world-to-screen camera system',
      'Use Arrow keys to move through a larger world',
      'All drawing goes through camera helpers instead of local offset math',
      'This sample defines the camera boundary for future large worlds',
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);

    this.objects.forEach((obj) => {
      const rect = worldRectToScreen(this.camera, obj, this.screen.x, this.screen.y);
      renderer.drawRect(rect.x, rect.y, rect.width, rect.height, '#8888ff');
      renderer.strokeRect(rect.x, rect.y, rect.width, rect.height, '#ffffff', 1);
    });

    const playerRect = worldRectToScreen(this.camera, this.player, this.screen.x, this.screen.y);
    renderer.drawRect(playerRect.x, playerRect.y, playerRect.width, playerRect.height, theme.getColor('actorFill'));
    renderer.strokeRect(playerRect.x, playerRect.y, playerRect.width, playerRect.height, '#ffffff', 1);

    drawPanel(renderer, 620, 34, 300, 126, 'Camera', [
      `x: ${this.camera.x.toFixed(1)}`,
      `y: ${this.camera.y.toFixed(1)}`,
      `viewport: ${this.camera.viewportWidth}x${this.camera.viewportHeight}`,
      'All objects rendered in world space',
    ]);
  }
}
