/*
Toolbox Aid
David Quesenberry
03/22/2026
MediaTrackService.js
*/
import HtmlAudioMediaBackend from './HtmlAudioMediaBackend.js';

export default class MediaTrackService {
  constructor({ backend = new HtmlAudioMediaBackend() } = {}) {
    this.backend = backend;
    this.tracks = new Map();
    this.segmentTimers = new Map();
    this.lastError = '';
  }

  isSupported() {
    return typeof this.backend?.isSupported === 'function'
      ? this.backend.isSupported()
      : false;
  }

  register(id, { src, loop = false, volume = 1 } = {}) {
    const audio = this.backend.createTrack(src);
    if (!audio) {
      this.lastError = 'Media playback is unavailable in this environment.';
      return null;
    }

    audio.loop = loop;
    audio.volume = volume;
    this.tracks.set(id, audio);
    this.lastError = '';
    return this.getState(id);
  }

  async play(id) {
    const track = this.tracks.get(id);
    if (!track) {
      this.lastError = `Unknown track: ${id}`;
      return false;
    }

    try {
      this.clearSegmentTimer(id);
      await track.play?.();
      this.lastError = '';
      return true;
    } catch (error) {
      this.lastError = error?.message || 'Track play failed.';
      return false;
    }
  }

  pause(id) {
    const track = this.tracks.get(id);
    if (!track) {
      return false;
    }
    this.clearSegmentTimer(id);
    track.pause?.();
    return true;
  }

  stop(id) {
    const track = this.tracks.get(id);
    if (!track) {
      return false;
    }

    this.clearSegmentTimer(id);
    track.pause?.();
    track.currentTime = 0;
    return true;
  }

  seek(id, timeSeconds) {
    const track = this.tracks.get(id);
    if (!track) {
      return false;
    }

    track.currentTime = Math.max(0, timeSeconds);
    return true;
  }

  async playSegment(id, startSeconds = 0, durationSeconds = 1) {
    const track = this.tracks.get(id);
    if (!track) {
      this.lastError = `Unknown track: ${id}`;
      return false;
    }

    this.clearSegmentTimer(id);
    track.currentTime = Math.max(0, startSeconds);

    try {
      await track.play?.();
      const safeDuration = Math.max(0, durationSeconds);
      const timerId = globalThis.setTimeout?.(() => {
        track.pause?.();
        this.segmentTimers.delete(id);
      }, safeDuration * 1000);

      if (timerId !== undefined) {
        this.segmentTimers.set(id, timerId);
      }

      this.lastError = '';
      return true;
    } catch (error) {
      this.lastError = error?.message || 'Track segment play failed.';
      return false;
    }
  }

  setLoop(id, loop) {
    const track = this.tracks.get(id);
    if (!track) {
      return false;
    }

    track.loop = !!loop;
    return true;
  }

  setVolume(id, volume) {
    const track = this.tracks.get(id);
    if (!track) {
      return false;
    }

    track.volume = Math.max(0, Math.min(1, volume));
    return true;
  }

  getState(id) {
    const track = this.tracks.get(id);
    if (!track) {
      return null;
    }

    return {
      id,
      currentTime: track.currentTime ?? 0,
      duration: Number.isFinite(track.duration) ? track.duration : 0,
      loop: !!track.loop,
      volume: track.volume ?? 1,
      paused: !!track.paused,
      segmentActive: this.segmentTimers.has(id),
      src: track.src ?? '',
    };
  }

  clearSegmentTimer(id) {
    const timerId = this.segmentTimers.get(id);
    if (timerId !== undefined) {
      globalThis.clearTimeout?.(timerId);
      this.segmentTimers.delete(id);
    }
  }
}
