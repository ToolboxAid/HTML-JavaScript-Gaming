export function renderRectEntities(renderer, world, options = {}) {
  const {
    label = false,
    labelOffsetY = -8,
  } = options;

  world.getEntitiesWith('transform', 'size', 'renderable').forEach((entityId) => {
    const transform = world.getComponent(entityId, 'transform');
    const size = world.getComponent(entityId, 'size');
    const renderable = world.getComponent(entityId, 'renderable');

    renderer.drawRect(transform.x, transform.y, size.width, size.height, renderable.color);
    renderer.strokeRect(transform.x, transform.y, size.width, size.height, '#ffffff', 1);

    if (label && renderable.label) {
      renderer.drawText(renderable.label, transform.x + 6, transform.y + labelOffsetY, {
        color: '#ffffff',
        font: '14px monospace',
      });
    }
  });
}
