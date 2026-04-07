/*
Toolbox Aid
David Quesenberry
03/21/2026
SpriteRenderSystem.js
*/
export function renderSpriteReadyEntities(renderer, entities, options = {}) {
  const {
    label = false,
    labelOffsetY = -8,
    getFrameColor = null,
    getFrame = null,
    getImage = null,
  } = options;

  entities.forEach((entity) => {
    const frame = typeof getFrame === 'function' ? getFrame(entity) : entity.frameData || null;
    const image = typeof getImage === 'function' ? getImage(entity) : entity.image || null;

    if (frame && image) {
      renderer.drawImageFrame(
        image,
        frame.x ?? 0,
        frame.y ?? 0,
        frame.width ?? image.width,
        frame.height ?? image.height,
        entity.x,
        entity.y,
        entity.width,
        entity.height,
      );
      renderer.strokeRect(entity.x, entity.y, entity.width, entity.height, '#ffffff', 1);
    } else {
      const color =
        (typeof getFrameColor === 'function' ? getFrameColor(entity) : null) ||
        frame?.color ||
        entity.spriteColor ||
        entity.color ||
        '#8888ff';

      renderer.drawRect(entity.x, entity.y, entity.width, entity.height, color);
      renderer.strokeRect(entity.x, entity.y, entity.width, entity.height, '#ffffff', 1);
    }

    if (label && entity.label) {
      renderer.drawText(entity.label, entity.x + 6, entity.y + labelOffsetY, {
        color: '#ffffff',
        font: '14px monospace',
      });
    }
  });
}
