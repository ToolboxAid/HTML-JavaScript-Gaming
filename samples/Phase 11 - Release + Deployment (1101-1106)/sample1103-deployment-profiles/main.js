/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../engine/core/Engine.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { DeploymentProfiles } from '../../../engine/release/index.js';
import DeploymentProfilesScene from './DeploymentProfilesScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const profiles = new DeploymentProfiles({
  debug: { diagnostics: true, optimizeAssets: false },
  development: { diagnostics: true, analytics: false, optimizeAssets: true },
  demo: { diagnostics: false, analytics: true, demoLimits: { levels: 2 }, optimizeAssets: true },
  production: { diagnostics: false, analytics: true, optimizeAssets: true },
});
const scene = new DeploymentProfilesScene(profiles);
engine.setScene(scene);
engine.start();

document.getElementById('profile-debug')?.addEventListener('click', () => scene.select('debug'));
document.getElementById('profile-demo')?.addEventListener('click', () => scene.select('demo'));
document.getElementById('profile-production')?.addEventListener('click', () => scene.select('production'));
document.getElementById('profile-development')?.addEventListener('click', () => scene.select('development'));
