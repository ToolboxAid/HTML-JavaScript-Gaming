import { Scene } from '/src/engine/scene/index.js'; import { drawFrame, drawPanel } from '/src/engine/debug/index.js'; import { Theme, ThemeTokens } from '/src/engine/theme/index.js'; import { ContentMigrationSystem } from '/src/engine/pipeline/index.js';
const theme = new Theme(ThemeTokens);
export default class ContentVersioningMigrationScene extends Scene {
  constructor() { super(); this.system = new ContentMigrationSystem(); this.system.register(1, (content) => ({ ...content, version: 2, layers: ['base'] })); this.content = null; this.status = 'Migrate older content forward.'; }
  run() { this.content = this.system.migrate({ version: 1, name: 'old-map' }, 2); this.status = 'Content migrated to the current format.'; }
  render(renderer) { drawFrame(renderer, theme, ['Engine Sample 1416', 'Content migrations keep data evolution centralized and trackable.', this.status]); drawPanel(renderer, 120, 220, 540, 220, 'Migration', [`Version: ${this.content?.version ?? 0}`, `Name: ${this.content?.name || 'n/a'}`, `Layers: ${this.content?.layers?.join(', ') || 'n/a'}`]); }
}
