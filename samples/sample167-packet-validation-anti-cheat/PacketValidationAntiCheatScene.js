import Scene from '../../engine/scenes/Scene.js'; import { drawFrame, drawPanel } from '../../engine/debug/index.js'; import { Theme, ThemeTokens } from '../../engine/theme/index.js'; import { PacketValidator } from '../../engine/security/index.js';
const theme = new Theme(ThemeTokens);
export default class PacketValidationAntiCheatScene extends Scene {
  constructor() { super(); this.validator = new PacketValidator({ allowedTypes: ['move'] }); this.last = null; this.status = 'Validate a normal or suspicious packet.'; }
  validateGood() { this.last = this.validator.validate({ from: 'player-1', type: 'move', payload: { x: 3 } }); this.status = 'Good packet checked.'; }
  validateBad() { this.last = this.validator.validate({ from: '', type: 'teleport', payload: { x: 999, y: 999, exploit: true } }); this.status = 'Suspicious packet checked.'; }
  render(renderer) { drawFrame(renderer, theme, ['Engine Sample167', 'Packet validation and anti-cheat basics remain centralized in trust-aware networking paths.', this.status]); drawPanel(renderer, 120, 220, 520, 200, 'Packet Validation', [`Passed: ${this.last?.passed ?? 'n/a'}`, `Detail: ${this.last?.detail || 'none'}`, `Size: ${this.last?.size ?? 0}`]); }
}
