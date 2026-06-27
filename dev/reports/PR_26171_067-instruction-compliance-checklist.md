# PR_26171_067 Instruction Compliance Checklist

## Required Reads

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- PASS: Read `docs_build/dev/PROJECT_MULTI_PC.txt` before implementation.
- PASS: Read repository `AGENTS.md` instructions from the active workspace context.
- PASS: Read relevant target files before editing.

## Gate Checks

- PASS: Started from `main`.
- PASS: Pulled latest `origin/main`.
- PASS: Repo was clean before branch creation.
- PASS: Created scoped branch `pr/26171-067-tts-profile-emotion-table-foundation`.
- PASS: PR number `067` is odd and assigned to Laptop / Environment 2.
- PASS: TTS Studio is within Laptop ownership.
- PASS: Active path is `toolbox/text-to-speech/`.
- PASS: No wrong `tools/text2speech/` path was created.
- PASS: No database changes were made.
- PASS: No placeholder-only provider blocking behavior was introduced.

## Required Artifacts

- PASS: PR-specific report created.
- PASS: Parent-child table checklist created.
- PASS: Message/TTS contract checklist created.
- PASS: Validation report created.
- PASS: Manual validation notes created.
- PASS: `codex_review.diff` and `codex_changed_files.txt` will be generated from the final scoped diff.
- PASS: Repo-structured delta ZIP will be created under `tmp/`.
