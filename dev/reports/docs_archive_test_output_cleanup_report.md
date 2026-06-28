# PR_26154_038 Docs Archive Test Output Cleanup

Baseline used: `PR_26154_037-archive-v1-v2-reference-material`.

## Docs Archive Cleanup

- Confirmed `assets/theme/` is gone and did not recreate it.
- Consolidated `docs_build/archive/` into `archive/v1-v2/docs_build/archive/`.
- Moved old PR-era `docs_build/pr/PR_10_*` and `docs_build/pr/PR_11_*` files and folders into `archive/v1-v2/docs_build/pr/`.
- Moved `docs_build/design/tools/*` into `archive/v1-v2/tool-design-reference/` for future toolbox rebuild reference.
- Updated current `docs_build/` references to the new archive paths.

## Moved Content

| Source | Destination | Count |
| --- | --- | ---: |
| `docs_build/archive/` | `archive/v1-v2/docs_build/archive/` | 491 files |
| `docs_build/pr/PR_10_*`, `docs_build/pr/PR_11_*` | `archive/v1-v2/docs_build/pr/` | 138 top-level entries, 206 files |
| `docs_build/design/tools/*` | `archive/v1-v2/tool-design-reference/` | 17 files |

Post-move checks:

- `docs_build/archive/`: removed.
- `docs_build/design/tools/`: removed.
- `docs_build/pr/PR_10_*`: zero remaining entries.
- `docs_build/pr/PR_11_*`: zero remaining entries.
- Current `docs_build/` stale reference scan found zero old-path forms outside audit reports and handoff files.

## Test Output Cleanup

- Updated `playwright.config.cjs` to write Playwright output to `tmp/test-results/`.
- Moved existing generated `tests/results/` content into `tmp/test-results/`.
- Removed the generated `tests/results/` folder after moving its content.
- Updated `.gitignore` to explicitly ignore `tmp/test-results/`.
- Kept `tests/results/` ignored as a defensive legacy output guard.
- Confirmed `node_modules/` remains ignored by git and was not moved.
- Did not move root `package.json`.
- Did not modify `dev/scripts/untracked/`.

Existing generated output moved:

| From | To | Files |
| --- | --- | ---: |
| `tests/results/` | `tmp/test-results/` | 24 |

NPM cache/output note:

- `node_modules/` should stay at repository root.
- The repo already ignores `.npm-cache`.
- NPM cache can be redirected per command with an environment variable such as `npm_config_cache=tmp/npm-cache`, but this PR does not force that setting to avoid changing install behavior.

## Validation

- PASS: `assets/theme/` does not exist.
- PASS: `docs_build/archive/` does not exist.
- PASS: `docs_build/design/tools/` does not exist.
- PASS: no `PR_10_*` or `PR_11_*` entries remain under `docs_build/pr/`.
- PASS: `archive/v1-v2/docs_build/archive/`, `archive/v1-v2/docs_build/pr/`, and `archive/v1-v2/tool-design-reference/` exist with the moved content.
- PASS: `tests/results/` no longer exists.
- PASS: `tmp/test-results/` exists locally and is ignored by git.
- PASS: `node_modules/` is ignored by git.
- PASS: static validation ran for changed HTML, JS, CSS, JSON, Markdown, and config files.
- PASS: `npm run test:workspace-v2` ran because test output configuration changed.
- PASS: `git diff --check`.
- PASS: repo-structured delta ZIP created at `tmp/PR_26154_038-docs-archive-test-output-cleanup_delta.zip`.
- SKIPPED tests against `archive/v1-v2/`.
- SKIPPED full samples smoke test.
