import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { World } from '../../../engine/v2/ecs/index.js';
import { DebugPanel } from '../../../engine/v2/debug/index.js';
import { InputControlSystem, RenderSystem, LifecycleSystem } from '../../../engine/v2/systems/index.js';
import { isColliding } from '../../../engine/v2/collision/aabb.js';

const theme = new Theme(ThemeTokens);

export default class EntityLifecycleScene extends Scene {
  constructor() {
    super();

    this.world = new World();
    this.worldBounds = { x: 80, y: 170, width: 800, height: 280 };
    this.spawnTimer = 0;
    this.spawnInterval = 0.75;
    this.maxPickups = 8;
    this.totalSpawned = 0;
    this.totalRemoved = 0;

    const player = this.world.createEntity();
    this.world.addComponent(player, 'transform', { x: 180, y: 250 });
    this.world.addComponent(player, 'size', { width: 48, height: 48 });
    this.world.addComponent(player, 'speed', { value: 250 });
    this.world.addComponent(player, 'inputControlled', { enabled: true });
    this.world.addComponent(player, 'tag', { value: 'player' });
    this.world.addComponent(player, 'renderable', { color: theme.getColor('actorFill') });
  }

  update(dt, engine) {
    InputControlSystem.applyDirectMovement({
      world: this.world,
      input: engine.input,
      dt,
      worldBounds: this.worldBounds,
    });

    this.spawnTimer += dt;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      if (this.world.getEntitiesWith('pickup').length < this.maxPickups) {
        this.spawnPickup();
      }
    }

    this.collectPickups();

    LifecycleSystem.expireTimedEntities({
      world: this.world,
      componentName: 'lifetime',
      requiredTag: 'pickup',
      dt,
      onExpire: () => {
        this.totalRemoved += 1;
      },
    });
  }

  render(renderer) {
    DebugPanel.drawFrame(renderer, theme, [
      'Engine V2 Sample22',
      'Demonstrates spawning, tagging, collecting, expiring, and removing entities',
      'Use Arrow keys to move the player and collect yellow pickups',
      'Pickups also expire on a timer if you do not collect them',
      'This sample makes entity lifecycle management explicit',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);
    RenderSystem.drawRenderableEntities(renderer, this.world);

    DebugPanel.drawPanel(renderer, 640, 28, 280, 126, 'Lifecycle Status', [
      `Spawned: ${this.totalSpawned}`,
      `Removed: ${this.totalRemoved}`,
      `Active pickups: ${this.world.getEntitiesWith('pickup').length}`,
      `Max pickups: ${this.maxPickups}`,
    ]);
  }

  spawnPickup() {
    const pickup = this.world.createEntity();
    const x = this.worldBounds.x + 30 + ((this.totalSpawned * 97) % (this.worldBounds.width - 60));
    const y = this.worldBounds.y + 30 + ((this.totalSpawned * 61) % (this.worldBounds.height - 60));

    this.world.addComponent(pickup, 'transform', { x, y });
    this.world.addComponent(pickup, 'size', { width: 24, height: 24 });
    this.world.addComponent(pickup, 'pickup', { value: true });
    this.world.addComponent(pickup, 'tag', { value: 'pickup' });
    this.world.addComponent(pickup, 'lifetime', { remaining: 5.0 });
    this.world.addComponent(pickup, 'renderable', { color: '#ffd166' });

    this.totalSpawned += 1;
  }

  collectPickups() {
    const playerId = this.world.getEntitiesWith('inputControlled')[0];
    const playerTransform = this.world.getComponent(playerId, 'transform');
    const playerSize = this.world.getComponent(playerId, 'size');

    for (const pickupId of this.world.getEntitiesWith('pickup', 'transform', 'size')) {
      const transform = this.world.getComponent(pickupId, 'transform');
      const size = this.world.getComponent(pickupId, 'size');

      if (isColliding(
        { x: playerTransform.x, y: playerTransform.y, width: playerSize.width, height: playerSize.height },
        { x: transform.x, y: transform.y, width: size.width, height: size.height }
      )) {
        this.world.removeEntity(pickupId);
        this.totalRemoved += 1;
      }
    }
  }
}
