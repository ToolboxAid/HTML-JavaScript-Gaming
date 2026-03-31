/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../engine/core/Engine.js';
import SaveSlotsProfilesScene from './SaveSlotsProfilesScene.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const scene = new SaveSlotsProfilesScene();
engine.setScene(scene);
engine.start();

document.getElementById('slot-a')?.addEventListener('click', () => scene.choose('slot-a'));
document.getElementById('slot-b')?.addEventListener('click', () => scene.choose('slot-b'));
document.getElementById('slot-c')?.addEventListener('click', () => scene.choose('slot-c'));
document.getElementById('save-slot')?.addEventListener('click', () => scene.save());
document.getElementById('load-slot')?.addEventListener('click', () => scene.load());
document.getElementById('increase-hp')?.addEventListener('click', () => scene.increaseHp());
