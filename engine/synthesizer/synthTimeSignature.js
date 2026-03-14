// Shared parsing for user-entered synth time signature values.
function parseTimeSignatureInput(rawValue) {
  const normalized = String(rawValue || '').trim();
  const match = normalized.match(/^(\d+)\s*\/\s*(\d+)$/);

  if (!match) {
    return {
      ok: false,
      error: 'Time signature must use the format x/y (example: 4/4).'
    };
  }

  const beatsPerMeasure = Number(match[1]);
  const beatUnit = Number(match[2]);
  if (!Number.isFinite(beatsPerMeasure) || !Number.isFinite(beatUnit) || beatsPerMeasure <= 0 || beatUnit <= 0) {
    return {
      ok: false,
      error: 'Time signature must be positive values like 4/4.'
    };
  }

  return {
    ok: true,
    beatsPerMeasure,
    beatUnit
  };
}

export { parseTimeSignatureInput };
