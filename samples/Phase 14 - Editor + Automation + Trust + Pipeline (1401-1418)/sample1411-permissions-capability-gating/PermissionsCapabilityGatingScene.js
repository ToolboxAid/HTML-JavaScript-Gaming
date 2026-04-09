import { Scene } from '/src/engine/scenes/index.js'; import { drawFrame, drawPanel } from '/src/engine/debug/index.js'; import { Theme, ThemeTokens } from '/src/engine/theme/index.js'; import { PermissionGate } from '/src/engine/security/index.js';
const theme = new Theme(ThemeTokens);
export default class PermissionsCapabilityGatingScene extends Scene {
  constructor() { super(); this.gate = new PermissionGate({ admin: ['edit', 'publish'], guest: ['view'] }); this.role = 'guest'; this.status = 'Switch role to compare allowed capabilities.'; }
  setRole(role) { this.role = role; this.status = `Role switched to ${role}.`; }
  render(renderer) { drawFrame(renderer, theme, ['Engine Sample 1411', 'Capability rules stay structured and reusable instead of being scattered conditionals.', this.status]); drawPanel(renderer, 120, 220, 560, 220, 'Permissions', [`Role: ${this.role}`, `Can Edit: ${this.gate.can(this.role, 'edit')}`, `Can Publish: ${this.gate.can(this.role, 'publish')}`, `Can View: ${this.gate.can(this.role, 'view')}`]); }
}
