const BASE_PREVIEW_INSTRUMENT_PACKS = [
  {
    id: "retro-square-lead",
    label: "Lead 1 (Square)",
    synthRole: "lead",
    typeGroup: "Synth Lead",
    volume: 0.13,
    waveform: "square"
  },
  {
    id: "retro-pulse-lead",
    label: "Lead 2 (Sawtooth)",
    synthRole: "lead",
    typeGroup: "Synth Lead",
    volume: 0.12,
    waveform: "sawtooth"
  },
  {
    id: "synth-bass",
    label: "Synth Bass 1",
    synthRole: "bass",
    typeGroup: "Bass",
    transposeSemitones: -12,
    volume: 0.16,
    waveform: "triangle"
  },
  {
    approximationWarning: "Keyboard preview is an approximate electric-piano style synth patch.",
    id: "preview-electric-piano",
    label: "Electric Piano 1",
    synthRole: "lead",
    typeGroup: "Piano",
    volume: 0.12,
    waveform: "sine"
  },
  {
    approximationWarning: "Piano preview is an approximate sine-based synth patch.",
    id: "preview-acoustic-grand-piano",
    label: "Acoustic Grand Piano",
    synthRole: "lead",
    typeGroup: "Piano",
    volume: 0.12,
    waveform: "sine"
  },
  {
    approximationWarning: "Chromatic percussion preview is an approximate mallet synth patch.",
    id: "preview-celesta",
    label: "Celesta",
    synthRole: "lead",
    typeGroup: "Chromatic Percussion",
    volume: 0.11,
    waveform: "sine"
  },
  {
    approximationWarning: "Organ preview is an approximate drawbar synth patch.",
    id: "preview-drawbar-organ",
    label: "Drawbar Organ",
    synthRole: "pad",
    typeGroup: "Organ",
    volume: 0.11,
    waveform: "sine"
  },
  {
    id: "warm-pad",
    label: "Warm Pad",
    durationScale: 1.3,
    synthRole: "pad",
    typeGroup: "Synth Pad",
    volume: 0.1,
    waveform: "sine"
  },
  {
    id: "basic-drums",
    label: "Standard Drum Kit",
    synthRole: "percussion",
    typeGroup: "Percussive",
    volume: 0.24,
    waveform: "noise"
  },
  {
    id: "ambient-pad",
    label: "Pad 2 (Warm)",
    durationScale: 1.55,
    synthRole: "pad",
    transposeSemitones: 12,
    typeGroup: "Synth Pad",
    volume: 0.1,
    waveform: "sine"
  },
  {
    approximationWarning: "Violin preview is an approximate bowed synth patch.",
    id: "preview-violin",
    label: "Violin",
    synthRole: "lead",
    typeGroup: "Strings",
    volume: 0.11,
    waveform: "sine"
  },
  {
    approximationWarning: "String preview is an approximate synth pad, not a sampled string section.",
    durationScale: 1.45,
    id: "preview-string-ensemble",
    label: "String Ensemble 1",
    synthRole: "pad",
    typeGroup: "Ensemble",
    volume: 0.1,
    waveform: "sine"
  },
  {
    approximationWarning: "Brass preview is an approximate synth brass patch.",
    id: "preview-brass-stab",
    label: "Brass Section",
    synthRole: "lead",
    typeGroup: "Brass",
    volume: 0.12,
    waveform: "sawtooth"
  },
  {
    approximationWarning: "Woodwind preview is an approximate breathy synth lead.",
    id: "preview-woodwind",
    label: "Clarinet",
    synthRole: "lead",
    typeGroup: "Reed",
    volume: 0.11,
    waveform: "triangle"
  },
  {
    approximationWarning: "Pipe preview is an approximate flute-like synth lead.",
    id: "preview-flute",
    label: "Flute",
    synthRole: "lead",
    typeGroup: "Pipe",
    volume: 0.11,
    waveform: "sine"
  },
  {
    approximationWarning: "Guitar preview is an approximate plucked synth tone.",
    id: "preview-clean-guitar",
    label: "Electric Guitar (Clean)",
    synthRole: "lead",
    typeGroup: "Guitar",
    volume: 0.11,
    waveform: "triangle"
  },
  {
    approximationWarning: "Synth effects preview is an approximate effects patch.",
    id: "preview-synth-fx",
    label: "FX 1 (Rain)",
    synthRole: "pad",
    typeGroup: "Synth Effects",
    volume: 0.1,
    waveform: "sawtooth"
  },
  {
    approximationWarning: "Ethnic instrument preview is an approximate plucked synth patch.",
    id: "preview-shamisen",
    label: "Shamisen",
    synthRole: "lead",
    typeGroup: "Ethnic",
    volume: 0.11,
    waveform: "triangle"
  },
  {
    approximationWarning: "Sound effect preview is an approximate synth effect patch.",
    id: "preview-sci-fi",
    label: "FX 8 (Sci-Fi)",
    synthRole: "lead",
    typeGroup: "Sound Effects",
    volume: 0.11,
    waveform: "square"
  }
];

