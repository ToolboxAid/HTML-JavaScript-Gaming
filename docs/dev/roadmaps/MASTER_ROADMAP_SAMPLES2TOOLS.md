# MASTER ROADMAP - SAMPLES TO TOOLS

## Status Key
- [x] complete
- [.] in progress
- [ ] planned

## Goal
- Establish a single source of truth sample-data lane where sample JSON is reused by both:
- sample execution (`samples/phase-xx/xxxx/index.html`)
- tool preload flows (`tools/<tool>/index.html?...`)
- Exclude `Phase 20 - Tool Preset Integration` from this roadmap lane.

## Source Inputs
- `tmp/tools_used.txt` (tool sample coverage and candidate sample list)
- `samples/metadata/samples.index.metadata.json` (sample catalog metadata)
- `tools/toolRegistry.js` (active tool registry and ids)

## Kickoff Status (2026-04-23)
- [.] Roadmap kickoff started
- [.] Phase 1 vertical slice target selected: `Parallax Scene Studio`
- [.] Batch 1 implementation start

## Canonical Data Contract
- [.] File naming standard: `samples/phase-xx/xxxx/sample-xxxx.json`
- [ ] Required fields:
- `sampleId` (string)
- `phase` (string)
- `title` (string)
- `description` (string)
- `toolHints` (array of tool ids)
- `payload` (object, tool-consumable source data)
- [ ] Optional fields:
- `runtime` (sample-only materialization hints)
- `toolState` (tool-specific hydration hints)
- `provenance` (path, createdAt, version)

## Launch Contract (Shared)
- [.] Standard query parameters for tool launch:
- `sampleId=<id>`
- `samplePresetPath=/samples/phase-xx/xxxx/sample-xxxx.json`
- [ ] Tool boot behavior:
- detect contract params
- fetch JSON from `samplePresetPath`
- validate minimal schema
- map to tool state via tool-specific adapter
- render status indicating source sample

## Return Path (Tools -> Samples)
- [x] Add a `Tool` filter in Samples.
- [x] In Tools, add a link label pattern: `Samples (x)` where `x` is count for that tool.
- [x] Tools `Samples (x)` link passes tool argument back to Samples page.
- [x] Samples page prepopulates the `Tool` dropdown from query argument and applies filter automatically.
- [x] Samples return path filter uses `Tool` only (exclude `Workspace Manager` from this filter lane).

## Rollout Plan

### Batch 1 - Active Work (Phase 1 Slice)
- [.] Add `samples/phase-12/1208/sample-1208.json` as shared sample/tool preset source.
- [.] Wire Sample 1208 page/tool link to pass:
- `sampleId=1208`
- `samplePresetPath=/samples/phase-12/1208/sample-1208.json`
- [.] Wire `Parallax Scene Studio` launch path to load and hydrate from `samplePresetPath` when provided.
- [ ] Validate end-to-end parity for the slice (sample load + tool preload + visible content match).

### Phase 1 - Foundation + One Vertical Slice
- [.] Add shared adapter guidance document for sample-to-tool loading.
- [.] Implement one full reference flow:
- sample page loads `sample-xxxx.json`
- same file is passed to tool launch
- tool hydrates from same file
- [.] Suggested first slice: `Parallax Scene Studio` (clear, low candidate count).
- [ ] Validate:
- sample runs using file
- tool opens from sample and loads matching content
- no Phase 20 coupling

### Phase 2 - Highest Value Tools (from tools_used.txt)
- [ ] Parallax Scene Studio (4 candidate samples)
- [ ] Performance Profiler (2 candidate samples)
- [ ] Physics Sandbox (2 candidate samples)
- [ ] Replay Visualizer (3 candidate samples)
- [ ] Vector Asset Studio (1 candidate sample)
- [ ] Vector Map Editor (1 candidate sample)
- [ ] For each:
- create/link `sample-xxxx.json` in selected sample folders
- add/open tool link with shared launch contract
- verify tool state visibly matches sample payload intent

### Phase 3 - Core Editor/Workflow Tools
- [ ] Sprite Editor (9 candidates)
- [ ] Tilemap Studio (15 candidates)
- [ ] Tile Model Converter (18 candidates)
- [ ] Asset Browser / Import Hub (8 candidates)
- [ ] Asset Pipeline Tool (10 candidates)
- [ ] Palette Browser / Manager (6 candidates)
- [ ] State Inspector (26 candidates)
- [ ] For each tool:
- select top 3-5 high-signal non-Phase-20 samples first
- wire shared JSON loading
- confirm deterministic load behavior

### Phase 4 - 3D Utility Surfaces
- [ ] 3D JSON Payload Normalizer (41 candidates; prioritize strict map/payload samples)
- [ ] 3D Asset Viewer (31 candidates; prioritize asset-centric samples)
- [ ] 3D Camera Path Editor (47 candidates; prioritize camera/path-centric samples)
- [ ] Select precise, semantically aligned samples only (avoid broad keyword-only linkage).

### Phase 5 - Games
- [ ] Do the same thing for games.

### Phase 6 - Phase 20 Decommission (After Parity)
- [ ] Keep `Phase 20 - Tool Preset Integration` active until Samples2Tools parity is execution-validated.
- [ ] Define parity gate:
- sample-to-tool launch coverage equals or exceeds current Phase 20 matrix intent.
- preset/state preload behavior is validated in replacement lane.
- replacement reports exist and are repeatable.
- [ ] Mark Phase 20 as `deprecated` in docs once parity gate passes.
- [ ] Remove Phase 20 links from primary launch surfaces after deprecation window.
- [ ] Remove Phase 20 artifacts only after final signoff (no dangling references in docs/tests/reports).

## Prioritization Rules
- [ ] Prefer semantically exact sample-tool matches over high volume.
- [ ] Limit initial additions per tool card to 2-5 links.
- [ ] Use non-Phase-20 samples only in this lane.
- [ ] Maintain stable sample identity (`sample-xxxx.json`) for reproducibility.

## Validation Checklist
- [ ] Every linked sample has `sample-xxxx.json`.
- [ ] Sample page consumes same JSON it passes to tool.
- [ ] Tool launch with `samplePresetPath` succeeds without manual edits.
- [ ] Tool status includes loaded sample id/path.
- [ ] Metadata and tool card links resolve correctly.
- [ ] No regressions to direct tool launch without sample params.

## Reporting Outputs (per execution batch)
- [x] `docs/dev/reports/samples2tools_batch_<n>_summary.txt`
- [x] `docs/dev/reports/samples2tools_batch_<n>_validation.txt`
- [x] `docs/dev/reports/samples2tools_link_map_<n>.json`

## Current Snapshot (from tools_used.txt)
- [x] Current tagged samples across active tools: `4` (excluding Phase 20)
- [x] Candidate coverage inventory exists for all active tools
- [.] Convert candidates into curated, validated sample-to-tool links
