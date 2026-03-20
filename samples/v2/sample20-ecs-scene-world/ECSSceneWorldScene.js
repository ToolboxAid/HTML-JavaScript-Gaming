import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { World } from '../../../engine/v2/ecs/index.js';
import { DebugPanel } from '../../../engine/v2/debug/index.js';
import { InputControlSystem, MovementSystem, CollisionSystem, RenderSystem } from '../../../engine/v2/systems/index.js';

const theme = new Theme(ThemeTokens);

export default class ECSSceneWorldScene extends Scene {
  constructor() {
    super();

    this.world = new World();
    this.worldBounds = { x: 80, y: 170, width: 800, height: 280 };
    this.hitSolid = false;

    const player = this.world.createEntity();
    this.world.addComponent(player, 'transform', { x: 150, y: 240 });
    this.world.addComponent(player, 'size', { width: 48, height: 48 });
    this.world.addComponent(player, 'velocity', { x: 0, y: 0 });
    this.world.addComponent(player, 'speed', { value: 250 });
    this.world.addComponent(player, 'inputControlled', { enabled: true });
    this.world.addComponent(player, 'collider', { solid: false });
    this.world.addComponent(player, 'renderable', { color: theme.getColor('actorFill'), label: 'player' });

    const solidA = this.world.createEntity();
    this.world.addComponent(solidA, 'transform', { x: 340, y: 170 });
    this.world.addComponent(solidA, 'size', { width: 90, height: 170 });
    this.world.addComponent(solidA, 'solid', { enabled: true });
    this.world.addComponent(solidA, 'renderable', { color: '#8888ff', label: 'solidA' });

    const solidB = this.world.createEntity();
    this.world.addComponent(solidB, 'transform', { x: 540, y: 280 });
    this.world.addComponent(solidB, 'size', { width: 160, height: 70 });
    this.world.addComponent(solidB, 'solid', { enabled: true });
    this.world.addComponent(solidB, 'renderable', { color: '#66cc99', label: 'solidB' });
  }

  update(dt, engine) {
    InputControlSystem.applyVelocityFromInput({
      world: this.world,
      input: engine.input,
    });

    MovementSystem.integrateVelocity({
      world: this.world,
      dt,
      worldBounds: this.worldBounds,
      storePrevious: true,
    });

    this.hitSolid = CollisionSystem.revertControlledEntityAgainstSolids({ world: this.world });
  }

  render(renderer) {
    DebugPanel.drawFrame(renderer, theme, [
      'Engine V2 Sample20',
      'Demonstrates a scene that delegates behavior to ECS-style systems',
      'Use Arrow keys to move the player entity through the world',
      `Collision state: ${this.hitSolid ? 'blocked' : 'clear'}`,
      'This sample shows how a scene can orchestrate systems instead of hand-wiring all logic',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);
    RenderSystem.drawRenderableEntities(renderer, this.world, { labelMode: 'above' });
  }
}
