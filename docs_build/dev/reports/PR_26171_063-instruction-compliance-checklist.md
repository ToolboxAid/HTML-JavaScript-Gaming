# PR_26171_063 Instruction Compliance Checklist

## Pre-Change Gate

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before file changes.
- PASS: Read `docs_build/dev/PROJECT_MULTI_PC.txt` before file changes.
- PASS: Reported instruction compliance PASS/FAIL before file changes.
- PASS: Starting branch was `main`.
- PASS: Starting repository status was clean.
- PASS: Created scoped branch `pr/26171-063-codex-instruction-enforcement-hardening` after the clean `main` check.

## Current PR Routing

- PASS: PR number `063` is odd.
- PASS: Odd PR parity maps to Laptop / Environment 2 under the new authoritative Multi-PC gate.
- PASS: PR scope is instruction/governance hardening and follows parity because no Master Control owner override was provided.
- PASS: No PC-owned tool implementation was changed.
- PASS: No Laptop-owned tool implementation was changed.

## Path And Functional Parity Gate

- PASS: No implementation path was changed by this docs-only PR.
- PASS: `toolbox/text-to-speech/` is documented as the active Text To Speech path.
- PASS: `tools/text2speech/` is documented as a wrong new-work path.
- PASS: Placeholder-only functional parity work is prohibited.
- PASS: Archived functionality samples are documented as read-only reference samples when explicitly named by a PR.

## Completion Gate

- PASS: Required PR-specific report exists.
- PASS: Required instruction compliance checklist exists.
- PASS: Required manual validation notes exist.
- PASS: Required `docs_build/dev/reports/codex_review.diff` exists after artifact generation.
- PASS: Required `docs_build/dev/reports/codex_changed_files.txt` exists after artifact generation.
- PASS: Required ZIP exists after packaging.
- PASS: Scoped validation was not skipped; docs/static validation was run.
- PASS: Playwright was not run because the PR explicitly requires no Playwright.
