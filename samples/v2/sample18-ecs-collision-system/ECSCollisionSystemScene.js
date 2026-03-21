import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { World } from '../../../engine/v2/ecs/index.js';
import { drawSceneFrame } from '../../../engine/v2/debug/index.js';
import { isColliding } from '../../../engine/v2/collision/index.js';

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
    if (!playerId) return;

    const transform = this.world.getComponent(playerId, 'transform');
    const size = this.world.getComponent(playerId, 'size');
    const speed = this.world.getComponent(playerId, 'speed').value;

    const previousX = transform.x;
    const previousY = transform.y;

    if (engine.input.isDown('ArrowLeft')) transform.x -= speed * dt;
    if (engine.input.isDown('ArrowRight')) transform.x += speed * dt;
    if (engine.input.isDown('ArrowUp')) transform.y -= speed * dt;
    if (engine.input.isDown('ArrowDown')) transform.y += speed * dt;

    const minX = this.worldBounds.x;
    const minY = this.worldBounds.y;
    const maxX = this.worldBounds.x + this.worldBounds.width - size.width;
    const maxY = this.worldBounds.y + this.worldBounds.height - size.height;
    transform.x = Math.max(minX, Math.min(transform.x, maxX));
    transform.y = Math.max(minY, Math.min(transform.y, maxY));

    this.hitSolid = false;

    const solids = this.world.getEntitiesWith('transform', 'size', 'solid');
    for (const solidId of solids) {
      const solidTransform = this.world.getComponent(solidId, 'transform');
      const solidSize = this.world.getComponent(solidId, 'size');

      if (
        isColliding(
          { x: transform.x, y: transform.y, width: size.width, height: size.height },
          { x: solidTransform.x, y: solidTransform.y, width: solidSize.width, height: solidSize.height }
        )
      ) {
        transform.x = previousX;
        transform.y = previousY;
        this.hitSolid = true;
        break;
      }
    }
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    drawSceneFrame(renderer, theme, width, height, [
      'Engine V2 Sample18',
      'Demonstrates an ECS collision system using collider and solid components',
      'Use Arrow keys to move the player entity around the play area',
      `Collision state: ${this.hitSolid ? 'blocked by solid' : 'clear'}`,
      'This is the first ECS sample where movement and collision work together',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);

    this.world.getEntitiesWith('transform', 'size', 'renderable').forEach((entityId) => {
      const transform = this.world.getComponent(entityId, 'transform');
      const size = this.world.getComponent(entityId, 'size');
      const renderable = this.world.getComponent(entityId, 'renderable');

      renderer.drawRect(transform.x, transform.y, size.width, size.height, renderable.color);
      renderer.strokeRect(transform.x, transform.y, size.width, size.height, '#ffffff', 1);
    });
  }
}
