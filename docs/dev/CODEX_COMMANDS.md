# MODEL
GPT-5.4

# REASONING
high

# COMMAND
Create BUILD_PR_LEVEL_09_12_ASSET_REFERENCE_ADOPTION as a docs-first, surgical PR for `HTML-JavaScript-Gaming`.

## Mission
Adopt the manifest-driven runtime asset binding layer in the next small set of high-value runtime consumers so the new coordinated asset lane becomes real usage, not just infrastructure.

## Dependency context
This PR follows:
- 09_09 asset pipeline tooling
- 09_10 game asset manifest coordination
- 09_11 runtime asset binding

Use the approved binding surface introduced in 09_11.
Do not bypass it with direct asset path assumptions where touched.

## Required scope
- find the smallest high-value runtime adoption points
- replace touched ad hoc asset references with manifest-driven binding
- keep runtime readers out of `assets/<domain>/data/`
- add focused tests for adoption and non-regression
- stop at a stable checkpoint after the first clean adoption slice

## Recommended targets
Prefer low-risk, active callers such as:
- Asteroids runtime asset references
- shared runtime-safe asset loading helpers
- nearby runtime consumers already in this lane

## Hard rules
- do not perform a repo-wide migration
- do not redesign tools
- do not add gameplay features
- do not introduce new asset formats
- do not allow runtime access to editor/tool data
- keep the PR surgical and dependency-ordered

## Roadmap instruction
Update roadmap status only where this PR clearly advances tracked work.
Do not change any roadmap text, prose, descriptions, or ordering.
Status changes only.

## Deliverables
Return a single repo-structured ZIP at:
`<project folder>/tmp/BUILD_PR_LEVEL_09_12_ASSET_REFERENCE_ADOPTION.zip`

Include:
- docs/pr/BUILD_PR_LEVEL_09_12_ASSET_REFERENCE_ADOPTION.md
- docs/dev/codex_commands.md
- docs/dev/commit_comment.txt
- docs/dev/next_command.txt
- docs/dev/reports/change_summary.txt
- docs/dev/reports/validation_checklist.txt

## Validation
Run focused checks only:
- node --check on touched files
- focused adoption tests
- existing runtime binding tests
- existing GameAssetManifestCoordinator tests
- existing AssetPipelineTooling tests
- existing ProjectToolDataContracts tests as needed

## Success definition
- selected runtime consumers adopt manifest-driven binding
- `/data/` records remain excluded from runtime use
- existing pipeline/manifest/binding tests remain green
- roadmap gets status-only updates if applicable
- final output is one ZIP in `<project folder>/tmp/`
