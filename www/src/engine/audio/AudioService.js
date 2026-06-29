/*
Toolbox Aid
David Quesenberry
03/22/2026
AudioService.js
*/
import WebAudioToneBackend from './WebAudioToneBackend.js';

function cloneNotes(notes = []) {
  return notes.map((note) => ({ ...note }));
}

export default class AudioService {
  constructor({
    backend = new WebAudioToneBackend(),
    unlockTarget = globalThis.document ?? globalThis.window ?? null,
  } = {}) {
    this.backend = backend;
    this.unlockTarget = unlockTarget;
    this.tracks = new Map();
    this.ready = false;
    this.muted = false;
    this.lastError = '';
    this.isAttached = false;
    this.unlockHandler = this.unlockHandler.bind(this);
  }

  isSupported() {
    return typeof this.backend?.isSupported === 'function' ? this.backend.isSupported() : true;
  }

  attach(target = this.unlockTarget) {
    if (this.isAttached || !target?.addEventListener) {
      return;
    }

    this.unlockTarget = target;
    target.addEventListener('pointerdown', this.unlockHandler);
    target.addEventListener('keydown', this.unlockHandler);
    target.addEventListener('touchstart', this.unlockHandler);
    this.isAttached = true;
  }

  detach() {
    if (!this.isAttached || !this.unlockTarget?.removeEventListener) {
      this.isAttached = false;
      return;
    }

    this.unlockTarget.removeEventListener('pointerdown', this.unlockHandler);
    this.unlockTarget.removeEventListener('keydown', this.unlockHandler);
    this.unlockTarget.removeEventListener('touchstart', this.unlockHandler);
    this.isAttached = false;
  }

  async unlock() {
    return this.resume();
  }

  async unlockHandler() {
    await this.unlock();
  }

  async resume() {
    if (typeof this.backend?.resume !== 'function') {
      this.ready = this.isSupported();
      return this.ready;
    }

    try {
      this.ready = await this.backend.resume();
      this.lastError = '';
      return this.ready;
    } catch (error) {
      this.ready = false;
      this.lastError = error?.message || 'Audio resume failed.';
      return false;
    }
  }

  setMuted(muted = true) {
    this.muted = Boolean(muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  async playOneShot(id, note = {}, options = {}) {
    if (Array.isArray(note)) {
      return this.playSequence(id, {
        notes: note,
        loop: false,
        category: options.category ?? 'sfx',
        volume: options.volume ?? 0.2,
      });
    }

    return this.triggerSfx(id, note, options);
  }

  async triggerSfx(id, note = {}) {
    const track = {
      id,
      category: 'sfx',
      loop: false,
      playing: false,
      paused: false,
      notes: [note],
      noteIndex: 0,
      remainingSeconds: 0,
      volume: note.volume ?? 0.2,
      triggeredCount: 0,
      lastNote: null,
    };

    this.tracks.set(id, track);
    await this.playNote(track, note);
    track.playing = false;
    return this.getTrackState(id);
  }

  playSequence(id, {
    notes = [],
    loop = false,
    category = 'music',
    volume = 0.2,
  } = {}) {
    const safeNotes = cloneNotes(notes);
    const track = {
      id,
      category,
      loop,
      playing: safeNotes.length > 0,
      paused: false,
      notes: safeNotes,
      noteIndex: 0,
      remainingSeconds: 0,
      volume,
      triggeredCount: 0,
      lastNote: null,
    };

    this.tracks.set(id, track);
    if (safeNotes.length > 0) {
      this.startCurrentNote(track);
    }
    return this.getTrackState(id);
  }

  playMusic(id, options = {}) {
    return this.playSequence(id, {
      ...options,
      category: 'music',
    });
  }

  pause(id) {
    const track = this.tracks.get(id);
    if (!track) {
      return false;
    }

    track.paused = true;
    track.playing = false;
    return true;
  }

  resumeTrack(id) {
    const track = this.tracks.get(id);
    if (!track) {
      return false;
    }

    track.paused = false;
    track.playing = track.notes.length > 0;
    return true;
  }

  stop(id) {
    const track = this.tracks.get(id);
    if (!track) {
      return false;
    }

    track.playing = false;
    track.paused = false;
    track.noteIndex = 0;
    track.remainingSeconds = 0;
    return true;
  }

  stopAll() {
    for (const id of this.tracks.keys()) {
      this.stop(id);
    }
  }

  setVolume(id, volume) {
    const track = this.tracks.get(id);
    if (!track) {
      return false;
    }

    track.volume = Math.max(0, Math.min(1, volume));
    return true;
  }

  update(dtSeconds = 0) {
    for (const track of this.tracks.values()) {
      if (!track.playing || track.paused || track.notes.length === 0) {
        continue;
      }

      track.remainingSeconds -= dtSeconds;
      while (track.playing && track.remainingSeconds <= 0) {
        track.noteIndex += 1;
        if (track.noteIndex >= track.notes.length) {
          if (track.loop) {
            track.noteIndex = 0;
          } else {
            track.playing = false;
            break;
          }
        }

        this.startCurrentNote(track, track.remainingSeconds);
      }
    }
  }

  startCurrentNote(track, carrySeconds = 0) {
    const note = track.notes[track.noteIndex];
    if (!note) {
      track.playing = false;
      return;
    }

    track.playing = true;
    track.paused = false;
    track.remainingSeconds = Math.max(note.durationSeconds ?? 0.25, 0.02) + carrySeconds;
    this.playNote(track, note);
  }

  async playNote(track, note) {
    const payload = {
      ...note,
      volume: note.volume ?? track.volume,
    };

    track.triggeredCount += 1;
    track.lastNote = { ...payload };

    try {
      if (this.muted) {
        this.lastError = '';
        return false;
      }
      if (typeof this.backend?.playTone === 'function') {
        await this.backend.playTone(payload);
      }
      this.lastError = '';
    } catch (error) {
      this.lastError = error?.message || 'Audio playback failed.';
    }
  }

  getTrackState(id) {
    const track = this.tracks.get(id);
    if (!track) {
      return null;
    }

    return {
      id: track.id,
      category: track.category,
      loop: track.loop,
      playing: track.playing,
      paused: track.paused,
      noteIndex: track.noteIndex,
      remainingSeconds: track.remainingSeconds,
      volume: track.volume,
      triggeredCount: track.triggeredCount,
      lastNote: track.lastNote ? { ...track.lastNote } : null,
    };
  }

  getSnapshot() {
    return {
      supported: this.isSupported(),
      ready: this.ready,
      muted: this.muted,
      lastError: this.lastError,
      tracks: Array.from(this.tracks.keys()).map((id) => this.getTrackState(id)),
    };
  }
}
