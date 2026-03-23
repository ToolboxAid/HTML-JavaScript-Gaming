/*
Toolbox Aid
David Quesenberry
03/22/2026
DeploymentProfilesScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';

const theme = new Theme(ThemeTokens);

export default class DeploymentProfilesScene extends Scene {
  constructor(profiles) {
    super();
    this.profiles = profiles;
    this.activeProfileId = 'debug';
    this.status = 'Choose a profile to resolve its runtime and packaging flags.';
  }

  select(profileId) {
    this.activeProfileId = profileId;
    this.status = `Resolved ${profileId} profile.`;
  }

  render(renderer) {
    const active = this.profiles.resolve(this.activeProfileId);
    const cards = this.profiles.list();

    drawFrame(renderer, theme, [
      'Engine Sample143',
      'Deployment profiles centralize per-build behavior instead of scattering conditionals.',
      this.status,
    ]);

    cards.forEach((profile, index) => {
      const isActive = profile.id === this.activeProfileId;
      const x = 90 + index * 190;
      renderer.drawRect(x, 225, 160, 180, isActive ? '#1d4ed8' : '#1e293b');
      renderer.strokeRect(x, 225, 160, 180, isActive ? '#bfdbfe' : '#64748b', 2);
      renderer.drawText(profile.id.toUpperCase(), x + 80, 255, {
        color: '#ffffff',
        font: '16px monospace',
        textAlign: 'center',
      });
      renderer.drawText(`Diag: ${profile.diagnostics}`, x + 16, 295, { color: '#dbeafe', font: '13px monospace' });
      renderer.drawText(`Analytics: ${profile.analytics}`, x + 16, 325, { color: '#dbeafe', font: '13px monospace' });
      renderer.drawText(`Assets: ${profile.optimizeAssets ? 'optimized' : 'raw'}`, x + 16, 355, { color: '#dbeafe', font: '13px monospace' });
      renderer.drawText(`Demo: ${profile.demoLimits ? 'limited' : 'full'}`, x + 16, 385, { color: '#dbeafe', font: '13px monospace' });
    });

    drawPanel(renderer, 630, 40, 270, 220, 'Resolved Profile', [
      `Active: ${active.id}`,
      `Flags: ${active.flags.join(', ')}`,
      `Diagnostics: ${active.diagnostics}`,
      `Analytics: ${active.analytics}`,
      `Optimize Assets: ${active.optimizeAssets}`,
      `Demo Limits: ${active.demoLimits ? JSON.stringify(active.demoLimits) : 'none'}`,
    ]);
  }
}
