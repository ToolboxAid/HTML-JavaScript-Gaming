import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { World } from '../../engine/ecs/index.js';
import {
  createTransform,
  createSize,
  createVelocity,
  createSpeed,
  createInputControlled,
  createCollider,
} from '../../engine/components/index.js';
import { drawSceneFrame, drawPanel, drawValidationPanel, validateWorldEntities } from '../../engine/debug/index.js';
import {
  applyInputControl,
  moveEntities,
  blockCollidingEntities,
  renderRectEntities,
} from '../../engine/systems/index.js';
import { worldData } from './worldData.js';

const theme = new Theme(ThemeTokens);

export default class DataDrivenWorldScene extends Scene {
  constructor() {
    super();

    this.world = new World({ dev: true });
    this.worldBounds = worldData.worldBounds;
    this.hitSolid = false;
    this.validationIssues = [];
    this.loadFromData();

    this.validationIssues = validateWorldEntities(this.world, [
      { require: ['inputControlled'], alsoRequire: ['transform', 'size', 'velocity', 'speed', 'collider'] },
      { require: ['solid'], alsoRequire: ['transform', 'size'] },
      { require: ['renderable'], alsoRequire: ['transform', 'size'] },
    ]);
  }

  loadFromData() {
    worldData.entities.forEach((definition) => {
      const entityId = this.world.createEntity();

      Object.entries(definition).forEach(([key, value]) => {
        if (key === 'type') {
          this.world.addComponent(entityId, 'tag', { value });
          return;
        }

        if (key === 'transform') {
          this.world.addComponent(entityId, 'transform', createTransform(value.x, value.y));
          return;
        }

        if (key === 'size') {
          this.world.addComponent(entityId, 'size', createSize(value.width, value.height));
          return;
        }

        if (key === 'speed') {
          this.world.addComponent(entityId, 'speed', createSpeed(value.value));
          return;
        }

        if (key === 'inputControlled') {
          this.world.addComponent(entityId, 'inputControlled', createInputControlled(value.enabled));
          this.world.addComponent(entityId, 'velocity', createVelocity(0, 0));
          this.world.addComponent(entityId, 'collider', createCollider(false));
          return;
        }

        if (key === 'renderable' && value.color === 'actorFill') {
          this.world.addComponent(entityId, 'renderable', {
            ...value,
            color: theme.getColor('actorFill'),
          });
          return;
        }

        this.world.addComponent(entityId, key, { ...value });
      });
    });
  }

  update(dt, engine) {
    applyInputControl(this.world, engine.input);
    moveEntities(this.world, dt, this.worldBounds);
    this.hitSolid = blockCollidingEntities(this.world) > 0;
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    drawSceneFrame(renderer, theme, width, height, [
      'Engine V2 Sample24',
      'Demonstrates a data-driven world loaded from config definitions',
      'Use Arrow keys to move the player entity through configured geometry',
      `Collision state: ${this.hitSolid ? 'blocked' : 'clear'}`,
      'This sample replaces constructor hard-coding with declarative setup data',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);
    renderRectEntities(renderer, this.world, { label: true, labelOffsetY: -8 });

    drawPanel(renderer, 635, 28, 285, 126, 'World Data', [
      `Configured entities: ${worldData.entities.length}`,
      `Live entities: ${this.world.countEntities()}`,
      'Source: worldData.js',
      'Pattern: declarative setup',
    ]);

    if (this.validationIssues.length > 0) {
      drawValidationPanel(renderer, this.validationIssues, 620, 164, 300, 126);
    }
  }
}
