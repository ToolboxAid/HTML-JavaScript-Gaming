import { getSystemEntities, requireSystemComponents } from './SystemUtils.js';

export function renderRectEntities(renderer, world, options = {}) {
  const {
    label = false,
    labelOffsetY = -8,
    filter = null,
  } = options;

  getSystemEntities(world, ['transform', 'size', 'renderable']).forEach((entityId) => {
    const [transform, size, renderable] = requireSystemComponents(world, entityId, [
      'transform',
      'size',
      'renderable',
    ]);

    if (typeof filter === 'function' && !filter({ entityId, transform, size, renderable })) {
      return;
    }

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
