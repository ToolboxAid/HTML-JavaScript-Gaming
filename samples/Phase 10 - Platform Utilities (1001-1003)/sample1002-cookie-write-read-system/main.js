/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../engine/core/Engine.js';
import CookieWriteReadScene from './CookieWriteReadScene.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { CookieStorageService } from '../../../engine/persistence/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const scene = new CookieWriteReadScene(new CookieStorageService());
engine.setScene(scene);
engine.start();

document.getElementById('cookie-write-mint')?.addEventListener('click', () => scene.write('mint'));
document.getElementById('cookie-write-ember')?.addEventListener('click', () => scene.write('ember'));
document.getElementById('cookie-read')?.addEventListener('click', () => scene.read());
document.getElementById('cookie-clear')?.addEventListener('click', () => scene.clear());
