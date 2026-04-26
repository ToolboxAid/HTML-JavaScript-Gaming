# BUILD_PR_LEVEL_20_12_UAT_VALIDATE_AND_LOCK_RECOVERY_GATE

## Purpose

Validate and lock the Phase 20 recovery gate after constrained replay PRs.

This PR verifies the recovered launch system before normal roadmap progression resumes.

## Scope

One PR purpose only:

- validate sample-to-tool launch UAT
- validate game-to-Workspace Manager launch UAT
- validate external-launch memory clearing
- validate no default/fallback behavior
- validate launch SSoT enforcement
- validate Codex anti-pattern rules were not bypassed
- update recovery roadmap status markers only when validation passes

## Required Inputs

Codex must read:

- `docs/dev/specs/TOOL_LAUNCH_SSOT.md`
- `docs/dev/reports/tool_launch_ssot_routing_validation.md`
- `docs/dev/reports/tool_launch_ssot_data_layer_validation.md`
- `docs/dev/reports/legacy_launch_fallback_residue_validation.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_RECOVERY.md`
- `docs/dev/codex_rules.md`

If any required prerequisite report is missing, Codex must create the UAT report as BLOCKED and stop without runtime changes.

## UAT Validation Requirements

### Samples UAT

Validate:

- sample tool actions are labeled `Open <tool>`
- sample tool actions route through SSoT
- sample tool targets resolve to `tools/<tool>/index.html`
- sample external launch clears prior launch memory
- sample missing/invalid launch context fails visibly
- sample launch does not use fallback/default target

### Games UAT

Validate:

- game workspace action is labeled `Open with Workspace Manager`
- game workspace action routes through SSoT
- game workspace target resolves to `tools/Workspace Manager/index.html`
- game external launch clears prior launch memory
- game missing/invalid launch context fails visibly
- game launch does not use fallback/default target

### Workspace Manager UAT

Validate:

```text
games/index.html
  -> Open with Workspace Manager
  -> tools/Workspace Manager/index.html
  -> external launch memory cleared
  -> explicit game/workspace context loaded
  -> no fallback/default behavior used
```

## Anti-Pattern Validation

Codex must verify touched launch files do not contain:

- alias variable chains
- pass-through variables
- duplicate launch state
- stored derived launch state
- vague launch naming
- hidden fallback behavior
- duplicated launch paths
- silent redirects
- first-item selection
- stale memory reuse
- label-text route guessing
- DOM-order route guessing

## Allowed Changes

Allowed:

- create/update validation reports
- update `docs/dev/roadmaps/MASTER_ROADMAP_RECOVERY.md` status markers only
- update commit/comment docs

Forbidden:

- implementation code changes unless the UAT report is blocked and explicitly documents the blocker
- broad cleanup
- unrelated refactoring
- new routing systems
- second SSoT
- fallback/default behavior
- start_of_day changes
- roadmap text rewrite outside status markers

## Required Reports

Codex must create:

- `docs/dev/reports/phase20_recovery_uat_validation.md`
- `docs/dev/reports/phase20_recovery_gate_decision.md`
- `docs/dev/reports/phase20_codex_rules_recheck.md`

## Gate Decision

`phase20_recovery_gate_decision.md` must state exactly one:

```text
PASS - recovery gate complete; normal roadmap may resume
```

or

```text
BLOCKED - recovery gate remains open
```

If blocked, include:

- exact blocker
- file path
- failing UAT path
- next required BUILD_PR name

## Roadmap Status Rules

If and only if validation passes, update `MASTER_ROADMAP_RECOVERY.md` status markers:

- `[.] Remove anti-pattern drift through constrained replay PRs` -> `[x]`
- `[.] Enforce SSoT for tool launch across games and samples` -> `[x]`
- `[.] Enforce external-launch memory reset without fallback behavior` -> `[x]`
- `[ ] Validate Workspace Manager launch flow from games/index.html` -> `[x]`
- `[.] Re-verify codex rule enforcement on recovery lane` -> `[x]`
- `[ ] Resume normal roadmap progression after recovery gate passes` -> `[x]`

Do not rewrite roadmap text.

## Acceptance

- UAT validation report exists.
- Gate decision report exists.
- Codex rules recheck report exists.
- Roadmap status updates are status-marker only.
- If PASS, normal roadmap progression is unblocked.
- If BLOCKED, no runtime changes are made and next repair PR is named.
