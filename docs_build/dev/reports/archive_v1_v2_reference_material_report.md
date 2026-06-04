# PR_26154_037 Archive V1/V2 Reference Material

## Scope

Created `archive/v1-v2/` as the owner for deprecated V1/V2 reference material.

Moved:

| From | To | Files |
| --- | --- | ---: |
| `old-tools/` | `archive/v1-v2/tools/` | 363 |
| `old_games/` | `archive/v1-v2/games/` | 311 |
| `old_samples/` | `archive/v1-v2/samples/` | 1,580 |

No legacy reference material was deleted.

## Documentation Updates

- Updated `docs_build/` references from `old-tools` to `archive/v1-v2/tools`.
- Updated `docs_build/` references from `old_games` to `archive/v1-v2/games`.
- Updated `docs_build/` references from `old_samples` to `archive/v1-v2/samples`.
- Added archive ownership governance to `docs_build/dev/PROJECT_INSTRUCTIONS.md`.

The docs rewrite changed 66 `docs_build/` files. Outside this PR's new report and handoff files, remaining `docs_build/` matches for `old_samples` are historical filename references to `old_samples.js`, not root folder references.

## Navigation And Runtime Boundaries

- Active app navigation was not updated to point into `archive/v1-v2/`.
- Shared header/footer/toolbox index checks found no `archive/v1-v2/` links.
- Active runtime/tool/test files outside `docs_build/` still contain old-path strings in 42 files with 412 total matches. These are concentrated in scripts, tests, toolbox legacy bridge files, and engine/shared path helpers.
- Those non-doc references were reported instead of rewritten because this PR does not authorize active app navigation changes, engine core behavior changes, or archive validation rerouting.

## Reference Checks

- PASS: `old-tools/`, `old_games/`, and `old_samples/` no longer exist at repository root.
- PASS: `archive/v1-v2/tools/`, `archive/v1-v2/games/`, and `archive/v1-v2/samples/` exist.
- PASS: archive file counts match the source counts captured before the move.
- PASS: `docs_build/` folder references were rewritten to `archive/v1-v2/`.
- WARN: non-doc active and ambiguous code/test references to old root paths remain and are listed in `root_tree_cleanup_review_report.md`.
- PASS: `tmp/` was not moved or included in the archive relocation.

## Validation

- Ran targeted reference checks for `old-tools`, `old_games`, `old_samples`, `archive/v1-v2`, and `tmp`.
- Ran static validation for changed Markdown, JSON, HTML, JS, and CSS paths.
- Ran `git diff --check`.
- Did not run tests against `archive/v1-v2/`.
- Did not run the full samples smoke test.
- Did not run `npm run test:workspace-v2` because active toolbox navigation did not change.
