# PR_26130_023-text-to-speech-v2-layout-height-fix

## Purpose

Fix Text to Speech V2 layout height behavior only.

## Changes

- Removed normal-mode accordion fill behavior that created large empty space in Text to Speak and Named Sentences.
- Added Text to Speech V2-specific layout classes for Output Summary and Status so fullscreen mode can constrain each panel independently.
- Updated fullscreen sizing so left, center, and right columns fit inside the viewport height.
- Constrained Output Summary and Status to scroll within their own panels so Status remains visible.
- Kept Speak, Pause, Resume, and Stop at the bottom of Text to Speak.

## Files Changed

- `tools/text2speach-V2/index.html`
- `tools/text2speach-V2/styles/text2speach-V2.css`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`

## Validation

Playwright impacted: Yes.

Command run:

```powershell
npm run test:workspace-v2
```

Result: PASS, 33 tests passed.

Additional checks:

```powershell
npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "loads Text to Speech V2 from URL"
git diff --check
```

Result: focused Playwright test passed. `git diff --check` passed with line-ending normalization warnings only.

## Playwright Coverage

- Non-fullscreen Text to Speak content no longer has a large empty spacer.
- Non-fullscreen Named Sentences content no longer has large unused bottom space.
- Fullscreen Text to Speak remains visible and does not collapse.
- Fullscreen center Named Sentences remains visible inside the center column.
- Fullscreen Output Summary stays within the right column and does not push Status offscreen.
- Fullscreen Status remains visible and scrolls internally.

Expected pass behavior: all layout assertions pass in the Text to Speech V2 URL JSON workflow.

Expected fail behavior: tests fail if normal mode reintroduces excess spacer height, if fullscreen columns exceed viewport height, or if Status is pushed out of the right panel.

## Manual Validation

1. Open Text to Speech V2 with sample 1903 loaded.
2. Confirm Text to Speak wraps tightly around the textarea and speech buttons.
3. Confirm Named Sentences has no large empty area below tiles.
4. Click Hide Header and Details.
5. Confirm the left, center, and right panels fit in the viewport; Text to Speak remains visible; Output Summary and Status scroll within their own panels.

## Full Samples Smoke Test

Skipped. The BUILD request explicitly said not to run the full samples smoke test, and this PR is scoped to Text to Speech V2 layout height behavior only.

## Scope Notes

- No schema changes.
- No runtime JavaScript changes.
- No unrelated files.
- No `start_of_day` changes.
