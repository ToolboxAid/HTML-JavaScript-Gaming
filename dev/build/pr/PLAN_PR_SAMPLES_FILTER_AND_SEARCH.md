# PLAN_PR_SAMPLES_FILTER_AND_SEARCH

## Objective
Define a narrow, testable filter-and-search layer for `samples/index.html` using canonical sample paths and metadata-driven readable content.

## Scope
Docs-only planning.
No implementation code changes.
No gameplay scope.
No engine-core scope.
No path normalization changes.
No start_of_day directory changes.

## Minimal UX Definition
### 1) Phase filtering
- Control: single-select phase dropdown/chips.
- Default: `All phases`.
- Behavior: when phase is selected, only samples from that phase are shown.

### 2) Tag filtering
- Control: multi-select tag chips/checkboxes.
- Default: no tags selected.
- Behavior: selected tags apply as AND across tags (sample must include every selected tag).

### 3) Search
- Control: single text input.
- Default: empty.
- Behavior: case-insensitive substring match across:
  - sample title
  - sample description
  - sample tags
  - sample id

## Combined State Behavior
Result set is computed as:
1. Canonical discovered sample set (`samples/phaseXX/XXYY/index.html`)
2. Joined with metadata by sample id
3. Filtered by phase (if not `All`)
4. Filtered by selected tags (AND semantics)
5. Filtered by search query
6. Rendered in stable ascending sample-id order

Empty state behavior:
- Show explicit ?No matching samples? message.
- Preserve controls and current filter/search state.

## Source-of-Truth Boundaries
1. Canonical folder structure
- owns existence of runnable samples and link targets
- owns path validity only

2. Metadata
- owns human-readable title, description, tags
- must not override canonical href computation

3. Index UI behavior
- owns transient filter/search state and rendering of current result set
- must not become a metadata source

## Validation + Fail-Fast Expectations
Fail fast (stop generation/render pipeline) on:
- duplicate sample IDs in metadata
- duplicate sample entries for same id
- phase/sample mismatch (`phase` vs `id[:2]`)
- missing required metadata fields (`id`, `phase`, `title`, `description`, `tags`)
- malformed canonical phase/sample directories
- missing canonical sample entrypoints

Validation expectations for future BUILD:
- generated index loads
- phase filter reduces visible set correctly
- tag filter applies AND behavior correctly
- search filters correctly (case-insensitive)
- combined state produces deterministic result set
- representative links still load:
  - first sample in first populated phase
  - last sample in last populated phase
  - phase 13 samples: 1316, 1317, 1318
- console clean for tested pages

## Future BUILD Scope Guard (Narrow + Testable)
In scope:
- index UI filter/search layer
- metadata-driven render integration for readable content
- minimal test harness/report updates needed to validate behavior

Out of scope:
- gameplay changes
- engine-core changes
- path normalization or sample relocation
- broad UI refactor beyond filter/search controls and result rendering

## Acceptance Criteria (Planning PR)
- minimal UX contract defined
- combined-state behavior defined
- source-of-truth boundaries defined
- validation + fail-fast expectations defined
- future BUILD remains narrowly scoped and testable
