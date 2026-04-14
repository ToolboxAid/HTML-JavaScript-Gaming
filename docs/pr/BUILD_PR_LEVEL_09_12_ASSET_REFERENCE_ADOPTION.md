# BUILD_PR — LEVEL 09_12 — ASSET REFERENCE ADOPTION

## Objective
Adopt the manifest-driven runtime asset binding path in the first targeted runtime consumers so active games and shared runtime-facing callers stop relying on ad hoc asset-path assumptions where touched.

This PR follows:
- 09_09 asset pipeline tooling
- 09_10 game asset manifest coordination
- 09_11 runtime asset binding

09_11 established the runtime-safe manifest-driven binding layer.
09_12 now applies that layer in the next small, dependency-ordered adoption pass.

## Why This PR Exists
The repo now has:
- shared asset pipeline stages
- deterministic game asset manifests
- runtime-safe manifest-driven binding

What remains is actual adoption in the callers that still assume direct paths or per-domain lookup behavior.

Without this PR:
- the new binding layer exists but remains underused
- games and runtime surfaces may continue drifting in lookup behavior
- manifest coordination is not yet the default consumption path

## In Scope
- identify the smallest set of active runtime consumers that should adopt manifest-driven asset lookup now
- replace touched ad hoc runtime asset references with the approved binding surface
- prefer high-value, low-risk adoption targets in active games or shared runtime consumers
- preserve the runtime/tool-data boundary
- add focused tests for adoption points and non-regression

## Out of Scope
- no broad repo-wide migration
- no tool UI work
- no new asset-format work
- no gameplay feature changes
- no speculative engine redesign
- no runtime access to `assets/<domain>/data/`

## Adoption Strategy
This PR should be surgical:
1. choose a very small number of high-value adoption sites
2. swap them to manifest-driven lookup
3. validate behavior
4. stop at a stable checkpoint

Do not turn this PR into a full repo-wide migration.

## Recommended Initial Targets
Prioritize active, low-risk consumers such as:
- Asteroids runtime asset references where manifest-driven lookup clearly applies
- shared runtime-safe asset loading helpers already adjacent to asset lookup
- any touched code already participating in the new asset lane

## Hard Rules
- runtime lookup must flow through the approved manifest/binding surface where touched
- runtime code must not read tool/editor data
- keep the delta small and purpose-specific
- no broad cleanup unrelated to adoption
- preserve deterministic identifier-based resolution

## Validation Expectations
At minimum:
- touched files parse cleanly
- adoption sites resolve through the binding layer
- `/data/` content remains excluded from runtime use
- existing binding/manifest/pipeline tests remain green
- focused adoption tests pass

## Roadmap Update Instruction
Update roadmap status only where this PR clearly advances tracked work.
Do not change roadmap wording, descriptions, ordering, or prose.
Status updates only. No text edits.

## Acceptance Criteria
- selected runtime consumers use manifest-driven binding
- no touched runtime consumer relies on ad hoc path assumptions where replaced
- runtime/editor boundary remains intact
- tests/checks pass
- roadmap receives status-only updates if applicable

## Deliverables
Return a repo-structured ZIP at:
`<project folder>/tmp/BUILD_PR_LEVEL_09_12_ASSET_REFERENCE_ADOPTION.zip`

Include:
- docs/pr/BUILD_PR_LEVEL_09_12_ASSET_REFERENCE_ADOPTION.md
- docs/dev/codex_commands.md
- docs/dev/commit_comment.txt
- docs/dev/next_command.txt
- docs/dev/reports/change_summary.txt
- docs/dev/reports/validation_checklist.txt
