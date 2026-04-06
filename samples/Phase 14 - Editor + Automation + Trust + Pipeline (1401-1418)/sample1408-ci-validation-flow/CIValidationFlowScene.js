import { Scene } from '../../../engine/scenes/index.js'; import { drawFrame, drawPanel } from '../../../engine/debug/index.js'; import { Theme, ThemeTokens } from '../../../engine/theme/index.js'; import { CIValidationFlow } from '../../../engine/automation/index.js';
const theme = new Theme(ThemeTokens);
export default class CIValidationFlowScene extends Scene {
  constructor() { super(); this.results = null; this.status = 'Run green or red CI validation.'; }
  run(pass) { const flow = new CIValidationFlow([{ id: 'tests', run: () => ({ passed: pass, detail: pass ? 'Tests passed.' : 'Tests failed.' }) }, { id: 'manifest', run: () => ({ passed: true, detail: 'Manifest ready.' }) }]); this.results = flow.run(); this.status = `CI validation ${this.results.passed ? 'passed' : 'failed'}.`; }
  render(renderer) { drawFrame(renderer, theme, ['Engine Sample 1408', 'CI validation stays structured and automation-friendly.', this.status]); drawPanel(renderer, 120, 220, 500, 200, 'CI Output', this.results ? this.results.results.map((result) => `${result.id}: ${result.detail}`) : ['No CI run yet.']); }
}
