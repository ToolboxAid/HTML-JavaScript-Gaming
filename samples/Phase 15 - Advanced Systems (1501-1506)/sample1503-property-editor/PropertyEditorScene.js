/*
Toolbox Aid
David Quesenberry
03/22/2026
PropertyEditorScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { PropertyEditor } from '../../../engine/tooling/index.js';

const theme = new Theme(ThemeTokens);

export default class PropertyEditorScene extends Scene {
  constructor() {
    super();
    this.editor = new PropertyEditor();
    this.actor = { speed: 2, color: '#34d399' };
    this.status = 'Change runtime properties through the editor.';
  }

  setSpeed() {
    this.editor.set(this.actor, 'speed', 6);
    this.status = 'Speed updated to 6.';
  }

  setColor() {
    this.editor.set(this.actor, 'color', '#f97316');
    this.status = 'Color updated to ember.';
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample 1503',
      'Property editing stays in tooling instead of hardwired scene mutation paths.',
      this.status,
    ]);
    renderer.drawRect(180, 250, 80 + this.actor.speed * 20, 48, this.actor.color);
    drawPanel(renderer, 560, 40, 320, 180, 'Properties', [
      `Speed: ${this.actor.speed}`,
      `Color: ${this.actor.color}`,
    ]);
  }
}
