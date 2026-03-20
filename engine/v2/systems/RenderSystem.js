export default class RenderSystem {
  static drawRenderableEntities(renderer, world, { labelMode = 'none', textOffsetY = -8 } = {}) {
    world.getEntitiesWith('transform', 'size', 'renderable').forEach((entityId) => {
      const transform = world.getComponent(entityId, 'transform');
      const size = world.getComponent(entityId, 'size');
      const renderable = world.getComponent(entityId, 'renderable');

      renderer.drawRect(transform.x, transform.y, size.width, size.height, renderable.color);
      renderer.strokeRect(transform.x, transform.y, size.width, size.height, '#ffffff', 1);

      if (labelMode !== 'none' && renderable.label) {
        const labelY = labelMode === 'below'
          ? transform.y + size.height + 18
          : transform.y + textOffsetY;

        renderer.drawText(renderable.label, transform.x + 6, labelY, {
          color: '#ffffff',
          font: '14px monospace',
        });
      }
    });
  }
}
