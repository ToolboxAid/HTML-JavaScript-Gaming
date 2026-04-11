# PLAN_PR_TOOLS_SHARED_NORMALIZATION

## PR Purpose
Normalize `tools/shared` boundaries and tool structure contracts using a docs-first plan, while explicitly prioritizing reuse of existing engine theme/UI assets before introducing any new tool-local `styles.css`.

## User Priority Applied
- Reuse engine theme over new CSS wherever practical.
- Bundle docs whenever possible to reduce cycles and back-and-forth.
- No implementation code in this PR bundle.
- Preserve current runtime behavior; this is a planning lane only.

## Why This PR Now
The repo now has:
- active `tools/shared`
- multiple standalone tools with separate CSS and boot patterns
- engine theme/UI assets already present under `src/engine/theme` and `src/engine/ui`

Without a boundary-normalization pass, tool duplication and style drift will continue to grow.

## Current Repo Signals Anchoring This Plan
Existing shared/tooling surface:
- `tools/shared/platformShell.js`
- `tools/shared/platformShell.css`
- vector helpers under `tools/shared/vector/*`
- project/runtime helper modules already under `tools/shared/*`

Existing engine theme/UI surface to prioritize:
- `src/engine/theme/Theme.js`
- `src/engine/theme/ThemeTokens.js`
- `src/engine/ui/baseLayout.css`
- `src/engine/ui/hubCommon.css`
- `src/engine/ui/spriteEditor.css`

Existing tool-local CSS currently in play:
- `tools/Asset Browser/assetBrowser.css`
- `tools/Palette Browser/paletteBrowser.css`
- `tools/Parallax Scene Studio/parallaxEditor.css`
- `tools/Sprite Editor/spriteEditor.css`
- `tools/Tilemap Studio/tileMapEditor.css`
- `tools/Vector Asset Studio/svgBackgroundEditor.css`
- `tools/Vector Map Editor/vectorMapEditor.css`

## PR Goals
1. Define what belongs in `tools/shared`.
2. Define what must remain tool-local.
3. Define a standard tool structure and boot contract.
4. Define theme/style reuse order, with engine theme first.
5. Produce an extraction/migration sequence Codex can execute in later BUILD PRs.
6. Avoid broad repo churn and avoid tool-specific behavior changes in this planning PR.

## Explicit Non-Goals
- No code extraction yet.
- No CSS rewrites yet.
- No tool UI redesign.
- No engine-core API change.
- No roadmap wording rewrites in this bundle.
- No destructive moves or deletions.

## Reuse-First Theme Rule
Before any new tool-local stylesheet is introduced or expanded, the following reuse order must be applied:

1. Reuse `src/engine/theme/*` tokens and theme contracts.
2. Reuse `src/engine/ui/*` shared layout and UI primitives.
3. Reuse `tools/shared/platformShell.css` only for tool-shell concerns not already handled by engine theme/UI.
4. Keep residual tool-local CSS only for truly tool-specific surfaces.

### Meaning In Practice
- New generic spacing, typography, color, panel chrome, button, surface, and layout rules should not be added to a new tool `styles.css` if an engine theme/UI equivalent already exists or can be promoted safely.
- Tool-local CSS should shrink toward tool-specific concerns only.
- `styles.css` should not become the default dumping ground for shell/layout/theme rules.

## Proposed Tool Boundary Contract

### Belongs In `tools/shared`
- platform shell / shared chrome
- file IO adapters
- common preview helpers
- reusable palette or color utilities
- reusable vector helpers
- reusable project manifest / registry helpers
- reusable authoring validation helpers
- shared inspector/panel primitives
- shared command bus / common event wiring
- shared serialization helpers

### Must Remain Tool-Local
- tool-specific editor state
- tool-specific workflows
- unique render pipelines
- unique canvas interaction models
- tool-exclusive data transforms
- tool-exclusive commands
- tool-exclusive sample/demo content unless deliberately promoted

### Not For `tools/shared`
- speculative future abstractions without multi-tool evidence
- game/runtime behavior that belongs under engine or shared runtime
- raw archive/legacy scripts that have no active reuse path

## Proposed Standard Tool Structure
Each active tool should trend toward:

```text
tools/<Tool Name>/
  index.html
  main.js
  <tool>.css                # only tool-specific residual CSS
  tool.config.json          # optional, when config is real and shared by runtime/tooling
  README.md                 # optional for tool-specific operation notes
```

Shared dependencies should trend toward:
```text
tools/shared/
  platformShell.js
  platformShell.css
  vector/
  io/
  ui/
  validation/
  preview/
  project/
```

Note:
- This PR does not require those folders to be created yet.
- This PR only establishes the target contract and extraction sequence.

## Proposed Boot Contract
Each active tool should converge toward a small boot surface:

```text
init(container, config)
destroy()
```

Optional later additions:
```text
serializeState()
loadState(data)
```

This keeps later Tool Host work possible without forcing it into this PR.

## Planned Migration Sequence

### Phase A — Inventory + Duplication Classification
- inventory all active tool entry points
- inventory all tool-local CSS
- classify which style rules are shell/theme/layout vs tool-specific
- classify shared JS candidates already duplicated or semi-shared

### Phase B — Theme Reuse Baseline
- map current tool CSS against `src/engine/theme/*` and `src/engine/ui/*`
- identify generic rules that should reuse engine theme/UI instead of remaining tool-local
- define the exact “do not re-add locally” list

### Phase C — Shared Extraction Candidates
- identify safe first extractions from current tool code
- keep first BUILD lane exact-cluster only
- avoid mixing style extraction with behavior extraction unless tightly coupled

### Phase D — Build Sequence
- BUILD 1: shell/theme normalization and import alignment
- BUILD 2: shared utility extraction
- BUILD 3: boot-contract normalization
- BUILD 4: optional host/readiness follow-up

## Validation Expectations For Later BUILD PRs
Every later BUILD lane must validate:
- tool still loads
- no console regressions
- no shell/theme visual collapse
- no broadened scope beyond named candidate cluster
- engine theme reuse increased or at minimum did not regress

## Candidate Follow-up BUILD PR Names
- `BUILD_PR_TOOLS_THEME_REUSE_BASELINE`
- `BUILD_PR_TOOLS_SHARED_EXTRACTION_PHASE_1`
- `BUILD_PR_TOOLS_BOOT_CONTRACT_NORMALIZATION`
- `BUILD_PR_TOOLS_SHELL_ALIGNMENT`

## Risk Controls
- Do not refactor all tools at once.
- Do not mix vector/runtime/shared extraction in one build unless exact target files demand it.
- Do not introduce new tool-local CSS when engine theme/UI already covers the case.
- Do not delete legacy tool paths unless explicitly approved.
- Preserve `SpriteEditor_old_keep`.

## Acceptance For This PLAN PR
- singular purpose remains tools/shared normalization
- theme reuse priority is explicit
- candidate extraction sequence is explicit
- active tool inventory is reflected in reports
- no code implementation is included
