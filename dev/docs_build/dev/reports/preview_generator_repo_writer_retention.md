# Preview Generator V2 Repo Writer Retention

## Scope
- Added a `Copy` button to the Preview Generator V2 Status header, positioned to the left of `Clear`.
- Copy reads the full current Preview Generator V2 status log and logs an `OK`, `WARN`, or `FAIL` result.
- Kept integration through session storage only.
- No direct cross-tool communication was added.

## Repo Writer Retention
- Preview Generator V2 continues to rehydrate repo context from:
  - `workspace.repo.reference`
  - `workspace.tools.preview-generator-v2`
- Workspace launch no longer blocks generation when Asset Manager V2 session data no longer contains a preview-role asset entry.
- If the preview asset entry is missing, Preview Generator V2 now falls back to the generated target:
  - `games/<game>/assets/images/preview.svg`
- Valid repo sessions keep `Repo selected` populated instead of showing `not selected`.
- Missing or invalid repo session data still logs a visible `FAIL` and keeps generation disabled.

## Skip And Write Verification
- Force rewrite behavior and verified-write logging are preserved.
- With Force rewrite disabled, Preview Generator V2 now checks the live target file handle for `preview.svg`.
- `CHK` logs the full absolute path being checked.
- If the checked file is missing, the log includes `MISSING` and generation proceeds.
- If the checked file exists but cannot be verified, generation proceeds instead of using a stale skip.
- `OK WRITE` and `Written` counts are still emitted only after write verification succeeds.

## Guardrails
- No hidden fallback output paths were added.
- No sample JSON was modified.
- No roadmap content was modified.
- No schema/runtime contracts were modified.

## Skipped
- Full samples smoke test was skipped by request. The targeted Workspace V2 coverage exercises the Asset Manager return flow, missing preview target behavior, status copy behavior, and verified write path.
