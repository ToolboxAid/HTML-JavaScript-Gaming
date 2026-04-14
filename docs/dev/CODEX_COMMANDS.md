# MODEL
GPT-5.4

# REASONING
high

# COMMAND
Create BUILD_PR_LEVEL_09_11_RUNTIME_ASSET_BINDING as a docs-first, surgical PR for `HTML-JavaScript-Gaming`.

## Mission
Bind runtime asset consumers to the deterministic game asset manifest so runtime lookup is manifest-driven and cannot consume tool/editor-only data.

## Dependency context
This PR follows:
- 09_09 asset pipeline tooling
- 09_10 game asset manifest coordination

Use the generated game asset manifest at:
`games/<game>/assets/<game>.assets.json`

## Required scope
- introduce a runtime-facing asset binding layer
- resolve runtime assets from the coordinated manifest
- centralize lookup by asset/domain identifiers
- exclude or reject `assets/<domain>/data/` content from runtime binding
- support active domains first:
  - sprites
  - tilemaps
  - parallax
  - vectors
- add focused tests for runtime binding behavior

## Hard rules
- do not redesign tools
- do not expand engine feature scope broadly
- do not add gameplay features
- do not introduce new asset format work
- do not allow runtime readers to depend on editor/tool data
- keep the PR surgical and dependency-ordered

## Deliverables
Return a single repo-structured ZIP at:
`<project folder>/tmp/BUILD_PR_LEVEL_09_11_RUNTIME_ASSET_BINDING.zip`

Include:
- docs/pr/BUILD_PR_LEVEL_09_11_RUNTIME_ASSET_BINDING.md
- docs/dev/codex_commands.md
- docs/dev/commit_comment.txt
- docs/dev/next_command.txt
- docs/dev/reports/change_summary.txt
- docs/dev/reports/validation_checklist.txt

## Validation
Run focused checks only:
- node --check on touched files
- focused runtime binding tests
- existing GameAssetManifestCoordinator tests
- existing AssetPipelineTooling tests
- existing ProjectToolDataContracts tests as needed

## Success definition
- runtime asset lookup is manifest-driven
- `/data/` records are excluded from runtime binding
- active asset domains resolve consistently
- existing pipeline/manifest tests remain green
- final output is one ZIP in `<project folder>/tmp/`
