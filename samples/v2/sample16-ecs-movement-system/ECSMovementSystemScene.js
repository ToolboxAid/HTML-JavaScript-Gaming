import Scene from '../../../engine/v2/scenes/Scene.js';
import { World } from '../../../engine/v2/ecs/index.js';
import { drawSceneFrame } from '../../../engine/v2/debug/index.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';

const theme = new Theme(ThemeTokens);

export default class ECSMovementSystemScene extends Scene {
  constructor() {
    super();

    this.world = new World();
    this.worldBounds = { x: 80, y: 170, width: 800, height: 280 };

    const moverA = this.world.createEntity();
    this.world.addComponent(moverA, 'transform', { x: 140, y: 220 });
    this.world.addComponent(moverA, 'size', { width: 44, height: 44 });
    this.world.addComponent(moverA, 'velocity', { x: 160, y: 0 });
    this.world.addComponent(moverA, 'renderable', { color: theme.getColor('actorFill') });

    const moverB = this.world.createEntity();
    this.world.addComponent(moverB, 'transform', { x: 700, y: 320 });
    this.world.addComponent(moverB, 'size', { width: 52, height: 52 });
    this.world.addComponent(moverB, 'velocity', { x: -120, y: 0 });
    this.world.addComponent(moverB, 'renderable', { color: '#8888ff' });
  }

  update(dt) {
    const movers = this.world.getEntitiesWith('transform', 'size', 'velocity');

    movers.forEach((entityId) => {
      const transform = this.world.getComponent(entityId, 'transform');
      const size = this.world.getComponent(entityId, 'size');
      const velocity = this.world.getComponent(entityId, 'velocity');

      transform.x += velocity.x * dt;
      transform.y += velocity.y * dt;

      const minX = this.worldBounds.x;
      const maxX = this.worldBounds.x + this.worldBounds.width - size.width;

      if (transform.x <= minX) {
        transform.x = minX;
        velocity.x *= -1;
      }

      if (transform.x >= maxX) {
        transform.x = maxX;
        velocity.x *= -1;
      }
    });
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    drawSceneFrame(renderer, theme, width, height, [
      'Engine V2 Sample16',
      'Demonstrates an ECS movement system using transform and velocity components',
      'Each moving entity is updated through the same shared system logic',
      'Horizontal bounds reflection keeps the sample visually predictable',
      'This pattern sets up later input and collision systems',
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
