import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { clamp } from '../../../engine/v2/utils/math.js';
import { Camera2D } from '../../../engine/v2/camera/index.js';
import { DebugPanel } from '../../../engine/v2/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class CameraFollowScene extends Scene {
  constructor() {
    super();

    this.viewport = { width: 960, height: 540 };
    this.world = { width: 2200, height: 1400 };
    this.camera = new Camera2D({
      viewportWidth: this.viewport.width,
      viewportHeight: this.viewport.height,
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
    DebugPanel.drawFrame(renderer, theme, [
      'Engine V2 Sample25',
      'Demonstrates camera follow over a world larger than the viewport',
      'Use Arrow keys to move the player and watch the camera track movement',
      'This is the first sample where the view scrolls over a larger game space',
      'Camera bounds are intentionally not clamped yet so the next sample can focus on that',
    ]);

    const offset = this.camera.getOffset(30, 170);

    renderer.strokeRect(30, 170, this.viewport.width - 60, this.viewport.height - 210, '#d8d5ff', 2);

    this.markers.forEach((marker) => {
      renderer.drawRect(marker.x + offset.x, marker.y + offset.y, marker.width, marker.height, '#8888ff');
      renderer.strokeRect(marker.x + offset.x, marker.y + offset.y, marker.width, marker.height, '#ffffff', 1);
    });

    renderer.drawRect(this.player.x + offset.x, this.player.y + offset.y, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(this.player.x + offset.x, this.player.y + offset.y, this.player.width, this.player.height, '#ffffff', 1);
  }
}
