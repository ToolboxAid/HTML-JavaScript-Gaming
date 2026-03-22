/*
Toolbox Aid
David Quesenberry
03/22/2026
DeveloperConsoleScene.js
*/
import Scene from '../../engine/scenes/Scene.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { DeveloperConsole } from '../../engine/tooling/index.js';

const theme = new Theme(ThemeTokens);

export default class DeveloperConsoleScene extends Scene {
  constructor() {
    super();
    this.console = new DeveloperConsole();
    this.hp = 5;
    this.status = 'Run a command to inspect or modify runtime state.';
    this.lastResult = 'No commands yet.';

    this.console.register('help', () => 'Commands: help, heal <amount>');
    this.console.register('heal', (args) => {
      const amount = Number(args[0] || 0);
      this.hp += amount;
      return `Healed ${amount}.`;
    });
  }

  run(command) {
    const result = this.console.execute(command);
    this.lastResult = result.output;
    this.status = `Executed: ${command}`;
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample177',
      'Runtime commands route through a reusable developer console instead of scene-specific debug switches.',
      this.status,
    ]);

    renderer.drawRect(120, 240, 320, 36, '#1e293b');
    renderer.drawRect(120, 240, this.hp * 40, 36, '#22c55e');

    drawPanel(renderer, 560, 40, 320, 200, 'Console Output', [
      `HP: ${this.hp}`,
      `Last Result: ${this.lastResult}`,
      `History: ${this.console.history.length}`,
    ]);
  }
}
