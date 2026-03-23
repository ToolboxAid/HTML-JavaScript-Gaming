/*
Toolbox Aid
David Quesenberry
03/22/2026
ReleaseValidationChecklistScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';

const theme = new Theme(ThemeTokens);

export default class ReleaseValidationChecklistScene extends Scene {
  constructor(checklist) {
    super();
    this.checklist = checklist;
    this.report = null;
    this.status = 'Run the checklist against a ready or blocked build context.';
  }

  validate(context, label) {
    this.report = this.checklist.run(context);
    this.status = `${label} validation ${this.report.passed ? 'passed' : 'failed'}.`;
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample146',
      'Release validation turns readiness rules into a reusable checklist flow.',
      this.status,
    ]);

    renderer.drawRect(90, 220, 470, 210, '#0f172a');
    (this.report?.results || []).slice(0, 6).forEach((result, index) => {
      renderer.drawRect(115, 250 + index * 28, 18, 18, result.passed ? '#22c55e' : '#ef4444');
      renderer.drawText(`${result.label}: ${result.detail}`, 145, 264 + index * 28, {
        color: '#e2e8f0',
        font: '14px monospace',
      });
    });

    drawPanel(renderer, 610, 40, 300, 220, 'Validation Summary', [
      `Passed: ${this.report?.passed ?? 'n/a'}`,
      `Checks Passed: ${this.report?.passedCount ?? 0}/${this.report?.total ?? 0}`,
      `Failures: ${this.report?.failedCount ?? 0}`,
      `Required Only: enforced`,
      `Ready To Ship: ${this.report?.passed ? 'yes' : 'no'}`,
    ]);
  }
}
