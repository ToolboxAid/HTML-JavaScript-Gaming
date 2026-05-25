function audioContextConstructor(windowRef) {
  return windowRef.AudioContext || windowRef.webkitAudioContext || null;
}

function createNoiseBuffer(context, durationSeconds) {
  const sampleCount = Math.max(1, Math.floor(context.sampleRate * durationSeconds));
  const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < sampleCount; index += 1) {
    data[index] = (Math.random() * 2) - 1;
  }
  return buffer;
}

export class AudioSfxEngine {
  constructor({ windowRef = window } = {}) {
    this.context = null;
    this.window = windowRef;
  }

  ensureContext() {
    if (this.context) {
      return this.context;
    }
    const Context = audioContextConstructor(this.window);
    if (!Context) {
      throw new Error("Web Audio API is unavailable in this browser.");
    }
    this.context = new Context();
    return this.context;
  }

  async play(sound) {
    const context = this.ensureContext();
    if (context.state === "suspended") {
      await context.resume();
    }

    const now = context.currentTime;
    const durationSeconds = sound.durationMs / 1000;
    const attackSeconds = sound.attackMs / 1000;
    const releaseSeconds = sound.releaseMs / 1000;
    const stopAt = now + durationSeconds;
    const sustainStart = now + attackSeconds;
    const releaseStart = Math.max(sustainStart, stopAt - releaseSeconds);
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = sound.waveform;
    oscillator.frequency.setValueAtTime(sound.frequencyHz, now);
    oscillator.detune.setValueAtTime(0, now);
    oscillator.detune.linearRampToValueAtTime(sound.pitchSweepCents, stopAt);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(sound.volume, sustainStart);
    gain.gain.setValueAtTime(sound.volume, releaseStart);
    gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(stopAt);

    if (sound.noise) {
      const noise = context.createBufferSource();
      const noiseGain = context.createGain();
      noise.buffer = createNoiseBuffer(context, Math.min(durationSeconds, 0.18));
      noiseGain.gain.setValueAtTime(sound.volume * 0.36, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + Math.min(durationSeconds, 0.18));
      noise.connect(noiseGain);
      noiseGain.connect(context.destination);
      noise.start(now);
      noise.stop(now + Math.min(durationSeconds, 0.18));
    }

    await new Promise((resolve) => {
      oscillator.addEventListener("ended", resolve, { once: true });
    });
  }
}
