export const PREVIEW_INSTRUMENT_PACKS = [
  {
    id: "retro-square-lead",
    label: "Lead 1 (Square)",
    synthRole: "lead",
    typeGroup: "Synth Lead",
    volume: 0.075,
    waveform: "square"
  },
  {
    id: "retro-pulse-lead",
    label: "Lead 2 (Sawtooth)",
    synthRole: "lead",
    typeGroup: "Synth Lead",
    volume: 0.07,
    waveform: "sawtooth"
  },
  {
    id: "synth-bass",
    label: "Synth Bass 1",
    synthRole: "bass",
    typeGroup: "Bass",
    transposeSemitones: -12,
    volume: 0.095,
    waveform: "triangle"
  },
  {
    approximationWarning: "Keyboard preview is an approximate electric-piano style synth patch.",
    id: "preview-electric-piano",
    label: "Electric Piano 1",
    synthRole: "lead",
    typeGroup: "Piano",
    volume: 0.065,
    waveform: "sine"
  },
  {
    approximationWarning: "Piano preview is an approximate sine-based synth patch.",
    id: "preview-acoustic-grand-piano",
    label: "Acoustic Grand Piano",
    synthRole: "lead",
    typeGroup: "Piano",
    volume: 0.065,
    waveform: "sine"
  },
  {
    approximationWarning: "Chromatic percussion preview is an approximate mallet synth patch.",
    id: "preview-celesta",
    label: "Celesta",
    synthRole: "lead",
    typeGroup: "Chromatic Percussion",
    volume: 0.058,
    waveform: "sine"
  },
  {
    approximationWarning: "Organ preview is an approximate drawbar synth patch.",
    id: "preview-drawbar-organ",
    label: "Drawbar Organ",
    synthRole: "pad",
    typeGroup: "Organ",
    volume: 0.052,
    waveform: "sine"
  },
  {
    id: "warm-pad",
    label: "Warm Pad",
    durationScale: 1.3,
    synthRole: "pad",
    typeGroup: "Synth Pad",
    volume: 0.045,
    waveform: "sine"
  },
  {
    id: "basic-drums",
    label: "Standard Drum Kit",
    synthRole: "percussion",
    typeGroup: "Percussive",
    volume: 0.16,
    waveform: "noise"
  },
  {
    id: "ambient-pad",
    label: "Pad 2 (Warm)",
    durationScale: 1.55,
    synthRole: "pad",
    transposeSemitones: 12,
    typeGroup: "Synth Pad",
    volume: 0.035,
    waveform: "sine"
  },
  {
    approximationWarning: "Violin preview is an approximate bowed synth patch.",
    id: "preview-violin",
    label: "Violin",
    synthRole: "lead",
    typeGroup: "Strings",
    volume: 0.055,
    waveform: "sine"
  },
  {
    approximationWarning: "String preview is an approximate synth pad, not a sampled string section.",
    durationScale: 1.45,
    id: "preview-string-ensemble",
    label: "String Ensemble 1",
    synthRole: "pad",
    typeGroup: "Ensemble",
    volume: 0.04,
    waveform: "sine"
  },
  {
    approximationWarning: "Brass preview is an approximate synth brass patch.",
    id: "preview-brass-stab",
    label: "Brass Section",
    synthRole: "lead",
    typeGroup: "Brass",
    volume: 0.07,
    waveform: "sawtooth"
  },
  {
    approximationWarning: "Woodwind preview is an approximate breathy synth lead.",
    id: "preview-woodwind",
    label: "Clarinet",
    synthRole: "lead",
    typeGroup: "Reed",
    volume: 0.06,
    waveform: "triangle"
  },
  {
    approximationWarning: "Pipe preview is an approximate flute-like synth lead.",
    id: "preview-flute",
    label: "Flute",
    synthRole: "lead",
    typeGroup: "Pipe",
    volume: 0.055,
    waveform: "sine"
  },
  {
    approximationWarning: "Guitar preview is an approximate plucked synth tone.",
    id: "preview-clean-guitar",
    label: "Electric Guitar (Clean)",
    synthRole: "lead",
    typeGroup: "Guitar",
    volume: 0.06,
    waveform: "triangle"
  },
  {
    approximationWarning: "Synth effects preview is an approximate effects patch.",
    id: "preview-synth-fx",
    label: "FX 1 (Rain)",
    synthRole: "pad",
    typeGroup: "Synth Effects",
    volume: 0.04,
    waveform: "sawtooth"
  },
  {
    approximationWarning: "Ethnic instrument preview is an approximate plucked synth patch.",
    id: "preview-shamisen",
    label: "Shamisen",
    synthRole: "lead",
    typeGroup: "Ethnic",
    volume: 0.055,
    waveform: "triangle"
  },
  {
    approximationWarning: "Sound effect preview is an approximate synth effect patch.",
    id: "preview-sci-fi",
    label: "FX 8 (Sci-Fi)",
    synthRole: "lead",
    typeGroup: "Sound Effects",
    volume: 0.055,
    waveform: "square"
  }
];

export function previewInstrumentById(id) {
  return PREVIEW_INSTRUMENT_PACKS.find((instrument) => instrument.id === id) || null;
}
