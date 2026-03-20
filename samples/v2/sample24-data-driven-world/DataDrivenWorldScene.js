import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { World } from '../../../engine/v2/ecs/index.js';
import { DebugPanel } from '../../../engine/v2/debug/index.js';
import { InputControlSystem, CollisionSystem, RenderSystem } from '../../../engine/v2/systems/index.js';
import LevelLoader from '../../../engine/v2/level/LevelLoader.js';
import { worldData } from './worldData.js';

const theme = new Theme(ThemeTokens);

export default class DataDrivenWorldScene extends Scene {
  constructor() {
    super();

    this.world = new World();
    this.hitSolid = false;

    const loaded = LevelLoader.cloneLevel(worldData);
    this.worldBounds = loaded.worldBounds;

    loaded.entities.forEach((definition) => {
      const entityId = this.world.createEntity();

      Object.entries(definition).forEach(([key, value]) => {
        if (key === 'type') {
          this.world.addComponent(entityId, 'tag', { value });
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
    const playerId = this.world.getEntitiesWith('inputControlled', 'transform', 'size', 'speed', 'collider')[0];
    const transform = this.world.getComponent(playerId, 'transform');

    transform.previousX = transform.x;
    transform.previousY = transform.y;

    InputControlSystem.applyDirectMovement({
      world: this.world,
      input: engine.input,
      dt,
      worldBounds: this.worldBounds,
    });

    this.hitSolid = CollisionSystem.revertControlledEntityAgainstSolids({ world: this.world });
  }

  render(renderer) {
    DebugPanel.drawFrame(renderer, theme, [
      'Engine V2 Sample24',
      'Demonstrates a data-driven world loaded from config definitions',
      'Use Arrow keys to move the player entity through configured geometry',
      `Collision state: ${this.hitSolid ? 'blocked' : 'clear'}`,
      'This sample replaces constructor hard-coding with declarative setup data',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);
    RenderSystem.drawRenderableEntities(renderer, this.world, { labelMode: 'above' });

    DebugPanel.drawPanel(renderer, 635, 28, 285, 126, 'World Data', [
      `Configured entities: ${worldData.entities.length}`,
      `Live entities: ${this.world.countEntities()}`,
      'Source: worldData.js',
      'Pattern: declarative setup',
    ]);
  }
}
