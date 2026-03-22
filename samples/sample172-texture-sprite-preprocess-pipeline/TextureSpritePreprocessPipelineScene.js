import Scene from '../../engine/scenes/Scene.js'; import { drawFrame, drawPanel } from '../../engine/debug/index.js'; import { Theme, ThemeTokens } from '../../engine/theme/index.js'; import { TexturePreprocessPipeline } from '../../engine/pipeline/index.js';
const theme = new Theme(ThemeTokens);
export default class TextureSpritePreprocessPipelineScene extends Scene {
  constructor() { super(); this.pipeline = new TexturePreprocessPipeline(); this.texture = null; this.status = 'Preprocess a texture record.'; }
  run() { this.texture = this.pipeline.run({ width: 64, height: 32 }); this.status = 'Texture preprocessing complete.'; }
  render(renderer) { drawFrame(renderer, theme, ['Engine Sample172', 'Texture preprocessing normalizes visual content in one centralized step.', this.status]); drawPanel(renderer, 120, 220, 540, 220, 'Texture Output', [`Width: ${this.texture?.width ?? 0}`, `Height: ${this.texture?.height ?? 0}`, `Padded: ${this.texture?.padded ?? false}`, `Atlas Ready: ${this.texture?.atlasReady ?? false}`]); }
}
