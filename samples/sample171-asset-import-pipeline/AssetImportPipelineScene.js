import Scene from '../../engine/scenes/Scene.js'; import { drawFrame, drawPanel } from '../../engine/debug/index.js'; import { Theme, ThemeTokens } from '../../engine/theme/index.js'; import { AssetImportPipeline } from '../../engine/pipeline/index.js';
const theme = new Theme(ThemeTokens);
export default class AssetImportPipelineScene extends Scene {
  constructor() { super(); this.pipeline = new AssetImportPipeline([(asset) => ({ ...asset, imported: true }), (asset) => ({ ...asset, cataloged: true })]); this.asset = null; this.status = 'Import a raw asset through structured steps.'; }
  runImport() { this.asset = this.pipeline.run({ id: 'hero-sprite', source: 'drop-folder' }); this.status = 'Asset import pipeline completed.'; }
  render(renderer) { drawFrame(renderer, theme, ['Engine Sample171', 'Asset imports move through a structured pipeline instead of ad hoc repo steps.', this.status]); drawPanel(renderer, 120, 220, 540, 220, 'Import Result', [`Id: ${this.asset?.id || 'n/a'}`, `Imported: ${this.asset?.imported ?? false}`, `Cataloged: ${this.asset?.cataloged ?? false}`]); }
}
