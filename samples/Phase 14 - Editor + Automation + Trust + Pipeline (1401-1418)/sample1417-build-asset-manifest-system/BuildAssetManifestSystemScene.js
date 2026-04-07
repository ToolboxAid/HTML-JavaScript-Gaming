import { Scene } from '../../../src/engine/scenes/index.js'; import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js'; import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js'; import { BuildAssetManifestSystem } from '../../../src/engine/pipeline/index.js';
const theme = new Theme(ThemeTokens);
export default class BuildAssetManifestSystemScene extends Scene {
  constructor() { super(); this.system = new BuildAssetManifestSystem(); this.manifest = null; this.validation = null; this.status = 'Build a manifest for a sample asset set.'; }
  run() { this.manifest = this.system.createManifest({ buildId: 'sample175', assets: [{ id: 'hero', path: 'assets/hero.png' }, { id: 'music', path: 'assets/music.mp3' }] }); this.validation = this.system.validate(this.manifest); this.status = 'Manifest generated and validated.'; }
  render(renderer) { drawFrame(renderer, theme, ['Engine Sample 1417', 'Build manifests describe included content in a reusable structure.', this.status]); drawPanel(renderer, 120, 220, 560, 220, 'Manifest', [`Build: ${this.manifest?.buildId || 'n/a'}`, `Assets: ${this.manifest?.assetCount ?? 0}`, `Valid: ${this.validation?.passed ?? 'n/a'}`]); }
}
