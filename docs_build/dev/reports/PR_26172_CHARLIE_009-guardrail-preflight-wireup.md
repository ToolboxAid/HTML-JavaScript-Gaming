# PR_26172_CHARLIE_009 Guardrail Preflight Wireup

## Purpose

Wire canonical repository structure guardrail validation into targeted repository validation.

## Scope

| File | Change |
| --- | --- |
| `package.json` | Added `validate:canonical-structure` npm script. |
| `docs_build/dev/reports/PR_26172_CHARLIE_009-guardrail-preflight-wireup.md` | Added this PR report. |
| `docs_build/dev/reports/codex_review.diff` | Refreshed Codex review diff. |
| `docs_build/dev/reports/codex_changed_files.txt` | Refreshed changed-file list. |

## Wireup

Added targeted validation command:

```text
npm run validate:canonical-structure
```

Script target:

```text
node ./scripts/validate-canonical-repository-structure.mjs
```

This provides a direct preflight entry point for the PR_008 guardrail without invoking full smoke tests, samples, or broad Playwright lanes.

## Validation

| Validation | Status | Result |
| --- | --- | --- |
| `npm run validate:canonical-structure` | PASS | Guardrail ran and reported 0 blocking violations with 498 approved legacy exceptions. |
| `git diff --check` | PASS | No whitespace errors. |
| Full smoke tests | SKIP | Out of scope; this PR only wires a targeted validation command. |
| Samples | SKIP | Out of scope; no sample files or sample loaders changed. |
| ZIP artifact exists | PASS | `tmp/PR_26172_CHARLIE_009-guardrail-preflight-wireup_delta.zip` generated. |

## Branch Validation

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch | PASS | `PR_26172_CHARLIE_repository-compliance-stack`. |
| Worktree clean before PR_009 edits | PASS | PR_008 was committed and pushed before PR_009 edits began. |
| Local/origin sync before PR_009 edits | PASS | `0 0` after PR_008 push. |
| Main merge avoided | PASS | No merge to `main` was performed. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Wire guardrail into targeted repository validation | PASS | Added `validate:canonical-structure`. |
| Add npm script if appropriate | PASS | Added one focused npm script. |
| No full smoke tests | PASS | Full smoke was not run. |
| No runtime source changes | PASS | Only `package.json` and report artifacts changed. |
| Guardrail runs | PASS | `npm run validate:canonical-structure` passed. |
| ZIP exists | PASS | ZIP artifact generated under `tmp/`. |

## Manual Validation Notes

- The npm script is intentionally separate from broad `test` and Playwright lane commands.
- Future OWNER/Charlie governance can decide whether to include this command in a larger preflight chain.
- No runtime source files were modified.
