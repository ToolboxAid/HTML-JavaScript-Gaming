/*
Toolbox Aid
David Quesenberry
03/22/2026
EntityPlacementEditorScene.js
*/
import { Scene } from '/src/engine/scene/index.js'; import { drawFrame, drawPanel } from '/src/engine/debug/index.js'; import { Theme, ThemeTokens } from '/src/engine/theme/index.js'; import { EntityPlacementEditor } from '/src/engine/editor/index.js';
const theme = new Theme(ThemeTokens);
export default class EntityPlacementEditorScene extends Scene {
  constructor() { super(); this.editor = new EntityPlacementEditor(); this.status = 'Add an entity, then move it through editor tooling.'; }
  add() { if (this.editor.entities.length === 0) { this.editor.addEntity({ id: 'npc-1', x: 180, y: 280 }); this.status = 'Placed npc-1 into the authored entity set.'; } }
  move() { this.editor.moveEntity('npc-1', 320, 250); this.status = 'Moved npc-1 using placement tooling.'; }
  render(renderer) { drawFrame(renderer, theme, ['Engine Sample 1403', 'Entity placement stays authoring-focused and separate from gameplay systems.', this.status]); renderer.drawRect(100, 220, 500, 180, '#0f172a'); this.editor.entities.forEach((entity) => renderer.drawRect(entity.x, entity.y, 32, 32, '#f59e0b')); drawPanel(renderer, 620, 40, 240, 150, 'Entities', [`Count: ${this.editor.entities.length}`, `First: ${this.editor.entities[0]?.id || 'none'}`]); }
}
