function barHeight(index, sound) {
  const normalizedIndex = index / 31;
  const attackRatio = sound.attackMs / sound.durationMs;
  const releaseStart = 1 - (sound.releaseMs / sound.durationMs);
  let envelope = 1;
  if (normalizedIndex < attackRatio) {
    envelope = attackRatio === 0 ? 1 : normalizedIndex / attackRatio;
  } else if (normalizedIndex > releaseStart) {
    const releaseRatio = (normalizedIndex - releaseStart) / Math.max(1 - releaseStart, 0.001);
    envelope = 1 - releaseRatio;
  }
  const wave = Math.abs(Math.sin((index + 1) * (sound.frequencyHz / 220)));
  const sweepTilt = 1 + ((sound.pitchSweepCents / 1200) * (normalizedIndex - 0.5));
  const noiseDecayRatio = sound.noiseDecayMs / sound.durationMs;
  const noiseTransient = sound.noise
    ? sound.noiseAmount * Math.max(0, 1 - (normalizedIndex / Math.max(noiseDecayRatio, 0.001)))
    : 0;
  const noiseBrightness = sound.noise ? sound.noiseFilterHz / 9000 : 0;
  return Math.max(8, Math.round((20 + (wave * 76) + (noiseTransient * 110) + (noiseBrightness * noiseTransient * 32)) * Math.max(envelope, 0.08) * sweepTilt));
}

export class SfxPreviewControl {
  constructor(output) {
    this.output = output;
  }

  clear() {
    const emptyState = document.createElement("div");
    emptyState.className = "tool-starter__preview-card audio-sfx__preview-empty";
    emptyState.setAttribute("aria-hidden", "true");
    this.output.replaceChildren(emptyState);
  }

  render(sound) {
    const card = document.createElement("article");
    card.className = "tool-starter__preview-card";

    const bars = document.createElement("div");
    bars.className = "tool-starter__meter-bars";
    bars.setAttribute("aria-hidden", "true");
    for (let index = 0; index < 32; index += 1) {
      const bar = document.createElement("span");
      bar.style.height = `${barHeight(index, sound)}px`;
      bars.append(bar);
    }

    card.append(bars);
    this.output.replaceChildren(card);
  }
}
