import Scene from '../../engine/scenes/Scene.js'; import { drawFrame, drawPanel } from '../../engine/debug/index.js'; import { Theme, ThemeTokens } from '../../engine/theme/index.js'; import { ContentValidationPipeline } from '../../engine/pipeline/index.js';
const theme = new Theme(ThemeTokens);
export default class ContentValidationPipelineScene extends Scene {
  constructor() { super(); this.pipeline = new ContentValidationPipeline([(content) => ({ passed: Boolean(content.id), detail: 'id required' }), (content) => ({ passed: Boolean(content.path), detail: 'path required' })]); this.report = null; this.status = 'Validate a content record.'; }
  good() { this.report = this.pipeline.run({ id: 'hero', path: 'assets/hero.png' }); this.status = 'Good content validated.'; }
  bad() { this.report = this.pipeline.run({ id: '', path: '' }); this.status = 'Bad content rejected.'; }
  render(renderer) { drawFrame(renderer, theme, ['Engine Sample176', 'Content validation catches problems before they become runtime failures.', this.status]); drawPanel(renderer, 120, 220, 560, 220, 'Validation', this.report ? [`Passed: ${this.report.passed}`, ...this.report.results.map((result) => `${result.detail}: ${result.passed}`)] : ['No validation run yet.']); }
}
