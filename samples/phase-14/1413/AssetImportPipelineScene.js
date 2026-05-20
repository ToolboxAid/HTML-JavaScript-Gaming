import { Scene } from '/src/engine/scene/index.js'; import { drawFrame, drawPanel } from '/src/engine/debug/index.js'; import { Theme, ThemeTokens } from '/src/engine/theme/index.js'; import AssetImportPipeline from '/tools/shared/pipeline/AssetImportPipeline.js';
const theme = new Theme(ThemeTokens);
export default class AssetImportPipelineScene extends Scene {
  constructor(options = {}) {
    super();
    this.pipeline = new AssetImportPipeline([(asset) => ({ ...asset, imported: true }), (asset) => ({ ...asset, cataloged: true })]);
    this.asset = null;
    this.importInput = options.importInput && typeof options.importInput === 'object'
      ? options.importInput
      : { id: '', source: '' };
    this.status = typeof options.sourceStatus === 'string' && options.sourceStatus
      ? options.sourceStatus
      : 'Import a raw asset through structured steps.';
  }

  runImport() {
    const assetId = String(this.importInput.id || '').trim();
    const source = String(this.importInput.source || '').trim();
    if (!assetId || !source) {
      this.asset = null;
      this.status = 'No explicit JSON import input is available.';
      return;
    }
    this.asset = this.pipeline.run({ id: assetId, source });
    this.status = `Asset import pipeline completed for ${assetId}.`;
  }

  render(renderer) { drawFrame(renderer, theme, ['Engine Sample 1413', 'Asset imports move through a structured pipeline instead of ad hoc repo steps.', this.status]); drawPanel(renderer, 120, 220, 540, 220, 'Import Result', [`Id: ${this.asset?.id || 'n/a'}`, `Imported: ${this.asset?.imported ?? false}`, `Cataloged: ${this.asset?.cataloged ?? false}`]); }
}
