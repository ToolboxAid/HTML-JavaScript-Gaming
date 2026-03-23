/*
Toolbox Aid
David Quesenberry
03/22/2026
AudioPlaylistTrackManagementScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class AudioPlaylistTrackManagementScene extends Scene {
  constructor(playlist) {
    super();
    this.playlist = playlist;
    this.status = 'Use the controls to manage playlist order and active track.';
  }

  play() {
    this.playlist.play('sample140-playlist');
    this.status = 'Playlist play requested.';
  }

  pause() {
    this.playlist.pause('sample140-playlist');
    this.status = 'Playlist paused.';
  }

  next() {
    this.playlist.next('sample140-playlist');
    this.status = 'Advanced to next track.';
  }

  previous() {
    this.playlist.previous('sample140-playlist');
    this.status = 'Moved to previous track.';
  }

  render(renderer) {
    const state = this.playlist.getState('sample140-playlist');
    drawFrame(renderer, theme, [
      'Engine Sample140',
      'Track order and current selection are managed by a reusable playlist service.',
      this.status,
    ]);

    renderer.drawRect(90, 220, 480, 180, '#0f172a');
    state?.tracks.forEach((trackId, index) => {
      renderer.drawRect(120, 250 + index * 42, 380, 28, state.index === index ? '#34d399' : '#334155');
      renderer.drawText(trackId, 136, 269 + index * 42, { color: '#ffffff', font: '15px monospace' });
    });

    drawPanel(renderer, 620, 34, 300, 160, 'Playlist Management', [
      `Current Index: ${state?.index ?? 0}`,
      `Current Track: ${state?.currentTrackId ?? 'none'}`,
      `Track Count: ${state?.tracks.length ?? 0}`,
      'Use Previous / Next to rotate the active track.',
    ]);
  }
}
