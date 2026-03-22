import Scene from '../../engine/scenes/Scene.js'; import { drawFrame, drawPanel } from '../../engine/debug/index.js'; import { Theme, ThemeTokens } from '../../engine/theme/index.js'; import { AudioPreprocessPipeline } from '../../engine/pipeline/index.js';
const theme = new Theme(ThemeTokens);
export default class AudioPreprocessPipelineScene extends Scene {
  constructor() { super(); this.pipeline = new AudioPreprocessPipeline(); this.audio = null; this.status = 'Preprocess an audio record.'; }
  run() { this.audio = this.pipeline.run({ duration: 2.4 }); this.status = 'Audio preprocessing complete.'; }
  render(renderer) { drawFrame(renderer, theme, ['Engine Sample173', 'Audio preprocessing keeps asset preparation centralized and reusable.', this.status]); drawPanel(renderer, 120, 220, 540, 220, 'Audio Output', [`Sample Rate: ${this.audio?.sampleRate ?? 0}`, `Normalized: ${this.audio?.normalized ?? false}`, `Trimmed: ${this.audio?.trimmed ?? false}`]); }
}
