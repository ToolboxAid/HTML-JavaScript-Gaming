/*
Toolbox Aid
David Quesenberry
03/22/2026
LoggingErrorSystemScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { ErrorBoundary } from '../../engine/logging/index.js';

const theme = new Theme(ThemeTokens);

export default class LoggingErrorSystemScene extends Scene {
  constructor() {
    super();
    this.boundary = null;
    this.status = 'Use the buttons to create logs or trigger a graceful error path.';
  }

  ensureBoundary(engine) {
    if (!this.boundary) {
      this.boundary = new ErrorBoundary({ logger: engine.logger });
    }
  }

  logInfo(engine) {
    engine.logger.info('Sample131 info event.', { source: 'sample131' });
    this.status = 'Info log added.';
  }

  triggerHandledError(engine) {
    this.ensureBoundary(engine);
    const fallback = this.boundary.run(() => {
      throw new Error('Sample131 simulated failure.');
    }, 'Recovered with fallback');
    this.status = fallback;
  }

  render(renderer, engine) {
    const entries = engine.logger.getEntries().slice(-5);
    drawFrame(renderer, theme, [
      'Engine Sample131',
      'Structured logs and graceful error handling stay in reusable engine utilities.',
      this.status,
    ]);

    drawPanel(renderer, 90, 210, 500, 200, 'Recent Logs', entries.length > 0
      ? entries.map((entry) => `${entry.level.toUpperCase()}: ${entry.message}`)
      : ['No log entries yet.']);

    drawPanel(renderer, 620, 34, 300, 170, 'Logging + Error', [
      `Entry Count: ${engine.logger.getEntries().length}`,
      `Last Level: ${entries.at(-1)?.level ?? 'none'}`,
      'Use Log Info to emit a structured entry.',
      'Use Trigger Safe Error to capture a failure.',
    ]);
  }
}
