/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import LobbySessionSystemScene from './LobbySessionSystemScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const scene = new LobbySessionSystemScene();
engine.setScene(scene);
engine.start();

document.getElementById('lobby-create')?.addEventListener('click', () => scene.create());
document.getElementById('lobby-join')?.addEventListener('click', () => scene.join());
document.getElementById('lobby-leave')?.addEventListener('click', () => scene.leave());
