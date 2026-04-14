/*
Toolbox Aid
David Quesenberry
03/21/2026
EntityLifecycleScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { World } from '/src/engine/ecs/index.js';
import {
  createTransform,
  createSize,
  createVelocity,
  createSpeed,
  createInputControlled,
  createLifetime,
  createRenderable,
  createTag,
} from '/src/engine/components/index.js';
import { drawSceneFrame, drawPanel } from '/src/engine/debug/index.js';
import {
  applyInputControl,
  moveEntities,
  renderRectEntities,
  tickLifetimes,
  collectOverlappingEntities,
} from '/src/engine/systems/index.js';

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
    this.world.addComponent(player, 'transform', createTransform(180, 250));
    this.world.addComponent(player, 'size', createSize(48, 48));
    this.world.addComponent(player, 'velocity', createVelocity(0, 0));
    this.world.addComponent(player, 'speed', createSpeed(250));
    this.world.addComponent(player, 'inputControlled', createInputControlled(true));
    this.world.addComponent(player, 'tag', createTag('player'));
    this.world.addComponent(player, 'renderable', createRenderable(theme.getColor('actorFill')));
  }

  update(dt, engine) {
    applyInputControl(this.world, engine.input);
    moveEntities(this.world, dt, this.worldBounds);

    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      if (this.world.getEntitiesWith('pickup').length < this.maxPickups) {
        this.spawnPickup();
      }
    }

    this.totalRemoved += collectOverlappingEntities(this.world, {
      collectorQuery: ['inputControlled', 'transform', 'size'],
      targetQuery: ['pickup', 'transform', 'size'],
      onCollect: ({ world, targetId }) => {
        world.removeEntity(targetId);
      },
    });

    this.totalRemoved += tickLifetimes(this.world, dt).length;
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    drawSceneFrame(renderer, theme, width, height, [
      'Engine Sample 0122',
      'Demonstrates spawning, tagging, collecting, expiring, and removing entities',
      'Use Arrow keys to move the player and collect yellow pickups',
      'Pickups also expire on a timer if you do not collect them',
      'This sample makes entity lifecycle management explicit',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);
    renderRectEntities(renderer, this.world);

    drawPanel(renderer, 640, 28, 280, 126, 'Lifecycle Status', [
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

    this.world.addComponent(pickup, 'transform', createTransform(x, y));
    this.world.addComponent(pickup, 'size', createSize(24, 24));
    this.world.addComponent(pickup, 'velocity', createVelocity(0, 0));
    this.world.addComponent(pickup, 'pickup', { value: true });
    this.world.addComponent(pickup, 'tag', createTag('pickup'));
    this.world.addComponent(pickup, 'lifetime', createLifetime(5.0));
    this.world.addComponent(pickup, 'renderable', createRenderable('#ffd166'));

    this.totalSpawned += 1;
  }
}
