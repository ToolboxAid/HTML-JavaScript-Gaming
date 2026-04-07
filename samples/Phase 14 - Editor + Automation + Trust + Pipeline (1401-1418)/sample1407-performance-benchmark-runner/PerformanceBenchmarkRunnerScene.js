/* Toolbox Aid David Quesenberry 03/22/2026 PerformanceBenchmarkRunnerScene.js */
import { Scene } from '../../../src/engine/scenes/index.js'; import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js'; import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js'; import { BenchmarkRunner } from '../../../src/engine/automation/index.js';
const theme = new Theme(ThemeTokens);
export default class PerformanceBenchmarkRunnerScene extends Scene {
  constructor() { super(); this.runner = new BenchmarkRunner(); this.results = []; this.runner.register('loop-10k', () => { let total = 0; for (let i = 0; i < 10000; i += 1) { total += i; } return total; }); this.runner.register('loop-50k', () => { let total = 0; for (let i = 0; i < 50000; i += 1) { total += i; } return total; }); this.status = 'Run the benchmark suite.'; }
  runBenches() { this.results = this.runner.runAll(); this.status = 'Benchmark metrics refreshed.'; }
  render(renderer) { drawFrame(renderer, theme, ['Engine Sample 1407', 'Benchmarks run through one reusable execution path for comparison.', this.status]); drawPanel(renderer, 120, 220, 520, 220, 'Benchmarks', this.results.length ? this.results.map((result) => `${result.id}: ${result.durationMs.toFixed(3)}ms`) : ['No benchmarks run yet.']); }
}
