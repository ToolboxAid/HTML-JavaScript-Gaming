/*
Toolbox Aid
David Quesenberry
03/23/2026
GaplessLoopPlayer.js
*/
function getAudioContextCtor() {
  return globalThis.AudioContext || globalThis.webkitAudioContext || null;
}

export default class GaplessLoopPlayer {
  constructor() {
    this.context = null;
    this.registry = new Map();
    this.bufferCache = new Map();
    this.active = new Map();
  }

  isSupported() {
    return !!getAudioContextCtor() && typeof globalThis.fetch === 'function';
  }

  ensureContext() {
    if (this.context || !this.isSupported()) {
      return this.context;
    }

    const AudioContextCtor = getAudioContextCtor();
    this.context = new AudioContextCtor();
    return this.context;
  }

  async resume() {
    const context = this.ensureContext();
    if (!context) {
      return false;
    }

    if (typeof context.resume === 'function') {
      await context.resume();
    }
    return true;
  }

  register(id, {
    src,
    volume = 1,
    overlapSeconds = 0.03,
    fadeSeconds = 0.01,
  } = {}) {
    this.registry.set(id, {
      src,
      volume: Math.max(0, Math.min(1, volume)),
      overlapSeconds: Math.max(0, overlapSeconds),
      fadeSeconds: Math.max(0, fadeSeconds),
    });
  }

  async loadBuffer(id) {
    const existing = this.bufferCache.get(id);
    if (existing) {
      return existing;
    }

    const config = this.registry.get(id);
    const context = this.ensureContext();
    if (!config?.src || !context) {
      return null;
    }

    const bufferPromise = fetch(config.src)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => context.decodeAudioData(arrayBuffer.slice(0)));
    this.bufferCache.set(id, bufferPromise);
    return bufferPromise;
  }

  async play(id, { loopCount = null } = {}) {
    const config = this.registry.get(id);
    if (!config) {
      return false;
    }

    await this.resume();
    const context = this.ensureContext();
    const buffer = await this.loadBuffer(id);
    if (!context || !buffer) {
      return false;
    }

    this.stop(id);

    const token = Symbol(id);
    const state = {
      token,
      timerId: null,
      sources: new Set(),
    };
    this.active.set(id, state);

    const duration = Math.max(0.05, buffer.duration);
    const overlap = Math.min(config.overlapSeconds, Math.max(0, duration * 0.25));
    const loopWindow = Math.max(0.02, duration - overlap);
    const fade = Math.min(config.fadeSeconds, duration * 0.25, loopWindow * 0.5);

    const launchSource = (startTime, isLast) => {
      const current = this.active.get(id);
      if (!current || current.token !== token) {
        return;
      }

      const source = context.createBufferSource();
      const gainNode = context.createGain();
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(context.destination);

      const endTime = startTime + duration;
      gainNode.gain.setValueAtTime(config.volume, startTime);
      if (fade > 0) {
        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.linearRampToValueAtTime(config.volume, startTime + fade);
        const fadeOutStart = Math.max(startTime + fade, endTime - fade);
        gainNode.gain.setValueAtTime(config.volume, fadeOutStart);
        gainNode.gain.linearRampToValueAtTime(0.0001, endTime);
      }

      source.start(startTime);
      source.stop(endTime);
      current.sources.add(source);
      source.onended = () => {
        current.sources.delete(source);
      };

      if (isLast) {
        current.timerId = globalThis.setTimeout?.(() => {
          if (this.active.get(id)?.token === token) {
            this.stop(id);
          }
        }, Math.max(0, (endTime - context.currentTime) * 1000));
      }
    };

    const startAt = context.currentTime + 0.02;
    if (loopCount && loopCount > 0) {
      for (let index = 0; index < loopCount; index += 1) {
        launchSource(startAt + index * loopWindow, index === loopCount - 1);
      }
      return true;
    }

    const scheduleContinuous = (startTime) => {
      const current = this.active.get(id);
      if (!current || current.token !== token) {
        return;
      }

      launchSource(startTime, false);
      current.timerId = globalThis.setTimeout?.(() => {
        scheduleContinuous(startTime + loopWindow);
      }, Math.max(0, (loopWindow * 1000) - 12));
    };

    scheduleContinuous(startAt);
    return true;
  }

  stop(id) {
    const state = this.active.get(id);
    if (!state) {
      return false;
    }

    if (state.timerId !== null) {
      globalThis.clearTimeout?.(state.timerId);
      state.timerId = null;
    }

    state.sources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // Ignore stop races from already-finished sources.
      }
    });
    state.sources.clear();
    this.active.delete(id);
    return true;
  }

  stopAll() {
    Array.from(this.active.keys()).forEach((id) => this.stop(id));
  }
}
