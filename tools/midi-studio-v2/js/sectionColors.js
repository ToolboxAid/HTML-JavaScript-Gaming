const SECTION_TONES = ["#0ea5e9", "#22c55e", "#eab308", "#f97316", "#ec4899"];

function normalizedSectionIndex(index = 0) {
  const value = Number(index);
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.floor(value) % SECTION_TONES.length;
}

export function sectionTone(index = 0) {
  return SECTION_TONES[normalizedSectionIndex(index)] || SECTION_TONES[0];
}

export function sectionToneRgba(index = 0, alpha = 1) {
  const color = sectionTone(index).replace("#", "");
  const red = parseInt(color.slice(0, 2), 16);
  const green = parseInt(color.slice(2, 4), 16);
  const blue = parseInt(color.slice(4, 6), 16);
  const alphaValue = Number(alpha);
  const safeAlpha = Number.isFinite(alphaValue) ? Math.max(0, Math.min(1, alphaValue)) : 1;
  return `rgba(${red}, ${green}, ${blue}, ${safeAlpha})`;
}
