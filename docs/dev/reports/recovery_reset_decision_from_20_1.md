# Placeholder

Codex must replace this file during execution.
# Recovery Reset Decision From 20.1 Baseline

## Decision
- Recommended path: **Reset to baseline `3f7e9df` and replay only minimal recovery PRs in strict order.**

## Is Reset Safer Than Surgical Cleanup?
- **Yes. Reset is safer.**

## Reasoning
- Post-baseline drift is large (`125` commits, `488` files changed).
- UAT launch-path files are entangled with broad unrelated changes across samples, tools, docs, and metadata.
- Multiple anti-pattern indicators are present:
  - start_of_day path touched
  - broad cross-lane scope expansion
  - dual metadata vocabulary (`toolHints` and `toolsUsed`)
  - large delete/rename churn unrelated to narrow UAT lane
- Surgical cleanup from current HEAD has high risk of partial rollback and hidden regressions.

## Files To Preserve
- Preserve these audit artifacts:
  - `docs/dev/reports/recovery_change_audit_from_20_1.md`
  - `docs/dev/reports/recovery_antipattern_audit_from_20_1.md`
  - `docs/dev/reports/recovery_file_risk_list_from_20_1.md`
  - `docs/dev/reports/recovery_reset_decision_from_20_1.md`
- Preserve governance inputs if approved by owner:
  - `docs/dev/PROJECT_INSTRUCTIONS.md`
  - `docs/dev/codex_rules.md`

## Files To Discard (By Reset)
- Broad post-baseline feature/content churn not required for narrow UAT recovery, including:
  - mass `samples/phase-*` additions/deletions unrelated to launch recovery
  - broad `tools/*` UI/layout rewrites not required for launch routing fix
  - large generated/iterative reports not part of baseline recovery objective
  - cross-lane renames (for example 3D map editor rename path) unless explicitly re-approved

## Files Requiring Manual Review Before Any Replay
- Core launch/routing surfaces:
  - `games/index.render.js`
  - `samples/index.render.js`
  - `tools/Workspace Manager/main.js`
  - `tools/shared/platformShell.js`
  - `tools/shared/toolLaunchSSoT.js`
- Metadata contracts:
  - `games/metadata/games.index.metadata.json`
  - `samples/metadata/samples.index.metadata.json`
- Policy-sensitive paths:
  - `docs/dev/start_of_day/codex/PROJECT_INSTRUCTIONS.lnk`
  - `docs/dev/roadmaps/MASTER_ROADMAP_SAMPLES2TOOLS.md`

## Exact Next APPLY_PR Name
- `APPLY_PR_LEVEL_20_6_RESET_TO_20_1_BASELINE_AND_REPLAY_MINIMAL_UAT`

## Exact Reason For Recommendation
- Resetting to `3f7e9df` re-establishes a known-good baseline aligned with the stated recovery target.
- It minimizes uncertainty by removing compounded unrelated drift and lets UAT-critical launch behavior be reapplied in small, testable, isolated PRs.
- Surgical cleanup from current HEAD is not proportionate to risk given the observed breadth and coupling of changes.
