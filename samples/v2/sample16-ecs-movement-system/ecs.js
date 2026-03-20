export class World {
  constructor() {
    this.nextEntityId = 1;
    this.entities = new Set();
    this.components = new Map();
  }

  createEntity() {
    const id = this.nextEntityId++;
    this.entities.add(id);
    return id;
  }

  addComponent(entityId, name, data) {
    if (!this.components.has(name)) {
      this.components.set(name, new Map());
    }

    this.components.get(name).set(entityId, data);
  }

  getComponent(entityId, name) {
    return this.components.get(name)?.get(entityId);
  }

  getEntitiesWith(...componentNames) {
    return Array.from(this.entities).filter((entityId) =>
      componentNames.every((name) => this.components.get(name)?.has(entityId))
    );
  }
}

export function drawSceneFrame(renderer, theme, width, height, lines) {
  renderer.clear(theme.getColor('canvasBackground'));
  renderer.strokeRect(10, 10, width - 20, height - 20, '#dddddd', 2);

  lines.forEach((line, index) => {
    renderer.drawText(line, 40, 40 + index * 24, {
      color: theme.getColor('textCanvs'),
      font: '16px monospace',
    });
  });
}
