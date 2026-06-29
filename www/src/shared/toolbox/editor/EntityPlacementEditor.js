/*
Toolbox Aid
David Quesenberry
03/22/2026
EntityPlacementEditor.js
*/
export default class EntityPlacementEditor {
  constructor() {
    this.entities = [];
  }

  addEntity(entity) {
    this.entities.push({ ...entity });
  }

  moveEntity(id, x, y) {
    const entity = this.entities.find((entry) => entry.id === id);
    if (entity) {
      entity.x = x;
      entity.y = y;
    }
  }

  exportEntities() {
    return this.entities.map((entity) => ({ ...entity }));
  }
}
