/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { DeploymentProfiles, DistributionPackager } from '../../../src/engine/release/index.js';
import DistributionPackagingScene from './DistributionPackagingScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const profiles = new DeploymentProfiles({
  debug: { diagnostics: true, optimizeAssets: false },
  demo: { analytics: false, demoLimits: { levels: 3 }, optimizeAssets: true },
  production: { analytics: true, optimizeAssets: true },
});
const packager = new DistributionPackager();
const scene = new DistributionPackagingScene(packager, profiles);
engine.setScene(scene);
engine.start();

document.getElementById('package-share')?.addEventListener('click', () => scene.create('share'));
document.getElementById('package-test')?.addEventListener('click', () => scene.create('test'));
document.getElementById('package-release')?.addEventListener('click', () => scene.create('release'));
