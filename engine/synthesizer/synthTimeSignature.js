// Shared parsing for user-entered synth time signature values.
import NumberUtils from '../math/numberUtils.js';

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
  if (!NumberUtils.isPositiveFinite(beatsPerMeasure) || !NumberUtils.isPositiveFinite(beatUnit)) {
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
