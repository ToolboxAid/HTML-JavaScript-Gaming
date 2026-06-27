# BUILD_PR_ASSET_PIPELINE_FOUNDATION

## Purpose
Establish the first asset-pipeline foundation for tools so project assets can be imported, normalized, validated, and handed off consistently across the active authoring tools.

## Why This PR Now
The previous lane unified project-level tool integration. The next highest-leverage step is to create a minimal, shared asset-pipeline foundation before adding larger converter or content-pipeline tools.

## Goals
- shared asset ingest baseline
- normalized asset metadata/IDs
- validation at import boundary
- repeatable handoff into the unified project model
- no tool-specific workflow rewrites

## Scope
- shared asset pipeline foundation only
- import/normalize/validate handoff path
- adapters for current active tools where needed
- exact-cluster only

## In Scope
- asset import baseline for current active tools
- shared normalization rules for asset IDs/paths/types
- validation hooks at asset-ingest boundary
- manifest/project integration for imported assets
- minimal adapters required by active tools

## Out of Scope
- full converter suite
- 3D asset tooling
- render-pipeline rewrites
- editor-state redesign
- UI/theme restyling
- templates/ cleanup
- broad repo structure cleanup
- deleting legacy assets or folders

## Active Tool Targets
- toolbox/Asset Browser
- toolbox/Palette Browser
- toolbox/Parallax Scene Studio
- toolbox/Sprite Editor
- toolbox/Tilemap Studio
- toolbox/Vector Asset Studio
- toolbox/Vector Map Editor

## Shared Reuse Priority
Reuse current shared layers first:
- src/shared/toolbox/projectSystem.js
- src/shared/toolbox/projectSystemAdapters.js
- src/shared/toolbox/projectSystemValueUtils.js
- src/shared/toolbox/runtimeAssetLoader.js
- src/shared/toolbox/runtimeAssetValidationUtils.js
- any current toolbox/shared asset/registry helpers already proven in prior lanes

## Build Strategy

### Step 1 — Inventory Existing Asset Ingest Paths
Read only the active tool import/load paths and current toolbox/shared asset/project helpers.

### Step 2 — Define Minimal Shared Pipeline Stages
Converge only on the first safe shared stages:
1. ingest
2. normalize
3. validate
4. register into project model

### Step 3 — Normalize Asset Identity Rules
Standardize:
- asset IDs
- asset path normalization
- type/category metadata
- validation failure reporting

### Step 4 — Add Minimal Tool Adapters
Only where needed to map current tool import paths into the shared pipeline foundation.

### Step 5 — Preserve Existing Tool Behavior
Do not redesign how tools author content; only normalize the shared asset handoff boundary.

## Validation Requirements
- npm run test:launch-smoke -- --tools
- imported assets still appear in the tools that were touched
- no console regressions
- exact files changed reported
- report normalized rules and adapters added

## Stop Conditions
Stop and report if:
- a touched tool needs editor-state redesign to adopt the pipeline
- asset normalization requires render-pipeline changes
- scope expands toward converters or 3D tooling
- touched-file count grows beyond the named asset-ingest cluster

## Expected Output
- repo-structured delta ZIP under <project folder>/tmp/
- implementation kept to the first shared pipeline foundation only
- reports identifying what remains for converters/pipeline phase 2
