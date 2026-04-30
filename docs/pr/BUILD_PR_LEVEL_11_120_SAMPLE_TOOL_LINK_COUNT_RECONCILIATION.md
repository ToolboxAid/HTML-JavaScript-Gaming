# BUILD_PR_LEVEL_11_120_SAMPLE_TOOL_LINK_COUNT_RECONCILIATION

## Purpose
Create one authoritative SSoT for all sample/tool relationships and reconcile the mismatch between:
- `tools/index.html` expected sample relationships: 34
- `samples/index.html` rendered `Open <tool>` links: 22

## Scope
- testable cleanup
- sample/tool relationship SSoT enforcement
- no schema lock
- no fake replacement data
- no fallback/default/preset behavior
- no runtime hardcoded denylist/blocklist as final fix
- no broad renderer rewrite beyond SSoT enforcement

## Problem

There are currently two conflicting views:

1. `tools/index.html` indicates 34 sample/tool relationships.
2. `samples/index.html` shows only 22 `Open <tool>` links.

This means sample/tool relationship data is not controlled by a single source of truth.

## Required SSoT

Use exactly one authoritative file for sample/tool relationships:

- `samples/metadata/samples.index.metadata.json`

This file must contain the complete and correct sample/tool relationship data needed by both:
- `samples/index.html`
- `tools/index.html`

No other runtime source may define sample/tool links.

## Required Reconciliation

Codex must compare:

1. relationships implied/rendered by `tools/index.html`
2. links rendered by `samples/index.html`
3. entries in `samples/metadata/samples.index.metadata.json`
4. any generated/derived sample/tool metadata files

Then produce a reconciled SSoT.

## Required Rules

### 1. One SSoT
Only `samples/metadata/samples.index.metadata.json` may define:
- `toolHints`
- `roundtripToolPresets`
- sample/tool launcher relationships

### 2. Derived files must be generated/read-only
If any file is derived from the SSoT:
- clearly mark/report it as derived
- regenerate it from SSoT or remove it from runtime
- do not manually maintain a second relationship list

### 3. Both hubs must read same SSoT
Both:
- `samples/index.html` / sample hub renderer
- `tools/index.html` / tools hub renderer

must use the same SSoT relationship data or a generated artifact derived only from that SSoT.

### 4. Counts must reconcile
After cleanup:
- expected relationships from tools hub must match SSoT
- sample hub rendered `Open <tool>` links must match SSoT
- no extra stale links
- no missing valid links

If count is not 34 after removing known-bad links, Codex must report why with exact removed/blocked entries.

### 5. Known-bad links remain removed
Do not reintroduce bad links removed/requested earlier.

Known-bad entries include:
- 0201 unrelated tool links / 3D Camera Path Editor
- 0202 unrelated tool links
- 0204 unrelated tool links
- 0210 unrelated tool links
- 0220 unrelated tool links
- 0221 3D JSON Payload Normalizer / 3D JSON Payload / 3d-json-payload
- 0226 unrelated tool links
- 0227 unrelated tool links
- 0303 unrelated tool links
- 0305 3D JSON Payload Normalizer / 3D JSON Payload / 3d-json-payload
- 0901 Vector Map Editor
- 1204 SVG Asset Studio
- 1205 Vector Map Editor
- 1208 3D Asset Viewer and SVG Asset Studio
- 1319 unrelated tool links

## Required Output

Codex must produce a reconciled relationship report showing:

- all 34 relationships from `tools/index.html`
- all 22 current `samples/index.html` links
- SSoT entries before change
- SSoT entries after change
- missing links added
- extra/stale links removed
- blocked relationships and why

## Validation

Targeted validation only.

Required:
- changed JSON parses
- changed JS/HTML syntax valid where practical
- `samples.index.metadata.json` is the only active relationship SSoT
- sample hub link count matches SSoT
- tools hub relationship count matches SSoT
- known-bad links are absent
- no second active source remains

## Reports

Codex must write populated reports:

- `docs/dev/reports/sample_tool_relationship_reconciliation_11_120.txt`
- `docs/dev/reports/tools_index_expected_relationships_11_120.txt`
- `docs/dev/reports/samples_index_rendered_links_11_120.txt`
- `docs/dev/reports/sample_tool_ssot_after_11_120.txt`
- `docs/dev/reports/validation_after_11_120.txt`

Reports must not be empty.

## Full Samples Smoke Test

Skipped.

Reason:
- targeted hub metadata/relationship reconciliation
- full samples smoke test takes approximately 20 minutes

## Acceptance

- one SSoT controls all sample/tool relationships
- tools hub and samples hub agree
- 34 vs 22 mismatch is reconciled or precisely explained
- no known-bad links return
- no duplicate active relationship source remains
