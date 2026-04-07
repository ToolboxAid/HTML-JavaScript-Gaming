/*
Toolbox Aid
Shared default palette metadata for editor/tools reuse.
*/

const DEFAULT_PALETTE_NAMED_ENTRIES = [
  { hex: "#000000", name: "Black" },
  { hex: "#ffffff", name: "White" },
  { hex: "#00ccff", name: "Sky Blue" },
  { hex: "#f59e0b", name: "Amber" },
  { hex: "#22c55e", name: "Green" },
  { hex: "#ef4444", name: "Red" },
  { hex: "#8b5cf6", name: "Violet" }
];

const DEFAULT_PALETTE = DEFAULT_PALETTE_NAMED_ENTRIES.map((entry) => entry.hex);

export { DEFAULT_PALETTE, DEFAULT_PALETTE_NAMED_ENTRIES };

