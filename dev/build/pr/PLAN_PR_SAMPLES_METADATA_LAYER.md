# PLAN_PR_SAMPLES_METADATA_LAYER

## Objective
Define a minimal metadata layer for canonical sample paths so generated `samples/index.html` rendering has stable, human-readable titles, descriptions, and tags.

## Scope
Docs-only planning.
No implementation code changes.
No gameplay scope.
No engine-core scope.
No start_of_day directory changes.

## Canonical Path Contract (Source of Truth #1)
- Folder structure remains canonical: `samples/phaseXX/XXYY/index.html`
- Path shape determines discoverability and link targets.
- Path shape does not own display copy.

## Minimal Metadata Schema (Source of Truth #2)
Proposed schema for each sample entry:
- `id` (string, required): 4-digit sample id, e.g. `1316`
- `phase` (string, required): 2-digit phase id, e.g. `13`
- `title` (string, required): stable human-readable sample title
- `description` (string, required): short tile/section description
- `tags` (array<string>, required, may be empty): filter/display tags

Derived (not stored) fields:
- `href`: computed from canonical folders -> `./phaseXX/XXYY/index.html`

## Metadata Location
Single metadata file, repo-local and minimal:
- `samples/metadata/samples.index.metadata.json`

Why this location:
- keeps sample-display content near samples domain
- avoids engine/tool coupling
- provides one narrow source for index-render copy

## Source-of-Truth Boundaries
1. Canonical folder structure (`samples/phaseXX/XXYY/`):
   - owns existence/discovery of runnable sample entrypoints
   - owns path validity

2. Metadata file (`samples.index.metadata.json`):
   - owns titles/descriptions/tags
   - must not define non-canonical paths

3. Generated index rendering (`samples/index.html`):
   - owns final HTML presentation only
   - consumes canonical discovery + metadata
   - must not become a manual content source

## Fail-Fast Rules for Future BUILD
Stop generation immediately when any of the following occur:
- duplicate IDs in metadata
- duplicate metadata entries for same sample id
- phase/sample mismatch:
  - metadata `phase` does not match `id[:2]`
  - metadata id not found in canonical folder structure
  - canonical sample missing corresponding metadata entry (if strict mode enabled)
- missing required fields (`id`, `phase`, `title`, `description`, `tags`)
- non-array `tags`
- malformed canonical directories (`phaseXX` / `XXYY` violations)
- missing canonical sample entrypoint `index.html`

## Future BUILD Shape (Narrow + Testable)
1. Discover canonical samples from `samples/phaseXX/XXYY/`.
2. Load and validate metadata file with fail-fast checks.
3. Join canonical set + metadata by sample id.
4. Generate index sections/tiles from joined data.
5. Validate representative links and console cleanliness.

## Testability Requirements for Future BUILD
Minimum testability gates:
- `samples/index.html` loads after generation
- representative links open correctly:
  - first sample in first populated phase
  - last sample in last populated phase
  - phase 13 samples: 1316, 1317, 1318
- no console errors for tested pages
- generated output remains deterministic for unchanged inputs

## Out of Scope
- changing gameplay code
- changing engine core
- broad refactors
- modifying start_of_day instruction directories

## Acceptance Criteria (Planning PR)
- minimal schema defined
- metadata location defined
- source-of-truth boundaries defined
- fail-fast rules defined
- future BUILD remains narrowly scoped and testable
