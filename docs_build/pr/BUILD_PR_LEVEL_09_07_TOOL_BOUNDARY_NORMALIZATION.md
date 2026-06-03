# BUILD_PR — LEVEL 09_07 — TOOL BOUNDARY NORMALIZATION

## Objective
Normalize boundaries across active tools so `tools/shared` becomes the only approved shared surface for reusable tool logic, while each tool remains responsible only for its own UI and orchestration.

## Why This PR Exists
The prior lane completed:
- asset structure simplification
- shared asset handoff enforcement
- tool launch contract alignment

This PR is the next dependency-ordered step. The repo now needs a strict separation between:
- tool-local UI / workflow code
- shared tool utilities / state / IO helpers

Without this pass, active tools risk continuing to:
- duplicate helper logic
- import across tool folders
- hide reusable logic inside one tool and copy it elsewhere
- blur the line between shared utility code and tool-specific implementation

## In Scope
- inventory reusable exact-clusters inside active tools
- extract only proven multi-tool logic into `tools/shared`
- replace cross-tool imports with `tools/shared` imports
- document and enforce the rule that tools do not import other tools
- normalize shared helper placement for tool-only utilities
- add or update focused validation that guards tool-boundary rules

## Out of Scope
- no engine changes
- no runtime/gameplay changes
- no asset relocation
- no feature additions
- no UI redesign
- no broad cleanup unrelated to tool boundaries
- no speculative extraction without reuse evidence

## Target Tools
Primary active tools for this pass:
- Tile Map Editor
- Parallax Editor
- Vector Map Editor
- Vector Asset Studio
- Sprite Editor

Secondary tool shells to keep aligned if touched:
- State Inspector
- Replay Visualizer
- Performance Profiler

## Boundary Rules To Enforce
1. A tool must not import code from another tool folder.
2. Reusable tool logic must live under `tools/shared`.
3. Tool entry files should orchestrate only:
   - boot
   - UI wiring
   - tool-local composition
4. Shared logic extracted into `tools/shared` must be:
   - tool-agnostic
   - minimal
   - contractable
   - reused by 2+ active tools, or clearly required as the single approved shared surface
5. Tool-specific workflow logic remains in the owning tool.

## Extraction Heuristics
Promote only exact clusters such as:
- path / URL resolution helpers
- manifest/sample loading helpers
- palette serialization / normalization helpers
- shared storage key helpers
- common panel / layout state helpers
- tool-local fetch / import/export wrappers with repeated usage

Do not promote:
- editor-specific commands
- tool-specific scene behavior
- one-off UI event flows
- feature logic that belongs to a single editor

## Expected Implementation Shape
Preferred shared homes:
- `tools/shared/io/...`
- `tools/shared/state/...`
- `tools/shared/utils/...`
- `tools/shared/contracts/...` (only if needed by proven reuse)
- `tools/shared/validation/...` (only if needed by focused checks)

## Required Deliverables
Codex should produce a small surgical delta containing:
- exact-cluster extractions only
- updated imports in affected tools
- focused validation / test coverage for boundary rules
- no unrelated file movement

## Validation Requirements
At minimum validate:
- touched tool entry files parse successfully
- no active tool imports another tool directly
- extracted helpers resolve from `tools/shared`
- prior launch-contract behavior still passes
- asset/palette hook expectations are not regressed

## Suggested Validation Commands
Use the repo's existing validation style and keep it lightweight. Prefer focused checks such as:
- node --check on touched files
- focused tests for tool launch / boundary rules
- existing asset usage / launch contract tests if present

## Acceptance Criteria
- active tools do not import one another
- reusable exact-cluster helpers are centralized under `tools/shared`
- no engine/runtime code is touched
- no asset layout changes occur
- tests/checks covering boundary rules pass
- the delta remains small and purpose-specific

## Implementation Notes
- Keep this PR docs-first and surgical.
- Favor exact-cluster extraction over broad reorganization.
- If a candidate helper is only used once, leave it local.
- If a helper contains UI assumptions from one tool, do not promote it until split cleanly.
