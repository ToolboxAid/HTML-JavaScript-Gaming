# PR 11.34 — Compare Vector Map Editor and Vector Asset Studio

## Purpose
Ask Codex to compare Vector Map Editor and Vector Asset Studio and determine whether they do the same thing, partially overlap, or serve distinct roles.

## Required Analysis
Codex must compare the two tools by inspecting their actual code, manifests, payload contracts, UI controls, data models, and workspace integration.

## Tools to Compare
- Vector Map Editor
- Vector Asset Studio

## Questions to Answer
1. Do they do the same thing?
2. What does each tool own today?
3. What data format does each tool read/write?
4. What user workflows does each tool support?
5. Are there duplicated functions or concepts?
6. Which one should be the canonical tool for SVG/vector asset authoring?
7. Which one should be the canonical tool for vector map/spatial/layout editing?
8. Should either tool be renamed, merged, retired, or kept separate?
9. What would break if one was removed?
10. What is the recommended next PR?

## Scope
- Analysis/report only.
- Do not change implementation code.
- Do not rename tools.
- Do not delete tools.
- Do not modify manifests.
- Do not touch start_of_day folders.

## Acceptance
- Report is written to docs_build/dev/reports/PR_11_34_vector_tool_comparison.md.
- Report includes evidence from actual repo files.
- Report clearly says: same, overlap, or distinct.
- Report includes recommendation and next PR.
