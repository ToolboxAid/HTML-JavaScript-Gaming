# PR_26175_ALFA_048-theme-v2-chevron-conversion Requirements Checklist

- PASS: Add shared Theme V2 SVG icon registry helper for chevron consumers.
- PASS: Replace Theme V2 chevron CSS drawings in accordion.css and panels.css.
- PASS: Replace Idea Board chevron mask-image classes in tables.css with shared icon classes.
- PASS: Preserve click/keyboard toggle behavior and accessible names.
- PASS: Keep chevron dimensions stable.
- PASS: No inline SVG blocks added to page HTML.
- PASS: No inline styles, style blocks, or page-local CSS added.
- PASS: No old gfs-chevron up/down mask-image usage remains in scoped active component CSS.
- FAIL: Full required validation lane is blocked by the pre-existing Game Hub row-count assertion in IdeaBoardTableNotes.spec.mjs.
