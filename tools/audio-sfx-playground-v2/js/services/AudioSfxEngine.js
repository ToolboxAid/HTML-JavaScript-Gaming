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

function noiseDurationSeconds(sound, durationSeconds) {
  return Math.min(durationSeconds, sound.noiseDecayMs / 1000);
}

function createFilteredNoise(context, sound, durationSeconds) {
  const noise = context.createBufferSource();
  const noiseFilter = context.createBiquadFilter();
  const noiseGain = context.createGain();
  noise.buffer = createNoiseBuffer(context, durationSeconds);
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.setValueAtTime(sound.noiseFilterHz, context.currentTime);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(context.destination);
  return { noise, noiseGain };
}

function startNoiseLayer(context, sound, now, durationSeconds) {
  const noiseSeconds = noiseDurationSeconds(sound, durationSeconds);
  const noiseStopAt = now + noiseSeconds;
  const { noise, noiseGain } = createFilteredNoise(context, sound, noiseSeconds);
  noiseGain.gain.setValueAtTime(Math.max(0.0001, sound.volume * sound.noiseAmount * 1.2), now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, noiseStopAt);
  noise.start(now);
  noise.stop(noiseStopAt);
  return noise;
}

function startPrimaryNoise(context, sound, now, durationSeconds, attackSeconds) {
  const stopAt = now + durationSeconds;
  const attackEnd = now + attackSeconds;
  const decayEnd = now + Math.min(durationSeconds, Math.max(attackSeconds + 0.005, sound.noiseDecayMs / 1000));
  const peakGain = Math.max(0.0001, sound.volume * Math.max(sound.noiseAmount, 0.05));
  const { noise, noiseGain } = createFilteredNoise(context, sound, durationSeconds);
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.linearRampToValueAtTime(peakGain, attackEnd);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, decayEnd);
  if (decayEnd < stopAt) {
    noiseGain.gain.setValueAtTime(0.0001, stopAt);
  }
  noise.start(now);
  noise.stop(stopAt);
  return noise;
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
    let primarySource;
    if (sound.waveform === "noise") {
      primarySource = startPrimaryNoise(context, sound, now, durationSeconds, attackSeconds);
    } else {
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
      primarySource = oscillator;

      if (sound.noise) {
        startNoiseLayer(context, sound, now, durationSeconds);
      }
    }

    await new Promise((resolve) => {
      primarySource.addEventListener("ended", resolve, { once: true });
    });
  }
}
