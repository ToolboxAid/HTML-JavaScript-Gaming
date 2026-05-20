function normalizeCommandText(input) {
  const raw = String(input || "").toLowerCase().trim();
  const noPunct = raw.replace(/[^\w\s]/g, " ");
  const collapsed = noPunct.replace(/\s+/g, " ").trim();
  const filler = new Set(["to", "the", "tool"]);
  const tokens = collapsed.split(" ").filter((t) => t && !filler.has(t));
  return tokens.join(" ");
}

export { normalizeCommandText };
