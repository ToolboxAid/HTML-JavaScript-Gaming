import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { World } from '../../../engine/v2/ecs/index.js';
import { DebugPanel, StatsTracker } from '../../../engine/v2/debug/index.js';
import { MovementSystem, RenderSystem } from '../../../engine/v2/systems/index.js';

const theme = new Theme(ThemeTokens);

export default class DebugStatsScene extends Scene {
  constructor() {
    super();

    this.world = new World();
    this.worldBounds = { x: 80, y: 170, width: 800, height: 280 };
    this.stats = new StatsTracker();
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
    this.stats.update(dt);

    const toggleDown = engine.input.isDown('KeyD');
    if (toggleDown && !this.lastToggleState) {
      this.debugVisible = !this.debugVisible;
    }
    this.lastToggleState = toggleDown;

    MovementSystem.integrateVelocity({
      world: this.world,
      dt,
      worldBounds: this.worldBounds,
      reflectX: true,
    });
  }

  render(renderer) {
    DebugPanel.drawFrame(renderer, theme, [
      'Engine V2 Sample23',
      'Demonstrates a live debug stats overlay for engine-style diagnostics',
      'Press KeyD to toggle the stats overlay on and off',
      'The stats block displays FPS, entity counts, and system information',
      'This sample helps make engine growth observable and measurable',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);
    RenderSystem.drawRenderableEntities(renderer, this.world);

    if (this.debugVisible) {
      DebugPanel.drawPanel(renderer, 640, 28, 280, 146, 'Stats Overlay', [
        `FPS: ${this.stats.getFps().toFixed(1)}`,
        `Entities: ${this.world.countEntities()}`,
        `Movers: ${this.world.getEntitiesWith('velocity').length}`,
        `Debug visible: ${this.debugVisible ? 'yes' : 'no'}`,
        'Toggle: KeyD',
      ]);
    }
  }
}
