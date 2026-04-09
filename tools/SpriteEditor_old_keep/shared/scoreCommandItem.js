import { fuzzyMatchScore } from "../../../src/engine/utils/fuzzyMatchScore.js";
import { normalizeCommandText } from "../../../src/engine/utils/normalizeCommandText.js";

function scoreCommandItem(item, normalizedQuery) {
  if (!normalizedQuery) return 0;
  const label = normalizeCommandText(item.label || "");
  const aliases = Array.isArray(item.aliases) ? item.aliases.map((a) => normalizeCommandText(a)) : [];
  const keywords = Array.isArray(item.keywords) ? item.keywords.map((k) => normalizeCommandText(k)) : [];
  const shortcut = normalizeCommandText(item.shortcut || "");
  if (label.indexOf(normalizedQuery) === 0) return 2400;
  for (let i = 0; i < aliases.length; i += 1) {
    if (aliases[i] === normalizedQuery) return 2200;
    if (aliases[i].indexOf(normalizedQuery) === 0) return 2000;
  }
  if (label.indexOf(normalizedQuery) >= 0) return 1600 - label.indexOf(normalizedQuery) * 5;
  for (let i = 0; i < aliases.length; i += 1) {
    const pos = aliases[i].indexOf(normalizedQuery);
    if (pos >= 0) return 1450 - pos * 4;
  }
  for (let i = 0; i < keywords.length; i += 1) {
    if (keywords[i].indexOf(normalizedQuery) >= 0) return 1200;
  }
  const hay = `${label} ${aliases.join(" ")} ${keywords.join(" ")} ${shortcut}`;
  return fuzzyMatchScore(hay, normalizedQuery);
}

export { scoreCommandItem };
