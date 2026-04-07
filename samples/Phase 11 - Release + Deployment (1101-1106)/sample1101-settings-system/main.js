/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { SettingsSystem } from '../../../src/engine/release/index.js';
import SettingsSystemScene from './SettingsSystemScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const settings = new SettingsSystem({
  namespace: 'toolboxaid:sample141',
  defaults: {
    audio: { musicVolume: 0.6, sfxVolume: 0.8 },
    video: { fullscreenPreferred: false },
    gameplay: { difficulty: 'normal' },
  },
});
settings.load();

const scene = new SettingsSystemScene(settings);
engine.setScene(scene);
engine.start();

document.getElementById('settings-load')?.addEventListener('click', () => scene.load());
document.getElementById('settings-save')?.addEventListener('click', () => scene.save());
document.getElementById('settings-volume')?.addEventListener('click', () => scene.bumpVolume());
document.getElementById('settings-fullscreen')?.addEventListener('click', () => scene.toggleFullscreenPref());
document.getElementById('settings-difficulty')?.addEventListener('click', () => scene.cycleDifficulty());
document.getElementById('settings-reset')?.addEventListener('click', () => scene.reset());
