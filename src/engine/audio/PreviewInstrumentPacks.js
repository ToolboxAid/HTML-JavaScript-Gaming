export const PREVIEW_INSTRUMENT_PACKS = [
  {
    id: "retro-square-lead",
    label: "Retro Square Lead",
    synthRole: "lead",
    typeGroup: "Synth",
    volume: 0.075,
    waveform: "square"
  },
  {
    id: "retro-pulse-lead",
    label: "Retro Pulse Lead",
    synthRole: "lead",
    typeGroup: "Synth",
    volume: 0.07,
    waveform: "square"
  },
  {
    id: "synth-bass",
    label: "Synth Bass",
    synthRole: "bass",
    typeGroup: "Bass",
    transposeSemitones: -12,
    volume: 0.095,
    waveform: "triangle"
  },
  {
    approximationWarning: "Keyboard preview is an approximate electric-piano style synth patch.",
    id: "preview-electric-piano",
    label: "Preview Electric Piano",
    synthRole: "lead",
    typeGroup: "Keyboard",
    volume: 0.065,
    waveform: "sine"
  },
  {
    id: "warm-pad",
    label: "Warm Pad",
    durationScale: 1.3,
    synthRole: "pad",
    typeGroup: "Keyboard",
    volume: 0.045,
    waveform: "sine"
  },
  {
    id: "basic-drums",
    label: "Basic Drums",
    synthRole: "percussion",
    typeGroup: "Percussion",
    volume: 0.16,
    waveform: "noise"
  },
  {
    id: "ambient-pad",
    label: "Ambient Pad",
    durationScale: 1.55,
    synthRole: "pad",
    transposeSemitones: 12,
    typeGroup: "FX",
    volume: 0.035,
    waveform: "sine"
  },
  {
    approximationWarning: "String preview is an approximate synth pad, not a sampled string section.",
    durationScale: 1.45,
    id: "preview-string-ensemble",
    label: "Preview String Ensemble",
    synthRole: "pad",
    typeGroup: "Strings",
    volume: 0.04,
    waveform: "sine"
  },
  {
    approximationWarning: "Brass preview is an approximate synth brass patch.",
    id: "preview-brass-stab",
    label: "Preview Brass Stab",
    synthRole: "lead",
    typeGroup: "Brass",
    volume: 0.07,
    waveform: "sawtooth"
  },
  {
    approximationWarning: "Woodwind preview is an approximate breathy synth lead.",
    id: "preview-woodwind",
    label: "Preview Woodwind",
    synthRole: "lead",
    typeGroup: "Woodwind",
    volume: 0.06,
    waveform: "triangle"
  },
  {
    approximationWarning: "Guitar preview is an approximate plucked synth tone.",
    id: "preview-clean-guitar",
    label: "Preview Clean Guitar",
    synthRole: "lead",
    typeGroup: "Guitar",
    volume: 0.06,
    waveform: "triangle"
  }
];

export function previewInstrumentById(id) {
  return PREVIEW_INSTRUMENT_PACKS.find((instrument) => instrument.id === id) || null;
}
