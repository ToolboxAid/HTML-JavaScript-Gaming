export function renderSpriteReadyEntities(renderer, entities, options = {}) {
  const {
    label = false,
    labelOffsetY = -8,
    getFrameColor = null,
  } = options;

  entities.forEach((entity) => {
    const color =
      (typeof getFrameColor === 'function' ? getFrameColor(entity) : null) ||
      entity.spriteColor ||
      entity.color ||
      '#8888ff';

    renderer.drawRect(entity.x, entity.y, entity.width, entity.height, color);
    renderer.strokeRect(entity.x, entity.y, entity.width, entity.height, '#ffffff', 1);

    if (label && entity.label) {
      renderer.drawText(entity.label, entity.x + 6, entity.y + labelOffsetY, {
        color: '#ffffff',
        font: '14px monospace',
      });
    }
  });
}
