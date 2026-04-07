/*
Toolbox Aid
David Quesenberry
03/22/2026
MP3PlayerScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { MediaTrackService } from '../../../engine/audio/index.js';

const theme = new Theme(ThemeTokens);

export default class MP3PlayerScene extends Scene {
  constructor(mediaTracks) {
    super();
    this.mediaTracks = mediaTracks;
    this.status = 'Use the controls to play, pause, stop, seek, loop, and change volume.';
  }

  play() {
    this.mediaTracks.play('sample138-track');
    this.status = 'Track play requested.';
  }

  pause() {
    this.mediaTracks.pause('sample138-track');
    this.status = 'Track paused.';
  }

  stop() {
    this.mediaTracks.stop('sample138-track');
    this.status = 'Track stopped and rewound.';
  }

  seek(timeSeconds) {
    this.mediaTracks.seek('sample138-track', timeSeconds);
    this.status = `Seeked to ${timeSeconds}s.`;
  }

  playSegment(startSeconds, durationSeconds) {
    this.mediaTracks.playSegment('sample138-track', startSeconds, durationSeconds);
    this.status = `Playing from ${startSeconds}s for ${durationSeconds}s.`;
  }

  setLoop(loop) {
    this.mediaTracks.setLoop('sample138-track', loop);
    this.status = `Loop ${loop ? 'enabled' : 'disabled'}.`;
  }

  setVolume(volume) {
    this.mediaTracks.setVolume('sample138-track', volume);
    this.status = `Volume set to ${Math.round(volume * 100)}%.`;
  }

  render(renderer) {
    const track = this.mediaTracks.getState('sample138-track');
    const progressWidth = 360;
    const duration = track?.duration ?? 0;
    const progress = duration > 0
      ? Math.max(0, Math.min(1, (track?.currentTime ?? 0) / duration))
      : 0;
    drawFrame(renderer, theme, [
      'Engine sample 1001',
      'MP3-style controls route through an engine-owned media track service.',
      this.status,
    ]);

    renderer.drawRect(90, 220, 480, 180, '#0f172a');
    renderer.drawRect(120, 320, progressWidth, 16, '#334155');
    renderer.drawRect(120, 320, progressWidth * progress, 16, '#38bdf8');
    renderer.drawRect(120, 360, (track?.volume ?? 0) * 240, 10, '#34d399');

    drawPanel(renderer, 620, 34, 300, 180, 'MP3 Player', [
      `Paused: ${track?.paused ?? true}`,
      `Loop: ${track?.loop ?? false}`,
      `Time: ${(track?.currentTime ?? 0).toFixed(1)}s`,
      `Duration: ${(track?.duration ?? 0).toFixed(1)}s`,
      `Volume: ${Math.round((track?.volume ?? 0) * 100)}%`,
      `Segment Active: ${track?.segmentActive ?? false}`,
      `Last Error: ${this.mediaTracks.lastError || 'none'}`,
    ]);
  }
}
