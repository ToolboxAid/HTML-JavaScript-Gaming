# MODEL
GPT-5.4

# REASONING
high

# COMMAND
Create BUILD_PR_LEVEL_09_09_ASSET_PIPELINE_TOOLING as a docs-first, surgical PR for `HTML-JavaScript-Gaming`.

## Mission
Implement the shared asset pipeline layer that converts validated tool-authored data into deterministic runtime-facing assets.

## Dependency context
This PR follows:
- 09_04 asset structure simplification
- 09_05 shared asset handoff enforcement
- 09_06 tool launch contract alignment
- 09_07 tool boundary normalization
- 09_08 tool data contracts

Use 09_08 contract enforcement as the validation gate for this pipeline.

## Required scope
- create a shared pipeline surface under `tools/shared`
- centralize load → validate → normalize → emit stages
- preserve runtime vs tool-data split:
  - runtime in `assets/<domain>/`
  - tool/editor data in `assets/<domain>/data/`
- support active domains first:
  - sprites
  - tilemaps
  - parallax
  - vectors
- add focused validation/tests for the pipeline layer

## Approved ownership pattern
- game-level coordinator file at `games/<game>/assets/<game>.assets.json`
- runtime assets in `games/<game>/assets/<domain>/`
- tool/editor data in `games/<game>/assets/<domain>/data/`

## Hard rules
- do not change engine code
- do not add gameplay/runtime features
- do not redesign tool UI
- do not perform unrelated asset moves
- do not duplicate validation already established in 09_08
- do not let each tool keep ad hoc export logic when shared pipeline extraction is appropriate

## Deliverables
Return a single repo-structured ZIP at:
`<project folder>/tmp/BUILD_PR_LEVEL_09_09_ASSET_PIPELINE_TOOLING.zip`

Include:
- docs/pr/BUILD_PR_LEVEL_09_09_ASSET_PIPELINE_TOOLING.md
- docs/dev/codex_commands.md
- docs/dev/commit_comment.txt
- docs/dev/next_command.txt
- docs/dev/reports/change_summary.txt
- docs/dev/reports/validation_checklist.txt

## Validation
Run focused checks only:
- node --check on touched shared/pipeline files
- focused pipeline validation tests
- existing contract / launch / asset integration tests as needed to prevent regressions

## Success definition
- shared asset pipeline exists under `tools/shared`
- contract validation is reused from 09_08
- runtime outputs and tool data are cleanly separated
- active asset domains flow through a consistent pipeline
- no engine/runtime scope expansion
- final output is one ZIP in `<project folder>/tmp/`
