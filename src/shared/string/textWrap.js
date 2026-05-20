/*
Toolbox Aid
David Quesenberry
04/17/2026
textWrapUtils.js
*/
export function wrapTextByCharacterCount(
  text,
  maxCharacters = 40,
  { preserveParagraphs = false } = {},
) {
  const source = String(text ?? "");
  const chunks = preserveParagraphs ? source.split("\n") : [source];
  const lines = [];

  chunks.forEach((chunk) => {
    const words = chunk.split(/\s+/).filter(Boolean);
    let current = "";

    words.forEach((word) => {
      const next = current ? `${current} ${word}` : word;
      if (next.length > maxCharacters && current) {
        lines.push(current);
        current = word;
        return;
      }
      current = next;
    });

    if (current) {
      lines.push(current);
    } else if (preserveParagraphs && words.length === 0) {
      lines.push("");
    }
  });

  return lines;
}
