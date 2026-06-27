# PR_26172_CHARLIE_008 Canonical Structure Guardrail Script

## Purpose

Add repository guardrail validation for:

- JS structure
- CSS structure
- Test structure

The guardrail reports violations only. It does not move, delete, or rewrite repository files.

## Scope

| File | Change |
| --- | --- |
| `scripts/validate-canonical-repository-structure.mjs` | Added reusable/CLI guardrail for canonical JS, CSS, and test path checks. |
| `tests/regression/CanonicalRepositoryStructureGuardrail.test.mjs` | Added targeted regression test for clean paths, approved legacy exceptions, and failing violation fixtures. |
| `docs_build/dev/reports/PR_26172_CHARLIE_008-canonical-structure-guardrail-script.md` | Added this PR report. |
| `docs_build/dev/reports/codex_review.diff` | Refreshed Codex review diff. |
| `docs_build/dev/reports/codex_changed_files.txt` | Refreshed changed-file list. |

## Guardrail Behavior

The new script:

- checks tracked repository paths by default with `git ls-files`;
- falls back to filesystem walking when Git tracked-file discovery is unavailable;
- reports unapproved JS structure violations;
- reports unapproved CSS structure violations;
- reports unapproved test structure violations;
- treats documented current repository debt as approved legacy exceptions;
- exits nonzero only for unapproved violations;
- writes an optional Markdown report when `--report <path>` is supplied;
- makes no repository changes unless an explicit report path is provided.

## Approved Legacy Exceptions

The guardrail intentionally does not fail the current repository for already documented debt from PR_001 and PR_005:

- known toolbox JS sidecars awaiting canonical migration;
- `src/engine/paletteList.js`;
- `src/engine/ui/*.css`;
- existing non-canonical legacy test buckets;
- Theme V2 vendored font CSS under `assets/theme-v2/fonts/`;
- top-level legacy test support files such as `tests/index.html`.

Generated files under `tests/results/` remain blocking violations if tracked.

## Validation

| Validation | Status | Result |
| --- | --- | --- |
| `node --check scripts/validate-canonical-repository-structure.mjs` | PASS | Script syntax is valid. |
| `node --test tests/regression/CanonicalRepositoryStructureGuardrail.test.mjs` | PASS | Clean/legacy case passed; unapproved violation fixture failed as expected. |
| `node scripts/validate-canonical-repository-structure.mjs` | PASS | Current repository produced 0 blocking violations and 498 approved legacy exceptions. |
| `git diff --check` | PASS | No whitespace errors. |
| ZIP artifact exists | PASS | `tmp/PR_26172_CHARLIE_008-canonical-structure-guardrail-script_delta.zip` generated. |

## Violation Fixture Result

The targeted test confirms the guardrail fails these unapproved fixture paths:

- `toolbox/new-tool/new-tool.js`
- `toolbox/new-tool/new-tool.css`
- `assets/toolbox/new-tool/js/view.js`
- `src/engine/rootRuntime.js`
- `src/engine/ui/newPanel.css`
- `tests/results/generated-result.json`
- `tests/new-lane/NewLane.test.mjs`

## Branch Validation

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch | PASS | `PR_26172_CHARLIE_repository-compliance-stack`. |
| Worktree clean before PR_008 edits | PASS | PR_007 was committed and pushed before PR_008 edits began. |
| Local/origin sync before PR_008 edits | PASS | `0 0` after PR_007 push. |
| Main merge avoided | PASS | No merge to `main` was performed. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Add script under `scripts/` | PASS | `scripts/validate-canonical-repository-structure.mjs`. |
| Validate JS structure | PASS | Script checks toolbox JS sidecars, asset JS placement, and root engine JS. |
| Validate CSS structure | PASS | Script checks toolbox CSS, asset CSS placement, and engine CSS placement. |
| Validate test structure | PASS | Script checks test paths against canonical roots and approved legacy buckets. |
| Report violations only | PASS | Script reports findings and exits; it does not modify source paths. |
| Respect approved legacy exceptions | PASS | Known PR_001/PR_005 debt is listed as `LEGACY` instead of blocking. |
| Add targeted validation test | PASS | `tests/regression/CanonicalRepositoryStructureGuardrail.test.mjs`. |
| Targeted guardrail test passes | PASS | Node test passed. |
| Violation fixture fails | PASS | Node test asserted `FAIL` for unapproved fixture paths. |
| No runtime source changes | PASS | No application runtime files were modified. |

## Manual Validation Notes

- This PR introduces a guardrail foundation, not a full cleanup.
- The guardrail is intentionally compatible with the current repository by distinguishing approved legacy exceptions from new unapproved violations.
- The optional `--report` flag is available for future CI/preflight reporting without requiring this PR to commit generated guardrail output.
- PR_009 should wire the script into targeted repository validation without running full samples smoke.
