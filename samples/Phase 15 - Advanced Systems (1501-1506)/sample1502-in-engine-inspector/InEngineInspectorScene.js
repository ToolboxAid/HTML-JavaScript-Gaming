/*
Toolbox Aid
David Quesenberry
03/22/2026
InEngineInspectorScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { RuntimeInspector } from '/src/engine/tooling/index.js';

const theme = new Theme(ThemeTokens);

export default class InEngineInspectorScene extends Scene {
  constructor() {
    super();
    this.inspector = new RuntimeInspector();
    this.player = { x: 220, y: 280, hp: 7, state: 'idle' };
    this.system = { tickRate: 60, active: true, profile: 'debug' };
    this.snapshot = {};
    this.status = 'Inspect the player or a runtime system snapshot.';
  }

  inspectPlayer() {
    this.snapshot = this.inspector.inspect(this.player);
    this.status = 'Player state inspected.';
  }

  inspectSystem() {
    this.snapshot = this.inspector.inspect(this.system);
    this.status = 'System state inspected.';
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample 1502',
      'The inspector surfaces runtime object state without embedding debug reads into gameplay code.',
      this.status,
    ]);
    renderer.drawRect(this.player.x, this.player.y, 34, 34, '#38bdf8');
    drawPanel(renderer, 560, 40, 320, 220, 'Inspector', Object.keys(this.snapshot).length > 0
      ? Object.entries(this.snapshot).map(([key, value]) => `${key}: ${value}`)
      : ['No target inspected yet.']);
  }
}
