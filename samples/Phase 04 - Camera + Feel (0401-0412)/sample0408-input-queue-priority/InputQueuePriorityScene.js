/*
Toolbox Aid
David Quesenberry
03/22/2026
InputQueuePriorityScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js';

const theme = new Theme(ThemeTokens);

const ACTION_COLORS = {
  light: '#22c55e',
  guard: '#60a5fa',
  heavy: '#ef4444',
};

export default class InputQueuePriorityScene extends Scene {
  constructor() {
    super();
    this.lockDuration = 1.4;
    this.reset();
  }

  reset() {
    this.lockTimer = this.lockDuration;
    this.executed = 'none';
    this.executedColor = '#9ca3af';
    this.message = 'Queue J, K, or L while the gate is locked.';
  }

  update(dt, engine) {
    if (engine.input.isActionPressed('reset')) {
      this.reset();
      return;
    }

    this.lockTimer = Math.max(0, this.lockTimer - dt);

    if (this.lockTimer <= 0) {
      const next = engine.input.consumeQueuedAction(['light', 'guard', 'heavy']);
      if (next) {
        this.executed = next.action;
        this.executedColor = ACTION_COLORS[next.action] ?? '#9ca3af';
        this.message = `${next.action} executed from queue priority ${next.priority}.`;
      } else {
        this.executed = 'none';
        this.executedColor = '#9ca3af';
        this.message = 'Gate opened with no queued action.';
      }

      this.lockTimer = this.lockDuration;
    }
  }

  render(renderer, engine) {
    drawFrame(renderer, theme, [
      'Engine Sample80',
      'Queue J, K, or L while locked. Highest priority executes first.',
      this.message,
    ]);

    renderer.drawRect(100, 220, 760, 180, 'rgba(20, 24, 38, 0.92)');
    renderer.strokeRect(100, 220, 760, 180, '#d8d5ff', 2);

    const ratio = this.lockTimer / this.lockDuration;
    renderer.drawRect(132, 258, 696, 24, 'rgba(148, 163, 184, 0.22)');
    renderer.drawRect(132, 258, 696 * ratio, 24, '#fbbf24');
    renderer.drawText('Gate lock timer', 132, 248, {
      color: '#fef3c7',
      font: '14px monospace',
    });

    renderer.drawRect(160, 316, 120, 44, ACTION_COLORS.light);
    renderer.drawRect(370, 316, 120, 44, ACTION_COLORS.guard);
    renderer.drawRect(580, 316, 120, 44, ACTION_COLORS.heavy);
    renderer.drawText('J light (1)', 176, 344, { color: '#081018', font: '14px monospace' });
    renderer.drawText('K guard (2)', 382, 344, { color: '#081018', font: '14px monospace' });
    renderer.drawText('L heavy (3)', 594, 344, { color: '#081018', font: '14px monospace' });

    renderer.drawRect(736, 316, 74, 74, this.executedColor);
    renderer.drawText('exec', 750, 338, { color: '#081018', font: '12px monospace' });
    renderer.drawText(this.executed, 748, 362, { color: '#081018', font: '12px monospace' });

    const queue = engine.input.getQueuedActions().map((entry) => `${entry.action}:${entry.priority}`).join(', ') || 'empty';
    drawPanel(renderer, 620, 34, 300, 126, 'Queue + Priority', [
      `Lock: ${this.lockTimer.toFixed(2)}s`,
      `Queued: ${queue}`,
      `Last exec: ${this.executed}`,
      'Priority order: heavy > guard > light',
    ]);
  }
}
