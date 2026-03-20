import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { World } from '../../../engine/v2/ecs/index.js';
import { DebugPanel } from '../../../engine/v2/debug/index.js';
import { InputControlSystem, CollisionSystem, RenderSystem } from '../../../engine/v2/systems/index.js';

const theme = new Theme(ThemeTokens);

export default class ECSCollisionSystemScene extends Scene {
  constructor() {
    super();

    this.world = new World();
    this.worldBounds = { x: 80, y: 170, width: 800, height: 280 };

    const player = this.world.createEntity();
    this.world.addComponent(player, 'transform', { x: 130, y: 250 });
    this.world.addComponent(player, 'size', { width: 48, height: 48 });
    this.world.addComponent(player, 'speed', { value: 240 });
    this.world.addComponent(player, 'inputControlled', { enabled: true });
    this.world.addComponent(player, 'collider', { solid: false });
    this.world.addComponent(player, 'renderable', { color: theme.getColor('actorFill') });

    const solidA = this.world.createEntity();
    this.world.addComponent(solidA, 'transform', { x: 330, y: 190 });
    this.world.addComponent(solidA, 'size', { width: 80, height: 180 });
    this.world.addComponent(solidA, 'collider', { solid: true });
    this.world.addComponent(solidA, 'solid', { enabled: true });
    this.world.addComponent(solidA, 'renderable', { color: '#8888ff' });

    const solidB = this.world.createEntity();
    this.world.addComponent(solidB, 'transform', { x: 500, y: 250 });
    this.world.addComponent(solidB, 'size', { width: 180, height: 70 });
    this.world.addComponent(solidB, 'collider', { solid: true });
    this.world.addComponent(solidB, 'solid', { enabled: true });
    this.world.addComponent(solidB, 'renderable', { color: '#8888ff' });

    this.hitSolid = false;
  }

  update(dt, engine) {
    const playerId = this.world.getEntitiesWith('transform', 'size', 'speed', 'inputControlled', 'collider')[0];
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
      'Engine V2 Sample18',
      'Demonstrates an ECS collision system using collider and solid components',
      'Use Arrow keys to move the player entity around the play area',
      `Collision state: ${this.hitSolid ? 'blocked by solid' : 'clear'}`,
      'This is the first ECS sample where movement and collision work together',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);
    RenderSystem.drawRenderableEntities(renderer, this.world);
  }
}
