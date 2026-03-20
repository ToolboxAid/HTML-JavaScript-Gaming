import { clamp } from '../utils/math.js';

export default class InputControlSystem {
  static applyDirectMovement({ world, input, dt, worldBounds }) {
    const controlledEntities = world.getEntitiesWith('transform', 'size', 'speed', 'inputControlled');

    controlledEntities.forEach((entityId) => {
      const transform = world.getComponent(entityId, 'transform');
      const size = world.getComponent(entityId, 'size');
      const speed = world.getComponent(entityId, 'speed').value;

      if (input.isDown('ArrowLeft')) transform.x -= speed * dt;
      if (input.isDown('ArrowRight')) transform.x += speed * dt;
      if (input.isDown('ArrowUp')) transform.y -= speed * dt;
      if (input.isDown('ArrowDown')) transform.y += speed * dt;

      if (worldBounds) {
        const minX = worldBounds.x;
        const minY = worldBounds.y;
        const maxX = worldBounds.x + worldBounds.width - size.width;
        const maxY = worldBounds.y + worldBounds.height - size.height;

        transform.x = clamp(transform.x, minX, maxX);
        transform.y = clamp(transform.y, minY, maxY);
      }
    });
  }

  static applyVelocityFromInput({ world, input }) {
    const controlledEntities = world.getEntitiesWith('velocity', 'speed', 'inputControlled');

    controlledEntities.forEach((entityId) => {
      const velocity = world.getComponent(entityId, 'velocity');
      const speed = world.getComponent(entityId, 'speed').value;

      velocity.x = 0;
      velocity.y = 0;

      if (input.isDown('ArrowLeft')) velocity.x -= speed;
      if (input.isDown('ArrowRight')) velocity.x += speed;
      if (input.isDown('ArrowUp')) velocity.y -= speed;
      if (input.isDown('ArrowDown')) velocity.y += speed;
    });
  }
}
