# Preview Generator V2 Real Root Path

## Scope
- Updated Preview Generator V2 output path resolution so logged absolute paths are built from the selected repo root plus the resolved relative output path.
- Workspace launch hydration now preserves the actual repo root path from `workspace.repo.reference`.
- Execution logs the selected repo root before batch processing.
- Each successful write logs:
  - resolved relative output path
  - repo root path
  - full absolute output path
  - source resolution context

## Verification Behavior
- If the repo root path is unavailable, Preview Generator V2 logs `FAIL Repo root path resolution` and does not claim `OK WRITE`.
- Write success is counted only after `writePreview` returns a verified successful write result.
- When file read-back is available, the written `preview.svg` is read back and compared to the generated SVG before `OK WRITE` is logged.
- Force rewrite logs verification only after the replacement write passes read-back verification.
- Verification failures log `FAIL` with the expected full absolute output path and do not increment `Written`.

## Pong Target
- Force rewrite validation covers Pong.
- Expected repo root:
  - `C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming`
- Expected full absolute output path:
  - `C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\games\Pong\assets\images\preview.svg`
- The resolved relative output path remains:
  - `games/Pong/assets/images/preview.svg`

## Guardrails
- No hidden fallback output paths were added.
- No sample JSON was modified.
- No roadmap content was modified.
- Source resolution context logging was preserved.

## Skipped
- Full samples smoke test was skipped by request. The changed surface is Preview Generator V2 path logging and write verification, covered by the targeted Pong generation path plus the full Workspace V2 Playwright suite.
