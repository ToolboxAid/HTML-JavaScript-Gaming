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

  removeEntity(entityId) {
    this.entities.delete(entityId);
    for (const componentMap of this.components.values()) {
      componentMap.delete(entityId);
    }
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

  hasComponent(entityId, name) {
    return this.components.get(name)?.has(entityId) ?? false;
  }

  getEntitiesWith(...componentNames) {
    return Array.from(this.entities).filter((entityId) =>
      componentNames.every((name) => this.components.get(name)?.has(entityId))
    );
  }

  countEntities() {
    return this.entities.size;
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

export function drawPanel(renderer, x, y, width, height, title, lines) {
  renderer.drawRect(x, y, width, height, 'rgba(20, 24, 38, 0.92)');
  renderer.strokeRect(x, y, width, height, '#d8d5ff', 2);
  renderer.drawText(title, x + 12, y + 24, {
    color: '#ffffff',
    font: '16px monospace',
  });

  lines.forEach((line, index) => {
    renderer.drawText(line, x + 12, y + 52 + index * 20, {
      color: '#d0d5ff',
      font: '14px monospace',
    });
  });
}
