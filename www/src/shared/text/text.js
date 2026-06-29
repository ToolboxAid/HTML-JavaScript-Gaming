const HTML_ESCAPE_MAP = Object.freeze({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;",
});

function toText(value) {
  return value == null ? "" : String(value);
}

function stripDiacritics(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

export function normalizeWhitespace(value) {
  return toText(value).replace(/\s+/g, " ").trim();
}

export function slugify(value) {
  return stripDiacritics(normalizeWhitespace(value))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toTitleCase(value) {
  return normalizeWhitespace(value).replace(/\b[\p{L}\p{N}][\p{L}\p{N}'-]*/gu, (word) => (
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ));
}

export function toCamelCase(value) {
  const words = stripDiacritics(normalizeWhitespace(value))
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);

  return words.map((word, index) => {
    const lower = word.toLowerCase();
    return index === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join("");
}

export function truncate(value, maxLength, options = {}) {
  const text = toText(value);
  const length = Math.max(0, Math.floor(Number(maxLength) || 0));
  const suffix = options.suffix == null ? "..." : String(options.suffix);

  if (text.length <= length) {
    return text;
  }

  if (length <= suffix.length) {
    return suffix.slice(0, length);
  }

  return `${text.slice(0, length - suffix.length)}${suffix}`;
}

export function escapeHtml(value) {
  return toText(value).replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character]);
}
