import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { World, drawSceneFrame, drawPanel } from './ecs.js';

const theme = new Theme(ThemeTokens);

export default class DebugStatsScene extends Scene {
  constructor() {
    super();

    this.world = new World();
    this.worldBounds = { x: 80, y: 170, width: 800, height: 280 };
    this.frameCounter = 0;
    this.frameAccumulator = 0;
    this.displayFps = 0;
    this.debugVisible = true;
    this.lastToggleState = false;

    for (let i = 0; i < 12; i += 1) {
      const entity = this.world.createEntity();
      this.world.addComponent(entity, 'transform', { x: 120 + i * 60, y: 210 + (i % 3) * 46 });
      this.world.addComponent(entity, 'size', { width: 30, height: 30 });
      this.world.addComponent(entity, 'velocity', { x: (i % 2 === 0 ? 1 : -1) * (80 + i * 4), y: 0 });
      this.world.addComponent(entity, 'renderable', { color: i % 2 === 0 ? '#8888ff' : '#66cc99' });
    }
  }

  update(dt, engine) {
    this.updateStats(dt, engine);
    this.updateMovers(dt);
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    drawSceneFrame(renderer, theme, width, height, [
      'Engine V2 Sample23',
      'Demonstrates a live debug stats overlay for engine-style diagnostics',
      'Press KeyD to toggle the stats overlay on and off',
      'The stats block displays FPS, entity counts, and system information',
      'This sample helps make engine growth observable and measurable',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);

    this.world.getEntitiesWith('transform', 'size', 'renderable').forEach((entityId) => {
      const transform = this.world.getComponent(entityId, 'transform');
      const size = this.world.getComponent(entityId, 'size');
      const renderable = this.world.getComponent(entityId, 'renderable');

      renderer.drawRect(transform.x, transform.y, size.width, size.height, renderable.color);
      renderer.strokeRect(transform.x, transform.y, size.width, size.height, '#ffffff', 1);
    });

    if (this.debugVisible) {
      drawPanel(renderer, 640, 28, 280, 146, 'Stats Overlay', [
        `FPS: ${this.displayFps.toFixed(1)}`,
        `Entities: ${this.world.countEntities()}`,
        `Movers: ${this.world.getEntitiesWith('velocity').length}`,
        `Debug visible: ${this.debugVisible ? 'yes' : 'no'}`,
        'Toggle: KeyD',
      ]);
    }
  }

  updateStats(dt, engine) {
    this.frameCounter += 1;
    this.frameAccumulator += dt;

    if (this.frameAccumulator >= 0.5) {
      this.displayFps = this.frameCounter / this.frameAccumulator;
      this.frameCounter = 0;
      this.frameAccumulator = 0;
    }

    const toggleDown = engine.input.isDown('KeyD');
    if (toggleDown && !this.lastToggleState) {
      this.debugVisible = !this.debugVisible;
    }
    this.lastToggleState = toggleDown;
  }

  updateMovers(dt) {
    this.world.getEntitiesWith('transform', 'size', 'velocity').forEach((entityId) => {
      const transform = this.world.getComponent(entityId, 'transform');
      const size = this.world.getComponent(entityId, 'size');
      const velocity = this.world.getComponent(entityId, 'velocity');

      transform.x += velocity.x * dt;

      const minX = this.worldBounds.x;
      const maxX = this.worldBounds.x + this.worldBounds.width - size.width;

      if (transform.x <= minX) {
        transform.x = minX;
        velocity.x *= -1;
      }
      if (transform.x >= maxX) {
        transform.x = maxX;
        velocity.x *= -1;
      }
    });
  }
}
