# BUILD_PR_11_1_TOOLBAR_AND_VISUAL_POLISH

## Required Codex Work

### 1. Inspect shared tool shell styling
Focus on shared workspace/tool shell files, expected around:
- tools/shared/platformShell.js
- tools/shared/platformShell.css
- shared tool CSS used by Asset Browser, Sprite Editor, Tilemap Studio, Vector Asset Studio, Vector Map Editor

### 2. Normalize toolbar/header visual language
Apply a shared product-style toolbar model:
- consistent height/density
- consistent title alignment
- consistent description/subtitle placement
- consistent button spacing
- consistent icon/caret/header action placement
- consistent disabled/active visual states
- no unexpected wrapping except where viewport requires it

### 3. Preserve behavior
Do not regress:
- fullscreen header open label: `Hide Header and Details`
- fullscreen collapsed label: `<tool> — <details>`
- fullscreen exit restore
- tool selection persistence
- empty-state behavior
- JSON SSoT behavior

### 4. Avoid unrelated changes
Do not:
- change data
- change schema
- change sample JSON
- change loaders
- change workspace lifecycle logic except if required by styling hook names
- rewrite tools

### 5. Validation report
Create:
docs/dev/reports/PR_11_1_TOOLBAR_AND_VISUAL_POLISH_report.md

Report must include:
- changed files
- tools visually checked
- normal mode validation
- fullscreen expanded validation
- fullscreen collapsed validation
- confirmation no data/schema/sample JSON/start_of_day changes

## Constraints
- One PR purpose only.
- Smallest scoped visual polish.
- Shared styling preferred over tool-local overrides.
