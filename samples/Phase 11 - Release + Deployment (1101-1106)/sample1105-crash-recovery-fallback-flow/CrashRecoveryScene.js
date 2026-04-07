/*
Toolbox Aid
David Quesenberry
03/22/2026
CrashRecoveryScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';

const theme = new Theme(ThemeTokens);

export default class CrashRecoveryScene extends Scene {
  constructor(recovery) {
    super();
    this.recovery = recovery;
    this.counter = 0;
    this.fallback = null;
    this.status = 'Run a safe step or simulate a crash to view the fallback flow.';
  }

  runSafe() {
    const result = this.recovery.run('sample145:tick', () => {
      this.counter += 1;
      return this.counter;
    }, { counter: this.counter });
    this.fallback = result.fallback;
    this.status = `Safe step completed. Counter is now ${result.result}.`;
  }

  triggerCrash() {
    const result = this.recovery.run('sample145:tick', () => {
      throw new Error('Simulated sample crash.');
    }, { counter: this.counter });
    this.fallback = result.fallback;
    this.status = 'Crash captured. Fallback screen activated.';
  }

  restore() {
    const crash = this.recovery.restoreLastCrash();
    this.fallback = crash ? { screen: 'fallback', reason: crash.label } : null;
    this.status = crash
      ? `Restored crash record from ${crash.crashedAt}.`
      : 'No stored crash record found.';
  }

  clear() {
    this.recovery.clearCrash();
    this.fallback = null;
    this.status = 'Cleared crash record and returned to normal flow.';
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 1105',
      'Crash recovery stores a failure record and exposes a fallback state instead of a hard stop.',
      this.status,
    ]);

    if (this.fallback) {
      renderer.drawRect(95, 210, 470, 210, '#3f0d12');
      renderer.strokeRect(95, 210, 470, 210, '#fca5a5', 2);
      renderer.drawText('Fallback Screen Active', 330, 270, {
        color: '#ffffff',
        font: '22px monospace',
        textAlign: 'center',
      });
      renderer.drawText(`Reason: ${this.fallback.reason}`, 330, 320, {
        color: '#fecaca',
        font: '16px monospace',
        textAlign: 'center',
      });
    } else {
      renderer.drawRect(95, 210, 470, 210, '#0f172a');
      renderer.drawRect(150, 270, 80 + this.counter * 24, 28, '#38bdf8');
      renderer.drawText(`Runtime Counter: ${this.counter}`, 150, 335, {
        color: '#e2e8f0',
        font: '18px monospace',
      });
    }

    const crash = this.recovery.lastCrash;
    drawPanel(renderer, 610, 40, 300, 220, 'Recovery State', [
      `Fallback Active: ${Boolean(this.fallback)}`,
      `Last Crash: ${crash?.label || 'none'}`,
      `Stored Counter: ${crash?.context?.counter ?? 'n/a'}`,
      `Crashed At: ${crash?.crashedAt || 'n/a'}`,
      `Logger Entries: ${this.recovery.logger?.getEntries().length || 0}`,
    ]);
  }
}
