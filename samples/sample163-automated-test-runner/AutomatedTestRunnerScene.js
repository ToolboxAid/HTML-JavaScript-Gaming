/*
Toolbox Aid
David Quesenberry
03/22/2026
AutomatedTestRunnerScene.js
*/
import { Scene } from '../../engine/scenes/index.js'; import { drawFrame, drawPanel } from '../../engine/debug/index.js'; import { Theme, ThemeTokens } from '../../engine/theme/index.js'; import { AutomatedTestRunner } from '../../engine/automation/index.js';
const theme = new Theme(ThemeTokens);
export default class AutomatedTestRunnerScene extends Scene {
  constructor() { super(); this.runner = new AutomatedTestRunner(); this.results = []; this.status = 'Run the centralized test runner.'; this.runner.register('scene-load', async () => 'ready'); this.runner.register('mock-failure', async () => { throw new Error('expected fail'); }); }
  async runTests() { this.results = await this.runner.runAll(); this.status = 'Automated test results refreshed.'; }
  render(renderer) { drawFrame(renderer, theme, ['Engine Sample163', 'Test execution is repeatable and centralized instead of manual-only.', this.status]); drawPanel(renderer, 120, 220, 500, 220, 'Test Results', this.results.length ? this.results.map((result) => `${result.id}: ${result.passed}`) : ['No tests run yet.']); }
}
