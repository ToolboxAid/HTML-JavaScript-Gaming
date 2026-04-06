import { Scene } from '../../../engine/scenes/index.js'; import { drawFrame, drawPanel } from '../../../engine/debug/index.js'; import { Theme, ThemeTokens } from '../../../engine/theme/index.js'; import { SessionTrustValidator } from '../../../engine/security/index.js';
const theme = new Theme(ThemeTokens);
export default class TrustSessionValidationScene extends Scene {
  constructor() { super(); this.validator = new SessionTrustValidator(); this.result = null; this.status = 'Validate fresh or stale session trust.'; }
  validateFresh() { this.result = this.validator.validate({ issuedAt: 0, maxAgeMs: 100, nonce: 'abc', playerId: 'player-1' }, { now: 50 }); this.status = 'Fresh session validated.'; }
  validateStale() { this.result = this.validator.validate({ issuedAt: 0, maxAgeMs: 100, nonce: '', playerId: 'player-1' }, { now: 300 }); this.status = 'Stale session rejected.'; }
  render(renderer) { drawFrame(renderer, theme, ['Engine Sample 1412', 'Session trust validation catches invalid or stale session state early.', this.status]); drawPanel(renderer, 120, 220, 560, 220, 'Session Trust', [`Passed: ${this.result?.passed ?? 'n/a'}`, `Detail: ${this.result?.detail || 'none'}`, `Age: ${this.result?.ageMs ?? 0}ms`]); }
}
