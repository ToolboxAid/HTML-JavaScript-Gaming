import { Scene } from '../../../src/engine/scenes/index.js'; import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js'; import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js'; import { DataIntegrityService } from '../../../src/engine/security/index.js';
const theme = new Theme(ThemeTokens);
export default class SaveDataIntegrityChecksScene extends Scene {
  constructor() { super(); this.integrity = new DataIntegrityService(); this.record = null; this.result = null; this.status = 'Seal a save record, then verify a tampered version.'; }
  seal() { this.record = this.integrity.seal({ hp: 4, coins: 12 }); this.result = this.integrity.verify(this.record); this.status = 'Fresh save sealed and verified.'; }
  tamper() { if (this.record) { this.result = this.integrity.verify({ ...this.record, payload: '{"hp":999,"coins":12}' }); this.status = 'Tampered save verified and rejected.'; } }
  render(renderer) { drawFrame(renderer, theme, ['Engine Sample 1410', 'Integrity checks catch data corruption or tampering before use.', this.status]); drawPanel(renderer, 120, 220, 560, 220, 'Integrity', [`Checksum: ${this.record?.checksum || 'n/a'}`, `Passed: ${this.result?.passed ?? 'n/a'}`, `Detail: ${this.result?.detail || 'none'}`]); }
}
