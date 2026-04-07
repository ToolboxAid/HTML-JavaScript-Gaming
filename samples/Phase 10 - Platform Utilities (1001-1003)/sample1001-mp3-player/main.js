/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import MP3PlayerScene from './MP3PlayerScene.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { MediaTrackService } from '../../../src/engine/audio/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const mediaTracks = new MediaTrackService();
mediaTracks.register('sample138-track', {
  src: './assets/sample138.mp3',
  loop: false,
  volume: 0.4,
});
const scene = new MP3PlayerScene(mediaTracks);
engine.setScene(scene);
engine.start();

document.getElementById('mp3-play')?.addEventListener('click', () => scene.play());
document.getElementById('mp3-pause')?.addEventListener('click', () => scene.pause());
document.getElementById('mp3-stop')?.addEventListener('click', () => scene.stop());
document.getElementById('mp3-seek')?.addEventListener('click', () => scene.seek(4));
document.getElementById('mp3-play-segment')?.addEventListener('click', () => {
  const startSeconds = Number(document.getElementById('mp3-seek-start')?.value ?? 0);
  const durationSeconds = Number(document.getElementById('mp3-play-duration')?.value ?? 1);
  scene.playSegment(startSeconds, durationSeconds);
});
document.getElementById('mp3-loop')?.addEventListener('click', () => scene.setLoop(true));
document.getElementById('mp3-unloop')?.addEventListener('click', () => scene.setLoop(false));
document.getElementById('mp3-volume')?.addEventListener('input', (event) => {
  scene.setVolume(Number(event.target.value));
});
