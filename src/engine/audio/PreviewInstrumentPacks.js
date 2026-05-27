export const PREVIEW_INSTRUMENT_PACKS = [
  {
    id: "retro-square-lead",
    label: "Retro Square Lead",
    synthRole: "lead",
    volume: 0.075,
    waveform: "square"
  },
  {
    id: "retro-pulse-lead",
    label: "Retro Pulse Lead",
    synthRole: "lead",
    volume: 0.07,
    waveform: "square"
  },
  {
    id: "synth-bass",
    label: "Synth Bass",
    synthRole: "bass",
    transposeSemitones: -12,
    volume: 0.095,
    waveform: "triangle"
  },
  {
    id: "warm-pad",
    label: "Warm Pad",
    durationScale: 1.3,
    synthRole: "pad",
    volume: 0.045,
    waveform: "sine"
  },
  {
    id: "basic-drums",
    label: "Basic Drums",
    synthRole: "percussion",
    volume: 0.16,
    waveform: "noise"
  },
  {
    id: "ambient-pad",
    label: "Ambient Pad",
    durationScale: 1.55,
    synthRole: "pad",
    transposeSemitones: 12,
    volume: 0.035,
    waveform: "sine"
  }
];

export function previewInstrumentById(id) {
  return PREVIEW_INSTRUMENT_PACKS.find((instrument) => instrument.id === id) || null;
}
