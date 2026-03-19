PR-004 — engine/game concrete export inventory build

### Purpose

This BUILD_PR creates the docs-only structure for recording the actual current
`engine/game` export surface.

### Scope

This patch records the inventory framework only.
It does not change runtime behavior, imports, file locations, or execution paths.

### What This BUILD_PR Does

- adds docs for recording actual `engine/game` exports
- records the expected inventory fields
- separates direct exports from re-exports
- preserves compatibility for later classification work

### What This BUILD_PR Does Not Do

- no code edits
- no export removal
- no import rewrites
- no file movement
- no runtime changes
