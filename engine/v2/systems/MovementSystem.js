import { clamp } from '../utils/math.js';

export default class MovementSystem {
  static integrateVelocity({ world, dt, worldBounds = null, reflectX = false, reflectY = false, storePrevious = false }) {
    const movers = world.getEntitiesWith('transform', 'size', 'velocity');

    movers.forEach((entityId) => {
      const transform = world.getComponent(entityId, 'transform');
      const size = world.getComponent(entityId, 'size');
      const velocity = world.getComponent(entityId, 'velocity');

      if (storePrevious) {
        transform.previousX = transform.x;
        transform.previousY = transform.y;
      }

      transform.x += velocity.x * dt;
      transform.y += velocity.y * dt;

      if (!worldBounds) {
        return;
      }

      const minX = worldBounds.x;
      const minY = worldBounds.y;
      const maxX = worldBounds.x + worldBounds.width - size.width;
      const maxY = worldBounds.y + worldBounds.height - size.height;

      if (reflectX) {
        if (transform.x <= minX) {
          transform.x = minX;
          velocity.x *= -1;
        }
        if (transform.x >= maxX) {
          transform.x = maxX;
          velocity.x *= -1;
        }
      } else {
        transform.x = clamp(transform.x, minX, maxX);
      }

      if (reflectY) {
        if (transform.y <= minY) {
          transform.y = minY;
          velocity.y *= -1;
        }
        if (transform.y >= maxY) {
          transform.y = maxY;
          velocity.y *= -1;
        }
      } else {
        transform.y = clamp(transform.y, minY, maxY);
      }
    });
  }
}
