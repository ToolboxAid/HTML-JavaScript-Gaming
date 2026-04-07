/*
Toolbox Aid
David Quesenberry
03/22/2026
WebAudioToneBackend.js
*/
function getAudioContextCtor() {
  return globalThis.AudioContext || globalThis.webkitAudioContext || null;
}

export default class WebAudioToneBackend {
  constructor() {
    this.context = null;
  }

  isSupported() {
    return !!getAudioContextCtor();
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

  async playTone({
    frequency = 440,
    durationSeconds = 0.25,
    volume = 0.2,
    waveform = 'sine',
    attackSeconds = 0.01,
    releaseSeconds = 0.04,
  } = {}) {
    const context = this.ensureContext();
    if (!context) {
      return false;
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const now = context.currentTime;
    const endTime = now + Math.max(durationSeconds, 0.02);
    const attackEnd = now + Math.max(attackSeconds, 0.001);
    const releaseStart = Math.max(attackEnd, endTime - Math.max(releaseSeconds, 0.001));

    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, now);
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(volume, attackEnd);
    gainNode.gain.setValueAtTime(volume, releaseStart);
    gainNode.gain.linearRampToValueAtTime(0.0001, endTime);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(endTime);
    return true;
  }
}
