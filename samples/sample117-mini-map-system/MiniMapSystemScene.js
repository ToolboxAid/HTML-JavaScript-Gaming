/*
Toolbox Aid
David Quesenberry
03/22/2026
MiniMapSystemScene.js
*/
import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawMinimap } from '../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class MiniMapSystemScene extends Scene {
  constructor() {
    super();
    this.world = { width: 1600, height: 900 };
    this.camera = { x: 0, y: 0, viewportWidth: 640, viewportHeight: 360 };
    this.player = { x: 120, y: 220, width: 34, height: 34 };
    this.blocks = [
      { x: 300, y: 180, width: 220, height: 60 },
      { x: 780, y: 340, width: 180, height: 140 },
      { x: 1240, y: 200, width: 220, height: 80 },
    ];
  }

  update(dt, engine) {
    const move = 240 * dt;
    if (engine.input.isActionDown('move_left')) this.player.x -= move;
    if (engine.input.isActionDown('move_right')) this.player.x += move;
    this.player.x = Math.max(0, Math.min(this.world.width - this.player.width, this.player.x));
    this.camera.x = Math.max(0, Math.min(this.world.width - this.camera.viewportWidth, this.player.x - 180));
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample117',
      'Mini-map presentation stays inside engine-owned debug/render paths.',
      'Move with Arrow keys to watch the player and camera update on the map.',
    ]);

    const viewport = { x: 90, y: 220, width: 780, height: 180 };
    const scaleX = viewport.width / this.camera.viewportWidth;
    const scaleY = viewport.height / this.camera.viewportHeight;

    renderer.drawRect(viewport.x, viewport.y, viewport.width, viewport.height, '#1e293b');
    for (const block of this.blocks) {
      const screenX = viewport.x + (block.x - this.camera.x) * scaleX;
      const screenY = viewport.y + (block.y - this.camera.y) * scaleY;
      const screenWidth = block.width * scaleX;
      const screenHeight = block.height * scaleY;
      if (screenX + screenWidth < viewport.x || screenX > viewport.x + viewport.width) {
        continue;
      }
      renderer.drawRect(screenX, screenY, screenWidth, screenHeight, '#475569');
    }
    renderer.drawRect(
      viewport.x + (this.player.x - this.camera.x) * scaleX,
      viewport.y + (this.player.y - this.camera.y) * scaleY,
      this.player.width * scaleX,
      this.player.height * scaleY,
      '#34d399',
    );

    drawMinimap(renderer, {
      panel: { x: 620, y: 34, width: 300, height: 180 },
      world: this.world,
      camera: this.camera,
      player: this.player,
      blocks: this.blocks,
      title: 'Mini-Map System',
    });
  }
}
