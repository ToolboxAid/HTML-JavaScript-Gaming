/*
Toolbox Aid
David Quesenberry
03/21/2026
CameraFollowScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { clamp } from '../../engine/utils/index.js';
import { drawFrame } from '../../engine/debug/index.js';
import { Camera2D } from '../../engine/camera/index.js';

const theme = new Theme(ThemeTokens);

export default class CameraFollowScene extends Scene {
  constructor() {
    super();

    this.viewport = { width: 960, height: 540 };
    this.screen = { x: 30, y: 170 };
    this.world = { width: 2200, height: 1400 };
    this.camera = new Camera2D({
      viewportWidth: this.viewport.width - 60,
      viewportHeight: this.viewport.height - 210,
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

    this.markers = [];
    for (let i = 0; i < 14; i += 1) {
      this.markers.push({
        x: 180 + i * 140,
        y: 240 + (i % 4) * 180,
        width: 52,
        height: 52,
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
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample25',
      'Demonstrates camera follow over a world larger than the viewport',
      'Use Arrow keys to move the player and watch the camera track movement',
      'This is the first sample where the view scrolls over a larger game space',
      'Camera bounds are intentionally not clamped yet so the next sample can focus on that',
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);

    this.markers.forEach((marker) => {
      const pos = this.camera.worldToScreen(marker.x, marker.y, this.screen.x, this.screen.y);
      renderer.drawRect(pos.x, pos.y, marker.width, marker.height, '#8888ff');
      renderer.strokeRect(pos.x, pos.y, marker.width, marker.height, '#ffffff', 1);
    });

    const playerPos = this.camera.worldToScreen(this.player.x, this.player.y, this.screen.x, this.screen.y);
    renderer.drawRect(playerPos.x, playerPos.y, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(playerPos.x, playerPos.y, this.player.width, this.player.height, '#ffffff', 1);
  }
}
