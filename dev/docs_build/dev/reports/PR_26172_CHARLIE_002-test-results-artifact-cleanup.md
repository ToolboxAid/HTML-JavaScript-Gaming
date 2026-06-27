# PR_26172_CHARLIE_002 Test Results Artifact Cleanup

## Scope

Clean up generated test result artifacts under `tests/results/` after the Charlie repository compliance audit identified that path as a high-priority cleanup candidate.

Source audit:

- `docs_build/dev/reports/PR_26172_CHARLIE_001-repository-compliance-audit.md`

This PR does not modify runtime source and does not move unrelated tests.

## Team Ownership

- TEAM token: CHARLIE
- Ownership classification: governance / repository hygiene / diagnostics
- TEAM ownership result: PASS

## Branch Validation

| Requirement | Status | Evidence |
| --- | --- | --- |
| Started from latest main | PASS | `main` was pulled before branch creation; source commit `f2b50ac9d79256df3a7716ac4eff21f3a4303bb3`. |
| Worktree clean before branch | PASS | `git status --short` returned no output before branch creation. |
| Local/origin sync before branch | PASS | `git rev-list --left-right --count HEAD...origin/main` returned `0 0`. |
| PR branch created from main | PASS | Branch `pr/26172-CHARLIE-002-test-results-artifact-cleanup` was created from latest `main`. |

## Files Reviewed

`git ls-files tests/results` returned no tracked files.

The local ignored `tests/results/` folder contained generated Playwright/report output:

- `tests/results/artifacts/.last-run.json`
- `tests/results/artifacts/tools-MidiStudioV2-MIDI-St-3c5a9-multi-song-manifest-payload-playwright/trace.zip`
- `tests/results/artifacts/tools-MidiStudioV2-MIDI-St-752e4-on-and-timeline-scroll-sync-playwright/trace.zip`
- `tests/results/artifacts/tools-MidiStudioV2-MIDI-St-c50c5-m-Tool-Mode-standalone-save-playwright/trace.zip`
- `tests/results/playwright-results.json`
- `tests/results/report/data/09daf0cfe8750af5e9e5bb22161367f97296f4fd.zip`
- `tests/results/report/data/a9ba8bc1c6a629055b981a6f385fa4de3e42a79d.zip`
- `tests/results/report/data/b1dc1da730cbd5e9adc334a6f385fa4de3e42a79d.zip`
- `tests/results/report/data/c150573559f5367f4ec5724abb7a55798abcdff9.zip`
- `tests/results/report/index.html`
- `tests/results/report/trace/assets/codeMirrorModule-DS0FLvoc.js`
- `tests/results/report/trace/assets/defaultSettingsView-GTWI-W_B.js`
- `tests/results/report/trace/codeMirrorModule.DYBRYzYX.css`
- `tests/results/report/trace/codicon.DCmgc-ay.ttf`
- `tests/results/report/trace/defaultSettingsView.B4dS75f0.css`
- `tests/results/report/trace/index.C5466mMT.js`
- `tests/results/report/trace/index.CzXZzn5A.css`
- `tests/results/report/trace/index.html`
- `tests/results/report/trace/manifest.webmanifest`
- `tests/results/report/trace/playwright-logo.svg`
- `tests/results/report/trace/snapshot.html`
- `tests/results/report/trace/sw.bundle.js`
- `tests/results/report/trace/uiMode.Btcz36p_.css`
- `tests/results/report/trace/uiMode.Vipi55dB.js`
- `tests/results/report/trace/uiMode.html`
- `tests/results/report/trace/xtermModule.DYP7pi_n.css`

## Files Removed Or Retained

| Category | Status | Notes |
| --- | --- | --- |
| Tracked files under `tests/results/` | None removed | No tracked files existed under `tests/results/`. |
| Local ignored generated artifacts under `tests/results/` | Removed from workspace | Removed only after verifying the resolved target path was inside the repository. |
| Active test source | Retained | No active test source was found under `tests/results/`. |
| Fixture or baseline data | Retained | No committed fixture or baseline dependency was found under `tests/results/`. |

## Reference And Dependency Check

| Check | Status | Evidence |
| --- | --- | --- |
| Active tracked files under `tests/results/` | PASS | `git ls-files tests/results` returned no output. |
| Tracked ignored files under `tests/results/` | PASS | `git ls-files -c -i --exclude-standard tests/results` returned no output. |
| Ignored local generated files under `tests/results/` | PASS | `git ls-files -o -i --exclude-standard tests/results` listed only Playwright/report artifacts. |
| Active config uses `tmp/test-results/` | PASS | `playwright.config.cjs` writes output, artifacts, HTML report, and JSON report under `tmp/test-results/`. |
| Active references to `tests/results/` | PASS | Active config/test/docs search returned no required source or fixture dependency. |
| Historical references retained | PASS | References in `archive/` and historical `docs_build/dev/reports/` were not modified. |

## Ignore Rule Changes

Updated `.gitignore` to make generated test-output protection explicit:

- Kept `tests/results/`.
- Added `tests/results/**`.
- Kept `tmp/test-results/`.
- Added `tmp/test-results/**`.
- Confirmed `tmp/` remains ignored.

Ignore probe:

- `git check-ignore -v tests/results/probe.txt` resolves to `.gitignore`.
- `git check-ignore -v tmp/test-results/probe.txt` resolves to `.gitignore`.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Confirm Project Instructions were reviewed | PASS | Read `docs_build/dev/ProjectInstructions/README.txt`, `PROJECT_INSTRUCTIONS.md`, branch/workflow governance, team ownership, and artifact/reporting rules. |
| Use PR_26172_CHARLIE_001 findings | PASS | This cleanup is based on the P0 `tests/results/` finding. |
| Review `tests/results/` | PASS | Reviewed tracked, ignored, and local generated contents. |
| Confirm generated artifacts, not active source | PASS | Files were Playwright JSON, HTML report, trace assets, and zipped trace/report data. |
| Search references to `tests/results/` files | PASS | No active source/fixture dependency found; historical references retained. |
| Remove tracked generated artifacts if safe | PASS | No tracked generated artifacts existed to remove. |
| Add/update ignore rules | PASS | `.gitignore` now explicitly includes `tests/results/**` and `tmp/test-results/**`. |
| Do not remove active test source | PASS | No active test source removed. |
| Do not modify runtime source | PASS | No runtime source changed. |
| Do not move unrelated tests | PASS | No test files were moved. |
| Stop gate not triggered | PASS | No `tests/results/` file was required as active source, fixture data, or committed baseline data. |
| Create required reports | PASS | `docs_build/dev/reports/codex_review.diff` and `docs_build/dev/reports/codex_changed_files.txt` exist. |
| Create ZIP artifact | PASS | `tmp/PR_26172_CHARLIE_002-test-results-artifact-cleanup_delta.zip` exists. |

## Validation Lane Report

- `git diff --check`: PASS.
- Cleanup limited to generated artifacts under `tests/results/`: PASS.
- Ignore rule prevents recommit: PASS.
- Runtime source files changed: PASS, no runtime source files changed.
- Required reports exist: PASS.
- ZIP artifact exists: PASS.
- Playwright: SKIP, ignore/report-only cleanup with no active test or runtime source changes.
- Samples: SKIP, no sample files changed.

## Manual Validation Notes

- The local ignored `tests/results/` directory was deleted from the workspace only after path verification showed it was inside the repository root.
- Repository history already contains `docs_build/dev/reports/docs_archive_test_output_cleanup_report.md`, which documents the prior migration of generated test output from `tests/results/` to `tmp/test-results/`.
- This PR preserves historical report/archive references and only hardens the active ignore rule.
