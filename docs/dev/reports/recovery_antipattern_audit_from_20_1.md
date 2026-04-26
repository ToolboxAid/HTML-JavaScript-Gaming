# Placeholder

Codex must replace this file during execution.
# Recovery Anti-Pattern Audit From 20.1 Baseline

## Audit Basis
- Baseline: `3f7e9df`
- HEAD: `5e5e5f12`
- Rules source: `docs/dev/codex_rules.md`
- Evidence sources: `git log`, `git diff --stat`, `git diff --name-status`, targeted file inspection

## Findings (Ordered by Severity)

### High - Scope Expansion Beyond Recovery Lane
- Evidence:
  - `125` commits after baseline
  - `488` files changed
  - `35,818` insertions / `4,946` deletions
  - Cross-domain impact includes `docs`, `samples`, `tools`, `games`, `src`, and `tests`
- Why this is an anti-pattern:
  - Violates smallest-scoped recovery objective.
  - Introduces high uncertainty for root-cause recovery and validation.

### High - Start-of-Day Boundary Touched
- File:
  - `docs/dev/start_of_day/codex/PROJECT_INSTRUCTIONS.lnk` (`A` after baseline)
- Why this is an anti-pattern:
  - Recovery rules explicitly protect `start_of_day` content from unrelated edits.

### High - Broad Unrelated Deletion/Rename Churn
- Evidence:
  - `54` deletions and `8` renames in baseline diff.
  - Large deletion set under `samples/phase-20/*/index.html`.
  - Tool identity rename path:
    - `tools/3D Map Editor/*` to `tools/3D JSON Payload Normalizer/*`
- Why this is an anti-pattern:
  - Recovery lane is launch-path stabilization, not broad content pruning or feature renaming.

### High - Duplicate Source-of-Truth Vocabulary
- Evidence:
  - `samples/index.render.js` still consumes `toolHints`.
  - `games/index.render.js` consumes `toolsUsed`.
  - `tools/Workspace Manager/main.js` consumes `toolsUsed`.
- Why this is an anti-pattern:
  - Introduces dual metadata semantics for tool launch eligibility.
  - Increases risk of mismatch between games and samples launch routing.

### Medium - Launch Path Complexity Drift
- Evidence in UAT core files:
  - `games/index.render.js` expanded launch behavior and click routing logic.
  - `samples/index.render.js` expanded roundtrip link construction and launch/error handling.
  - `tools/Workspace Manager/main.js` includes extensive forwarded query handling and host-mode branching.
- Why this is an anti-pattern:
  - Recovery lane requires clarity and deterministic launch routing.
  - Complexity growth increases likelihood of hidden fallback behavior and regressions.

### Medium - Roadmap Surface Proliferation Outside Master Engine File
- Evidence:
  - Added `docs/dev/roadmaps/MASTER_ROADMAP_SAMPLES2TOOLS.md` after baseline.
  - Engine roadmap file is unchanged in this delta, but additional roadmap surface introduces governance drift.
- Why this is an anti-pattern:
  - Recovery efforts benefit from a single authoritative roadmap surface.

### Low - Diff Hygiene Issues
- Evidence from `git diff --check`:
  - New blank line at EOF in:
    - `docs/dev/reports/BUILD_PR_LEVEL_20_2_WORKSPACE_MANAGER_GAMES_TILE_UAT_RECOVERY_uat_report.md`
    - `docs/dev/reports/tool_launch_ssot_external_memory_reset_validation.md`
    - `samples/phase-12/1208/data/toolFormattedTileMap.js`
    - `tools/shared/toolLaunchSSoT.js`
- Why this matters:
  - Not functionally critical, but indicates review hygiene inconsistency.

## Anti-Pattern Summary
- Recovery lane contamination is substantial.
- UAT launch-path changes are not isolated.
- Multiple independent feature/doc/structure lanes were combined post-baseline.
- Overall profile strongly favors reset-first recovery over surgical edits on current HEAD.
