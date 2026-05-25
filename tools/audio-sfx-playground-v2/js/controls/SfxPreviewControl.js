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
  const noiseLift = sound.noise ? 0.18 : 0;
  return Math.max(8, Math.round((20 + (wave * 76) + (noiseLift * 100)) * Math.max(envelope, 0.08) * sweepTilt));
}

export class SfxPreviewControl {
  constructor(output) {
    this.output = output;
  }

  clear(message = "No preview rendered yet.") {
    const emptyState = document.createElement("p");
    emptyState.textContent = message;
    this.output.replaceChildren(emptyState);
  }

  render(sound) {
    const card = document.createElement("article");
    card.className = "audio-sfx__preview-card";

    const title = document.createElement("h2");
    title.textContent = sound.name;

    const summary = document.createElement("p");
    summary.textContent = `${sound.waveform}, ${sound.frequencyHz} Hz, ${sound.durationMs} ms, ${sound.pitchSweepCents} cents`;

    const bars = document.createElement("div");
    bars.className = "audio-sfx__waveform-bars";
    bars.setAttribute("aria-hidden", "true");
    for (let index = 0; index < 32; index += 1) {
      const bar = document.createElement("span");
      bar.style.height = `${barHeight(index, sound)}px`;
      bars.append(bar);
    }

    const tags = document.createElement("div");
    tags.className = "audio-sfx__preview-tags";
    [sound.noise ? "noise transient" : "oscillator only", `volume ${sound.volume.toFixed(2)}`].forEach((label) => {
      const tag = document.createElement("span");
      tag.textContent = label;
      tags.append(tag);
    });

    card.append(title, summary, bars, tags);
    this.output.replaceChildren(card);
  }
}
