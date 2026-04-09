/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import ChatPresenceLayerScene from './ChatPresenceLayerScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const scene = new ChatPresenceLayerScene();
engine.setScene(scene);
engine.start();

document.getElementById('chat-connect')?.addEventListener('click', () => scene.connectGuest());
document.getElementById('chat-away')?.addEventListener('click', () => scene.setAway());
document.getElementById('chat-send')?.addEventListener('click', () => scene.sendChat());
