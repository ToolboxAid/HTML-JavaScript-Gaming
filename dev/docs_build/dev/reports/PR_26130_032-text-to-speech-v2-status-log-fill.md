# PR_26130_032-text-to-speech-v2-status-log-fill

## Summary
- Updated Text to Speech V2 CSS so `#text2speech-V2StatusLog` fills the available height of `#text2speech-V2StatusLogContent`.
- Kept status log overflow internal to the textarea and prevented the status content container from leaving unused vertical space.
- Preserved existing Status accordion controls and did not change schema, payload, or Workspace Manager contracts.
- Added Playwright coverage for status log fill height, internal scrolling under many entries, and no page-level overflow regression.

## Scope Notes
- Text to Speech V2 runtime change is CSS-only.
- No JavaScript runtime files changed.
- No schemas, payload defaults, samples, or workspace contracts changed.
- No `start_of_day` files changed.

## Playwright Impacted
Yes.

Validated behavior:
- `#text2speech-V2StatusLog` fills `#text2speech-V2StatusLogContent`.
- Many status entries scroll inside the status log textarea.
- Adding many status entries does not create page-level overflow when the page otherwise fits.

Expected pass behavior:
- Text to Speech V2 keeps the Status accordion controls working.
- The status log uses the available panel height and scrolls internally.
- `npm run test:workspace-v2` passes.

Expected fail behavior:
- Leaving unused vertical space below the status log fails layout assertions.
- Regressing internal status log scrolling fails the scroll assertions.
- Letting status log content grow the page fails the page overflow assertion.

## Validation
- PASS: `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "shows safe empty Text to Speech V2 state"` -> 1 passed.
- PASS: `npm run test:workspace-v2` -> 37 passed.
- PASS: `git diff --check` -> no whitespace errors; CRLF conversion warnings only.

## Full Samples Smoke Test
Skipped. This PR is limited to Text to Speech V2 status log CSS/layout and targeted Workspace V2 Playwright coverage is the required validation gate.

## Manual Validation
1. Open Text to Speech V2.
2. Confirm the Status log fills its accordion content area.
3. Trigger enough status messages to exceed the visible log area and confirm only the log scrolls internally.
4. Confirm the page itself does not gain a scrollbar solely because the Status log has many entries.

## Review Artifacts
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `tmp/PR_26130_032-text-to-speech-v2-status-log-fill_delta.zip`
