export function bounceEntitiesHorizontallyInBounds(world, bounds, query = ['transform', 'size', 'velocity']) {
  const entities = world.getEntitiesWith(...query);

  entities.forEach((entityId) => {
    const transform = world.getComponent(entityId, 'transform');
    const size = world.getComponent(entityId, 'size');
    const velocity = world.getComponent(entityId, 'velocity');

    const minX = bounds.x;
    const maxX = bounds.x + bounds.width - size.width;

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
