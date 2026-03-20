import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { World, drawSceneFrame } from './ecs.js';

const theme = new Theme(ThemeTokens);

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

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
    this.runInputSystem(engine);
    this.runMovementSystem(dt);
    this.runCollisionSystem();
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    drawSceneFrame(renderer, theme, width, height, [
      'Engine V2 Sample20',
      'Demonstrates a scene that delegates behavior to ECS-style systems',
      'Use Arrow keys to move the player entity through the world',
      `Collision state: ${this.hitSolid ? 'blocked' : 'clear'}`,
      'This sample shows how a scene can orchestrate systems instead of hand-wiring all logic',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);

    this.world.getEntitiesWith('transform', 'size', 'renderable').forEach((entityId) => {
      const transform = this.world.getComponent(entityId, 'transform');
      const size = this.world.getComponent(entityId, 'size');
      const renderable = this.world.getComponent(entityId, 'renderable');

      renderer.drawRect(transform.x, transform.y, size.width, size.height, renderable.color);
      renderer.strokeRect(transform.x, transform.y, size.width, size.height, '#ffffff', 1);
      renderer.drawText(renderable.label, transform.x + 6, transform.y - 8, {
        color: '#ffffff',
        font: '14px monospace',
      });
    });
  }

  runInputSystem(engine) {
    const controlled = this.world.getEntitiesWith('velocity', 'speed', 'inputControlled');

    controlled.forEach((entityId) => {
      const velocity = this.world.getComponent(entityId, 'velocity');
      const speed = this.world.getComponent(entityId, 'speed').value;

      velocity.x = 0;
      velocity.y = 0;

      if (engine.input.isDown('ArrowLeft')) velocity.x -= speed;
      if (engine.input.isDown('ArrowRight')) velocity.x += speed;
      if (engine.input.isDown('ArrowUp')) velocity.y -= speed;
      if (engine.input.isDown('ArrowDown')) velocity.y += speed;
    });
  }

  runMovementSystem(dt) {
    const movers = this.world.getEntitiesWith('transform', 'size', 'velocity');

    movers.forEach((entityId) => {
      const transform = this.world.getComponent(entityId, 'transform');
      const size = this.world.getComponent(entityId, 'size');
      const velocity = this.world.getComponent(entityId, 'velocity');

      transform.previousX = transform.x;
      transform.previousY = transform.y;

      transform.x += velocity.x * dt;
      transform.y += velocity.y * dt;

      const minX = this.worldBounds.x;
      const minY = this.worldBounds.y;
      const maxX = this.worldBounds.x + this.worldBounds.width - size.width;
      const maxY = this.worldBounds.y + this.worldBounds.height - size.height;

      transform.x = Math.max(minX, Math.min(transform.x, maxX));
      transform.y = Math.max(minY, Math.min(transform.y, maxY));
    });
  }

  runCollisionSystem() {
    this.hitSolid = false;

    const movers = this.world.getEntitiesWith('transform', 'size', 'collider');
    const solids = this.world.getEntitiesWith('transform', 'size', 'solid');

    movers.forEach((entityId) => {
      const transform = this.world.getComponent(entityId, 'transform');
      const size = this.world.getComponent(entityId, 'size');

      for (const solidId of solids) {
        const solidTransform = this.world.getComponent(solidId, 'transform');
        const solidSize = this.world.getComponent(solidId, 'size');

        if (isColliding(
          { x: transform.x, y: transform.y, width: size.width, height: size.height },
          { x: solidTransform.x, y: solidTransform.y, width: solidSize.width, height: solidSize.height }
        )) {
          transform.x = transform.previousX;
          transform.y = transform.previousY;
          this.hitSolid = true;
          break;
        }
      }
    });
  }
}
