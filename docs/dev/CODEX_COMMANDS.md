MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_18_13_TRACK_E_CSS_UI_NORMALIZATION_FOUNDATION` as a single-purpose, one-pass executable PR bundle.

Requirements:
- Advance Roadmap 18 Track E using the smallest testable UI/CSS normalization slice.
- Choose exactly one existing shared UI chrome cluster reused by more than one surface.
- Normalize only that cluster and its direct consumers.
- Flatten duplicated CSS layer usage inside that cluster.
- Enforce shared UI classes for that cluster.
- Remove redundant styles only where the normalized shared class path replaces them.
- No repo-wide CSS sweep.
- No visual redesign.
- No game-specific styling changes.
- No docs reorganization.
- Update `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md` with status-only progression only if execution-backed.
- Produce reports in `docs/dev/reports/` covering scope, touched files, validation, and roadmap status reasoning.
- Package the final repo-structured ZIP to:
  `<project folder>/tmp/BUILD_PR_LEVEL_18_13_TRACK_E_CSS_UI_NORMALIZATION_FOUNDATION.zip`

Validation minimums:
- affected UI surfaces load correctly
- no broken class references in touched files
- no duplicate redundant style block remains in the chosen cluster when replaced by shared class usage
- roadmap edits are status-only
