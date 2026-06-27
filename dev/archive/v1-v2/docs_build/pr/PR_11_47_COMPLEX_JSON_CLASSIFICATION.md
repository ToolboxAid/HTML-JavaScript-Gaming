# PR 11.47 — Complex JSON Classification (Palette + Indirect Usage)

## Purpose
Classify JSON files that appear "unreferenced" by string search but are likely used indirectly
(e.g., palette.json, tile-map documents, manifest/workspace-driven payloads).

## Problem
The audit script flags many JSON files as missing references, but some are loaded via:
- manifest mappings
- workspace payload aggregation
- tool-specific loaders
- implicit conventions (palette, tileset, document formats)

## Required Work
Produce a classification-only report for complex JSON:

For each candidate (focus on palette and tile-map docs):
- JSON path
- owning sample
- intended tool/use case
- loading mechanism:
  - direct JS import/reference
  - manifest-driven
  - workspace-driven
  - tool loader (name-based)
- visible effect in UI/tool
- classification:
  - INDIRECTLY USED (valid)
  - UNUSED (candidate for delete/rehome)
  - UNCERTAIN (needs follow-up)

## Scope
- Analysis/report only
- No code changes
- No JSON moves/deletes in this PR

## Acceptance
- Report clearly distinguishes indirect usage vs true unused
- Provides next-step recommendations for cleanup PRs
