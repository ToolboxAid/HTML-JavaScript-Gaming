/*
Toolbox Aid
David Quesenberry
03/21/2026
DebugStatsScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { World } from '../../../engine/ecs/index.js';
import {
  createTransform,
  createSize,
  createVelocity,
  createRenderable,
} from '../../../engine/components/index.js';
import { drawSceneFrame, drawPanel, StatsTracker } from '../../../engine/debug/index.js';
import {
  moveEntities,
  bounceEntitiesHorizontallyInBounds,
  renderRectEntities,
} from '../../../engine/systems/index.js';

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
      this.world.addComponent(entity, 'transform', createTransform(120 + i * 60, 210 + (i % 3) * 46));
      this.world.addComponent(entity, 'size', createSize(30, 30));
      this.world.addComponent(entity, 'velocity', createVelocity((i % 2 === 0 ? 1 : -1) * (80 + i * 4), 0));
      this.world.addComponent(entity, 'renderable', createRenderable(i % 2 === 0 ? '#8888ff' : '#66cc99'));
    }
  }

  update(dt, engine) {
    this.stats.update(dt);
    this.updateDebugToggle(engine);
    moveEntities(this.world, dt);
    bounceEntitiesHorizontallyInBounds(this.world, this.worldBounds);
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    drawSceneFrame(renderer, theme, width, height, [
      'Engine Sample 0123',
      'Demonstrates a live debug stats overlay for engine-style diagnostics',
      'Press KeyD to toggle the stats overlay on and off',
      'The stats block displays FPS, entity counts, and system information',
      'This sample helps make engine growth observable and measurable',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);
    renderRectEntities(renderer, this.world);

    if (this.debugVisible) {
      drawPanel(renderer, 640, 28, 280, 146, 'Stats Overlay', [
        `FPS: ${this.stats.getFps().toFixed(1)}`,
        `Entities: ${this.world.countEntities()}`,
        `Movers: ${this.world.getEntitiesWith('velocity').length}`,
        `Debug visible: ${this.debugVisible ? 'yes' : 'no'}`,
        'Toggle: KeyD',
      ]);
    }
  }

  updateDebugToggle(engine) {
    const toggleDown = engine.input.isDown('KeyD');
    if (toggleDown && !this.lastToggleState) {
      this.debugVisible = !this.debugVisible;
    }
    this.lastToggleState = toggleDown;
  }
}
