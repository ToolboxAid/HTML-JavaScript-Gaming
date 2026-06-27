# PR_26171_063 Codex Instruction Enforcement Hardening

## Purpose

Make Codex explicitly obey `docs_build/dev/PROJECT_INSTRUCTIONS.md` and `docs_build/dev/PROJECT_MULTI_PC.txt` before every PR.

## Scope

- Added a Codex instruction enforcement start gate to `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Added current authoritative PC/Laptop owner and PR parity rules to `docs_build/dev/PROJECT_MULTI_PC.txt`.
- Documented hard stops for branch state, clean status, owner mismatch, parity mismatch, wrong implementation paths, missing reports, missing ZIPs, skipped validation, and placeholder-only functional parity work.

## Requirement Checklist

- PASS: Codex must read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Codex must read `docs_build/dev/PROJECT_MULTI_PC.txt` before execution.
- PASS: Codex must report instruction compliance PASS/FAIL before changes.
- PASS: Codex must hard stop when not on `main` before starting.
- PASS: Codex must hard stop when the repo is not clean before starting.
- PASS: Codex must hard stop when PR owner does not match PC/Laptop ownership.
- PASS: Codex must hard stop when PR number parity does not match assigned machine.
- PASS: Codex must hard stop when required ZIP is missing.
- PASS: Codex must hard stop when required reports are missing.
- PASS: Codex must hard stop when implementation path is wrong.
- PASS: Codex must hard stop when scoped validation was skipped without reason.
- PASS: Codex must not continue with placeholder-only work when the PR asks for functional parity.
- PASS: Codex must not create wrong paths such as `tools/text2speech` when active path is `toolbox/text-to-speech`.
- PASS: Codex must not treat archived tools as "do not implement" when the PR says they are the functionality sample.

## Owner And Parity Evidence

- Current PR: `PR_26171_063-codex-instruction-enforcement-hardening`.
- Sequence: `063`.
- Sequence parity: odd.
- Assigned machine under the new authoritative gate: Laptop / Environment 2.
- Scope type: governance, recovery, diagnostics, and instruction-hardening.
- Result: PASS because governance/instruction-hardening PRs follow PR number parity unless Master Control explicitly assigns another owner.

## Validation Scope

- Playwright impacted: No.
- No Playwright impact. This PR is docs/workflow only.
- Validation is docs/static only.
- Runtime, tool, engine, samples, and Game Hub validation are skipped because no runtime, UI, toolState, engine, or sample behavior changed.

## ZIP

- Required ZIP path: `tmp/PR_26171_063-codex-instruction-enforcement-hardening_delta.zip`.