const SUPPLEMENTAL_GM_INSTRUMENTS = [
  gmFallback("gm-bright-acoustic-piano", "Bright Acoustic Piano", "Piano", "preview-acoustic-grand-piano"),
  gmFallback("gm-glockenspiel", "Glockenspiel", "Chromatic Percussion", "preview-celesta"),
  gmFallback("gm-marimba", "Marimba", "Chromatic Percussion", "preview-celesta"),
  gmFallback("gm-percussive-organ", "Percussive Organ", "Organ", "preview-drawbar-organ"),
  gmFallback("gm-church-organ", "Church Organ", "Organ", "preview-drawbar-organ"),
  gmFallback("gm-acoustic-guitar-nylon", "Acoustic Guitar (Nylon)", "Guitar", "preview-clean-guitar"),
  gmFallback("gm-overdriven-guitar", "Overdriven Guitar", "Guitar", "preview-clean-guitar"),
  gmFallback("gm-acoustic-bass", "Acoustic Bass", "Bass", "synth-bass"),
  gmFallback("gm-electric-bass-finger", "Electric Bass (Finger)", "Bass", "synth-bass"),
  gmFallback("gm-viola", "Viola", "Strings", "preview-violin"),
  gmFallback("gm-cello", "Cello", "Strings", "preview-violin"),
  gmFallback("gm-synth-strings-1", "Synth Strings 1", "Ensemble", "preview-string-ensemble"),
  gmFallback("gm-choir-aahs", "Choir Aahs", "Ensemble", "warm-pad"),
  gmFallback("gm-trumpet", "Trumpet", "Brass", "preview-brass-stab"),
  gmFallback("gm-trombone", "Trombone", "Brass", "preview-brass-stab"),
  gmFallback("gm-alto-sax", "Alto Sax", "Reed", "preview-woodwind"),
  gmFallback("gm-oboe", "Oboe", "Reed", "preview-woodwind"),
  gmFallback("gm-piccolo", "Piccolo", "Pipe", "preview-flute"),
  gmFallback("gm-recorder", "Recorder", "Pipe", "preview-flute"),
  gmFallback("gm-lead-calliope", "Lead 3 (Calliope)", "Synth Lead", "retro-square-lead"),
  gmFallback("gm-pad-polysynth", "Pad 3 (Polysynth)", "Synth Pad", "warm-pad"),
  gmFallback("gm-fx-soundtrack", "FX 2 (Soundtrack)", "Synth Effects", "preview-synth-fx"),
  gmFallback("gm-fx-atmosphere", "FX 4 (Atmosphere)", "Synth Effects", "preview-synth-fx"),
  gmFallback("gm-sitar", "Sitar", "Ethnic", "preview-shamisen"),
  gmFallback("gm-koto", "Koto", "Ethnic", "preview-shamisen"),
  gmFallback("gm-room-drum-kit", "Room Drum Kit", "Percussive", "basic-drums"),
  gmFallback("gm-power-drum-kit", "Power Drum Kit", "Percussive", "basic-drums"),
  gmFallback("gm-applause", "Applause", "Sound Effects", "preview-sci-fi"),
  gmFallback("gm-gunshot", "Gunshot", "Sound Effects", "preview-sci-fi")
];

export const PREVIEW_INSTRUMENT_PACKS = [
  ...BASE_PREVIEW_INSTRUMENT_PACKS,
  ...SUPPLEMENTAL_GM_INSTRUMENTS
];

function gmFallback(id, label, typeGroup, previewInstrumentId) {
  return {
    approximationWarning: `${label} is listed for GM coverage and maps to the closest audible Preview Synth preset.`,
    id,
    label,
    previewInstrumentId,
    typeGroup,
    unsupportedPreview: true
  };
}

export function previewInstrumentById(id) {
  const instrument = PREVIEW_INSTRUMENT_PACKS.find((entry) => entry.id === id) || null;
  if (!instrument?.previewInstrumentId) {
    return instrument;
  }
  const mapped = BASE_PREVIEW_INSTRUMENT_PACKS.find((entry) => entry.id === instrument.previewInstrumentId) || null;
  if (!mapped) {
    return instrument;
  }
  return {
    ...mapped,
    ...instrument,
    mappedPreviewInstrumentId: mapped.id,
    mappedPreviewInstrumentLabel: mapped.label,
    synthRole: mapped.synthRole,
    transposeSemitones: mapped.transposeSemitones,
    volume: Math.max(Number(mapped.volume || 0), 0.11),
    waveform: mapped.waveform
  };
}
