/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import AudioPlaylistTrackManagementScene from './AudioPlaylistTrackManagementScene.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { MediaTrackService, PlaylistManager } from '../../../src/engine/audio/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const mediaTracks = new MediaTrackService();
mediaTracks.register('track-alpha', { src: './assets/alpha.mp3', loop: false, volume: 0.45 });
mediaTracks.register('track-beta', { src: './assets/beta.mp3', loop: false, volume: 0.6 });
mediaTracks.register('track-gamma', { src: './assets/gamma.mp3', loop: false, volume: 0.8 });
const playlist = new PlaylistManager(mediaTracks);
playlist.registerPlaylist('sample140-playlist', ['track-alpha', 'track-beta', 'track-gamma']);

const scene = new AudioPlaylistTrackManagementScene(playlist);
engine.setScene(scene);
engine.start();

document.getElementById('playlist-play')?.addEventListener('click', () => scene.play());
document.getElementById('playlist-pause')?.addEventListener('click', () => scene.pause());
document.getElementById('playlist-next')?.addEventListener('click', () => scene.next());
document.getElementById('playlist-previous')?.addEventListener('click', () => scene.previous());
