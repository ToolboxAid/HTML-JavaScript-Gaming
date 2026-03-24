/*
Toolbox Aid
David Quesenberry
03/22/2026
DistributionPackagingScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';

const theme = new Theme(ThemeTokens);

export default class DistributionPackagingScene extends Scene {
  constructor(packager, profiles) {
    super();
    this.packager = packager;
    this.profiles = profiles;
    this.packageManifest = null;
    this.status = 'Create package descriptors for different delivery targets.';
  }

  create(buildType) {
    const profileId = buildType === 'release' ? 'production' : buildType === 'test' ? 'debug' : 'demo';
    const profile = this.profiles.resolve(profileId);
    this.packageManifest = this.packager.createPackage({
      id: `sample144-${buildType}`,
      version: '1.0.0',
      profile,
      samples: ['sample141-settings-system', 'sample142-accessibility-options', 'sample144-distribution-packaging'],
      assets: [
        'samples/_shared/baseLayout.css',
        `profiles/${profile.id}.json`,
        'docs/build/sample-manifest.json',
      ],
      notes: [
        `Target: ${buildType}`,
        `Flags: ${profile.flags.join(', ')}`,
      ],
    });
    this.status = `Built ${buildType} package descriptor using the ${profile.id} profile.`;
  }

  render(renderer) {
    const manifest = this.packageManifest;

    drawFrame(renderer, theme, [
      'Engine Sample144',
      'Packaging collects entries, assets, and notes into a reusable release descriptor.',
      this.status,
    ]);

    renderer.drawRect(90, 220, 460, 200, '#0f172a');
    const files = manifest
      ? [
          ...manifest.samples.map((sample) => sample.entry),
          ...manifest.assets,
        ]
      : ['No package built yet.'];

    files.slice(0, 7).forEach((file, index) => {
      renderer.drawText(file, 115, 255 + index * 24, {
        color: '#dbeafe',
        font: '14px monospace',
      });
    });

    drawPanel(renderer, 600, 40, 300, 220, 'Package Descriptor', [
      `Id: ${manifest?.id || 'none'}`,
      `Version: ${manifest?.version || 'none'}`,
      `Profile: ${manifest?.profile || 'none'}`,
      `File Count: ${manifest?.fileCount || 0}`,
      `Generated: ${manifest?.generatedAt || 'n/a'}`,
      `Notes: ${manifest?.notes?.join(' | ') || 'none'}`,
    ]);
  }
}

